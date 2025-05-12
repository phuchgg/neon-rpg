import React, { useRef, useMemo, useState, useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import BottomSheet from '@gorhom/bottom-sheet';
import { useTheme } from '../contexts/ThemeContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Quest } from '../utils/type'; // Adjust this path if needed

const screenHeight = Dimensions.get('window').height;


export default function QuestHubBottomSheet({ onClose }: { onClose: () => void }) {
  const { theme } = useTheme();
  const sheetRef = useRef<BottomSheet>(null);

  const snapPoints = useMemo(() => [screenHeight * 0.6], []);

  const [activeTab, setActiveTab] = useState<'journal' | 'history' | 'class'>('journal');

  const [quests, setQuests] = useState<Quest[]>([]);

  useEffect(() => {
    const loadQuests = async () => {
      const stored = await AsyncStorage.getItem('quests');
      if (stored) {
        setQuests(JSON.parse(stored));
      }
    };
    loadQuests();
  }, []);

  const renderContent = () => {
    let filteredQuests: Quest[] = [];
  
    switch (activeTab) {
      case 'journal':
        filteredQuests = quests.filter(q => !q.isComplete);
        break;
      case 'history':
        filteredQuests = quests.filter(q => q.isComplete);
        break;
      case 'class':
        filteredQuests = quests.filter(q => q.type === 'class');
        break;
      default:
        return null;
    }
  
    if (filteredQuests.length === 0) {
      return <Text style={styles.contentText}>No quests found.</Text>;
    }
  
    return filteredQuests.map(q => (
      <View key={q.id} style={{ marginBottom: 10 }}>
        <Text style={styles.contentText}>
          {q.title} {q.isComplete ? '✅' : `${Math.floor(q.progress)}%`}
        </Text>
      </View>
    ));
  };
  

  return (
    <BottomSheet
      ref={sheetRef}
      index={0}
      snapPoints={snapPoints}
      backgroundStyle={{ backgroundColor: '#1a1a2e', borderTopLeftRadius: 20, borderTopRightRadius: 20 }}
      handleIndicatorStyle={{ backgroundColor: '#00f9ff' }}
      enablePanDownToClose
      onClose={onClose}
    >
      <View style={styles.tabBar}>
        <TouchableOpacity onPress={() => setActiveTab('journal')} style={styles.tabButton}>
          <Text style={[styles.tabText, activeTab === 'journal' && styles.activeTab]}>📔 Journal</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setActiveTab('history')} style={styles.tabButton}>
          <Text style={[styles.tabText, activeTab === 'history' && styles.activeTab]}>📜 History</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setActiveTab('class')} style={styles.tabButton}>
          <Text style={[styles.tabText, activeTab === 'class' && styles.activeTab]}>🧑‍💼 Class</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.content}>
        {renderContent()}
      </View>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: '#00f9ff44',
  },
  tabButton: {
    padding: 10,
  },
  tabText: {
    color: '#888',
    fontWeight: '600',
  },
  activeTab: {
    color: '#00f9ff',
    textShadowColor: '#00f9ff',
    textShadowRadius: 6,
  },
  content: {
    padding: 20,
  },
  contentText: {
    color: '#fff',
    fontSize: 16,
  },
});
