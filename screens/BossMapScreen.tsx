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
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../utils/navigation';
import { Boss } from '../utils/type';
import { useTheme } from '../contexts/ThemeContext';

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

  useEffect(() => {
    const load = async () => {
      const json = await AsyncStorage.getItem('bosses');
      if (json) setBosses(JSON.parse(json));
    };
    load();
  }, []);

  // 🔁 Optional: choose a map based on zone, level, etc.
  const currentMap = require('../assets/maps/cyber_map_bg.png');

  return (
    <ImageBackground
      source={currentMap}
      style={styles.map}
      resizeMode="cover"
    >
      {bosses.map((boss, index) => {
        const top = 100 + index * 80;
        const left = 60 + (index % 2 === 0 ? 0 : 120);

        return (
          <TouchableOpacity
            key={boss.id}
            onPress={() => navigation.navigate('BossDetailScreen', { bossId: boss.id })}
            style={[
              styles.bossNode,
              {
                top,
                left,
                backgroundColor: boss.isDefeated ? '#4caf50' : theme.accent,
              },
            ]}
          >
            <Text style={styles.bossText}>
            {`${getBossIcon(boss.tier)} ${boss.title}`}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  map: {
    flex: 1,
    width: width,
    height: height,
  },
  bossNode: {
    position: 'absolute',
    padding: 10,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#fff',
  },
  bossText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
