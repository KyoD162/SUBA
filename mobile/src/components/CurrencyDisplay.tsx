"use client"

import React from "react"
import { View, Text, StyleSheet, TouchableOpacity } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { COLORS, SPACING, TEXT_STYLES } from "../theme"
import { formatUSD, formatBS, convertUSDtoBS } from "../utils/currency"

interface CurrencyDisplayProps {
  usdAmount: number
  showToggle?: boolean
  size?: "sm" | "md" | "lg"
  compact?: boolean
  hideSuffix?: boolean
}

export const CurrencyDisplay: React.FC<CurrencyDisplayProps> = ({ usdAmount, showToggle = false, size = "md", compact = false, hideSuffix = false }) => {
  const [showBS, setShowBS] = React.useState(false)
  const bsAmount = convertUSDtoBS(usdAmount)

  // Ajuste: 'md' ahora usa el mismo estilo que los valores numéricos (subtitle)
  const textStyle =
    size === "sm"
      ? TEXT_STYLES.caption
      : size === "lg"
        ? TEXT_STYLES.h3
        : TEXT_STYLES.subtitle

  return (
    <View style={styles.container}>
      {showToggle ? (
        <TouchableOpacity style={styles.toggleContainer} onPress={() => setShowBS(!showBS)}>
          <Text style={[textStyle, styles.mainAmount]}>{showBS ? formatBS(bsAmount) : formatUSD(usdAmount, !hideSuffix)}</Text>
          <Ionicons name="swap-horizontal" size={16} color={COLORS.primary} />
        </TouchableOpacity>
      ) : compact ? (
        <View style={styles.inlineContainer}>
          <Text style={[textStyle, styles.mainAmount]}>{formatUSD(usdAmount, !hideSuffix)}</Text>
          <Text style={[TEXT_STYLES.caption, styles.secondaryInline]}>≈ {formatBS(bsAmount)}</Text>
        </View>
      ) : (
        <View>
          <Text style={[textStyle, styles.mainAmount]}>{formatUSD(usdAmount, !hideSuffix)}</Text>
          <Text style={[TEXT_STYLES.caption, styles.secondaryAmount]}>≈ {formatBS(bsAmount)}</Text>
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "column",
  },
  toggleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.sm,
  },
  mainAmount: {
    color: COLORS.text,
    fontWeight: "600",
  },
  secondaryAmount: {
    color: COLORS.textTertiary,
    marginTop: 0,
  },
  inlineContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.sm,
  },
  secondaryInline: {
    color: COLORS.textTertiary,
  },
})
