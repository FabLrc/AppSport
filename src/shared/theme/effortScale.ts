/**
 * Échelle de ressenti d'effort, du plus facile (1) au plus dur (5).
 * Rampe sémantique vert → rouge. Token d'app, indépendant du branding
 * (comme les espacements et les rayons). Utilisée par la course (ressenti).
 */
export const effortScale = {
  1: '#4CAF50',
  2: '#8BC34A',
  3: '#FFB300',
  4: '#FF7043',
  5: '#E53935',
} as const;

export type EffortLevel = keyof typeof effortScale;
