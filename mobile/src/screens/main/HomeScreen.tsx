import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { Ionicons } from "@expo/vector-icons"
import { COLORS, SPACING, RADIUS, TEXT_STYLES, globalStyles } from "../../theme"
import { Button, StatCard, Card, Badge, CurrencyDisplay } from "../../components"
import { useAuth } from "../../navigation/AuthContext"
import React from "react"

export default function HomeScreen() {
  const { user } = useAuth();
  
  // Obtener el primer nombre del usuario para el saludo
  const firstName = user?.name?.split(' ')[0] || user?.email?.split('@')[0] || 'Usuario';

  const nearbyRoutes = [
    { id: "A1", name: "Ruta A1 - Unare", stops: 12, distance: 2.3, eta: "5 min", priceUSD: 0.5, neighborhood: "Unare" },
    {
      id: "B5",
      name: "Ruta B5 - Alta Vista",
      stops: 8,
      distance: 1.8,
      eta: "3 min",
      priceUSD: 0.75,
      neighborhood: "Alta Vista",
    },
    {
      id: "C3",
      name: "Ruta C3 - San Félix",
      stops: 15,
      distance: 3.1,
      eta: "8 min",
      priceUSD: 0.6,
      neighborhood: "San Félix",
    },
  ]

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Hola, {firstName}</Text>
            <Text style={styles.date}>Puerto Ordaz - Transporte inteligente</Text>
          </View>
          <View style={styles.avatar} />
        </View>

        {/* Search Bar */}
        <TouchableOpacity style={styles.searchBar}>
          <Ionicons name="search-outline" size={20} color={COLORS.textTertiary} />
          <Text style={styles.searchPlaceholder}>¿A dónde vas hoy?</Text>
          <Ionicons name="map-outline" size={20} color={COLORS.textTertiary} />
        </TouchableOpacity>

        {/* Quick Actions */}
        <View style={styles.quickActionsContainer}>
          <TouchableOpacity 
            style={styles.cardButton} 
            activeOpacity={0.7}
            onPress={() => console.log("Ir a Comprar")} // Agrega tu navegación aquí
          >
            <View style={[styles.cardIconContainer, { backgroundColor: COLORS.primary + '20' }]}>
              <Ionicons name="card-outline" size={28} color={COLORS.primary} />
            </View>
            <View style={styles.cardTextContainer}>
              <Text style={styles.cardTitle}>Comprar</Text>
              <Text style={styles.cardSubtitle}>Recargar saldo</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.cardButton} 
            activeOpacity={0.7}
            onPress={() => console.log("Ir a Historial")} // Agrega tu navegación aquí
          >
            <View style={[styles.cardIconContainer, { backgroundColor: COLORS.primaryDark + '20' }]}>
              <Ionicons name="stats-chart-outline" size={28} color={COLORS.primaryDark} />
            </View>
             <View style={styles.cardTextContainer}>
              <Text style={styles.cardTitle}>Historial</Text>
              <Text style={styles.cardSubtitle}>Ver movimientos</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Promotional Banner */}
        <Card variant="elevated" style={styles.promotionCard}>
          <View style={styles.promotionContent}>
            <View>
              <Ionicons name="gift-outline" size={32} color={COLORS.success} />
            </View>
            <View style={styles.promotionText}>
              <Text style={styles.promoTitle}>¡Recarga y ahorra!</Text>
              <Text style={styles.promoSubtitle}>10% de descuento en paquetes mensuales</Text>
            </View>
            <Button title="Ver más" variant="secondary" size="sm" />
          </View>
        </Card>

        {/* Active Pass Card */}
        <Card style={styles.passCard}>
          <View style={styles.passHeader}>
            <View>
              <Text style={styles.passStatus}>Pase Activo</Text>
              <Text style={styles.passType}>Mensual Ilimitado</Text>
            </View>
            <Badge label="Activo" variant="success" />
          </View>

          <View style={styles.passStats}>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Viajes restantes</Text>
              <Text style={styles.statValue}>Ilimitado</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Válido hasta</Text>
              <Text style={styles.statValue}>9 Dic 2025</Text>
            </View>
          </View>

          <Button title="Ver QR de pase" variant="outline" size="sm" style={{ marginTop: SPACING.lg }} />
        </Card>

        {/* Nearby Routes Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Rutas Cercanas</Text>
            <TouchableOpacity>
              <Text style={styles.seeAll}>Ver mapa</Text>
            </TouchableOpacity>
          </View>

          {nearbyRoutes.map((route) => (
            <TouchableOpacity key={route.id} style={styles.routeItem}>
              <View style={styles.routeIcon}>
                <Ionicons name="bus-outline" size={20} color={COLORS.primary} />
              </View>
              <View style={styles.routeInfo}>
                <Text style={styles.routeName}>{route.name}</Text>
                <Text style={styles.routeDetails}>
                  {route.stops} paradas • {route.distance} km
                </Text>
                <View style={styles.routePrice}>
                  <CurrencyDisplay usdAmount={route.priceUSD} size="sm" />
                </View>
              </View>
              <View style={styles.routeEta}>
                <Text style={styles.etaText}>{route.eta}</Text>
                <Ionicons name="chevron-forward-outline" size={20} color={COLORS.textTertiary} />
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Statistics Section */}
        <View style={styles.statsSection}>
          <Text style={styles.sectionTitle}>Tu Actividad</Text>
          <View style={styles.statsGrid}>
            <StatCard icon="navigate" label="Viajes este mes" value="28" color={COLORS.primary} style={{ flex: 1 }} />
            <StatCard
              icon="wallet-outline"
              label="Total ahorrado"
              value="$12"
              color={COLORS.success}
              style={{ flex: 1 }}
            />
          </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.lg,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SPACING.xl,
  },
  greeting: {
    ...TEXT_STYLES.h2,
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  date: {
    ...TEXT_STYLES.bodySm,
    color: COLORS.textSecondary,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.primary,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.full,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    marginBottom: SPACING.xl,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: SPACING.md,
  },
  searchPlaceholder: {
    ...TEXT_STYLES.body,
    color: COLORS.textTertiary,
    flex: 1,
  },
  quickActionsContainer: {
    flexDirection: "row",
    gap: 12,
    marginBottom: SPACING.lg,
    paddingHorizontal: SPACING.lg,
  },
  cardButton: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    paddingVertical: 12, 
    paddingHorizontal: 10, 
    flexDirection: "row",
    alignItems: "center",
    gap: 10,       
    // Sombras
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  cardIconContainer: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.md,
    justifyContent: "center",
    alignItems: "center",
  },
  cardTextContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  cardTitle: {
    ...TEXT_STYLES.bodySm,
    color: COLORS.text,
    fontWeight: "700",
    fontSize: 14,
  },
  cardSubtitle: {
    ...TEXT_STYLES.caption,
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: -2,
  },
  actionLabel: {
    ...TEXT_STYLES.caption,
    color: COLORS.text,
    fontWeight: "600",
  },
  passCard: {
    ...globalStyles.cardContainer,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.success,
    marginVertical: SPACING.xl,
  },
  passHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: SPACING.lg,
  },
  passStatus: {
    ...TEXT_STYLES.bodySm,
    color: COLORS.textSecondary,
  },
  passType: {
    ...TEXT_STYLES.subtitle,
    color: COLORS.text,
    marginTop: SPACING.xs,
  },
  passStats: {
    flexDirection: "row",
    alignItems: "center",
  },
  statItem: {
    flex: 1,
  },
  statLabel: {
    ...TEXT_STYLES.caption,
    color: COLORS.textTertiary,
    marginBottom: SPACING.xs,
  },
  statValue: {
    ...TEXT_STYLES.subtitle,
    color: COLORS.text,
  },
  divider: {
    width: 1,
    height: 40,
    backgroundColor: COLORS.border,
  },
  section: {
    marginBottom: SPACING["2xl"],
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    ...TEXT_STYLES.subtitle,
    color: COLORS.text,
  },
  seeAll: {
    ...TEXT_STYLES.bodySm,
    color: COLORS.primary,
    fontWeight: "600",
  },
  routeItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: SPACING.md,
  },
  routeIcon: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.background,
    ...globalStyles.centered,
  },
  routeInfo: {
    flex: 1,
  },
  routeName: {
    ...TEXT_STYLES.bodySm,
    color: COLORS.text,
    fontWeight: "600",
  },
  routeDetails: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  routePrice: {
    marginTop: SPACING.xs,
  },
  routeEta: {
    flexDirection: "row",
    alignItems: "center",
  },
  etaText: {
    ...TEXT_STYLES.caption,
    color: COLORS.text,
    marginRight: SPACING.md,
  },
  statsGrid: {
    flexDirection: "row",
    gap: SPACING.lg,
    marginTop: SPACING.lg,
  },
  statsSection: {
    marginVertical: SPACING.xl,
  },
  promotionCard: {
    marginVertical: SPACING.xl,
  },
  promotionContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.lg,
  },
  promotionText: {
    flex: 1,
  },
  promoTitle: {
    ...TEXT_STYLES.subtitle,
    color: COLORS.text,
  },
  promoSubtitle: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
})
