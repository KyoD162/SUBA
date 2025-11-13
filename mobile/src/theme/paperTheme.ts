import { MD3LightTheme } from "react-native-paper"
import { COLORS } from "./colors"

export const SUBA_THEME = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: COLORS.primary,
    secondary: COLORS.success,
    tertiary: COLORS.primaryDark,
    background: COLORS.background,
    surface: COLORS.surface,
    error: COLORS.danger,
    surfaceVariant: COLORS.surfaceAlt,
    onSurface: COLORS.text,
  },
}
