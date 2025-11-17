import React, { useEffect, useMemo, useState, useCallback, useRef } from "react"
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ActivityIndicator, Dimensions, Platform, FlatList, Animated, PanResponder } from "react-native"
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context"
import * as Location from "expo-location"
import Constants from "expo-constants"
import { Ionicons } from "@expo/vector-icons"
import MapWebView from "../../components/MapWebView"
import { COLORS, SPACING, RADIUS, TEXT_STYLES } from "../../theme"
import { Card, Badge, CurrencyDisplay } from "../../components"

// Types

type TransportType = "bus" | "rapid"
type RouteStatus = "on_time" | "delayed" | "coming_soon"

interface RouteInfo {
  id: string
  name: string
  type: TransportType
  frequency: string
  priceUSD: number
  status: RouteStatus
  color: string
  stops: { id: string; lat: number; lng: number; name: string }[]
  busPositions: { id: string; lat: number; lng: number }[]
}

// Local lightweight types to avoid importing expo-maps in Expo Go
type Coordinates = { latitude: number; longitude: number }
type CameraPosition = { coordinates: Coordinates; zoom?: number }

const STATUS: Record<RouteStatus, { label: string; color: string }> = {
  on_time: { label: "A tiempo", color: COLORS.success },
  delayed: { label: "Retrasado", color: COLORS.warning },
  coming_soon: { label: "Próximamente", color: COLORS.primary },
}

// Base region (Puerto Ordaz approximate center)
const BASE_CENTER: Coordinates = { latitude: 8.2856, longitude: -62.7453 }

// Mock routes data (static for MVP)
const MOCK_ROUTES: RouteInfo[] = [
  {
    id: "A1",
    name: "Ruta A1 - Unare Centro",
    type: "bus",
    frequency: "5-10 min",
    priceUSD: 0.5,
    status: "on_time",
    color: COLORS.primary,
    stops: [
      { id: "s1", lat: 8.2856, lng: -62.7453, name: "Unare Plaza" },
      { id: "s2", lat: 8.2892, lng: -62.7405, name: "Av. Principal" },
      { id: "s3", lat: 8.292, lng: -62.748, name: "Mercado" },
      { id: "s4", lat: 8.283, lng: -62.7505, name: "Terminal" },
    ],
    busPositions: [
      { id: "b1", lat: 8.2882, lng: -62.7436 },
      { id: "b2", lat: 8.286, lng: -62.7475 },
    ],
  },
  {
    id: "B5",
    name: "Ruta B5 - Alta Vista",
    type: "rapid",
    frequency: "3-6 min",
    priceUSD: 0.75,
    status: "delayed",
    color: COLORS.success,
    stops: [
      { id: "sb1", lat: 8.2955, lng: -62.742, name: "Alta Vista" },
      { id: "sb2", lat: 8.299, lng: -62.739, name: "Centro Sur" },
    ],
    busPositions: [{ id: "bb1", lat: 8.2968, lng: -62.741 }],
  },
]

