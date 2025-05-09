import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import uuid from 'react-native-uuid';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

type RootStackParamList = {
    BossQuestScreen: { refreshed?: boolean };
    CreateBossScreen: undefined;
  };

type CreateBossScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'CreateBossScreen'>;
};

export default function CreateBossScreen({ navigation }: CreateBossScreenProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  const handleCreate = async () => {
    if (title.trim() === '') {
      Alert.alert('Missing title', 'Please enter a title for your boss quest.');
      return;
    }

    const newBoss = {
      id: uuid.v4().toString(),
      title: title.trim(),
      description: description.trim(),
      progress: 0,
      isDefeated: false,
      createdAt: Date.now(),
    };

    const stored = await AsyncStorage.getItem('bosses');
    const bosses = stored ? JSON.parse(stored) : [];

    bosses.push(newBoss);
    await AsyncStorage.setItem('bosses', JSON.stringify(bosses));

    Alert.alert('Boss Created!', `You've launched "${newBoss.title}".`);
    navigation.navigate('BossQuestScreen', { refreshed: true });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>🎮 New Boss Quest</Text>

      <TextInput
        style={styles.input}
        placeholder="Boss Title"
        value={title}
        onChangeText={setTitle}
      />
      <TextInput
        style={[styles.input, styles.textArea]}
        placeholder="Description (optional)"
        value={description}
        onChangeText={setDescription}
        multiline
        numberOfLines={4}
      />

      <TouchableOpacity style={styles.button} onPress={handleCreate}>
        <Text style={styles.buttonText}>Launch Quest</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0d0c1d',
    padding: 24,
    paddingTop: 60,
  },
  header: {
    fontSize: 24,
    color: '#00f9ff',
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    backgroundColor: '#1a1a2e',
    color: '#fff',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  button: {
    backgroundColor: '#00f9ff33',
    borderColor: '#00f9ff',
    borderWidth: 1,
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#00f9ff',
    fontWeight: '600',
    fontSize: 16,
  },
});
