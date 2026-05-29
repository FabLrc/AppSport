import { Pressable, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { Button } from '@/shared/components/Button';
import { Text } from '@/shared/components/Text';
import { strings } from '@/shared/strings';
import { theme } from '@/shared/theme';

type UpdateBannerProps = {
  /** Version distante proposée (sans le « v »). */
  version: string;
  /** Ouvre l'écran des notes de version. */
  onOpenNotes: () => void;
  /** Déclenche le téléchargement (Android) ou le renvoi TestFlight (iOS). */
  onUpdate: () => void;
  /** Masque la bannière pour la session courante. */
  onDismiss: () => void;
};

/**
 * Bannière non intrusive affichée en tête du dashboard quand une version plus
 * récente est disponible (cahier section 9.9). Tap sur le corps → notes de
 * version ; bouton dédié pour mettre à jour ; croix pour masquer.
 */
export function UpdateBanner({ version, onOpenNotes, onUpdate, onDismiss }: UpdateBannerProps) {
  const u = strings.updates;

  return (
    <View style={styles.banner}>
      <View style={styles.header}>
        <Ionicons name="rocket-outline" size={22} color={theme.colors.info} />
        <TouchableOpacity
          style={styles.texts}
          onPress={onOpenNotes}
          activeOpacity={0.7}
          accessibilityRole="button"
        >
          <Text variant="bodyStrong">{u.bannerTitle}</Text>
          <Text variant="bodySmall" color="textSecondary">
            {u.bannerSubtitle.replace('{v}', version)}
          </Text>
        </TouchableOpacity>
        <Pressable
          onPress={onDismiss}
          accessibilityRole="button"
          accessibilityLabel={u.dismissA11y}
          hitSlop={8}
        >
          <Ionicons name="close" size={20} color={theme.colors.textMuted} />
        </Pressable>
      </View>
      <Button label={u.bannerAction} size="sm" onPress={onUpdate} />
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    backgroundColor: theme.colors.infoSoft,
    borderRadius: theme.radius.xl,
    borderLeftWidth: 3,
    borderLeftColor: theme.colors.info,
    padding: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  texts: {
    flex: 1,
    gap: 2,
  },
});
