import AsyncStorage from '@react-native-async-storage/async-storage';
import { Quest } from '../utils/type';
import { XPManager } from './XPManager';

export const updateQuestProgress = async (type: 'task' | 'boss') => {
  const dailyKey = `quests_Daily`;
  const weeklyKey = `quests_Weekly`;

  const allKeys = [dailyKey, weeklyKey];

  for (const key of allKeys) {
    const json = await AsyncStorage.getItem(key);
    if (!json) continue;

    let quests: Quest[] = JSON.parse(json);
    let updated = false;

    quests = await Promise.all(
      quests.map(async (quest) => {
        if (quest.type !== type || quest.isComplete) return quest;

        const current = quest.condition.current + 1;
        const progress = Math.min((current / quest.condition.target) * 100, 100);
        const isComplete = current >= quest.condition.target;

        if (isComplete) {
          await XPManager.addXp(quest.rewardXp);
          const totalXp = await XPManager.getTotalXp();
          await AsyncStorage.setItem('totalXp', totalXp.toString());
        }

        updated = true;
        return { ...quest, condition: { ...quest.condition, current }, progress, isComplete };
      })
    );

    if (updated) {
      await AsyncStorage.setItem(key, JSON.stringify(quests));
    }
  }
};
