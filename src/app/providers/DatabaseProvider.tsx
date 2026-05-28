import { type PropsWithChildren, useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { runMigrations, type MigrationOutcome } from '@/db/migrate';
import { Button, Card, Screen, Text } from '@/shared/components';
import { theme } from '@/shared/theme';
import { requestNotificationPermissions, syncAllReminders } from '@/shared/notifications';

type DbState =
  | { status: 'pending' }
  | { status: 'ready'; outcome: MigrationOutcome }
  | { status: 'error'; error: Error };

/**
 * Provider qui s'assure que la base SQLite est ouverte et que toutes les
 * migrations sont appliquées avant de rendre l'app. Affiche un état de
 * chargement (rare, normalement instantané) ou un écran d'erreur fallback.
 *
 * Ce composant n'expose pas de context : les repositories accèdent à la base
 * via `getDatabase()` qui est un singleton. Le seul rôle du provider est
 * d'ordonner les choses : l'app ne monte les écrans que quand la base est OK.
 */
export function DatabaseProvider({ children }: PropsWithChildren) {
  const [state, setState] = useState<DbState>({ status: 'pending' });
  const [retryToken, setRetryToken] = useState(0);

  useEffect(() => {
    let cancelled = false;
    runMigrations()
      .then(async (outcome) => {
        if (cancelled) return;
        if (outcome.applied.length > 0) {
          console.log(
            `[db] migrations appliquées : v${outcome.fromVersion} → v${outcome.toVersion}`,
            outcome.applied,
          );
        } else {
          console.log(`[db] schéma déjà à jour (v${outcome.toVersion})`);
        }
        // Request notification permissions and sync reminders after DB is ready
        const granted = await requestNotificationPermissions();
        if (granted) {
          syncAllReminders().catch((e: unknown) => console.warn('[notifications] sync échoué', e));
        }
        setState({ status: 'ready', outcome });
      })
      .catch((error: unknown) => {
        if (cancelled) return;
        const wrapped = error instanceof Error ? error : new Error(String(error));
        console.error('[db] échec des migrations', wrapped);
        setState({ status: 'error', error: wrapped });
      });
    return () => {
      cancelled = true;
    };
  }, [retryToken]);

  const handleRetry = () => {
    setState({ status: 'pending' });
    setRetryToken((n) => n + 1);
  };

  if (state.status === 'pending') {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  if (state.status === 'error') {
    return (
      <Screen>
        <View style={styles.errorWrapper}>
          <Card variant="elevated">
            <Text variant="heading" color="error">
              Impossible de préparer la base de données
            </Text>
            <View style={styles.spacer} />
            <Text variant="bodySmall" color="textSecondary">
              {state.error.message}
            </Text>
            <View style={styles.spacer} />
            <Button label="Réessayer" variant="secondary" onPress={handleRetry} />
          </Card>
        </View>
      </Screen>
    );
  }

  return <>{children}</>;
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    backgroundColor: theme.colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorWrapper: {
    flex: 1,
    justifyContent: 'center',
  },
  spacer: {
    height: theme.spacing.md,
  },
});
