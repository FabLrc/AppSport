import { StyleSheet, View } from 'react-native';

import { branding } from '@branding/branding.config';
import { Card, Screen, Text } from '@/shared/components';
import { strings } from '@/shared/strings';
import { theme } from '@/shared/theme';

/**
 * Écran provisoire affiché tant qu'aucun lot fonctionnel n'a été livré.
 * Sert de smoke test visuel : si on voit ça en thème sombre avec le bon nom,
 * le branding et le thème fonctionnent de bout en bout.
 *
 * Sera remplacé par l'écran d'onboarding au Lot 1, puis par le dashboard
 * après onboarding une fois le Lot 6 livré.
 */
export function PlaceholderScreen() {
  return (
    <Screen>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text variant="label" color="textMuted">
            {branding.app.name} · v{branding.app.version}
          </Text>
          <Text variant="display" style={styles.title}>
            {strings.placeholder.title}
          </Text>
          <Text variant="body" color="textSecondary">
            {strings.placeholder.subtitle}
          </Text>
        </View>

        <Card variant="elevated" style={styles.taglineCard}>
          <Text variant="caption" color="textMuted">
            Accroche provisoire
          </Text>
          <View style={styles.taglineSpacer} />
          <Text variant="headingSmall">{branding.app.tagline}</Text>
        </Card>

        <View style={styles.statusBlock}>
          <View style={styles.statusRow}>
            <View style={[styles.dot, { backgroundColor: theme.colors.success }]} />
            <Text variant="bodySmall" color="textSecondary">
              Thème dark, branding centralisé, navigation prête
            </Text>
          </View>
          <View style={styles.statusRow}>
            <View style={[styles.dot, { backgroundColor: theme.colors.warning }]} />
            <Text variant="bodySmall" color="textSecondary">
              Migrations SQLite : à câbler dans le runtime
            </Text>
          </View>
          <View style={styles.statusRow}>
            <View style={[styles.dot, { backgroundColor: theme.colors.textMuted }]} />
            <Text variant="bodySmall" color="textMuted">
              Lots 1 à 8 : à venir
            </Text>
          </View>
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    gap: theme.spacing.xl,
  },
  header: {
    gap: theme.spacing.sm,
  },
  title: {
    marginTop: theme.spacing.xs,
  },
  taglineCard: {
    gap: theme.spacing.xs,
  },
  taglineSpacer: {
    height: theme.spacing.xs,
  },
  statusBlock: {
    gap: theme.spacing.sm,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: theme.radius.pill,
  },
});
