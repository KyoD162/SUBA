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
}

export const CurrencyDisplay: React.FC<CurrencyDisplayProps> = ({ usdAmount, showToggle = false, size = "md" }) => {
  const [showBS, setShowBS] = React.useState(false)
  const bsAmount = convertUSDtoBS(usdAmount)

  const textStyle = size === "sm" ? TEXT_STYLES.caption : size === "lg" ? TEXT_STYLES.h3 : TEXT_STYLES.body

  return (
    <View style={styles.container}>
      {showToggle ? (
        <TouchableOpacity style={styles.toggleContainer} onPress={() => setShowBS(!showBS)}>
          <Text style={[textStyle, styles.mainAmount]}>{showBS ? formatBS(bsAmount) : formatUSD(usdAmount)}</Text>
          <Ionicons name="swap-horizontal" size={16} color={COLORS.primary} />
        </TouchableOpacity>
      ) : (
        <View>
          <Text style={[textStyle, styles.mainAmount]}>{formatUSD(usdAmount)}</Text>
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
    marginTop: SPACING.xs,
  },
})
