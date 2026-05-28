import { colors, type Colors } from './colors';
import { radius, type RadiusToken } from './radius';
import { spacing, type SpacingToken } from './spacing';
import { typography, type TypographyVariant } from './typography';

/**
 * Thème runtime — combine couleurs, espacements, typographie et rayons.
 *
 * Usage :
 *   import { theme } from '@/shared/theme';
 *   const styles = StyleSheet.create({
 *     box: { backgroundColor: theme.colors.surface, padding: theme.spacing.md },
 *   });
 *
 * Les couleurs viennent de `branding/branding.config.json`. Le reste est purement
 * tokens d'app, indépendants du branding (échelle, rayons, typographie).
 */
export const theme = {
  colors,
  spacing,
  radius,
  typography,
} as const;

export type Theme = typeof theme;

export { colors, spacing, radius, typography };
export type { Colors, SpacingToken, RadiusToken, TypographyVariant };