// Add more mock routes dispersed within Puerto Ordaz bounds (local jitter around center)
{
  const seed = (n: number) => {
    const x = Math.sin(n * 997.3) * 10000
    return x - Math.floor(x)
  }
  // Rough city-local offsets so everything stays near Puerto Ordaz
  const MAX_OFF_LAT = 0.004 // ~400m
  const MAX_OFF_LNG = 0.0045 // ~500m
  for (let i = 3; i <= 10; i++) {
    const id = `R${i}`
    const color = i % 2 === 0 ? COLORS.primary : COLORS.success
    const type: TransportType = i % 2 === 0 ? "bus" : "rapid"

    // Small center offsets to avoid overlap but stay within city
    const offLat = (seed(i * 11) - 0.5) * 2 * MAX_OFF_LAT
    const offLng = (seed(i * 13) - 0.5) * 2 * MAX_OFF_LNG
    const baseLat = BASE_CENTER.latitude + offLat
    const baseLng = BASE_CENTER.longitude + offLng

    const stopsCount = 5 + (i % 3) // 5..7
    const baseR = 0.0014 + 0.0005 * (1 + (i % 3)) // 0.0019..0.0029 aprox (compact)
    const stretch = 1.15 + 0.1 * (i % 2)
    const angleStart = ((i * 37) % 360) * (Math.PI / 180)

    const stops: { id: string; lat: number; lng: number; name: string }[] = []
    for (let k = 0; k < stopsCount; k++) {
      const t = (k / Math.max(1, stopsCount - 1)) - 0.5 // -0.5..0.5
      const angle = angleStart + t * Math.PI * 0.55 // arco ~99°
      const rJitter = baseR * (0.9 + 0.25 * seed(i * 10 + k))
      const lat = baseLat + rJitter * Math.cos(angle)
      const lng = baseLng + rJitter * Math.sin(angle) * stretch
      stops.push({ id: `${id}s${k + 1}`, lat, lng, name: `Parada ${id}-${k + 1}` })
    }

    // Place buses between random consecutive stops (on-route feel)
    const busPositions: { id: string; lat: number; lng: number }[] = []
    for (let b = 0; b < 2; b++) {
      const idx = Math.min(stops.length - 2, Math.floor(seed(i * 50 + b) * (stops.length - 1)))
      const a = stops[idx]
      const c = stops[idx + 1]
      const alpha = 0.35 + 0.3 * seed(i * 70 + b)
      const lat = a.lat + (c.lat - a.lat) * alpha
      const lng = a.lng + (c.lng - a.lng) * alpha
      busPositions.push({ id: `${id}b${b + 1}`, lat, lng })
    }

    MOCK_ROUTES.push({
      id,
      name: `Ruta ${id} - Puerto Ordaz`,
      type,
      frequency: i % 3 === 0 ? "6-12 min" : "4-8 min",
      priceUSD: type === "bus" ? 0.5 : 0.75,
      status: (i % 3 === 0 ? "delayed" : "on_time") as RouteStatus,
      color,
      stops,
      busPositions,
    })
  }
}

