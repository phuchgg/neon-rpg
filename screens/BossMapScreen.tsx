import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ImageBackground,
  Dimensions,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../utils/navigation';
import { Boss } from '../utils/type';
import { useTheme } from '../contexts/ThemeContext';
import LottieView from 'lottie-react-native';
import { Audio } from 'expo-av';
import Svg, { Line } from 'react-native-svg';
import { CosmeticManager } from '../utils/CosmeticManager';
import { useCallback } from 'react';
import { FlatList } from 'react-native';



const { width, height } = Dimensions.get('window');

const getBossIcon = (tier: Boss['tier']) => {
  switch (tier) {
    case 'mini': return '🟢';
    case 'elite': return '🔴';
    case 'mega': return '🟣';
    default: return '❓';
  }
};

export default function BossMapScreen() {
  const [bosses, setBosses] = useState<Boss[]>([]);
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { theme } = useTheme();
  const [showZoneUnlock, setShowZoneUnlock] = useState(false);
  const [showZoneBanner, setShowZoneBanner] = useState(false);
  const [playerClass, setPlayerClass] = useState<string | null>(null);
  const [equippedHud, setEquippedHud] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

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

  useEffect(() => {
    AsyncStorage.getItem('playerClass').then((value) => {
      setPlayerClass(value);
    });
  }, []);

  useFocusEffect(
    useCallback(() => {
      const load = async () => {
        setLoading(true);
        const json = await AsyncStorage.getItem('bosses');
        const storedZone = await AsyncStorage.getItem('lastUnlockedZone');
        let lastUnlockedZone = parseInt(storedZone ?? '0');

        if (json) {
          const loadedBosses: Boss[] = JSON.parse(json);
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
      };

      const loadCosmetics = async () => {
        const cosmetics = await CosmeticManager.getEquippedCosmetics();
        if (cosmetics.hud) setEquippedHud(cosmetics.hud);
        setLoading(false);
      };

      load();
      loadCosmetics();
    }, [])
  );


  const defeatedCount = bosses.filter((b) => b.isDefeated).length;
  let currentMap;

  const cycleIndex = Math.floor(defeatedCount / 8) % 3;

  switch (cycleIndex) {
    case 0:
      currentMap = require('../assets/maps/cyber_map_bg.png');
      break;
    case 1:
      currentMap = require('../assets/maps/cyber_map_bg_2.png');
      break;
    case 2:
      currentMap = require('../assets/maps/cyber_map_bg_final.png');
      break;
  }
  

  const bossPositions: Record<string, { x: number; y: number }> = {};
  bosses.forEach((boss, index) => {
    const top = 100 + index * 80;
    const left = 60 + (index % 2 === 0 ? 0 : 120);
    bossPositions[boss.id] = { x: left + 60, y: top + 20 };
  });

  return (
    <ImageBackground source={currentMap} style={styles.map} resizeMode="stretch">

      {/* Add Boss Button */}
      <TouchableOpacity
        style={[
          styles.addButton,
          { backgroundColor: `${theme.background}cc`, borderColor: `${theme.accent}44` },
        ]}
        onPress={() => navigation.navigate('CreateBossScreen')}
      >
        <Text style={{ color: theme.text}}>+ Add Boss</Text>
      </TouchableOpacity>

      {/* Back to TaskScreen */}
      <TouchableOpacity
        style={[
          styles.backButton,
          { backgroundColor: `${theme.background}cc`, borderColor: `${theme.accent}44` },
        ]}
        onPress={() => navigation.navigate('TaskScreen')}
      >
        <Text style={{ color: theme.text }}>← Back</Text>
      </TouchableOpacity>

      {equippedHud === 'hud_nightwave' && <View style={styles.hudOverlay} />}

      {showZoneBanner && (
        <View style={styles.banner}>
          <Text style={styles.bannerText}>🌐 New Zone Unlocked!</Text>
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
          const left = 60 + (index % 2 === 0 ? 0 : 120);

          const isLocked =
            boss.unlockAfter &&
            boss.unlockAfter.some(
              (id) => !bosses.find((b) => b.id === id)?.isDefeated
            );

          return (
            <TouchableOpacity
              key={boss.id}
              onPress={() =>
                !isLocked &&
                navigation.navigate('BossDetailScreen', { bossId: boss.id })
              }
              style={[
                styles.bossNode,
                {
                  top,
                  left,
                  backgroundColor: boss.isDefeated
                    ? '#4caf50'
                    : isLocked
                      ? '#555'
                      : theme.accent,
                  opacity: isLocked ? 0.6 : 1,
                },
              ]}
            >
              <Text style={styles.bossText}>
                {`${getBossIcon(boss.tier)} ${boss.title}`}
              </Text>
              {isLocked && <Text style={styles.lockedText}>🔒 Locked</Text>}
            </TouchableOpacity>
          );
        })}

      {showZoneUnlock && (
        <LottieView
          source={require('../assets/lotties/unlock-zone.json')}
          autoPlay
          loop={false}
          style={styles.lottie}
        />
      )}
    </ImageBackground>
    
  );
}

const styles = StyleSheet.create({
  map: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  bossNode: {
    position: 'absolute',
    padding: 10,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#fff',
  },
  bossText: { color: '#fff', fontWeight: 'bold' },
  lockedText: { fontSize: 12, color: '#aaa', marginTop: 4 },
  lottie: {
    position: 'absolute',
    width: 300,
    height: 300,
    alignSelf: 'center',
    top: height / 3,
    zIndex: 10,
  },
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
  addButton: {
    position: 'absolute',
    bottom: 40,
    right: 20,
    backgroundColor: '#00f9ff22',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    borderColor: '#00f9ff',
    borderWidth: 1,
    zIndex: 20,
  },
  addButtonText: { color: '#00f9ff', fontWeight: '600' },
  backButton: {
    position: 'absolute',
    top: 40,
    left: 20,
    backgroundColor: '#1a1a2eaa',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderColor: '#00f9ff44',
    borderWidth: 1,
    zIndex: 20,
  },
  backButtonText: { color: 'white' },
});
