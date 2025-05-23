import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ImageBackground,
  Dimensions,
  Image,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../utils/navigation';
import { Boss } from '../utils/type';
import { useTheme } from '../contexts/ThemeContext';
import { Audio } from 'expo-av';
import Svg, { Line } from 'react-native-svg';
import { CosmeticManager } from '../utils/CosmeticManager';
import AssetManager from '../utils/AssetManager';
import { themes } from '../utils/themes';

const { width, height } = Dimensions.get('window');

export default function BossMapScreen() {
  const [bosses, setBosses] = useState<Boss[]>([]);
  const [showZoneUnlock, setShowZoneUnlock] = useState(false);
  const [showZoneBanner, setShowZoneBanner] = useState(false);
  const [playerClass, setPlayerClass] = useState<string | null>(null);
  const [equippedHud, setEquippedHud] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { theme } = useTheme();

  const playUnlockSound = async () => {
    const { sound } = await Audio.Sound.createAsync(
      require('../assets/sound/unlock.mp3')
    );
    await sound.playAsync();
    sound.setOnPlaybackStatusUpdate((status) => {
      if (status.isLoaded && status.didJustFinish) {
        sound.unloadAsync();
      }
    });
  };

  const hashBosses = (bosses: Boss[]) =>
    JSON.stringify(bosses.map((b) => ({
      id: b.id,
      isDefeated: b.isDefeated,
      unlockAfter: b.unlockAfter,
    })));


  const loadData = async () => {
    setLoading(true);

    const json = await AsyncStorage.getItem('bosses');
    const storedZone = await AsyncStorage.getItem('lastUnlockedZone');
    let lastUnlockedZone = parseInt(storedZone ?? '0');

    if (json) {
      const loadedBosses: Boss[] = JSON.parse(json);

      // Diff Check - Only update if changed
      const newHash = hashBosses(loadedBosses);
      const currentHash = hashBosses(bosses);

      if (newHash !== currentHash) {
        setBosses(loadedBosses);

        const defeated = loadedBosses.filter((b) => b.isDefeated).length;
        const currentZone = defeated < 3 ? 1 : defeated < 6 ? 2 : 3;

        if (currentZone > lastUnlockedZone) {
          setShowZoneUnlock(true);
          setShowZoneBanner(true);
          playUnlockSound();
          await AsyncStorage.setItem('lastUnlockedZone', currentZone.toString());
          setTimeout(() => {
            setShowZoneUnlock(false);
            setShowZoneBanner(false);
          }, 2500);
        }
      }
    }

    const cosmetics = await CosmeticManager.getEquippedCosmetics();
    if (cosmetics.hud) setEquippedHud(cosmetics.hud);

    setLoading(false);
  };


  useEffect(() => {
    AsyncStorage.getItem('playerClass').then((value) => {
      setPlayerClass(value);
    });

    loadData(); // Initial load
  }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', async () => {
      const json = await AsyncStorage.getItem('bosses');
      if (!json) return;

      const loadedBosses: Boss[] = JSON.parse(json);
      const newHash = hashBosses(loadedBosses);
      const currentHash = hashBosses(bosses);

      if (newHash !== currentHash) {
        setBosses(loadedBosses);
      }
    });


    return unsubscribe;
  }, [navigation]);

  const defeatedCount = bosses.filter((b) => b.isDefeated).length;
  const cycleIndex = Math.floor(defeatedCount / 8) % 3;

  const currentMap = [
    AssetManager.Maps.Zone1,
    AssetManager.Maps.Zone2,
    AssetManager.Maps.Zone3,
  ][cycleIndex];


  const bossPositions: Record<string, { x: number; y: number }> = {};
  bosses.forEach((boss, index) => {
    const top = 100 + index * 80;
    const left = 60 + (index % 2 === 0 ? 0 : 120);
    bossPositions[boss.id] = { x: left + 60, y: top + 20 };
  });

  if (loading) {
    return (
      <View style={[styles.map, { justifyContent: 'center', alignItems: 'center', backgroundColor: '#000' }]}>
        <Text style={{ color: '#00f9ff', fontSize: 18 }}>🔄 Đang tải...</Text>
      </View>
    );
  }

  return (
    <ImageBackground source={currentMap} style={styles.map} resizeMode="stretch">
      {/* Add Boss Button */}
      <TouchableOpacity
  style={styles.addButton(theme)}
  onPress={() => navigation.navigate('CreateBossScreen')}
>
  <Text style={{ color: theme.accent, fontWeight: 'bold', fontSize: 20 }}>＋</Text>
</TouchableOpacity>



      {equippedHud === 'hud_nightwave' && <View style={styles.hudOverlay} />}

      {showZoneBanner && (
        <View style={styles.banner}>
          <Text style={styles.bannerText}>🌐 Map mới đã được mở</Text>
        </View>
      )}

      <Svg style={StyleSheet.absoluteFill}>
        {bosses.map((boss) =>
          boss.connectsTo?.map((targetId) => {
            const from = bossPositions[boss.id];
            const to = bossPositions[targetId];
            if (!from || !to) return null;
            return (
              <Line
                key={`${boss.id}-${targetId}`}
                x1={from.x}
                y1={from.y}
                x2={to.x}
                y2={to.y}
                stroke="#00f9ff"
                strokeWidth={2}
                strokeDasharray="5,5"
              />
            );
          })
        )}
      </Svg>

      {bosses
        .filter((boss) => !boss.classRequired || boss.classRequired === playerClass)
        .map((boss, index) => {
          const top = 100 + index * 80;
          const left = 120 + (index % 2 === 0 ? 0 : 120);

          const isLocked = boss.unlockAfter?.some(
            (id) => !bosses.find((b) => b.id === id)?.isDefeated
          );

          const avatarSource = AssetManager.BossIcons[boss.tier];

          return (
            <TouchableOpacity
              key={boss.id}
              onPress={() => !isLocked && navigation.navigate('BossDetailScreen', { bossId: boss.id })}
              style={[
                styles.bossNode,
                {
                  top,
                  left,
                  opacity: isLocked ? 0.6 : 1,
                  alignItems: 'center',
                },
              ]}
            >
              <Text style={styles.bossText}>{boss.title}</Text>
              <Image
                source={avatarSource}
                style={{
                  width: 50,
                  height: 50,
                  opacity: isLocked ? 0.4 : 1,
                }}
                resizeMode="contain"
              />
              {isLocked && <Text style={styles.lockedText}>🔒 Khóa</Text>}
            </TouchableOpacity>
          );
        })}
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  map: { flex: 1, width: '100%', height: '100%' },
  bossNode: { position: 'absolute', padding: 10 },
  bossText: {
    color: '#fff',
    fontWeight: 'bold',
    textShadowColor: '#000',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 3,
  },
  lockedText: { fontSize: 12, color: '#aaa', marginTop: 4 },
  banner: {
    position: 'absolute',
    top: 60,
    alignSelf: 'center',
    backgroundColor: '#0d0c1dcc',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
    borderColor: '#00f9ff',
    borderWidth: 1,
    zIndex: 11,
  },
  bannerText: { color: '#00f9ff', fontSize: 18, fontWeight: 'bold' },
  hudOverlay: {
    ...StyleSheet.absoluteFillObject,
    borderWidth: 2,
    borderColor: '#00f9ff88',
    borderRadius: 20,
    zIndex: 4,
    opacity: 0.4,
  },
  addButton: (theme) => ({
  position: 'absolute',
  bottom: 60,
  right: 20,
  width: 60,
  height: 60,
  borderRadius: 30, // Perfect circle
  borderWidth: 2,
  borderColor: theme.accent, // Neon border color from your theme
  backgroundColor: `${theme.accent}22`, // Slight transparent neon glow inside
  alignItems: 'center',
  justifyContent: 'center',
  shadowColor: theme.accent, // Neon glow shadow
  shadowOpacity: 0.9,
  shadowRadius: 10,
  shadowOffset: { width: 0, height: 0 },
  elevation: 10, // For Android shadow
  zIndex: 20,
}),

});
