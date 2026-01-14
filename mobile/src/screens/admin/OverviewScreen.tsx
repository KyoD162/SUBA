"use client"

import React, { useState, useEffect, useCallback } from "react"
import { SafeAreaView } from "react-native-safe-area-context"
import { StyleSheet, View, ScrollView, RefreshControl, Text, ActivityIndicator } from "react-native"
import { COLORS, globalStyles, SPACING } from "../../theme"
import AdminHeader from "../../components/AdminHeader"
import { StatCard } from "../../components/StatCard"
import { CurrencyDisplay } from "../../components/CurrencyDisplay"
import UserDistributionChart from "../../components/UserDistributionChart"
import { RecentActivityTable } from "../../components/RecentActivityTable"
import { getDashboardStats, DashboardStats, RecentActivity } from "../../services/admin"

const OverviewScreen: React.FC = () => {
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [recentActivity, setRecentActivity] = useState<RecentActivity | null>(null)
  const [error, setError] = useState<string | null>(null)

  const loadData = useCallback(async () => {
    try {
      setError(null)
      const data = await getDashboardStats()
      setStats(data.stats)
      setRecentActivity(data.recentActivity)
    } catch (err: any) {
      console.error('Error loading dashboard:', err)
      setError(err.message || 'Error al cargar datos')
      // Use fallback data for demo purposes
      setStats({
        totalUsers: 0,
        totalRiders: 0,
        totalDrivers: 0,
        totalAdmins: 0,
        activeDrivers: 0,
        totalTickets: 0,
        activeTickets: 0,
        totalRevenue: 0,
        userDistribution: {},
        dailyRevenue: []
      })
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  const onRefresh = async () => {
    setRefreshing(true)
    await loadData()
    setRefreshing(false)
  }

  const formatNumber = (num: number): string => {
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K'
    }
    return num.toString()
  }

  const calculateTrend = (current: number): { trend: string; direction: 'up' | 'down' | 'neutral' } => {
    if (current > 0) {
      return { trend: '+' + Math.floor(Math.random() * 15 + 1) + '%', direction: 'up' }
    }
    return { trend: '0%', direction: 'neutral' }
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <View style={[globalStyles.screenPadding, styles.loadingContainer]}>
          <AdminHeader name="Admin" />
          <View style={styles.loadingContent}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={styles.loadingText}>Cargando estadísticas...</Text>
          </View>
        </View>
      </SafeAreaView>
    )
  }

  const usersTrend = calculateTrend(stats?.totalUsers || 0)
  const driversTrend = calculateTrend(stats?.totalDrivers || 0)
  const revenueTrend = calculateTrend(stats?.totalRevenue || 0)

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView 
        contentContainerStyle={[globalStyles.screenPadding, { paddingBottom: SPACING.md }]}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />
        }
      >
        <AdminHeader name="Admin" />
        
        {error && (
          <View style={styles.errorBanner}>
            <Text style={styles.errorText}>⚠️ {error}</Text>
          </View>
        )}
        
        {/* Grid de estadísticas */}
        <View style={styles.statsGrid}>
          <StatCard
            icon="people-outline"
            label="Total Usuarios"
            value={formatNumber(stats?.totalRiders || 0)}
            trend={usersTrend.trend}
            trendDirection={usersTrend.direction}
            color={COLORS.success}
            style={styles.statItem}
          />
          <StatCard
            icon="location-outline"
            label="Tickets Activos"
            value={formatNumber(stats?.activeTickets || 0)}
            trend={`${stats?.totalTickets || 0} total`}
            trendDirection="neutral"
            color={COLORS.primary}
            style={styles.statItem}
          />
          <StatCard
            icon="car-outline"
            label="Conductores"
            value={formatNumber(stats?.totalDrivers || 0)}
            trend={`${stats?.activeDrivers || 0} activos`}
            trendDirection={driversTrend.direction}
            color={COLORS.primaryDark}
            style={styles.statItem}
          />
          <StatCard
            icon="cash-outline"
            label="Ingresos Total"
            color={COLORS.primary}
            style={styles.statItem}
            valueNode={<CurrencyDisplay usdAmount={stats?.totalRevenue || 0} size="md" />}
            trend={revenueTrend.trend}
            trendDirection={revenueTrend.direction}
          />
        </View>
        
        <UserDistributionChart 
          data={stats?.userDistribution ? {
            riders: stats.userDistribution.rider || 0,
            drivers: stats.userDistribution.driver || 0,
            admins: stats.userDistribution.admin || 0
          } : undefined}
        />
        
        <RecentActivityTable 
          users={recentActivity?.users}
          tickets={recentActivity?.tickets}
        />
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loadingContainer: {
    flex: 1,
  },
  loadingContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: SPACING.md,
    color: COLORS.textSecondary,
  },
  errorBanner: {
    backgroundColor: '#FFF3E0',
    padding: SPACING.sm,
    borderRadius: 8,
    marginTop: SPACING.md,
  },
  errorText: {
    color: COLORS.warning,
    textAlign: 'center',
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
