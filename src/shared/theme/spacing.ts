/**
 * Échelle d'espacement. Unité : densité-indépendante (dp), comme tout en React Native.
 * Base 4 px : permet une grille fine sans multiplier les valeurs ad hoc.
 */
export const spacing = {
  none: 0,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 48,
} as const;

export type SpacingToken = keyof typeof spacing;
