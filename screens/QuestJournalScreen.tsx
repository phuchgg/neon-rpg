import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Progress from 'react-native-progress';
import { Quest } from '../utils/type';
import { useTheme } from '../contexts/ThemeContext';
import { generateUniqueQuests } from '../utils/QuestGenerator';

const questTypes = ['Daily', 'Weekly', 'Event'] as const;
type QuestType = typeof questTypes[number];

const dummyQuests: Record<QuestType, Quest[]> = {
  Daily: [
    {
      id: 'd1',
      title: 'Complete 3 Tasks Today',
      description: 'Small steps daily.',
      progress: 0,
      isComplete: false,
      type: 'task',
      condition: { target: 3, current: 0 },
      rewardXp: 20,
    },
    {
      id: 'd2',
      title: 'Defeat 1 Mini Boss',
      description: 'Warm up your skills.',
      progress: 0,
      isComplete: false,
      type: 'boss',
      condition: { target: 1, current: 0 },
      rewardXp: 25,
    },
  ],
  Weekly: [
    {
      id: 'w1',
      title: 'Complete 20 Tasks This Week',
      description: 'Stay productive over the week.',
      progress: 0,
      isComplete: false,
      type: 'task',
      condition: { target: 20, current: 0 },
      rewardXp: 100,
    },
    {
      id: 'w2',
      title: 'Defeat 5 Elite Bosses',
      description: 'Show consistency in battle.',
      progress: 0,
      isComplete: false,
      type: 'boss',
      condition: { target: 5, current: 0 },
      rewardXp: 150,
    },
  ],
  Event: [
    {
      id: 'e1',
      title: 'Special Event: Defeat Mega Boss',
      description: 'Limited time challenge!',
      progress: 0,
      isComplete: false,
      type: 'boss',
      condition: { target: 1, current: 0 },
      rewardXp: 300,
    },
  ],
};

export default function QuestJournalTabs() {
  const [activeTab, setActiveTab] = useState<QuestType>('Daily');
  const [quests, setQuests] = useState<Quest[]>([]);
  const { theme } = useTheme();

  useEffect(() => {
    loadQuests(activeTab);
  }, [activeTab]);

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
  
  

  const fakeCompleteQuest = async (questId: string) => {
    const updated = quests.map((q) =>
      q.id === questId
        ? { ...q, isComplete: true, progress: 100, condition: { ...q.condition, current: q.condition.target } }
        : q
    );
    const key = `quests_${activeTab}`;
    await AsyncStorage.setItem(key, JSON.stringify(updated));
    setQuests(updated);
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
      {item.isComplete && <Text style={[styles.complete, { color: theme.text }]}>✅ Complete</Text>}
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Text style={[styles.header, { color: theme.accent }]}>📘 Quest Journal</Text>
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
