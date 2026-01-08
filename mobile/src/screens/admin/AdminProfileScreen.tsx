import React from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { COLORS, SPACING, RADIUS, TEXT_STYLES } from '../../theme'
import { useAuth } from '../../navigation/AuthContext'
import { Card } from '../../components'

export default function AdminProfileScreen() {
  const { signOut, user } = useAuth()
  
  // Nombre del administrador o fallback
  const adminName = user?.name || user?.email?.split('@')[0] || 'Administrador';

  return (
    <SafeAreaView style={styles.container} edges={['top','bottom']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Card style={styles.headerCard} variant="outlined" padding>
          <View style={styles.avatar}>
            <Ionicons name="stats-chart-outline" size={42} color={COLORS.textInverse} />
          </View>
          <Text style={styles.name}>{adminName}</Text>
          <Text style={styles.role}>Administrador de SUBA</Text>
        </Card>
        <Card style={styles.section} variant="outlined" padding>
          <Text style={styles.sectionTitle}>Resumen</Text>
          <View style={styles.row}> 
            <Ionicons name="people-outline" size={18} color={COLORS.primary} />
            <Text style={styles.rowText}>Usuarios activos: 12,345</Text>
          </View>
          <View style={styles.row}> 
            <Ionicons name="navigate-outline" size={18} color={COLORS.primary} />
            <Text style={styles.rowText}>Rutas activas: 24</Text>
          </View>
          <View style={styles.row}> 
            <Ionicons name="bus-outline" size={18} color={COLORS.primary} />
            <Text style={styles.rowText}>Conductores: 48</Text>
          </View>
        </Card>
        <TouchableOpacity style={styles.logoutButton} onPress={signOut} accessibilityRole="button">
          <Ionicons name="log-out-outline" size={20} color={COLORS.textInverse} />
          <Text style={styles.logoutText}>Cerrar sesión</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: SPACING.lg, gap: SPACING.lg },
  headerCard: { alignItems: 'center', gap: SPACING.sm },
  avatar: {
    width: 80, height: 80, borderRadius: RADIUS.full, backgroundColor: COLORS.primary,
    alignItems: 'center', justifyContent: 'center', marginBottom: SPACING.sm,
  },
  name: { ...TEXT_STYLES.subtitle, color: COLORS.text, fontWeight: '700' },
  role: { ...TEXT_STYLES.caption, color: COLORS.textSecondary },
  section: { gap: SPACING.sm },
  sectionTitle: { ...TEXT_STYLES.bodySm, fontWeight: '700', color: COLORS.text, marginBottom: SPACING.xs },
  row: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  rowText: { ...TEXT_STYLES.bodySm, color: COLORS.text },
  logoutButton: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: SPACING.sm,
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.md,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 4,
  },
  logoutText: { ...TEXT_STYLES.bodySm, color: COLORS.textInverse, fontWeight: '700' },
})
