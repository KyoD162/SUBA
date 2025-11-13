"use client"

import { useState } from "react"
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, FlatList } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { Ionicons } from "@expo/vector-icons"
import { COLORS, SPACING, RADIUS, TEXT_STYLES } from "../../theme"
import { Card, Button, Badge } from "../../components"
import { CurrencyDisplay } from "../../components/CurrencyDisplay"
// Map preview placeholder for MVP visuals (no native map dependency)
import { scale, verticalScale } from "../../utils/responsive"

interface Stop {
  id: string
  name: string
  neighborhood: string
  distance: number
  estimatedTime: string
  priceUSD: number
  isCurrentLocation?: boolean
}

const mockStops: Stop[] = [
  {
    id: "1",
    name: "Terminal Unare",
    neighborhood: "Unare",
    distance: 0.2,
    estimatedTime: "Ahora",
    priceUSD: 0.5,
    isCurrentLocation: true,
  },
  {
    id: "2",
    name: "Plaza Alta Vista",
    neighborhood: "Alta Vista",
    distance: 0.8,
    estimatedTime: "5 min",
    priceUSD: 0.5,
  },
  {
    id: "3",
    name: "Centro Comercial Villa Asia",
    neighborhood: "Villa Asia",
    distance: 1.2,
    estimatedTime: "10 min",
    priceUSD: 0.75,
  },
  {
    id: "4",
    name: "Terminal San Félix",
    neighborhood: "San Félix",
    distance: 1.8,
    estimatedTime: "15 min",
    priceUSD: 0.75,
  },
  {
    id: "5",
    name: "Parque Castillito",
    neighborhood: "Castillito",
    distance: 2.3,
    estimatedTime: "20 min",
    priceUSD: 1.0,
  },
]

const MapPreview = () => (
  <View style={styles.mapContainer}>
    <View style={styles.mapContent}>
      <View style={styles.mapHeader}>
        <View style={styles.mapHeaderIcon}>
          <Ionicons name="map-outline" size={scale(18)} color={COLORS.textInverse} />
        </View>
        <View style={styles.mapHeaderText}>
          <Text style={styles.mapHeaderTitle}>Puerto Ordaz</Text>
          <Text style={styles.mapHeaderSubtitle}>Vista previa del recorrido</Text>
        </View>
        <Badge label="Prototipo" variant="primary" size="sm" />
      </View>

      <View style={styles.mapLegend}>
        <View style={styles.mapLegendItem}>
          <View style={[styles.legendDot, { backgroundColor: COLORS.primary }]} />
          <Text style={styles.legendText}>Operativa</Text>
        </View>
        <View style={styles.mapLegendItem}>
          <View style={[styles.legendDot, { backgroundColor: COLORS.warning }]} />
          <Text style={styles.legendText}>Retraso</Text>
        </View>
        <View style={styles.mapLegendItem}>
          <View style={[styles.legendDot, { backgroundColor: COLORS.textTertiary }]} />
          <Text style={styles.legendText}>Sin dato</Text>
        </View>
      </View>
    </View>
  </View>
)

