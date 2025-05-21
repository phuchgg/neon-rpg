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
        console.log("📜 Loaded history:", parsed);
        setHistory(parsed.reverse());
      }
    };
    loadHistory();
  }, []);

  const renderItem = ({ item }: { item: HistoryItem }) => {
  const colorMap = {
    quest: '#00f9ff',
    boss: '#ff5e5e',
    class: '#ffcc00',
    reward: '#00ff90',
  };

  const iconMap = {
    quest: '📜',
    boss: '👑',
    class: '🧑‍💻',
    reward: '🎁',
  };

  return (
    <View style={[
      styles.itemContainer,
      {
        borderLeftColor: colorMap[item.type],
        shadowColor: colorMap[item.type],
      },
    ]}>
      <View style={styles.row}>
        <Text style={styles.icon}>{iconMap[item.type]}</Text>
        <View style={{ flex: 1 }}>
          <Text style={[styles.description, { color: theme.text }]}>
            {item.description}
          </Text>
          <Text style={styles.dateText}>
            {new Date(item.date).toLocaleString()}
          </Text>
        </View>
      </View>
    </View>
  );
};


  if (history.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
  <Text style={styles.emptyIcon}>📭</Text>
  <Text style={styles.emptyText}>No activity history yet.</Text>
</View>

    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Text style={[styles.title, { color: theme.accent }]}>Activity Timeline</Text>
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
    container: {
    flex: 1,
    padding: 20,
    paddingTop: 60,
    backgroundColor: '#0b0b13',
  },
   title: {
    fontSize: 26,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#00f9ff',
    letterSpacing: 1,
    textShadowColor: '#00f9ff',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
  itemContainer: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 14,
    backgroundColor: '#161625',
    borderLeftWidth: 4,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
  },
  row: { flexDirection: 'row', alignItems: 'center' },
  icon: { fontSize: 28, marginRight: 12 },
    description: {
    fontSize: 16,
    fontWeight: '500',
    letterSpacing: 0.3,
  },
    dateText: {
    fontSize: 12,
    color: '#888',
    marginTop: 4,
  },
    emptyIcon: {
    fontSize: 48,
    textAlign: 'center',
    marginTop: 60,
    marginBottom: 10,
    color: '#666',
  },

  emptyText: {
    fontSize: 16,
    textAlign: 'center',
    color: '#888',
  },
});
