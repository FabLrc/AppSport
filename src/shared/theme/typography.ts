import type { TextStyle } from 'react-native';

import { branding } from '@branding/branding.config';

/**
 * Variantes de texte. Chaque variante est un `TextStyle` prêt à être étalé
 * dans un composant `<Text style={typography.body} />`.
 *
 * Les familles de police sont lues depuis `branding.config.json`. Pour le MVP,
 * on utilise la police système (`System`).
 */
export const typography = {
  displayLarge: {
    fontFamily: branding.fonts.heading,
    fontSize: 40,
    fontWeight: '800',
    lineHeight: 48,
    letterSpacing: -0.5,
  },
  display: {
    fontFamily: branding.fonts.heading,
    fontSize: 32,
    fontWeight: '700',
    lineHeight: 40,
    letterSpacing: -0.3,
  },
  headingLarge: {
    fontFamily: branding.fonts.heading,
    fontSize: 24,
    fontWeight: '700',
    lineHeight: 32,
  },
  heading: {
    fontFamily: branding.fonts.heading,
    fontSize: 20,
    fontWeight: '600',
    lineHeight: 28,
  },
  headingSmall: {
    fontFamily: branding.fonts.heading,
    fontSize: 17,
    fontWeight: '600',
    lineHeight: 24,
  },
  body: {
    fontFamily: branding.fonts.base,
    fontSize: 15,
    fontWeight: '400',
    lineHeight: 22,
  },
  bodyStrong: {
    fontFamily: branding.fonts.base,
    fontSize: 15,
    fontWeight: '600',
    lineHeight: 22,
  },
  bodySmall: {
    fontFamily: branding.fonts.base,
    fontSize: 13,
    fontWeight: '400',
    lineHeight: 18,
  },
  caption: {
    fontFamily: branding.fonts.base,
    fontSize: 12,
    fontWeight: '400',
    lineHeight: 16,
  },
  label: {
    fontFamily: branding.fonts.base,
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 18,
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  button: {
    fontFamily: branding.fonts.base,
    fontSize: 15,
    fontWeight: '600',
    lineHeight: 22,
  },
  numeric: {
    fontFamily: branding.fonts.heading,
    fontSize: 32,
    fontWeight: '700',
    lineHeight: 36,
    fontVariant: ['tabular-nums'],
  },
} as const satisfies Record<string, TextStyle>;

export type TypographyVariant = keyof typeof typography;
