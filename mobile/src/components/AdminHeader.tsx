"use client"

import React from "react"
import { View, Text, StyleSheet } from "react-native"
import { COLORS, SPACING, RADIUS, TEXT_STYLES, globalStyles } from "../theme"

type Props = {
  name?: string
}

const initialsFrom = (name: string) => {
  const trimmed = name.trim()
  if (!trimmed) return "AD"
  const parts = trimmed.split(/\s+/)
  const first = parts[0]?.[0] ?? "A"
  const second = parts[1]?.[0] ?? (parts[0]?.[1] ?? "D")
  return (first + second).toUpperCase()
}

const AdminHeader: React.FC<Props> = ({ name = "Admin" }) => {
  const initials = initialsFrom(name)
  return (
    <View style={[globalStyles.cardContainer, styles.container]}>
      <View style={styles.texts}>
        <Text style={styles.title}>Hola, {name}</Text>
        <Text style={styles.subtitle}>SUBA - Panel de Administración</Text>
      </View>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{initials}</Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderRadius: RADIUS.lg,
    paddingVertical: SPACING.lg,
    paddingHorizontal: SPACING.lg,
  },
  texts: {
    flex: 1,
    paddingRight: SPACING.lg,
  },
  title: {
    ...TEXT_STYLES.h3,
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  subtitle: {
    ...TEXT_STYLES.bodySm,
    color: COLORS.textSecondary,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    ...TEXT_STYLES.subtitle,
    color: COLORS.textInverse,
    fontWeight: "700",
  },
})

export default AdminHeader
