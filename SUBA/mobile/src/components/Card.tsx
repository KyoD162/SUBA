import type React from "react"
import { View, StyleSheet, type ViewStyle, TouchableOpacity } from "react-native"
import { COLORS, SPACING, RADIUS } from "../theme"
import { scale } from "../utils/responsive"

interface CardProps {
  children: React.ReactNode
  onPress?: () => void
  style?: ViewStyle
  variant?: "default" | "outlined" | "elevated"
  padding?: boolean
}

export const Card: React.FC<CardProps> = ({ children, onPress, style, variant = "default", padding = true }) => {
  const cardStyle = [styles.base, styles[variant], padding && styles.withPadding, style]

  const Component = onPress ? TouchableOpacity : View

  return (
    <Component style={cardStyle} onPress={onPress} activeOpacity={0.8}>
      {children}
    </Component>
  )
}

const styles = StyleSheet.create({
  base: {
    borderRadius: RADIUS.lg,
    overflow: "hidden",
  },
  default: {
    backgroundColor: COLORS.surface,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  outlined: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  elevated: {
    backgroundColor: COLORS.surface,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 6,
  },
  withPadding: {
    padding: scale(SPACING.lg),
  },
})
