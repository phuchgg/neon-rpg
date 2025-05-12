import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    FlatList,
    StyleSheet,
    TouchableOpacity,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Progress from 'react-native-progress';
import { useNavigation, useFocusEffect, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Boss } from '../utils/type'
import { RootStackParamList } from '../utils/navigation';


type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'BossQuestScreen'>;

type BossQuestRoute = {
    params?: {
        refreshed?: boolean;
    };
};


export default function BossQuestScreen() {
    const [bosses, setBosses] = useState<Boss[]>([]);
    const navigation = useNavigation<NavigationProp>();
    const route = useRoute() as BossQuestRoute;
    useEffect(() => {
        loadBosses();
    }, []);

    useFocusEffect(
        React.useCallback(() => {
            const shouldRefresh = route?.params?.refreshed;
            if (shouldRefresh) {
                loadBosses();
            }
        }, [route])
    );

    const loadBosses = async () => {
        const json = await AsyncStorage.getItem('bosses');
        if (json) {
            let loadedBosses: Boss[] = JSON.parse(json);

            loadedBosses = loadedBosses.map((boss) => {
                const defaultTotalXp = boss.tier === 'mega' ? 10000 : boss.tier === 'elite' ? 6000 : 3000;

                const totalXp = boss.totalXp ?? defaultTotalXp;
                const xpRemaining = boss.xpRemaining ?? totalXp;
                const progress = Math.min(100, ((totalXp - xpRemaining) / totalXp) * 100);

                return {
                    ...boss,
                    totalXp,
                    xpRemaining,
                    progress,  // ✅ calculate from current values
                };
            });

            await AsyncStorage.setItem('bosses', JSON.stringify(loadedBosses));
            setBosses(loadedBosses);
        } else {
            // Dummy data (include totalXp & xpRemaining)
            const starterBosses: Boss[] = [
                {
                    id: 'boss1',
                    title: '🚗 Get Driver License',
                    description: 'Complete theory + practical lessons.',
                    isDefeated: false,
                    createdAt: Date.now(),
                    tier: 'mini',
                    totalXp: 3000,
                    xpRemaining: 2100,  // 30% progress
                    progress: ((3000 - 2100) / 3000) * 100,
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
                color={item.isDefeated ? '#4caf50' : '#00f9ff'}
                borderWidth={0}
                unfilledColor="#1a1a1a"
            />
            <Text style={styles.progressText}>
                {`${item.progress.toFixed(1)}% ${item.isDefeated ? '✅ Defeated' : ''}`}
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
            <TouchableOpacity style={styles.addButton} onPress={() => navigation.navigate('CreateBossScreen')}>
                <Text style={styles.addButtonText}>+ Add Boss</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0d0c1d',
        padding: 20,
        paddingTop: 60,
    },
    header: {
        fontSize: 24,
        color: '#00f9ff',
        fontWeight: 'bold',
        marginBottom: 16,
    },
    card: {
        backgroundColor: '#1a1a2e',
        borderRadius: 10,
        padding: 16,
        marginBottom: 16,
    },
    defeated: {
        borderColor: '#4caf50',
        borderWidth: 1,
        opacity: 0.6,
    },
    title: {
        fontSize: 18,
        color: '#00f9ff',
        marginBottom: 6,
    },
    desc: {
        color: '#ccc',
        marginBottom: 8,
    },
    progressText: {
        marginTop: 4,
        fontSize: 12,
        color: '#aaa',
    },
    addButton: {
        backgroundColor: '#00f9ff33',
        padding: 14,
        borderRadius: 8,
        alignItems: 'center',
        borderColor: '#00f9ff',
        borderWidth: 1,
        marginTop: 10,
    },
    addButtonText: {
        color: '#00f9ff',
        fontWeight: '600',
    },
    tierIcon: {
        fontSize: 18,
        marginBottom: 6,
    },
});