export default function RoutesMapScreen() {
  const insets = useSafeAreaInsets()
  const [search, setSearch] = useState("")
  const [type, setType] = useState<"all" | TransportType>("all")
  const [expandedRoute, setExpandedRoute] = useState<string | null>(null)

  const [locGranted, setLocGranted] = useState(false)
  const [locLoading, setLocLoading] = useState(true)
  const [userCoord, setUserCoord] = useState<{ lat: number; lng: number } | null>(null)

  // Ask for location permission (MVP: one-shot)
  useEffect(() => {
    let mounted = true
    const ask = async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync()
        if (!mounted) return
        if (status === "granted") {
          setLocGranted(true)
          const pos = await Location.getCurrentPositionAsync({})
          if (mounted && pos?.coords) {
            setUserCoord({ lat: pos.coords.latitude, lng: pos.coords.longitude })
          }
        }
      } catch {
        // ignore failures for MVP
      } finally {
        if (mounted) setLocLoading(false)
      }
    }
    ask()
    return () => {
      mounted = false
    }
  }, [])

  // Filtered routes based on search + type
  const routes = useMemo(() => {
    return MOCK_ROUTES.filter((r) => {
      const matchType = type === "all" || r.type === type
      const matchText = r.name.toLowerCase().includes(search.toLowerCase())
      return matchType && matchText
    })
  }, [search, type])

  // Polyline builder
  const lineFor = useCallback(
    (r: RouteInfo): Coordinates[] => r.stops.map((s) => ({ latitude: s.lat, longitude: s.lng })),
    []
  )

  const screenH = Dimensions.get("window").height
  const mapH = screenH // full screen background map height
  // Start más bajo (~30% pantalla) para que se vean 2 rutas completas de forma simétrica
  const SHEET_MIN = Math.max(200, Math.floor(screenH * 0.30))
  // Gap superior más generoso para no invadir notch/notifications y garantizar zona táctil del grabber
  const TOP_GAP = Math.max(insets.top + 96, 84)
  // Altura máxima de la hoja dejando un gap arriba
  const SHEET_MAX = Math.floor(screenH - TOP_GAP)
  const [sheetOpen, setSheetOpen] = useState(false)
  const heightAnim = useRef(new Animated.Value(SHEET_MIN)).current
  const sheetStartRef = useRef(SHEET_MIN)
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        // Iniciar desde la altura actual para permitir arrastres intermedios
        // @ts-expect-error private API access for current value
        sheetStartRef.current = typeof heightAnim._value === 'number' ? heightAnim._value : (sheetOpen ? SHEET_MAX : SHEET_MIN)
      },
      onPanResponderMove: (_, gesture) => {
        const proposed = sheetStartRef.current - gesture.dy
        const clamped = Math.max(SHEET_MIN, Math.min(SHEET_MAX, proposed))
        heightAnim.setValue(clamped)
      },
      onPanResponderRelease: (_, gesture) => {
        // @ts-expect-error private API access for current value
        const current = heightAnim._value as number
        const midpoint = (SHEET_MIN + SHEET_MAX) / 2
        const snapToMax = current > midpoint || gesture.vy < -0.5
        Animated.spring(heightAnim, { toValue: snapToMax ? SHEET_MAX : SHEET_MIN, useNativeDriver: false, bounciness: 0 }).start()
        setSheetOpen(snapToMax)
      },
    })
  ).current
  // Lazy require expo-maps to avoid crashing in Expo Go (module not present)
  const Maps = React.useMemo(() => {
    // In Expo Go (appOwnership === 'expo'), the native module is not available → force fallback
    if (Constants?.appOwnership === "expo") return null
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      return require("expo-maps") as { AppleMaps?: any; GoogleMaps?: any }
    } catch (e) {
      return null
    }
  }, [])

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* Background map full screen */}
      <View style={styles.mapContainer}>
        {Platform.OS === "ios" && Maps?.AppleMaps ? (
          <Maps.AppleMaps.View
            style={styles.map}
            cameraPosition={{ coordinates: BASE_CENTER, zoom: 13 } as CameraPosition}
            properties={{ isMyLocationEnabled: locGranted }}
            annotations={routes.flatMap((r) =>
              r.stops.map((s) => ({
                id: `${r.id}:${s.id}`,
                coordinates: { latitude: s.lat, longitude: s.lng },
                title: s.name,
                tintColor: r.color,
              }))
            )}
            polylines={routes.map((r) => ({
              id: `${r.id}:poly`,
              coordinates: lineFor(r),
              color: r.color,
              width: 4,
            }))}
          />
        ) : Platform.OS === "android" && Maps?.GoogleMaps ? (
          <Maps.GoogleMaps.View
            style={styles.map}
            cameraPosition={{ coordinates: BASE_CENTER, zoom: 13 } as CameraPosition}
            properties={{ isMyLocationEnabled: locGranted }}
            uiSettings={{ myLocationButtonEnabled: false }}
            markers={routes.flatMap((r) => [
              ...r.stops.map((s) => ({
                id: `${r.id}:${s.id}`,
                coordinates: { latitude: s.lat, longitude: s.lng },
                title: s.name,
                snippet: "Parada",
              })),
              ...r.busPositions.map((b) => ({
                id: `${r.id}:bus:${b.id}`,
                coordinates: { latitude: b.lat, longitude: b.lng },
                title: `Bus ${r.id}`,
                snippet: r.name,
              })),
            ])}
            polylines={routes.map((r) => ({
              id: `${r.id}:poly`,
              coordinates: lineFor(r),
              color: r.color,
              width: 4,
            }))}
          />
        ) : (
          <MapWebView
            height={mapH}
            center={{ lat: BASE_CENTER.latitude ?? 8.2856, lng: BASE_CENTER.longitude ?? -62.7453 }}
            user={userCoord || undefined}
            stops={routes.flatMap((r) => r.stops.map((s) => ({ ...s, color: r.color })))}
            buses={routes.flatMap((r) => r.busPositions.map((b) => ({ ...b, color: r.color, label: r.id })))}
            polylines={routes.map((r) => ({ id: r.id, coords: r.stops.map((s) => ({ lat: s.lat, lng: s.lng })), color: r.color }))}
          />
        )}
      </View>

      {/* Top overlay controls */}
      <View
        style={[styles.overlay, { top: SPACING.lg + insets.top }]}
        pointerEvents={sheetOpen ? "none" : "box-none"}
      >
        <View style={styles.searchBar}>
          <Ionicons name="search-outline" size={18} color={COLORS.textTertiary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar rutas o paradas..."
            placeholderTextColor={COLORS.textTertiary}
            value={search}
            onChangeText={setSearch}
            autoCorrect={false}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch("")}>
              <Ionicons name="close-outline" size={18} color={COLORS.textTertiary} />
            </TouchableOpacity>
          )}
        </View>
        <View style={styles.filterRow}>
          {["all", "bus", "rapid"].map((t) => (
            <TouchableOpacity
              key={t}
              style={[styles.chip, type === t && styles.chipActive]}
              onPress={() => setType(t as typeof type)}
            >
              <Text style={[styles.chipText, type === t && styles.chipTextActive]}>
                {t === "all" ? "Todas" : t === "bus" ? "Bus" : "Rápido"}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Location status badges */}
      {locLoading && (
        <View style={styles.locBadge} pointerEvents="none">
          <ActivityIndicator color={COLORS.primary} />
          <Text style={styles.locBadgeText}>Localizando...</Text>
        </View>
      )}
      {!locLoading && !locGranted && (
        <View style={[styles.locBadge, styles.locDenied]} pointerEvents="none">
          <Ionicons name="warning-outline" size={18} color={COLORS.warning} />
          <Text style={[styles.locBadgeText, { color: COLORS.warning }]}>Permiso de ubicación denegado</Text>
        </View>
      )}

      {/* ROUTES LIST BELOW MAP */}
      <Animated.View style={[
          styles.bottomSheet,
          {
            paddingBottom: 0,
            // cuando está expandido, agrega paddingTop extra para respetar el notch
            paddingTop: sheetOpen ? (insets.top + SPACING.xl) : SPACING.md,
            height: heightAnim,
          },
        ]}> 
        <View style={styles.grabberWrap} {...panResponder.panHandlers}>
          <View style={styles.grabber} />
        </View>
        <View style={styles.listHeader}>
          <Text style={styles.listTitle}>Rutas ({routes.length})</Text>
        </View>
        <FlatList
          data={routes}
          keyExtractor={(r) => r.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 0 }}
          renderItem={({ item: r }) => (
            <Card key={r.id} style={styles.itemCard} variant="outlined" padding={false}>
              <TouchableOpacity
                style={styles.itemRow}
                activeOpacity={0.85}
                onPress={() => setExpandedRoute(expandedRoute === r.id ? null : r.id)}
              >
                <View style={[styles.badge, { backgroundColor: r.color }]}>
                  <Text style={styles.badgeText}>{r.id}</Text>
                </View>
                <View style={styles.itemInfo}>
                  <Text style={styles.itemName}>{r.name}</Text>
                  <View style={styles.itemMeta}>
                    <Ionicons name="time-outline" size={14} color={COLORS.textTertiary} />
                    <Text style={styles.metaText}>{r.frequency}</Text>
                    <View style={styles.metaDot} />
                    <CurrencyDisplay usdAmount={r.priceUSD} size="sm" />
                  </View>
                </View>
                <Badge
                  label={STATUS[r.status].label}
                  variant={r.status === "on_time" ? "success" : r.status === "delayed" ? "warning" : "primary"}
                  size="sm"
                />
                <Ionicons
                  name={expandedRoute === r.id ? "chevron-up-outline" : "chevron-down-outline"}
                  size={18}
                  color={COLORS.textTertiary}
                />
              </TouchableOpacity>
              {expandedRoute === r.id && (
                <View style={styles.expanded}>
                  <Text style={styles.expandedTitle}>Paradas ({r.stops.length})</Text>
                  {r.stops.map((s) => (
                    <View key={s.id} style={styles.stopRow}>
                      <Ionicons name="pin" size={14} color={r.color} />
                      <Text style={styles.stopName}>{s.name}</Text>
                    </View>
                  ))}
                </View>
              )}
            </Card>
          )}
        />
  </Animated.View>
    </SafeAreaView>
  )
}

