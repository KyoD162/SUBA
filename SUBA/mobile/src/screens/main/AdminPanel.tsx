import React from "react"
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native"
import { COLORS, SPACING, TEXT_STYLES, RADIUS } from "../../theme"
import { scale, verticalScale } from "../../utils/responsive"
import { Card } from "../../components/Card"
import { Button } from "../../components/Button"
import { StatCard } from "../../components/StatCard"

// Secciones administrativas placeholder. En el futuro cada una puede moverse a su propio archivo.

interface SectionProps {
  onCreate?: () => void
}

const ManageRoutesSection: React.FC<SectionProps> = ({ onCreate }) => {
  // Datos de ejemplo
  const routes = [
    { id: "R-1", nombre: "Ruta Centro", origen: "Terminal", destino: "Centro" },
    { id: "R-2", nombre: "Ruta Aeropuerto", origen: "Centro", destino: "Aeropuerto" },
  ]
  return (
    <Card style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Gestionar Rutas</Text>
        <Button title="Nueva Ruta" size="sm" onPress={onCreate} />
      </View>
      {routes.map(r => (
        <View key={r.id} style={styles.row}>
          <Text style={styles.rowPrimary}>{r.nombre}</Text>
          <Text style={styles.rowSecondary}>
            {r.origen} → {r.destino}
          </Text>
          <Button title="Editar" variant="outline" size="sm" />
        </View>
      ))}
    </Card>
  )
}

const ManageDriversSection: React.FC<SectionProps> = ({ onCreate }) => {
  const drivers = [
    { id: "C-1", nombre: "Juan Pérez", licencia: "ABC123" },
    { id: "C-2", nombre: "María López", licencia: "XYZ789" },
  ]
  return (
    <Card style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Gestionar Conductores</Text>
        <Button title="Nuevo" size="sm" onPress={onCreate} />
      </View>
      {drivers.map(d => (
        <View key={d.id} style={styles.row}>
          <Text style={styles.rowPrimary}>{d.nombre}</Text>
          <Text style={styles.rowSecondary}>Licencia: {d.licencia}</Text>
          <Button title="Editar" variant="outline" size="sm" />
        </View>
      ))}
    </Card>
  )
}

const ManageUsersSection: React.FC<SectionProps> = ({ onCreate }) => {
  const users = [
    { id: "U-1", nombre: "Cliente 1", rol: "usuario" },
    { id: "U-2", nombre: "Admin", rol: "admin" },
  ]
  return (
    <Card style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Gestionar Usuarios</Text>
        <Button title="Crear" size="sm" onPress={onCreate} />
      </View>
      {users.map(u => (
        <View key={u.id} style={styles.row}>
          <Text style={styles.rowPrimary}>{u.nombre}</Text>
          <Text style={styles.rowSecondary}>Rol: {u.rol}</Text>
          <Button title="Editar" variant="outline" size="sm" />
        </View>
      ))}
    </Card>
  )
}

const ManagePricesSection: React.FC<SectionProps> = ({ onCreate }) => {
  const prices = [
    { id: "P-1", ruta: "Ruta Centro", monto: 1.5 },
    { id: "P-2", ruta: "Ruta Aeropuerto", monto: 3.75 },
  ]
  return (
    <Card style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Gestionar Precios</Text>
        <Button title="Nuevo Precio" size="sm" onPress={onCreate} />
      </View>
      {prices.map(p => (
        <View key={p.id} style={styles.row}>
          <Text style={styles.rowPrimary}>{p.ruta}</Text>
          <Text style={styles.rowSecondary}>$ {p.monto.toFixed(2)}</Text>
          <Button title="Editar" variant="outline" size="sm" />
        </View>
      ))}
    </Card>
  )
}

const OverviewSection: React.FC = () => {
  // Métricas de ejemplo
  const stats = [
    { icon: "bus-outline" as const, label: "Rutas", value: 18 },
    { icon: "person-outline" as const, label: "Conductores", value: 42 },
    { icon: "people-outline" as const, label: "Usuarios", value: 1250 },
    { icon: "pricetag-outline" as const, label: "Precios activos", value: 27 },
  ]
  return (
    <View style={styles.statsGrid}>
      {stats.map(s => (
        <StatCard key={s.label} icon={s.icon} label={s.label} value={String(s.value)} style={styles.statCard} />
      ))}
    </View>
  )
}

// Tabs locales
const TABS = [
  { key: "overview", label: "Overview" },
  { key: "routes", label: "Rutas" },
  { key: "drivers", label: "Conductores" },
  { key: "users", label: "Usuarios" },
  { key: "prices", label: "Precios" },
] as const

type TabKey = typeof TABS[number]["key"]

const AdminPanel: React.FC = () => {
  const [tab, setTab] = React.useState<TabKey>("overview")

  const renderContent = () => {
    switch (tab) {
      case "overview":
        return <OverviewSection />
      case "routes":
        return <ManageRoutesSection />
      case "drivers":
        return <ManageDriversSection />
      case "users":
        return <ManageUsersSection />
      case "prices":
        return <ManagePricesSection />
      default:
        return null
    }
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <Text style={styles.title}>Panel Administrador</Text>
      <View style={styles.tabBar}>
        {TABS.map(t => {
          const active = tab === t.key
          return (
            <TouchableOpacity
              key={t.key}
              style={[styles.tabItem, active && styles.tabItemActive]}
              onPress={() => setTab(t.key)}
            >
              <Text style={[styles.tabText, active && styles.tabTextActive]}>{t.label}</Text>
            </TouchableOpacity>
          )
        })}
      </View>
      <View style={styles.separator} />
      {renderContent()}
      <View style={{ height: verticalScale(SPACING.xl * 2) }} />
    </ScrollView>
  )
}

export default AdminPanel

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  contentContainer: {
    padding: scale(SPACING.lg),
  },
  title: {
    ...TEXT_STYLES.h2,
    color: COLORS.text,
    marginBottom: verticalScale(SPACING.lg),
  },
  tabBar: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: scale(SPACING.sm),
  },
  tabItem: {
    paddingVertical: verticalScale(SPACING.sm),
    paddingHorizontal: scale(SPACING.md),
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  tabItemActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  tabText: {
    ...TEXT_STYLES.caption,
    color: COLORS.text,
    fontWeight: "600",
  },
  tabTextActive: {
    color: COLORS.textInverse,
  },
  separator: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: verticalScale(SPACING.lg),
  },
  section: {
    marginBottom: verticalScale(SPACING.lg),
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: verticalScale(SPACING.md),
  },
  sectionTitle: {
    ...TEXT_STYLES.subtitle,
    color: COLORS.text,
  },
  row: {
    paddingVertical: verticalScale(SPACING.sm),
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    gap: verticalScale(4),
  },
  rowPrimary: {
    ...TEXT_STYLES.bodySm,
    color: COLORS.text,
    fontWeight: "600",
  },
  rowSecondary: {
    ...TEXT_STYLES.caption,
    color: COLORS.textTertiary,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: scale(SPACING.md),
  },
  statCard: {
    flexBasis: "48%",
  },
})
