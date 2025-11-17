import type React from "react"
import { View, Text, StyleSheet, type ViewStyle } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { COLORS, SPACING, RADIUS, TEXT_STYLES } from "../theme"
import { scale } from "../utils/responsive"

interface StatCardProps {
  icon: keyof typeof Ionicons.glyphMap
  label: string
  value: string | number
  color?: string
  style?: ViewStyle
}

export const StatCard: React.FC<StatCardProps> = ({ icon, label, value, color = COLORS.primary, style }) => {
  return (
    <View style={[styles.container, style]}>
      <View style={[styles.iconContainer, { backgroundColor: color }]}>
  <Ionicons name={icon} size={scale(24)} color={COLORS.textInverse} />
      </View>
      <View style={styles.content}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.value}>{value}</Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: scale(SPACING.lg),
    flexDirection: "row",
    alignItems: "center",
    gap: scale(SPACING.lg),
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  iconContainer: {
    width: scale(48),
    height: scale(48),
    borderRadius: RADIUS.md,
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    flex: 1,
  },
  label: {
    ...TEXT_STYLES.caption,
    color: COLORS.textTertiary,
    marginBottom: SPACING.xs,
  },
  value: {
    ...TEXT_STYLES.subtitle,
    color: COLORS.text,
  },
})
