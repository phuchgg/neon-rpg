import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { dailyClassQuests } from '../utils/classQuests';
import { useTheme } from '../contexts/ThemeContext';

const getTodayKey = () => {
  return new Date().toISOString().split('T')[0]; // e.g. "2025-05-09"
};

export default function ClassQuestScreen() {
  const [playerClass, setPlayerClass] = useState<string | null>(null);
  const [dailyQuest, setDailyQuest] = useState<string | null>(null);
  const [questCompleted, setQuestCompleted] = useState(false);
  const [questStreak, setQuestStreak] = useState(0);
  const [lastCompletedDate, setLastCompletedDate] = useState<string | null>(null);
  const { theme } = useTheme();

  const todayKey = getTodayKey();

  useEffect(() => {
    const loadQuest = async () => {
      const storedClass = await AsyncStorage.getItem('playerClass');
      if (!storedClass) return;

      setPlayerClass(storedClass);

      const storedQuestKey = `quest_${todayKey}`;
      const storedQuest = await AsyncStorage.getItem(storedQuestKey);
      const completed = await AsyncStorage.getItem(`${storedQuestKey}_done`);

      const savedStreak = await AsyncStorage.getItem('questStreak');
      const savedDate = await AsyncStorage.getItem('lastQuestDate');
      if (savedStreak) setQuestStreak(parseInt(savedStreak));
      if (savedDate) setLastCompletedDate(savedDate);

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

    loadQuest();
  }, []);

  const completeQuest = async () => {
    if (questCompleted) return;

    const today = getTodayKey();
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

    await AsyncStorage.setItem(`quest_${today}_done`, 'true');
    setQuestCompleted(true);

    const lastDate = await AsyncStorage.getItem('lastQuestDate');
    const savedStreak = await AsyncStorage.getItem('questStreak');
    let streak = parseInt(savedStreak ?? '0');

    if (lastDate === yesterday) {
      streak += 1;
    } else {
      streak = 1;
    }

    await AsyncStorage.setItem('lastQuestDate', today);
    await AsyncStorage.setItem('questStreak', streak.toString());

    setQuestStreak(streak);
    setLastCompletedDate(today);

    const savedXp = await AsyncStorage.getItem('xp');
    const newXp = (parseInt(savedXp ?? '0') || 0) + 20;
    await AsyncStorage.setItem('xp', newXp.toString());

    Alert.alert(
      '🎉 Quest Complete!',
      `+20 XP earned\n🔥 Streak: ${streak} day${streak > 1 ? 's' : ''}`
    );

    if (streak === 7) {
      await AsyncStorage.setItem('edgewalkerUnlocked', 'true');
      Alert.alert('🔥 New Class Unlocked!', 'You unlocked Edgewalker!');
    }

    // ✅ Append to quest history
    const historyJson = await AsyncStorage.getItem('questHistory');
    const history = historyJson ? JSON.parse(historyJson) : [];
    history.push({
      date: today,
      quest: dailyQuest,
      class: playerClass,
    });
    await AsyncStorage.setItem('questHistory', JSON.stringify(history));
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Text style={[styles.title, { color: theme.accent }]}>🧑‍🏫 Class Quest Giver</Text>

      <Text style={[styles.npcText, { color: theme.text }]}>
        “Only a {playerClass} knows how to master this challenge...”
      </Text>

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
          🔥 Streak: {questStreak} day{questStreak > 1 ? 's' : ''}{' '}
          {questStreak >= 7 && '🎖️'}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    paddingTop: 60,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  npcText: {
    fontSize: 16,
    fontStyle: 'italic',
    marginBottom: 24,
    textAlign: 'center',
  },
  questBox: {
    backgroundColor: '#1a1a2e',
    padding: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#00f9ff66',
    marginBottom: 30,
  },
  questText: {
    fontSize: 18,
    color: '#fff',
    textAlign: 'center',
  },
  button: {
    borderWidth: 1,
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    fontSize: 16,
    color: '#00f9ff',
    fontWeight: '600',
  },
  buttonDone: {
    backgroundColor: '#333',
    borderColor: '#555',
  },
});
