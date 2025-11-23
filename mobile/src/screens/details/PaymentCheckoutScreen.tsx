"use client"

import { useMemo, useState } from "react"
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, FlatList, TextInput, Dimensions, useWindowDimensions } from "react-native"
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context"
import { Ionicons } from "@expo/vector-icons"
import { COLORS, SPACING, RADIUS, TEXT_STYLES } from "../../theme"
import { Card, Button, Badge, CurrencyDisplay } from "../../components"
import { useTickets } from "../../navigation/TicketsContext"
import { useRoute, useNavigation } from "@react-navigation/native"
import type { RootStackParamList } from "../../navigation/types"
import type { NativeStackNavigationProp } from "@react-navigation/native-stack"

interface TicketPackage {
  id: string
  name: string
  description: string
  priceUSD: number
  value: string
  trips?: number
  validity?: string
  discount?: number
  popular?: boolean
}

interface PaymentMethod {
  id: string
  type: "visa" | "suba_wallet" | "google_pay"
  name: string
  label: string
  lastDigits?: string
  isPrimary?: boolean
}

const UNIT_PRICE_USD = 0.5

const ticketPackages: TicketPackage[] = [
  {
    id: "1",
    name: "Viaje Sencillo",
    description: "Un viaje válido por una hora",
    priceUSD: 0.5,
    value: "Un viaje",
    validity: "1 hora",
  },
  {
    id: "2",
    name: "Paquete 10 Viajes",
    description: "Perfecto para viajeros frecuentes",
    priceUSD: 4.5,
    value: "10 viajes",
    trips: 10,
    discount: 10,
    popular: true,
  },
  {
    id: "3",
    name: "Mensual Ilimitado",
    description: "Acceso ilimitado por todo un mes",
    priceUSD: 12.0,
    value: "Ilimitado",
    validity: "30 días",
    discount: 20,
  },
  {
    id: "custom",
    name: "Paquete Personalizado",
    description: "Elige cuántos viajes quieres",
    priceUSD: 0, // dinámico según cantidad
    value: "Personalizado",
  },
]

const paymentMethods: PaymentMethod[] = [
  {
    id: "1",
    type: "visa",
    name: "Visa",
    label: "Visa",
    lastDigits: "4532",
    isPrimary: true,
  },
  {
    id: "2",
    type: "suba_wallet",
    name: "SUBA Wallet",
    label: "Billetera SUBA",
    isPrimary: false,
  },
  {
    id: "3",
    type: "google_pay",
    name: "Google Pay",
    label: "Google Pay",
    isPrimary: false,
  },
]

