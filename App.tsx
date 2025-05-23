import 'react-native-gesture-handler'; // ✅ Must be FIRST import
import React, {useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StyleSheet,  } from 'react-native';
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
import ActivityHistoryScreen from './screens/ActivityHistoryScreen';
import QuestJournalScreen from './screens/QuestJournalScreen';
import LeaderboardScreen from './screens/LeaderboardScreen'
import { Asset } from 'expo-asset';
import * as SplashScreen from 'expo-splash-screen';
import { PetImageMap, BadgeImageMap } from './utils/AssetManager'; // Adjust path
import StartupScreen from './screens/StartupScreen';
import ProfileScreen from './screens/ProfileScreen'; 

const preloadAssets = async () => {
  const images = [
    ...Object.values(PetImageMap),
    ...Object.values(BadgeImageMap),
  ];

  const cacheImages = images.map((img) => Asset.fromModule(img).downloadAsync());
  await Promise.all(cacheImages);
};


const Stack = createNativeStackNavigator();

export default function App() {
  useEffect(() => {
    const load = async () => {
      await SplashScreen.preventAutoHideAsync();
      await preloadAssets();
      await SplashScreen.hideAsync();
    };
    load();
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider>
    <NavigationContainer>
          <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="StartupScreen" component={StartupScreen} />
            <Stack.Screen name="ClassSelectScreen" component={ClassSelectScreen} />
            <Stack.Screen name="TaskScreen" component={TaskScreen} options={{
              gestureEnabled: false, // 🔒 Disable swipe back
            }} />
            <Stack.Screen name="ProfileScreen" component={ProfileScreen} />
            <Stack.Screen name="RewardStoreScreen" component={RewardStoreScreen} />
            <Stack.Screen name="RoleShopScreen" component={RoleShopScreen} />
            <Stack.Screen name="BossMapScreen" component={BossMapScreen} />
            <Stack.Screen name="BossDetailScreen" component={BossDetailScreen} />
            <Stack.Screen name="BossQuestScreen" component={BossQuestScreen} />
            <Stack.Screen name="CreateBossScreen" component={CreateBossScreen} />
            <Stack.Screen name="ThemeGalleryScreen" component={ThemeGalleryScreen} />
            <Stack.Screen name="QuestJournalScreen" component={QuestJournalScreen} />
            <Stack.Screen name="ActivityHistoryScreen" component={ActivityHistoryScreen} />
            <Stack.Screen name="ClassQuestScreen" component={ClassQuestScreen} />
            <Stack.Screen name="LeaderboardScreen" component={LeaderboardScreen} />
          </Stack.Navigator>
        </NavigationContainer>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}