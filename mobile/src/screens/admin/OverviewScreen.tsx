"use client"

import React from "react"
import { SafeAreaView } from "react-native-safe-area-context"
import { StyleSheet, View, ScrollView } from "react-native"
import { COLORS, globalStyles, SPACING } from "../../theme"
import AdminHeader from "../../components/AdminHeader"
import { StatCard } from "../../components/StatCard"
import { CurrencyDisplay } from "../../components/CurrencyDisplay"
import UserDistributionChart from "../../components/UserDistributionChart"
import { RecentActivityTable } from "../../components/RecentActivityTable"

const OverviewScreen: React.FC = () => {
  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <ScrollView contentContainerStyle={globalStyles.screenPadding}>
        <AdminHeader name="Admin" />
        {/* Grid de estadísticas */}
        <View style={styles.statsGrid}>
          <StatCard
            icon="people-outline"
            label="Total Usuarios"
            value="12,345"
            trend="+12%"
            trendDirection="up"
            color={COLORS.success}
            style={styles.statItem}
          />
          <StatCard
            icon="location-outline"
            label="Rutas Activas"
            value="24"
            trend="+2"
            trendDirection="up"
            color={COLORS.primary}
            style={styles.statItem}
          />
          <StatCard
            icon="bus-outline"
            label="Conductores"
            value="48"
            trend="-3"
            trendDirection="down"
            color={COLORS.primaryDark}
            style={styles.statItem}
          />
          <StatCard
            icon="cash-outline"
            label="Ingresos Hoy"
            color={COLORS.primary}
            style={styles.statItem}
            valueNode={<CurrencyDisplay usdAmount={3456} size="md" />}
            trend="+18%"
            trendDirection="up"
          />
        </View>
        <UserDistributionChart />
        <RecentActivityTable />
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: SPACING.lg,
    gap: SPACING.md,
    justifyContent: "space-between",
  },
  statItem: {
    width: "48%",
  },
})

export default OverviewScreen
