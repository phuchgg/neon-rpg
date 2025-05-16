import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { PanGestureHandler, PanGestureHandlerGestureEvent } from 'react-native-gesture-handler';
import Animated, { useAnimatedGestureHandler, useAnimatedStyle, useSharedValue, withSpring, runOnJS } from 'react-native-reanimated';
import { BlurView } from 'expo-blur';
import { Task, Boss } from '../utils/type';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../utils/navigation';
import AssetManager from '../utils/AssetManager'; // ✅ Import centralized assets

type Props = {
  item: Task;
  bosses: Boss[];
  onToggleTask: (id: string) => void;
  onDeleteTask: (id: string) => void;
  theme: any;
};

const SWIPE_THRESHOLD = 200;

export default function SwipeToDeleteTaskRow({ item, bosses, onToggleTask, onDeleteTask, theme }: Props) {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const translateX = useSharedValue(0);

  const gestureHandler = useAnimatedGestureHandler<PanGestureHandlerGestureEvent>({
    onActive: (event) => {
      translateX.value = Math.min(0, event.translationX);
    },
    onEnd: () => {
      if (translateX.value < -SWIPE_THRESHOLD) {
        runOnJS(onDeleteTask)(item.id);
      } else {
        translateX.value = withSpring(0);
      }
    },
  });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const blurStyle = useAnimatedStyle(() => ({
    opacity: Math.min(1, Math.abs(translateX.value) / SWIPE_THRESHOLD),
  }));

  const getBossIcon = (tier: Boss['tier']) => {
    return AssetManager.BossIcons[tier] || AssetManager.BossIcons.mini;
  };

  const boss = item.bossId ? bosses.find((b) => b.id === item.bossId) : null;

  return (
    <PanGestureHandler onGestureEvent={gestureHandler}>
      <Animated.View style={[styles.taskRow, animatedStyle]}>
        <Animated.View style={[StyleSheet.absoluteFillObject, blurStyle]}>
          <BlurView intensity={50} style={StyleSheet.absoluteFillObject} />
        </Animated.View>

        <TouchableOpacity onPress={() => onToggleTask(item.id)} style={{ flex: 1 }}>
          <View style={styles.taskRowContent}>
            <TouchableOpacity
              onPress={() => onToggleTask(item.id)}
              style={[
                styles.checkboxButton,
                { borderColor: theme.accent },
                item.completed && { backgroundColor: theme.accent },
              ]}
            >
              {item.completed && <Text style={[styles.checkmark, { color: theme.background }]}>✔️</Text>}
            </TouchableOpacity>

            <Text numberOfLines={1} ellipsizeMode="tail" style={styles.taskText}>
              {item.title}
            </Text>
          </View>
        </TouchableOpacity>

        {boss && (
          <TouchableOpacity
            onPress={() => navigation.navigate('BossDetailScreen', { bossId: boss.id })}
            style={{ marginLeft: 10, flexDirection: 'row', alignItems: 'center' }}
          >
            <Image source={getBossIcon(boss.tier)} style={{ width: 18, height: 18, marginRight: 4 }} resizeMode="contain" />
            <Text numberOfLines={1} ellipsizeMode="tail" style={styles.bossLabel}>
              {boss.title} — {boss.progress}% {boss.isDefeated ? '✅' : ''}
            </Text>
          </TouchableOpacity>
        )}
      </Animated.View>
    </PanGestureHandler>
  );
}

const styles = StyleSheet.create({
  taskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1a1a2e',
    borderRadius: 8,
    marginBottom: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    overflow: 'hidden',
  },
  taskRowContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  checkboxButton: {
    width: 18,
    height: 18,
    borderRadius: 12,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  checkmark: {
    fontSize: 8,
    fontWeight: 'bold',
  },
  taskText: {
    fontSize: 16,
    color: '#fff',
  },
  bossLabel: {
    color: '#aaa',
    fontSize: 12,
    fontStyle: 'italic',
  },
});