export default function PaymentCheckoutScreen() {
  const { purchasePass } = useTickets()
  const route = useRoute()
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>()
  const initialPackage = (route.params as RootStackParamList["PaymentCheckout"] | undefined)?.packageId || "2"
  const [selectedPackage, setSelectedPackage] = useState<string>(initialPackage)
  const [selectedPayment, setSelectedPayment] = useState<string>("1")
  const [isProcessing, setIsProcessing] = useState(false)
  const [promoCode, setPromoCode] = useState("")
  const [customTrips, setCustomTrips] = useState<number>(5)
  const { width: screenWidth } = useWindowDimensions()
  const insets = useSafeAreaInsets()
  // Slightly smaller than screen width to avoid edge clipping and feel like a carousel
  const cardWidth = Math.max(280, screenWidth - SPACING.lg * 2 - SPACING.md)
  // Symmetric side padding so selected card appears centered without clipping
  const sidePad = Math.max(SPACING.lg, Math.round((screenWidth - cardWidth) / 2))
  // Reduce extra space on the left to avoid perceived clipping while keeping symmetry
  const leftPad = Math.max(SPACING.sm, sidePad - SPACING.md)
  const rightPad = Math.max(SPACING.sm, sidePad)

  const currentPackage = ticketPackages.find((p) => p.id === selectedPackage)
  const currentPayment = paymentMethods.find((p) => p.id === selectedPayment)

  const customDiscount = useMemo(() => {
    if (customTrips >= 20) return 15
    if (customTrips >= 10) return 10
    return 0
  }, [customTrips])

  const customTotal = useMemo(() => {
    let total = UNIT_PRICE_USD * customTrips
    if (customDiscount > 0) total = total * (1 - customDiscount / 100)
    return total
  }, [customTrips, customDiscount])

  const handlePurchase = async () => {
    setIsProcessing(true)
    setTimeout(() => {
      // Decide product type based on selection
      if (selectedPackage === "1") {
        purchasePass({ kind: "single", priceUSD: 0.5 })
      } else if (selectedPackage === "3") {
        purchasePass({ kind: "unlimited", priceUSD: 12.0 })
      } else if (selectedPackage === "custom") {
        purchasePass({ kind: "bundle", trips: customTrips, priceUSD: customTotal })
      } else {
        // id "2" default 10 trips
        purchasePass({ kind: "bundle", trips: 10, priceUSD: currentPackage?.priceUSD || 0 })
      }
      setIsProcessing(false)
      navigation.goBack()
    }, 1200)
  }

  const calculateTotal = () => {
    let total = 0
    if (selectedPackage === "custom") {
      total = customTotal
    } else if (currentPackage) {
      total = currentPackage.priceUSD
      if (currentPackage.discount) {
        total = total * (1 - currentPackage.discount / 100)
      }
    }
    if (promoCode === "SUBA2024") total = total * 0.9
    return total
  }

  const PackageCard = ({ pkg }: { pkg: TicketPackage }) => {
    const isSelected = selectedPackage === pkg.id
    return (
      <TouchableOpacity
        activeOpacity={0.9}
        style={[
          styles.packageCard,
          { width: cardWidth },
          isSelected && styles.packageCardSelected,
          {
            transform: [{ scale: isSelected ? 1 : 0.96 }],
            shadowOpacity: isSelected ? 0.12 : 0.06,
            elevation: isSelected ? 6 : 2,
          },
        ]}
        onPress={() => setSelectedPackage(pkg.id)}
      >
      {pkg.popular && (
        <View style={styles.popularBadge}>
          <Badge label="Más popular" variant="success" size="sm" />
        </View>
      )}

      <View style={styles.packageHeader}>
        <View>
          <Text style={styles.packageName}>{pkg.name}</Text>
          <Text style={styles.packageDescription}>{pkg.description}</Text>
        </View>
        <View style={styles.packagePriceContainer}>
          <CurrencyDisplay
            usdAmount={pkg.id === "custom" ? customTotal : pkg.priceUSD}
            size="md"
          />
        </View>
      </View>

      <View style={styles.packageFeatures}>
        <View style={styles.featureRow}>
          <Ionicons name="checkmark-circle-outline" size={16} color={COLORS.success} />
          <Text style={styles.featureText}>
            {pkg.id === "custom" ? `${customTrips} viaje${customTrips !== 1 ? "s" : ""}` : pkg.value}
          </Text>
        </View>

        {pkg.validity && (
          <View style={styles.featureRow}>
            <Ionicons name="time-outline" size={16} color={COLORS.success} />
            <Text style={styles.featureText}>Válido por {pkg.validity}</Text>
          </View>
        )}

        {pkg.discount && (
          <View style={styles.featureRow}>
            <Ionicons name="gift-outline" size={16} color={COLORS.success} />
            <Text style={styles.featureText}>Ahorra {pkg.discount}%</Text>
          </View>
        )}

        {pkg.id === "custom" && (
          <View style={[styles.featureRow, { justifyContent: "space-between", marginTop: SPACING.sm }]}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: SPACING.sm }}>
              <Ionicons name="pricetag-outline" size={16} color={COLORS.success} />
              <Text style={styles.featureText}>Precio base ${UNIT_PRICE_USD.toFixed(2)} USD por viaje</Text>
            </View>
            {customDiscount > 0 && (
              <Badge label={`-${customDiscount}%`} variant="success" size="sm" />
            )}
          </View>
        )}
      </View>

      <View style={[styles.selectIndicator, selectedPackage === pkg.id && styles.selectIndicatorActive]}>
        <Ionicons
          name={selectedPackage === pkg.id ? "radio-button-on" : "radio-button-off"}
          size={24}
          color={selectedPackage === pkg.id ? COLORS.primary : COLORS.textTertiary}
        />
      </View>
      </TouchableOpacity>
    )
  }

  const PaymentOption = ({ method }: { method: PaymentMethod }) => (
    <TouchableOpacity
      style={[styles.paymentOption, selectedPayment === method.id && styles.paymentOptionSelected]}
      onPress={() => setSelectedPayment(method.id)}
    >
      <View style={styles.paymentOptionLeft}>
        <View style={styles.paymentIcon}>
          {method.type === "visa" && <Ionicons name="card-outline" size={24} color={COLORS.primary} />}
          {method.type === "suba_wallet" && <Ionicons name="wallet-outline" size={24} color={COLORS.success} />}
          {method.type === "google_pay" && <Ionicons name="logo-google" size={24} color={COLORS.primaryDark} />}
        </View>
        <View>
          <Text style={styles.paymentLabel}>{method.label}</Text>
          {method.lastDigits && <Text style={styles.paymentDetails}>•••• {method.lastDigits}</Text>}
          {method.isPrimary && <Badge label="Principal" variant="primary" size="sm" />}
        </View>
      </View>
      <Ionicons
        name={selectedPayment === method.id ? "radio-button-on" : "radio-button-off"}
        size={24}
        color={selectedPayment === method.id ? COLORS.primary : COLORS.textTertiary}
      />
    </TouchableOpacity>
  )

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back-outline" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Comprar Pase</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView 
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: Math.max(insets.bottom + SPACING.xl, SPACING.xl * 2) }
        ]} 
        showsVerticalScrollIndicator={false}
      >
        {/* Package Selection - Horizontal Carousel */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Selecciona tu paquete</Text>
          <FlatList
            data={ticketPackages}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            snapToAlignment="start"
            decelerationRate="fast"
            snapToInterval={cardWidth + SPACING.md}
            contentContainerStyle={{ paddingLeft: leftPad, paddingRight: rightPad }}
            renderItem={({ item }) => <PackageCard pkg={item} />}
            ItemSeparatorComponent={() => <View style={{ width: SPACING.md }} />}
            onMomentumScrollEnd={(e) => {
              const offsetX = e.nativeEvent.contentOffset.x
              const visibleOffset = Math.max(0, offsetX - leftPad)
              const index = Math.round(visibleOffset / (cardWidth + SPACING.md))
              const target = ticketPackages[index]
              if (target && target.id !== selectedPackage) setSelectedPackage(target.id)
            }}
          />

          {selectedPackage === "custom" && (
            <Card variant="outlined" style={styles.customSelector}>
              <Text style={styles.customLabel}>Cantidad de viajes</Text>
              <View style={styles.stepperRow}>
                <TouchableOpacity
                  style={styles.stepperButton}
                  onPress={() => setCustomTrips((n) => Math.max(1, n - 1))}
                >
                  <Ionicons name="remove" size={20} color={COLORS.text} />
                </TouchableOpacity>
                <Text style={styles.customValue}>{customTrips}</Text>
                <TouchableOpacity
                  style={styles.stepperButton}
                  onPress={() => setCustomTrips((n) => Math.min(100, n + 1))}
                >
                  <Ionicons name="add" size={20} color={COLORS.text} />
                </TouchableOpacity>
              </View>
              {customDiscount > 0 && (
                <Text style={styles.customHint}>Descuento aplicado: {customDiscount}%</Text>
              )}
            </Card>
          )}
        </View>

        {/* Promo Code */}
        <Card variant="outlined" style={styles.promoSection}>
          <View style={styles.promoHeader}>
            <Ionicons name="gift-outline" size={24} color={COLORS.success} />
            <Text style={styles.promoTitle}>¿Tienes un código promocional?</Text>
          </View>
          <View style={styles.promoInputContainer}>
            <Ionicons name="pricetag-outline" size={20} color={COLORS.textTertiary} />
            <TextInput
              style={styles.promoInput}
              placeholder="Ingresa código (ej: SUBA2024)"
              placeholderTextColor={COLORS.textTertiary}
              value={promoCode}
              onChangeText={setPromoCode}
            />
            {promoCode && (
              <TouchableOpacity onPress={() => setPromoCode("")}>
                <Ionicons name="close-outline" size={20} color={COLORS.textTertiary} />
              </TouchableOpacity>
            )}
          </View>
        </Card>

        {/* Payment Method Selection */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Método de pago</Text>
            <TouchableOpacity>
              <Text style={styles.addNewText}>Agregar nuevo</Text>
            </TouchableOpacity>
          </View>

          <FlatList
            data={paymentMethods}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
            renderItem={({ item }) => <PaymentOption method={item} />}
            ItemSeparatorComponent={() => <View style={styles.paymentSeparator} />}
          />
        </View>

        {/* Order Summary */}
        <Card variant="outlined" style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Resumen de compra</Text>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>
              {selectedPackage === "custom"
                ? `Paquete ${customTrips} viaje${customTrips !== 1 ? "s" : ""}`
                : currentPackage?.name}
            </Text>
            <CurrencyDisplay
              usdAmount={selectedPackage === "custom" ? customTotal : currentPackage?.priceUSD || 0}
              size="sm"
            />
          </View>

          {selectedPackage !== "custom" && currentPackage?.discount && (
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabelDiscount}>Descuento ({currentPackage.discount}%)</Text>
              <Text style={styles.summaryValueDiscount}>
                -${(currentPackage.priceUSD * (currentPackage.discount / 100)).toFixed(2)} USD
              </Text>
            </View>
          )}

          {selectedPackage === "custom" && customDiscount > 0 && (
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabelDiscount}>Descuento ({customDiscount}%)</Text>
              <Text style={styles.summaryValueDiscount}>-${(UNIT_PRICE_USD * customTrips * (customDiscount / 100)).toFixed(2)} USD</Text>
            </View>
          )}

          {promoCode === "SUBA2024" && (
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabelDiscount}>Código promo (10%)</Text>
              <Text style={styles.summaryValueDiscount}>-${(calculateTotal() * 0.1).toFixed(2)} USD</Text>
            </View>
          )}

          <View style={styles.summaryDivider} />

          <View style={styles.summaryRow}>
            <Text style={styles.summaryTotalLabel}>Total</Text>
            <CurrencyDisplay usdAmount={calculateTotal()} size="lg" />
          </View>
        </Card>

        {/* Terms and Conditions */}
        <View style={styles.termsContainer}>
          <View style={styles.termsRow}>
            <Ionicons name="checkbox-outline" size={20} color={COLORS.primary} />
            <Text style={styles.termsText}>
              Acepto los <Text style={styles.termsLink}>términos y condiciones</Text>
            </Text>
          </View>
        </View>

        {/* Purchase Button */}
        <Button
          title={isProcessing ? "Procesando..." : "Comprar Ahora"}
          variant="primary"
          size="lg"
          loading={isProcessing}
          onPress={handlePurchase}
          style={styles.purchaseButton}
        />

        <Button title="Cancelar" variant="outline" size="lg" style={styles.cancelButton} />
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
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerTitle: {
    ...TEXT_STYLES.subtitle,
    color: COLORS.text,
  },
  scrollContent: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.lg,
  },
  section: {
    marginBottom: SPACING.xl,
  },
  sectionTitle: {
    ...TEXT_STYLES.subtitle,
    color: COLORS.text,
    marginBottom: SPACING.lg,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SPACING.lg,
  },
  addNewText: {
    ...TEXT_STYLES.bodySm,
    color: COLORS.primary,
    fontWeight: "600",
  },
  packageCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    position: "relative",
  },
  packageCardSelected: {
    borderColor: COLORS.primary,
    borderWidth: 2,
  },
  popularBadge: {
    position: "absolute",
    top: SPACING.md,
    right: SPACING.md,
  },
  packageHeader: {
    marginBottom: SPACING.lg,
  },
  packageName: {
    ...TEXT_STYLES.bodySm,
    color: COLORS.text,
    fontWeight: "600",
    marginBottom: SPACING.xs,
  },
  packageDescription: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
  },
  packagePriceContainer: {
    marginTop: SPACING.lg,
  },
  packageFeatures: {
    marginBottom: SPACING.lg,
    gap: SPACING.sm,
  },
  featureRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.md,
  },
  featureText: {
    ...TEXT_STYLES.bodySm,
    color: COLORS.text,
  },
  selectIndicator: {
    alignSelf: "flex-end",
  },
  selectIndicatorActive: {
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.full,
  },
  packageSeparator: {
    height: SPACING.md,
  },
  carouselContent: {
    paddingHorizontal: SPACING.lg,
  },
  promoSection: {
    marginBottom: SPACING.xl,
  },
  customSelector: {
    marginTop: SPACING.md,
    padding: SPACING.lg,
  },
  customLabel: {
    ...TEXT_STYLES.bodySm,
    color: COLORS.text,
    fontWeight: "600",
    marginBottom: SPACING.md,
  },
  stepperRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: SPACING.lg,
    marginBottom: SPACING.sm,
  },
  stepperButton: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    justifyContent: "center",
    alignItems: "center",
  },
  customValue: {
    ...TEXT_STYLES.h3,
    color: COLORS.text,
    minWidth: 40,
    textAlign: "center",
  },
  customHint: {
    ...TEXT_STYLES.caption,
    color: COLORS.success,
    textAlign: "center",
  },
  promoHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  promoTitle: {
    ...TEXT_STYLES.bodySm,
    color: COLORS.text,
    fontWeight: "600",
  },
  promoInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.background,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: SPACING.md,
  },
  promoInput: {
    flex: 1,
    paddingVertical: SPACING.md,
    ...TEXT_STYLES.body,
    color: COLORS.text,
  },
  paymentOption: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    borderWidth: 1.5,
    borderColor: COLORS.border,
  },
  paymentOptionSelected: {
    borderColor: COLORS.primary,
    borderWidth: 2,
  },
  paymentOptionLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.lg,
    flex: 1,
  },
  paymentIcon: {
    width: 48,
    height: 48,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.background,
    justifyContent: "center",
    alignItems: "center",
  },
  paymentLabel: {
    ...TEXT_STYLES.bodySm,
    color: COLORS.text,
    fontWeight: "600",
  },
  paymentDetails: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  paymentSeparator: {
    height: SPACING.sm,
  },
  summaryCard: {
    marginBottom: SPACING.xl,
  },
  summaryTitle: {
    ...TEXT_STYLES.subtitle,
    color: COLORS.text,
    marginBottom: SPACING.lg,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SPACING.md,
  },
  summaryLabel: {
    ...TEXT_STYLES.bodySm,
    color: COLORS.text,
  },
  summaryLabelDiscount: {
    ...TEXT_STYLES.bodySm,
    color: COLORS.success,
  },
  summaryValueDiscount: {
    ...TEXT_STYLES.bodySm,
    color: COLORS.success,
    fontWeight: "600",
  },
  summaryDivider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: SPACING.lg,
  },
  summaryTotalLabel: {
    ...TEXT_STYLES.subtitle,
    color: COLORS.text,
  },
  termsContainer: {
    marginBottom: SPACING.xl,
  },
  termsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.lg,
  },
  termsText: {
    ...TEXT_STYLES.bodySm,
    color: COLORS.text,
    flex: 1,
  },
  termsLink: {
    color: COLORS.primary,
    textDecorationLine: "underline",
  },
  purchaseButton: {
    marginBottom: SPACING.lg,
  },
  cancelButton: {
    marginBottom: SPACING.xl,
  },
})
