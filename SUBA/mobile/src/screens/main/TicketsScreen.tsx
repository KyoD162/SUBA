"use client"

import { useState } from "react"
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, FlatList, Dimensions } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { Ionicons } from "@expo/vector-icons"
import { COLORS, SPACING, RADIUS, TEXT_STYLES } from "../../theme"
import { Card, TicketItem, Badge, Button } from "../../components"
import { useNavigation } from "@react-navigation/native"
import type { RootStackParamList } from "../../navigation/types"
import type { NativeStackNavigationProp } from "@react-navigation/native-stack"
import { useTickets } from "../../navigation/TicketsContext"

// Data now comes from TicketsContext

export default function TicketsScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>()
  const { currentPass, history } = useTickets()
  const [activeTab, setActiveTab] = useState<"passes" | "history">("passes")
  const [expandedQR, setExpandedQR] = useState<string | null>(null)

  const screenWidth = Dimensions.get("window").width
  // Reduce QR footprint for a more compact modern card
  const qrSize = (screenWidth - SPACING.lg * 2 - SPACING.xl * 2) * 0.6

  const QRCode = ({ passId }: { passId: string }) => (
    <View style={styles.qrContainer}>
      <View style={[styles.qrPlaceholder, { width: qrSize, height: qrSize }]}>
        <Ionicons name="qr-code-outline" size={80} color={COLORS.textTertiary} />
        <Text style={styles.qrText}>Escanea para validar</Text>
      </View>
    </View>
  )

  const PassCard = ({
    pass,
  }: {
    pass: {
      id: string
      type: string
      ticketNumber: string
      validUntil?: string
      tripsRemaining: number | "unlimited"
      status: "active" | "expiring_soon" | "expired"
      color?: string
    }
  }) => (
    <Card style={styles.passCard}>
      <View style={styles.passHeader}>
        <View>
          <Text style={styles.passType}>{pass.type}</Text>
          <Text style={styles.ticketNumber}>{pass.ticketNumber}</Text>
        </View>
        <Badge
          label={pass.status === "active" ? "Activo" : pass.status === "expiring_soon" ? "Expira pronto" : "Vencido"}
          variant={pass.status === "active" ? "success" : pass.status === "expiring_soon" ? "warning" : "danger"}
        />
      </View>

      <QRCode passId={pass.id} />

      <View style={styles.passStats}>
        <View style={styles.passStatItem}>
          <Text style={styles.passStatLabel}>Viajes restantes</Text>
          <Text style={styles.passStatValue}>
            {pass.tripsRemaining === "unlimited" ? "Ilimitado" : pass.tripsRemaining}
          </Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.passStatItem}>
          <Text style={styles.passStatLabel}>Válido hasta</Text>
          <Text style={styles.passStatValue}>{pass.validUntil || "—"}</Text>
        </View>
      </View>

      <View style={styles.passActions}>
        <Button
          title="Compartir"
          variant="outline"
          size="sm"
          icon={<Ionicons name="share-social-outline" size={16} color={COLORS.primary} />}
        />
        <Button
          title="Descargar"
          variant="outline"
          size="sm"
          icon={<Ionicons name="download-outline" size={16} color={COLORS.primary} />}
        />
      </View>
    </Card>
  )

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Mis Tickets</Text>
      </View>

      {/* Stats Overview (responsive row) */}
      <View style={styles.statsContainer}>
        <View style={styles.statsRow}>
          <View style={styles.statOverview}>
            <Ionicons name="navigate-outline" size={20} color={COLORS.success} />
            <View style={styles.statTextBlock}>
              <Text style={styles.overviewLabel}>Viajes realizados</Text>
              <Text style={styles.overviewValue}>156</Text>
            </View>
          </View>
          <View style={styles.statOverview}>
            <Ionicons name="star-outline" size={20} color={COLORS.primaryDark} />
            <View style={styles.statTextBlock}>
              <Text style={styles.overviewLabel}>Rutas favoritas</Text>
              <Text style={styles.overviewValue}>3</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Tab Navigation */}
      <View style={styles.tabNavigation}>
        <TouchableOpacity
          style={[styles.tab, activeTab === "passes" && styles.tabActive]}
          onPress={() => setActiveTab("passes")}
        >
          <Text style={[styles.tabText, activeTab === "passes" && styles.tabTextActive]}>Mi Pase</Text>
          {activeTab === "passes" && <View style={styles.tabIndicator} />}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === "history" && styles.tabActive]}
          onPress={() => setActiveTab("history")}
        >
          <Text style={[styles.tabText, activeTab === "history" && styles.tabTextActive]}>Historial</Text>
          {activeTab === "history" && <View style={styles.tabIndicator} />}
        </TouchableOpacity>
      </View>

      {/* Tab Content */}
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {activeTab === "passes" ? (
          <View>
            {currentPass ? (
              <PassCard
                pass={{
                  id: currentPass.id,
                  type: currentPass.type,
                  ticketNumber: currentPass.ticketNumber,
                  validUntil: currentPass.validUntil,
                  tripsRemaining: currentPass.tripsRemaining,
                  status: currentPass.status,
                  color: COLORS.success,
                }}
              />
            ) : (
              <Card style={styles.purchaseCard}>
                <View style={styles.purchaseContent}>
                  <View>
                    <Text style={styles.purchaseTitle}>No tienes un pase activo</Text>
                    <Text style={styles.purchaseSubtitle}>Compra un pase para empezar a viajar</Text>
                  </View>
                  <Button
                    title="Comprar"
                    variant="secondary"
                    size="sm"
                    onPress={() => navigation.navigate("PaymentCheckout", { packageId: "2" })}
                  />
                </View>
              </Card>
            )}

            {/* Purchase New Pass */}
            <Card style={styles.purchaseCard}>
              <View style={styles.purchaseContent}>
                <View>
                  <Text style={styles.purchaseTitle}>¿Necesitas más viajes?</Text>
                  <Text style={styles.purchaseSubtitle}>Compra nuevos paquetes y ahorra</Text>
                </View>
                <Button
                  title="Comprar"
                  variant="secondary"
                  size="sm"
                  onPress={() => navigation.navigate("PaymentCheckout", { packageId: "2" })}
                />
              </View>
            </Card>
          </View>
        ) : (
          <View>
            <View style={styles.historyHeader}>
              <Text style={styles.historyTitle}>Historial de viajes</Text>
              <TouchableOpacity>
                <Text style={styles.filterText}>Filtrar</Text>
              </TouchableOpacity>
            </View>

            {history.length > 0 ? (
              <FlatList
                data={history}
                keyExtractor={(item) => item.id}
                scrollEnabled={false}
                renderItem={({ item }) => (
                  <TicketItem
                    ticketId={item.ticketId}
                    type={item.type}
                    status={item.status}
                    from={item.from}
                    to={item.to}
                    date={item.date}
                    time={item.time}
                  />
                )}
              />
            ) : (
              <View style={styles.emptyState}>
                <Ionicons name="ticket-outline" size={48} color={COLORS.textTertiary} />
                <Text style={styles.emptyText}>No hay viajes registrados</Text>
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.md,
  },
  title: {
    ...TEXT_STYLES.h2,
    color: COLORS.text,
  },
  statsContainer: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.sm,
    paddingBottom: SPACING.sm,
  },
  statsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: SPACING.md,
  },
  statOverview: {
    width: "48%",
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
    minHeight: 64,
  },
  statTextBlock: {
    flex: 1,
  },
  overviewLabel: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
    fontWeight: "600",
  },
  overviewValue: {
    ...TEXT_STYLES.body,
    color: COLORS.text,
    marginTop: SPACING.xs,
    fontWeight: "700",
  },
  tabNavigation: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  tab: {
    flex: 1,
    paddingVertical: SPACING.lg,
    paddingHorizontal: SPACING.lg,
    alignItems: "center",
    justifyContent: "center",
  },
  tabActive: {
    borderBottomWidth: 2,
    borderBottomColor: COLORS.primary,
  },
  tabText: {
    ...TEXT_STYLES.bodySm,
    color: COLORS.textSecondary,
    fontWeight: "600",
  },
  tabTextActive: {
    color: COLORS.primary,
  },
  tabIndicator: {
    width: 2,
    height: 2,
    borderRadius: 1,
    backgroundColor: COLORS.primary,
    marginTop: SPACING.sm,
  },
  scrollContent: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.lg,
  },
  passCard: {
    marginBottom: SPACING.lg,
    padding: SPACING.lg / 1.2,
    borderRadius: RADIUS.md,
    gap: SPACING.sm,
  },
  passHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SPACING.md,
  },
  passType: {
    ...TEXT_STYLES.bodySm,
    color: COLORS.textSecondary,
  },
  ticketNumber: {
    ...TEXT_STYLES.subtitle,
    color: COLORS.text,
    marginTop: SPACING.xs,
  },
  qrContainer: {
    alignItems: "center",
    marginVertical: SPACING.lg,
  },
  qrPlaceholder: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    justifyContent: "center",
    alignItems: "center",
    gap: SPACING.sm,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  qrText: {
    ...TEXT_STYLES.caption,
    color: COLORS.textTertiary,
  },
  passStats: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    marginBottom: SPACING.md,
  },
  passStatItem: {
    flex: 1,
    alignItems: "center",
  },
  passStatLabel: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs / 2,
    fontWeight: "500",
  },
  passStatValue: {
    ...TEXT_STYLES.subtitle,
    color: COLORS.text,
  },
  divider: {
    width: 1,
    height: 40,
    backgroundColor: COLORS.border,
  },
  passActions: {
    flexDirection: "row",
    gap: SPACING.md,
  },
  purchaseCard: {
    marginBottom: SPACING.lg,
    padding: SPACING.lg / 1.4,
    borderRadius: RADIUS.md,
  },
  purchaseContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: SPACING.lg,
  },
  purchaseTitle: {
    ...TEXT_STYLES.bodySm,
    color: COLORS.text,
    fontWeight: "600",
  },
  purchaseSubtitle: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  historyHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SPACING.lg,
  },
  historyTitle: {
    ...TEXT_STYLES.subtitle,
    color: COLORS.text,
  },
  filterText: {
    ...TEXT_STYLES.bodySm,
    color: COLORS.primary,
    fontWeight: "600",
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: SPACING["3xl"],
    gap: SPACING.lg,
  },
  emptyText: {
    ...TEXT_STYLES.body,
    color: COLORS.textSecondary,
  },
})
