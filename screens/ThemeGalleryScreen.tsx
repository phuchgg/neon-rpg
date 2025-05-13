import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, Dimensions, FlatList, TouchableOpacity, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../contexts/ThemeContext';
import { XPManager } from '../utils/XPManager';
import { themes } from '../utils/themes';
import LottieView from 'lottie-react-native';
import { useNavigation } from '@react-navigation/native';

const { width, height } = Dimensions.get('window');
const themeList = Object.entries(themes) as [keyof typeof themes, typeof themes.default][];

const costMap: Record<string, number> = {
  default: 0,
  neon_theme: 1000,
  fire_red: 1200,
  nightwave: 1300,
  ice_pulse: 1400,
  synthcore: 1600,
};

const themePreviewMap: Record<string, { colors: string[] }> = {
  default: { colors: ['#0d0c1d', '#fefefe', '#00f9ff'] },
  neon_theme: { colors: ['#001b0f', '#00ffcc', '#39ff14'] },
  fire_red: { colors: ['#1a0000', '#ffe0e0', '#ff1a1a'] },
  nightwave: { colors: ['#0a0f29', '#9cd8ff', '#4f9bff'] },
  ice_pulse: { colors: ['#011f2a', '#b0faff', '#00e0ff'] },
  synthcore: { colors: ['#1b0029', '#ffb6f9', '#ff3cac'] },
};

const ThemePreviewBar = ({ colors }: { colors: string[] }) => (
  <View style={{ alignItems: 'center' }}>
    <View style={{ flexDirection: 'row', width: '80%', marginTop: 12, marginBottom: 16 }}>
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
  </View>
);

