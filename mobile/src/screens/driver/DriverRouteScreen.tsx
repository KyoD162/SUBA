import React, { useMemo, useState, useEffect } from 'react'
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Dimensions } from 'react-native'
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import MapWebView from '../../components/MapWebView'
import { COLORS, SPACING, RADIUS, TEXT_STYLES } from '../../theme'
import { Card } from '../../components'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import type { DriverTabParamList } from '../../navigation/types'

type NavigationProp = NativeStackNavigationProp<DriverTabParamList, 'Trip'>

interface DriverRouteScreenProps {
  navigation: NavigationProp
}

// Mock assigned route (simplified version of user routes data)
const ASSIGNED_ROUTE = {
  id: 'DRV1',
  name: 'Ruta Designada DRV1',
  color: COLORS.primary,
  stops: [
    { id: 's1', lat: 8.2856, lng: -62.7453, name: 'Punto Inicio' },
    { id: 's2', lat: 8.2882, lng: -62.7436, name: 'Av. Central' },
    { id: 's3', lat: 8.2899, lng: -62.7472, name: 'Mercado Local' },
    { id: 's4', lat: 8.2834, lng: -62.7501, name: 'Zona Comercial' },
  ],
  busPositions: [{ id: 'bus1', lat: 8.2874, lng: -62.746, label: 'Bus' }],
}

