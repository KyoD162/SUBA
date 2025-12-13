import React, { useState } from 'react'
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { COLORS, SPACING, RADIUS, TEXT_STYLES } from '../../theme'

export default function CargarPasajeroScreen({ navigation }: any) {
  const [scanned, setScanned] = useState(false)

  const handleBarCodeScanned = ({ type, data }: any) => {
    setScanned(true)
    Alert.alert(
      'Ticket Escaneado',
      `Código: ${data}`,
      [
        {
          text: 'Cancelar',
          onPress: () => setScanned(false),
          style: 'cancel'
        },
        {
          text: 'Confirmar',
          onPress: () => {
            // Aquí iría la lógica para validar y cargar el pasajero
            navigation.goBack()
          }
        }
      ]
    )
  }

  const handleManualLoad = () => {
    Alert.alert(
      'Carga Manual',
      'Ingrese el código del ticket manualmente',
      [
        {
          text: 'Cancelar',
          style: 'cancel'
        },
        {
          text: 'Ingresar Código',
          onPress: () => {
            // Aquí iría la navegación a una pantalla de input manual
            navigation.goBack()
          }
        }
      ]
    )
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => navigation.goBack()}
          accessibilityRole="button"
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Cargar Pasajero</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Camera/Scanner Area */}
      <View style={styles.content}>
        <Text style={styles.instructionText}>Escanear ticket QR</Text>
        
        <View style={styles.scannerContainer}>
          {/* Placeholder para la cámara - aquí iría el componente de cámara real */}
          <View style={styles.scannerPlaceholder}>
            <View style={styles.scanFrame}>
              <View style={[styles.corner, styles.cornerTopLeft]} />
              <View style={[styles.corner, styles.cornerTopRight]} />
              <View style={[styles.corner, styles.cornerBottomLeft]} />
              <View style={[styles.corner, styles.cornerBottomRight]} />
              
              <Ionicons name="qr-code-outline" size={80} color={COLORS.primary} />
            </View>
            
            <View style={styles.scanOverlay}>
              <Text style={styles.scanText}>Alinea el código QR dentro del marco</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Bottom section with manual button and instructions */}
      <View style={styles.bottomSection}>
        {/* Manual Load Button */}
        <TouchableOpacity 
          style={styles.manualButton}
          onPress={handleManualLoad}
          accessibilityRole="button"
        >
          <Ionicons name="keypad-outline" size={20} color={COLORS.primary} />
          <Text style={styles.manualButtonText}>Cargar Manualmente</Text>
        </TouchableOpacity>

        {/* Instructions */}
        <View style={styles.instructions}>
          <View style={styles.instructionItem}>
            <Ionicons name="scan-outline" size={20} color={COLORS.textSecondary} />
            <Text style={styles.instructionItemText}>Escanea el código QR del ticket</Text>
          </View>
          <View style={styles.instructionItem}>
            <Ionicons name="checkmark-circle-outline" size={20} color={COLORS.textSecondary} />
            <Text style={styles.instructionItemText}>Confirma la validez del ticket</Text>
          </View>
          <View style={styles.instructionItem}>
            <Ionicons name="people-outline" size={20} color={COLORS.textSecondary} />
            <Text style={styles.instructionItemText}>El pasajero será agregado automáticamente</Text>
          </View>
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
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    ...TEXT_STYLES.h3,
    color: COLORS.text,
    fontWeight: '700',
  },
  content: {
    flex: 1,
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.xl,
    paddingBottom: SPACING.md,
  },
  instructionText: {
    ...TEXT_STYLES.h3,
    color: COLORS.text,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  scannerContainer: {
    flex: 1,
  },
  scannerPlaceholder: {
    flex: 1,
    backgroundColor: COLORS.surfaceAlt ?? COLORS.background,
    borderRadius: RADIUS.xl,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.border,
  },
  scanFrame: {
    width: '70%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  corner: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderColor: COLORS.primary,
  },
  cornerTopLeft: {
    top: 0,
    left: 0,
    borderTopWidth: 4,
    borderLeftWidth: 4,
    borderTopLeftRadius: RADIUS.md,
  },
  cornerTopRight: {
    top: 0,
    right: 0,
    borderTopWidth: 4,
    borderRightWidth: 4,
    borderTopRightRadius: RADIUS.md,
  },
  cornerBottomLeft: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
    borderBottomLeftRadius: RADIUS.md,
  },
  cornerBottomRight: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderBottomRightRadius: RADIUS.md,
  },
  scanOverlay: {
    position: 'absolute',
    bottom: SPACING.xl,
    left: SPACING.lg,
    right: SPACING.lg,
  },
  scanText: {
    ...TEXT_STYLES.bodySm,
    color: COLORS.textSecondary,
    textAlign: 'center',
    fontWeight: '500',
  },
  bottomSection: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.lg,
    gap: SPACING.md,
  },
  manualButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    backgroundColor: COLORS.surface,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.full,
    borderWidth: 2,
    borderColor: COLORS.primary,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  manualButtonText: {
    ...TEXT_STYLES.body,
    color: COLORS.primary,
    fontWeight: '700',
  },
  instructions: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    gap: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  instructionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  instructionItemText: {
    ...TEXT_STYLES.bodySm,
    color: COLORS.textSecondary,
    flex: 1,
  },
})
