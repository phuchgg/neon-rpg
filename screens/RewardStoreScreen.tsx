import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { View, Text, FlatList, StyleSheet, Alert, TouchableOpacity, Image } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../utils/navigation';
import { useTheme } from '../contexts/ThemeContext';
import { rewards } from '../utils/rewards';
import { CosmeticManager } from '../utils/CosmeticManager';
import { useFocusEffect } from '@react-navigation/native';
import eventBus from '../utils/EventBus';
import AssetManager from '../utils/AssetManager';
import { PetImageMap, BadgeImageMap } from '../utils/AssetManager';

const themePreviewMap = {
  jade_echo: { colors: ['#0d1f14', '#d8ffe3', '#2aff80'] },
  fire_red: { colors: ['#1a0000', '#ffe0e0', '#ff1a1a'] },
  nightwave: { colors: ['#0a0f29', '#9cd8ff', '#4f9bff'] },
  ice_pulse: { colors: ['#011f2a', '#b0faff', '#00e0ff'] },
  synthcore: { colors: ['#1b0029', '#ffb6f9', '#ff3cac'] },
  synth_hood: { colors: ['#1b0029', '#ffb6f9', '#ff3cac'] }, // same as synthcore style
  hud_nightwave: { colors: ['#0a0f29', '#9cd8ff', '#4f9bff'] }, // same as nightwave style
};

const hudPreviewMap = {
  hud_nightwave: { colors: ['#0a0f29', '#9cd8ff', '#4f9bff'] },
  hud_synthcore: { colors: ['#1b0029', '#ffb6f9', '#ff3cac'] },
  hud_synthmancer: { colors: ['#1b0029', '#ffb6f9', '#ff3cac'] },
};



