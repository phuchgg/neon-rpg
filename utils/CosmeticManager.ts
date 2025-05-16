// utils/CosmeticManager.ts
import AsyncStorage from '@react-native-async-storage/async-storage';

export type EquippedCosmetics = {
  badge?: string;
  hud?: string;
  pet?: string;
};

const BADGE_KEY = 'equippedBadge';
const HUD_KEY = 'equippedHud';

export const CosmeticManager = {
  async getEquippedCosmetics() {
    const badge = await AsyncStorage.getItem('equippedBadge');
    const hud = await AsyncStorage.getItem('equippedHud');
    const pet = await AsyncStorage.getItem('equippedPet'); // <-- ADD THIS
    return { badge, hud, pet }; // <-- ADD pet here
  },

  async setEquippedBadge(badgeId: string) {
    await AsyncStorage.setItem('equippedBadge', badgeId);
  },

  async setEquippedHud(hudId: string) {
    await AsyncStorage.setItem('equippedHud', hudId);
  },

  async setEquippedPet(petId: string) { // <-- ADD THIS
    await AsyncStorage.setItem('equippedPet', petId);
  },
};

