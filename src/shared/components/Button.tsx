import {
  ActivityIndicator,
  Pressable,
  type PressableProps,
  StyleSheet,
  View,
  type ViewStyle,
} from 'react-native';

import { Text } from './Text';
import { theme } from '@/shared/theme';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'destructive';
type ButtonSize = 'sm' | 'md' | 'lg';

type ButtonProps = Omit<PressableProps, 'children' | 'style'> & {
  label: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  fullWidth?: boolean;
  style?: ViewStyle | ViewStyle[];
};

/**
 * Bouton themable, 4 variantes (primary / secondary / ghost / destructive)
 * et 3 tailles. Gère l'état pressed, disabled, loading.
 */
export function Button({
  label,
  variant = 'primary',
  size = 'md',
  loading = false,
  fullWidth = false,
  disabled,
  style,
  ...rest
}: ButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <Pressable
      {...rest}
      disabled={isDisabled}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      style={({ pressed }) => [
        styles.base,
        sizeStyles[size],
        variantStyles[variant],
        fullWidth && styles.fullWidth,
        pressed && pressedStyles[variant],
        isDisabled && styles.disabled,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={labelColor[variant]} />
      ) : (
        <View style={styles.content}>
          <Text variant="button" style={{ color: labelColor[variant] }}>
            {label}
          </Text>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  fullWidth: {
    alignSelf: 'stretch',
  },
  disabled: {
    opacity: 0.5,
  },
});

const sizeStyles: Record<ButtonSize, ViewStyle> = StyleSheet.create({
  sm: { paddingVertical: 8, paddingHorizontal: 12, minHeight: 36 },
  md: { paddingVertical: 12, paddingHorizontal: 16, minHeight: 44 },
  lg: { paddingVertical: 16, paddingHorizontal: 20, minHeight: 52 },
});

const variantStyles: Record<ButtonVariant, ViewStyle> = StyleSheet.create({
  primary: { backgroundColor: theme.colors.primary },
  secondary: {
    backgroundColor: theme.colors.surfaceElevated,
    borderColor: theme.colors.border,
  },
  ghost: { backgroundColor: 'transparent' },
  destructive: { backgroundColor: theme.colors.error },
});

const pressedStyles: Record<ButtonVariant, ViewStyle> = StyleSheet.create({
  primary: { backgroundColor: theme.colors.primaryDark },
  secondary: { backgroundColor: theme.colors.surface },
  ghost: { backgroundColor: theme.colors.primarySoft },
  destructive: { backgroundColor: '#B71C1C' },
});

const labelColor: Record<ButtonVariant, string> = {
  primary: theme.colors.onPrimary,
  secondary: theme.colors.text,
  ghost: theme.colors.primary,
  destructive: theme.colors.onPrimary,
};
