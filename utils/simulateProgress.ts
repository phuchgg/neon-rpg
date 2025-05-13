import AsyncStorage from '@react-native-async-storage/async-storage';
import { initialSimPlayers } from './simulatedPlayers';

export const simulateDailyProgress = async () => {
  const stored = await AsyncStorage.getItem('simPlayers');
  const players = stored ? JSON.parse(stored) : initialSimPlayers;

  const updatedPlayers = players.map((p) => {
    const xpGain = Math.floor(Math.random() * 50); // Gain 0-50 XP
    const tasksGain = Math.floor(Math.random() * 5); // Complete 0-5 tasks

    // ✅ Simulate boss defeat chance (10%)
    const defeatedBoss = Math.random() < 0.1 ? 1 : 0;

    return {
      ...p,
      xp: p.xp + xpGain,
      tasksCompleted: p.tasksCompleted + tasksGain,
      bossesDefeated: (p.bossesDefeated || 0) + defeatedBoss,
    };
  });

  await AsyncStorage.setItem('simPlayers', JSON.stringify(updatedPlayers));
};

