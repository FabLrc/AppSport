import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import { HomeScreen } from '@/features/training/screens/HomeScreen';
import { BodyTrackingScreen } from '@/features/body-tracking/screens/BodyTrackingScreen';
import { RunningScreen } from '@/features/running/screens/RunningScreen';
import { SettingsScreen } from '@/features/settings/SettingsScreen';
import { theme } from '@/shared/theme';
import { strings } from '@/shared/strings';

import type { MainTabParamList } from './types';

const Tab = createBottomTabNavigator<MainTabParamList>();

export function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopColor: theme.colors.border,
        },
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.textMuted,
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarLabel: strings.tabs.home,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="barbell-outline" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="BodyTracking"
        component={BodyTrackingScreen}
        options={{
          tabBarLabel: strings.bodyTracking.tabLabel,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="body-outline" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Running"
        component={RunningScreen}
        options={{
          tabBarLabel: strings.running.tabLabel,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="footsteps-outline" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          tabBarLabel: strings.tabs.settings,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="settings-outline" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}
