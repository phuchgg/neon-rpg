import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../contexts/ThemeContext';

interface QuestLog {
  date: string;
  quest: string;
  class: string;
}

export default function QuestHistoryScreen() {
  const [history, setHistory] = useState<QuestLog[]>([]);
  const { theme } = useTheme();

  useEffect(() => {
    const loadHistory = async () => {
      const json = await AsyncStorage.getItem('questHistory');
      if (json) {
        setHistory(JSON.parse(json));
      }
    };
    loadHistory();
  }, []);

  const renderItem = ({ item }: { item: QuestLog }) => (
    <View style={styles.card}>
      <Text style={styles.date}>{item.date}</Text>
      <Text style={styles.classTag}>🎭 {item.class}</Text>
      <Text style={styles.questText}>📜 {item.quest}</Text>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Text style={[styles.title, { color: theme.accent }]}>📖 Quest History</Text>
      {history.length === 0 ? (
        <Text style={{ color: '#aaa', textAlign: 'center' }}>No history yet.</Text>
      ) : (
        <FlatList
          data={history.reverse()}
          renderItem={renderItem}
          keyExtractor={(_, i) => i.toString()}
          contentContainerStyle={{ paddingBottom: 40 }}
        />
      )}
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
  card: {
    backgroundColor: '#1a1a2e',
    padding: 16,
    borderRadius: 10,
    marginBottom: 12,
    borderColor: '#00f9ff66',
    borderWidth: 1,
  },
  date: {
    color: '#aaa',
    fontSize: 13,
    marginBottom: 4,
  },
  classTag: {
    color: '#00f9ff',
    fontWeight: '600',
    marginBottom: 4,
  },
  questText: {
    color: '#fff',
    fontSize: 16,
  },
});
