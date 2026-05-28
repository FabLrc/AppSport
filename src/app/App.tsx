import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { RootNavigator } from './navigation/RootNavigator';
import { navigationTheme } from './navigation/theme';
import { DatabaseProvider } from './providers/DatabaseProvider';

/**
 * Composant racine de l'application. Pose les providers globaux dans l'ordre
 * attendu par leurs dépendances :
 *  1. `GestureHandlerRootView` — requis par react-native-gesture-handler pour
 *     intercepter les gestes (utilisé par la navigation native-stack).
 *  2. `SafeAreaProvider` — fournit les insets safe-area aux composants `Screen`.
 *  3. `DatabaseProvider` — ouvre SQLite, applique les migrations, ne rend
 *     `children` qu'une fois la base prête.
 *  4. `NavigationContainer` — héberge l'état de navigation et applique le thème.
 */
export default function App() {
  return (
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaProvider>
        <StatusBar style="light" />
        <DatabaseProvider>
          <NavigationContainer theme={navigationTheme}>
            <RootNavigator />
          </NavigationContainer>
        </DatabaseProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
});
