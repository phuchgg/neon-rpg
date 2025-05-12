import 'react-native-gesture-handler'; // ✅ Must be FIRST import
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler'; // ✅ Required root view
import ClassSelectScreen from './screens/ClassSelectScreen';
import TaskScreen from './screens/TaskScreen';
import RoleShopScreen from './screens/RoleShopScreen';
import BossQuestScreen from './screens/BossQuestScreen';
import CreateBossScreen from './screens/CreateBossScreen';
import BossDetailScreen from './screens/BossDetailScreen';
import RewardStoreScreen from './screens/RewardStoreScreen';
import { ThemeProvider } from './contexts/ThemeContext';
import ThemeGalleryScreen from './screens/ThemeGalleryScreen';
import BossMapScreen from './screens/BossMapScreen';
import ClassQuestScreen from './screens/ClassQuestScreen';
import QuestHistoryScreen from './screens/QuestHistoryScreen';
import QuestJournalScreen from './screens/QuestJournalScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}> 
      <ThemeProvider>
        <NavigationContainer>
          <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="ClassSelectScreen" component={ClassSelectScreen} />
            <Stack.Screen name="TaskScreen" component={TaskScreen} />
            <Stack.Screen name="BossMapScreen" component={BossMapScreen} />
            <Stack.Screen name="BossDetailScreen" component={BossDetailScreen} />
            <Stack.Screen name="BossQuestScreen" component={BossQuestScreen} />
            <Stack.Screen name="CreateBossScreen" component={CreateBossScreen} />
            <Stack.Screen name="RewardStoreScreen" component={RewardStoreScreen} />
            <Stack.Screen name="RoleShopScreen" component={RoleShopScreen} />
            <Stack.Screen name="ThemeGalleryScreen" component={ThemeGalleryScreen} />
            <Stack.Screen name="QuestJournalScreen" component={QuestJournalScreen} />
            <Stack.Screen name="QuestHistoryScreen" component={QuestHistoryScreen} />
            <Stack.Screen name="ClassQuestScreen" component={ClassQuestScreen} />
          </Stack.Navigator>
        </NavigationContainer>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}