import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../utils/navigation';
import { useTheme } from '../contexts/ThemeContext';
import { rewards } from '../utils/rewards';
import { CosmeticManager } from '../utils/CosmeticManager';
import { useFocusEffect } from '@react-navigation/native';
import eventBus from '../utils/EventBus';

const themePreviewMap = {
  neon_theme: { colors: ['#001b0f', '#00ffcc', '#39ff14'] },
  fire_red: { colors: ['#1a0000', '#ffe0e0', '#ff1a1a'] },
  nightwave: { colors: ['#0a0f29', '#9cd8ff', '#4f9bff'] },
  ice_pulse: { colors: ['#011f2a', '#b0faff', '#00e0ff'] },
  synthcore: { colors: ['#1b0029', '#ffb6f9', '#ff3cac'] },
};

const ThemePreviewBar = ({ colors }: { colors: string[] }) => (
  <View style={{ flexDirection: 'row', marginTop: 8, marginBottom: 4 }}>
    {colors.map((c, i) => (
      <View
        key={i}
        style={{
          flex: 1,
          height: 8,
          backgroundColor: c,
          borderTopLeftRadius: i === 0 ? 4 : 0,
          borderTopRightRadius: i === colors.length - 1 ? 4 : 0,
        }}
      />
    ))}
  </View>
);

