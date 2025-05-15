import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import uuid from 'react-native-uuid';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Picker } from '@react-native-picker/picker';
import { Boss } from '../utils/type';
import { RootStackParamList } from '../utils/navigation';
import { useTheme } from '../contexts/ThemeContext';
import CrossPlatformPicker from '../contexts/CrossPlatformPicker';

type CreateBossScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'CreateBossScreen'>;
};

export default function CreateBossScreen({ navigation }: CreateBossScreenProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedTier, setSelectedTier] = useState<'mini' | 'elite' | 'mega'>('mini');
  const [bosses, setBosses] = useState<Boss[]>([]);
  const [selectedUnlockIds, setSelectedUnlockIds] = useState<string[]>([]);
  const { theme } = useTheme();
  const styles = makeStyles(theme);

  useEffect(() => {
    const loadBosses = async () => {
      const stored = await AsyncStorage.getItem('bosses');
      if (stored) setBosses(JSON.parse(stored));
    };
    loadBosses();
  }, []);

  const handleToggleUnlock = (bossId: string) => {
    setSelectedUnlockIds((prev) =>
      prev.includes(bossId) ? prev.filter((id) => id !== bossId) : [...prev, bossId]
    );
  };

  const handleCreate = async () => {
    if (title.trim() === '') {
      Alert.alert('Missing title', 'Please enter a title for your boss quest.');
      return;
    }
  
    const stored = await AsyncStorage.getItem('bosses');
    const bosses = stored ? JSON.parse(stored) : [];
  
    // ✅ LIMIT CHECK HERE
    if (bosses.length >= 8) {
      Alert.alert('⚠️ Limit Reached', 'You can only have up to 8 bosses at a time.');
      return;
    }
  
    const newBoss: Boss = {
      id: uuid.v4().toString(),
      title: title.trim(),
      description: description.trim() || 'Defeat me!',
      progress: 0,
      isDefeated: false,
      createdAt: Date.now(),
      totalXp: 100,
      xpRemaining: 100,
      tier: selectedTier,
      unlockAfter: selectedUnlockIds,
    };
  
    bosses.push(newBoss);
    await AsyncStorage.setItem('bosses', JSON.stringify(bosses));
  
    Alert.alert('Boss Created!', `You've launched "${newBoss.title}".`);
    navigation.navigate('BossQuestScreen', { refreshed: true });
    navigation.goBack();  // ✅ Simple goBack, no params needed
  };
  

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>🎮 New Boss Quest</Text>

      <TextInput
        style={styles.input}
        placeholder="Boss Title"
        placeholderTextColor="#777"
        value={title}
        onChangeText={setTitle}
      />

      <TextInput
        style={[styles.input, styles.textArea]}
        placeholder="Description (optional)"
        placeholderTextColor="#777"
        value={description}
        onChangeText={setDescription}
        multiline
        numberOfLines={4}
      />

      <Text style={styles.label}>Select Boss Tier:</Text>
      <CrossPlatformPicker
  selectedValue={selectedTier}
  options={[
    { label: 'Mini Boss', value: 'mini' },
    { label: 'Elite Boss', value: 'elite' },
    { label: 'Mega Boss', value: 'mega' },
  ]}
  onValueChange={(value) => setSelectedTier(value)}
  theme={theme}
  style={{ marginBottom: 16 }}
/>

      <Text style={styles.label}>Unlocks After:</Text>
      {bosses.map((b) => (
        <TouchableOpacity
          key={b.id}
          style={[
            styles.unlockItem,
            selectedUnlockIds.includes(b.id) && styles.unlockItemSelected,
          ]}
          onPress={() => handleToggleUnlock(b.id)}
        >
          <Text style={{ color: theme.text }}>
            {`${selectedUnlockIds.includes(b.id) ? '✅' : '⬜️'} ${b.title ?? 'Untitled'}`}
          </Text>
        </TouchableOpacity>
      ))}

      <TouchableOpacity style={styles.button} onPress={handleCreate}>
        <Text style={styles.buttonText}>Launch Quest</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const makeStyles = (theme: typeof import('../utils/themes').themes.default) => {
  const accentBg = `${theme.accent}22`;
  const buttonBg = `${theme.accent}33`;

  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
      padding: 24,
      paddingTop: 60,
    },
    header: {
      fontSize: 24,
      color: theme.accent,
      fontWeight: 'bold',
      marginBottom: 20,
      textAlign: 'center',
    },
    input: {
      backgroundColor: '#1a1a2e',
      color: theme.text,
      padding: 12,
      borderRadius: 8,
      marginBottom: 16,
    },
    textArea: {
      height: 100,
      textAlignVertical: 'top',
    },
    label: {
      color: theme.text,
      marginBottom: 6,
      fontWeight: 'bold',
    },
    picker: {
      backgroundColor: '#1a1a2e',
      color: theme.text,
      marginBottom: 16,
    },
    unlockItem: {
      padding: 10,
      backgroundColor: '#1f1f2e',
      borderRadius: 6,
      marginBottom: 8,
    },
    unlockItemSelected: {
      backgroundColor: accentBg,
    },
    button: {
      backgroundColor: buttonBg,
      borderColor: theme.accent,
      borderWidth: 1,
      padding: 14,
      borderRadius: 10,
      alignItems: 'center',
      marginTop: 10,
    },
    buttonText: {
      color: theme.accent,
      fontWeight: '600',
      fontSize: 16,
    },
  });
};