export default function ThemeGalleryScreen() {
  const { theme, themeKey, setThemeByKey } = useTheme();
  const navigation = useNavigation();
  const flatListRef = useRef<FlatList>(null);

  const [totalXpBank, setTotalXpBank] = useState(0);
  const [unlocked, setUnlocked] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showUnlockAnim, setShowUnlockAnim] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      const xpBank = await XPManager.getTotalXpBank();
      const rewards = await AsyncStorage.getItem('unlockedRewards');
      setTotalXpBank(xpBank);
      if (rewards) setUnlocked(JSON.parse(rewards));
    };
    loadData();
  }, []);

  const handleEquip = async (key: keyof typeof themes) => {
    await setThemeByKey(key);
  };

  const confirmUnlock = (key: keyof typeof themes, cost: number) => {
    Alert.alert('Unlock Theme?', `Spend ${cost} XP to unlock this theme?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Unlock', onPress: () => handleUnlockAndEquip(key, cost) },
    ]);
  };

  const handleUnlockAndEquip = async (key: keyof typeof themes, cost: number) => {
    if (unlocked.includes(key)) return;

    const success = await XPManager.spendXpBank(cost);
    if (!success) {
      Alert.alert('Not Enough XP', `You need ${cost} XP to unlock this theme.`);
      return;
    }

    const updatedRewards = [...unlocked, key];
    setUnlocked(updatedRewards);

    const newBank = totalXpBank - cost;
    setTotalXpBank(newBank);

    await AsyncStorage.setItem('unlockedRewards', JSON.stringify(updatedRewards));
    await setThemeByKey(key);

    setShowUnlockAnim(true);
    setTimeout(() => setShowUnlockAnim(false), 1800);

    Alert.alert('🎨 Theme Equipped!', `${key.replace('_', ' ').toUpperCase()} is now active.`);
  };

  const renderThemeCard = ({ item }: { item: [keyof typeof themes, typeof themes.default] }) => {
    const [key, t] = item;
    const isActive = key === themeKey;
    const isUnlocked = unlocked.includes(key);
    const cost = costMap[key] || 0;

    return (
      <View style={[styles.card, { backgroundColor: t.background }]}>
        <Text style={{ fontSize: 28, marginBottom: 8 }}>🎨</Text>
        <Text style={[styles.title, { color: t.accent }]}>{key.replace('_', ' ').toUpperCase()}</Text>
        {themePreviewMap[key] && <ThemePreviewBar colors={themePreviewMap[key].colors} />}
        <Text style={[styles.previewText, { color: t.text }]}>
          This is a preview of the theme. Imagine tasks and UI glowing like this!
        </Text>

        {isUnlocked ? (
          isActive ? (
            <View style={styles.equipTag}>
              <Text style={styles.equippedText}>✅ Equipped</Text>
            </View>
          ) : (
            <TouchableOpacity onPress={() => handleEquip(key)} style={styles.equipButton}>
              <Text style={styles.equipText}>🎨 Equip Theme</Text>
            </TouchableOpacity>
          )
        ) : (
          <TouchableOpacity
            onPress={() => confirmUnlock(key, cost)}
            disabled={totalXpBank < cost}
            style={[styles.equipButton, totalXpBank < cost && { backgroundColor: '#333' }]}
          >
            <Text style={[styles.equipText, totalXpBank < cost && { color: '#777' }]}>
              🔓 Unlock & Equip
            </Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backLink}>← Back to Store</Text>
        </TouchableOpacity>

        <View style={styles.dotContainer}>
          {themeList.map((_, index) => (
            <View
              key={index}
              style={[styles.dot, index === currentIndex ? styles.activeDot : styles.inactiveDot]}
            />
          ))}
        </View>
      </View>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      {showUnlockAnim && (
        <LottieView
          source={require('../assets/lotties/unlock.json')}
          autoPlay
          loop={false}
          style={styles.unlockAnim}
        />
      )}
  
  <FlatList
  ref={flatListRef}
  horizontal
  pagingEnabled
  data={themeList}
  renderItem={({ item }) => {
    const [key, t] = item;
    return (
      <View style={{ flex: 1, backgroundColor: t.background }}>
        {renderThemeCard({ item })}
      </View>
    );
  }}
  keyExtractor={([key]) => key}
  showsHorizontalScrollIndicator={false}
  onScroll={(e) => {
    const index = Math.round(e.nativeEvent.contentOffset.x / width);
    setCurrentIndex(index);
  }}
/>

    </View>
  );
}

const styles = StyleSheet.create({
    card: {
        width,
        height,
        paddingTop: 200,
        paddingBottom: 10,
        paddingHorizontal: 20,
        justifyContent: 'space-between',
        alignItems: 'center',
    },

    title: {
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    previewText: {
        fontSize: 16,
        textAlign: 'center',
        maxWidth: '80%',
        marginBottom: 30,
    },
    button: {
        paddingVertical: 10,
        paddingHorizontal: 24,
        borderRadius: 8,
    },
    equipButton: {
        backgroundColor: '#00f9ff22',
        paddingVertical: 6,
        paddingHorizontal: 20,
        borderRadius: 20,
        marginTop: 200,
    },
    equipText: {
        color: '#00f9ff',
        fontWeight: 'bold',
        fontSize: 14,
    },
    equipTag: {
        backgroundColor: '#4caf5033',
        paddingVertical: 6,
        paddingHorizontal: 20,
        borderRadius: 20,
        marginTop: 200,
    },
    equippedText: {
        color: '#4caf50',
        fontWeight: 'bold',
        fontSize: 14,

    },
    backLink: {
        color: '#00f9ff',
        textAlign: 'center',
        fontSize: 16,
        marginTop: 20,
        marginBottom: 40,
        fontWeight: '600',
    },
    dotContainer: {
        paddingTop: 20,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    dot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        marginHorizontal: 6,
    },
    activeDot: {
        backgroundColor: '#00f9ff',
    },
    inactiveDot: {
        backgroundColor: '#444',
    },
    lockedTag: {
        backgroundColor: '#444',
        paddingVertical: 6,
        paddingHorizontal: 20,
        borderRadius: 20,
        marginTop: 10,
    },
    lockedText: {
        color: '#ccc',
        fontWeight: 'bold',
        fontSize: 14,
    },
    unlockAnim: {
        width: 200,
        height: 200,
        position: 'absolute',
        top: '35%',
        alignSelf: 'center',
        zIndex: 999,
    },
});
