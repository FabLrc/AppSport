import type { PropsWithChildren } from 'react';
import { StyleSheet, View, type ViewProps } from 'react-native';

import { theme } from '@/shared/theme';

type CardProps = PropsWithChildren<{
  /** Élévation visuelle : `surface` (fond normal) ou `elevated` (fond légèrement éclairé). */
  variant?: 'surface' | 'elevated';
  /** Padding interne. Défaut : `lg`. */
  padding?: number;
  style?: ViewProps['style'];
}>;

/**
 * Carte conteneur. Utilisée comme bloc de contenu thématisé dans les écrans
 * (rang affiché, statistique, action rapide…). Pas d'ombre — en thème sombre,
 * c'est la nuance de fond qui crée l'élévation.
 */
export function Card({
  children,
  variant = 'surface',
  padding = theme.spacing.lg,
  style,
}: CardProps) {
  return (
    <View
      style={[
        styles.base,
        { padding },
        variant === 'elevated' ? styles.elevated : styles.surface,
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: theme.radius.xl,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  surface: {
    backgroundColor: theme.colors.surface,
  },
  elevated: {
    backgroundColor: theme.colors.surfaceElevated,
  },
});
