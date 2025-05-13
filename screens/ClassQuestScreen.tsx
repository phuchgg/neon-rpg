import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { dailyClassQuests } from '../utils/classQuests';
import { useTheme } from '../contexts/ThemeContext';
import { classes } from '../utils/classes';
import { Npc, ClassType } from '../utils/type';

const getXpForLevel = (level: number): number => {
  return 100 + (level - 1) * 20;
};

export default function ClassQuestScreen() {
  const [playerClass, setPlayerClass] = useState<ClassType | null>(null);
  const [dailyQuest, setDailyQuest] = useState<string | null>(null);
  const [questCompleted, setQuestCompleted] = useState<boolean>(false);
  const [questStreak, setQuestStreak] = useState<number>(0);
  const [npc, setNpc] = useState<Npc | null>(null);
  const [fakeDateOffset, setFakeDateOffset] = useState<number>(0);

  const { theme } = useTheme();
  const navigation = useNavigation();

  const getTodayKey = () =>
    new Date(Date.now() + fakeDateOffset * 86400000).toISOString().split('T')[0];

  const loadQuestAndNPC = async () => {
    const todayKey = getTodayKey();
    const storedClass = await AsyncStorage.getItem('playerClass') as ClassType | null;
    if (!storedClass) return;

    setPlayerClass(storedClass);

    const playerClassObj = classes.find((cls) => cls.id === storedClass);
    if (playerClassObj) setNpc(playerClassObj.npc);

    const storedQuestKey = `classQuest_${storedClass}_${todayKey}`;
    const storedQuest = await AsyncStorage.getItem(storedQuestKey);

    const savedStreak = await AsyncStorage.getItem('questStreak');
    if (savedStreak) setQuestStreak(parseInt(savedStreak));

    const completedKey = `${storedQuestKey}_done`;
    const completed = await AsyncStorage.getItem(completedKey);

    if (!storedQuest) {
      const options = dailyClassQuests[storedClass as keyof typeof dailyClassQuests];
      const random = options[Math.floor(Math.random() * options.length)];
      await AsyncStorage.setItem(storedQuestKey, random);
      await AsyncStorage.setItem(completedKey, 'false');
      setDailyQuest(random);
      setQuestCompleted(false);
    } else {
      setDailyQuest(storedQuest);

      if (completed === null) {
        await AsyncStorage.setItem(completedKey, 'false');
        setQuestCompleted(false);
      } else {
        setQuestCompleted(completed === 'true');
      }
    }
  };

  const handleLevelUp = async () => {
    let level = parseInt((await AsyncStorage.getItem('level')) ?? '1');
    let xp = parseInt((await AsyncStorage.getItem('xp')) ?? '0');

    while (xp >= getXpForLevel(level)) {
      xp -= getXpForLevel(level);
      level += 1;
      Alert.alert('🎉 Level Up!', `You reached level ${level}!`);
    }

    await AsyncStorage.setItem('level', level.toString());
    await AsyncStorage.setItem('xp', xp.toString());
  };

  const completeQuest = async () => {
    if (questCompleted || !playerClass) return;

    const today = getTodayKey();
    const yesterday = new Date(Date.now() + (fakeDateOffset - 1) * 86400000).toISOString().split('T')[0];

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

    await handleLevelUp();
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadQuestAndNPC();
    });
    loadQuestAndNPC();
    return unsubscribe;
  }, [navigation, fakeDateOffset]);

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

      <View style={[styles.questBox, {borderColor: theme.accent}]}>
        <Text style={[styles.questText, {color: theme.text}]}>📜 {dailyQuest}</Text>
      </View>

      <TouchableOpacity
        onPress={completeQuest}
        disabled={questCompleted}
        style={[
          styles.button,
          questCompleted ? styles.buttonDone : { borderColor: '#808080' },
        ]}
      >
        <Text style={[styles.buttonText, { color: theme.accent }]}>
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
    padding: 20,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 30,
  },
  questText: { fontSize: 18, color: '#fff', textAlign: 'center' },
  button: { borderWidth: 3, padding: 14, borderRadius: 10, alignItems: 'center', marginTop: 10 },
  buttonText: { fontSize: 16, fontWeight: '600' },
  buttonDone: { backgroundColor: '#333', borderColor: '#555' },
});
