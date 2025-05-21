import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TextInput, Button, FlatList, TouchableOpacity, StyleSheet, Alert, Animated, } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import uuid from 'react-native-uuid';
import * as Progress from 'react-native-progress';
import LottieView from 'lottie-react-native';
import { Task, Boss, Quest } from '../utils/type';
import { Picker } from '@react-native-picker/picker';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Swipeable } from 'react-native-gesture-handler';
import { useTheme } from '../contexts/ThemeContext';
import { themes } from '../utils/themes';
import { RootStackParamList } from '../utils/navigation';
import { useMemo, useRef } from 'react';
import { CosmeticManager } from '../utils/CosmeticManager';
import QuestTracker from '../contexts/QuestTracker';
import { tierDamagePercentMap } from '../utils/bossConstants';
import { useFocusEffect } from '@react-navigation/native';
import initialBosses from '../utils/initialBosses.json'; // Make sure this path is correct!
import SwipeToDeleteTaskRow from '../contexts/SwipeToDeleteTaskRow'; // adjust path if needed
import { XPManager } from '../utils/XPManager';
import eventBus from '../utils/EventBus';
import { updateQuestProgress } from '../utils/updateQuestProgress';
import { simulateDailyProgress } from '../utils/simulateProgress';
import { initialSimPlayers } from '../utils/simulatedPlayers';
import CrossPlatformPicker from '../contexts/CrossPlatformPicker';
import { Image } from 'react-native';
import AssetManager from '../utils/AssetManager';

const getXpForLevel = (level: number): number => {
  return 100 + (level - 1) * 20; // Level 1 = 100, Level 2 = 120, etc.
};

const USER_MONTHLY_PROGRESS_KEY = 'userMonthlyProgress';
const LAST_SIMULATE_TIME_KEY = 'lastSimulatedTime';

