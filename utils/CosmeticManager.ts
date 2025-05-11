// utils/CosmeticManager.ts
import AsyncStorage from '@react-native-async-storage/async-storage';

export type EquippedCosmetics = {
  badge?: string;
  hud?: string;
};

const BADGE_KEY = 'equippedBadge';
const HUD_KEY = 'equippedHud';

export const CosmeticManager = {
  async getEquippedCosmetics(): Promise<EquippedCosmetics> {
    const badge = await AsyncStorage.getItem(BADGE_KEY);
    const hud = await AsyncStorage.getItem(HUD_KEY);
    return { badge: badge ?? undefined, hud: hud ?? undefined };
  },

  async setEquippedBadge(badgeId: string) {
    await AsyncStorage.setItem(BADGE_KEY, badgeId);
  },

  async setEquippedHud(hudId: string) {
    await AsyncStorage.setItem(HUD_KEY, hudId);
  },

  async clearCosmetics() {
    await AsyncStorage.multiRemove([BADGE_KEY, HUD_KEY]);
  },
};
