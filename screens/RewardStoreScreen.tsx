import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Alert,
  TouchableOpacity,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../utils/navigation';
import { useTheme } from '../contexts/ThemeContext';
import { themes } from '../utils/themes';
import { rewards } from '../utils/rewards';
import { CosmeticManager } from '../utils/CosmeticManager';

const themePreviewMap: Record<string, { colors: string[] }> = {
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
  const [xp, setXp] = useState(0);
  const [unlocked, setUnlocked] = useState<string[]>([]);
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList, 'RewardStoreScreen'>>();
  const { setThemeByKey, themeKey } = useTheme();

  useEffect(() => {
    const load = async () => {
      const savedXp = await AsyncStorage.getItem('xp');
      const savedRewards = await AsyncStorage.getItem('unlockedRewards');
      if (savedXp) setXp(parseInt(savedXp));
      if (savedRewards) setUnlocked(JSON.parse(savedRewards));

      const streak = parseInt(await AsyncStorage.getItem('questStreak') ?? '0');
      const updated = [...(savedRewards ? JSON.parse(savedRewards) : [])];

      if (streak >= 7 && !updated.includes('badge_glitch')) {
        updated.push('badge_glitch');
        await AsyncStorage.setItem('unlockedRewards', JSON.stringify(updated));
        Alert.alert('🎖️ Badge Unlocked!', 'You earned the Glitch Badge for your 7-day quest streak!');
      }

      setUnlocked(updated);
    };
    load();
  }, []);

  const confirmUnlock = (rewardId: string, cost: number) => {
    Alert.alert(
      'Unlock Reward?',
      `This will cost ${cost} XP. Are you sure?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Unlock', onPress: () => handleUnlock(rewardId, cost) },
      ],
      { cancelable: true }
    );
  };

  const handleUnlock = async (rewardId: string, cost: number) => {
    if (unlocked.includes(rewardId)) {
      Alert.alert('Already Unlocked', 'You already own this reward.');
      return;
    }

    if (xp < cost) {
      const xpShort = cost - xp;
      Alert.alert('Not Enough XP', `You need ${xpShort} more XP to unlock this reward.`);
      return;
    }

    const updatedRewards = [...unlocked, rewardId];
    const newXp = xp - cost;

    setUnlocked(updatedRewards);
    setXp(newXp);

    await AsyncStorage.setItem('unlockedRewards', JSON.stringify(updatedRewards));
    await AsyncStorage.setItem('xp', newXp.toString());

    const reward = rewards.find((r) => r.id === rewardId);
    if (reward?.type === 'badge') {
      await CosmeticManager.setEquippedBadge(rewardId);
    }
    if (reward?.type === 'hud') {
      await CosmeticManager.setEquippedHud(rewardId);
    }

    if (rewardId in themes) {
      await setThemeByKey(rewardId as keyof typeof themes);
    }

    Alert.alert('🎁 Unlocked!', `You’ve unlocked: ${rewardId}`);
  };

  const handleEquip = async (rewardId: string) => {
    await setThemeByKey(rewardId as keyof typeof themes);
    Alert.alert('🎨 Theme Equipped', `${rewardId} is now active.`);
  };

  const renderItem = ({ item }: { item: typeof rewards[0] }) => {
    const isUnlocked = unlocked.includes(item.id);
    const isTheme = item.type === 'theme';
    const isActiveTheme = item.id === themeKey;

    return (
      <View style={[styles.card, isUnlocked && styles.cardUnlocked]}>
        <Text style={styles.rewardName}>{item.name}</Text>

        {themePreviewMap[item.id] && (
          <ThemePreviewBar colors={themePreviewMap[item.id].colors} />
        )}

        <Text style={styles.cost}>
          {isUnlocked ? '✅ Unlocked' : `🧬 Cost: ${item.cost} XP`}
        </Text>

        {!isUnlocked && (
          <TouchableOpacity onPress={() => confirmUnlock(item.id, item.cost)}>
            <Text style={styles.buttonText}>Unlock</Text>
          </TouchableOpacity>
        )}

        {isUnlocked && isTheme && (
          isActiveTheme ? (
            <View style={styles.equipButton}>
              <Text style={[styles.buttonText, { color: '#4caf50' }]}>✅ Equipped</Text>
            </View>
          ) : (
            <TouchableOpacity onPress={() => handleEquip(item.id)} style={styles.equipButton}>
              <Text style={styles.buttonText}>🎨 Equip Theme</Text>
            </TouchableOpacity>
          )
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🎁 Reward Store</Text>
      <Text style={styles.xp}>Current XP: {xp}</Text>
      <FlatList
        data={rewards}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 40 }}
      />
      <TouchableOpacity onPress={() => navigation.navigate('ThemeGalleryScreen')}>
        <Text style={{ color: '#00f9ff', textAlign: 'center', margin: 14, paddingBottom: 20 }}>
          🖼️ Browse Full Theme Gallery
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0d0c1d',
    paddingTop: 60,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 24,
    color: '#00f9ff',
    fontWeight: 'bold',
    marginBottom: 10,
  },
  xp: {
    fontSize: 16,
    color: '#ccc',
    marginBottom: 20,
  },
  card: {
    backgroundColor: '#1a1a2e',
    padding: 16,
    borderRadius: 10,
    marginBottom: 12,
    borderColor: '#00f9ff44',
    borderWidth: 1,
  },
  cardUnlocked: {
    borderColor: '#4caf50',
  },
  rewardName: {
    color: '#fff',
    fontSize: 16,
    marginBottom: 6,
  },
  cost: {
    color: '#aaa',
    fontSize: 14,
    marginBottom: 8,
  },
  buttonText: {
    color: '#00f9ff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  equipButton: {
    backgroundColor: '#00f9ff22',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    alignSelf: 'flex-start',
    marginTop: 6,
  },
});
