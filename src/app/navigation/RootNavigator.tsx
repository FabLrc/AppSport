import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { PlaceholderScreen } from '@/features/_placeholder/PlaceholderScreen';

import type { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

/**
 * Stack racine. Pour le socle, ne contient qu'un écran provisoire.
 *
 * Au Lot 1, on basculera la première route entre `Onboarding` et `Main`
 * selon que le profil a été configuré ou non (lecture en base au démarrage).
 */
export function RootNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Placeholder" component={PlaceholderScreen} />
    </Stack.Navigator>
  );
}
