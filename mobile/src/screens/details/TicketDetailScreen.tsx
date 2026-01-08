import React, { useState, useEffect } from "react"
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Dimensions,
  Share,
  ActivityIndicator
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { Ionicons } from "@expo/vector-icons"
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native"
import type { NativeStackNavigationProp } from "@react-navigation/native-stack"
import QRCode from "react-native-qrcode-svg"
import { COLORS, SPACING, RADIUS, TEXT_STYLES } from "../../theme"
import { Card, Button, Badge } from "../../components"
import { useTickets, ActivePass } from "../../navigation/TicketsContext"
import type { RootStackParamList } from "../../navigation/types"
import { getTicketDetail } from "../../services/tickets"

type NavigationProp = NativeStackNavigationProp<RootStackParamList>
type RouteParams = RouteProp<RootStackParamList, 'TicketDetail'>

const screenWidth = Dimensions.get("window").width
const qrSize = screenWidth - SPACING.lg * 4

const getStatusConfig = (status: string) => {
  switch (status) {
    case 'active':
      return { label: 'Activo', variant: 'success' as const, icon: 'checkmark-circle' as const }
    case 'used':
      return { label: 'Utilizado', variant: 'secondary' as const, icon: 'checkmark-done' as const }
    case 'expired':
      return { label: 'Expirado', variant: 'danger' as const, icon: 'close-circle' as const }
    case 'cancelled':
      return { label: 'Cancelado', variant: 'danger' as const, icon: 'ban' as const }
    default:
      return { label: status, variant: 'secondary' as const, icon: 'help-circle' as const }
  }
}

const getCategoryLabel = (category: string): string => {
  switch (category) {
    case 'single':
      return 'Uso único'
    case 'multi':
      return 'Múltiples usos'
    case 'time_based':
      return 'Por tiempo'
    default:
      return category
  }
}

