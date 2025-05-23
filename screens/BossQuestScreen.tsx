import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Image,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Progress from 'react-native-progress';
import { useNavigation, useFocusEffect, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Boss } from '../utils/type';
import { RootStackParamList } from '../utils/navigation';
import { useTheme } from '../contexts/ThemeContext';
import AssetManager from '../utils/AssetManager';
import { syncToFirestore } from '../utils/syncToFirestore';


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
      await syncToFirestore();
      setBosses(updated);
    } else {
      const starterBosses: Boss[] = [
  {
    id: 'boss1',
    title: 'Lấy Bằng Lái Xe',
    description: 'Hoàn thành lý thuyết + thực hành.',
    isDefeated: false,
    createdAt: Date.now(),
    tier: 'mini',
    totalXp: 3000,
    xpRemaining: 2100,
    progress: 30,
  },
  {
    id: 'boss2',
    title: 'Ra Mắt Portfolio',
    description: 'Thiết kế và triển khai lên GitHub Pages.',
    isDefeated: true,
    createdAt: Date.now(),
    tier: 'mega',
    totalXp: 5000,
    xpRemaining: 0,
    progress: 100,
  },
];
      await AsyncStorage.setItem('bosses', JSON.stringify(starterBosses));
      await syncToFirestore();
      setBosses(starterBosses);
    }
  };

  const getBossImage = (tier: Boss['tier']) => AssetManager.BossIcons[tier] || AssetManager.BossIcons.mini;


  const renderBoss = ({ item }: { item: Boss }) => (
    <View style={[styles.card, item.isDefeated && styles.defeated]}>
      <View style={styles.headerRow}>
        <Image
          source={getBossImage(item.tier)}
          style={styles.bossImage}
          resizeMode="contain"
        />
        <View style={styles.textBlock}>
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.desc}>{item.description}</Text>
        </View>
      </View>

<View style={styles.progressBarContainer}>
  <Progress.Bar
    progress={Math.min(1, item.progress / 100)}
    height={12}  // larger height
    borderRadius={12}
    width={null} // makes it flex
    color={item.isDefeated ? '#4caf50' : theme.accent}
    borderWidth={0}
    unfilledColor="#1a1a1a"
  />
</View>
<Text style={styles.progressText}>
  {`${item.progress}% ${item.isDefeated ? '✅ Đã đánh bại' : ''}`}
</Text>

    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Nhiệm vụ Boss</Text>
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
            Alert.alert('⚠️ Giới hạn Boss', 'Bạn chỉ có thể thêm 6 Boss tối đa cùng lúc.');
            return;
          }
          navigation.navigate('CreateBossScreen');
        }}
      >
        <Text style={styles.addButtonText}>+ Thêm Boss</Text>
      </TouchableOpacity>
    </View>
  );
}

const makeStyles = (theme: typeof import('../utils/themes').themes.default) => {
  const addButtonBg = `${theme.accent}22`;
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.background, padding: 20, paddingTop: 60 },
    header: { fontSize: 24, color: theme.accent, fontWeight: 'bold', marginBottom: 16, textAlign: 'center', alignSelf: 'center'},
    card: { backgroundColor: theme.background, borderRadius: 10, padding: 16, marginBottom: 16 },
    defeated: { borderColor: '#4caf50', borderWidth: 1, opacity: 0.6 },
    headerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
    bossImage: { width: 48, height: 48, marginRight: 12 },
    textBlock: { flex: 1 },
    title: { fontSize: 18, color: theme.accent, marginBottom: 4 },
    desc: { color: theme.text, marginBottom: 4 },
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
    progressBarContainer: {
  width: '100%',
  marginTop: 8,
},
  });
};
