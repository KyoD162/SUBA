import React, { useMemo, useState } from "react"
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, ActivityIndicator } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { Ionicons } from "@expo/vector-icons"
import { COLORS, SPACING, RADIUS, TEXT_STYLES, globalStyles } from "../../theme"
import { Card, Badge, CurrencyDisplay } from "../../components"

interface Route {
  id: string
  name: string
  type: "bus" | "transmilenio"
  stops: number
  frequency: string
  distance: number
  status: "on_time" | "delayed" | "coming_soon"
  passengers: number
  nextArrival: string
  color: string
  priceUSD: number
  neighborhood: string
}

const mockRoutes: Route[] = [
  {
    id: "A1",
    name: "Ruta A1 - Unare Centro",
    type: "bus",
    stops: 12,
    frequency: "5-10 min",
    distance: 2.3,
    status: "on_time",
    passengers: 45,
    nextArrival: "3 min",
    color: COLORS.primary,
    priceUSD: 0.5,
    neighborhood: "Unare",
  },
  {
    id: "B5",
    name: "Ruta B5 - Alta Vista",
    type: "transmilenio",
    stops: 8,
    frequency: "3-5 min",
    distance: 1.8,
    status: "on_time",
    passengers: 120,
    nextArrival: "2 min",
    color: COLORS.success,
    priceUSD: 0.75,
    neighborhood: "Alta Vista",
  },
  {
    id: "C3",
    name: "Ruta C3 - San Félix",
    type: "bus",
    stops: 15,
    frequency: "8-12 min",
    distance: 3.1,
    status: "delayed",
    passengers: 32,
    nextArrival: "8 min",
    color: COLORS.primaryDark,
    priceUSD: 0.6,
    neighborhood: "San Félix",
  },
  {
    id: "D2",
    name: "Ruta D2 - Villa Asia",
    type: "bus",
    stops: 10,
    frequency: "6-8 min",
    distance: 2.5,
    status: "coming_soon",
    passengers: 0,
    nextArrival: "12 min",
    color: "#A9D6E5",
    priceUSD: 0.55,
    neighborhood: "Villa Asia",
  },
]

const statusConfig = {
  on_time: { label: "A tiempo", color: COLORS.success },
  delayed: { label: "Retrasado", color: COLORS.warning },
  coming_soon: { label: "Próximamente", color: COLORS.primary },
} as const

