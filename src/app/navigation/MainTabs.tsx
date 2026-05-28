import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import { HomeScreen } from '@/features/training/screens/HomeScreen';
import { PlaceholderScreen } from '@/features/_placeholder/PlaceholderScreen';
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
      <Tab.Screen name="Home" component={HomeScreen} options={{ tabBarLabel: strings.tabs.home }} />
      <Tab.Screen
        name="Settings"
        component={PlaceholderScreen}
        options={{ tabBarLabel: strings.tabs.settings }}
      />
    </Tab.Navigator>
  );
}
