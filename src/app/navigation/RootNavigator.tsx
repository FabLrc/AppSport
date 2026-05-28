import { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { OnboardingScreen } from '@/features/onboarding/OnboardingScreen';
import { WorkoutSessionScreen } from '@/features/training/screens/WorkoutSessionScreen';
import { WorkoutSummaryScreen } from '@/features/training/screens/WorkoutSummaryScreen';
import { ExerciceHistoryScreen } from '@/features/training/screens/ExerciceHistoryScreen';
import { ProgramListScreen } from '@/features/training/screens/ProgramListScreen';
import { ProgramEditScreen } from '@/features/training/screens/ProgramEditScreen';
import { ExercicePickerScreen } from '@/features/training/screens/ExercicePickerScreen';
import { AddMeasurementScreen } from '@/features/body-tracking/screens/AddMeasurementScreen';
import { AddRunScreen } from '@/features/running/screens/AddRunScreen';
import { MacroPlanningScreen } from '@/features/planning/screens/MacroPlanningScreen';
import { useProfileStore } from '@/state/profileStore';
import { theme } from '@/shared/theme';

import { MainTabs } from './MainTabs';
import type { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  const { profile, isLoaded, loadProfile } = useProfileStore();

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  if (!isLoaded) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {profile === null ? (
        <Stack.Screen name="Onboarding" component={OnboardingScreen} />
      ) : (
        <>
          <Stack.Screen name="Main" component={MainTabs} />
          <Stack.Screen
            name="WorkoutSession"
            component={WorkoutSessionScreen}
            options={{ presentation: 'fullScreenModal' }}
          />
          <Stack.Screen
            name="WorkoutSummary"
            component={WorkoutSummaryScreen}
            options={{ presentation: 'fullScreenModal', gestureEnabled: false }}
          />
          <Stack.Screen name="ExerciceHistory" component={ExerciceHistoryScreen} />
          <Stack.Screen name="ProgramList" component={ProgramListScreen} />
          <Stack.Screen name="ProgramEdit" component={ProgramEditScreen} />
          <Stack.Screen name="ExercicePicker" component={ExercicePickerScreen} />
          <Stack.Screen
            name="AddMeasurement"
            component={AddMeasurementScreen}
            options={{ presentation: 'modal' }}
          />
          <Stack.Screen
            name="AddRun"
            component={AddRunScreen}
            options={{ presentation: 'modal' }}
          />
          <Stack.Screen name="MacroPlanning" component={MacroPlanningScreen} />
        </>
      )}
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    backgroundColor: theme.colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
