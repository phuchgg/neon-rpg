import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Progress from 'react-native-progress';
import { Quest } from '../utils/type';
import { useTheme } from '../contexts/ThemeContext';
import { generateUniqueQuests } from '../utils/QuestGenerator';
import { useRef } from 'react';
import { syncToFirestore } from '../utils/syncToFirestore';



const questTypes = ['Hàng ngày', 'Hàng tuần', 'Sự kiện'] as const;
type QuestType = typeof questTypes[number];

export default function QuestJournalTabs() {
  const [activeTab, setActiveTab] = useState<QuestType>('Daily');
  const [quests, setQuests] = useState<Quest[]>([]);
  const { theme } = useTheme();
  const [timerTick, setTimerTick] = useState(Date.now());
  const questsRef = useRef(quests);

useEffect(() => {
  questsRef.current = quests;
}, [quests]);

  useEffect(() => {
    loadQuests(activeTab);
  }, [activeTab]);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimerTick(Date.now());
    }, 1000); // ✅ Tick every second now
    return () => clearInterval(interval);
  }, []);


  useEffect(() => {
  const checkAndLogCompletion = async () => {
    const currentQuests = questsRef.current;
    const key = `quests_${activeTab}`;
    let updated = [...currentQuests];
    let changed = false;

    const activity = JSON.parse(await AsyncStorage.getItem('activityHistory') || '[]');

    updated = updated.map((q) => {
      const justCompleted = !q.isComplete && q.progress >= 100 && !q.isFailed;

      if (justCompleted) {
        changed = true;

        activity.push({
          date: new Date().toISOString(),
          type: 'quest',
          description: `✅ Hoành thành nhiệm vụ ${activeTab.toLowerCase()}: ${q.title}`,
          details: {
            questId: q.id,
            reward: q.rewardXp,
            type: activeTab,
          },
        });

        return {
          ...q,
          isComplete: true,
          progress: 100,
          condition: {
            ...q.condition,
            current: q.condition.target,
          },
        };
      }

      // ❌ Time's up
      if (q.timeLimit && q.startTime && !q.isComplete && !q.isFailed) {
        const expired = Date.now() - q.startTime > q.timeLimit;
        if (expired) {
          changed = true;
          return { ...q, isFailed: true };
        }
      }

      return q;
    });

    if (changed) {
      await AsyncStorage.setItem(key, JSON.stringify(updated));
      await AsyncStorage.setItem('activityHistory', JSON.stringify(activity));
      await syncToFirestore();
      setQuests(updated);
    }
  };

  checkAndLogCompletion();
}, [timerTick]);





  const loadQuests = async (type: QuestType) => {
    const key = `quests_${type}`;
    const historyKey = `quests_history_${type}`;
    const resetKey = `lastReset_${type}`;

    const stored = await AsyncStorage.getItem(key);
    const historyStored = await AsyncStorage.getItem(historyKey);
    const lastResetStr = await AsyncStorage.getItem(resetKey);

    const historyIds = historyStored ? JSON.parse(historyStored) : [];
    const lastReset = lastResetStr ? new Date(lastResetStr) : null;
    const now = new Date();

    // 🕒 Cooldown logic
    const shouldReset =
      !lastReset ||
      (type === 'Daily' && now.toDateString() !== lastReset.toDateString()) ||
      (type === 'Weekly' &&
        now.getDay() === 1 && // Monday reset
        now.toDateString() !== lastReset.toDateString());

    if (shouldReset || !stored) {
      const newQuests = generateUniqueQuests(type, historyIds);

      await AsyncStorage.setItem(key, JSON.stringify(newQuests));
      await AsyncStorage.setItem(resetKey, now.toISOString());

      // Update history to avoid duplicates
      const updatedHistory = [
        ...historyIds,
        ...newQuests.map((q) => q.id.split('_')[0]),
      ].slice(-10); // Keep last 10 unique

      await AsyncStorage.setItem(historyKey, JSON.stringify(updatedHistory));

      setQuests(newQuests);
    } else {
      setQuests(JSON.parse(stored));
    }
  };



  const completeQuestWithLog = async (questId: string) => {
  const updated = quests.map((q) =>
    q.id === questId
      ? {
          ...q,
          isComplete: true,
          progress: 100,
          condition: { ...q.condition, current: q.condition.target },
        }
      : q
  );

  const key = `quests_${activeTab}`;
  await AsyncStorage.setItem(key, JSON.stringify(updated));
  setQuests(updated);

  const quest = updated.find((q) => q.id === questId);
  if (quest) {
    const xpStored = await AsyncStorage.getItem('xp');
    const xp = parseInt(xpStored ?? '0') + quest.rewardXp;
    await AsyncStorage.setItem('xp', xp.toString());

    const activity = JSON.parse(await AsyncStorage.getItem('activityHistory') || '[]');
    activity.push({
      date: new Date().toISOString(),
      type: 'quest',
      description: `Completed ${activeTab.toLowerCase()} quest: ${quest.title}`,
      details: {
        questId: quest.id,
        reward: quest.rewardXp,
        type: activeTab,
      },
    });
    await AsyncStorage.setItem('activityHistory', JSON.stringify(activity));
  }
};




  const renderQuest = ({ item }: { item: Quest }) => (
  <View style={[styles.card, { backgroundColor: theme.background, borderColor: `${theme.accent}44` }]}>
    <Text style={[styles.title, { color: theme.accent }]}>{item.title}</Text>
    <Text style={[styles.desc, { color: theme.text }]}>{item.description}</Text>
    <Progress.Bar
      progress={item.progress / 100}
      width={null}
      height={12}
      borderRadius={10}
      color={theme.accent}
      unfilledColor="#333"
      borderWidth={0}
      style={{ marginVertical: 10 }}
    />
    <Text style={[styles.progressLabel, { color: theme.text }]}>
      {item.condition.current} / {item.condition.target} • 🎁 {item.rewardXp} XP
    </Text>

    {/* 🎉 Claim or Status */}
    {item.isComplete ? (
      <Text style={[styles.complete, { color: theme.text }]}>✅ Đã hoàn thành</Text>
    ) : item.isFailed ? (
      <Text style={[styles.complete, { color: '#ff5555' }]}>❌ Thất bại (hết thời gian)</Text>
    ) : null}

    {/* ⏳ Countdown */}
    {item.timeLimit && item.startTime && !item.isComplete && !item.isFailed && (() => {
      const remainingMs = Math.max(0, item.timeLimit - (Date.now() - item.startTime));
      const totalSeconds = Math.floor(remainingMs / 1000);
      const hours = Math.floor(totalSeconds / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      const seconds = totalSeconds % 60;

      return (
        <Text style={[styles.progressLabel, { color: theme.text }]}>
          Còn lại:  {hours.toString().padStart(2, '0')}:{minutes.toString().padStart(2, '0')}:{seconds.toString().padStart(2, '0')}
        </Text>
      );
    })()}
  </View>
);


  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Text style={[styles.header, { color: theme.accent }]}>Nhật Ký Nhiệm Vụ</Text>
      <View style={styles.tabBar}>
        {questTypes.map((type) => (
          <TouchableOpacity
            key={type}
            style={[
              styles.tab,
              activeTab === type && { borderBottomColor: theme.accent, borderBottomWidth: 2 },
            ]}
            onPress={() => setActiveTab(type)}
          >
            <Text style={{ color: activeTab === type ? theme.accent : theme.text }}>{type}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <FlatList
        data={quests}
        keyExtractor={(item) => item.id}
        renderItem={renderQuest}
        contentContainerStyle={{ paddingBottom: 40 }}
      />

    </View>

  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, paddingTop: 60 },
  header: { fontSize: 24, fontWeight: 'bold', marginBottom: 10, textAlign: 'center' },
  tabBar: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 16 },
  tab: { paddingVertical: 6, paddingHorizontal: 10 },
  card: { borderRadius: 10, padding: 16, marginBottom: 14, borderWidth: 1 },
  title: { fontSize: 16, fontWeight: 'bold', marginBottom: 4 },
  desc: { fontSize: 14 },
  progressLabel: { fontSize: 12, marginTop: 4 },
  complete: { fontWeight: 'bold', marginTop: 8 },

});