export default function RewardStoreScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { setThemeByKey, themeKey, theme } = useTheme();
  const [unlocked, setUnlocked] = useState<string[]>([]);
  const [totalXpBank, setTotalXpBank] = useState(0);
  const [equippedBadge, setEquippedBadge] = useState<string | undefined>(undefined);
  const [equippedHud, setEquippedHud] = useState<string | null>(null);
  const addHistory = async (item: { date: string; type: 'class' | 'quest' | 'boss' | 'reward'; description: string; details?: any }) => {
    const existing = JSON.parse(await AsyncStorage.getItem('activityHistory') || '[]');
    existing.push(item);
    await AsyncStorage.setItem('activityHistory', JSON.stringify(existing));
  };
  
  const loadData = async () => {
    const savedTotalXp = await AsyncStorage.getItem('totalXp');
    const savedRewards = await AsyncStorage.getItem('unlockedRewards');
    const cosmetics = await CosmeticManager.getEquippedCosmetics();
    const streak = parseInt(await AsyncStorage.getItem('questStreak') ?? '0');
  
    setTotalXpBank(savedTotalXp ? parseInt(savedTotalXp) : 0);
    setUnlocked(savedRewards ? JSON.parse(savedRewards) : []);
    setEquippedBadge(cosmetics.badge);
    setEquippedHud(cosmetics.hud ?? null);
  
    if (streak >= 7 && !(savedRewards?.includes('badge_glitch'))) {
      const updated = [...JSON.parse(savedRewards || '[]'), 'badge_glitch'];
      await AsyncStorage.setItem('unlockedRewards', JSON.stringify(updated));
      setUnlocked(updated);
      // ✅ Add to history
      await addHistory({
        date: new Date().toISOString(),
        type: 'reward',
        description: `Unlocked badge via streak: Glitch Badge`,
        details: { badgeId: 'badge_glitch' },
      });
      Alert.alert('🎖️ Badge Unlocked!', 'You earned the Glitch Badge for your 7-day quest streak!');
    }
  };
  

  const handleEquipTheme = async (themeId: string) => {
    await setThemeByKey(themeId);
    await addHistory({
      date: new Date().toISOString(),
      type: 'reward',
      description: `Equipped theme: ${themeId}`,
      details: { themeId },
    });
  
    Alert.alert('🎨 Theme Equipped!', `${themeId} is now active.`);
  };

  const handleEquipHud = async (hudId: string) => {
    await CosmeticManager.setEquippedHud(hudId);
    eventBus.emit('cosmeticUpdated');
    setEquippedHud(hudId);
  
    await addHistory({
      date: new Date().toISOString(),
      type: 'reward',
      description: `Equipped HUD: ${hudId}`,
      details: { hudId },
    });
  
    Alert.alert('🖥️ HUD Equipped!', `${hudId} is now active.`);
  };

  useFocusEffect(useCallback(() => { loadData(); }, []));

  const handleUnlock = async (rewardId: string, cost: number) => {
    if (rewardId === 'badge_glitch') {
      Alert.alert('Glitch Badge', 'This badge is unlocked via streaks, not purchasable.');
      return;
    }
  
    if (unlocked.includes(rewardId)) {
      Alert.alert('Already Unlocked', 'You already own this reward.');
      return;
    }
  
    if (totalXpBank < cost) {
      Alert.alert('Not Enough XP', `You need ${cost - totalXpBank} more XP to unlock this reward.`);
      return;
    }
  
    const updatedRewards = [...unlocked, rewardId];
    await AsyncStorage.setItem('unlockedRewards', JSON.stringify(updatedRewards));
    setUnlocked(updatedRewards);
  
    const reward = rewards.find((r) => r.id === rewardId);
  
    // ✅ Save to history
    await addHistory({
      date: new Date().toISOString(),
      type: 'reward',
      description: `Unlocked reward: ${reward?.name || rewardId}`,
      details: { rewardId, cost },
    });
  
    if (reward?.type === 'badge') await CosmeticManager.setEquippedBadge(rewardId);
    if (reward?.type === 'hud') await CosmeticManager.setEquippedHud(rewardId);
  
    const allowedThemes = ['default', 'neon_theme', 'fire_red', 'nightwave', 'ice_pulse', 'synthcore'] as const;
    if (allowedThemes.includes(rewardId as typeof allowedThemes[number])) {
      await setThemeByKey(rewardId as typeof allowedThemes[number]);
    }
  
    if (reward?.type === 'badge') setEquippedBadge(rewardId);
  
    Alert.alert('🎁 Unlocked!', `You've unlocked: ${rewardId}`);
  };
  

  const handleEquipBadge = async (badgeId: string) => {
    await CosmeticManager.setEquippedBadge(badgeId);
    eventBus.emit('cosmeticUpdated');
    setEquippedBadge(badgeId);
  
    await addHistory({
      date: new Date().toISOString(),
      type: 'reward',
      description: `Equipped badge: ${badgeId}`,
      details: { badgeId },
    });
  
    Alert.alert('🎖️ Badge Equipped!', `${badgeId} is now active.`);
  };
  

  const renderItem = ({ item }) => {
    const isUnlocked = unlocked.includes(item.id);
    const isTheme = item.type === 'theme';
    const isBadge = item.type === 'badge';
    const isActiveTheme = item.id === themeKey;
    const isActiveBadge = item.id === equippedBadge;
    const isActiveHud = item.id === equippedHud;

    return (
      <View style={[styles.card(theme), isUnlocked && styles.cardUnlocked]}>
        <Text style={[styles.rewardName, { color: theme.text }]}>{item.name}</Text>
        {themePreviewMap[item.id] && <ThemePreviewBar colors={themePreviewMap[item.id].colors} />}
        <Text style={[styles.cost, { color: theme.text }]}>
          {isUnlocked
            ? '✅ Unlocked'
            : item.id === 'badge_glitch'
              ? '🔒 Unlock via 7-day Streak'
              : `🧬 Requires ${item.cost} Lifetime XP`}
        </Text>

        {!isUnlocked && item.id !== 'badge_glitch' && (
          <TouchableOpacity onPress={() => handleUnlock(item.id, item.cost)}>
            <Text style={[styles.buttonText, { color: theme.accent }]}>Unlock</Text>
          </TouchableOpacity>
        )}

{isUnlocked && isTheme && (
  isActiveTheme
    ? <Text style={[styles.buttonText, { color: '#4caf50' }]}>✅ Equipped</Text>
    : <TouchableOpacity onPress={() => handleEquipTheme(item.id)}><Text style={[styles.buttonText, { color: theme.accent }]}>🎨 Equip</Text></TouchableOpacity>
)}


        {isUnlocked && isBadge && (
          isActiveBadge
            ? <Text style={[styles.buttonText, { color: '#4caf50' }]}>✅ Equipped</Text>
            : <TouchableOpacity onPress={() => handleEquipBadge(item.id)}><Text style={[styles.buttonText, { color: theme.accent }]}>🎖️ Equip Badge</Text></TouchableOpacity>
        )}

        {isUnlocked && item.type === 'hud' && (
          isActiveHud
            ? <Text style={[styles.buttonText, { color: '#4caf50' }]}>✅ Equipped</Text>
            : <TouchableOpacity onPress={() => handleEquipHud(item.id)}>
                <Text style={[styles.buttonText, { color: theme.accent }]}>🖥️ Equip HUD</Text>
              </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Text style={[styles.title, { color: theme.accent }]}>🎁 Reward Store</Text>
      <Text style={[styles.xp, { color: theme.text }]}>Total Lifetime XP: {totalXpBank}</Text>
      <FlatList
        data={rewards}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 40 }}
      />
      <TouchableOpacity onPress={() => navigation.navigate('ThemeGalleryScreen')}>
        <Text style={{ color: theme.accent, textAlign: 'center', margin: 14 }}>🖼️ Browse Full Theme Gallery</Text>
      </TouchableOpacity>
      
    </View>
    
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 60, paddingHorizontal: 20 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 10 },
  xp: { fontSize: 16, marginBottom: 20 },
  card: (theme) => ({
    backgroundColor: theme.background,
    padding: 16,
    borderRadius: 10,
    marginBottom: 12,
    borderColor: `${theme.accent}44`,
    borderWidth: 1,
  }),
  cardUnlocked: { borderColor: '#4caf50' },
  rewardName: { fontSize: 16, marginBottom: 6 },
  cost: { fontSize: 14, marginBottom: 8 },
  buttonText: { fontSize: 14, fontWeight: 'bold' },
});
