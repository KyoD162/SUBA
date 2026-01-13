import React, { useState, useEffect, useCallback } from "react"
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Alert,
  ActivityIndicator,
  RefreshControl,
  Modal,
  TextInput,
  Switch
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { Ionicons } from "@expo/vector-icons"
import { COLORS, SPACING, RADIUS, TEXT_STYLES } from "../../theme"
import AdminHeader from "../../components/AdminHeader"
import { Card } from "../../components/Card"
import { Button } from "../../components/Button"
import { Badge } from "../../components/Badge"
import { 
  TicketType, 
  getTicketTypes, 
  createTicketType, 
  updateTicketType, 
  deleteTicketType,
  getTicketStats,
  TicketStats
} from "../../services/tickets"

type TicketTypeCategory = 'single' | 'multi' | 'time_based'

const CATEGORY_OPTIONS = [
  { label: 'Uso único', value: 'single' },
  { label: 'Múltiples usos', value: 'multi' },
  { label: 'Por tiempo', value: 'time_based' },
]

const COLOR_OPTIONS = [
  '#0891B2', // Cyan
  '#059669', // Green
  '#7C3AED', // Purple
  '#DC2626', // Red
  '#EA580C', // Orange
  '#2563EB', // Blue
  '#DB2777', // Pink
]

const getCategoryIcon = (category: string): keyof typeof Ionicons.glyphMap => {
  switch (category) {
    case 'single': return 'ticket-outline'
    case 'multi': return 'layers-outline'
    case 'time_based': return 'time-outline'
    default: return 'ticket-outline'
  }
}

const getCategoryLabel = (category: string): string => {
  switch (category) {
    case 'single': return 'Uso único'
    case 'multi': return 'Múltiples usos'
    case 'time_based': return 'Por tiempo'
    default: return category
  }
}

interface TicketTypeFormData {
  name: string
  description: string
  category: TicketTypeCategory
  price: string
  usageLimit: string
  durationMinutes: string
  color: string
  isActive: boolean
}

const initialFormData: TicketTypeFormData = {
  name: '',
  description: '',
  category: 'single',
  price: '',
  usageLimit: '',
  durationMinutes: '',
  color: COLOR_OPTIONS[0],
  isActive: true,
}