export default function TicketDetailScreen() {
  const navigation = useNavigation<NavigationProp>()
  const route = useRoute<RouteParams>()
  const { ticketId } = route.params
  const { tickets } = useTickets()
  
  const [ticket, setTicket] = useState<ActivePass | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadTicket()
  }, [ticketId])

  const loadTicket = async () => {
    setLoading(true)
    setError(null)
    
    // First check if ticket is already in context
    const localTicket = tickets.find(t => t.id === ticketId)
    if (localTicket) {
      setTicket(localTicket)
      setLoading(false)
      return
    }
    
    // Otherwise fetch from API
    try {
      const ticketData = await getTicketDetail(ticketId)
      setTicket({
        id: ticketData.id,
        type: ticketData.name,
        ticketNumber: ticketData.ticketNumber,
        qrCode: ticketData.qrCode,
        qrData: ticketData.qrData,
        validUntil: ticketData.expiresAt ? new Date(ticketData.expiresAt).toLocaleDateString('es-ES') : undefined,
        tripsRemaining: ticketData.remainingUses,
        status: ticketData.status as any,
        color: ticketData.color,
        category: ticketData.category,
        timeRemaining: ticketData.timeRemaining,
        purchasedAt: ticketData.purchasedAt
      })
    } catch (err: any) {
      setError(err.message || 'Error al cargar ticket')
    } finally {
      setLoading(false)
    }
  }

  const handleShare = async () => {
    if (!ticket) return
    
    try {
      await Share.share({
        message: `Mi ticket SUBA: ${ticket.ticketNumber}\nTipo: ${ticket.type}\nEstado: ${getStatusConfig(ticket.status).label}`,
        title: 'Mi Ticket SUBA'
      })
    } catch (error) {
      console.error('Error sharing:', error)
    }
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={COLORS.text} />
          </TouchableOpacity>
          <Text style={styles.title}>Detalle del Ticket</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Cargando ticket...</Text>
        </View>
      </SafeAreaView>
    )
  }

  if (error || !ticket) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={COLORS.text} />
          </TouchableOpacity>
          <Text style={styles.title}>Detalle del Ticket</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={64} color={COLORS.danger} />
          <Text style={styles.errorTitle}>Error</Text>
          <Text style={styles.errorText}>{error || 'Ticket no encontrado'}</Text>
          <Button title="Reintentar" onPress={loadTicket} style={{ marginTop: SPACING.md }} />
        </View>
      </SafeAreaView>
    )
  }

  const statusConfig = getStatusConfig(ticket.status)
  const isActive = ticket.status === 'active'

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Detalle del Ticket</Text>
        <TouchableOpacity onPress={handleShare} style={styles.shareButton}>
          <Ionicons name="share-social-outline" size={24} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Main Ticket Card */}
        <Card style={StyleSheet.flatten([styles.ticketCard, { borderTopColor: ticket.color, borderTopWidth: 4 }])}>
          {/* Ticket Header */}
          <View style={styles.ticketHeader}>
            <View>
              <Text style={styles.ticketType}>{ticket.type}</Text>
              <Text style={styles.ticketNumber}>{ticket.ticketNumber}</Text>
            </View>
            <Badge 
              label={statusConfig.label}
              variant={statusConfig.variant}
            />
          </View>

          {/* QR Code */}
          <View style={styles.qrContainer}>
            <View style={[
              styles.qrWrapper, 
              !isActive && styles.qrDisabled
            ]}>
              <QRCode
                value={ticket.qrData}
                size={qrSize}
                color={isActive ? COLORS.text : COLORS.textTertiary}
                backgroundColor={COLORS.surface}
              />
              {!isActive && (
                <View style={styles.qrOverlay}>
                  <Ionicons 
                    name={statusConfig.icon} 
                    size={64} 
                    color={COLORS.danger} 
                  />
                  <Text style={styles.qrOverlayText}>{statusConfig.label}</Text>
                </View>
              )}
            </View>
            <Text style={styles.qrHint}>
              {isActive 
                ? "Muestra este código al conductor para validar tu viaje"
                : "Este ticket ya no puede ser utilizado"
              }
            </Text>
          </View>

          {/* Ticket Stats */}
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Ionicons name="navigate-outline" size={20} color={ticket.color} />
              <Text style={styles.statLabel}>Viajes</Text>
              <Text style={styles.statValue}>
                {ticket.tripsRemaining === 'unlimited' ? '∞' : ticket.tripsRemaining}
              </Text>
            </View>
            
            <View style={styles.statDivider} />
            
            <View style={styles.statItem}>
              <Ionicons name="layers-outline" size={20} color={ticket.color} />
              <Text style={styles.statLabel}>Tipo</Text>
              <Text style={styles.statValue}>{getCategoryLabel(ticket.category)}</Text>
            </View>
            
            <View style={styles.statDivider} />
            
            <View style={styles.statItem}>
              <Ionicons name="time-outline" size={20} color={ticket.color} />
              <Text style={styles.statLabel}>Válido hasta</Text>
              <Text style={styles.statValue}>{ticket.validUntil || '—'}</Text>
            </View>
          </View>

          {/* Time Remaining for time-based tickets */}
          {ticket.category === 'time_based' && ticket.timeRemaining !== null && (
            <View style={[styles.timeRemainingBanner, { backgroundColor: `${ticket.color}15` }]}>
              <Ionicons name="timer-outline" size={24} color={ticket.color} />
              <View style={styles.timeRemainingText}>
                <Text style={styles.timeRemainingLabel}>Tiempo restante</Text>
                <Text style={[styles.timeRemainingValue, { color: ticket.color }]}>
                  {ticket.timeRemaining > 60 
                    ? `${Math.floor(ticket.timeRemaining / 60)}h ${ticket.timeRemaining % 60}m`
                    : `${ticket.timeRemaining} minutos`
                  }
                </Text>
              </View>
            </View>
          )}
        </Card>

        {/* Info Card */}
        <Card style={styles.infoCard}>
          <Text style={styles.infoTitle}>Información del Ticket</Text>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Fecha de compra</Text>
            <Text style={styles.infoValue}>
              {new Date(ticket.purchasedAt).toLocaleDateString('es-ES', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Código QR</Text>
            <Text style={styles.infoValue}>{ticket.qrCode.substring(0, 16)}...</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>ID del Ticket</Text>
            <Text style={styles.infoValue}>{ticket.id}</Text>
          </View>
        </Card>

        {/* Instructions */}
        <Card style={styles.instructionsCard}>
          <Text style={styles.instructionsTitle}>¿Cómo usar tu ticket?</Text>
          
          <View style={styles.instructionStep}>
            <View style={[styles.stepNumber, { backgroundColor: ticket.color }]}>
              <Text style={styles.stepNumberText}>1</Text>
            </View>
            <Text style={styles.stepText}>Sube al autobús de la ruta SUBA</Text>
          </View>
          
          <View style={styles.instructionStep}>
            <View style={[styles.stepNumber, { backgroundColor: ticket.color }]}>
              <Text style={styles.stepNumberText}>2</Text>
            </View>
            <Text style={styles.stepText}>Muestra el código QR al conductor</Text>
          </View>
          
          <View style={styles.instructionStep}>
            <View style={[styles.stepNumber, { backgroundColor: ticket.color }]}>
              <Text style={styles.stepNumberText}>3</Text>
            </View>
            <Text style={styles.stepText}>El conductor escaneará y validará tu ticket</Text>
          </View>
        </Card>

        <View style={styles.bottomPadding} />
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backButton: {
    padding: SPACING.xs,
  },
  shareButton: {
    padding: SPACING.xs,
  },
  title: {
    ...TEXT_STYLES.h3,
    color: COLORS.text,
  },
  placeholder: {
    width: 32,
  },
  scrollContent: {
    padding: SPACING.md,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    ...TEXT_STYLES.body,
    color: COLORS.textSecondary,
    marginTop: SPACING.md,
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.xl,
  },
  errorTitle: {
    ...TEXT_STYLES.h3,
    color: COLORS.danger,
    marginTop: SPACING.md,
  },
  errorText: {
    ...TEXT_STYLES.body,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: SPACING.xs,
  },
  ticketCard: {
    marginBottom: SPACING.md,
  },
  ticketHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.lg,
  },
  ticketType: {
    ...TEXT_STYLES.h3,
    color: COLORS.text,
  },
  ticketNumber: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  qrContainer: {
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  qrWrapper: {
    padding: SPACING.lg,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    position: 'relative',
  },
  qrDisabled: {
    opacity: 0.5,
  },
  qrOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: RADIUS.lg,
  },
  qrOverlayText: {
    ...TEXT_STYLES.subtitle,
    color: COLORS.danger,
    marginTop: SPACING.xs,
  },
  qrHint: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: SPACING.md,
    paddingHorizontal: SPACING.lg,
  },
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statLabel: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  statValue: {
    ...TEXT_STYLES.body,
    fontWeight: '600',
    color: COLORS.text,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: COLORS.border,
  },
  timeRemainingBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    marginTop: SPACING.md,
    gap: SPACING.sm,
  },
  timeRemainingText: {
    flex: 1,
  },
  timeRemainingLabel: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
  },
  timeRemainingValue: {
    ...TEXT_STYLES.subtitle,
  },
  infoCard: {
    marginBottom: SPACING.md,
  },
  infoTitle: {
    ...TEXT_STYLES.subtitle,
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  infoLabel: {
    ...TEXT_STYLES.body,
    color: COLORS.textSecondary,
  },
  infoValue: {
    ...TEXT_STYLES.body,
    color: COLORS.text,
    flex: 1,
    textAlign: 'right',
  },
  instructionsCard: {
    marginBottom: SPACING.md,
  },
  instructionsTitle: {
    ...TEXT_STYLES.subtitle,
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  instructionStep: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
    gap: SPACING.sm,
  },
  stepNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumberText: {
    ...TEXT_STYLES.body,
    fontWeight: '600',
    color: COLORS.surface,
  },
  stepText: {
    ...TEXT_STYLES.body,
    color: COLORS.text,
    flex: 1,
  },
  bottomPadding: {
    height: SPACING.xl,
  },
})
