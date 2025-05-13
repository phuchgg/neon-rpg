import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Progress from 'react-native-progress';
import { useNavigation, useFocusEffect, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Boss } from '../utils/type';
import { RootStackParamList } from '../utils/navigation';
import { useTheme } from '../contexts/ThemeContext';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'BossQuestScreen'>;

type BossQuestRoute = {
  params?: { refreshed?: boolean };
};

export default function BossQuestScreen() {
  const [bosses, setBosses] = useState<Boss[]>([]);
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute() as BossQuestRoute;
  const { theme } = useTheme();
  const styles = makeStyles(theme);

  useEffect(() => {
    loadBosses();
  }, []);

  useFocusEffect(
    useCallback(() => {
      if (route?.params?.refreshed) loadBosses();
    }, [route])
  );

  const loadBosses = async () => {
    const json = await AsyncStorage.getItem('bosses');
    if (json) {
      const loaded = JSON.parse(json) as Boss[];
      const updated = loaded.map((b) => {
        const totalXp = b.totalXp ?? (b.tier === 'mega' ? 10000 : b.tier === 'elite' ? 6000 : 3000);
        const xpRemaining = b.xpRemaining ?? totalXp;
        const progress = Math.min(100, ((totalXp - xpRemaining) / totalXp) * 100);
        return { ...b, totalXp, xpRemaining, progress };
      });
      await AsyncStorage.setItem('bosses', JSON.stringify(updated));
      setBosses(updated);
    } else {
      const starterBosses: Boss[] = [
        {
          id: 'boss1',
          title: '🚗 Get Driver License',
          description: 'Complete theory + practical lessons.',
          isDefeated: false,
          createdAt: Date.now(),
          tier: 'mini',
          totalXp: 3000,
          xpRemaining: 2100,
          progress: 30,
        },
        {
          id: 'boss2',
          title: '🌐 Launch Portfolio Website',
          description: 'Finish design + deploy to GitHub Pages.',
          isDefeated: true,
          createdAt: Date.now(),
          tier: 'mega',
          totalXp: 5000,
          xpRemaining: 0,
          progress: 100,
        },
      ];
      await AsyncStorage.setItem('bosses', JSON.stringify(starterBosses));
      setBosses(starterBosses);
    }
  };

  const renderBoss = ({ item }: { item: Boss }) => (
    <View style={[styles.card, item.isDefeated && styles.defeated]}>
      <Text style={styles.title}>{item.title}</Text>
      <Text style={styles.tierIcon}>
        {item.tier === 'mini' && '🧩'}
        {item.tier === 'elite' && '🔥'}
        {item.tier === 'mega' && '👑'}
      </Text>
      <Text style={styles.desc}>{item.description}</Text>
      <Progress.Bar
        progress={Math.min(1, item.progress / 100)}
        height={12}
        borderRadius={10}
        color={item.isDefeated ? '#4caf50' : theme.accent}
        borderWidth={0}
        unfilledColor="#1a1a1a"
      />
      <Text style={styles.progressText}>
        {`${item.progress}% ${item.isDefeated ? '✅ Defeated' : ''}`}
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>👾 Boss Quests</Text>
      <FlatList
        data={bosses}
        keyExtractor={(item) => item.id}
        renderItem={renderBoss}
        contentContainerStyle={{ paddingBottom: 40 }}
      />
      <TouchableOpacity
  style={styles.addButton}
  onPress={async () => {
    const stored = await AsyncStorage.getItem('bosses');
    const currentBosses = stored ? JSON.parse(stored) : [];
    if (currentBosses.length >= 6) {
      Alert.alert('⚠️ Limit Reached', 'You can only have up to 6 bosses at a time.');
      return;
    }
    navigation.navigate('CreateBossScreen');
  }}
>
  <Text style={styles.addButtonText}>+ Add Boss</Text>
</TouchableOpacity>

    </View>
  );
}

const makeStyles = (theme: typeof import('../utils/themes').themes.default) => {
  const addButtonBg = `${theme.accent}22`;
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.background, padding: 20, paddingTop: 60 },
    header: { fontSize: 24, color: theme.accent, fontWeight: 'bold', marginBottom: 16 },
    card: { backgroundColor: theme.background, borderRadius: 10, padding: 16, marginBottom: 16 },
    defeated: { borderColor: '#4caf50', borderWidth: 1, opacity: 0.6 },
    title: { fontSize: 18, color: theme.accent, marginBottom: 6 },
    desc: { color: theme.text, marginBottom: 8 },
    progressText: { marginTop: 4, fontSize: 12, color: '#aaa' },
    addButton: {
      backgroundColor: addButtonBg,
      padding: 14,
      borderRadius: 8,
      alignItems: 'center',
      borderColor: theme.accent,
      borderWidth: 1,
      marginTop: 10,
    },
    addButtonText: { color: theme.accent, fontWeight: '600' },
    tierIcon: { fontSize: 18, marginBottom: 6 },
  });
};
