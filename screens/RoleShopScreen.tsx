import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, Image } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../utils/navigation';
import { classes as playerClasses, CLASS_SWITCH_COST } from '../utils/classes';
import { useTheme } from '../contexts/ThemeContext';
import { Asset } from 'expo-asset';

type RoleShopScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'RoleShopScreen'>;
};

export default function RoleShopScreen({ navigation }: RoleShopScreenProps) {
  const [currentClass, setCurrentClass] = useState('');
  const [totalXp, setTotalXp] = useState(0);
  const [ready, setReady] = useState(false);
  const { theme } = useTheme();

  useEffect(() => {
    const init = async () => {
      const storedClass = await AsyncStorage.getItem('playerClass');
      const storedTotalXp = await AsyncStorage.getItem('totalXp');

      if (storedClass) setCurrentClass(storedClass);
      if (storedTotalXp) setTotalXp(parseInt(storedTotalXp));

      // Preload all NPC avatars
      const avatarAssets = playerClasses.map((cls) =>
        Asset.fromModule(cls.npc.avatar).downloadAsync()
      );
      await Promise.all(avatarAssets);

      setReady(true);
    };

    init();
  }, []);

  const addHistory = async (item: { date: string; type: 'class' | 'quest' | 'boss' | 'reward'; description: string; details?: any }) => {
    const existing = JSON.parse(await AsyncStorage.getItem('activityHistory') || '[]');
    existing.push(item);
    await AsyncStorage.setItem('activityHistory', JSON.stringify(existing));
  };

  const handleClassSwitch = async (newClassId: string) => {
    if (newClassId === currentClass) return;

    if (totalXp < CLASS_SWITCH_COST) {
      Alert.alert('Not enough XP', `You need ${CLASS_SWITCH_COST} XP to change your class.`);
      return;
    }

    Alert.alert(
      'Confirm Switch',
      `Change to ${newClassId}? This will cost ${CLASS_SWITCH_COST} XP.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          onPress: async () => {
            const newTotalXp = totalXp - CLASS_SWITCH_COST;
            setTotalXp(newTotalXp);
            setCurrentClass(newClassId);

            await AsyncStorage.setItem('totalXp', newTotalXp.toString());
            await AsyncStorage.setItem('playerClass', newClassId);

            await addHistory({
              date: new Date().toISOString(),
              type: 'class',
              description: `Switched to ${newClassId}`,
              details: { classId: newClassId },
            });

            Alert.alert('Class changed!', `You are now a ${newClassId}.`);
            navigation.goBack();
          },
        },
      ]
    );
  };

  if (!ready) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.accent} />
        <Text style={[styles.loadingText, { color: theme.accent }]}>Loading roles...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Text style={[styles.title, { color: theme.accent }]}>🧬 Switch Your Role</Text>
      <Text style={[styles.current, { color: theme.text }]}>
        Current: {currentClass || 'Unknown'} | Total XP: {totalXp}
      </Text>

      {playerClasses.map((cls) => {
        const isLocked = cls.locked === true;
        return (
          <TouchableOpacity
            key={cls.id}
            style={[
              styles.card(theme),
              cls.id === currentClass && styles.disabled,
              isLocked && styles.lockedCard,
            ]}
            onPress={() => {
              if (!isLocked && cls.id !== currentClass) {
                handleClassSwitch(cls.id);
              }
            }}
            disabled={isLocked || cls.id === currentClass}
          >
            <View style={styles.row}>
              <Image source={cls.npc.avatar} style={styles.avatar} />
              <Text style={[styles.name, { color: theme.accent }]}>{cls.name}</Text>
            </View>

            <Text style={[styles.bonus, { color: theme.text }]}>{cls.bonus}</Text>
            <Text style={[styles.lore, { color: theme.text }]}>{cls.lore}</Text>

            {isLocked && (
              <Text style={[styles.lockedLabel, { color: '#ff4d4d' }]}>
                🔒 Unlock at 17-day streak
              </Text>
            )}
            {cls.id === currentClass && !isLocked && (
              <Text style={[styles.currentLabel, { color: theme.accent }]}>
                ✅ Currently Equipped
              </Text>
            )}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, paddingTop: 60 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 12, fontSize: 16 },
  title: { fontSize: 22, fontWeight: 'bold', textAlign: 'center', marginBottom: 16 },
  current: { textAlign: 'center', marginBottom: 24 },
  card: (theme) => ({
    backgroundColor: theme.background,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: `${theme.accent}66`,
  }),
  disabled: { opacity: 0.4 },
  name: { fontSize: 18, fontWeight: '600' },
  bonus: { fontStyle: 'italic', margin: 6 },
  lore: { fontSize: 14, marginTop: 4 },
  lockedCard: { opacity: 0.3, borderColor: '#555' },
  lockedLabel: { marginTop: 6, fontWeight: '600', textAlign: 'center' },
  currentLabel: { fontSize: 12, marginTop: 6 },
  row: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  avatar: { width: 48, height: 48, marginRight: 10, resizeMode: 'contain' },
});
