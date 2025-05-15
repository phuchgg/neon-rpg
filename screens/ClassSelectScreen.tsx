import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, Image } from 'react-native';
import { Asset } from 'expo-asset';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { classes } from '../utils/classes';

export default function ClassSelectScreen({ navigation }: any) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const init = async () => {
      const saved = await AsyncStorage.getItem('playerClass');
      if (saved) {
        navigation.replace('TaskScreen');
        return;
      }

      // Preload images first!
      const imageAssets = classes.map((role) => Asset.fromModule(role.icon).downloadAsync());
      await Promise.all(imageAssets);

      setReady(true);
    };

    init();
  }, []);

  const chooseClass = async (roleId: string) => {
    await AsyncStorage.setItem('playerClass', roleId);
    Alert.alert('Class Selected!', `Welcome, ${roleId}.`);
    navigation.replace('TaskScreen');
  };

  if (!ready) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#00f9ff" />
        <Text style={styles.loadingText}>Loading classes...</Text>
      </View>
    );
  }

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
          <View style={styles.row}>
            <Image source={role.icon} style={styles.icon} />
            <Text style={styles.className}>{role.name}</Text>
          </View>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0d0c1d',
  },
  loadingText: {
    marginTop: 12,
    color: '#00f9ff',
    fontSize: 16,
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
  icon: {
    width: 32,
    height: 32,
    marginRight: 8,
    resizeMode: 'contain',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
