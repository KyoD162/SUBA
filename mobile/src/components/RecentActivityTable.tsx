import React from "react"
import { View, Text, StyleSheet, FlatList } from "react-native"
import { COLORS, SPACING, RADIUS, TEXT_STYLES } from "../theme"
import { scale } from "../utils/responsive"
import { Badge } from "./Badge"

interface ActivityItem {
  id: string
  route: string
  driver: string
  status: "active" | "completed"
  passengers: number
}

const RECENT_ACTIVITY: ActivityItem[] = [
  { id: "1", route: "Ruta A1", driver: "Juan Pérez", status: "active", passengers: 32 },
  { id: "2", route: "Ruta B5", driver: "María García", status: "active", passengers: 28 },
  { id: "3", route: "Ruta R3", driver: "Carlos López", status: "completed", passengers: 45 },
  { id: "4", route: "Ruta R4", driver: "Ana Martínez", status: "active", passengers: 19 },
]

export const RecentActivityTable: React.FC = () => {
  const renderItem = ({ item }: { item: ActivityItem }) => (
    <View style={styles.row}>
      <View style={styles.colRoute}>
        <Text style={styles.cellTextBold}>{item.route}</Text>
      </View>
      <View style={styles.colDriver}>
        <Text style={styles.cellText}>{item.driver}</Text>
      </View>
      <View style={styles.colStatus}>
        <Badge
          label={item.status === "active" ? "En curso" : "Finalizado"}
          variant={item.status === "active" ? "success" : "neutral"}
          size="sm"
          textStyle={{ fontSize: 10 }}
        />
      </View>
      <View style={styles.colPassengers}>
        <Text style={styles.cellText}>{item.passengers}</Text>
      </View>
    </View>
  )

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Actividad Reciente</Text>
      
      <View style={styles.header}>
        <Text style={[styles.headerText, styles.colRoute]}>Ruta</Text>
        <Text style={[styles.headerText, styles.colDriver]}>Conductor</Text>
        <Text style={[styles.headerText, styles.colStatus]}>Estado</Text>
        <Text style={[styles.headerText, styles.colPassengers]}>Pasajeros</Text>
      </View>

      <View style={styles.listContainer}>
        {RECENT_ACTIVITY.map((item) => (
          <React.Fragment key={item.id}>
            {renderItem({ item })}
            <View style={styles.divider} />
          </React.Fragment>
        ))}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    marginTop: SPACING.lg,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  title: {
    ...TEXT_STYLES.bodySm,
    fontWeight: "600",
    marginBottom: SPACING.md,
    color: COLORS.text,
  },
  header: {
    flexDirection: "row",
    paddingBottom: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
    marginBottom: SPACING.sm,
  },
  headerText: {
    ...TEXT_STYLES.caption,
    fontSize: 11,
    fontWeight: "600",
    color: COLORS.textSecondary,
  },
  listContainer: {
    gap: SPACING.xs,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: SPACING.xs,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.borderLight,
  },
  colRoute: {
    flex: 0.8,
  },
  colDriver: {
    flex: 1.2,
  },
  colStatus: {
    flex: 1,
    alignItems: "flex-start",
  },
  colPassengers: {
    flex: 0.6,
    alignItems: "flex-end",
  },
  cellText: {
    ...TEXT_STYLES.caption,
    color: COLORS.text,
  },
  cellTextBold: {
    ...TEXT_STYLES.caption,
    fontWeight: "600",
    color: COLORS.text,
  },
})
