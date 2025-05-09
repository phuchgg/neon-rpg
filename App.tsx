import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StyleSheet } from 'react-native';
import ClassSelectScreen from './screens/ClassSelectScreen';
import TaskScreen from './screens/TaskScreen';
import RoleShopScreen from './screens/RoleShopScreen';
import BossQuestScreen from './screens/BossQuestScreen';
import CreateBossScreen from './screens/CreateBossScreen';
import BossDetailScreen from './screens/BossDetailScreen';
import RewardStoreScreen from './screens/RewardStoreScreen';
import { ThemeProvider } from './contexts/ThemeContext'; 
import ThemeGalleryScreen from './screens/ThemeGalleryScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <ThemeProvider>
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="ClassSelectScreen" component={ClassSelectScreen} />
          <Stack.Screen name="TaskScreen" component={TaskScreen} />
          <Stack.Screen name="BossDetailScreen" component={BossDetailScreen} />
          <Stack.Screen name="RoleShopScreen" component={RoleShopScreen} />
          <Stack.Screen name="BossQuestScreen" component={BossQuestScreen} />
          <Stack.Screen name="CreateBossScreen" component={CreateBossScreen} />
          <Stack.Screen name="RewardStoreScreen" component={RewardStoreScreen} />
          <Stack.Screen name="ThemeGalleryScreen" component={ThemeGalleryScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </ThemeProvider>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0d0c1d',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    color: '#00f9ff',
    fontWeight: 'bold',
  },
  subtitles: {
    fontSize: 16,
    color: '#cfcfcf',
    marginTop: 8,
  },
});