import AsyncStorage from '@react-native-async-storage/async-storage';

export const XPManager = {
  getXp: async (): Promise<number> => {
    const xp = await AsyncStorage.getItem('xp');
    return xp ? parseInt(xp) : 0;
  },

  getTotalXp: async (): Promise<number> => {
    const totalXp = await AsyncStorage.getItem('totalXp');
    return totalXp ? parseInt(totalXp) : 0;
  },

  getTotalXpBank: async (): Promise<number> => {
    const bank = await AsyncStorage.getItem('totalXpBank');
    return bank ? parseInt(bank) : 0;
  },

  addXp: async (amount: number): Promise<void> => {
    const currentXp = await XPManager.getXp();
    const totalXp = await XPManager.getTotalXp();
    const totalXpBank = await XPManager.getTotalXpBank();
    const level = await XPManager.getLevel();

    const newXp = currentXp + amount;
    const newTotalXp = totalXp + amount;
    const newTotalXpBank = totalXpBank + amount;

    await AsyncStorage.setItem('xp', newXp.toString());
    await AsyncStorage.setItem('totalXp', newTotalXp.toString());
    await AsyncStorage.setItem('totalXpBank', newTotalXpBank.toString());

    await XPManager.updateLevel(newXp, level);
  },

  spendXpBank: async (amount: number): Promise<boolean> => {
    const bank = await XPManager.getTotalXpBank();
    if (bank < amount) return false;

    const newBank = bank - amount;
    await AsyncStorage.setItem('totalXpBank', newBank.toString());
    return true;
  },

  getLevel: async (): Promise<number> => {
    const level = await AsyncStorage.getItem('level');
    return level ? parseInt(level) : 1;
  },

  setXp: async (amount: number): Promise<void> => {
  await AsyncStorage.setItem('xp', amount.toString());
},

  updateLevel: async (xp: number, currentLevel: number): Promise<void> => {
    let level = currentLevel;
    let xpForNext = 100 + (level - 1) * 20;

    while (xp >= xpForNext) {
      xp -= xpForNext;
      level++;
      xpForNext = 100 + (level - 1) * 20;
    }

    await AsyncStorage.setItem('xp', xp.toString());
    await AsyncStorage.setItem('level', level.toString());
  },
};