export const getBadgeImage = (badgeId: string | null) => {
  if (!badgeId) return null;

  const key = badgeId.replace('badge_', '');
  const formattedKey = key.charAt(0).toUpperCase() + key.slice(1);

  return AssetManager.Rewards[formattedKey] || null;
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
  const [selectedBossId, setSelectedBossId] = useState<string>(''); // not null
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [showBossVictory, setShowBossVictory] = useState(false);
  const { theme } = useTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);
  const [showXpLabel, setShowXpLabel] = useState(false);
  const xpAnim = useRef(new Animated.Value(0)).current;
  const [xpGainAmount, setXpGainAmount] = useState(0); // dynamic amount
  const [equippedBadge, setEquippedBadge] = useState<string | null>(null);
  const [showMapReset, setShowMapReset] = useState(false);
  const initialBossesTyped: Boss[] = initialBosses as Boss[];
  const [showDeleteNotif, setShowDeleteNotif] = useState(false);
  const [equippedHud, setEquippedHud] = useState<string | null>(null);
  const [inputFocused, setInputFocused] = useState(false);
  const [equippedPet, setEquippedPet] = useState<string | null>(null);

  const handleXpGain = async (amount: number) => {
    const getPetBonus = () => {
      if (equippedPet === 'pet_cyberfox') return 0.05;
      if (equippedPet === 'pet_nightwave') return 0.03;
      return 0;
    };

    const bonusMultiplier = getPetBonus();
    const finalXp = Math.floor(amount * (1 + bonusMultiplier));
    await XPManager.addXp(amount);
    const updatedXp = await XPManager.getXp();
    const updatedLevel = await XPManager.getLevel();

    setXp(updatedXp);
    setLevel(updatedLevel);

    // Cộng dồn XP tháng
    await updateUserMonthlyProgress(0, 0, amount);

    if (amount > 0) triggerXpAnimation(amount);

    if (updatedLevel > level) {
      setShowLottie(true);
      setTimeout(() => {
        setShowLottie(false);
        Alert.alert('Level Up!', `You're now Level ${updatedLevel}! 🎉`);
      }, 2000);
    }
  };




  const clearAllGameData = async () => {
  try {
    const allKeys = await AsyncStorage.getAllKeys();

    // All known fixed keys in the system
    const staticKeys = [
      'rpgSaveData',
      'xp',
      'level',
      'tasks',
      'bosses',
      'quests',
      'streakCount',
      'lastActiveDate',
      'bossHistory',
      'playerClass',
      'unlockedRewards',
      'equippedCosmetics',
      'questHistory',
      'questStreak',
      'lastQuestDate',
      'edgewalkerUnlocked',
      'equippedBadge',
      'equippedHud',
      'equippedPet',
      'simPlayers',
      'userMonthlyProgress',
      'lastSimulatedTime',
    ];

    // Prefixes to catch all dynamic/generated keys
    const dynamicPrefixes = [
      'tasks_',
      'bosses_',
      'quests_',
      'activityHistory',
      'classStreak_',
      'rewardStore_',
      'cosmetics_',
      'classQuest_',     // daily class quest keys
      'classQuest_',     // completion flags (_done)
    ];

    // Find keys that match any of the dynamic prefixes
    const dynamicKeys = allKeys.filter((key) =>
      dynamicPrefixes.some((prefix) => key.startsWith(prefix))
    );

    const keysToRemove = [...new Set([...staticKeys, ...dynamicKeys])];

    if (keysToRemove.length > 0) {
      await AsyncStorage.multiRemove(keysToRemove);
      setEquippedBadge(null);
      Alert.alert('🗑️ Data Cleared', `${keysToRemove.length} keys removed. All game data wiped.`);
      console.log('🧹 Cleared keys:', keysToRemove);
    } else {
      Alert.alert('✅ Nothing to clear', 'No game data found in AsyncStorage.');
    }
  } catch (error) {
    console.error('Error clearing game data:', error);
    Alert.alert('❌ Error', 'Failed to clear data. Check console.');
  }
};


  const resetBosses = async () => {
    await AsyncStorage.setItem('bosses', JSON.stringify(initialBossesTyped));
    setBosses(initialBossesTyped);
    console.log('🌍 Map Reset Done!');
  };

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

  useFocusEffect(
    useCallback(() => {
      const checkSimulateCooldown = async () => {
        const now = Date.now();
        const lastSimulated = parseInt(await AsyncStorage.getItem(LAST_SIMULATE_TIME_KEY) || '0');

        if (now - lastSimulated >= 2 * 60 * 60 * 1000) {
          console.log('🕒 Simulating player progress...');
          await simulateDailyProgress();
          await AsyncStorage.setItem(LAST_SIMULATE_TIME_KEY, now.toString());
        } else {
          console.log('⏳ Less than 2 hours, skip simulate');
        }
        console.log('Equipped Pet:', equippedPet);
        // Load lại dữ liệu 1 lần duy nhất
        await loadBosses();
        await loadTasks();
        await loadProgress();
      };

      checkSimulateCooldown();
    }, [])
  );


  const loadTasks = async () => {
    const json = await AsyncStorage.getItem('tasks');
    if (json) setTasks(JSON.parse(json));
  };

  const loadProgress = async () => {
    const savedXp = await XPManager.getXp();
    const savedLevel = await XPManager.getLevel();
    const savedStreak = await AsyncStorage.getItem('streakCount');

    setXp(savedXp);
    setLevel(savedLevel);
    if (savedStreak) setStreak(parseInt(savedStreak));
  };

  const saveTasks = async (updated: Task[]) => {
    await AsyncStorage.setItem('tasks', JSON.stringify(updated));
  };

  const updateUserMonthlyProgress = async (tasks = 0, bosses = 0, xpGain = 0) => {
    const stored = await AsyncStorage.getItem(USER_MONTHLY_PROGRESS_KEY);
    const progress = stored ? JSON.parse(stored) : { tasksCompleted: 0, bossesDefeated: 0, monthlyXp: 0 };

    const updated = {
      tasksCompleted: progress.tasksCompleted + tasks,
      bossesDefeated: progress.bossesDefeated + bosses,
      monthlyXp: progress.monthlyXp + xpGain,
    };

    await AsyncStorage.setItem(USER_MONTHLY_PROGRESS_KEY, JSON.stringify(updated));
  };



  useEffect(() => {
    const initializeSimPlayers = async () => {
      const existing = await AsyncStorage.getItem('simPlayers');
      if (!existing) {
        await AsyncStorage.setItem('simPlayers', JSON.stringify(initialSimPlayers));
        console.log('📦 SimPlayers initialized');
      }
    };
    initializeSimPlayers();
  }, []);


  useEffect(() => {
    const loadEquippedBadge = async () => {
      const equipped = await AsyncStorage.getItem('equippedBadge');
      setEquippedBadge(equipped || null);
    };

    eventBus.on('cosmeticUpdated', loadEquippedBadge);

    loadEquippedBadge(); // load once on mount

    return () => {
      eventBus.off('cosmeticUpdated', loadEquippedBadge);
    };
  }, []);

  useEffect(() => {
  const loadEquippedCosmetics = async () => {
    const { badge, pet, hud } = await CosmeticManager.getEquippedCosmetics();
    setEquippedBadge(badge || null);
    setEquippedPet(pet || null);
    setEquippedHud(hud || null);
  };

  loadEquippedCosmetics();

  eventBus.on('cosmeticUpdated', loadEquippedCosmetics);

  return () => {
    eventBus.off('cosmeticUpdated', loadEquippedCosmetics);
  };
}, []);




  const addTask = () => {
    if (!newTask.trim()) {
      Alert.alert('⚠️ Oops!', 'Task name cannot be empty.');
      return;
    }
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
  const isBossUnlocked = (boss: Boss, allBosses: Boss[]): boolean => {
    if (!boss.unlockAfter || boss.unlockAfter.length === 0) return true;

    return boss.unlockAfter.every((depId) =>
      allBosses.find((b) => b.id === depId && b.isDefeated)
    );
  };


  const updateBossProgress = async (bossId: string, increment: number = 10) => {
    const json = await AsyncStorage.getItem('bosses');
    if (!json) return;

    const bosses: Boss[] = JSON.parse(json);
    const updated = await Promise.all(bosses.map(async (b) => {
      if (b.id === bossId) {
        const damagePercent = tierDamagePercentMap[b.tier] || 1; // ✅ Boss takes 1% damage per task completion

        const damage = b.totalXp * (damagePercent / 100);
        const newXpRemaining = Math.max(0, b.xpRemaining - damage);
        const newProgress = Math.min(100, ((b.totalXp - newXpRemaining) / b.totalXp) * 100);
        const defeated = newXpRemaining <= 0;
        const fixedProgress = parseFloat(newProgress.toFixed(2));


        if (defeated && !b.isDefeated) {
          setShowBossVictory(true);
          await updateQuestProgress('boss');
          await handleXpGain(50);

          setTimeout(() => setShowBossVictory(false), 1000);
          Alert.alert('👑 Boss Defeated!', `"${b.title}" has been conquered! +50 XP`);
          // ✅ Add to activity history timeline
          const activityHistory = JSON.parse(await AsyncStorage.getItem('activityHistory') || '[]');
          activityHistory.push({
            date: new Date().toISOString(),
            type: 'boss',
            description: `Defeated boss: ${b.title}`,
            details: { bossId: b.id },
          });
          await AsyncStorage.setItem('activityHistory', JSON.stringify(activityHistory));

          await updateUserMonthlyProgress(0, 1);
        }


        const defeatedCount = bosses.filter((b) => b.isDefeated).length + 1; // +1 includes current defeat
        console.log('💥 Total Defeated Bosses:', defeatedCount);

        if (defeatedCount >= 5) {
          await resetBosses();
        }
        setShowMapReset(true);
        setTimeout(() => setShowMapReset(false), 2000);

        // 🎯 Boss History Tracking
        const playerClass = await AsyncStorage.getItem('playerClass');
        const history = JSON.parse(await AsyncStorage.getItem('bossHistory') || '[]');

        history.push({
          id: b.id,
          title: b.title,
          defeatedAt: new Date().toISOString(),
          xpEarned: 50,
          playerClass: playerClass || 'Unknown'
        });

        await AsyncStorage.setItem('bossHistory', JSON.stringify(history));
        console.log('🗂️ Boss History Updated:', b.title);
        return { ...b, xpRemaining: newXpRemaining, progress: newProgress, isDefeated: defeated };

      }

      return b;
    }));

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

      await handleXpGain(bonusAmount);

      const today = new Date().toISOString().split('T')[0];
      const lastDate = await AsyncStorage.getItem('lastActiveDate');
      const storedStreak = await AsyncStorage.getItem('streakCount');
      const streakValue = storedStreak ? parseInt(storedStreak) : 0;
      await updateQuestProgress('task');
      await updateUserMonthlyProgress(1, 0);
      await loadBosses();

      if (lastDate !== today) {
        const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
        let updatedStreak = 1;

        if (lastDate === yesterday) {
          updatedStreak = streakValue + 1;
        }
        setStreak(updatedStreak);
        await AsyncStorage.setItem('streakCount', updatedStreak.toString());
        await AsyncStorage.setItem('lastActiveDate', today);

        if (updatedStreak === 3) {
          await handleXpGain(50);
          setShowStreakBonus(true);
          setTimeout(() => setShowStreakBonus(false), 1000);
        }

        if (updatedStreak === 7) {
          Alert.alert('🔥 Badge Unlocked!', 'You earned a glowing streak badge! (Future quest)');
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
      <View style={{ marginBottom: 20 }}>

        {/* Row: Pet | Streak | Badge */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 10,
            paddingHorizontal: 20,
          }}
        >
          {/* Pet Container or Placeholder */}
          <View style={{ width: 40, height: 40, marginRight: 12, justifyContent: 'center', alignItems: 'center' }}>
            {equippedPet ? (
              <View
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 50,
                  overflow: 'hidden',
                  backgroundColor: `${theme.accent}22`,
                  borderWidth: 1,
                  borderColor: theme.accent,
                  justifyContent: 'center',
                  alignItems: 'center',
                  shadowColor: theme.accent,
                  shadowOffset: { width: 0, height: 0 },
                  shadowOpacity: 0.8,
                  shadowRadius: 10,
                  padding: 4,
            
                }}
              >
                <Image
                  source={AssetManager.Pets[equippedPet.replace('pet_', '')]}
                  style={{ width: 30, height: 30 }}
                  resizeMode="contain"
                />
              </View>
            ) : null}
          </View>

          {/* Streak Text */}
          <Text
            style={{
              color: '#ff4d6d',
              fontSize: 16,
              fontWeight: '600',
              textAlign: 'center',
              marginHorizontal: 12,
            }}
          >
            🔥 Streak: {streak} days
          </Text>

          {/* Badge Container or Placeholder */}
          <View style={{ width: 40, height: 40, marginLeft: 12, justifyContent: 'center', alignItems: 'center' }}>
            {equippedBadge && equippedBadge !== 'badge_default' ? (
              <View
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 50,
                  overflow: 'hidden',
                  backgroundColor: `${theme.accent}22`,
                  borderWidth: 1,
                  borderColor: theme.accent,
                  justifyContent: 'center',
                  alignItems: 'center',
                  shadowColor: theme.accent,
                  shadowOffset: { width: 0, height: 0 },
                  shadowOpacity: 0.8,
                  shadowRadius: 10,
                  padding: 4,
                }}
              >
                <Image
                  source={getBadgeImage(equippedBadge)}
                  style={{ width: 30, height: 30 }}
                  resizeMode="contain"
                />
              </View>
            ) : null}
          </View>
        </View>


        {/* Level Text */}
        <Text style={{
  color: theme.accent,
  fontSize: 16,
  fontWeight: '600',
  textAlign: 'center',
  marginBottom: 6,
  letterSpacing: 0.5,
}}>
  Level {level} — {xp}/{getXpForLevel(level)} XP
