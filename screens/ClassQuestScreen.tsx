import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { dailyClassQuests } from '../utils/classQuests';
import { useTheme } from '../contexts/ThemeContext';
import { classes } from '../utils/classes';
import { Npc, ClassType } from '../utils/type';
import { Image } from 'react-native';

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
    // ✅ Also add to activity timeline
    const timeline = JSON.parse(await AsyncStorage.getItem('activityHistory') || '[]');
    timeline.push({
      date: new Date().toISOString(),
      type: 'quest',
      description: `Completed class quest: ${dailyQuest}`,
      details: { class: playerClass },
    });
    await AsyncStorage.setItem('activityHistory', JSON.stringify(timeline));

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
      <Text style={[styles.title, { color: theme.accent }]}>Class Quest Giver</Text>

      {npc && (
        <View style={styles.npcBox}>
          <Image
            source={npc.avatar}
            style={styles.npcAvatar}
          />
          <Text style={[styles.npcName, { color: theme.accent }]}>{npc.name}</Text>
          <Text style={[styles.npcQuote, { color: theme.text }]}>{npc.quote}</Text>
        </View>
      )}

      <View style={[styles.questBox, { borderColor: theme.accent }]}>
        <Text style={[styles.questText, { color: theme.text }]}>📜 {dailyQuest}</Text>
      </View>

      <TouchableOpacity
  onPress={completeQuest}
  disabled={questCompleted}
  style={[
    styles.rewardButton,
    questCompleted ? styles.rewardButtonDone : styles.rewardButtonActive,
  ]}
  activeOpacity={0.8}
>
  <Text style={[
    styles.rewardButtonText,
    { color: questCompleted ? '#999' : '#00ffc8' },
  ]}>
    {questCompleted ? '✅ Completed' : '⚡ CLAIM REWARD'}
  </Text>
</TouchableOpacity>



      <View style={{ marginTop: 10 }}>
        <Text style={ styles.streakText}>
          🔥 Streak: {questStreak} day{questStreak > 1 ? 's' : ''} {questStreak >= 7 && '🎖️'}
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
    backgroundColor: '#0a0a0a', // Optional: override theme for consistent darkness
  },
    title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#00ffc8',
    letterSpacing: 1,
    textShadowColor: '#00ffc8',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
  npcBox: { alignItems: 'center', marginBottom: 20 },
    npcAvatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 12,
    resizeMode: 'contain',
    borderWidth: 2,
    borderColor: '#00ffc8',
    backgroundColor: '#222',
  },
    npcName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
    color: '#00ffc8',
    letterSpacing: 0.5,
  },
    npcQuote: {
    fontSize: 14,
    fontStyle: 'italic',
    textAlign: 'center',
    color: '#aaa',
  },
  questBox: {
    padding: 20,
    borderRadius: 12,
    borderWidth: 2,
    marginBottom: 30,
    borderColor: '#ff00ff',
    backgroundColor: '#1a001a',
    shadowColor: '#ff00ff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
    questText: {
    fontSize: 18,
    color: '#fff',
    textAlign: 'center',
    fontWeight: '500',
    letterSpacing: 0.4,
  },
  button: { borderWidth: 3, padding: 14, borderRadius: 10, alignItems: 'center', marginTop: 10 },
  buttonText: { fontSize: 16, fontWeight: '600' },
  buttonDone: { backgroundColor: '#333', borderColor: '#555' },
  npcAvatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 12,
    resizeMode: 'contain',
  },
    rewardButton: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
    marginTop: 10,
    shadowColor: '#00ffc8',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 12,
  },

rewardButtonActive: {
  borderColor: '#00ffc8',
  backgroundColor: '#001f1f',
},

rewardButtonDone: {
  borderColor: '#555',
  backgroundColor: '#222',
  shadowOpacity: 0,
},

rewardButtonText: {
  fontSize: 18,
  fontWeight: 'bold',
  textTransform: 'uppercase',
  letterSpacing: 1,
},
streakText: {
    textAlign: 'center',
    color: '#aaa',
    fontSize: 14,
    marginTop: 10,
    letterSpacing: 0.3,
  },

});
