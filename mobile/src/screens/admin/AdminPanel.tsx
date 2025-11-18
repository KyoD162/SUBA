"use client"

import React, { useMemo, useState } from "react"
import {
  View,
  Text,
  FlatList,
  Modal,
  TextInput,
  TouchableOpacity,
  Switch,
  StyleSheet,
  ScrollView,
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { COLORS, SPACING, RADIUS, TEXT_STYLES, globalStyles } from "../../theme"
import { Card, Button, Badge } from "../../components"

type RouteItem = { id: string; name: string; origin: string; destination: string }
type DriverItem = { id: string; name: string; license: string; active: boolean }
type PriceItem = { id: string; routeId: string; routeName: string; amount: number; currency: string }
type UserItem = { id: string; name: string; email: string; role: "admin" | "driver" | "user"; active: boolean }

type TabKey = "overview" | "routes" | "drivers" | "prices" | "users"

const uid = () => Math.random().toString(36).slice(2, 10)

const AdminPanel: React.FC = () => {
  // Estado in-memory (mock)
  const [routes, setRoutes] = useState<RouteItem[]>([
    { id: uid(), name: "Ruta Centro", origin: "Terminal A", destination: "Centro" },
    { id: uid(), name: "Ruta Norte", origin: "Terminal B", destination: "Barrio Norte" },
  ])
  const [drivers, setDrivers] = useState<DriverItem[]>([
    { id: uid(), name: "Ana Gómez", license: "LIC-1234", active: true },
    { id: uid(), name: "Luis Pérez", license: "LIC-5678", active: true },
  ])
  const [prices, setPrices] = useState<PriceItem[]>([])
  const [users, setUsers] = useState<UserItem[]>([
    { id: uid(), name: "Admin", email: "admin@suba.app", role: "admin", active: true },
    { id: uid(), name: "Conductor 1", email: "driver1@suba.app", role: "driver", active: true },
    { id: uid(), name: "Usuario 1", email: "user1@suba.app", role: "user", active: true },
  ])

  const [tab, setTab] = useState<TabKey>("overview")

  const stats = useMemo(
    () => ({
      totalRoutes: routes.length,
      totalDrivers: drivers.length,
      totalUsers: users.length,
      tripsToday: Math.floor(50 + Math.random() * 75),
    }),
    [routes.length, drivers.length, users.length]
  )

  // Routes CRUD
  const addRoute = (r: Omit<RouteItem, "id">) => setRoutes((p) => [...p, { ...r, id: uid() }])
  const updateRoute = (id: string, r: Partial<Omit<RouteItem, "id">>) =>
    setRoutes((p) => p.map((x) => (x.id === id ? { ...x, ...r } : x)))
  const deleteRoute = (id: string) => {
    setRoutes((p) => p.filter((x) => x.id !== id))
    setPrices((p) => p.filter((pr) => pr.routeId !== id))
  }

  // Drivers CRUD
  const addDriver = (d: Omit<DriverItem, "id">) => setDrivers((p) => [...p, { ...d, id: uid() }])
  const updateDriver = (id: string, d: Partial<Omit<DriverItem, "id">>) =>
    setDrivers((p) => p.map((x) => (x.id === id ? { ...x, ...d } : x)))
  const deleteDriver = (id: string) => setDrivers((p) => p.filter((x) => x.id !== id))

  // Prices upsert por routeId
  const upsertPrice = (payload: Omit<PriceItem, "id"> & { id?: string }) =>
    setPrices((prev) => {
      const ex = prev.find((x) => x.routeId === payload.routeId)
      if (ex) return prev.map((x) => (x.routeId === payload.routeId ? { ...x, ...payload, id: x.id } : x))
      return [...prev, { ...payload, id: uid() }]
    })

  // Users CRUD
  const addUser = (u: Omit<UserItem, "id">) => setUsers((p) => [...p, { ...u, id: uid() }])
  const updateUser = (id: string, u: Partial<Omit<UserItem, "id">>) =>
    setUsers((p) => p.map((x) => (x.id === id ? { ...x, ...u } : x)))
  const deleteUser = (id: string) => setUsers((p) => p.filter((x) => x.id !== id))

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <HeaderTabs tab={tab} setTab={setTab} />
      <View style={styles.contentArea}>
        {tab === "overview" && <OverviewPane stats={stats} />}
        {tab === "routes" && (
          <RoutesPane routes={routes} addRoute={addRoute} updateRoute={updateRoute} deleteRoute={deleteRoute} />
        )}
        {tab === "drivers" && (
          <DriversPane drivers={drivers} addDriver={addDriver} updateDriver={updateDriver} deleteDriver={deleteDriver} />
        )}
        {tab === "prices" && <PricesPane routes={routes} prices={prices} upsertPrice={upsertPrice} />}
        {tab === "users" && (
          <UsersPane users={users} addUser={addUser} updateUser={updateUser} deleteUser={deleteUser} />
        )}
      </View>
    </SafeAreaView>
  )
}