</Text>

        {/* XP Progress Bar */}
        <View style={{
          position: 'relative',
          width: '100%',
          height: 16,
          justifyContent: 'center',
        }}>
          <Progress.Bar
            progress={xp / getXpForLevel(level)}
            width={null}
            height={16}
            borderRadius={12}
            color={theme.accent}
            unfilledColor="#1a1a1a"
            borderWidth={0}
          />
          <View style={{
            ...StyleSheet.absoluteFillObject,
            borderRadius: 12,
            backgroundColor: `${theme.accent}44`,
            shadowColor: theme.accent,
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 0.8,
            shadowRadius: 10,
          }} />
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
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 }}>
        <TouchableOpacity onPress={() => navigation.navigate('BossMapScreen')} style={styles.navButton}>
          <Image source={AssetManager.Buttons.BossMap} style={styles.iconImage} />
          <Text style={styles.navButtonText}>Boss Map</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('RewardStoreScreen')} style={styles.navButton}>
          <Image source={AssetManager.Buttons.RewardStore} style={styles.iconImage} />
          <Text style={styles.navButtonText}>Reward Store</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('RoleShopScreen')} style={styles.navButton}>
          <Image source={AssetManager.Buttons.RoleShop} style={styles.iconImage} />
          <Text style={styles.navButtonText}>Role Shop</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.navRow}>
        <TouchableOpacity onPress={() => navigation.navigate('QuestJournalScreen')} style={styles.navButton}>
          <Image source={AssetManager.Buttons.QuestJournal} style={styles.iconImage} />
          <Text style={styles.navButtonText}>Quest Journal</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('ActivityHistoryScreen')} style={styles.navButton}>
          <Image source={AssetManager.Buttons.History} style={styles.iconImage} />
          <Text style={styles.navButtonText}>History</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('ClassQuestScreen')} style={styles.navButton}>
          <Image source={AssetManager.Buttons.ClassQuest} style={styles.iconImage} />
          <Text style={styles.navButtonText}>Class Quests</Text>
        </TouchableOpacity>
      </View>




      <View style={styles.inputContainer}>
        <View style={{ flex: 1 }}>
          <TextInput
            style={[
              styles.input,
              inputFocused && styles.inputFocused
            ]}
            placeholder="Type your task..."
            placeholderTextColor="#AAAAAA"
            value={newTask}
            onChangeText={setNewTask}
            onFocus={() => setInputFocused(true)}
            onBlur={() => setInputFocused(false)}
          />
        </View>


        <TouchableOpacity onPress={addTask} style={styles.addButton}>
          <Text style={styles.addButtonText}>Add Task</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.bossAssignContainer}>
        <Text style={styles.bossAssignLabel}>Assign Task to Boss</Text>
        <CrossPlatformPicker
          selectedValue={selectedBossId}
          onValueChange={(value) => setSelectedBossId(value)}
          theme={theme}
          style={styles.bossAssignPicker}
          options={[
            { label: 'No Boss', value: '', icon: null },
            ...bosses
              .filter((boss) => !boss.isDefeated && isBossUnlocked(boss, bosses))
              .sort((a, b) => a.title.localeCompare(b.title))
              .map((boss) => ({
                label: boss.title,
                value: boss.id,
                icon: AssetManager.BossIcons[boss.tier] || AssetManager.BossIcons.mini,
              })),
          ]}

        />
      </View>


      <FlatList
        data={tasks}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <SwipeToDeleteTaskRow
            item={item}
            bosses={bosses}
            onToggleTask={async (taskId) => {
              await toggleTask(taskId);
              await loadBosses();
            }}
            onDeleteTask={(id) => {
              const updated = tasks.filter((t) => t.id !== id);
              setTasks(updated);
              saveTasks(updated);
            }}
            theme={theme}
          />
        )}
        contentContainerStyle={{ paddingBottom: 40 }}
        style={{ flex: 1 }}
      />
      {equippedHud && (
        <View style={{
          position: 'absolute', top: 70, right: 20, backgroundColor: '#1a1a2e', padding: 8, shadowColor: theme.accent,
shadowOpacity: 0.8,
shadowRadius: 10,
elevation: 5,
          borderRadius: 30, borderColor: '#00f9ff', borderWidth: 1, zIndex: 10
        }}>
          <Text style={{ fontSize: 20, color: '#fff' }}>{equippedHud === 'hud_neon' ? '🖥️' : '🧬'}</Text>
        </View>
      )}
      {showDeleteNotif && (
        <View style={styles.snackbar}>
          <Text style={styles.snackbarText}>Task deleted ✅</Text>
        </View>
      )}

      {/* Nút Leaderboard 🏅 */}
      <TouchableOpacity
        style={styles.leaderboardButton}
        onPress={() => navigation.navigate('LeaderboardScreen')}
      >
        <Image source={AssetManager.Buttons.Leaderboard} style={styles.leaderboardIcon} />
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.resetButton}
        onPress={clearAllGameData}
      >
        <Text style={styles.resetButtonText}>🗑️ Reset Game Data</Text>
      </TouchableOpacity>
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
      color: theme.text,
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
  backgroundColor: `${theme.accent}33`,
  shadowColor: theme.accent,
  shadowOffset: { width: 0, height: 0 },
  shadowOpacity: 0.9,
  shadowRadius: 12,
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
      color: theme.text,
      borderRadius: 8,
      marginRight: 8,
      borderWidth: 1,
      borderColor: '#2a2a3d',
    },
    taskItem: {
      padding: 12,
      backgroundColor: '#1a1a2e', // Optional: make this theme.secondaryBackground
      borderRadius: 8,
      marginBottom: 10
    },
    completedTask: {
      backgroundColor: '#14213d',
      opacity: 0.6,
    },
    taskText: {
      color: 'theme.text',
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
    badgeContainer: {
      position: 'absolute',
      top: 20,
      right: 20,
      backgroundColor: '#1a1a2e',
      padding: 8,
      borderRadius: 30,
      borderColor: '#00f9ff',
      borderWidth: 1,
      shadowColor: '#00f9ff',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.8,
      shadowRadius: 6,
    },

    badgeText: {
      fontSize: 20,
      color: '#fff',
    },
    addButton: {
      backgroundColor: `${theme.accent}33`,
shadowColor: theme.accent,
shadowOffset: { width: 0, height: 1 },
shadowOpacity: 0.5,
shadowRadius: 5,
      padding: 10,
      borderRadius: 8,
      marginLeft: 8,
      justifyContent: 'center',
    },
    addButtonText: {
      color: theme.accent,
      fontWeight: '600',
    },
    navButton: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.background,
      paddingVertical: 4,
      paddingHorizontal: 12,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: theme.accent,
      marginHorizontal: 4,
    },
    navButtonText: {
      color: theme.text,
      fontWeight: 'bold',
      fontSize: 12,
    },
    clearButton: {
      backgroundColor: '#ff4d4d',
      padding: 10,
      borderRadius: 8,
      marginTop: 20,
      alignItems: 'center',
    },
    clearButtonText: {
      color: '#fff',
      fontWeight: 'bold',
    },
    deleteButtonText: {
      color: '#fff',
      fontWeight: 'bold',
    },
    snackbar: {
      position: 'absolute',
      bottom: 30,
      left: 20,
      right: 10,
      backgroundColor: '#1a1a2e',
      borderRadius: 10,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 12,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3,
      shadowRadius: 4,
      borderColor: '#00f9ff',
      borderWidth: 1,
    },
    snackbarText: {
      color: '#00f9ff',
      fontSize: 14,
      fontWeight: '600',
    },
    taskRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 10,
      paddingHorizontal: 12,
      backgroundColor: '#1a1a2e',
      borderRadius: 8,
      marginBottom: 10,
      overflow: 'hidden'
    },
    inlineDeleteButton: {
      backgroundColor: '#ff4d4d',
      paddingVertical: 6,
      paddingHorizontal: 12,
      borderRadius: 8,
      marginLeft: 10,
    },

    taskContent: {
      flex: 1,
      paddingHorizontal: 12,
      justifyContent: 'center',
    },
    swipeDeleteButton: {
      backgroundColor: '#ff4d4d',
      justifyContent: 'center',
      alignItems: 'center',
      width: 80,
      height: '100%',
    },
    swipeDeleteText: {
      color: '#fff',
      fontWeight: 'bold',
    },
    questProgressBox: {
      marginBottom: 12,
      padding: 10,
      backgroundColor: '#1a1a2e',
      borderRadius: 10,
      borderColor: '#00f9ff55',
      borderWidth: 1,
    },
    questProgressLabel: {
      color: '#fff',
      marginBottom: 6,
      fontWeight: '600',
    },
    subheading: {
      color: '#00f9ff',
      fontSize: 16,
      fontWeight: 'bold',
      marginBottom: 10,
    },
    iconImage: {
      width: 20,
      height: 20,
      marginRight: 6,
      resizeMode: 'contain',
    },
    navRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 16,
    },

    leaderboardButton: {
      position: 'absolute',
      bottom: 30,
      right: 20,
      backgroundColor: '#00f9ff22',
      padding: 6,
      borderRadius: 30,
      borderWidth: 1,
      borderColor: theme.accent,
      shadowColor: theme.accent,
      shadowOpacity: 0.7,
      shadowRadius: 8,
      shadowOffset: { width: 0, height: 0 },
      zIndex: 100,
    },

    leaderboardIcon: {
      width: 38,
      height: 38,
      resizeMode: 'contain',
    },
    bossAssignContainer: {
  backgroundColor: '#222c3d',
  borderRadius: 12,
  padding: 12,
  marginBottom: 16,
  borderWidth: 1,
  borderColor: `${theme.accent}33`,
  shadowColor: theme.accent,
  shadowOffset: { width: 0, height: 0 },
  shadowOpacity: 0.4,
  shadowRadius: 6,
},

    bossAssignLabel: {
      color: theme.accent,
      fontSize: 14,
      fontWeight: '600',
      marginBottom: 6,
      textAlign: 'center', // ✅ Add this line
    },

    bossAssignPicker: {
      backgroundColor: '#1f2937',
      borderRadius: 8,
      borderWidth: 1,
      borderColor: `${theme.accent}44`,
    },
    inputFocused: {
  borderColor: theme.accent,
  shadowColor: theme.accent,
  shadowOffset: { width: 0, height: 0 },
  shadowOpacity: 0.7,
  shadowRadius: 8,
  elevation: 5,
},

  });
