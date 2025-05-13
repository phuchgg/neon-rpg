import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, Alert, Animated } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../contexts/ThemeContext';
import { XPManager } from '../utils/XPManager';
import { useFocusEffect } from '@react-navigation/native';
import LottieView from 'lottie-react-native';

const podiumColors = {
  1: '#FFD700', // Vàng
  2: '#C0C0C0', // Bạc
  3: '#CD7F32', // Đồng
};

export default function LeaderboardScreen() {
  const { theme } = useTheme();
  const styles = makeStyles(theme);
  const [players, setPlayers] = useState<any[]>([]);
  const [showGlow, setShowGlow] = useState(false);

  const loadData = async () => {
    const simPlayers = JSON.parse(await AsyncStorage.getItem('simPlayers') || '[]');
    const xp = await XPManager.getXp();

    const progress = JSON.parse(await AsyncStorage.getItem('userMonthlyProgress') || '{"tasksCompleted":0,"bossesDefeated":0,"monthlyXp":0}');
const user = { id: 'me', name: 'Max', xp: progress.monthlyXp, tasksCompleted: progress.tasksCompleted, bossesDefeated: progress.bossesDefeated };

    const combined = [...simPlayers, user];
    combined.sort((a, b) => {
        if (b.xp !== a.xp) return b.xp - a.xp;
        if (b.bossesDefeated !== a.bossesDefeated) return b.bossesDefeated - a.bossesDefeated;
        return b.tasksCompleted - a.tasksCompleted;
      });
      

    setPlayers(combined);

    if (combined[0].id === 'me') {
      setShowGlow(true);
      setTimeout(() => setShowGlow(false), 3000);
    }
  };

  useEffect(() => { loadData(); }, []);

  useFocusEffect(
    useCallback(() => {
      const checkEndOfMonth = async () => {
        const now = new Date();
        if (now.getDate() === 30) {
          const simPlayers = JSON.parse(await AsyncStorage.getItem('simPlayers') || '[]');
          const xp = await XPManager.getXp();
          const progress = JSON.parse(await AsyncStorage.getItem('userMonthlyProgress') || '{"tasksCompleted":0,"bossesDefeated":0}');
const user = { id: 'me', name: 'Max', xp, ...progress };
          const combined = [...simPlayers, user];
          combined.sort((a, b) => b.xp - a.xp);

          if (combined[0].id === 'me') {
            Alert.alert('🎉 Bạn đứng TOP 1!', 'Vinh danh đỉnh cao tháng này!');
            setShowGlow(true);
            setTimeout(() => setShowGlow(false), 3000);
          }
        }
        if (now.getDate() === 30) {
            await AsyncStorage.removeItem(USER_MONTHLY_PROGRESS_KEY);
            console.log('🔄 Monthly Progress reset for new month');
          }
      };
      checkEndOfMonth();
      
    }, [])
  );

  const renderPlayer = ({ item, index }: { item: any; index: number }) => {
    const isPodium = index < 3;
    const podiumColor = isPodium ? podiumColors[index + 1] : null;

    return (
      <View style={[
        styles.row,
        isPodium && {
          borderColor: podiumColor,
          borderWidth: 2,
          shadowColor: podiumColor,
          shadowOpacity: 0.8,
          shadowRadius: 10,
        }
      ]}>
        <Text style={[styles.rank, isPodium && { color: podiumColor }]}>{index + 1}.</Text>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.stats}>🧬 {item.xp} XP | ✅ {item.tasksCompleted} tasks | 👑 {item.bossesDefeated} bosses</Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>🏆 Bảng Xếp Hạng Tháng</Text>

      <FlatList
        data={players}
        keyExtractor={(item) => item.id}
        renderItem={renderPlayer}
        contentContainerStyle={{ paddingBottom: 40 }}
      />

      {showGlow && (
        <LottieView
          source={require('../assets/lotties/top1-glow.json')}
          autoPlay
          loop={false}
          style={styles.glowLottie}
        />
      )}
    </View>
  );
}

const makeStyles = (theme: typeof import('../utils/themes').themes.default) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.background, padding: 20, paddingTop: 60 },
    header: { fontSize: 24, color: theme.accent, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 12,
      backgroundColor: theme.background,
      borderRadius: 10,
      marginBottom: 10,
      borderWidth: 1,
      borderColor: theme.accent,
    },
    rank: { fontSize: 18, fontWeight: 'bold', width: 30 },
    name: { color: theme.accent, fontSize: 16, flex: 1 },
    stats: { color: theme.text, fontSize: 12 },
    glowLottie: {
      position: 'absolute',
      top: 80,
      alignSelf: 'center',
      width: 200,
      height: 200,
      zIndex: 10,
    },
  });