// Light custom map style (minimal POI clutter)
// Note: Custom styling is different in expo-maps (Android: mapStyleOptions JSON, iOS: properties). Skipped for MVP.

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  mapContainer: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0 },
  map: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0 },
  overlay: { position: "absolute", left: SPACING.lg, right: SPACING.lg, gap: SPACING.md, zIndex: 10 },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.full,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: SPACING.md,
  },
  searchInput: { flex: 1, ...TEXT_STYLES.bodySm, color: COLORS.text },
  filterRow: { flexDirection: "row", gap: SPACING.sm },
  chip: { paddingHorizontal: SPACING.md, paddingVertical: SPACING.xs, borderRadius: RADIUS.full, backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border },
  chipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  chipText: { ...TEXT_STYLES.caption, color: COLORS.text, fontWeight: "600" },
  chipTextActive: { color: COLORS.textInverse },
  locBadge: {
    position: "absolute",
    top: SPACING.lg,
    right: SPACING.lg,
    backgroundColor: COLORS.surface,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.full,
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.sm,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
    zIndex: 15,
  },
  locDenied: { borderWidth: 1, borderColor: COLORS.warning },
  locBadgeText: { ...TEXT_STYLES.caption, color: COLORS.textSecondary },
  stopMarker: { width: 28, height: 28, borderRadius: 14, justifyContent: "center", alignItems: "center" },
  busMarker: { backgroundColor: COLORS.surface, borderRadius: RADIUS.full, padding: SPACING.xs, shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, elevation: 2 },
  bottomSheet: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: RADIUS.xl,
    borderTopRightRadius: RADIUS.xl,
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 8,
    zIndex: 20,
  },
  grabberWrap: { alignItems: "center", paddingTop: SPACING.sm, paddingBottom: SPACING.md },
  grabber: { width: 40, height: 5, borderRadius: 3, backgroundColor: COLORS.border },
  listHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: SPACING.md },
  listTitle: { ...TEXT_STYLES.subtitle, color: COLORS.text },
  itemCard: { marginBottom: SPACING.md, borderRadius: RADIUS.md, overflow: "hidden" },
  itemRow: { flexDirection: "row", alignItems: "center", gap: SPACING.md, paddingHorizontal: SPACING.md, paddingVertical: SPACING.md },
  badge: { width: 40, height: 40, borderRadius: RADIUS.md, justifyContent: "center", alignItems: "center" },
  badgeText: { ...TEXT_STYLES.bodySm, color: COLORS.textInverse, fontWeight: "700" },
  itemInfo: { flex: 1 },
  itemName: { ...TEXT_STYLES.bodySm, color: COLORS.text, fontWeight: "600", marginBottom: SPACING.xs },
  itemMeta: { flexDirection: "row", alignItems: "center", gap: SPACING.xs },
  metaText: { ...TEXT_STYLES.caption, color: COLORS.textTertiary },
  metaDot: { width: 4, height: 4, borderRadius: 2, backgroundColor: COLORS.textTertiary },
  expanded: { paddingHorizontal: SPACING.md, paddingBottom: SPACING.md, gap: SPACING.xs },
  expandedTitle: { ...TEXT_STYLES.caption, color: COLORS.textSecondary, fontWeight: "600", marginTop: -SPACING.xs },
  stopRow: { flexDirection: "row", alignItems: "center", gap: SPACING.sm },
  stopName: { ...TEXT_STYLES.caption, color: COLORS.text },
})
