import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { RootNavigator } from './navigation/RootNavigator';
import { navigationTheme } from './navigation/theme';

/**
 * Composant racine de l'application. Pose les providers globaux dans l'ordre
 * attendu par leurs dépendances :
 *  1. `GestureHandlerRootView` — requis par react-native-gesture-handler pour
 *     intercepter les gestes (utilisé par la navigation native-stack).
 *  2. `SafeAreaProvider` — fournit les insets safe-area aux composants `Screen`.
 *  3. `NavigationContainer` — héberge l'état de navigation et applique le thème.
 *
 * NOTE Lot 6 : c'est ici que viendra l'initialisation SQLite + migrations
 * (state d'initialisation, splash maintenu pendant la migration, etc.).
 */
export default function App() {
  return (
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaProvider>
        <StatusBar style="light" />
        <NavigationContainer theme={navigationTheme}>
          <RootNavigator />
        </NavigationContainer>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
});
