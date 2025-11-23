import type React from "react"
import { View, Text, StyleSheet, type ViewStyle } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { COLORS, SPACING, RADIUS, TEXT_STYLES } from "../theme"
import { scale } from "../utils/responsive"

interface StatCardProps {
  icon: keyof typeof Ionicons.glyphMap
  label: string
  value?: string | number
  valueNode?: React.ReactNode
  trend?: string
  trendDirection?: "up" | "down"
  color?: string
  style?: ViewStyle
}

export const StatCard: React.FC<StatCardProps> = ({
  icon,
  label,
  value,
  valueNode,
  trend,
  trendDirection,
  color = COLORS.primary,
  style,
}) => {
  return (
    <View style={[styles.container, style]}>
      <View style={styles.topRow}>
        <Text style={styles.label}>{label}</Text>
        <View style={[styles.iconContainer, { backgroundColor: color + "25" }]}>
          <Ionicons name={icon} size={scale(20)} color={color} />
        </View>
      </View>
      
      {valueNode ? valueNode : <Text style={styles.value}>{value}</Text>}
      
      {trend && (
        <View style={styles.trendContainer}>
          <Ionicons 
            name={trendDirection === "up" ? "trending-up" : "trending-down"} 
            size={scale(14)} 
            color={trendDirection === "up" ? COLORS.success : COLORS.danger} 
          />
          <Text style={[
            styles.trendText, 
            { color: trendDirection === "up" ? COLORS.success : COLORS.danger }
          ]}>
            {trend}
          </Text>
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: scale(SPACING.lg),
    flexDirection: "column",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    width: "100%",
    marginBottom: SPACING.xs,
  },
  iconContainer: {
    width: scale(36),
    height: scale(36),
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
    flex: 1,
    marginRight: SPACING.xs,
  },
  value: {
    ...TEXT_STYLES.h3,
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  trendContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: SPACING.xs,
  },
  trendText: {
    ...TEXT_STYLES.caption,
    fontWeight: "600",
  },
})