export default function RouteDetailScreen() {
  const [selectedStop, setSelectedStop] = useState<string | null>(null)
  const [favorites, setFavorites] = useState<string[]>([])

  const toggleFavorite = (stopId: string) => {
    setFavorites((prev) => (prev.includes(stopId) ? prev.filter((id) => id !== stopId) : [...prev, stopId]))
  }

  const handleBooking = () => {
    // Navigate to payment
  }

  const StopItem = ({ stop, index }: { stop: Stop; index: number }) => (
    <TouchableOpacity
      style={[styles.stopItem, selectedStop === stop.id && styles.stopItemSelected]}
      onPress={() => setSelectedStop(stop.id)}
    >
      <View style={styles.stopItemLeft}>
        <View style={styles.stopNumberContainer}>
          {index === 0 ? <View style={styles.currentLocationDot} /> : <Text style={styles.stopNumber}>{index}</Text>}
        </View>
        {index < mockStops.length - 1 && <View style={styles.stopConnector} />}
      </View>

      <View style={styles.stopItemContent}>
        <Text style={styles.stopName}>{stop.name}</Text>
        <Text style={styles.stopNeighborhood}>{stop.neighborhood}</Text>
        <View style={styles.stopMeta}>
          <Ionicons name="navigate-outline" size={14} color={COLORS.textTertiary} />
          <Text style={styles.stopDistance}>{stop.distance} km</Text>
          <View style={styles.metaDot} />
          <Ionicons name="time-outline" size={14} color={COLORS.textTertiary} />
          <Text style={styles.stopTime}>{stop.estimatedTime}</Text>
        </View>
        <View style={styles.stopPrice}>
          <CurrencyDisplay usdAmount={stop.priceUSD} size="sm" />
        </View>
      </View>

      <TouchableOpacity onPress={() => toggleFavorite(stop.id)}>
        <Ionicons
          name={favorites.includes(stop.id) ? "star" : "star-outline"}
          size={20}
          color={favorites.includes(stop.id) ? COLORS.warning : COLORS.textTertiary}
        />
      </TouchableOpacity>
    </TouchableOpacity>
  )

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity>
          <Ionicons name="chevron-back-outline" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Ruta A1 - Unare Centro</Text>
        <TouchableOpacity>
          <Ionicons name="share-social-outline" size={24} color={COLORS.text} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Route Summary Card */}
        <Card style={styles.summaryCard}>
          <View style={styles.routeSummary}>
            <View style={styles.routeInfoBox}>
              <View style={[styles.routeNumberBig, { backgroundColor: COLORS.primary }]}>
                <Text style={styles.routeNumberBigText}>A1</Text>
              </View>
              <View>
                <Text style={styles.routeSummaryName}>Ruta A1 - Unare Centro</Text>
                <Text style={styles.routeSummaryType}>Puerto Ordaz, Venezuela</Text>
              </View>
            </View>
            <Badge label="A tiempo" variant="success" />
          </View>

          <View style={styles.routeStats}>
            <View style={styles.statBox}>
              <Ionicons name="bus-outline" size={20} color={COLORS.primary} />
              <View>
                <Text style={styles.statLabel}>Paradas</Text>
                <Text style={styles.statValue}>12</Text>
              </View>
            </View>

            <View style={styles.statBox}>
              <Ionicons name="time-outline" size={20} color={COLORS.success} />
              <View>
                <Text style={styles.statLabel}>Frecuencia</Text>
                <Text style={styles.statValue}>5-10 min</Text>
              </View>
            </View>

            <View style={styles.statBox}>
              <Ionicons name="cash-outline" size={20} color={COLORS.primaryDark} />
              <View>
                <Text style={styles.statLabel}>Desde</Text>
                <CurrencyDisplay usdAmount={0.5} size="sm" />
              </View>
            </View>
          </View>
        </Card>

        {/* Map Placeholder for MVP */}
        <MapPreview />

        {/* Stops Section */}
        <View style={styles.stopsSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Paradas ({mockStops.length})</Text>
            <TouchableOpacity>
              <Text style={styles.filterText}>Favoritas</Text>
            </TouchableOpacity>
          </View>

          <FlatList
            data={mockStops}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
            renderItem={({ item, index }) => <StopItem stop={item} index={index} />}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
          />
        </View>

        {/* Service Info */}
        <Card variant="outlined" style={styles.infoCard}>
          <View style={styles.infoItem}>
            <Ionicons name="information-circle-outline" size={24} color={COLORS.primary} />
            <View style={styles.infoContent}>
              <Text style={styles.infoTitle}>Información de servicio</Text>
              <Text style={styles.infoText}>Servicio disponible de 5:30 AM a 11:00 PM</Text>
              <Text style={styles.infoText}>Precios en USD con conversión a BS</Text>
            </View>
          </View>
        </Card>

        {/* Booking Section */}
        <View style={styles.bookingSection}>
          <Text style={styles.bookingTitle}>¿Listo para viajar?</Text>
          <Button
            title="Comprar Pase"
            variant="primary"
            size="lg"
            onPress={handleBooking}
            style={{ marginBottom: SPACING.lg }}
          />
          <Button title="Agregar a Favoritas" variant="outline" size="lg" />
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerTitle: {
    ...TEXT_STYLES.subtitle,
    color: COLORS.text,
  },
  scrollContent: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.lg,
  },
  summaryCard: {
    marginBottom: SPACING.xl,
  },
  routeSummary: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SPACING.xl,
  },
  routeInfoBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.lg,
    flex: 1,
  },
  routeNumberBig: {
    width: 56,
    height: 56,
    borderRadius: RADIUS.lg,
    justifyContent: "center",
    alignItems: "center",
  },
  routeNumberBigText: {
    ...TEXT_STYLES.h3,
    color: COLORS.textInverse,
  },
  routeSummaryName: {
    ...TEXT_STYLES.bodySm,
    color: COLORS.text,
    fontWeight: "600",
  },
  routeSummaryType: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  routeStats: {
    flexDirection: "row",
    gap: SPACING.lg,
    paddingTop: SPACING.lg,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  statBox: {
    flex: 1,
    alignItems: "center",
    gap: SPACING.sm,
  },
  statLabel: {
    ...TEXT_STYLES.caption,
    color: COLORS.textTertiary,
  },
  statValue: {
    ...TEXT_STYLES.bodySm,
    color: COLORS.text,
    fontWeight: "600",
  },
  
  stopsSection: {
    marginBottom: SPACING.xl,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    ...TEXT_STYLES.subtitle,
    color: COLORS.text,
  },
  filterText: {
    ...TEXT_STYLES.bodySm,
    color: COLORS.primary,
    fontWeight: "600",
  },
  stopItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingVertical: SPACING.lg,
    backgroundColor: COLORS.surface,
    paddingHorizontal: SPACING.lg,
    borderRadius: RADIUS.md,
    marginVertical: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  stopItemSelected: {
    backgroundColor: COLORS.surfaceAlt,
    borderColor: COLORS.primary,
    borderWidth: 2,
  },
  stopItemLeft: {
    alignItems: "center",
    marginRight: SPACING.lg,
  },
  stopNumberContainer: {
    width: 32,
    height: 32,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.background,
    justifyContent: "center",
    alignItems: "center",
  },
  stopNumber: {
    ...TEXT_STYLES.bodySm,
    color: COLORS.primary,
    fontWeight: "700",
  },
  currentLocationDot: {
    width: 12,
    height: 12,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.primary,
  },
  stopConnector: {
    width: 2,
    height: 40,
    backgroundColor: COLORS.border,
    marginTop: 8,
  },
  stopItemContent: {
    flex: 1,
  },
  stopName: {
    ...TEXT_STYLES.bodySm,
    color: COLORS.text,
    fontWeight: "600",
    marginBottom: SPACING.xs,
  },
  stopNeighborhood: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  stopMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.xs,
    marginBottom: SPACING.sm,
  },
  stopDistance: {
    ...TEXT_STYLES.caption,
    color: COLORS.textTertiary,
  },
  metaDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.textTertiary,
  },
  stopTime: {
    ...TEXT_STYLES.caption,
    color: COLORS.textTertiary,
  },
  stopPrice: {
    marginTop: SPACING.xs,
  },
  separator: {
    height: SPACING.sm,
  },
  infoCard: {
    marginBottom: SPACING.xl,
  },
  infoItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: SPACING.lg,
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    ...TEXT_STYLES.bodySm,
    color: COLORS.text,
    fontWeight: "600",
    marginBottom: SPACING.xs,
  },
  infoText: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  bookingSection: {
    marginBottom: SPACING.xl,
  },
  bookingTitle: {
    ...TEXT_STYLES.subtitle,
    color: COLORS.text,
    marginBottom: SPACING.lg,
  },
  // Map preview styles
  mapContainer: {
    height: 250,
    marginBottom: SPACING.xl,
    borderRadius: RADIUS.lg,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
  },
  mapContent: {
    paddingHorizontal: scale(SPACING.lg),
    paddingVertical: verticalScale(SPACING.lg),
    gap: verticalScale(SPACING.md),
  },
  mapHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  mapHeaderIcon: {
    width: scale(36),
    height: scale(36),
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  mapHeaderText: {
    flex: 1,
    marginHorizontal: scale(SPACING.md),
  },
  mapHeaderTitle: {
    ...TEXT_STYLES.subtitle,
    color: COLORS.text,
  },
  mapHeaderSubtitle: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
    marginTop: verticalScale(4),
  },
  mapLegend: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  mapLegendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: scale(SPACING.xs),
  },
  legendDot: {
    width: scale(10),
    height: scale(10),
    borderRadius: RADIUS.full,
  },
  legendText: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
  },
})