export default function DriverRouteScreen({ navigation }: DriverRouteScreenProps) {
  const insets = useSafeAreaInsets()
  const [tripStarted, setTripStarted] = useState(false)
  const [startTime, setStartTime] = useState<number | null>(null)
  const [elapsed, setElapsed] = useState(0)
  const [passengers, setPassengers] = useState(0)
  const capacity = 50
  const occupancy = Math.min(passengers / capacity, 1)
  const nextStopIndex = Math.min(passengers % ASSIGNED_ROUTE.stops.length, ASSIGNED_ROUTE.stops.length - 1)
  const nextStop = ASSIGNED_ROUTE.stops[nextStopIndex]

  useEffect(() => {
    if (!startTime) return
    const id = setInterval(() => setElapsed(Date.now() - startTime), 1000)
    return () => clearInterval(id)
  }, [startTime])

  const hh = Math.floor(elapsed / 3600000)
  const mm = Math.floor((elapsed % 3600000) / 60000)
  const ss = Math.floor((elapsed % 60000) / 1000)
  const timeDisplay = tripStarted ? `${hh.toString().padStart(2,'0')}:${mm.toString().padStart(2,'0')}:${ss.toString().padStart(2,'0')}` : '00:00:00'

  const handleStartTrip = () => {
    if (!tripStarted) {
      setTripStarted(true)
      setStartTime(Date.now())
    }
  }

  const polyline = useMemo(() => ASSIGNED_ROUTE.stops.map(s => ({ lat: s.lat, lng: s.lng })), [])
  const screenH = Dimensions.get('window').height
  const panelMin = Math.max(120, Math.floor(screenH * 0.18))

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Map background */}
      <View style={styles.mapContainer}>
        <MapWebView
          height={screenH}
          center={{ lat: 8.2856, lng: -62.7453 }}
          stops={ASSIGNED_ROUTE.stops.map(s => ({ ...s, color: ASSIGNED_ROUTE.color }))}
          buses={ASSIGNED_ROUTE.busPositions.map(b => ({ ...b, color: ASSIGNED_ROUTE.color }))}
          polylines={[{ id: ASSIGNED_ROUTE.id, coords: polyline, color: ASSIGNED_ROUTE.color }]}
        />
      </View>

      {/* Top title overlay */}
      <View style={[styles.topOverlay, { top: insets.top + SPACING.md }]}> 
        <View style={styles.routeHeader}>
          <View style={styles.headerRow}> 
            <View style={styles.titleWrap}>
              <Text style={styles.routeTitle}>{ASSIGNED_ROUTE.name}</Text>
              <Text style={styles.subTitle}>{tripStarted ? `Turno en curso • ${timeDisplay}` : 'Listo para iniciar viaje'}</Text>
            </View>
            {tripStarted && (
              <View style={styles.badgePill}>
                <Ionicons name="time-outline" size={14} color={COLORS.textInverse} />
                <Text style={styles.badgeText}>{hh > 0 ? `${hh}h ${mm}m` : `${mm}m ${ss}s`}</Text>
              </View>
            )}
          </View>
          {!tripStarted ? (
            <TouchableOpacity style={styles.startBtn} onPress={handleStartTrip} accessibilityRole="button">
              <Ionicons name="play-outline" size={18} color={COLORS.textInverse} />
              <Text style={styles.startBtnText}>Iniciar viaje</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.metricsRow}>
              <View style={styles.metricBlock}>
                <Ionicons name="people-outline" size={16} color={COLORS.primary} />
                <Text style={styles.metricLabel}>Ocupación</Text>
                <View style={styles.progressBar}> 
                  <View style={[styles.progressFill,{ width: `${occupancy*100}%` }]} />
                </View>
                <Text style={styles.metricValue}>{passengers}/{capacity}</Text>
              </View>
              <View style={styles.metricDivider} />
              <View style={styles.metricBlock}>
                <Ionicons name="navigate-outline" size={16} color={COLORS.success} />
                <Text style={styles.metricLabel}>Siguiente parada</Text>
                <Text style={styles.nextStop}>{nextStop.name}</Text>
                <Text style={styles.metricValue}>#{nextStopIndex + 1}/{ASSIGNED_ROUTE.stops.length}</Text>
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
              <Text style={styles.panelTitle}>Paradas ({ASSIGNED_ROUTE.stops.length})</Text>
            </View>
            <FlatList
              data={ASSIGNED_ROUTE.stops}
              keyExtractor={s => s.id}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: SPACING.xs }}
              renderItem={({ item }) => (
                <View style={styles.stopRow}> 
                  <Ionicons name="pin" size={14} color={ASSIGNED_ROUTE.color} />
                  <Text style={styles.stopName}>{item.name}</Text>
                </View>
              )}
            />
          </View>

          {/* Actions on the right */}
          <View style={styles.actionsContainer}>
            {/* Big Load Button */}
            <TouchableOpacity 
              style={styles.loadButton} 
              onPress={() => navigation.navigate('CargarPasajero' as any)}
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
                <Ionicons name="chatbubble" size={22} color={COLORS.primary} />
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.iconButton}
                accessibilityRole="button"
                accessibilityLabel="Reportar incidente"
              >
                <Ionicons name="warning" size={22} color={COLORS.danger} />
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.iconButton}
                accessibilityRole="button"
                accessibilityLabel="Edición manual"
              >
                <Ionicons name="pencil" size={22} color={COLORS.textSecondary} />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  mapContainer: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  topOverlay: { position: 'absolute', left: SPACING.lg, right: SPACING.lg, zIndex: 10 },
  routeHeader: { borderRadius: RADIUS.xl, backgroundColor: COLORS.surface, padding: SPACING.lg, gap: SPACING.md, shadowColor:'#000', shadowOpacity:0.08, shadowOffset:{width:0,height:4}, shadowRadius:8, elevation:4 },
  headerRow: { flexDirection:'row', justifyContent:'space-between', alignItems:'flex-start' },
  titleWrap: { flexShrink:1 },
  routeTitle: { ...TEXT_STYLES.subtitle, color: COLORS.text, fontWeight:'700' },
  subTitle: { ...TEXT_STYLES.caption, color: COLORS.textSecondary, marginTop: 2 },
  badgePill: { flexDirection:'row', alignItems:'center', gap:4, backgroundColor: COLORS.primary, paddingHorizontal: SPACING.sm, paddingVertical: 4, borderRadius: RADIUS.full },
  badgeText: { ...TEXT_STYLES.caption, color: COLORS.textInverse, fontWeight:'600' },
  metricsRow: { flexDirection:'row', alignItems:'stretch', gap: SPACING.md },
  metricBlock: { flex:1, backgroundColor: COLORS.surfaceAlt ?? COLORS.background, borderRadius: RADIUS.md, padding: SPACING.sm, gap:4 },
  metricLabel: { ...TEXT_STYLES.caption, color: COLORS.textSecondary, fontWeight:'600' },
  nextStop: { ...TEXT_STYLES.bodySm, color: COLORS.text, fontWeight:'600' },
  metricValue: { ...TEXT_STYLES.caption, color: COLORS.textSecondary },
  metricDivider: { width:1, backgroundColor: COLORS.border, marginVertical:4 },
  progressBar: { height:8, backgroundColor: COLORS.border, borderRadius:4, overflow:'hidden', marginVertical:4 },
  progressFill: { height:'100%', backgroundColor: COLORS.primary },
  startBtn: { flexDirection:'row', alignItems:'center', justifyContent:'center', gap: SPACING.sm, backgroundColor: COLORS.primary, paddingVertical: SPACING.sm, borderRadius: RADIUS.full, marginTop: SPACING.xs },
  startBtnText: { ...TEXT_STYLES.caption, color: COLORS.textInverse, fontWeight:'700' },
  bottomPanel: {
    position: 'absolute', left: 0, right: 0, bottom: 0,
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: RADIUS.xl,
    borderTopRightRadius: RADIUS.xl,
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
    paddingBottom: 0,
    shadowColor: '#000', shadowOffset: { width: 0, height: -3 }, shadowOpacity: 0.06, shadowRadius: 6, elevation: 6,
  },
  bottomCard: { 
    flexDirection: 'row',
    backgroundColor: COLORS.background, 
    borderRadius: RADIUS.lg, 
    padding: SPACING.md, 
    gap: SPACING.md, 
    borderWidth: 1, 
    borderColor: COLORS.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    marginBottom: SPACING.xs,
  },
  stopsContainer: {
    flex: 1,
    gap: SPACING.xs,
  },
  stopsHeader: { 
    paddingBottom: SPACING.xs,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  panelTitle: { 
    ...TEXT_STYLES.subtitle, 
    color: COLORS.text,
    fontWeight: '700',
  },
  stopRow: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: SPACING.xs, 
    paddingVertical: SPACING.xs,
  },
  stopName: { 
    ...TEXT_STYLES.caption, 
    color: COLORS.text,
    fontWeight: '500',
  },
  actionsContainer: {
    width: 100,
    gap: SPACING.sm,
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
    ...TEXT_STYLES.bodySm,
    color: COLORS.textInverse,
    fontWeight: '700',
  },
  iconButtonsRow: {
    flexDirection: 'row',
    gap: SPACING.xs,
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
})
