import React from 'react'
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import { COLORS, SPACING, RADIUS, TEXT_STYLES } from '../../theme'
import { useAuth } from '../../navigation/AuthContext'
import { Card } from '../../components'

export default function DriverProfileScreen() {
  const { signOut, user } = useAuth()
  
  // Nombre del conductor o fallback
  const driverName = user?.name || 'Conductor';

  const stats = [
    { label: 'Viajes Hoy', value: '3', icon: 'calendar-outline' },
    { label: 'Pasajeros', value: '87', icon: 'people-outline' },
    { label: 'Calificación', value: '4.8', icon: 'star-outline' },
    { label: 'Incidentes', value: '0', icon: 'alert-circle-outline' },
  ]

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <LinearGradient colors={[COLORS.primaryDark, COLORS.primary]} style={styles.gradientHeader} start={{x:0,y:0}} end={{x:1,y:1}}>
          <View style={styles.avatarOuter}> 
            <View style={styles.avatarRing}>
              <View style={styles.avatarInner}>
                <Ionicons name="bus-outline" size={46} color={COLORS.textInverse} />
              </View>
            </View>
          </View>
          <Text style={styles.name}>{driverName}</Text>
          <Text style={styles.role}>Conductor de SUBA</Text>
          <View style={styles.headerActions}>
            <TouchableOpacity style={[styles.headerBtn, styles.headerBtnGhost]}>
              <Ionicons name="help-circle-outline" size={16} color={COLORS.textInverse} />
              <Text style={styles.headerBtnText}>Soporte</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>

        <Card style={styles.statsGrid} variant="outlined" padding>
          <Text style={styles.sectionTitle}>Resumen</Text>
          <View style={styles.gridWrap}>
            {stats.map(s => (
              <View style={styles.statCard} key={s.label}>
                <Ionicons name={s.icon as any} size={20} color={COLORS.primary} />
                <Text style={styles.statValueLarge}>{s.value}</Text>
                <Text style={styles.statLabelSmall}>{s.label}</Text>
              </View>
            ))}
          </View>
        </Card>

        <Card style={styles.section} variant="outlined" padding>
          <Text style={styles.sectionTitle}>Detalle de Ruta</Text>
          <View style={styles.row}> 
            <Ionicons name="navigate-outline" size={18} color={COLORS.primary} />
            <Text style={styles.rowText}>Ruta asignada: DRV1</Text>
          </View>
          <View style={styles.row}> 
            <Ionicons name="time-outline" size={18} color={COLORS.primary} />
            <Text style={styles.rowText}>Turno activo: Mañana</Text>
          </View>
          <View style={styles.row}> 
            <Ionicons name="location-outline" size={18} color={COLORS.primary} />
            <Text style={styles.rowText}>Total paradas: 4</Text>
          </View>
        </Card>

        <View style={styles.actionsRow}> 
          <TouchableOpacity style={styles.actionSolid}>
            <Ionicons name="document-text-outline" size={18} color={COLORS.textInverse} />
            <Text style={styles.actionSolidText}>Reportar</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionOutline}>
            <Ionicons name="refresh-outline" size={18} color={COLORS.primary} />
            <Text style={styles.actionOutlineText}>Actualizar</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionOutline} onPress={signOut} accessibilityRole="button">
            <Ionicons name="log-out-outline" size={18} color={COLORS.primary} />
            <Text style={styles.actionOutlineText}>Salir</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { paddingTop: SPACING.lg, paddingHorizontal: SPACING.lg, paddingBottom: SPACING.md, gap: SPACING.lg },
  gradientHeader: { borderRadius: RADIUS.xl, padding: SPACING.xl, alignItems:'center', gap: SPACING.sm },
  avatarOuter: { padding:4, borderRadius: RADIUS.full, backgroundColor: 'rgba(255,255,255,0.15)' },
  avatarRing: { padding:6, borderRadius: RADIUS.full, backgroundColor: 'rgba(255,255,255,0.18)' },
  avatarInner: { width:84, height:84, borderRadius: RADIUS.full, backgroundColor: 'rgba(255,255,255,0.25)', alignItems:'center', justifyContent:'center' },
  name: { ...TEXT_STYLES.subtitle, color: COLORS.textInverse, fontWeight:'700', marginTop: SPACING.xs },
  role: { ...TEXT_STYLES.caption, color: COLORS.textInverse, opacity:0.85 },
  headerActions: { flexDirection:'row', gap: SPACING.sm, marginTop: SPACING.sm },
  headerBtn: { flexDirection:'row', alignItems:'center', gap:4, backgroundColor:'rgba(255,255,255,0.18)', paddingHorizontal: SPACING.md, paddingVertical:6, borderRadius: RADIUS.full },
  headerBtnGhost: { backgroundColor:'rgba(255,255,255,0.10)' },
  headerBtnText: { ...TEXT_STYLES.caption, color: COLORS.textInverse, fontWeight:'600' },
  statsGrid: { gap: SPACING.md },
  gridWrap: { flexDirection:'row', flexWrap:'wrap', justifyContent:'space-between', rowGap: SPACING.md },
  statCard: { width:'48%', backgroundColor: COLORS.surface, borderRadius: RADIUS.lg, padding: SPACING.md, gap:4, shadowColor:'#000', shadowOpacity:0.05, shadowRadius:6, elevation:2 },
  statValueLarge: { ...TEXT_STYLES.subtitle, fontSize:20, color: COLORS.text, fontWeight:'700' },
  statLabelSmall: { ...TEXT_STYLES.caption, color: COLORS.textSecondary },
  section: { gap: SPACING.sm },
  sectionTitle: { ...TEXT_STYLES.bodySm, fontWeight:'700', color: COLORS.text, marginBottom: SPACING.xs },
  row: { flexDirection:'row', alignItems:'center', gap: SPACING.sm },
  rowText: { ...TEXT_STYLES.bodySm, color: COLORS.text },
  actionsRow: { flexDirection:'row', gap: SPACING.sm, justifyContent:'space-between', marginBottom: SPACING.lg },
  actionSolid: { flex:1, flexDirection:'row', alignItems:'center', justifyContent:'center', gap: SPACING.sm, backgroundColor: COLORS.primary, paddingVertical: SPACING.md, borderRadius: RADIUS.md },
  actionSolidText: { ...TEXT_STYLES.bodySm, color: COLORS.textInverse, fontWeight:'700' },
  actionOutline: { flex:1, flexDirection:'row', alignItems:'center', justifyContent:'center', gap: SPACING.sm, borderWidth:1, borderColor: COLORS.border, backgroundColor: COLORS.surface, paddingVertical: SPACING.md, borderRadius: RADIUS.md },
  actionOutlineText: { ...TEXT_STYLES.bodySm, color: COLORS.primary, fontWeight:'700' },
})
