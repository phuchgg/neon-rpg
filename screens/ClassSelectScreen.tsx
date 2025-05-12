import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const classes = [
  {
    id: 'ghostrunner',
    name: '🏃 Ghostrunner',
    lore: 'Move quiet. Move fast. Leave no task behind.',
    bonus: '+20% XP for fast tasks (≤10 chars)',
  },
  {
    id: 'netcrasher',
    name: '💻 Netcrasher',
    lore: 'There is no task too tangled for a line of truth.',
    bonus: '+XP for tasks like “code”, “debug”, “fix”, “study”',
  },
  {
    id: 'synthmancer',
    name: '🔮 Synthmancer',
    lore: 'Balance brings mastery. Consistency is divinity.',
    bonus: '+2 XP for all completed tasks',
  },
  {
    id: 'edgewalker',
    name: '🔥 Edgewalker (Locked)',
    lore: 'They do not chase XP. They hunt legacy.',
    bonus: '+XP for "boss", "project", "long" tasks',
    locked: true,
  },
];

export default function ClassSelectScreen({ navigation }: any) {
  const [selected, setSelected] = useState('');

  useEffect(() => {
    checkClass();
  }, []);

  const checkClass = async () => {
    const saved = await AsyncStorage.getItem('playerClass');
    if (saved) navigation.replace('TaskScreen');
  };

  const chooseClass = async (roleId: string) => {
    await AsyncStorage.setItem('playerClass', roleId);
    Alert.alert('Class Selected!', `Welcome, ${roleId}.`);
    navigation.replace('TaskScreen');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🎭 Choose Your Class</Text>
      {classes.map((role) => (
        <TouchableOpacity
          key={role.id}
          disabled={role.locked}
          style={[styles.card, role.locked && styles.lockedCard]}
          onPress={() => chooseClass(role.id)}
        >
          <Text style={styles.className}>{role.name}</Text>
          <Text style={styles.bonus}>{role.bonus}</Text>
          <Text style={styles.lore}>{role.lore}</Text>
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
    marginBottom: 24,
  },
  card: {
    backgroundColor: '#1a1a2e',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#00f9ff66',
  },
  lockedCard: {
    opacity: 0.4,
  },
  className: {
    fontSize: 18,
    color: '#00f9ff',
    fontWeight: '600',
    marginBottom: 4,
  },
  bonus: {
    color: '#fefefe',
    fontStyle: 'italic',
    marginBottom: 4,
  },
  lore: {
    color: '#ccc',
  },
});
