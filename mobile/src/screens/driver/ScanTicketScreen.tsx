import React, { useState, useEffect } from "react"
import { 
  View, 
  Text, 
  StyleSheet, 
  Alert,
  Vibration,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { Ionicons } from "@expo/vector-icons"
import { Camera, CameraView, BarcodeScanningResult } from "expo-camera"
import { COLORS, SPACING, RADIUS, TEXT_STYLES } from "../../theme"
import { Card } from "../../components/Card"
import { Button } from "../../components/Button"
import { Badge } from "../../components/Badge"
import { validateTicket, redeemTicket, ValidateTicketResponse } from "../../services/tickets"

type ScanMode = 'scanning' | 'validating' | 'result'

interface ScanResult {
  valid: boolean
  ticket?: ValidateTicketResponse['ticket']
  error?: string
}

export default function ScanTicketScreen() {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null)
  const [mode, setMode] = useState<ScanMode>('scanning')
  const [scanResult, setScanResult] = useState<ScanResult | null>(null)
  const [lastScannedQR, setLastScannedQR] = useState<string | null>(null)
  const [isRedeeming, setIsRedeeming] = useState(false)
  const [scansToday, setScansToday] = useState(0)

  useEffect(() => {
    requestCameraPermission()
  }, [])

  const requestCameraPermission = async () => {
    const { status } = await Camera.requestCameraPermissionsAsync()
    setHasPermission(status === 'granted')
  }

  const handleBarCodeScanned = async ({ data }: BarcodeScanningResult) => {
    // Prevent multiple scans of the same QR
    if (mode !== 'scanning' || data === lastScannedQR) return
    
    setLastScannedQR(data)
    setMode('validating')
    Vibration.vibrate(100)

    try {
      // Parse QR data
      let qrCode: string
      try {
        const parsed = JSON.parse(data)
        qrCode = parsed.qrCode
      } catch {
        // If not JSON, treat as raw QR code
        qrCode = data
      }

      // Validate the ticket
      const result = await validateTicket(qrCode)
      
      setScanResult({
        valid: result.valid,
        ticket: result.ticket,
        error: result.error
      })
      setMode('result')
    } catch (error: any) {
      setScanResult({
        valid: false,
        error: error.message || 'Error al validar ticket'
      })
      setMode('result')
    }
  }

  const handleRedeem = async () => {
    if (!scanResult?.ticket || !lastScannedQR) return

    setIsRedeeming(true)
    try {
      let qrCode: string
      try {
        const parsed = JSON.parse(lastScannedQR)
        qrCode = parsed.qrCode
      } catch {
        qrCode = lastScannedQR
      }

      await redeemTicket({ qrCode })
      
      Vibration.vibrate([100, 100, 100])
      setScansToday(prev => prev + 1)
      
      Alert.alert(
        '✅ Ticket Canjeado',
        `${scanResult.ticket.name}\nPasajero puede abordar.`,
        [{ text: 'OK', onPress: resetScanner }]
      )
    } catch (error: any) {
      Alert.alert('Error', error.message || 'No se pudo canjear el ticket')
    } finally {
      setIsRedeeming(false)
    }
  }

  const resetScanner = () => {
    setMode('scanning')
    setScanResult(null)
    setLastScannedQR(null)
  }

  if (hasPermission === null) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Solicitando permiso de cámara...</Text>
        </View>
      </SafeAreaView>
    )
  }

  if (hasPermission === false) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <View style={styles.centerContent}>
          <Ionicons name="camera-outline" size={64} color={COLORS.textTertiary} />
          <Text style={styles.errorTitle}>Permiso de cámara requerido</Text>
          <Text style={styles.errorText}>
            Para escanear tickets, necesitamos acceso a la cámara.
          </Text>
          <Button 
            title="Solicitar permiso" 
            onPress={requestCameraPermission}
            style={{ marginTop: SPACING.md }}
          />
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Escanear Ticket</Text>
        <View style={styles.statsContainer}>
          <Ionicons name="checkmark-circle" size={18} color={COLORS.success} />
          <Text style={styles.statsText}>{scansToday} hoy</Text>
        </View>
      </View>

      {mode === 'scanning' && (
        <View style={styles.scannerContainer}>
          <CameraView
            style={styles.camera}
            facing="back"
            barcodeScannerSettings={{
              barcodeTypes: ['qr'],
            }}
            onBarcodeScanned={handleBarCodeScanned}
          >
            <View style={styles.overlay}>
              <View style={styles.scanArea}>
                <View style={[styles.corner, styles.topLeft]} />
                <View style={[styles.corner, styles.topRight]} />
                <View style={[styles.corner, styles.bottomLeft]} />
                <View style={[styles.corner, styles.bottomRight]} />
              </View>
              <Text style={styles.scanHint}>
                Apunta al código QR del ticket
              </Text>
            </View>
          </CameraView>
        </View>
      )}

      {mode === 'validating' && (
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Validando ticket...</Text>
        </View>
      )}

      {mode === 'result' && scanResult && (
        <ScrollView contentContainerStyle={styles.resultContainer}>
          <Card style={StyleSheet.flatten([
            styles.resultCard,
            scanResult.valid ? styles.validCard : styles.invalidCard
          ])}>
            <View style={styles.resultHeader}>
              <Ionicons 
                name={scanResult.valid ? 'checkmark-circle' : 'close-circle'} 
                size={64} 
                color={scanResult.valid ? COLORS.success : COLORS.danger} 
              />
              <Text style={[
                styles.resultTitle,
                { color: scanResult.valid ? COLORS.success : COLORS.danger }
              ]}>
                {scanResult.valid ? 'Ticket Válido' : 'Ticket Inválido'}
              </Text>
            </View>

            {scanResult.ticket && (
              <View style={styles.ticketInfo}>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Ticket</Text>
                  <Text style={styles.infoValue}>{scanResult.ticket.ticketNumber}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Tipo</Text>
                  <Text style={styles.infoValue}>{scanResult.ticket.name}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Pasajero</Text>
                  <Text style={styles.infoValue}>{scanResult.ticket.user.name}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Viajes restantes</Text>
                  <Badge 
                    label={scanResult.ticket.remainingUses === 'unlimited' 
                      ? 'Ilimitado' 
                      : String(scanResult.ticket.remainingUses)
                    }
                    variant={scanResult.valid ? 'success' : 'secondary'}
                  />
                </View>
                {scanResult.ticket.timeRemaining !== null && (
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Tiempo restante</Text>
                    <Text style={styles.infoValue}>
                      {scanResult.ticket.timeRemaining > 60 
                        ? `${Math.floor(scanResult.ticket.timeRemaining / 60)}h ${scanResult.ticket.timeRemaining % 60}m`
                        : `${scanResult.ticket.timeRemaining} min`
                      }
                    </Text>
                  </View>
                )}
              </View>
            )}

            {scanResult.error && (
              <View style={styles.errorBanner}>
                <Ionicons name="alert-circle" size={20} color={COLORS.danger} />
                <Text style={styles.errorMessage}>{scanResult.error}</Text>
              </View>
            )}
          </Card>

          <View style={styles.actionButtons}>
            {scanResult.valid && (
              <Button
                title={isRedeeming ? "Procesando..." : "Canjear Ticket"}
                onPress={handleRedeem}
                disabled={isRedeeming}
                icon={<Ionicons name="checkmark-done" size={20} color={COLORS.surface} />}
                style={styles.redeemButton}
              />
            )}
            <Button
              title="Escanear otro"
              variant="outline"
              onPress={resetScanner}
              icon={<Ionicons name="scan-outline" size={20} color={COLORS.primary} />}
            />
          </View>
        </ScrollView>
      )}

      {/* Quick stats bar */}
      <View style={styles.quickStats}>
        <View style={styles.quickStatItem}>
          <Ionicons name="flash" size={20} color={COLORS.primary} />
          <Text style={styles.quickStatText}>Listo para escanear</Text>
        </View>
      </View>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  title: {
    ...TEXT_STYLES.h3,
    color: COLORS.text,
  },
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    backgroundColor: `${COLORS.success}15`,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.full,
  },
  statsText: {
    ...TEXT_STYLES.caption,
    color: COLORS.success,
    fontWeight: '600',
  },
  centerContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.xl,
  },
  loadingText: {
    ...TEXT_STYLES.body,
    color: COLORS.textSecondary,
    marginTop: SPACING.md,
  },
  errorTitle: {
    ...TEXT_STYLES.h3,
    color: COLORS.text,
    marginTop: SPACING.md,
  },
  errorText: {
    ...TEXT_STYLES.body,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: SPACING.xs,
  },
  scannerContainer: {
    flex: 1,
    overflow: 'hidden',
  },
  camera: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scanArea: {
    width: 250,
    height: 250,
    backgroundColor: 'transparent',
    position: 'relative',
  },
  corner: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderColor: COLORS.primary,
    borderWidth: 4,
  },
  topLeft: {
    top: 0,
    left: 0,
    borderRightWidth: 0,
    borderBottomWidth: 0,
    borderTopLeftRadius: RADIUS.md,
  },
  topRight: {
    top: 0,
    right: 0,
    borderLeftWidth: 0,
    borderBottomWidth: 0,
    borderTopRightRadius: RADIUS.md,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderRightWidth: 0,
    borderTopWidth: 0,
    borderBottomLeftRadius: RADIUS.md,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    borderBottomRightRadius: RADIUS.md,
  },
  scanHint: {
    ...TEXT_STYLES.body,
    color: COLORS.surface,
    marginTop: SPACING.xl,
    textAlign: 'center',
  },
  resultContainer: {
    padding: SPACING.md,
    flexGrow: 1,
  },
  resultCard: {
    marginBottom: SPACING.md,
  },
  validCard: {
    borderColor: COLORS.success,
    borderWidth: 2,
  },
  invalidCard: {
    borderColor: COLORS.danger,
    borderWidth: 2,
  },
  resultHeader: {
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  resultTitle: {
    ...TEXT_STYLES.h2,
    marginTop: SPACING.sm,
  },
  ticketInfo: {
    gap: SPACING.sm,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
    fontWeight: '600',
    color: COLORS.text,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    backgroundColor: `${COLORS.danger}15`,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    marginTop: SPACING.md,
  },
  errorMessage: {
    ...TEXT_STYLES.body,
    color: COLORS.danger,
    flex: 1,
  },
  actionButtons: {
    gap: SPACING.md,
  },
  redeemButton: {
    backgroundColor: COLORS.success,
  },
  quickStats: {
    flexDirection: 'row',
    justifyContent: 'center',
    padding: SPACING.md,
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  quickStatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  quickStatText: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
  },
})
