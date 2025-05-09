import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, FlatList, TouchableOpacity, StyleSheet, Alert, Animated } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import uuid from 'react-native-uuid';
import * as Progress from 'react-native-progress';
import LottieView from 'lottie-react-native';
import { Task, Boss } from '../utils/type';
import { Picker } from '@react-native-picker/picker';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTheme } from '../contexts/ThemeContext';
import { themes } from '../utils/themes';
import { RootStackParamList } from '../utils/navigation';
import { useMemo, useRef } from 'react';

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
  const [bosses, setBosses] = useState<Boss[]>([]);
  const [selectedBossId, setSelectedBossId] = useState<string | null>(null);
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [showBossVictory, setShowBossVictory] = useState(false);
  const { theme } = useTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);
  const [showXpLabel, setShowXpLabel] = useState(false);
  const xpAnim = useRef(new Animated.Value(0)).current;
  const [xpGainAmount, setXpGainAmount] = useState(0); // dynamic amount


  const dynamicStyles = {
    container: {
      backgroundColor: theme.background,
    },
    title: {
      color: theme.accent,
    },
    taskText: {
      color: theme.text,
    },
    xpLabel: {
      color: theme.accent,
    },
  };

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

  const loadBosses = async () => {
    const json = await AsyncStorage.getItem('bosses');
    if (json) setBosses(JSON.parse(json));
  };

  useEffect(() => {
    loadBosses();
    loadTasks();
    loadProgress();
    console.log('🌈 Current Theme:', theme);
  }, []);

  useEffect(() => {
    const saveProgress = async () => {
      await AsyncStorage.setItem('xp', xp.toString());
      await AsyncStorage.setItem('level', level.toString());
    };
    saveProgress();
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
      bossId: selectedBossId || undefined,
    };
    const updated = [task, ...tasks];
    setTasks(updated);
    saveTasks(updated);
    setNewTask('');
  };

  const [xpAnimationRunning, setXpAnimationRunning] = useState(false);

const triggerXpAnimation = (amount: number) => {
  if (xpAnimationRunning) return;

  setXpGainAmount(amount);
  setShowXpLabel(true);
  setXpAnimationRunning(true);
  xpAnim.setValue(0);

  Animated.timing(xpAnim, {
    toValue: 1,
    duration: 800,
    useNativeDriver: true,
  }).start(() => {
    setShowXpLabel(false);
    setXpAnimationRunning(false);
  });
};
  

  const updateBossProgress = async (bossId: string, increment: number = 10) => {
    const json = await AsyncStorage.getItem('bosses');
    if (!json) return;

    const bosses: Boss[] = JSON.parse(json);
    const updated = bosses.map((b) => {
      if (b.id === bossId) {
        const newProgress = Math.min(100, b.progress + increment);
        const defeated = newProgress >= 100;
        if (defeated && !b.isDefeated) {
          setShowBossVictory(true);
          setTimeout(() => setShowBossVictory(false), 1000);

          // Optional: XP boost reward
          setXp((prev) => prev + 50);

          Alert.alert('👑 Boss Defeated!', `"${b.title}" has been conquered! +50 XP`);
        }
        return { ...b, progress: newProgress, isDefeated: defeated };
      }
      return b;
    });

    await AsyncStorage.setItem('bosses', JSON.stringify(updated));
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
const bonusAmount = applyClassBonus(task, baseXp, playerClass);
const newXp = xp + bonusAmount;
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
          setTimeout(() => setShowStreakBonus(false), 1000);
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
          setLevel((prevLevel) => {
            const newLevel = prevLevel + 1;
            Alert.alert('Level Up!', `You're now Level ${newLevel}! 🎉`);
            return newLevel;
          });
        }, 2000);
      } else {
        setXp(newXp);
        if (bonusAmount > 0) {
          triggerXpAnimation(bonusAmount);
        }
      }
    }

    setTasks(updatedTasks);
    saveTasks(updatedTasks);
    if (updatedTask.bossId && updatedTask.completed) {
      await updateBossProgress(updatedTask.bossId, 10);
    }
  };


  return (

    <View style={[styles.container]}>
      {showXpLabel && (
      <Animated.Text
        style={[
          {
            position: 'absolute',
            top: 90,
            alignSelf: 'center',
            fontSize: 20,
            fontWeight: 'bold',
            color: theme.accent,
            zIndex: 10,
          },
          {
            opacity: xpAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [1, 0],
            }),
            transform: [
              {
                translateY: xpAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, -40],
                }),
              },
            ],
          },
        ]}
      >
        +{xpGainAmount} XP
      </Animated.Text>
    )}
      <Text style={[styles.title]}>🎯 Daily Missions</Text>
      <Text style={[styles.streakText]}>🔥 Streak: {streak} days</Text>
      <View style={styles.xpContainer}>
        <Text style={[styles.xpLabel]}>Level {level} - XP: {xp}/{getXpForLevel(level)}</Text>
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
      {showBossVictory && (
        <LottieView
          source={require('../assets/lotties/boss-defeated.json')}
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
      <Picker
        selectedValue={selectedBossId}
        onValueChange={(value) => setSelectedBossId(value)}
        style={{ backgroundColor: '#1a1a2e', color: '#fff', marginBottom: 12 }}
      >
        <Picker.Item label="🔓 No Boss" value={null} />

        {bosses
          .filter((boss) => !boss.isDefeated)
          .sort((a, b) => a.title.localeCompare(b.title))
          .map((boss) => (
            <Picker.Item
              key={boss.id}
              label={`🧠 ${boss.title}`}
              value={boss.id}
            />
          ))}
      </Picker>

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
            <Text style={[styles.taskText, dynamicStyles.taskText]}>
              {item.completed ? '✅ ' : '🕹️ '} {item.title}
            </Text>
            {item.bossId && (() => {
              const boss = bosses.find((b) => b.id === item.bossId);
              if (!boss) return null;

              return (
                <TouchableOpacity onPress={() => navigation.navigate('BossDetailScreen', { bossId: boss.id })}>
                  <Text style={styles.bossLabel}>
                    🔗 {boss.title} — {boss.progress}% {boss.isDefeated ? '✅' : ''}
                  </Text>
                </TouchableOpacity>
              );
            })()}
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const makeStyles = (theme: typeof themes.default) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
      padding: 20,
      paddingTop: 60,
    },
    title: {
      fontSize: 24,
      color: theme.accent,
      marginBottom: 10,
      fontWeight: 'bold',
    },
    xpContainer: {
      marginBottom: 20,
    },
    xpLabel: {
      color: theme.accent,
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
      backgroundColor: `${theme.accent}44`,
      shadowColor: theme.accent,
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
      backgroundColor: '#1f1f2e', // You can change this to theme-based if desired
      padding: 10,
      color: theme.text,
      borderRadius: 8,
      marginRight: 8,
    },
    taskItem: {
      padding: 12,
      backgroundColor: '#1a1a2e', // Optional: make this theme.secondaryBackground
      borderRadius: 8,
      marginBottom: 10,
    },
    completedTask: {
      backgroundColor: '#14213d',
      opacity: 0.6,
    },
    taskText: {
      color: theme.text,
      fontSize: 16,
    },
    streakText: {
      color: '#ff4d6d', // streak color is special so you may leave this fixed
      fontSize: 16,
      marginBottom: 10,
      textAlign: 'center',
      fontWeight: '600',
    },
    bossLabel: {
      color: '#aaa', // Optional: could create theme.subText if needed
      fontSize: 12,
      marginTop: 4,
      fontStyle: 'italic',
    },
  });
