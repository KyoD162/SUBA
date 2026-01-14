"use client"

import { useMemo, useState, useEffect } from "react"
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, FlatList, TextInput, Dimensions, useWindowDimensions, ActivityIndicator, Alert, Modal } from "react-native"
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context"
import { Ionicons } from "@expo/vector-icons"
import { COLORS, SPACING, RADIUS, TEXT_STYLES } from "../../theme"
import { Card, Button, Badge, CurrencyDisplay } from "../../components"
import { useTickets } from "../../navigation/TicketsContext"
import { useRoute, useNavigation } from "@react-navigation/native"
import type { RootStackParamList } from "../../navigation/types"
import type { NativeStackNavigationProp } from "@react-navigation/native-stack"
import type { TicketType } from "../../services/tickets"

interface PaymentMethod {
  id: string
  type: "visa" | "suba_wallet" | "google_pay"
  name: string
  label: string
  lastDigits?: string
  isPrimary?: boolean
}

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

// Fallback ticket types when backend is not available
const fallbackTicketTypes: TicketType[] = [
  {
    _id: 'fallback-1',
    name: 'Viaje Sencillo',
    description: 'Un solo viaje en cualquier ruta de SUBA.',
    category: 'single',
    price: 0.50,
    usageLimit: 1,
    durationMinutes: null,
    color: '#0891B2',
    icon: 'ticket',
    isActive: true,
  },
  {
    _id: 'fallback-2',
    name: 'Paquete 10 Viajes',
    description: 'Perfecto para viajeros frecuentes. Ahorra un 10%.',
    category: 'multi',
    price: 4.50,
    usageLimit: 10,
    durationMinutes: null,
    color: '#059669',
    icon: 'layers',
    isActive: true,
  },
  {
    _id: 'fallback-3',
    name: 'Pase Mensual',
    description: 'Viajes ilimitados durante 30 días.',
    category: 'time_based',
    price: 15.00,
    usageLimit: null,
    durationMinutes: 43200, // 30 days
    color: '#7C3AED',
    icon: 'calendar',
    isActive: true,
  },
]

