import type React from "react"
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, type ViewStyle, type TextStyle } from "react-native"
import { COLORS, SPACING, RADIUS, TEXT_STYLES } from "../theme"
import { scale, verticalScale } from "../utils/responsive"

type ButtonVariant = "primary" | "secondary" | "outline" | "ghost"
type ButtonSize = "sm" | "md" | "lg"

interface ButtonProps {
  onPress?: () => void
  title: string
  variant?: ButtonVariant
  size?: ButtonSize
  loading?: boolean
  disabled?: boolean
  icon?: React.ReactNode
  style?: ViewStyle
  textStyle?: TextStyle
}

export const Button: React.FC<ButtonProps> = ({
  onPress,
  title,
  variant = "primary",
  size = "md",
  loading = false,
  disabled = false,
  icon,
  style,
  textStyle,
}) => {
  const buttonStyle = [styles.base, styles[variant], styles[`size_${size}`], disabled && styles.disabled, style]

  const textStyleComputed = [styles.text, styles[`text_${variant}`], styles[`textSize_${size}`], textStyle]

  return (
    <TouchableOpacity style={buttonStyle} onPress={onPress} disabled={disabled || loading} activeOpacity={0.7}>
      {loading ? (
        <ActivityIndicator color={variant === "outline" || variant === "ghost" ? COLORS.primary : COLORS.textInverse} />
      ) : (
        <>
          {icon && icon}
          <Text style={textStyleComputed}>{title}</Text>
        </>
      )}
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  base: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: RADIUS.md,
    gap: SPACING.sm,
  },
  primary: {
    backgroundColor: COLORS.primary,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  secondary: {
    backgroundColor: COLORS.success,
  },
  outline: {
    backgroundColor: "transparent",
    borderWidth: 1.5,
    borderColor: COLORS.primary,
  },
  ghost: {
    backgroundColor: "transparent",
  },
  disabled: {
    opacity: 0.5,
  },
  size_sm: {
    paddingVertical: verticalScale(SPACING.sm),
    paddingHorizontal: scale(SPACING.md),
  },
  size_md: {
    paddingVertical: verticalScale(SPACING.md),
    paddingHorizontal: scale(SPACING.lg),
  },
  size_lg: {
    paddingVertical: verticalScale(SPACING.lg),
    paddingHorizontal: scale(SPACING.xl),
  },
  text: {
    fontWeight: "600",
  },
  text_primary: {
    color: COLORS.textInverse,
  },
  text_secondary: {
    color: COLORS.textInverse,
  },
  text_outline: {
    color: COLORS.primary,
  },
  text_ghost: {
    color: COLORS.text,
  },
  textSize_sm: {
    ...TEXT_STYLES.caption,
  },
  textSize_md: {
    ...TEXT_STYLES.bodySm,
  },
  textSize_lg: {
    ...TEXT_STYLES.body,
  },
})
