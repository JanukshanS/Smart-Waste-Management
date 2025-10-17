import { MD3LightTheme as DefaultTheme } from 'react-native-paper';
import { COLORS } from './theme';

/**
 * React Native Paper Theme Configuration
 * Integrates with existing theme.js colors
 */
export const paperTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: COLORS.primary,
    secondary: COLORS.secondary,
    error: COLORS.error,
    background: COLORS.background,
    surface: COLORS.white,
    onSurface: COLORS.text,
    onSurfaceVariant: COLORS.textLight,
    outline: COLORS.border,
    surfaceVariant: COLORS.background,
  },
};

