import React, { useMemo, useState, useEffect, useRef } from 'react'
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Dimensions, Alert, Modal, ActivityIndicator } from 'react-native'
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import MapWebView, { MapWebViewRef } from '../../components/MapWebView'
import { COLORS, SPACING, RADIUS, TEXT_STYLES } from '../../theme'
import { useTrip, formatElapsedTime, formatDistance } from '../../navigation/TripContext'
import { getRoutes, RouteData } from '../../services/trip'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import type { DriverTabParamList } from '../../navigation/types'

// Google Maps API Key - should be in env variable
const GOOGLE_MAPS_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY || ''

type NavigationProp = NativeStackNavigationProp<DriverTabParamList, 'Trip'>

interface DriverRouteScreenProps {
  navigation: NavigationProp
}

export default function DriverRouteScreen({ navigation }: DriverRouteScreenProps) {
  const insets = useSafeAreaInsets()
  const mapRef = useRef<MapWebViewRef>(null)
  
  // Trip context
  const {
    activeTrip,
    isLoading,
    error,
    elapsedTime,
    currentLocation,
    isTracking,
    distanceToNextStop,
    startTrip,
    endTrip,
    loadPassengers: contextLoadPassengers,
  } = useTrip()

  // Local state
  const [routes, setRoutes] = useState<RouteData[]>([])
  const [selectedRoute, setSelectedRoute] = useState<RouteData | null>(null)
  const [showRouteSelector, setShowRouteSelector] = useState(false)
  const [showEndTripModal, setShowEndTripModal] = useState(false)
  const [tripSummary, setTripSummary] = useState<any>(null)

  const capacity = activeTrip?.maxCapacity || 50
  const passengers = activeTrip?.currentOccupancy || 0
  const occupancy = Math.min(passengers / capacity, 1)

  // Fetch available routes
  useEffect(() => {
    const fetchRoutes = async () => {
      try {
        const routesData = await getRoutes()
        setRoutes(routesData)
        if (routesData.length > 0 && !selectedRoute) {
          setSelectedRoute(routesData[0])
        }
      } catch (err) {
        console.error('Error fetching routes:', err)
        // Use fallback routes for development
        const fallbackRoutes: RouteData[] = [
          {
            routeId: 'A1',
            name: 'Ruta A1 - Unare Centro',
            description: 'Ruta principal',
            color: COLORS.primary,
            priceUSD: 0.5,
            frequency: '5-10 min',
            estimatedDuration: 25,
            distance: 8.5,
            isActive: true,
            stops: [
              { id: 'a1-1', name: 'Terminal Unare', lat: 8.3005, lng: -62.7343, order: 0 },
              { id: 'a1-2', name: 'Av. Principal', lat: 8.2950, lng: -62.7380, order: 1 },
              { id: 'a1-3', name: 'Plaza Alta Vista', lat: 8.2869, lng: -62.7442, order: 2 },
              { id: 'a1-4', name: 'CC Villa Asia', lat: 8.2830, lng: -62.7301, order: 3 },
              { id: 'a1-5', name: 'Parque Castillito', lat: 8.2880, lng: -62.7195, order: 4 },
              { id: 'a1-6', name: 'La Ceiba', lat: 8.2920, lng: -62.7100, order: 5 },
            ],
          },
        ]
        setRoutes(fallbackRoutes)
        setSelectedRoute(fallbackRoutes[0])
      }
    }
    fetchRoutes()
  }, [])

  // Use active trip route if available
  useEffect(() => {
    if (activeTrip && routes.length > 0) {
      const tripRoute = routes.find(r => r.routeId === activeTrip.routeId)
      if (tripRoute) {
        setSelectedRoute(tripRoute)
      }
    }
  }, [activeTrip, routes])

  // Update map when location changes
  useEffect(() => {
    if (currentLocation && activeTrip && mapRef.current) {
      mapRef.current.updateBusPosition(
        activeTrip.id,
        currentLocation.latitude,
        currentLocation.longitude,
        currentLocation.heading || 0
      )
    }
  }, [currentLocation, activeTrip])

  // Update next stop highlight
  useEffect(() => {
    if (activeTrip?.nextStopId && mapRef.current) {
      mapRef.current.highlightNextStop(activeTrip.nextStopId)
    }
  }, [activeTrip?.nextStopId])

  const currentRoute = activeTrip 
    ? { 
        routeId: activeTrip.routeId, 
        name: activeTrip.routeName, 
        color: selectedRoute?.color || COLORS.primary,
        stops: activeTrip.stops.map(s => ({ id: s.stopId, name: s.name, lat: s.lat, lng: s.lng, order: 0 }))
      }
    : selectedRoute

  const nextStop = activeTrip?.stops.find(s => s.stopId === activeTrip.nextStopId)
  const currentStopIndex = activeTrip?.currentStopIndex || 0
  const totalStops = currentRoute?.stops.length || 0

  const handleStartTrip = async () => {
    if (!selectedRoute) {
      Alert.alert('Error', 'Selecciona una ruta primero')
      return
    }
    
    const success = await startTrip(selectedRoute.routeId)
    if (!success) {
      Alert.alert('Error', error || 'No se pudo iniciar el viaje. Verifica tu conexión.')
    }
  }

  const handleEndTrip = async () => {
    Alert.alert(
      'Finalizar Viaje',
      '¿Estás seguro de que deseas finalizar el viaje?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Finalizar',
          style: 'destructive',
          onPress: async () => {
            const summary = await endTrip()
            if (summary) {
              setTripSummary(summary)
              setShowEndTripModal(true)
            } else {
              Alert.alert('Error', error || 'No se pudo finalizar el viaje')
            }
          },
        },
      ]
    )
  }

  const handleLoadPassenger = () => {
    navigation.navigate('CargarPasajero' as any)
  }

  const closeSummaryModal = () => {
    setShowEndTripModal(false)
    setTripSummary(null)
  }

  const mapStops = useMemo(() => {
    if (!currentRoute?.stops) return []
    return currentRoute.stops.map(s => ({
      id: s.id,
      lat: s.lat,
      lng: s.lng,
      name: s.name,
      color: currentRoute.color || COLORS.primary,
    }))
  }, [currentRoute])

  const mapBuses = useMemo(() => {
    if (!activeTrip || !currentLocation) return []
    return [{
      id: activeTrip.id,
      lat: currentLocation.latitude,
      lng: currentLocation.longitude,
      color: currentRoute?.color || COLORS.primary,
      label: 'Tu Bus',
      heading: currentLocation.heading || 0,
    }]
  }, [activeTrip, currentLocation, currentRoute])

  const polyline = useMemo(() => {
    if (!currentRoute?.stops) return []
    return currentRoute.stops.map(s => ({ lat: s.lat, lng: s.lng }))
  }, [currentRoute])

  const screenH = Dimensions.get('window').height
  const panelMin = Math.max(140, Math.floor(screenH * 0.22))

  const timeDisplay = formatElapsedTime(elapsedTime)

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Map background */}
      <View style={styles.mapContainer}>
        <MapWebView
          ref={mapRef}
          height={screenH}
          center={currentRoute?.stops?.[0] ? { lat: currentRoute.stops[0].lat, lng: currentRoute.stops[0].lng } : { lat: 8.2856, lng: -62.7453 }}
          stops={mapStops}
          buses={mapBuses}
          polylines={polyline.length > 0 ? [{ id: currentRoute?.routeId || 'route', coords: polyline, color: currentRoute?.color || COLORS.primary }] : []}
          user={currentLocation ? { lat: currentLocation.latitude, lng: currentLocation.longitude } : undefined}
          googleApiKey={GOOGLE_MAPS_API_KEY}
          driverMode={!!activeTrip}
          nextStopId={activeTrip?.nextStopId}
          showDirections
        />
      </View>

      {/* Top title overlay */}
      <View style={[styles.topOverlay, { top: insets.top + SPACING.md }]}> 
        <View style={styles.routeHeader}>
          <View style={styles.headerRow}> 
            <View style={styles.titleWrap}>
              <TouchableOpacity 
                style={styles.routeSelector}
                onPress={() => !activeTrip && setShowRouteSelector(true)}
                disabled={!!activeTrip}
              >
                <Text style={styles.routeTitle}>{currentRoute?.name || 'Seleccionar ruta'}</Text>
                {!activeTrip && <Ionicons name="chevron-down" size={18} color={COLORS.textSecondary} />}
              </TouchableOpacity>
              <Text style={styles.subTitle}>
                {activeTrip ? `Turno en curso • ${timeDisplay}` : 'Listo para iniciar viaje'}
              </Text>
            </View>
            {activeTrip && (
              <View style={[styles.badgePill, !isTracking && styles.badgeWarning]}>
                <Ionicons name={isTracking ? "radio" : "warning"} size={14} color={COLORS.textInverse} />
                <Text style={styles.badgeText}>{isTracking ? 'En vivo' : 'Sin GPS'}</Text>
              </View>
            )}
          </View>

          {!activeTrip ? (
            <TouchableOpacity 
              style={[styles.startBtn, isLoading && styles.btnDisabled]} 
              onPress={handleStartTrip} 
              disabled={isLoading}
              accessibilityRole="button"
            >
              {isLoading ? (
                <ActivityIndicator size="small" color={COLORS.textInverse} />
              ) : (
                <>
                  <Ionicons name="play-outline" size={18} color={COLORS.textInverse} />
                  <Text style={styles.startBtnText}>Iniciar viaje</Text>
                </>
              )}
            </TouchableOpacity>
          ) : (
            <View style={styles.metricsRow}>
              <View style={styles.metricBlock}>
                <Ionicons name="people-outline" size={16} color={COLORS.primary} />
                <Text style={styles.metricLabel}>Ocupación</Text>
                <View style={styles.progressBar}> 
                  <View style={[styles.progressFill, { width: `${occupancy * 100}%` }]} />
                </View>
                <Text style={styles.metricValue}>{passengers}/{capacity}</Text>
              </View>
              <View style={styles.metricDivider} />
              <View style={styles.metricBlock}>
                <Ionicons name="navigate-outline" size={16} color={COLORS.success} />
                <Text style={styles.metricLabel}>Siguiente parada</Text>
                <Text style={styles.nextStop} numberOfLines={1}>{nextStop?.name || 'Fin de ruta'}</Text>
                <Text style={styles.metricValue}>
                  {distanceToNextStop ? formatDistance(distanceToNextStop) : '--'} • #{currentStopIndex + 1}/{totalStops}
                </Text>
              </View>
            </View>
          )}
        </View>
      </View>

      {/* Bottom panel */}
      <View style={[styles.bottomPanel, { paddingBottom: Math.max(insets.bottom, 4), minHeight: panelMin }]}> 
        <View style={styles.bottomCard}>
          {/* Stops list on the left */}
          <View style={styles.stopsContainer}>
            <View style={styles.stopsHeader}> 
              <Text style={styles.panelTitle}>Paradas ({totalStops})</Text>
            </View>
            <FlatList
              data={currentRoute?.stops || []}
              keyExtractor={s => s.id}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: SPACING.xs }}
              renderItem={({ item, index }) => {
                const isCompleted = activeTrip && index < currentStopIndex
                const isCurrent = activeTrip && item.id === activeTrip.nextStopId
                
                return (
                  <View style={[styles.stopRow, isCurrent && styles.stopRowActive]}> 
                    <View style={[
                      styles.stopIndicator,
                      isCompleted && styles.stopCompleted,
                      isCurrent && styles.stopCurrent,
                    ]}>
                      {isCompleted ? (
                        <Ionicons name="checkmark" size={12} color={COLORS.textInverse} />
                      ) : (
                        <Text style={[styles.stopNumber, isCurrent && styles.stopNumberActive]}>{index + 1}</Text>
                      )}
                    </View>
                    <Text style={[styles.stopName, isCompleted && styles.stopNameCompleted]} numberOfLines={1}>
                      {item.name}
                    </Text>
                  </View>
                )
              }}
            />
          </View>

          {/* Actions on the right */}
          <View style={styles.actionsContainer}>
            {activeTrip ? (
              <>
                {/* Big Load Button */}
                <TouchableOpacity 
                  style={styles.loadButton} 
                  onPress={handleLoadPassenger}
                  accessibilityRole="button"
                >
                  <Ionicons name="person-add" size={24} color={COLORS.textInverse} />
                  <Text style={styles.loadButtonText}>Cargar</Text>
                </TouchableOpacity>

                {/* Small icon buttons */}
                <View style={styles.iconButtonsRow}>
                  <TouchableOpacity 
                    style={styles.iconButton}
                    accessibilityRole="button"
                    accessibilityLabel="Mensaje"
                  >
                    <Ionicons name="chatbubble" size={18} color={COLORS.primary} />
                  </TouchableOpacity>

                  <TouchableOpacity 
                    style={styles.iconButton}
                    accessibilityRole="button"
                    accessibilityLabel="Reportar incidente"
                  >
                    <Ionicons name="warning" size={18} color={COLORS.warning} />
                  </TouchableOpacity>

                  <TouchableOpacity 
                    style={[styles.iconButton, styles.endTripButton]}
                    onPress={handleEndTrip}
                    accessibilityRole="button"
                    accessibilityLabel="Finalizar viaje"
                  >
                    <Ionicons name="stop-circle" size={18} color={COLORS.danger} />
                  </TouchableOpacity>
                </View>
              </>
            ) : (
              <View style={styles.idleActions}>
                <Ionicons name="bus-outline" size={32} color={COLORS.textTertiary} />
                <Text style={styles.idleText}>Inicia tu viaje para comenzar</Text>
              </View>
            )}
          </View>
        </View>
      </View>

      {/* Route Selector Modal */}
      <Modal
        visible={showRouteSelector}
        animationType="slide"
        transparent
        onRequestClose={() => setShowRouteSelector(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Seleccionar Ruta</Text>
              <TouchableOpacity onPress={() => setShowRouteSelector(false)}>
                <Ionicons name="close" size={24} color={COLORS.text} />
              </TouchableOpacity>
            </View>
            <FlatList
              data={routes}
              keyExtractor={r => r.routeId}
              ListEmptyComponent={
                <View style={styles.emptyList}>
                  <ActivityIndicator size="large" color={COLORS.primary} />
                  <Text style={styles.emptyText}>Cargando rutas...</Text>
                </View>
              }
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.routeItem,
                    selectedRoute?.routeId === item.routeId && styles.routeItemSelected
                  ]}
                  onPress={() => {
                    setSelectedRoute(item)
                    setShowRouteSelector(false)
                  }}
                >
                  <View style={[styles.routeColor, { backgroundColor: item.color }]} />
                  <View style={styles.routeItemInfo}>
                    <Text style={styles.routeItemName}>{item.name}</Text>
                    <Text style={styles.routeItemMeta}>
                      {item.stops.length} paradas • {item.frequency}
                    </Text>
                  </View>
                  {selectedRoute?.routeId === item.routeId && (
                    <Ionicons name="checkmark-circle" size={24} color={COLORS.primary} />
                  )}
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>

      {/* Trip Summary Modal */}
      <Modal
        visible={showEndTripModal}
        animationType="fade"
        transparent
        onRequestClose={closeSummaryModal}
      >
        <View style={styles.summaryOverlay}>
          <View style={styles.summaryModal}>
            <View style={styles.summaryIcon}>
              <Ionicons name="checkmark-circle" size={64} color={COLORS.success} />
            </View>
            <Text style={styles.summaryTitle}>¡Viaje Completado!</Text>
            
            {tripSummary && (
              <>
                <View style={styles.summaryStats}>
                  <View style={styles.summaryStat}>
                    <Ionicons name="time-outline" size={24} color={COLORS.primary} />
                    <Text style={styles.summaryStatValue}>{tripSummary.durationFormatted}</Text>
                    <Text style={styles.summaryStatLabel}>Duración</Text>
                  </View>
                  <View style={styles.summaryStat}>
                    <Ionicons name="flag-outline" size={24} color={COLORS.success} />
                    <Text style={styles.summaryStatValue}>{tripSummary.stopsCompleted}/{tripSummary.totalStops}</Text>
                    <Text style={styles.summaryStatLabel}>Paradas</Text>
                  </View>
                  <View style={styles.summaryStat}>
                    <Ionicons name="people-outline" size={24} color={COLORS.warning} />
                    <Text style={styles.summaryStatValue}>{tripSummary.totalPassengersLoaded}</Text>
                    <Text style={styles.summaryStatLabel}>Pasajeros</Text>
                  </View>
                </View>

                <View style={styles.summaryExtra}>
                  <View style={styles.summaryExtraRow}>
                    <Text style={styles.summaryExtraLabel}>Distancia recorrida</Text>
                    <Text style={styles.summaryExtraValue}>{formatDistance(tripSummary.distanceTraveled)}</Text>
                  </View>
                  {tripSummary.averageSpeed && (
                    <View style={styles.summaryExtraRow}>
                      <Text style={styles.summaryExtraLabel}>Velocidad promedio</Text>
                      <Text style={styles.summaryExtraValue}>{tripSummary.averageSpeed} km/h</Text>
                    </View>
                  )}
                </View>
              </>
            )}

            <TouchableOpacity style={styles.summaryButton} onPress={closeSummaryModal}>
              <Text style={styles.summaryButtonText}>Cerrar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  mapContainer: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  topOverlay: { position: 'absolute', left: SPACING.lg, right: SPACING.lg, zIndex: 10 },
  routeHeader: { 
    borderRadius: RADIUS.xl, 
    backgroundColor: COLORS.surface, 
    padding: SPACING.lg, 
    gap: SPACING.md, 
    shadowColor: '#000', 
    shadowOpacity: 0.1, 
    shadowOffset: { width: 0, height: 4 }, 
    shadowRadius: 12, 
    elevation: 6 
  },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  titleWrap: { flexShrink: 1, flex: 1 },
  routeSelector: { flexDirection: 'row', alignItems: 'center', gap: SPACING.xs },
  routeTitle: { ...TEXT_STYLES.subtitle, color: COLORS.text, fontWeight: '700' },
  subTitle: { ...TEXT_STYLES.caption, color: COLORS.textSecondary, marginTop: 2 },
  badgePill: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 4, 
    backgroundColor: COLORS.success, 
    paddingHorizontal: SPACING.sm, 
    paddingVertical: 4, 
    borderRadius: RADIUS.full 
  },
  badgeWarning: {
    backgroundColor: COLORS.warning,
  },
  badgeText: { ...TEXT_STYLES.caption, color: COLORS.textInverse, fontWeight: '600' },
  metricsRow: { flexDirection: 'row', alignItems: 'stretch', gap: SPACING.md },
  metricBlock: { flex: 1, backgroundColor: COLORS.background, borderRadius: RADIUS.md, padding: SPACING.sm, gap: 4 },
  metricLabel: { ...TEXT_STYLES.caption, color: COLORS.textSecondary, fontWeight: '600' },
  nextStop: { ...TEXT_STYLES.bodySm, color: COLORS.text, fontWeight: '600' },
  metricValue: { ...TEXT_STYLES.caption, color: COLORS.textSecondary },
  metricDivider: { width: 1, backgroundColor: COLORS.border, marginVertical: 4 },
  progressBar: { height: 8, backgroundColor: COLORS.border, borderRadius: 4, overflow: 'hidden', marginVertical: 4 },
  progressFill: { height: '100%', backgroundColor: COLORS.primary },
  startBtn: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center', 
    gap: SPACING.sm, 
    backgroundColor: COLORS.primary, 
    paddingVertical: SPACING.md, 
    borderRadius: RADIUS.full, 
    marginTop: SPACING.xs 
  },
  startBtnText: { ...TEXT_STYLES.bodySm, color: COLORS.textInverse, fontWeight: '700' },
  btnDisabled: { opacity: 0.7 },
  bottomPanel: {
    position: 'absolute', left: 0, right: 0, bottom: 0,
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: RADIUS.xl,
    borderTopRightRadius: RADIUS.xl,
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
    paddingBottom: 0,
    shadowColor: '#000', shadowOffset: { width: 0, height: -4 }, shadowOpacity: 0.1, shadowRadius: 12, elevation: 8,
  },
  bottomCard: { 
    flexDirection: 'row',
    backgroundColor: COLORS.background, 
    borderRadius: RADIUS.lg, 
    padding: SPACING.md, 
    gap: SPACING.md, 
    borderWidth: 1, 
    borderColor: COLORS.border,
    marginBottom: SPACING.xs,
  },
  stopsContainer: {
    flex: 1,
    gap: SPACING.xs,
    maxHeight: 150,
  },
  stopsHeader: { 
    paddingBottom: SPACING.xs,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  panelTitle: { 
    ...TEXT_STYLES.bodySm, 
    color: COLORS.text,
    fontWeight: '700',
  },
  stopRow: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: SPACING.sm, 
    paddingVertical: 6,
    paddingHorizontal: SPACING.xs,
    borderRadius: RADIUS.sm,
  },
  stopRowActive: {
    backgroundColor: `${COLORS.success}15`,
  },
  stopIndicator: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stopCompleted: {
    backgroundColor: COLORS.success,
  },
  stopCurrent: {
    backgroundColor: COLORS.primary,
  },
  stopNumber: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
    fontWeight: '600',
    fontSize: 10,
  },
  stopNumberActive: {
    color: COLORS.textInverse,
  },
  stopName: { 
    ...TEXT_STYLES.caption, 
    color: COLORS.text,
    fontWeight: '500',
    flex: 1,
  },
  stopNameCompleted: {
    color: COLORS.textSecondary,
    textDecorationLine: 'line-through',
  },
  actionsContainer: {
    width: 100,
    gap: SPACING.sm,
    justifyContent: 'center',
  },
  loadButton: {
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.lg,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.sm,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  loadButtonText: {
    ...TEXT_STYLES.caption,
    color: COLORS.textInverse,
    fontWeight: '700',
  },
  iconButtonsRow: {
    flexDirection: 'row',
    gap: 4,
    justifyContent: 'space-between',
  },
  iconButton: {
    flex: 1,
    aspectRatio: 1,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  endTripButton: {
    borderColor: COLORS.danger,
  },
  idleActions: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  idleText: {
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
    maxHeight: '70%',
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
  emptyList: {
    padding: SPACING.xl,
    alignItems: 'center',
    gap: SPACING.md,
  },
  emptyText: {
    ...TEXT_STYLES.bodySm,
    color: COLORS.textSecondary,
  },
  routeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.lg,
    gap: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  routeItemSelected: {
    backgroundColor: `${COLORS.primary}10`,
  },
  routeColor: {
    width: 8,
    height: 40,
    borderRadius: 4,
  },
  routeItemInfo: {
    flex: 1,
  },
  routeItemName: {
    ...TEXT_STYLES.bodySm,
    fontWeight: '600',
    color: COLORS.text,
  },
  routeItemMeta: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
  },
  // Summary Modal styles
  summaryOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.lg,
  },
  summaryModal: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.xl,
    padding: SPACING.xl,
    alignItems: 'center',
    width: '100%',
    maxWidth: 360,
  },
  summaryIcon: {
    marginBottom: SPACING.md,
  },
  summaryTitle: {
    ...TEXT_STYLES.h2,
    color: COLORS.text,
    marginBottom: SPACING.lg,
  },
  summaryStats: {
    flexDirection: 'row',
    gap: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  summaryStat: {
    alignItems: 'center',
    gap: SPACING.xs,
  },
  summaryStatValue: {
    ...TEXT_STYLES.subtitle,
    fontWeight: '700',
    color: COLORS.text,
  },
  summaryStatLabel: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
  },
  summaryExtra: {
    width: '100%',
    backgroundColor: COLORS.background,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    gap: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  summaryExtraRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  summaryExtraLabel: {
    ...TEXT_STYLES.bodySm,
    color: COLORS.textSecondary,
  },
  summaryExtraValue: {
    ...TEXT_STYLES.bodySm,
    fontWeight: '600',
    color: COLORS.text,
  },
  summaryButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.full,
    minWidth: 120,
    alignItems: 'center',
  },
  summaryButtonText: {
    ...TEXT_STYLES.bodySm,
    color: COLORS.textInverse,
    fontWeight: '700',
  },
})
