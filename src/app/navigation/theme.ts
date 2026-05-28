import { DarkTheme, type Theme as NavTheme } from '@react-navigation/native';

import { theme } from '@/shared/theme';

/**
 * Adapte le thème React Navigation à notre palette. Évite le « flash blanc »
 * entre deux écrans et garantit que les chrome (header, tabBar) prennent
 * les bonnes couleurs sans override par écran.
 */
export const navigationTheme: NavTheme = {
  ...DarkTheme,
  dark: true,
  colors: {
    ...DarkTheme.colors,
    primary: theme.colors.primary,
    background: theme.colors.background,
    card: theme.colors.surface,
    text: theme.colors.text,
    border: theme.colors.border,
    notification: theme.colors.primary,
  },
  fonts: DarkTheme.fonts,
};
