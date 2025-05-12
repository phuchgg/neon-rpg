import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../contexts/ThemeContext';
import { classes } from '../utils/classes';

export default function QuestHistoryScreen() {
  const [history, setHistory] = useState<
    { date: string; quest: string; class: string }[]
  >([]);
  const { theme } = useTheme();

  useEffect(() => {
    const loadHistory = async () => {
      const historyJson = await AsyncStorage.getItem('questHistory');
      if (historyJson) setHistory(JSON.parse(historyJson));
    };
    loadHistory();
  }, []);

  const renderItem = ({ item }: { item: { date: string; quest: string; class: string } }) => {
    const playerClass = classes.find((cls) => cls.id === item.class);

    return (
      <View style={[styles.itemContainer, { borderColor: theme.accent }]}>
        <Text style={styles.dateText}>📅 {item.date}</Text>
        <View style={styles.row}>
          <Text style={styles.avatar}>{playerClass?.npc.avatar || '❓'}</Text>
          <View style={{ flex: 1 }}>
            <Text style={[styles.questText, { color: theme.text }]}>{item.quest}</Text>
            <Text style={[styles.classText, { color: theme.accent }]}>
              {playerClass?.name || 'Unknown Class'}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  if (history.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <Text style={{ color: theme.text, textAlign: 'center', marginTop: 40 }}>
          No quest history yet.
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Text style={[styles.title, { color: theme.accent }]}>📜 Quest History</Text>
      <FlatList
        data={history.reverse()}
        keyExtractor={(item, index) => `${item.date}_${index}`}
        renderItem={renderItem}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, paddingTop: 60 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  itemContainer: {
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 12,
    backgroundColor: '#1a1a2e',
  },
  dateText: { fontSize: 12, color: '#aaa', marginBottom: 6 },
  row: { flexDirection: 'row', alignItems: 'center' },
  avatar: { fontSize: 28, marginRight: 12 },
  questText: { fontSize: 16 },
  classText: { fontSize: 12, marginTop: 4 },
});
