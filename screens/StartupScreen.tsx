import React, { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet, Text } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../utils/navigation';
import { CosmeticManager } from '../utils/CosmeticManager';

type StartupNav = NativeStackNavigationProp<RootStackParamList, 'StartupScreen'>;

export default function StartupScreen() {
  const navigation = useNavigation<StartupNav>();

  const preloadCosmetics = async () => {
    const { badge, pet, hud } = await CosmeticManager.getEquippedCosmetics();
    await AsyncStorage.setItem('equippedBadge', badge || '');
    await AsyncStorage.setItem('equippedPet', pet || '');
    await AsyncStorage.setItem('equippedHud', hud || '');
  };

  useEffect(() => {
    const initFlow = async () => {
      await preloadCosmetics();

      const playerClass = await AsyncStorage.getItem('playerClass');

      if (!playerClass || playerClass === 'un' || playerClass.trim() === '') {
        console.log('🎭 No class selected → going to ClassSelectScreen');
        navigation.replace('ClassSelectScreen');
      } else {
        console.log('🧠 Class exists → going to TaskScreen');
        navigation.replace('TaskScreen');
      }
    };

    initFlow();
  }, []);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#00f9ff" />
      <Text style={styles.loadingText}>Khởi động hệ thống</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0d0c1d',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    color: '#00f9ff',
    fontSize: 16,
    fontFamily: 'monospace',
  },
});