export default function TicketTypesScreen() {
  const [ticketTypes, setTicketTypes] = useState<TicketType[]>([])
  const [stats, setStats] = useState<TicketStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [modalVisible, setModalVisible] = useState(false)
  const [editingType, setEditingType] = useState<TicketType | null>(null)
  const [formData, setFormData] = useState<TicketTypeFormData>(initialFormData)
  const [saving, setSaving] = useState(false)

  const loadData = useCallback(async () => {
    try {
      // Load ticket types - this should always work
      const types = await getTicketTypes(false)
      setTicketTypes(types)
      
      // Try to load stats separately (may fail if no tickets exist)
      try {
        const statsData = await getTicketStats()
        setStats(statsData)
      } catch (statsError) {
        console.log('Stats not available yet:', statsError)
        // Set default stats when none exist
        setStats({
          totalTickets: 0,
          activeTickets: 0,
          usedTickets: 0,
          expiredTickets: 0,
          totalRevenue: 0,
          ticketsByCategory: {}
        })
      }
    } catch (error) {
      console.error('Error loading data:', error)
      Alert.alert('Error', 'No se pudieron cargar los tipos de tickets')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  const onRefresh = async () => {
    setRefreshing(true)
    await loadData()
    setRefreshing(false)
  }

  const openCreateModal = () => {
    setEditingType(null)
    setFormData(initialFormData)
    setModalVisible(true)
  }

  const openEditModal = (ticketType: TicketType) => {
    setEditingType(ticketType)
    setFormData({
      name: ticketType.name,
      description: ticketType.description,
      category: ticketType.category,
      price: ticketType.price.toString(),
      usageLimit: ticketType.usageLimit?.toString() || '',
      durationMinutes: ticketType.durationMinutes?.toString() || '',
      color: ticketType.color,
      isActive: ticketType.isActive,
    })
    setModalVisible(true)
  }

  const handleSave = async () => {
    // Validation
    if (!formData.name.trim()) {
      Alert.alert('Error', 'El nombre es requerido')
      return
    }
    if (!formData.description.trim()) {
      Alert.alert('Error', 'La descripción es requerida')
      return
    }
    if (!formData.price || parseFloat(formData.price) <= 0) {
      Alert.alert('Error', 'El precio debe ser mayor a 0')
      return
    }
    if (formData.category === 'multi' && (!formData.usageLimit || parseInt(formData.usageLimit) < 2)) {
      Alert.alert('Error', 'Los tickets multi-uso requieren al menos 2 usos')
      return
    }
    if (formData.category === 'time_based' && (!formData.durationMinutes || parseInt(formData.durationMinutes) < 1)) {
      Alert.alert('Error', 'Los tickets por tiempo requieren duración en minutos')
      return
    }

    setSaving(true)
    try {
      const data = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        category: formData.category,
        price: parseFloat(formData.price),
        usageLimit: formData.category === 'multi' ? parseInt(formData.usageLimit) : null,
        durationMinutes: formData.category === 'time_based' ? parseInt(formData.durationMinutes) : null,
        color: formData.color,
        isActive: formData.isActive,
      }

      if (editingType) {
        await updateTicketType(editingType._id, data)
        Alert.alert('Éxito', 'Tipo de ticket actualizado')
      } else {
        await createTicketType(data as any)
        Alert.alert('Éxito', 'Tipo de ticket creado')
      }
      
      setModalVisible(false)
      loadData()
    } catch (error: any) {
      Alert.alert('Error', error.message || 'No se pudo guardar')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = (ticketType: TicketType) => {
    Alert.alert(
      'Eliminar Tipo de Ticket',
      `¿Estás seguro de eliminar "${ticketType.name}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Eliminar', 
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteTicketType(ticketType._id)
              Alert.alert('Éxito', 'Tipo de ticket eliminado')
              loadData()
            } catch (error: any) {
              Alert.alert('Error', error.message || 'No se pudo eliminar')
            }
          }
        }
      ]
    )
  }

  const handleToggleActive = async (ticketType: TicketType) => {
    try {
      await updateTicketType(ticketType._id, { isActive: !ticketType.isActive })
      loadData()
    } catch (error: any) {
      Alert.alert('Error', error.message || 'No se pudo actualizar')
    }
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <AdminHeader name="Administrador" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <AdminHeader name="Administrador" />
      
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />
        }
      >
        {/* Section Title */}
        <Text style={styles.sectionTitle}>Tipos de Tickets</Text>
        
        {/* Stats Cards */}
        {stats && (
          <View style={styles.statsRow}>
            <Card style={styles.statCard}>
              <Ionicons name="ticket-outline" size={24} color={COLORS.primary} />
              <Text style={styles.statValue}>{stats.totalTickets}</Text>
              <Text style={styles.statLabel}>Total Vendidos</Text>
            </Card>
            <Card style={styles.statCard}>
              <Ionicons name="checkmark-circle-outline" size={24} color={COLORS.success} />
              <Text style={styles.statValue}>{stats.activeTickets}</Text>
              <Text style={styles.statLabel}>Activos</Text>
            </Card>
            <Card style={styles.statCard}>
              <Ionicons name="cash-outline" size={24} color={COLORS.warning} />
              <Text style={styles.statValue}>${stats.totalRevenue.toFixed(0)}</Text>
              <Text style={styles.statLabel}>Ingresos</Text>
            </Card>
          </View>
        )}

        {/* Add Button */}
        <Button
          title="Agregar Tipo de Ticket"
          onPress={openCreateModal}
          icon={<Ionicons name="add-circle-outline" size={20} color={COLORS.surface} />}
          style={styles.addButton}
        />

        {/* Ticket Types List */}
        {ticketTypes.length === 0 ? (
          <Card style={styles.emptyCard}>
            <Ionicons name="ticket-outline" size={48} color={COLORS.textTertiary} />
            <Text style={styles.emptyText}>No hay tipos de tickets configurados</Text>
            <Text style={styles.emptySubtext}>Crea tu primer tipo de ticket para comenzar</Text>
          </Card>
        ) : (
          ticketTypes.map(ticketType => (
            <Card 
              key={ticketType._id} 
              style={StyleSheet.flatten([
                styles.ticketTypeCard,
                { borderLeftColor: ticketType.color, borderLeftWidth: 4 },
                !ticketType.isActive && styles.inactiveCard
              ])}
            >
              <View style={styles.cardHeader}>
                <View style={[styles.iconContainer, { backgroundColor: `${ticketType.color}20` }]}>
                  <Ionicons name={getCategoryIcon(ticketType.category)} size={24} color={ticketType.color} />
                </View>
                <View style={styles.cardInfo}>
                  <Text style={styles.typeName}>{ticketType.name}</Text>
                  <View style={styles.badgeRow}>
                    <Badge 
                      label={getCategoryLabel(ticketType.category)} 
                      variant="info"
                    />
                    <Badge 
                      label={ticketType.isActive ? 'Activo' : 'Inactivo'} 
                      variant={ticketType.isActive ? 'success' : 'secondary'}
                    />
                  </View>
                </View>
                <Text style={[styles.price, { color: ticketType.color }]}>
                  ${ticketType.price.toFixed(2)}
                </Text>
              </View>

              <Text style={styles.description}>{ticketType.description}</Text>

              <View style={styles.detailsRow}>
                {ticketType.category === 'single' && (
                  <Text style={styles.detailText}>1 viaje</Text>
                )}
                {ticketType.category === 'multi' && ticketType.usageLimit && (
                  <Text style={styles.detailText}>{ticketType.usageLimit} viajes</Text>
                )}
                {ticketType.category === 'time_based' && ticketType.durationMinutes && (
                  <Text style={styles.detailText}>
                    {ticketType.durationMinutes >= 1440 
                      ? `${Math.floor(ticketType.durationMinutes / 1440)} días`
                      : ticketType.durationMinutes >= 60 
                        ? `${Math.floor(ticketType.durationMinutes / 60)} horas`
                        : `${ticketType.durationMinutes} minutos`
                    }
                  </Text>
                )}
              </View>

              <View style={styles.actionsRow}>
                <TouchableOpacity 
                  style={styles.actionButton} 
                  onPress={() => handleToggleActive(ticketType)}
                >
                  <Ionicons 
                    name={ticketType.isActive ? 'pause-circle-outline' : 'play-circle-outline'} 
                    size={22} 
                    color={ticketType.isActive ? COLORS.warning : COLORS.success} 
                  />
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.actionButton} 
                  onPress={() => openEditModal(ticketType)}
                >
                  <Ionicons name="create-outline" size={22} color={COLORS.primary} />
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.actionButton} 
                  onPress={() => handleDelete(ticketType)}
                >
                  <Ionicons name="trash-outline" size={22} color={COLORS.danger} />
                </TouchableOpacity>
              </View>
            </Card>
          ))
        )}
      </ScrollView>

      {/* Create/Edit Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editingType ? 'Editar Tipo de Ticket' : 'Nuevo Tipo de Ticket'}
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color={COLORS.text} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
              {/* Name */}
              <Text style={styles.inputLabel}>Nombre *</Text>
              <TextInput
                style={styles.textInput}
                value={formData.name}
                onChangeText={(text) => setFormData(prev => ({ ...prev, name: text }))}
                placeholder="Ej: Viaje Sencillo"
                placeholderTextColor={COLORS.textTertiary}
              />

              {/* Description */}
              <Text style={styles.inputLabel}>Descripción *</Text>
              <TextInput
                style={[styles.textInput, styles.textArea]}
                value={formData.description}
                onChangeText={(text) => setFormData(prev => ({ ...prev, description: text }))}
                placeholder="Describe el tipo de ticket"
                placeholderTextColor={COLORS.textTertiary}
                multiline
                numberOfLines={3}
              />

              {/* Category */}
              <Text style={styles.inputLabel}>Categoría *</Text>
              <View style={styles.categoryButtons}>
                {CATEGORY_OPTIONS.map((option) => (
                  <TouchableOpacity
                    key={option.value}
                    style={[
                      styles.categoryButton,
                      formData.category === option.value && styles.categoryButtonActive
                    ]}
                    onPress={() => setFormData(prev => ({ ...prev, category: option.value as TicketTypeCategory }))}
                  >
                    <Text style={[
                      styles.categoryButtonText,
                      formData.category === option.value && styles.categoryButtonTextActive
                    ]}>
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Price */}
              <Text style={styles.inputLabel}>Precio (USD) *</Text>
              <TextInput
                style={styles.textInput}
                value={formData.price}
                onChangeText={(text) => setFormData(prev => ({ ...prev, price: text }))}
                placeholder="0.00"
                placeholderTextColor={COLORS.textTertiary}
                keyboardType="decimal-pad"
              />

              {/* Usage Limit (for multi) */}
              {formData.category === 'multi' && (
                <>
                  <Text style={styles.inputLabel}>Número de usos *</Text>
                  <TextInput
                    style={styles.textInput}
                    value={formData.usageLimit}
                    onChangeText={(text) => setFormData(prev => ({ ...prev, usageLimit: text }))}
                    placeholder="Ej: 10"
                    placeholderTextColor={COLORS.textTertiary}
                    keyboardType="number-pad"
                  />
                </>
              )}

              {/* Duration (for time_based) */}
              {formData.category === 'time_based' && (
                <>
                  <Text style={styles.inputLabel}>Duración (minutos) *</Text>
                  <TextInput
                    style={styles.textInput}
                    value={formData.durationMinutes}
                    onChangeText={(text) => setFormData(prev => ({ ...prev, durationMinutes: text }))}
                    placeholder="Ej: 1440 (24 horas)"
                    placeholderTextColor={COLORS.textTertiary}
                    keyboardType="number-pad"
                  />
                  <Text style={styles.inputHint}>
                    1 hora = 60 min | 1 día = 1440 min | 1 semana = 10080 min | 1 mes = 43200 min
                  </Text>
                </>
              )}

              {/* Color */}
              <Text style={styles.inputLabel}>Color</Text>
              <View style={styles.colorPicker}>
                {COLOR_OPTIONS.map(color => (
                  <TouchableOpacity
                    key={color}
                    style={[
                      styles.colorOption,
                      { backgroundColor: color },
                      formData.color === color && styles.colorSelected
                    ]}
                    onPress={() => setFormData(prev => ({ ...prev, color }))}
                  >
                    {formData.color === color && (
                      <Ionicons name="checkmark" size={18} color="#FFF" />
                    )}
                  </TouchableOpacity>
                ))}
              </View>

              {/* Active Toggle */}
              <View style={styles.switchRow}>
                <Text style={styles.inputLabel}>Activo</Text>
                <Switch
                  value={formData.isActive}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, isActive: value }))}
                  trackColor={{ false: COLORS.disabled, true: COLORS.primary }}
                />
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <Button
                title="Cancelar"
                variant="outline"
                onPress={() => setModalVisible(false)}
                style={styles.modalButton}
              />
              <Button
                title={saving ? "Guardando..." : "Guardar"}
                onPress={handleSave}
                disabled={saving}
                style={styles.modalButton}
              />
            </View>
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
  scrollContent: {
    padding: SPACING.md,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    padding: SPACING.md,
  },
  statValue: {
    ...TEXT_STYLES.h3,
    color: COLORS.text,
    marginTop: SPACING.xs,
  },
  statLabel: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
  },
  addButton: {
    marginBottom: SPACING.md,
  },
  emptyCard: {
    alignItems: 'center',
    padding: SPACING.xl,
  },
  emptyText: {
    ...TEXT_STYLES.subtitle,
    color: COLORS.text,
    marginTop: SPACING.md,
  },
  emptySubtext: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  ticketTypeCard: {
    marginBottom: SPACING.md,
  },
  inactiveCard: {
    opacity: 0.6,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: SPACING.sm,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardInfo: {
    flex: 1,
    marginLeft: SPACING.sm,
  },
  typeName: {
    ...TEXT_STYLES.subtitle,
    color: COLORS.text,
    marginBottom: 4,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: SPACING.xs,
  },
  price: {
    ...TEXT_STYLES.h3,
    fontWeight: '700',
  },
  description: {
    ...TEXT_STYLES.body,
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
  },
  detailsRow: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginBottom: SPACING.md,
  },
  detailText: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
    backgroundColor: COLORS.surfaceAlt,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.sm,
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: SPACING.sm,
  },
  actionButton: {
    padding: SPACING.xs,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: RADIUS.xl,
    borderTopRightRadius: RADIUS.xl,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  modalTitle: {
    ...TEXT_STYLES.h3,
    color: COLORS.text,
  },
  modalBody: {
    padding: SPACING.md,
  },
  modalFooter: {
    flexDirection: 'row',
    gap: SPACING.sm,
    padding: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  modalButton: {
    flex: 1,
  },
  inputLabel: {
    ...TEXT_STYLES.bodySm,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.xs,
    marginTop: SPACING.md,
  },
  textInput: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    ...TEXT_STYLES.body,
    color: COLORS.text,
    backgroundColor: COLORS.background,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  inputHint: {
    ...TEXT_STYLES.caption,
    color: COLORS.textTertiary,
    marginTop: SPACING.xs,
  },
  colorPicker: {
    flexDirection: 'row',
    gap: SPACING.sm,
    flexWrap: 'wrap',
  },
  colorOption: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  colorSelected: {
    borderWidth: 3,
    borderColor: COLORS.surface,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: SPACING.md,
  },
  sectionTitle: {
    ...TEXT_STYLES.h2,
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  categoryButtons: {
    flexDirection: 'row',
    gap: SPACING.sm,
    flexWrap: 'wrap',
  },
  categoryButton: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.background,
  },
  categoryButtonActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  categoryButtonText: {
    ...TEXT_STYLES.bodySm,
    color: COLORS.text,
  },
  categoryButtonTextActive: {
    color: COLORS.surface,
    fontWeight: '600',
  },
})
