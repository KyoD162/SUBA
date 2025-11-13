import type React from "react"
import { View, TextInput, StyleSheet, type ViewStyle, type TextInputProps } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { COLORS, SPACING, RADIUS, TEXT_STYLES } from "../theme"
import { scale, verticalScale } from "../utils/responsive"

interface InputProps extends TextInputProps {
  label?: string
  icon?: keyof typeof Ionicons.glyphMap
  error?: string
  containerStyle?: ViewStyle
  rightIcon?: React.ReactNode
}

export const Input: React.FC<InputProps> = ({ label, icon, error, containerStyle, rightIcon, ...textInputProps }) => {
  return (
    <View style={containerStyle}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={[styles.container, error && styles.containerError]}>
  {icon && <Ionicons name={icon} size={scale(20)} color={error ? COLORS.danger : COLORS.textTertiary} />}
        <TextInput style={styles.input} placeholderTextColor={COLORS.textTertiary} {...textInputProps} />
        {rightIcon && rightIcon}
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  )
}

const { Text } = require("react-native")

const styles = StyleSheet.create({
  label: {
    ...TEXT_STYLES.bodySm,
    color: COLORS.text,
    fontWeight: "600",
    marginBottom: SPACING.sm,
  },
  container: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    paddingHorizontal: scale(SPACING.md),
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: scale(SPACING.md),
  },
  containerError: {
    borderColor: COLORS.danger,
  },
  input: {
    flex: 1,
    paddingVertical: verticalScale(SPACING.md),
    ...TEXT_STYLES.body,
    color: COLORS.text,
  },
  errorText: {
    ...TEXT_STYLES.caption,
    color: COLORS.danger,
    marginTop: SPACING.xs,
  },
})
