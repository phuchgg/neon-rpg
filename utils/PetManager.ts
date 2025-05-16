import AsyncStorage from '@react-native-async-storage/async-storage';

export const PetManager = {
  getEquippedPet: async (): Promise<string | null> => {
    return await AsyncStorage.getItem('equippedPet');
  },

  setEquippedPet: async (petId: string | null) => {
    if (petId) {
      await AsyncStorage.setItem('equippedPet', petId);
    } else {
      await AsyncStorage.removeItem('equippedPet');
    }
  },
};
