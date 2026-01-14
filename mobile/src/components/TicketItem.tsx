import type React from "react"
import { View, Text, StyleSheet, type ViewStyle, TouchableOpacity } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { COLORS, SPACING, RADIUS, TEXT_STYLES } from "../theme"
import { scale, verticalScale } from "../utils/responsive"

interface TicketItemProps {
  ticketId: string
  type: string
  status: "active" | "used" | "expired" | "cancelled"
  from?: string
  to?: string
  date: string
  time?: string
  onPress?: () => void
  style?: ViewStyle
}

const statusConfig = {
  active: { color: COLORS.success, label: "Activo" },
  used: { color: COLORS.warning, label: "Usado" },
  expired: { color: COLORS.danger, label: "Vencido" },
  cancelled: { color: COLORS.textTertiary, label: "Cancelado" },
}

export const TicketItem: React.FC<TicketItemProps> = ({
  ticketId,
  type,
  status,
  from,
  to,
  date,
  time,
  onPress,
  style,
}) => {
  const config = statusConfig[status]

  return (
    <TouchableOpacity style={[styles.container, style]} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.leftBorder} />

      <View style={styles.content}>
        <View style={styles.header}>
          <View>
            <Text style={styles.ticketId}>{ticketId}</Text>
            <Text style={styles.type}>{type}</Text>
          </View>
          <View style={[styles.badge, { backgroundColor: config.color }]}>
            <Text style={styles.badgeText}>{config.label}</Text>
          </View>
        </View>

        {(from || to) && (
          <View style={styles.route}>
            <View style={styles.routePoint}>
              <Ionicons name="location-outline" size={scale(16)} color={COLORS.textSecondary} />
              <Text style={styles.location}>{from}</Text>
            </View>
            {to && (
              <>
                <View style={styles.arrow} />
                <View style={styles.routePoint}>
                  <Ionicons name="location-outline" size={scale(16)} color={COLORS.textSecondary} />
                  <Text style={styles.location}>{to}</Text>
                </View>
              </>
            )}
          </View>
        )}

        <View style={styles.footer}>
          <View style={styles.dateTime}>
            <Ionicons name="calendar-outline" size={scale(16)} color={COLORS.textTertiary} />
            <Text style={styles.dateText}>{date}</Text>
          </View>
          {time && (
            <View style={styles.dateTime}>
              <Ionicons name="time-outline" size={scale(16)} color={COLORS.textTertiary} />
              <Text style={styles.dateText}>{time}</Text>
            </View>
          )}
        </View>
      </View>
      <Ionicons name="chevron-forward-outline" size={scale(20)} color={COLORS.textTertiary} />
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    paddingRight: scale(SPACING.lg),
    marginVertical: verticalScale(SPACING.md),
    flexDirection: "row",
    alignItems: "center",
    gap: scale(SPACING.lg),
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  leftBorder: {
    width: scale(4),
    height: "100%",
    backgroundColor: COLORS.primary,
    borderTopLeftRadius: RADIUS.lg,
    borderBottomLeftRadius: RADIUS.lg,
  },
  content: {
    flex: 1,
    paddingVertical: verticalScale(SPACING.lg),
    paddingHorizontal: scale(SPACING.lg),
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: verticalScale(SPACING.md),
  },
  ticketId: {
    ...TEXT_STYLES.bodySm,
    color: COLORS.text,
    fontWeight: "600",
  },
  type: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
    marginTop: verticalScale(SPACING.xs),
  },
  badge: {
    paddingHorizontal: scale(SPACING.md),
    paddingVertical: verticalScale(SPACING.xs),
    borderRadius: RADIUS.full,
  },
  badgeText: {
    ...TEXT_STYLES.caption,
    color: COLORS.textInverse,
    fontWeight: "600",
  },
  route: {
    marginBottom: verticalScale(SPACING.md),
  },
  routePoint: {
    flexDirection: "row",
    alignItems: "center",
    gap: scale(SPACING.sm),
    marginVertical: verticalScale(SPACING.xs),
  },
  arrow: {
    width: scale(2),
    height: verticalScale(16),
    backgroundColor: COLORS.border,
    marginLeft: scale(7),
    marginVertical: verticalScale(4),
  },
  location: {
    ...TEXT_STYLES.bodySm,
    color: COLORS.text,
  },
  footer: {
    flexDirection: "row",
    gap: scale(SPACING.lg),
  },
  dateTime: {
    flexDirection: "row",
    alignItems: "center",
    gap: scale(SPACING.sm),
  },
  dateText: {
    ...TEXT_STYLES.caption,
    color: COLORS.textTertiary,
  },
})
