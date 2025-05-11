import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Progress from 'react-native-progress';
import { Quest } from '../utils/type';

export default function QuestJournalScreen() {
  const [quests, setQuests] = useState<Quest[]>([]);

  useEffect(() => {
    loadQuests();
  }, []);

  const loadQuests = async () => {
    const stored = await AsyncStorage.getItem('quests');
    if (stored) {
      setQuests(JSON.parse(stored));
    } else {
      const starterQuests: Quest[] = [
        {
          id: 'q1',
          title: 'Complete 5 Tasks',
          description: 'Check off 5 different tasks.',
          progress: 0,
          isComplete: false,
          type: 'task',
          condition: { target: 5, current: 0 },
          rewardXp: 30,
        },
        {
          id: 'q2',
          title: 'Defeat 2 Elite Bosses',
          description: 'Show your strength against elites.',
          progress: 0,
          isComplete: false,
          type: 'boss',
          condition: { target: 2, current: 0 },
          rewardXp: 50,
        },
      ];
      await AsyncStorage.setItem('quests', JSON.stringify(starterQuests));
      setQuests(starterQuests);
    }
  };

  const renderQuest = ({ item }: { item: Quest }) => (
    <View style={styles.card}>
      <Text style={styles.title}>{item.title}</Text>
      <Text style={styles.desc}>{item.description}</Text>
      <Progress.Bar
        progress={item.progress / 100}
        width={null}
        height={12}
        borderRadius={10}
        color="#00f9ff"
        unfilledColor="#333"
        borderWidth={0}
        style={{ marginVertical: 10 }}
      />
      <Text style={styles.progressLabel}>
        {item.condition.current} / {item.condition.target} • 🎁 {item.rewardXp} XP
      </Text>
      {item.isComplete && <Text style={styles.complete}>✅ Complete</Text>}
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>📘 Quest Journal</Text>
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
  container: {
    flex: 1,
    backgroundColor: '#0d0c1d',
    padding: 20,
    paddingTop: 60,
  },
  header: {
    fontSize: 24,
    color: '#00f9ff',
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#1a1a2e',
    borderRadius: 10,
    padding: 16,
    marginBottom: 14,
  },
  title: {
    color: '#00f9ff',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  desc: {
    color: '#ccc',
    fontSize: 14,
  },
  progressLabel: {
    color: '#aaa',
    fontSize: 12,
    marginTop: 4,
  },
  complete: {
    color: '#4caf50',
    fontWeight: 'bold',
    marginTop: 8,
  },
});
