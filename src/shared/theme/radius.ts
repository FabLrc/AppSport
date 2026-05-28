/**
 * Rayons de bordure. `pill` est un grand nombre pour fabriquer un cercle
 * sur n'importe quelle hauteur (badges, boutons icône).
 */
export const radius = {
  none: 0,
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  xxl: 24,
  pill: 999,
} as const;

export type RadiusToken = keyof typeof radius;