const HeaderTabs: React.FC<{ tab: TabKey; setTab: (t: TabKey) => void }> = ({ tab, setTab }) => {
  const tabs: { key: TabKey; label: string }[] = [
    { key: "overview", label: "Overview" },
    { key: "routes", label: "Rutas" },
    { key: "drivers", label: "Conductores" },
    { key: "prices", label: "Precios" },
    { key: "users", label: "Usuarios" },
  ]
  return (
    <View style={styles.tabBar}>
      {tabs.map((t) => (
        <TouchableOpacity key={t.key} onPress={() => setTab(t.key)} style={[styles.tabBtn, tab === t.key && styles.tabBtnActive]}>
          <Text style={[styles.tabText, tab === t.key && styles.tabTextActive]}>{t.label}</Text>
        </TouchableOpacity>
      ))}
    </View>
  )
}

const OverviewPane: React.FC<{ stats: { totalRoutes: number; totalDrivers: number; totalUsers: number; tripsToday: number } }>
  = ({ stats }) => {
  return (
    <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Overview</Text>
          <Badge label="Mock" variant="neutral" />
        </View>
        <Card style={styles.statsCard}>
          <StatRow label="Total de rutas" value={String(stats.totalRoutes)} />
          <StatRow label="Total de conductores" value={String(stats.totalDrivers)} />
          <StatRow label="Total de usuarios" value={String(stats.totalUsers)} />
          <StatRow label="Viajes hoy" value={String(stats.tripsToday)} border={false} />
        </Card>
        <Text style={styles.helperText}>Datos locales. Integra tu backend cuando esté listo.</Text>
      </View>
    </ScrollView>
  )
}

