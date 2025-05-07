import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, FlatList, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import uuid from 'react-native-uuid';
import * as Progress from 'react-native-progress';
import LottieView from 'lottie-react-native';
import { Task } from '../utils/type';

const getXpForLevel = (level: number): number => {
  return 100 + (level - 1) * 20; // Level 1 = 100, Level 2 = 120, etc.
};

export default function TaskScreen() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTask, setNewTask] = useState('');
  const [xp, setXp] = useState(0);
  const [level, setLevel] = useState(1);
  const [showLottie, setShowLottie] = useState(false);
  const [streak, setStreak] = useState(0);
  const [showStreakBonus, setShowStreakBonus] = useState(false);
  const applyClassBonus = (task: Task, baseXp: number, playerClass: string | null): number => {
    let bonusXp = 0;

    if (playerClass === 'ghostrunner' && task.title.length <= 10) {
      bonusXp += Math.floor(baseXp * 0.2); // 20%
    }

    if (playerClass === 'netcrasher') {
      const keywords = ['code', 'debug', 'fix', 'study'];
      if (keywords.some((word) => task.title.toLowerCase().includes(word))) {
        bonusXp += 5;
      }
    }

    if (playerClass === 'synthmancer') {
      bonusXp += 2;
    }

    return baseXp + bonusXp;
  };

  useEffect(() => {
    loadTasks();
    loadProgress();
  }, []);

  useEffect(() => {
    AsyncStorage.setItem('xp', xp.toString());
    AsyncStorage.setItem('level', level.toString());
  }, [xp, level]);

  const loadTasks = async () => {
    const json = await AsyncStorage.getItem('tasks');
    if (json) setTasks(JSON.parse(json));
  };

  const loadProgress = async () => {
    const savedXp = await AsyncStorage.getItem('xp');
    const savedLevel = await AsyncStorage.getItem('level');
    const savedStreak = await AsyncStorage.getItem('streakCount'); // ✅ ADD THIS

    if (savedXp) setXp(parseInt(savedXp));
    if (savedLevel) setLevel(parseInt(savedLevel));
    if (savedStreak) setStreak(parseInt(savedStreak)); // ✅ ADD THIS
  };

  const saveTasks = async (updated: Task[]) => {
    await AsyncStorage.setItem('tasks', JSON.stringify(updated));
  };

  const addTask = () => {
    const task: Task = {
      id: uuid.v4().toString(),
      title: newTask.trim(),
      completed: false,
      createdAt: Date.now(),
    };
    const updated = [task, ...tasks];
    setTasks(updated);
    saveTasks(updated);
    setNewTask('');
  };

  const toggleTask = async (id: string) => {
    const updatedTasks = [...tasks];
    const taskIndex = updatedTasks.findIndex((t) => t.id === id);
    if (taskIndex === -1) return;

    const task = updatedTasks[taskIndex];
    const updatedTask = { ...task, completed: !task.completed };
    updatedTasks[taskIndex] = updatedTask;

    if (!task.completed && updatedTask.completed) {
      const playerClass = await AsyncStorage.getItem('playerClass');
      const baseXp = 10;
      const newXp = xp + applyClassBonus(task, baseXp, playerClass);
      console.log(`🎮 Class: ${playerClass} | +XP: ${newXp}`); // 🧪 Test log
      const xpNeeded = getXpForLevel(level);
      const today = new Date().toISOString().split('T')[0];
      const lastDate = await AsyncStorage.getItem('lastActiveDate');
      const storedStreak = await AsyncStorage.getItem('streakCount');
      const streakValue = storedStreak ? parseInt(storedStreak) : 0;

      // Check if streak updated today
      if (lastDate !== today) {
        const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
        let updatedStreak = 1;

        if (lastDate === yesterday) {
          updatedStreak = streakValue + 1;
        }

        await AsyncStorage.setItem('streakCount', updatedStreak.toString());
        setStreak(updatedStreak);
        await AsyncStorage.setItem('lastActiveDate', today);

        // 🎁 Streak Rewards:
        if (updatedStreak === 3) {
          setXp((prev) => prev + 20);
          setShowStreakBonus(true);
          setTimeout(() => setShowStreakBonus(false), 2000);
        }

        if (updatedStreak === 7) {
          Alert.alert('🔥 Badge Unlocked!', 'You earned a glowing streak badge! (Future quest)');
        }
      }

      if (newXp >= xpNeeded) {
        setShowLottie(true);
        setTimeout(() => {
          setShowLottie(false);
          setXp(newXp - xpNeeded);
          setLevel(level + 1);
          Alert.alert('Level Up!', `You're now Level ${level + 1}! 🎉`);
        }, 2000);
      } else {
        setXp(newXp);
      }
    }

    setTasks(updatedTasks);
    saveTasks(updatedTasks);
  };


  return (
    <View style={styles.container}>
      <Text style={styles.title}>🎯 Daily Missions</Text>
      <Text style={styles.streakText}>🔥 Streak: {streak} days</Text>
      <View style={styles.xpContainer}>
        <Text style={styles.xpLabel}>Level {level} - XP: {xp}/{getXpForLevel(level)}</Text>
        <View style={styles.xpBarGlowContainer}>
          <Progress.Bar
            progress={xp / getXpForLevel(level)}
            width={null}
            height={16}
            borderRadius={12}
            color="#00f9ff"
            unfilledColor="#1a1a1a"
            borderWidth={0}
          />
          <View style={styles.glowOverlay} />
        </View>
      </View>

      {showLottie && (
        <LottieView
          source={require('../assets/lotties/level-up.json')}
          autoPlay
          loop={false}
          style={styles.lottie}
        />
      )}

      {showStreakBonus && (
        <LottieView
          source={require('../assets/lotties/bonus-xp.json')}
          autoPlay
          loop={false}
          style={styles.lottie}
        />
      )}

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Type your task..."
          value={newTask}
          onChangeText={setNewTask}
        />
        <Button title="Add" onPress={addTask} />
      </View>

      <FlatList
        data={tasks}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => toggleTask(item.id)}
            style={[
              styles.taskItem,
              item.completed && styles.completedTask,
            ]}
          >
            <Text style={styles.taskText}>
              {item.completed ? '✅ ' : '🕹️ '} {item.title}
            </Text>
          </TouchableOpacity>
        )}
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
  title: {
    fontSize: 24,
    color: '#00f9ff',
    marginBottom: 10,
    fontWeight: 'bold',
  },
  xpContainer: {
    marginBottom: 20,
  },
  xpLabel: {
    color: '#00f9ff',
    marginBottom: 5,
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  xpBarGlowContainer: {
    position: 'relative',
    height: 16,
    justifyContent: 'center',
  },
  glowOverlay: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 12,
    backgroundColor: '#00f9ff44',
    shadowColor: '#00f9ff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
  },
  lottie: {
    width: 200,
    height: 200,
    alignSelf: 'center',
    marginBottom: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  input: {
    flex: 1,
    backgroundColor: '#1f1f2e',
    padding: 10,
    color: '#fff',
    borderRadius: 8,
    marginRight: 8,
  },
  taskItem: {
    padding: 12,
    backgroundColor: '#1a1a2e',
    borderRadius: 8,
    marginBottom: 10,
  },
  completedTask: {
    backgroundColor: '#14213d',
    opacity: 0.6,
  },
  taskText: {
    color: '#fefefe',
    fontSize: 16,
  },
  streakText: {
    color: '#ff4d6d',
    fontSize: 16,
    marginBottom: 10,
    textAlign: 'center',
    fontWeight: 600,
  }
});