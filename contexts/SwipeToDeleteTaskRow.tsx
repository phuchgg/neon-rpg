import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, StyleSheetProperties } from 'react-native';
import { PanGestureHandler, PanGestureHandlerGestureEvent } from 'react-native-gesture-handler';
import Animated, { useAnimatedGestureHandler, useAnimatedStyle, useSharedValue, withSpring, runOnJS } from 'react-native-reanimated';
import { BlurView } from 'expo-blur';
import { Task, Boss } from '../utils/type';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../utils/navigation';

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
      translateX.value = Math.min(0, event.translationX); // only swipe left
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

  return (
    <PanGestureHandler onGestureEvent={gestureHandler}>
      <Animated.View style={[styles.taskRow, animatedStyle]}>
        <Animated.View style={[StyleSheet.absoluteFillObject, blurStyle]}>
          <BlurView intensity={50} style={StyleSheet.absoluteFillObject} />
        </Animated.View>

        <TouchableOpacity onPress={() => onToggleTask(item.id)} style={{ flex: 1 }}>
          <Text numberOfLines={1} ellipsizeMode="tail" style={[styles.taskText, { color: theme.text }, item.completed && styles.completedTask]}>
            {item.completed ? '✅ ' : '🕹️ '} {item.title}
          </Text>
        </TouchableOpacity>

        {item.bossId && (() => {
          const boss = bosses.find((b) => b.id === item.bossId);
          if (!boss) return null;

          return (
            <TouchableOpacity
              onPress={() => navigation.navigate('BossDetailScreen', { bossId: boss.id })}
              style={{ marginLeft: 10 }}
            >
              <Text numberOfLines={1} ellipsizeMode="tail" style={styles.bossLabel}>
                🔗 {boss.title} — {boss.progress}% {boss.isDefeated ? '✅' : ''}
              </Text>
            </TouchableOpacity>
          );
        })()}
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
  completedTask: {
    opacity: 0.6,
    textDecorationLine: 'line-through',
  },
  taskText: {
    fontSize: 16,
  },
  bossLabel: {
    color: '#aaa',
    fontSize: 12,
    marginTop: 4,
    fontStyle: 'italic',
  },
});
