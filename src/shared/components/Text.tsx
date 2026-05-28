import { Text as RNText, type TextProps as RNTextProps, type TextStyle } from 'react-native';

import { theme, type TypographyVariant } from '@/shared/theme';
import type { ColorToken } from '@/shared/theme/colors';

type TextProps = RNTextProps & {
  /** Variante de typographie. Défaut : `body`. */
  variant?: TypographyVariant;
  /** Couleur du texte (token theme). Défaut : `text`. */
  color?: ColorToken;
  /** Centrer le texte. */
  center?: boolean;
};

/**
 * Composant texte themable. Wrappe `react-native` `Text` en imposant les
 * variantes typographiques et la palette du thème, pour éviter les styles
 * inline éparpillés dans les écrans.
 */
export function Text({
  variant = 'body',
  color = 'text',
  center = false,
  style,
  ...rest
}: TextProps) {
  const variantStyle = theme.typography[variant] as TextStyle;
  const colorStyle: TextStyle = { color: theme.colors[color] };
  const alignStyle: TextStyle | undefined = center ? { textAlign: 'center' } : undefined;
  return <RNText {...rest} style={[variantStyle, colorStyle, alignStyle, style]} />;
}
