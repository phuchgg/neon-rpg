import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../utils/navigation';

const CLASS_SWITCH_COST = 50;

const classOptions = [
  {
    id: 'ghostrunner',
    name: '🏃 Ghostrunner',
    bonus: '+20% XP for fast tasks (≤10 chars)',
  },
  {
    id: 'netcrasher',
    name: '💻 Netcrasher',
    bonus: '+5 XP for code/debug/study tasks',
  },
  {
    id: 'synthmancer',
    name: '🔮 Synthmancer',
    bonus: '+2 XP per task (flat bonus)',
  },
];

type RoleShopScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'RoleShopScreen'>;
};

export default function RoleShopScreen({ navigation }: RoleShopScreenProps) {
  const [currentClass, setCurrentClass] = useState('');
  const [xp, setXp] = useState(0);

  useEffect(() => {
    const loadData = async () => {
      const storedClass = await AsyncStorage.getItem('playerClass');
      const storedXp = await AsyncStorage.getItem('xp');
      if (storedClass) setCurrentClass(storedClass);
      if (storedXp) setXp(parseInt(storedXp));
    };
    loadData();
  }, []);

  const handleClassSwitch = async (newClassId: string) => {
    if (newClassId === currentClass) return;

    if (xp < CLASS_SWITCH_COST) {
      Alert.alert('Not enough XP', `You need ${CLASS_SWITCH_COST} XP to change your class.`);
      return;
    }

    Alert.alert(
      'Confirm Switch',
      `Change to ${newClassId}? This will cost ${CLASS_SWITCH_COST} XP.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          onPress: async () => {
            const newXp = xp - CLASS_SWITCH_COST;
            await AsyncStorage.setItem('xp', newXp.toString());
            await AsyncStorage.setItem('playerClass', newClassId);
            setXp(newXp);
            setCurrentClass(newClassId);
            Alert.alert('Class changed!', `You are now a ${newClassId}.`);
            navigation.goBack();
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🧬 Switch Your Role</Text>
      <Text style={styles.current}>Current: {currentClass || 'Unknown'} | XP: {xp}</Text>
      {classOptions.map((cls) => (
        <TouchableOpacity
          key={cls.id}
          style={[styles.card, cls.id === currentClass && styles.disabled]}
          onPress={() => handleClassSwitch(cls.id)}
          disabled={cls.id === currentClass}
        >
          <Text style={styles.name}>{cls.name}</Text>
          <Text style={styles.bonus}>{cls.bonus}</Text>
          {cls.id === currentClass && <Text style={styles.lock}>✅ Currently Equipped</Text>}
        </TouchableOpacity>
      ))}
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
  title: {
    fontSize: 22,
    color: '#00f9ff',
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
  },
  current: {
    color: '#ccc',
    textAlign: 'center',
    marginBottom: 24,
  },
  card: {
    backgroundColor: '#1a1a2e',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#00f9ff66',
  },
  disabled: {
    opacity: 0.4,
  },
  name: {
    color: '#00f9ff',
    fontSize: 18,
    fontWeight: '600',
  },
  bonus: {
    color: '#fefefe',
    fontStyle: 'italic',
    marginBottom: 6,
  },
  lock: {
    color: '#aaa',
    fontSize: 14,
  },
});