export default function PaymentCheckoutScreen() {
  const { purchasePass, availableTicketTypes, refreshTicketTypes, isPurchasing } = useTickets()
  const route = useRoute()
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>()
  const [selectedPackage, setSelectedPackage] = useState<string>("")
  const [selectedPayment, setSelectedPayment] = useState<string>("1")
  const [isProcessing, setIsProcessing] = useState(false)
  const [promoCode, setPromoCode] = useState("")
  const [isLoadingTypes, setIsLoadingTypes] = useState(true)
  const [useFallback, setUseFallback] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [purchasedTicketName, setPurchasedTicketName] = useState('')
  const { width: screenWidth } = useWindowDimensions()
  const insets = useSafeAreaInsets()
  // Slightly smaller than screen width to avoid edge clipping and feel like a carousel
  const cardWidth = Math.max(280, screenWidth - SPACING.lg * 2 - SPACING.md)
  // Symmetric side padding so selected card appears centered without clipping
  const sidePad = Math.max(SPACING.lg, Math.round((screenWidth - cardWidth) / 2))
  // Reduce extra space on the left to avoid perceived clipping while keeping symmetry
  const leftPad = Math.max(SPACING.sm, sidePad - SPACING.md)
  const rightPad = Math.max(SPACING.sm, sidePad)

  // Use backend types or fallback
  const ticketTypesToShow = useMemo(() => {
    if (availableTicketTypes.length > 0) return availableTicketTypes
    if (useFallback) return fallbackTicketTypes
    return []
  }, [availableTicketTypes, useFallback])

  // Load ticket types on mount
  useEffect(() => {
    const loadTypes = async () => {
      setIsLoadingTypes(true)
      try {
        const types = await refreshTicketTypes()
        // If no types returned, use fallback
        if (!types || types.length === 0) {
          setUseFallback(true)
        } else {
          setUseFallback(false)
        }
      } catch {
        setUseFallback(true)
      } finally {
        setIsLoadingTypes(false)
      }
    }
    loadTypes()
  }, [refreshTicketTypes])

  // Set default selection when types are loaded
  useEffect(() => {
    if (ticketTypesToShow.length > 0 && !selectedPackage) {
      // Try to find a "popular" multi-use package, otherwise select first
      const popularPackage = ticketTypesToShow.find(t => t.category === 'multi')
      setSelectedPackage(popularPackage?._id || ticketTypesToShow[0]._id)
    }
  }, [ticketTypesToShow, selectedPackage])

  const currentPackage = ticketTypesToShow.find((p) => p._id === selectedPackage)
  const currentPayment = paymentMethods.find((p) => p.id === selectedPayment)
  const isFallbackPurchase = selectedPackage.startsWith('fallback-')

  const handlePurchase = async () => {
    if (!selectedPackage) {
      Alert.alert('Error', 'Por favor selecciona un tipo de ticket')
      return
    }
    
    // If using fallback, show message that backend is unavailable
    if (isFallbackPurchase) {
      Alert.alert(
        'Servicio no disponible',
        'El servicio de compra no está disponible en este momento. Por favor intenta más tarde.',
        [{ text: 'OK' }]
      )
      return
    }
    
    setIsProcessing(true)
    try {
      await purchasePass(selectedPackage)
      setPurchasedTicketName(currentPackage?.name || 'Ticket')
      setShowSuccessModal(true)
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'No se pudo completar la compra'
      Alert.alert('Error', message)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleGoToTickets = () => {
    setShowSuccessModal(false)
    navigation.reset({
      index: 0,
      routes: [{ name: 'MainApp', params: { screen: 'Tickets' } }],
    })
  }

  const calculateTotal = () => {
    if (!currentPackage) return 0
    let total = currentPackage.price
    if (promoCode === "SUBA2024") total = total * 0.9
    return total
  }

  const getCategoryLabel = (category: string): string => {
    switch (category) {
      case 'single': return 'Uso único'
      case 'multi': return 'Múltiples usos'
      case 'time_based': return 'Por tiempo'
      default: return category
    }
  }

  const formatDuration = (minutes: number): string => {
    if (minutes < 60) return `${minutes} min`
    if (minutes < 1440) return `${Math.floor(minutes / 60)} horas`
    return `${Math.floor(minutes / 1440)} días`
  }

  const PackageCard = ({ pkg }: { pkg: TicketType }) => {
    const isSelected = selectedPackage === pkg._id
    const isPopular = pkg.category === 'multi'
    return (
      <TouchableOpacity
        activeOpacity={0.9}
        style={[
          styles.packageCard,
          { width: cardWidth, borderLeftColor: pkg.color, borderLeftWidth: 4 },
          isSelected && styles.packageCardSelected,
          {
            transform: [{ scale: isSelected ? 1 : 0.96 }],
            shadowOpacity: isSelected ? 0.12 : 0.06,
            elevation: isSelected ? 6 : 2,
          },
        ]}
        onPress={() => setSelectedPackage(pkg._id)}
      >
      {isPopular && (
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
            usdAmount={pkg.price}
            size="md"
          />
        </View>
      </View>

      <View style={styles.packageFeatures}>
        <View style={styles.featureRow}>
          <Ionicons name="checkmark-circle-outline" size={16} color={COLORS.success} />
          <Text style={styles.featureText}>
            {pkg.category === 'single' 
              ? '1 viaje' 
              : pkg.category === 'multi' && pkg.usageLimit 
                ? `${pkg.usageLimit} viajes` 
                : 'Viajes ilimitados'}
          </Text>
        </View>

        <View style={styles.featureRow}>
          <Ionicons name="layers-outline" size={16} color={COLORS.success} />
          <Text style={styles.featureText}>{getCategoryLabel(pkg.category)}</Text>
        </View>

        {pkg.durationMinutes && (
          <View style={styles.featureRow}>
            <Ionicons name="time-outline" size={16} color={COLORS.success} />
            <Text style={styles.featureText}>Válido por {formatDuration(pkg.durationMinutes)}</Text>
          </View>
        )}
      </View>

      <View style={[styles.selectIndicator, isSelected && styles.selectIndicatorActive]}>
        <Ionicons
          name={isSelected ? "radio-button-on" : "radio-button-off"}
          size={24}
          color={isSelected ? COLORS.primary : COLORS.textTertiary}
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
          {isLoadingTypes ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={COLORS.primary} />
              <Text style={styles.loadingText}>Cargando tipos de ticket...</Text>
            </View>
          ) : availableTicketTypes.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="ticket-outline" size={48} color={COLORS.textTertiary} />
              <Text style={styles.emptyText}>No hay tipos de ticket disponibles</Text>
            </View>
          ) : (
            <FlatList
              data={availableTicketTypes}
              keyExtractor={(item) => item._id}
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
                const target = ticketTypesToShow[index]
                if (target && target._id !== selectedPackage) setSelectedPackage(target._id)
              }}
            />
          )}
          
          {/* Fallback notice */}
          {useFallback && (
            <View style={styles.fallbackNotice}>
              <Ionicons name="information-circle-outline" size={16} color={COLORS.warning} />
              <Text style={styles.fallbackNoticeText}>
                Mostrando opciones de ejemplo. Conecta con el servidor para comprar.
              </Text>
            </View>
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
              {currentPackage?.name || 'Selecciona un paquete'}
            </Text>
            <CurrencyDisplay
              usdAmount={currentPackage?.price || 0}
              size="sm"
            />
          </View>

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

        <Button title="Cancelar" variant="outline" size="lg" style={styles.cancelButton} onPress={() => navigation.goBack()} />
      </ScrollView>

      {/* Success Modal */}
      <Modal
        visible={showSuccessModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowSuccessModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalIconContainer}>
              <Ionicons name="checkmark-circle" size={80} color={COLORS.success} />
            </View>
            <Text style={styles.modalTitle}>¡Felicidades!</Text>
            <Text style={styles.modalMessage}>
              Tu ticket "{purchasedTicketName}" ha sido comprado exitosamente.
            </Text>
            <Text style={styles.modalSubtext}>
              Ya puedes ver tu código QR en la sección de tickets.
            </Text>
            <Button
              title="Ver mis tickets"
              variant="primary"
              size="lg"
              onPress={handleGoToTickets}
              style={styles.modalButton}
            />
            <TouchableOpacity 
              style={styles.modalSecondaryButton}
              onPress={() => {
                setShowSuccessModal(false)
                navigation.goBack()
              }}
            >
              <Text style={styles.modalSecondaryText}>Comprar otro</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.xl,
  },
  loadingText: {
    ...TEXT_STYLES.body,
    color: COLORS.textSecondary,
    marginTop: SPACING.md,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.xl,
  },
  emptyText: {
    ...TEXT_STYLES.body,
    color: COLORS.textSecondary,
    marginTop: SPACING.md,
    textAlign: 'center',
  },
  fallbackNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.warning + '20',
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    marginTop: SPACING.md,
    gap: SPACING.sm,
  },
  fallbackNoticeText: {
    ...TEXT_STYLES.caption,
    color: COLORS.warning,
    flex: 1,
  },
  // Success Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.lg,
  },
  modalContent: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.xl,
    padding: SPACING.xl,
    width: '100%',
    maxWidth: 340,
    alignItems: 'center',
  },
  modalIconContainer: {
    marginBottom: SPACING.lg,
  },
  modalTitle: {
    ...TEXT_STYLES.h2,
    color: COLORS.text,
    marginBottom: SPACING.sm,
    textAlign: 'center',
  },
  modalMessage: {
    ...TEXT_STYLES.body,
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: SPACING.xs,
  },
  modalSubtext: {
    ...TEXT_STYLES.bodySm,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING.xl,
  },
  modalButton: {
    width: '100%',
    marginBottom: SPACING.md,
  },
  modalSecondaryButton: {
    paddingVertical: SPACING.sm,
  },
  modalSecondaryText: {
    ...TEXT_STYLES.body,
    color: COLORS.primary,
    fontWeight: '600',
  },
})