const RoutesPane: React.FC<{ routes: RouteItem[]; addRoute: (r: Omit<RouteItem, "id">) => void; updateRoute: (id: string, r: Partial<Omit<RouteItem, "id">>) => void; deleteRoute: (id: string) => void }> = ({ routes, addRoute, updateRoute, deleteRoute }) => {
  const [visible, setVisible] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<Omit<RouteItem, "id">>({ name: "", origin: "", destination: "" })
  const isEdit = !!editingId

  const openCreate = () => {
    setEditingId(null)
    setForm({ name: "", origin: "", destination: "" })
    setVisible(true)
  }
  const openEdit = (id: string) => {
    const r = routes.find((x) => x.id === id)
    if (!r) return
    setEditingId(id)
    setForm({ name: r.name, origin: r.origin, destination: r.destination })
    setVisible(true)
  }
  const onSave = () => {
    if (!form.name.trim() || !form.origin.trim() || !form.destination.trim()) return
    if (isEdit && editingId) updateRoute(editingId, form)
    else addRoute(form)
    setVisible(false)
  }

  return (
    <>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Rutas</Text>
            <Button title="Crear" size="sm" variant="secondary" onPress={openCreate} />
          </View>
          <FlatList
            data={routes}
            scrollEnabled={false}
            keyExtractor={(r) => r.id}
            ItemSeparatorComponent={() => <View style={styles.listSeparator} />}
            renderItem={({ item }) => (
              <Card style={styles.entityCard}>
                <Text style={styles.entityTitle}>{item.name}</Text>
                <Text style={styles.entitySubtitle}>
                  {item.origin} → {item.destination}
                </Text>
                <View style={styles.inlineActions}>
                  <Button title="Editar" size="sm" variant="outline" onPress={() => openEdit(item.id)} />
                  <Button title="Eliminar" size="sm" variant="outline" style={{ borderColor: COLORS.danger }} textStyle={{ color: COLORS.danger }} onPress={() => deleteRoute(item.id)} />
                </View>
              </Card>
            )}
          />
        </View>
      </ScrollView>
      <Modal visible={visible} animationType="slide" transparent onRequestClose={() => setVisible(false)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>{isEdit ? "Editar ruta" : "Crear ruta"}</Text>
            <TextInput placeholder="Nombre" value={form.name} onChangeText={(t) => setForm((f) => ({ ...f, name: t }))} style={styles.input} />
            <TextInput placeholder="Origen" value={form.origin} onChangeText={(t) => setForm((f) => ({ ...f, origin: t }))} style={styles.input} />
            <TextInput placeholder="Destino" value={form.destination} onChangeText={(t) => setForm((f) => ({ ...f, destination: t }))} style={styles.input} />
            <Actions onCancel={() => setVisible(false)} onSave={onSave} />
          </View>
        </View>
      </Modal>
    </>
  )
}

const DriversPane: React.FC<{ drivers: DriverItem[]; addDriver: (d: Omit<DriverItem, "id">) => void; updateDriver: (id: string, d: Partial<Omit<DriverItem, "id">>) => void; deleteDriver: (id: string) => void }> = ({ drivers, addDriver, updateDriver, deleteDriver }) => {
  const [visible, setVisible] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<Omit<DriverItem, "id">>({ name: "", license: "", active: true })
  const isEdit = !!editingId

  const openCreate = () => {
    setEditingId(null)
    setForm({ name: "", license: "", active: true })
    setVisible(true)
  }
  const openEdit = (id: string) => {
    const d = drivers.find((x) => x.id === id)
    if (!d) return
    setEditingId(id)
    setForm({ name: d.name, license: d.license, active: d.active })
    setVisible(true)
  }
  const onSave = () => {
    if (!form.name.trim() || !form.license.trim()) return
    if (isEdit && editingId) updateDriver(editingId, form)
    else addDriver(form)
    setVisible(false)
  }

  return (
    <>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Conductores</Text>
            <Button title="Nuevo" size="sm" variant="secondary" onPress={openCreate} />
          </View>
          <FlatList
            data={drivers}
            scrollEnabled={false}
            keyExtractor={(d) => d.id}
            ItemSeparatorComponent={() => <View style={styles.listSeparator} />}
            renderItem={({ item }) => (
              <Card style={styles.entityCard}>
                <Text style={styles.entityTitle}>{item.name}</Text>
                <Text style={styles.entitySubtitle}>Licencia: {item.license}</Text>
                <Badge label={item.active ? "Activo" : "Suspendido"} variant={item.active ? "success" : "warning"} />
                <View style={styles.inlineActions}>
                  <Button title="Editar" size="sm" variant="outline" onPress={() => openEdit(item.id)} />
                  <Button title="Eliminar" size="sm" variant="outline" style={{ borderColor: COLORS.danger }} textStyle={{ color: COLORS.danger }} onPress={() => deleteDriver(item.id)} />
                </View>
              </Card>
            )}
          />
        </View>
      </ScrollView>
      <Modal visible={visible} animationType="slide" transparent onRequestClose={() => setVisible(false)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>{isEdit ? "Editar conductor" : "Registrar conductor"}</Text>
            <TextInput placeholder="Nombre" value={form.name} onChangeText={(t) => setForm((f) => ({ ...f, name: t }))} style={styles.input} />
            <TextInput placeholder="Licencia" value={form.license} onChangeText={(t) => setForm((f) => ({ ...f, license: t }))} style={styles.input} />
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
              <Text>Activo</Text>
              <Switch value={form.active} onValueChange={(v) => setForm((f) => ({ ...f, active: v }))} />
            </View>
            <Actions onCancel={() => setVisible(false)} onSave={onSave} />
          </View>
        </View>
      </Modal>
    </>
  )
}

const PricesPane: React.FC<{
  routes: RouteItem[]
  prices: PriceItem[]
  upsertPrice: (p: Omit<PriceItem, "id"> & { id?: string }) => void
}> = ({ routes, prices, upsertPrice }) => {
  const [visible, setVisible] = useState(false)
  const [form, setForm] = useState<{ routeId: string; amount: string; currency: string }>({
    routeId: "",
    amount: "",
    currency: "USD",
  })

  const open = () => {
    setForm({ routeId: "", amount: "", currency: "USD" })
    setVisible(true)
  }
  const onSave = () => {
    if (!form.routeId || !form.amount) return
    const route = routes.find((r) => r.id === form.routeId)
    const amount = parseFloat(form.amount)
    upsertPrice({ routeId: form.routeId, routeName: route?.name ?? "Ruta", amount, currency: form.currency })
    setVisible(false)
  }

  return (
    <>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Precios</Text>
            <Button title="Nueva tarifa" size="sm" variant="secondary" onPress={open} />
          </View>
          <FlatList
            data={prices}
            scrollEnabled={false}
            keyExtractor={(p) => p.id}
            ItemSeparatorComponent={() => <View style={styles.listSeparator} />}
            renderItem={({ item }) => (
              <Card style={styles.entityCard}>
                <Text style={styles.entityTitle}>{item.routeName}</Text>
                <Text style={styles.entitySubtitle}>
                  {item.amount} {item.currency}
                </Text>
              </Card>
            )}
            ListEmptyComponent={<Text style={styles.helperText}>Sin tarifas aún.</Text>}
          />
        </View>
      </ScrollView>
      <Modal visible={visible} animationType="slide" transparent onRequestClose={() => setVisible(false)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Tarifa por ruta</Text>
            <Text style={styles.label}>Selecciona una ruta</Text>
            <View style={styles.selectorBox}>
              <ScrollView style={{ maxHeight: 140 }}>
                {routes.map((r) => (
                  <TouchableOpacity
                    key={r.id}
                    onPress={() => setForm((f) => ({ ...f, routeId: r.id }))}
                    style={[styles.selectorItem, form.routeId === r.id && styles.selectorItemActive]}
                  >
                    <Text numberOfLines={1}>
                      {r.name} — {r.origin} → {r.destination}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
            <TextInput
              placeholder="Monto"
              keyboardType="decimal-pad"
              value={form.amount}
              onChangeText={(t) => setForm((f) => ({ ...f, amount: t }))}
              style={styles.input}
            />
            <TextInput
              placeholder="Moneda"
              value={form.currency}
              onChangeText={(t) => setForm((f) => ({ ...f, currency: t }))}
              style={styles.input}
            />
            <Actions onCancel={() => setVisible(false)} onSave={onSave} />
          </View>
        </View>
      </Modal>
    </>
  )
}

const UsersPane: React.FC<{
  users: UserItem[]
  addUser: (u: Omit<UserItem, "id">) => void
  updateUser: (id: string, u: Partial<Omit<UserItem, "id">>) => void
  deleteUser: (id: string) => void
}> = ({ users, addUser, updateUser, deleteUser }) => {
  const [visible, setVisible] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<Omit<UserItem, "id">>({ name: "", email: "", role: "user", active: true })
  const isEdit = !!editingId

  const openCreate = () => {
    setEditingId(null)
    setForm({ name: "", email: "", role: "user", active: true })
    setVisible(true)
  }
  const openEdit = (id: string) => {
    const u = users.find((x) => x.id === id)
    if (!u) return
    setEditingId(id)
    setForm({ name: u.name, email: u.email, role: u.role, active: u.active })
    setVisible(true)
  }
  const onSave = () => {
    if (!form.name.trim() || !form.email.trim()) return
    if (isEdit && editingId) updateUser(editingId, form)
    else addUser(form)
    setVisible(false)
  }
  return (
    <>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Usuarios</Text>
            <Button title="Nuevo" size="sm" variant="secondary" onPress={openCreate} />
          </View>
          <FlatList
            data={users}
            scrollEnabled={false}
            keyExtractor={(u) => u.id}
            ItemSeparatorComponent={() => <View style={styles.listSeparator} />}
            renderItem={({ item }) => (
              <Card style={styles.entityCard}>
                <Text style={styles.entityTitle}>{item.name}</Text>
                <Text style={styles.entitySubtitle}>{item.email}</Text>
                <Badge
                  label={item.role}
                  variant={item.role === "admin" ? "primary" : item.role === "driver" ? "success" : "neutral"}
                />
                <Badge label={item.active ? "Activo" : "Suspendido"} variant={item.active ? "success" : "warning"} />
                <View style={styles.inlineActions}>
                  <Button title="Editar" size="sm" variant="outline" onPress={() => openEdit(item.id)} />
                  <Button
                    title="Eliminar"
                    size="sm"
                    variant="outline"
                    style={{ borderColor: COLORS.danger }}
                    textStyle={{ color: COLORS.danger }}
                    onPress={() => deleteUser(item.id)}
                  />
                </View>
              </Card>
            )}
          />
        </View>
      </ScrollView>
      <Modal visible={visible} animationType="slide" transparent onRequestClose={() => setVisible(false)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>{isEdit ? "Editar usuario" : "Nuevo usuario"}</Text>
            <TextInput
              placeholder="Nombre"
              value={form.name}
              onChangeText={(t) => setForm((f) => ({ ...f, name: t }))}
              style={styles.input}
            />
            <TextInput
              placeholder="Email"
              value={form.email}
              onChangeText={(t) => setForm((f) => ({ ...f, email: t }))}
              style={styles.input}
            />
            <Text style={styles.label}>Rol</Text>
            <View style={styles.selectorBox}>
              {(["admin", "driver", "user"] as const).map((r) => (
                <TouchableOpacity
                  key={r}
                  onPress={() => setForm((f) => ({ ...f, role: r }))}
                  style={[styles.selectorItem, form.role === r && styles.selectorItemActive]}
                >
                  <Text>{r}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginTop: 8 }}>
              <Text>Activo</Text>
              <Switch value={form.active} onValueChange={(v) => setForm((f) => ({ ...f, active: v }))} />
            </View>
            <Actions onCancel={() => setVisible(false)} onSave={onSave} />
          </View>
        </View>
      </Modal>
    </>
  )
}

// UI helpers
const StatRow: React.FC<{ label: string; value: string; border?: boolean }> = ({ label, value, border = true }) => (
  <View style={[styles.statRow, !border && { borderBottomWidth: 0 }]}>
    <Text style={styles.statRowLabel}>{label}</Text>
    <Text style={styles.statRowValue}>{value}</Text>
  </View>
)

const Actions: React.FC<{ onCancel: () => void; onSave: () => void }> = ({ onCancel, onSave }) => (
  <View style={{ flexDirection: "row", justifyContent: "flex-end", gap: 16, marginTop: 8 }}>
    <TouchableOpacity onPress={onCancel}>
      <Text style={{ color: COLORS.textTertiary }}>Cancelar</Text>
    </TouchableOpacity>
    <TouchableOpacity onPress={onSave}>
      <Text style={{ color: COLORS.primary, fontWeight: "600" }}>Guardar</Text>
    </TouchableOpacity>
  </View>
)

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  contentArea: { flex: 1 },
  scrollContent: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.lg,
    gap: SPACING.xl,
  },
  section: {
    marginBottom: SPACING.xl,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    ...TEXT_STYLES.subtitle,
    color: COLORS.text,
  },
  statsCard: {
    ...globalStyles.cardContainer,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  statRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: SPACING.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: COLORS.border,
  },
  statRowLabel: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
  },
  statRowValue: {
    ...TEXT_STYLES.bodySm,
    color: COLORS.text,
    fontWeight: "600",
  },
  helperText: {
    ...TEXT_STYLES.caption,
    color: COLORS.textTertiary,
    marginTop: SPACING.sm,
  },
  tabBar: {
    flexDirection: "row",
    backgroundColor: COLORS.surface,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: COLORS.border,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    gap: SPACING.sm,
  },
  tabBtn: {
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.surfaceAlt ?? "#eee",
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  tabBtnActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  tabText: { ...TEXT_STYLES.caption, color: COLORS.text },
  tabTextActive: { ...TEXT_STYLES.caption, color: COLORS.textInverse },
  listSeparator: { height: SPACING.md },
  entityCard: {
    ...globalStyles.cardContainer,
    gap: SPACING.xs,
  },
  entityTitle: {
    ...TEXT_STYLES.bodySm,
    color: COLORS.text,
    fontWeight: "600",
  },
  entitySubtitle: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
  },
  inlineActions: {
    flexDirection: "row",
    gap: SPACING.sm,
    marginTop: SPACING.sm,
  },
  modalBackdrop: { flex: 1, backgroundColor: "#0007", alignItems: "center", justifyContent: "center" },
  modalCard: { width: "90%", backgroundColor: COLORS.surface, borderRadius: RADIUS.lg, padding: SPACING.lg, gap: SPACING.sm },
  modalTitle: { ...TEXT_STYLES.subtitle, color: COLORS.text },
  input: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    ...TEXT_STYLES.bodySm,
    color: COLORS.text,
  },
  label: { ...TEXT_STYLES.caption, color: COLORS.textSecondary, marginTop: SPACING.sm },
  selectorBox: { borderWidth: 1, borderColor: COLORS.border, borderRadius: RADIUS.md, marginTop: SPACING.xs },
  selectorItem: { padding: SPACING.md },
  selectorItemActive: { backgroundColor: COLORS.surfaceAlt ?? "#0a84ff11" },
})

export default AdminPanel
