import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Progress from 'react-native-progress';
import { Quest } from '../utils/type';
import { useTheme } from './ThemeContext';
import { useFocusEffect } from '@react-navigation/native';

export default function QuestTracker() {
  const [quests, setQuests] = useState<Quest[]>([]);
  const { theme } = useTheme();

  const loadAllQuests = async () => {
  const types = ['quests_Daily', 'quests_Weekly', 'quests_Event', 'quests'];
  const all: Quest[] = [];

  for (const key of types) {
    const json = await AsyncStorage.getItem(key);
    if (json) {
      try {
        const quests: Quest[] = JSON.parse(json);
        all.push(...quests);
      } catch (e) {
        console.error(`❌ Error parsing ${key}:`, e);
      }
    }
  }

  setQuests(all);
};


  const loadQuests = loadAllQuests;


  useFocusEffect(
    useCallback(() => {
      loadQuests();
    }, [])
  );

  if (quests.length === 0) return null;

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: theme.accent }]}>📜 Quest Progress</Text>
      {quests.map((quest) => (
        <View key={quest.id} style={styles.questItem}>
          <Text style={styles.questTitle}>
            {quest.title} — {Math.round(quest.progress)}%
            {quest.isComplete && ' ✅'}
          </Text>
          <Progress.Bar
            progress={quest.progress / 100}
            width={null}
            height={10}
            borderRadius={8}
            color={quest.isComplete ? '#39ff14' : '#00f9ff'}
            unfilledColor="#222"
            borderWidth={0}
            style={{ marginTop: 4 }}
          />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 30,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  questItem: {
    backgroundColor: '#1a1a2e',
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
    borderColor: '#00f9ff55',
    borderWidth: 1,
    shadowColor: '#00f9ff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 6,
  },
  questTitle: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});
