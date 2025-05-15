import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import TaskScreen from './TaskScreen';
import BossMapScreen from './BossMapScreen';
import RewardStoreScreen from './RewardStoreScreen';
import { Ionicons } from '@expo/vector-icons'; // or your cyberpunk icons

const Tab = createBottomTabNavigator();

export default function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: { backgroundColor: '#0d0c1d', borderTopWidth: 0 },
        tabBarActiveTintColor: '#00f9ff',
        tabBarInactiveTintColor: '#666',
        tabBarIcon: ({ color, size }) => {
          if (route.name === 'Tasks') {
            return <Ionicons name="checkbox" size={size} color={color} />;
          } else if (route.name === 'Boss Map') {
            return <Ionicons name="map" size={size} color={color} />;
          } else if (route.name === 'Rewards') {
            return <Ionicons name="trophy" size={size} color={color} />;
          }
        },
      })}
    >
      <Tab.Screen name="Tasks" component={TaskScreen} />
      <Tab.Screen name="Boss Map" component={BossMapScreen} />
      <Tab.Screen name="Rewards" component={RewardStoreScreen} />
    </Tab.Navigator>
  );
}
