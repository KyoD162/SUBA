import type React from "react"
import { View, Text, StyleSheet, type ViewStyle, type TextStyle } from "react-native"
import { COLORS, SPACING, RADIUS, TEXT_STYLES } from "../theme"
import { scale, verticalScale } from "../utils/responsive"

export type BadgeVariant = "primary" | "success" | "warning" | "danger" | "neutral" | "info" | "secondary"
type BadgeSize = "sm" | "md"

interface BadgeProps {
  label: string
  variant?: BadgeVariant
  size?: BadgeSize
  style?: ViewStyle
  textStyle?: TextStyle
}

const variantColors: Record<BadgeVariant, { bg: string; text: string }> = {
  primary: { bg: COLORS.primary, text: COLORS.textInverse },
  success: { bg: COLORS.success, text: COLORS.textInverse },
  warning: { bg: COLORS.warning, text: COLORS.textInverse },
  danger: { bg: COLORS.danger, text: COLORS.textInverse },
  neutral: { bg: COLORS.border, text: COLORS.text },
  info: { bg: COLORS.primaryDark, text: COLORS.textInverse },
  secondary: { bg: COLORS.disabled, text: COLORS.textSecondary },
}

export const Badge: React.FC<BadgeProps> = ({ label, variant = "neutral", size = "md", style, textStyle }) => {
  const colors = variantColors[variant]
  const badgeStyle = [styles.base, styles[size], { backgroundColor: colors.bg }, style]

  return (
    <View style={badgeStyle}>
      <Text style={[styles.text, styles[`text_${size}`], { color: colors.text }, textStyle]}>{label}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  base: {
    borderRadius: RADIUS.full,
    justifyContent: "center",
    alignItems: "center",
  },
  sm: {
    paddingHorizontal: scale(SPACING.md),
    paddingVertical: verticalScale(SPACING.xs),
  },
  md: {
    paddingHorizontal: scale(SPACING.lg),
    paddingVertical: verticalScale(SPACING.sm),
  },
  text: {
    fontWeight: "600",
  },
  text_sm: {
    ...TEXT_STYLES.caption,
  },
  text_md: {
    ...TEXT_STYLES.bodySm,
  },
})
