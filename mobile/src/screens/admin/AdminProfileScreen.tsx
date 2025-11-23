import React from 'react'
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import { COLORS, SPACING, RADIUS, TEXT_STYLES } from '../../theme'
import { useAuth } from '../../navigation/AuthContext'
import { Card } from '../../components'

export default function AdminProfileScreen() {
  const { signOut } = useAuth()

  const stats = [
    { label: 'Usuarios', value: '12.5k', icon: 'people-outline' },
    { label: 'Rutas', value: '24', icon: 'navigate-outline' },
    { label: 'Conductores', value: '48', icon: 'bus-outline' },
    { label: 'Reportes', value: '5', icon: 'alert-circle-outline' },
  ]

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <LinearGradient colors={[COLORS.primaryDark, COLORS.primary]} style={styles.gradientHeader} start={{x:0,y:0}} end={{x:1,y:1}}>
          <View style={styles.avatarOuter}> 
            <View style={styles.avatarRing}>
              <View style={styles.avatarInner}>
                <MaterialCommunityIcons name="account-tie-outline" size={48} color={COLORS.textInverse} />
              </View>
            </View>
          </View>
          <Text style={styles.name}>Administrador</Text>
          <Text style={styles.role}>Rol • Admin</Text>
        </LinearGradient>

        <Card style={styles.statsGrid} variant="outlined" padding>
          <Text style={styles.sectionTitle}>Resumen del Sistema</Text>
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

        <View style={styles.actionsRow}> 
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