const ThemePreviewBar = ({ colors }: { colors: string[] }) => (
  <View style={{ flexDirection: 'row', marginTop: 8, marginBottom: 4 }}>
    {colors.map((c, i) => (
      <View
        key={i}
        style={{
          flex: 1,
          height: 60,
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
  const [equippedPet, setEquippedPet] = useState<string | null>(null);
  const addHistory = async (item: { date: string; type: 'class' | 'quest' | 'boss' | 'reward'; description: string; details?: any }) => {
    const existing = JSON.parse(await AsyncStorage.getItem('activityHistory') || '[]');
    existing.push(item);
    await AsyncStorage.setItem('activityHistory', JSON.stringify(existing));
  };
  
  const [activeTab, setActiveTab] = useState<'theme' | 'badge' | 'pet'>('theme');

  const EquipButton = ({
  onPress,
  isEquipped,
  label,
}: {
  onPress?: () => void;
  isEquipped: boolean;
  label: string;
}) => {
  const { theme } = useTheme();

  if (isEquipped) {
    return (
      <View
        style={[
          styles.equippedButton,
          {
            borderColor: theme.accent,
            shadowColor: theme.accent,
            backgroundColor: `${theme.accent}22`,
          },
        ]}
      >
        <Text
          style={[
            styles.equippedButtonText,
            { color: `${theme.text}AA` }, // blur-style text
          ]}
        >
          Equipped
        </Text>
      </View>
    );
  }

  return (
    <TouchableOpacity onPress={onPress}>
      <View
        style={[
          styles.equipButton,
          {
            borderColor: theme.accent,
            shadowColor: theme.accent,
            backgroundColor: `${theme.accent}33`,
          },
        ]}
      >
        <Text style={styles.equipButtonText(theme)}>{label}</Text>

      </View>
    </TouchableOpacity>
  );
};


  const loadData = async () => {
    const savedTotalXp = await AsyncStorage.getItem('totalXp');
    const savedRewards = await AsyncStorage.getItem('unlockedRewards');
    console.log('Unlocked Rewards:', savedRewards);
    const cosmetics = await CosmeticManager.getEquippedCosmetics();
    console.log('Equipped Cosmetics:', cosmetics); // ✅ Check if pet shows up
    const streak = parseInt(await AsyncStorage.getItem('questStreak') ?? '0');
  
    setTotalXpBank(savedTotalXp ? parseInt(savedTotalXp) : 0);
    setUnlocked(savedRewards ? JSON.parse(savedRewards) : []);
    setEquippedBadge(cosmetics.badge);
    setEquippedHud(cosmetics.hud ?? null);
    setEquippedPet(cosmetics.pet ?? null); // <-- ADD THIS

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
  const handleEquipPet = async (petId: string) => {
  await CosmeticManager.setEquippedPet(petId);
   setEquippedPet(petId);
  eventBus.emit('cosmeticUpdated');
  Alert.alert('Pet Equipped!', `${petId} is now active.`);
};



  const handleEquipTheme = async (themeId: string) => {
    await setThemeByKey(themeId);
    await addHistory({
      date: new Date().toISOString(),
      type: 'reward',
      description: `Equipped theme: ${themeId}`,
      details: { themeId },
    });
  
    Alert.alert('Theme Equipped!', `${themeId} is now active.`);
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
  
    Alert.alert('HUD Equipped!', `${hudId} is now active.`);
  };

  useFocusEffect(useCallback(() => { loadData(); }, []));


  const handleUnlock = useCallback((rewardId: string, cost: number) => {
  const isUnlocked = unlocked.includes(rewardId);
  const xpNeeded = cost - totalXpBank;

  if (isUnlocked) {
    Alert.alert('Already Unlocked', 'You already own this reward.');
    return;
  }

  const confirmMessage =
    xpNeeded > 0
      ? `You need ${xpNeeded} more XP to unlock this reward.`
      : `Do you want to spend ${cost} XP to unlock this reward?`;

  Alert.alert(
    'Confirm Unlock',
    confirmMessage,
    xpNeeded > 0
      ? [{ text: 'OK', style: 'cancel' }]
      : [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Unlock',
            style: 'default',
            onPress: async () => {
              const remainingXp = totalXpBank - cost;
              setTotalXpBank(remainingXp);
              await AsyncStorage.setItem('totalXp', remainingXp.toString());

              const updatedRewards = [...unlocked, rewardId];
              await AsyncStorage.setItem('unlockedRewards', JSON.stringify(updatedRewards));
              setUnlocked(updatedRewards);

              const reward = rewards.find((r) => r.id === rewardId);

              await addHistory({
                date: new Date().toISOString(),
                type: 'reward',
                description: `Unlocked reward: ${reward?.name || rewardId}`,
                details: { rewardId, cost },
              });

              if (reward?.type === 'badge') await CosmeticManager.setEquippedBadge(rewardId);
              if (reward?.type === 'hud') await CosmeticManager.setEquippedHud(rewardId);

              const allowedThemes = ['default', 'jade_echo', 'fire_red', 'nightwave', 'ice_pulse', 'synthcore'] as const;
              if (allowedThemes.includes(rewardId as typeof allowedThemes[number])) {
                await setThemeByKey(rewardId as typeof allowedThemes[number]);
              }

              if (!unlocked.includes(rewardId)) {
    const updatedRewards = [...unlocked, rewardId];
    await AsyncStorage.setItem('unlockedRewards', JSON.stringify(updatedRewards));
    setUnlocked(updatedRewards);
  }

              if (reward?.type === 'badge') setEquippedBadge(rewardId);
              if (reward?.type === 'pet') {
  await CosmeticManager.setEquippedPet(rewardId); // actually equip it
  setEquippedPet(rewardId); // reflect in UI
  eventBus.emit('cosmeticUpdated'); // make sure HUD updates too
}


              Alert.alert('🎁 Unlocked!', `You've unlocked: ${reward?.name || rewardId}`);
            },
          },
        ]
  );
}, [unlocked, totalXpBank, setTotalXpBank, setUnlocked, setThemeByKey, setEquippedBadge, addHistory]);


  

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
  
    Alert.alert('Badge Equipped!', `${badgeId} is now active.`);
  };
  

  const renderItem = useCallback(({ item }) => {
  if (item.type !== activeTab) return null;

  const isUnlocked = unlocked.includes(item.id);
  const isTheme = item.type === 'theme';
  const isBadge = item.type === 'badge';
  const isActiveTheme = item.id === themeKey;
  const isActiveBadge = item.id === equippedBadge;
  const isActivePet = item.id === equippedPet;

const rewardImage =
  item.type === 'badge'
    ? BadgeImageMap[item.id]
    : item.type === 'pet'
    ? PetImageMap[item.id]
    : null;



  return (
    <View style={[styles.card(theme), isUnlocked && styles.cardUnlocked(theme)]}>
      {item.rarity && (
  <Text style={{
    fontSize: 12,
    color: item.rarity === 'legendary' ? '#FFD700' : '#aaa',
    marginBottom: 4,
    textTransform: 'uppercase',
    fontWeight: '600',
  }}>
    {item.rarity}
  </Text>
)}

      <View style={{ alignItems: 'center', marginTop: 8 }}>
        <Text style={[styles.rewardName, { color: theme.text, textAlign: 'center' }]}>{item.name}</Text>
        {(themePreviewMap[item.id] || hudPreviewMap[item.id]) && (
  <ThemePreviewBar colors={(themePreviewMap[item.id] || hudPreviewMap[item.id]).colors} />
)}

      </View>

      {rewardImage && (
        <Image
          source={rewardImage}
          style={{ width: 64, height: 64, alignSelf: 'center', marginBottom: 8 }}
          resizeMode="contain"
        />
      )}

      {!isUnlocked && item.id !== 'badge_glitch' && (
  <Text style={[styles.cost, { color: theme.text, textAlign: 'center' }]}>
    🧬 Requires {item.cost} XP
  </Text>
)}

{item.id === 'badge_glitch' && (
  <Text style={[styles.cost, { color: theme.text, textAlign: 'center' }]}>
    🔒 Unlock via 7-day Streak
  </Text>
)}




        {!isUnlocked && item.id !== 'badge_glitch' && (
          <View style={{ alignItems: 'center' }}>
<TouchableOpacity onPress={() => handleUnlock(item.id, item.cost)}>
  <View style={[
    styles.cyberButton(theme),
    totalXpBank < item.cost && styles.cyberButtonDisabled
  ]}>
    <Text style={[
  styles.cyberButtonText,
  { color: theme.text },
  totalXpBank < item.cost && styles.cyberButtonTextDisabled
]}>
  🔓 Unlock
</Text>
  </View>
</TouchableOpacity>

</View>

        )}

{isUnlocked && isTheme && (
  <View style={{ marginTop: !item.id.startsWith('badge_glitch') && !item.cost ? 0 : 8 }}>
    <EquipButton
      onPress={() => handleEquipTheme(item.id)}
      isEquipped={isActiveTheme}
      label="Equip Theme"
    />
  </View>
)}

        <View style={{ marginTop: !item.id.startsWith('badge_glitch') && !item.cost ? 0 : 8 }}>
        {isUnlocked && isBadge && (
          <EquipButton
  onPress={() => handleEquipBadge(item.id)}
  isEquipped={isActiveBadge}
  label="Equip Badge"
/>

        )}
       </View>

        <View style={{ marginTop: !item.id.startsWith('badge_glitch') && !item.cost ? 0 : 8 }}>
{isUnlocked && item.type === 'pet' && (
  <EquipButton
    onPress={() => handleEquipPet(item.id)}
    isEquipped={isActivePet}
    label="Equip Pet"
  />
)}
        </View>



      </View>
  );
}, [activeTab, unlocked, equippedBadge, equippedHud, equippedPet, themeKey, theme]);

  const filteredRewards = rewards.filter((r) => r.type === activeTab);
  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={{ alignItems: 'center', marginBottom: 20 }}>
      <Text style={[styles.title, { color: theme.accent }]}>Reward Store</Text>
      <Text style={styles.xpHighlight}>
  🧬 XP Bank: <Text style={{ color: theme.accent }}>{totalXpBank}</Text>
</Text>

      </View>

      <View style={styles.tabBar}>
  {['theme', 'badge', 'pet'].map((tab) => (
    <TouchableOpacity
      key={tab}
      style={[
  ,
  activeTab === tab && styles.activeTab,
]}

      onPress={() => setActiveTab(tab as any)}
    >
      <Text style={styles.tabText}>
        {tab === 'theme' ? '🎨 Themes' : tab === 'badge' ? '🏅 Badges' : '🐾 Pets'}
      </Text>
    </TouchableOpacity>
  ))}
</View>

{filteredRewards.length === 0 && (
  <Text style={{ textAlign: 'center', color: '#777', marginTop: 40 }}>
    🚫 No rewards in this category yet.
  </Text>
)}

<FlatList
  data={filteredRewards}
  keyExtractor={(item) => item.id}
  renderItem={renderItem}
  extraData={{ activeTab, unlocked, equippedBadge, equippedHud, equippedPet, themeKey }} // <-- added `equippedPet`
  contentContainerStyle={{ paddingBottom: 40 }}
  ListFooterComponent={activeTab === 'theme' ? (
    <TouchableOpacity onPress={() => navigation.navigate('ThemeGalleryScreen')}>
      <Text style={{ color: theme.accent, textAlign: 'center', margin: 14 }}>
        Browse Full Theme Gallery
      </Text>
    </TouchableOpacity>
  ) : null}
/>

    </View>
    
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 60, paddingHorizontal: 20,},
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 10, },
  xp: { fontSize: 16, marginBottom: 20 },
  card: (theme) => ({
    backgroundColor: theme.background,
    padding: 16,
    borderRadius: 10,
    marginBottom: 12,
    borderColor: `${theme.accent}44`,
    borderWidth: 1,
  }),
  cardUnlocked: (theme) => ({
  borderColor: theme.accent,
  borderWidth: 1,
  paddingBottom: 12,
  shadowColor: theme.accent,
  shadowOffset: { width: 0, height: 0 },
  shadowOpacity: 0.3,
  shadowRadius: 8,
}),


  rewardName: { fontSize: 16, marginBottom: 6 },
  cost: { fontSize: 14, margin: 8 },
  buttonText: { fontSize: 14, fontWeight: 'bold' },
  tabBar: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 20 },

activeTab: { backgroundColor: '#00f9ff22' },
tabText: { color: 'white', fontWeight: 'bold' },

cyberButton: (theme) => ({
  backgroundColor: `${theme.accent}33`,
  paddingVertical: 8,
  paddingHorizontal: 16,
  borderRadius: 8,
  borderWidth: 1,
  borderColor: theme.accent,
  marginTop: 10,
  shadowColor: theme.accent,
  shadowOpacity: 0.7,
  shadowRadius: 6,
}),
cyberButtonText: { color: '#00f9ff', fontWeight: 'bold', textAlign: 'center' },

cyberButtonEquipped: {
  backgroundColor: '#0f0f0f',
  paddingVertical: 8,
  paddingHorizontal: 16,
  borderRadius: 8,
  borderWidth: 1,
  borderColor: '#4caf50',
  marginTop: 6,
  shadowColor: '#4caf50',
  shadowOpacity: 0.7,
  shadowRadius: 6,
},
cyberButtonTextEquipped: { color: '#4caf50', fontWeight: 'bold', textAlign: 'center' },
cyberButtonDisabled: {
  opacity: 0.4,
},

cyberButtonTextDisabled: {
  color: '#999',
},

equipButton: {
  backgroundColor: '#00f9ff22',
  paddingVertical: 8,
  paddingHorizontal: 18,
  borderRadius: 10,
  borderWidth: 1,
  borderColor: '#00f9ff',
  shadowColor: '#00f9ff',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.7,
  shadowRadius: 6,
  marginTop: 8,
  alignSelf: 'center',
},

equipButtonText: (theme) => ({
  color: theme.text,
  fontSize: 14,
  textAlign: 'center',
}),


equippedButton: {
  backgroundColor: '#0f0f0f',
  paddingVertical: 8,
  paddingHorizontal: 18,
  borderRadius: 10,
  shadowColor: '#4caf50',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.6,
  shadowRadius: 6,
  marginTop: 8,
  alignSelf: 'center',
},

equippedButtonText: {
  color: '#4caf50',
  fontSize: 14,
  textAlign: 'center',
},
xpHighlight: {
  fontSize: 16,
  fontWeight: '600',
  color: '#aaa',
  marginBottom: 16,
  textAlign: 'center',
  letterSpacing: 0.5,
},


});
