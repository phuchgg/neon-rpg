import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRoute, RouteProp } from '@react-navigation/native';
import { Task, Boss } from '../utils/type';

type RootStackParamList = {
  BossDetailScreen: { bossId: string };
};

type BossDetailRouteProp = RouteProp<RootStackParamList, 'BossDetailScreen'>;

export default function BossDetailScreen() {
  const route = useRoute<BossDetailRouteProp>();
  const { bossId } = route.params;

  const [boss, setBoss] = useState<Boss | null>(null);
  const [linkedTasks, setLinkedTasks] = useState<Task[]>([]);

  useEffect(() => {
    loadBoss();
    loadLinkedTasks();
  }, []);

  const loadBoss = async () => {
    const json = await AsyncStorage.getItem('bosses');
    if (!json) return;

    const bosses: Boss[] = JSON.parse(json);
    const found = bosses.find((b) => b.id === bossId);
    if (found) setBoss(found);
  };

  const loadLinkedTasks = async () => {
    const json = await AsyncStorage.getItem('tasks');
    if (!json) return;

    const tasks: Task[] = JSON.parse(json);
    const linked = tasks.filter((t) => t.bossId === bossId);
    setLinkedTasks(linked);
  };

  if (!boss) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Boss not found.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{boss.title}</Text>
      <Text style={styles.desc}>{boss.description}</Text>

      <View style={styles.progressContainer}>
        <Text style={styles.progressLabel}>
        {`Progress: ${boss.progress}% ${boss.isDefeated ? '✅' : ''}`}
        </Text>
        <View style={styles.progressBarOuter}>
          <View style={[styles.progressBarInner, { width: `${boss.progress}%` }]} />
        </View>
      </View>

      <Text style={styles.subheading}>Linked Tasks:</Text>
      {linkedTasks.length === 0 ? (
        <Text style={styles.noTask}>🕹️ No tasks linked yet.</Text>
      ) : (
        <FlatList
          data={linkedTasks}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <Text style={styles.taskText}>
              {item.completed ? '✅' : '🕹️'} {item.title}
            </Text>
          )}
        />
      )}
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
  title: {
    fontSize: 22,
    color: '#00f9ff',
    fontWeight: 'bold',
    marginBottom: 10,
  },
  desc: {
    color: '#aaa',
    fontStyle: 'italic',
    marginBottom: 20,
  },
  progressContainer: {
    marginBottom: 20,
  },
  progressLabel: {
    color: '#fff',
    marginBottom: 6,
  },
  progressBarOuter: {
    height: 12,
    backgroundColor: '#1a1a2e',
    borderRadius: 6,
    overflow: 'hidden',
  },
  progressBarInner: {
    height: 12,
    backgroundColor: '#00f9ff',
  },
  subheading: {
    color: '#00f9ff',
    fontSize: 16,
    marginTop: 20,
    marginBottom: 10,
    fontWeight: '600',
  },
  noTask: {
    color: '#888',
    fontStyle: 'italic',
  },
  taskText: {
    color: '#fefefe',
    paddingVertical: 6,
  },
});
