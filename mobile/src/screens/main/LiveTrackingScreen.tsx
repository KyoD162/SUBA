import React, { useEffect, useState, useMemo, useCallback } from 'react'
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Dimensions, Modal, RefreshControl } from 'react-native'
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import MapWebView from '../../components/MapWebView'
import { COLORS, SPACING, RADIUS, TEXT_STYLES } from '../../theme'
import { useTrip, formatDistance } from '../../navigation/TripContext'
import { getRoutes, getBusesOnRoute, RouteData, BusOnRoute } from '../../services/trip'
import { BusLocation } from '../../services/socket'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import type { RootStackParamList } from '../../navigation/types'

const GOOGLE_MAPS_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY || ''

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'RouteDetail'>

interface LiveTrackingScreenProps {
  navigation: NavigationProp
  route: {
    params: {
      routeId: string
    }
  }
}

export default function LiveTrackingScreen({ navigation, route: navRoute }: LiveTrackingScreenProps) {
  const { routeId } = navRoute.params
  const insets = useSafeAreaInsets()
  const { activeBuses, subscribeToRoute, unsubscribeFromRoute } = useTrip()
  
  const [routeData, setRouteData] = useState<RouteData | null>(null)
  const [buses, setBuses] = useState<BusOnRoute[]>([])
  const [selectedBus, setSelectedBus] = useState<string | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [showBusList, setShowBusList] = useState(true)

  // Subscribe to route updates on mount
  useEffect(() => {
    subscribeToRoute(routeId)
    return () => {
      unsubscribeFromRoute(routeId)
    }
  }, [routeId])

  // Fetch route data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const routes = await getRoutes()
        const found = routes.find(r => r.routeId === routeId)
        if (found) {
          setRouteData(found)
        }
      } catch (err) {
        console.error('Error fetching route:', err)
      }
    }
    fetchData()
  }, [routeId])

  // Fetch initial buses
  const fetchBuses = useCallback(async () => {
    try {
      setIsRefreshing(true)
      const busData = await getBusesOnRoute(routeId)
      setBuses(busData)
    } catch (err) {
      console.error('Error fetching buses:', err)
    } finally {
      setIsRefreshing(false)
    }
  }, [routeId])

  useEffect(() => {
    fetchBuses()
  }, [fetchBuses])

  // Update buses from socket
  useEffect(() => {
    const routeBuses: BusOnRoute[] = []
    activeBuses.forEach((bus) => {
      if (bus.routeId === routeId) {
        routeBuses.push({
          tripId: bus.tripId,
          lat: bus.lat,
          lng: bus.lng,
          occupancy: bus.occupancy,
          maxCapacity: bus.maxCapacity,
          occupancyPercent: Math.round((bus.occupancy / bus.maxCapacity) * 100),
          nextStop: bus.nextStopId ? {
            id: bus.nextStopId,
            name: bus.nextStopName,
            lat: 0,
            lng: 0,
          } : null,
          currentStopIndex: bus.currentStopIndex,
          totalStops: 0,
        })
      }
    })
    
    if (routeBuses.length > 0) {
      setBuses(prev => {
        // Merge with existing data
        const merged = [...prev]
        routeBuses.forEach(newBus => {
          const idx = merged.findIndex(b => b.tripId === newBus.tripId)
          if (idx >= 0) {
            merged[idx] = { ...merged[idx], ...newBus }
          } else {
            merged.push(newBus)
          }
        })
        return merged
      })
    }
  }, [activeBuses, routeId])

  const mapStops = useMemo(() => {
    if (!routeData?.stops) return []
    return routeData.stops.map(s => ({
      id: s.id,
      lat: s.lat,
      lng: s.lng,
      name: s.name,
      color: routeData.color,
    }))
  }, [routeData])

  const mapBuses = useMemo(() => {
    return buses.map(bus => ({
      id: bus.tripId,
      lat: bus.lat,
      lng: bus.lng,
      color: routeData?.color || COLORS.primary,
      label: `${bus.occupancyPercent}%`,
    }))
  }, [buses, routeData])

  const polyline = useMemo(() => {
    if (!routeData?.stops) return []
    return routeData.stops.map(s => ({ lat: s.lat, lng: s.lng }))
  }, [routeData])

  const screenH = Dimensions.get('window').height

  const getOccupancyColor = (percent: number) => {
    if (percent < 50) return COLORS.success
    if (percent < 80) return COLORS.warning
    return COLORS.danger
  }

  const selectedBusData = buses.find(b => b.tripId === selectedBus)

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top > 0 ? 0 : SPACING.md }]}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>{routeData?.name || 'Cargando...'}</Text>
          <Text style={styles.headerSubtitle}>
            {buses.length} {buses.length === 1 ? 'bus' : 'buses'} en ruta
          </Text>
        </View>
        <TouchableOpacity 
          style={styles.refreshButton}
          onPress={fetchBuses}
        >
          <Ionicons name="refresh" size={22} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      {/* Map */}
      <View style={styles.mapContainer}>
        <MapWebView
          height={screenH * 0.55}
          center={routeData?.stops?.[0] ? { lat: routeData.stops[0].lat, lng: routeData.stops[0].lng } : { lat: 8.2856, lng: -62.7453 }}
          stops={mapStops}
          buses={mapBuses}
          polylines={polyline.length > 0 ? [{ id: routeId, coords: polyline, color: routeData?.color || COLORS.primary }] : []}
          googleApiKey={GOOGLE_MAPS_API_KEY}
          showDirections
        />
      </View>

      {/* Bottom Panel */}
      <View style={[styles.bottomPanel, { paddingBottom: Math.max(insets.bottom, SPACING.md) }]}>
        <View style={styles.panelHeader}>
          <TouchableOpacity 
            style={styles.panelHandle}
            onPress={() => setShowBusList(!showBusList)}
          >
            <View style={styles.handle} />
          </TouchableOpacity>
          <Text style={styles.panelTitle}>Buses en tiempo real</Text>
        </View>

        {showBusList && (
          <FlatList
            data={buses}
            keyExtractor={b => b.tripId}
            refreshControl={
              <RefreshControl
                refreshing={isRefreshing}
                onRefresh={fetchBuses}
                colors={[COLORS.primary]}
              />
            }
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <Ionicons name="bus-outline" size={48} color={COLORS.textTertiary} />
                <Text style={styles.emptyText}>No hay buses activos en esta ruta</Text>
                <Text style={styles.emptySubtext}>Desliza hacia abajo para actualizar</Text>
              </View>
            }
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.busCard,
                  selectedBus === item.tripId && styles.busCardSelected
                ]}
                onPress={() => setSelectedBus(item.tripId === selectedBus ? null : item.tripId)}
              >
                <View style={styles.busIconContainer}>
                  <View style={[styles.busIconBg, { backgroundColor: routeData?.color || COLORS.primary }]}>
                    <Ionicons name="bus" size={20} color={COLORS.textInverse} />
                  </View>
                  <View style={[styles.liveIndicator, { backgroundColor: COLORS.success }]} />
                </View>
                
                <View style={styles.busInfo}>
                  <View style={styles.busMainInfo}>
                    <Text style={styles.busNextStop} numberOfLines={1}>
                      → {item.nextStop?.name || 'Fin de ruta'}
                    </Text>
                    <View style={styles.occupancyBadge}>
                      <View 
                        style={[
                          styles.occupancyDot, 
                          { backgroundColor: getOccupancyColor(item.occupancyPercent) }
                        ]} 
                      />
                      <Text style={styles.occupancyText}>{item.occupancyPercent}%</Text>
                    </View>
                  </View>
                  <View style={styles.busStats}>
                    <Text style={styles.busStat}>
                      <Ionicons name="people-outline" size={12} color={COLORS.textSecondary} />
                      {' '}{item.occupancy}/{item.maxCapacity} pasajeros
                    </Text>
                    <Text style={styles.busStat}>
                      <Ionicons name="flag-outline" size={12} color={COLORS.textSecondary} />
                      {' '}Parada {item.currentStopIndex + 1}/{item.totalStops || '?'}
                    </Text>
                  </View>
                </View>

                <Ionicons 
                  name={selectedBus === item.tripId ? "chevron-up" : "chevron-forward"} 
                  size={20} 
                  color={COLORS.textTertiary} 
                />
              </TouchableOpacity>
            )}
          />
        )}
      </View>

      {/* Selected Bus Details Modal */}
      <Modal
        visible={!!selectedBusData}
        animationType="slide"
        transparent
        onRequestClose={() => setSelectedBus(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Detalles del Bus</Text>
              <TouchableOpacity onPress={() => setSelectedBus(null)}>
                <Ionicons name="close" size={24} color={COLORS.text} />
              </TouchableOpacity>
            </View>

            {selectedBusData && (
              <View style={styles.busDetails}>
                <View style={styles.detailRow}>
                  <View style={styles.detailItem}>
                    <Ionicons name="navigate-outline" size={24} color={COLORS.primary} />
                    <Text style={styles.detailLabel}>Próxima parada</Text>
                    <Text style={styles.detailValue}>{selectedBusData.nextStop?.name || 'Fin'}</Text>
                  </View>
                  <View style={styles.detailItem}>
                    <Ionicons name="people-outline" size={24} color={COLORS.success} />
                    <Text style={styles.detailLabel}>Ocupación</Text>
                    <Text style={styles.detailValue}>{selectedBusData.occupancy}/{selectedBusData.maxCapacity}</Text>
                  </View>
                </View>

                <View style={styles.occupancyBar}>
                  <View 
                    style={[
                      styles.occupancyFill, 
                      { 
                        width: `${selectedBusData.occupancyPercent}%`,
                        backgroundColor: getOccupancyColor(selectedBusData.occupancyPercent)
                      }
                    ]} 
                  />
                </View>
                <Text style={styles.occupancyLabel}>
                  {selectedBusData.occupancyPercent < 50 
                    ? 'Asientos disponibles' 
                    : selectedBusData.occupancyPercent < 80 
                      ? 'Moderadamente lleno'
                      : 'Casi lleno'}
                </Text>

                <View style={styles.progressInfo}>
                  <Text style={styles.progressText}>
                    Progreso: Parada {selectedBusData.currentStopIndex + 1} de {selectedBusData.totalStops || '?'}
                  </Text>
                  <View style={styles.stopsProgress}>
                    {routeData?.stops.map((_, idx) => (
                      <View 
                        key={idx}
                        style={[
                          styles.stopDot,
                          idx < selectedBusData.currentStopIndex && styles.stopCompleted,
                          idx === selectedBusData.currentStopIndex && styles.stopCurrent,
                        ]}
                      />
                    ))}
                  </View>
                </View>
              </View>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: COLORS.background 
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backButton: {
    padding: SPACING.xs,
    marginRight: SPACING.sm,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    ...TEXT_STYLES.subtitle,
    color: COLORS.text,
    fontWeight: '700',
  },
  headerSubtitle: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
  },
  refreshButton: {
    padding: SPACING.xs,
  },
  mapContainer: {
    flex: 1,
  },
  bottomPanel: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: RADIUS.xl,
    borderTopRightRadius: RADIUS.xl,
    marginTop: -RADIUS.xl,
    paddingTop: SPACING.sm,
    maxHeight: '45%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  panelHeader: {
    alignItems: 'center',
    paddingBottom: SPACING.sm,
  },
  panelHandle: {
    padding: SPACING.sm,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: COLORS.border,
    borderRadius: 2,
  },
  panelTitle: {
    ...TEXT_STYLES.bodySm,
    color: COLORS.text,
    fontWeight: '600',
  },
  busCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.sm,
    backgroundColor: COLORS.background,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  busCardSelected: {
    borderColor: COLORS.primary,
    backgroundColor: `${COLORS.primary}08`,
  },
  busIconContainer: {
    position: 'relative',
    marginRight: SPACING.md,
  },
  busIconBg: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  liveIndicator: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: COLORS.surface,
  },
  busInfo: {
    flex: 1,
  },
  busMainInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  busNextStop: {
    ...TEXT_STYLES.bodySm,
    color: COLORS.text,
    fontWeight: '600',
    flex: 1,
    marginRight: SPACING.sm,
  },
  occupancyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.background,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  occupancyDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  occupancyText: {
    ...TEXT_STYLES.caption,
    fontWeight: '600',
    color: COLORS.text,
  },
  busStats: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  busStat: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
  },
  emptyState: {
    padding: SPACING.xl,
    alignItems: 'center',
    gap: SPACING.md,
  },
  emptyText: {
    ...TEXT_STYLES.bodySm,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  emptySubtext: {
    ...TEXT_STYLES.caption,
    color: COLORS.textTertiary,
    textAlign: 'center',
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: RADIUS.xl,
    borderTopRightRadius: RADIUS.xl,
    paddingBottom: SPACING.xl,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  modalTitle: {
    ...TEXT_STYLES.subtitle,
    fontWeight: '700',
    color: COLORS.text,
  },
  busDetails: {
    padding: SPACING.lg,
  },
  detailRow: {
    flexDirection: 'row',
    gap: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  detailItem: {
    flex: 1,
    alignItems: 'center',
    gap: SPACING.xs,
    backgroundColor: COLORS.background,
    padding: SPACING.md,
    borderRadius: RADIUS.lg,
  },
  detailLabel: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
  },
  detailValue: {
    ...TEXT_STYLES.bodySm,
    fontWeight: '600',
    color: COLORS.text,
  },
  occupancyBar: {
    height: 8,
    backgroundColor: COLORS.border,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: SPACING.xs,
  },
  occupancyFill: {
    height: '100%',
    borderRadius: 4,
  },
  occupancyLabel: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  progressInfo: {
    alignItems: 'center',
    gap: SPACING.sm,
  },
  progressText: {
    ...TEXT_STYLES.bodySm,
    color: COLORS.text,
  },
  stopsProgress: {
    flexDirection: 'row',
    gap: 6,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  stopDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.border,
  },
  stopCompleted: {
    backgroundColor: COLORS.success,
  },
  stopCurrent: {
    backgroundColor: COLORS.primary,
    width: 14,
    height: 14,
    borderRadius: 7,
  },
})
