import React, { useMemo, useState, useEffect } from 'react'
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Dimensions } from 'react-native'
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import MapWebView from '../../components/MapWebView'
import { COLORS, SPACING, RADIUS, TEXT_STYLES } from '../../theme'
import { Card } from '../../components'

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

export default function DriverRouteScreen() {
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
          <View style={styles.bottomCardHeader}> 
            <Text style={styles.panelTitle}>Paradas ({ASSIGNED_ROUTE.stops.length})</Text>
          </View>
          <View style={styles.bottomActionsRow}>
            <TouchableOpacity style={styles.bottomActionBtn} onPress={() => setPassengers(p=>p+1)} accessibilityRole="button">
              <Ionicons name="add-outline" size={18} color={COLORS.textInverse} />
              <Text style={styles.bottomActionText}>Cargar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.bottomActionBtn, styles.bottomActionSecondary]} accessibilityRole="button">
              <Ionicons name="alert-circle-outline" size={18} color={COLORS.primary} />
              <Text style={[styles.bottomActionText, styles.bottomActionSecondaryText]}>Incidente</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.bottomActionBtn, styles.bottomActionSecondary]} accessibilityRole="button">
              <Ionicons name="chatbubble-ellipses-outline" size={18} color={COLORS.primary} />
              <Text style={[styles.bottomActionText, styles.bottomActionSecondaryText]}>Mensaje</Text>
            </TouchableOpacity>
          </View>
        </View>
        <FlatList
          data={ASSIGNED_ROUTE.stops}
          keyExtractor={s => s.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: SPACING.sm }}
          renderItem={({ item }) => (
            <View style={styles.stopRow}> 
              <Ionicons name="pin" size={16} color={ASSIGNED_ROUTE.color} />
              <Text style={styles.stopName}>{item.name}</Text>
            </View>
          )}
        />
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
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.sm,
    gap: SPACING.sm,
    shadowColor: '#000', shadowOffset: { width: 0, height: -3 }, shadowOpacity: 0.06, shadowRadius: 6, elevation: 6,
  },
  bottomCard: { backgroundColor: COLORS.background, borderRadius: RADIUS.lg, padding: SPACING.sm, gap: SPACING.sm, borderWidth:1, borderColor: COLORS.border },
  bottomCardHeader: { flexDirection:'row', justifyContent:'space-between', alignItems:'center' },
  panelTitle: { ...TEXT_STYLES.subtitle, color: COLORS.text },
  bottomActionsRow: { flexDirection:'row', gap: SPACING.xs, justifyContent:'space-between' },
  bottomActionBtn: { flex:1, flexDirection:'row', alignItems:'center', justifyContent:'center', gap: SPACING.xs, backgroundColor: COLORS.primary, paddingVertical: 6, borderRadius: RADIUS.full },
  bottomActionText: { ...TEXT_STYLES.caption, color: COLORS.textInverse, fontWeight:'600' },
  bottomActionSecondary: { backgroundColor: COLORS.surface, borderWidth:1, borderColor: COLORS.border },
  bottomActionSecondaryText: { color: COLORS.primary },
  stopRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, paddingVertical: SPACING.xs },
  stopName: { ...TEXT_STYLES.bodySm, color: COLORS.text },
})
