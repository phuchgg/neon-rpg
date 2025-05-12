import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { dailyClassQuests } from '../utils/classQuests';
import { useTheme } from '../contexts/ThemeContext';
import { classes } from '../utils/classes'; // ✅ make sure this is imported

const getTodayKey = () => new Date().toISOString().split('T')[0];

export default function ClassQuestScreen() {
  const [playerClass, setPlayerClass] = useState<string | null>(null);
  const [dailyQuest, setDailyQuest] = useState<string | null>(null);
  const [questCompleted, setQuestCompleted] = useState(false);
  const [questStreak, setQuestStreak] = useState(0);
  const [npc, setNpc] = useState<{ name: string; quote: string; avatar: string } | null>(null);
  const { theme } = useTheme();

  const todayKey = getTodayKey();

  useEffect(() => {
    const loadQuestAndNPC = async () => {
      const storedClass = await AsyncStorage.getItem('playerClass');
      if (!storedClass) return;

      setPlayerClass(storedClass);

      const playerClassObj = classes.find((cls) => cls.id === storedClass);
      if (playerClassObj) setNpc(playerClassObj.npc);

      const storedQuestKey = `classQuest_${playerClass}_${todayKey}`;
      await AsyncStorage.setItem(`${storedQuestKey}_done`, 'true');
      const storedQuest = await AsyncStorage.getItem(storedQuestKey);
      const completed = await AsyncStorage.getItem(`${storedQuestKey}_done`);
      const savedStreak = await AsyncStorage.getItem('questStreak');

      if (savedStreak) setQuestStreak(parseInt(savedStreak));

      if (storedQuest) {
        setDailyQuest(storedQuest);
        setQuestCompleted(completed === 'true');
      } else {
        const options = dailyClassQuests[storedClass as keyof typeof dailyClassQuests];
        const random = options[Math.floor(Math.random() * options.length)];
        setDailyQuest(random);
        await AsyncStorage.setItem(storedQuestKey, random);
      }
    };

    loadQuestAndNPC();
  }, []);

  const completeQuest = async () => {
    if (questCompleted) return;

    const today = getTodayKey();
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

    const storedQuestKey = `classQuest_${playerClass}_${today}`;
await AsyncStorage.setItem(`${storedQuestKey}_done`, 'true');
setQuestCompleted(true);

    const lastDate = await AsyncStorage.getItem('lastQuestDate');
    let streak = parseInt((await AsyncStorage.getItem('questStreak')) ?? '0');

    if (lastDate === yesterday) {
      streak += 1;
    } else {
      streak = 1;
    }

    await AsyncStorage.setItem('lastQuestDate', today);
    await AsyncStorage.setItem('questStreak', streak.toString());
    setQuestStreak(streak);

    const savedXp = parseInt((await AsyncStorage.getItem('xp')) ?? '0');
    const newXp = savedXp + 20;
    await AsyncStorage.setItem('xp', newXp.toString());

    Alert.alert('🎉 Quest Complete!', `+20 XP earned\n🔥 Streak: ${streak} day${streak > 1 ? 's' : ''}`);

    if (streak === 7) {
      await AsyncStorage.setItem('edgewalkerUnlocked', 'true');
      Alert.alert('🔥 New Class Unlocked!', 'You unlocked Edgewalker!');
    }

    const historyJson = await AsyncStorage.getItem('questHistory');
const history = historyJson ? JSON.parse(historyJson) : [];
history.push({ date: today, quest: dailyQuest, class: playerClass });
await AsyncStorage.setItem('questHistory', JSON.stringify(history));
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Text style={[styles.title, { color: theme.accent }]}>🧑‍🏫 Class Quest Giver</Text>

      {npc && (
        <View style={styles.npcBox}>
          <Text style={styles.npcAvatar}>{npc.avatar}</Text>
          <Text style={[styles.npcName, { color: theme.accent }]}>{npc.name}</Text>
          <Text style={[styles.npcQuote, { color: theme.text }]}>{npc.quote}</Text>
        </View>
      )}

      <View style={styles.questBox}>
        <Text style={styles.questText}>📜 {dailyQuest}</Text>
      </View>

      <TouchableOpacity
        onPress={completeQuest}
        disabled={questCompleted}
        style={[
          styles.button,
          questCompleted ? styles.buttonDone : { borderColor: theme.accent },
        ]}
      >
        <Text style={styles.buttonText}>
          {questCompleted ? '✅ Completed' : 'Claim Reward'}
        </Text>
      </TouchableOpacity>

      <View style={{ marginTop: 10 }}>
        <Text style={{ textAlign: 'center', color: '#aaa' }}>
          🔥 Streak: {questStreak} day{questStreak > 1 ? 's' : ''} {questStreak >= 7 && '🎖️'}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, paddingTop: 60 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  npcBox: { alignItems: 'center', marginBottom: 20 },
  npcAvatar: { fontSize: 40, marginBottom: 8 },
  npcName: { fontSize: 18, fontWeight: 'bold', marginBottom: 4 },
  npcQuote: { fontSize: 14, fontStyle: 'italic', textAlign: 'center' },
  questBox: {
    backgroundColor: '#1a1a2e',
    padding: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#00f9ff66',
    marginBottom: 30,
  },
  questText: { fontSize: 18, color: '#fff', textAlign: 'center' },
  button: { borderWidth: 1, padding: 14, borderRadius: 10, alignItems: 'center', marginTop: 10 },
  buttonText: { fontSize: 16, color: '#00f9ff', fontWeight: '600' },
  buttonDone: { backgroundColor: '#333', borderColor: '#555' },
});