export default function RoutesScreen() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedType, setSelectedType] = useState<"all" | "bus" | "transmilenio">("all")
  const [isLoading] = useState(false)
  const [showMap, setShowMap] = useState(true)

  const filteredRoutes = useMemo(
    () =>
      mockRoutes.filter((route) => {
        const matchesSearch = route.name.toLowerCase().includes(searchQuery.toLowerCase())
        const matchesType = selectedType === "all" || route.type === selectedType
        return matchesSearch && matchesType
      }),
    [searchQuery, selectedType]
  )

  const RouteCard = ({ route }: { route: Route }) => (
    <Card style={styles.routeCard} variant="outlined">
      <View style={styles.routeCardHeader}>
        <View style={[styles.routeNumber, { backgroundColor: route.color }]}>
          <Text style={styles.routeNumberText}>{route.id}</Text>
        </View>
        <View style={styles.routeCardInfo}>
          <Text style={styles.routeName}>{route.name}</Text>
          <View style={styles.routeMeta}>
            <Ionicons name="location-outline" size={14} color={COLORS.textTertiary} />
            <Text style={styles.routeMetaText}>{route.neighborhood}</Text>
            <View style={styles.metaDot} />
            <Ionicons name="time-outline" size={14} color={COLORS.textTertiary} />
            <Text style={styles.routeMetaText}>{route.frequency}</Text>
          </View>
        </View>
        <Badge
          label={statusConfig[route.status].label}
          variant={route.status === "on_time" ? "success" : route.status === "delayed" ? "warning" : "primary"}
          size="sm"
        />
      </View>

      <View style={styles.routeDetails}>
        <View style={styles.detailItem}>
          <Ionicons name="bus-outline" size={18} color={route.color} />
          <View style={styles.detailContent}>
            <Text style={styles.detailLabel}>Paradas</Text>
            <Text style={styles.detailValue}>{route.stops}</Text>
          </View>
        </View>

        <View style={styles.detailItem}>
          <Ionicons name="navigate-outline" size={18} color={route.color} />
          <View style={styles.detailContent}>
            <Text style={styles.detailLabel}>Distancia</Text>
            <Text style={styles.detailValue}>{route.distance} km</Text>
          </View>
        </View>

        <View style={styles.detailItem}>
          <Ionicons name="cash-outline" size={18} color={route.color} />
          <View style={styles.detailContent}>
            <Text style={styles.detailLabel}>Precio</Text>
            <CurrencyDisplay usdAmount={route.priceUSD} size="sm" />
          </View>
        </View>
      </View>

      <TouchableOpacity style={[styles.trackButton, { borderColor: route.color }]}>
        <Text style={[styles.trackButtonText, { color: route.color }]}>Ver en mapa</Text>
      </TouchableOpacity>
    </Card>
  )

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <Text style={styles.title}>Rutas - Puerto Ordaz</Text>
        <TouchableOpacity onPress={() => setShowMap(!showMap)}>
          <Ionicons name={showMap ? "list-outline" : "map-outline"} size={24} color={COLORS.text} />
        </TouchableOpacity>
      </View>

      {showMap && (
        <View style={styles.mapContainer}>
          <View style={styles.mapPlaceholder}>
            <Ionicons name="map-outline" size={20} color={COLORS.textSecondary} />
            <Text style={styles.mapPlaceholderText}>Vista previa del mapa (MVP)</Text>
          </View>
        </View>
      )}

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.searchContainer}>
          <Ionicons name="search-outline" size={20} color={COLORS.textTertiary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar ruta o barrio..."
            placeholderTextColor={COLORS.textTertiary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery ? (
            <TouchableOpacity onPress={() => setSearchQuery("")}>
              <Ionicons name="close-outline" size={20} color={COLORS.textTertiary} />
            </TouchableOpacity>
          ) : null}
        </View>

        <View style={styles.filterTabs}>
          {["all", "bus", "transmilenio"].map((type) => (
            <TouchableOpacity
              key={type}
              style={[styles.filterTab, selectedType === type && styles.filterTabActive]}
              onPress={() => setSelectedType(type as typeof selectedType)}
            >
              <Text style={[styles.filterTabText, selectedType === type && styles.filterTabTextActive]}>
                {type === "all" ? "Todas" : type === "bus" ? "Bus" : "Rápido"}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {isLoading ? (
          <View style={globalStyles.centered}>
            <ActivityIndicator size="large" color={COLORS.primary} />
          </View>
        ) : filteredRoutes.length > 0 ? (
          <View>
            {filteredRoutes.map((route) => (
              <RouteCard key={route.id} route={route} />
            ))}
          </View>
        ) : (
          <View style={globalStyles.centered}>
            <Ionicons name="search-outline" size={48} color={COLORS.textTertiary} />
            <Text style={styles.emptyText}>No se encontraron rutas</Text>
          </View>
        )}

        <Card style={styles.infoCard} variant="outlined">
          <View style={styles.infoContent}>
            <Ionicons name="information-circle-outline" size={24} color={COLORS.primary} />
            <View style={styles.infoText}>
              <Text style={styles.infoTitle}>Puerto Ordaz</Text>
              <Text style={styles.infoDescription}>Precios en USD con referencia en BS</Text>
            </View>
          </View>
        </Card>
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
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.md,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: {
    ...TEXT_STYLES.h2,
    color: COLORS.text,
  },
  mapContainer: {
    height: 300,
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
    borderRadius: RADIUS.lg,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  mapPlaceholder: {
    flex: 1,
    backgroundColor: COLORS.surface,
    alignItems: "center",
    justifyContent: "center",
    gap: SPACING.sm,
  },
  mapPlaceholderText: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
  },
  scrollContent: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.full,
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: SPACING.md,
  },
  searchInput: {
    flex: 1,
    paddingVertical: SPACING.md,
    ...TEXT_STYLES.body,
    color: COLORS.text,
  },
  filterTabs: {
    flexDirection: "row",
    gap: SPACING.md,
    marginBottom: SPACING.xl,
  },
  filterTab: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  filterTabActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  filterTabText: {
    ...TEXT_STYLES.bodySm,
    color: COLORS.text,
    fontWeight: "600",
  },
  filterTabTextActive: {
    color: COLORS.textInverse,
  },
  routeCard: {
    marginBottom: SPACING.lg,
  },
  routeCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  routeNumber: {
    width: 48,
    height: 48,
    borderRadius: RADIUS.md,
    justifyContent: "center",
    alignItems: "center",
  },
  routeNumberText: {
    ...TEXT_STYLES.subtitle,
    color: COLORS.textInverse,
    fontWeight: "bold",
  },
  routeCardInfo: {
    flex: 1,
  },
  routeName: {
    ...TEXT_STYLES.bodySm,
    color: COLORS.text,
    fontWeight: "600",
    marginBottom: SPACING.xs,
  },
  routeMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.xs,
  },
  routeMetaText: {
    ...TEXT_STYLES.caption,
    color: COLORS.textTertiary,
  },
  metaDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.textTertiary,
  },
  routeDetails: {
    flexDirection: "row",
    gap: SPACING.lg,
    marginBottom: SPACING.lg,
    paddingVertical: SPACING.lg,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  detailItem: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.sm,
  },
  detailContent: {
    flex: 1,
  },
  detailLabel: {
    ...TEXT_STYLES.caption,
    color: COLORS.textTertiary,
  },
  detailValue: {
    ...TEXT_STYLES.bodySm,
    color: COLORS.text,
    fontWeight: "600",
    marginTop: SPACING.xs,
  },
  trackButton: {
    borderWidth: 1.5,
    borderRadius: RADIUS.md,
    paddingVertical: SPACING.md,
    marginTop: SPACING.lg,
    alignItems: "center",
    justifyContent: "center",
  },
  trackButtonText: {
    ...TEXT_STYLES.bodySm,
    fontWeight: "600",
  },
  emptyText: {
    ...TEXT_STYLES.body,
    color: COLORS.textSecondary,
    marginTop: SPACING.lg,
  },
  infoCard: {
    marginTop: SPACING.xl,
    marginBottom: SPACING.xl,
  },
  infoContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.lg,
  },
  infoText: {
    flex: 1,
  },
  infoTitle: {
    ...TEXT_STYLES.bodySm,
    color: COLORS.text,
    fontWeight: "600",
  },
  infoDescription: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
})