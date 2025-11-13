export const COLORS = {
  // Primary brand colors
  primary: "#34A0A4",
  primaryDark: "#184E77",

  // Accent colors
  success: "#9DD98C",
  warning: "#FFA500",
  danger: "#FF6B6B",

  // Neutrals
  background: "#F3F3F3",
  surface: "#FFFFFF",
  surfaceAlt: "#F9F9F9",

  // Text
  text: "#1A1A1A",
  textSecondary: "#666666",
  textTertiary: "#999999",
  textInverse: "#FFFFFF",

  // Borders & dividers
  border: "#E5E5E5",
  borderLight: "#F0F0F0",

  // States
  disabled: "#D0D0D0",
  overlay: "rgba(0, 0, 0, 0.3)",
} as const

export const GRADIENTS = {
  primary: [COLORS.primary, COLORS.primaryDark],
  success: [COLORS.success, "#7EC96F"],
} as const
