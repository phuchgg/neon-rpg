import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../contexts/ThemeContext';

type HistoryItem = {
  date: string;
  type: 'quest' | 'boss' | 'class' | 'reward';
  description: string;
  details?: any;
};

export default function ActivityHistoryScreen() {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const { theme } = useTheme();

  useEffect(() => {
    const loadHistory = async () => {
      const json = await AsyncStorage.getItem('activityHistory');
      if (json) {
        const parsed: HistoryItem[] = JSON.parse(json);
        setHistory(parsed.reverse());
      }
    };
    loadHistory();
  }, []);

  const renderItem = ({ item }: { item: HistoryItem }) => {
    const colorMap = {
      quest: '#00f9ff',
      boss: '#ff6347',
      class: '#ffa500',
      reward: '#4caf50',
    };

    const iconMap = {
      quest: '📜',
      boss: '👑',
      class: '🧑‍💻',
      reward: '🎁',
    };

    return (
      <View style={[styles.itemContainer, { borderColor: colorMap[item.type] }]}>
        <View style={styles.row}>
          <Text style={styles.icon}>{iconMap[item.type]}</Text>
          <View style={{ flex: 1 }}>
            <Text style={[styles.description, { color: theme.text }]}>{item.description}</Text>
            <Text style={[styles.dateText]}>{new Date(item.date).toLocaleString()}</Text>
          </View>
        </View>
      </View>
    );
  };

  if (history.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <Text style={{ color: theme.text, textAlign: 'center', marginTop: 40 }}>
          No activity history yet.
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Text style={[styles.title, { color: theme.accent }]}>📊 Activity Timeline</Text>
      <FlatList
        data={history}
        keyExtractor={(item, index) => `${item.date}_${index}`}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 40 }}
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
  row: { flexDirection: 'row', alignItems: 'center' },
  icon: { fontSize: 28, marginRight: 12 },
  description: { fontSize: 16 },
  dateText: { fontSize: 12, color: '#aaa', marginTop: 6 },
});
