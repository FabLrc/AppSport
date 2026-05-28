import type { PropsWithChildren } from 'react';
import { StatusBar, StyleSheet, View, type ViewProps } from 'react-native';
import { SafeAreaView, type Edge } from 'react-native-safe-area-context';

import { theme } from '@/shared/theme';

type ScreenProps = PropsWithChildren<{
  /** Activer la SafeAreaView. Défaut : `true`. */
  safeArea?: boolean;
  /** Bords sur lesquels appliquer la SafeArea. Défaut : tous sauf le bas. */
  edges?: readonly Edge[];
  /** Couleur de fond. Défaut : `theme.colors.background`. */
  backgroundColor?: string;
  /** Padding horizontal automatique. Défaut : `theme.spacing.lg`. */
  paddingHorizontal?: number;
  style?: ViewProps['style'];
}>;

/**
 * Conteneur d'écran de base. Pose le fond, la status bar dark, et la SafeArea.
 * À utiliser comme racine de chaque écran de feature.
 */
export function Screen({
  children,
  safeArea = true,
  edges = ['top', 'left', 'right'],
  backgroundColor = theme.colors.background,
  paddingHorizontal = theme.spacing.lg,
  style,
}: ScreenProps) {
  const Container = safeArea ? SafeAreaView : View;
  return (
    <Container
      style={[styles.root, { backgroundColor, paddingHorizontal }, style]}
      edges={safeArea ? edges : undefined}
    >
      <StatusBar barStyle="light-content" backgroundColor={backgroundColor} />
      {children}
    </Container>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});
