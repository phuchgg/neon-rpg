import AsyncStorage from '@react-native-async-storage/async-storage';

export const XPManager = {
  // Get current level XP
  getXp: async (): Promise<number> => {
    const xp = await AsyncStorage.getItem('xp');
    return xp ? parseInt(xp) : 0;
  },

  // Get total lifetime XP (for statistics, not just leveling)
  getTotalXp: async (): Promise<number> => {
    const totalXp = await AsyncStorage.getItem('totalXp');
    return totalXp ? parseInt(totalXp) : 0;
  },

  // Add XP to both current level and total XP bank
  addXp: async (amount: number): Promise<void> => {
    const currentXp = await XPManager.getXp();
    const totalXp = await XPManager.getTotalXp();
    const level = await XPManager.getLevel();

    const newXp = currentXp + amount;
    const newTotalXp = totalXp + amount;

    await AsyncStorage.setItem('xp', newXp.toString());
    await AsyncStorage.setItem('totalXp', newTotalXp.toString());

    await XPManager.updateLevel(newXp, level);
  },

  // Spend XP (from current level XP only)
  spendXp: async (amount: number): Promise<boolean> => {
    const currentXp = await XPManager.getXp();
    if (currentXp < amount) return false;

    const newXp = currentXp - amount;
    await AsyncStorage.setItem('xp', newXp.toString());
    return true;
  },

  // Get XP needed for next level
  getXpForLevel: (level: number): number => {
    return 100 + (level - 1) * 20;
  },

  // Get current level
  getLevel: async (): Promise<number> => {
    const level = await AsyncStorage.getItem('level');
    return level ? parseInt(level) : 1;
  },

  // Handle level up if XP exceeds threshold
  updateLevel: async (xp: number, currentLevel: number): Promise<void> => {
    let level = currentLevel;
    let xpForNextLevel = XPManager.getXpForLevel(level);

    while (xp >= xpForNextLevel) {
      xp -= xpForNextLevel;
      level += 1;
      xpForNextLevel = XPManager.getXpForLevel(level);

      // 🎉 Level up feedback here if needed (UI call)
      console.log(`Level up! Now level ${level}`);
    }

    await AsyncStorage.setItem('xp', xp.toString());
    await AsyncStorage.setItem('level', level.toString());
  },
};
