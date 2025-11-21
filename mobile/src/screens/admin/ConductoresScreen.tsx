
import React, { useState } from "react"
import { SafeAreaView } from "react-native-safe-area-context"
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, Pressable, FlatList, Modal, KeyboardAvoidingView, Platform } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { COLORS, globalStyles, SPACING, RADIUS, TEXT_STYLES } from "../../theme"
import AdminHeader from "../../components/AdminHeader"
import { Input } from "../../components/Input"
import { Card } from "../../components/Card"
import { Badge } from "../../components/Badge"
import { Button } from "../../components/Button"
import { CurrencyDisplay } from "../../components/CurrencyDisplay"
import { scale } from "../../utils/responsive"

interface User {
  id: string
  name: string
  email: string
  phone: string
  status: "Activo" | "Inactivo"
  vehicle: "Bus" | "Microbus" | "Taxi colectivo"
  registeredAt: string
  salary: number
  trips: number
}

const MOCK_USERS: User[] = [
  {
    id: "1",
    name: "Carlos Méndez",
    email: "carlos@email.com",
    phone: "+58 412-1111111",
    status: "Activo",
    registeredAt: "14/1/2024",
    salary: 5.50,
    trips: 45,
    vehicle: "Bus",
  },
  {
    id: "2",
    name: "Ana García",
    email: "ana@email.com",
    phone: "+58 414-2222222",
    status: "Activo",
    registeredAt: "20/2/2024",
    salary: 12.00,
    trips: 28,
    vehicle: "Microbus",
  },
  {
    id: "3",
    name: "Pedro Pérez",
    email: "pedro@email.com",
    phone: "+58 416-3333333",
    status: "Inactivo",
    registeredAt: "05/3/2024",
    salary: 2.50,
    trips: 12,
    vehicle: "Taxi colectivo",
  },
]

const ConductoresScreen: React.FC = () => {
const [searchQuery, setSearchQuery] = useState("")
  const [filterType, setFilterType] = useState("Todos los tipos")
  const [showFilter, setShowFilter] = useState(false)
  const [modalMode, setModalMode] = useState<"add" | "edit">("add")

  
  // Edit Modal State
  const [isEditModalVisible, setIsEditModalVisible] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [showTypeDropdown, setShowTypeDropdown] = useState(false)

  const filterOptions = ["Todos los tipos", "Estudiantes", "Adultos", "Tercera Edad", "Especiales"]
  const userTypes = ["Bus", "Micorbus", "Taxi colectivo"]

  const handleEditUser = (user: User) => {
    setEditingUser({ ...user })
    setIsEditModalVisible(true)
    setModalMode("edit")
  }

  const handleSaveUser = () => {
    // Here you would typically update the user in your backend or state
    console.log("Saving user:", editingUser)
    setIsEditModalVisible(false)
    setEditingUser(null)
  }

  const handleAddUser = () => {
    setIsEditModalVisible(true)
    setModalMode("add")
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  const renderUserCard = ({ item }: { item: User }) => (
    <Card style={styles.userCard}>
      <View style={styles.cardHeader}>
        <View style={styles.userInfo}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{getInitials(item.name)}</Text>
          </View>
          <View>
            <Text style={styles.userName}>{item.name}</Text>
              <Badge 
                label={item.vehicle} 
                variant="success" 
                size="sm" 
                style={styles.typeBadge}
                textStyle={{ color: COLORS.success }}
             />
          </View>
        </View>
        <Badge 
          label={item.status} 
          variant={item.status === "Activo" ? "success" : "neutral"} 
          size="sm"
          style={{ backgroundColor: item.status === "Activo" ? "#E8F5E9" : "#F5F5F5" }}
          textStyle={{ color: item.status === "Activo" ? COLORS.success : COLORS.textSecondary }}
        />
      </View>

      <View style={styles.contactInfo}>
        <View style={styles.infoRow}>
          <Ionicons name="mail-outline" size={scale(16)} color={COLORS.textSecondary} />
          <Text style={styles.infoText}>{item.email}</Text>
        </View>
        <View style={styles.infoRow}>
          <Ionicons name="call-outline" size={scale(16)} color={COLORS.textSecondary} />
          <Text style={styles.infoText}>{item.phone}</Text>
        </View>
        <View style={styles.infoRow}>
          <Ionicons name="calendar-outline" size={scale(16)} color={COLORS.textSecondary} />
          <Text style={styles.infoText}>Registrado: {item.registeredAt}</Text>
        </View>
      </View>

      <View style={styles.statsContainer}>
        <View>
          <Text style={styles.statsLabel}>Saldo</Text>
          <CurrencyDisplay usdAmount={item.salary} size="md" />
        </View>
        <View style={{ alignItems: 'flex-end' }}>
          <Text style={styles.statsLabel}>Viajes</Text>
          <Text style={styles.statsValue}>{item.trips}</Text>
        </View>
      </View>

      <View style={styles.actionsContainer}>
        <Button
          title="Editar"
          variant="outline"
          size="sm"
          icon={<Ionicons name="create-outline" size={scale(16)} color={COLORS.primary} style={{ marginRight: scale(4) }} />}
          style={styles.editButton}
          textStyle={{ color: COLORS.primary }}
          onPress={() => handleEditUser(item)}
        />
        <TouchableOpacity style={styles.deleteButton}>
          <Ionicons name="trash-outline" size={scale(20)} color={COLORS.danger} />
        </TouchableOpacity>
      </View>
    </Card>
  )

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <View style={[globalStyles.screenPadding, { flex: 1 }]}>
        <AdminHeader name="Admin" />
        <View style={styles.actionsContainer}>
        <Button
          title="Añadir Conductor"
          variant="outline"
          size="sm"
          icon={
            <View style={styles.addIcon}>
              <Ionicons 
                name="add"                  // el símbolo "+"
                size={scale(16)} 
                color={COLORS.primary} 
              />
            </View>
          }
          //style={[styles.editButton, { borderRadius: 8 }]}   // suaviza el botón también
          textStyle={{ color: COLORS.primary }}
          onPress={handleAddUser}
        />
      </View>
        <View style={styles.searchSection}>
          <Input
            placeholder="Buscar por nombre o email..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            containerStyle={styles.searchInput}
            icon="search-outline"
          />

          <View style={styles.filterContainer}>
            <TouchableOpacity
              style={styles.filterButton}
              onPress={() => setShowFilter(!showFilter)}
              activeOpacity={0.7}
            >
              <Text style={styles.filterButtonText}>{filterType}</Text>
              <Ionicons 
                name={showFilter ? "chevron-up" : "chevron-down"} 
                size={scale(20)} 
                color={COLORS.textTertiary} 
              />
            </TouchableOpacity>

            {showFilter && (
              <View style={styles.dropdown}>
                <ScrollView bounces={false} contentContainerStyle={{ paddingBottom: SPACING.xs }}>
                  {filterOptions
                    .filter((option) => option !== filterType)
                    .map((option, index, arr) => (
                      <Pressable
                        key={option}
                        style={({ pressed }) => [
                          styles.dropdownOption,
                          index === arr.length - 1 && styles.lastOption,
                          pressed && { backgroundColor: "#E0F7FA" }
                        ]}
                        onPress={() => {
                          setFilterType(option)
                          setShowFilter(false)
                        }}
                      >
                        <Text style={styles.dropdownOptionText}>{option}</Text>
                      </Pressable>
                    ))}
                </ScrollView>
              </View>
            )}
          </View>
        </View>

        <FlatList
        data={MOCK_USERS}
          renderItem={renderUserCard}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />

        <Modal
          visible={isEditModalVisible}
          transparent
          animationType="fade"
          onRequestClose={() => setIsEditModalVisible(false)}
        >
          <KeyboardAvoidingView 
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.modalOverlay}
          >
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>{modalMode === "edit" ? "Editar Conductor" : "Añadir Conductor"}</Text>
                <TouchableOpacity onPress={() => setIsEditModalVisible(false)}>
                  <Ionicons name="close" size={scale(24)} color={COLORS.textSecondary} />
                </TouchableOpacity>
              </View>

              <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles.formGroup}>
                  <Input
                    label="Nombre Completo"
                    value={editingUser?.name}
                    onChangeText={(text) => setEditingUser(prev => prev ? { ...prev, name: text } : null)}
                    placeholder="Nombre Completo"
                  />
                </View>

                <View style={styles.formGroup}>
                  <Input
                    label="Email"
                    value={editingUser?.email}
                    onChangeText={(text) => setEditingUser(prev => prev ? { ...prev, email: text } : null)}
                    placeholder="Email"
                    keyboardType="email-address"
                  />
                </View>

                <View style={styles.formGroup}>
                  <Input
                    label="Teléfono"
                    value={editingUser?.phone}
                    onChangeText={(text) => setEditingUser(prev => prev ? { ...prev, phone: text } : null)}
                    placeholder="Teléfono"
                    keyboardType="phone-pad"
                  />
                </View>

                <View style={[styles.formGroup, { zIndex: 10 }]}>
                  <Text style={styles.label}>Unidad de Transporte</Text>
                  <TouchableOpacity
                    style={styles.dropdownButton}
                    onPress={() => setShowTypeDropdown(!showTypeDropdown)}
                  >
                    <Text style={styles.dropdownButtonText}>{editingUser?.vehicle}</Text>
                    <Ionicons name="chevron-down" size={scale(20)} color={COLORS.textTertiary} />
                  </TouchableOpacity>
                  
                  {showTypeDropdown && (
                    <View style={styles.typeDropdown}>
                      {userTypes.map((type) => (
                        <TouchableOpacity
                          key={type}
                          style={styles.typeOption}
                          onPress={() => {
                            setEditingUser(prev => prev ? { ...prev, type: type as any } : null)
                            setShowTypeDropdown(false)
                          }}
                        >
                          <Text style={styles.typeOptionText}>{type}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}
                </View>

                <View style={styles.formGroup}>
                  <Input
                    label="Sueldo"
                    value={editingUser?.salary.toString()}
                    onChangeText={(text) => setEditingUser(prev => prev ? { ...prev, balance: parseFloat(text) || 0 } : null)}
                    placeholder="0.00"
                    keyboardType="numeric"
                  />
                </View>

                <View style={styles.modalActions}>
                  <Button
                    title="Cancelar"
                    variant="outline"
                    onPress={() => setIsEditModalVisible(false)}
                    style={{ flex: 1 }}
                  />
                  <Button
                    title="Guardar"
                    onPress={handleSaveUser}
                    style={{ flex: 1 }}
                  />
                </View>
              </ScrollView>
            </View>
          </KeyboardAvoidingView>
        </Modal>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  searchSection: {
    marginTop: SPACING.lg,
    gap: SPACING.md,
    zIndex: 10,
    marginBottom: SPACING.sm,
  },
  searchInput: {
    backgroundColor: COLORS.surface,
  },
  filterContainer: {
    position: 'relative',
    zIndex: 20,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.surface,
    paddingHorizontal: scale(SPACING.md),
    paddingVertical: scale(SPACING.sm),
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    height: scale(48),
  },
  filterButtonText: {
    ...TEXT_STYLES.body,
    color: COLORS.text,
  },
  dropdown: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    marginTop: SPACING.xs,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
    maxHeight: scale(200),
  },
  dropdownOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: scale(SPACING.md),
    paddingVertical: scale(SPACING.md),
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  lastOption: {
    borderBottomWidth: 0,
  },
  dropdownOptionText: {
    ...TEXT_STYLES.body,
    color: COLORS.textSecondary,
  },
  listContent: {
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.xl,
    gap: SPACING.md,
  },
  userCard: {
    padding: SPACING.md,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.md,
  },
  userInfo: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  avatar: {
    width: scale(48),
    height: scale(48),
    borderRadius: scale(24),
    backgroundColor: '#9DD98C', // Light green from image
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    ...TEXT_STYLES.h3,
    color: COLORS.textInverse,
  },
  userName: {
    ...TEXT_STYLES.subtitle,
    color: COLORS.text,
    marginBottom: scale(4),
  },
  typeBadge: {
    backgroundColor: '#E8F5E9', // Very light green
    alignSelf: 'flex-start',
    paddingVertical: scale(2),
    paddingHorizontal: scale(8),
  },
  contactInfo: {
    gap: scale(8),
    marginBottom: SPACING.md,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(8),
  },
  infoText: {
    ...TEXT_STYLES.bodySm,
    color: COLORS.textSecondary,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: COLORS.surfaceAlt,
    padding: SPACING.md,
    borderRadius: RADIUS.sm,
    marginBottom: SPACING.md,
  },
  statsLabel: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
    marginBottom: scale(4),
  },
  statsValue: {
    ...TEXT_STYLES.h3,
    color: COLORS.text,
  },
  actionsContainer: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  editButton: {
    flex: 1,
    borderColor: "#E0F7FA",
    backgroundColor: "#E0F7FA",
  },
  deleteButton: {
    width: scale(48),
    height: scale(48),
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.danger, // Or border color
    borderRadius: RADIUS.md,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    padding: SPACING.lg,
  },
  modalContent: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  modalTitle: {
    ...TEXT_STYLES.h3,
    color: COLORS.text,
  },
  formGroup: {
    marginBottom: SPACING.md,
  },
  label: {
    ...TEXT_STYLES.bodySm,
    color: COLORS.text,
    fontWeight: "600",
    marginBottom: SPACING.sm,
  },
  dropdownButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    paddingHorizontal: scale(SPACING.md),
    borderWidth: 1,
    borderColor: COLORS.border,
    height: scale(48),
  },
  dropdownButtonText: {
    ...TEXT_STYLES.body,
    color: COLORS.text,
  },
  typeDropdown: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    marginTop: SPACING.xs,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  typeOption: {
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  typeOptionText: {
    ...TEXT_STYLES.body,
    color: COLORS.text,
  },
  modalActions: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginTop: SPACING.lg,
  },
  addIcon: {
    width: scale(24),
    height: scale(24),
    borderWidth: 1,
    borderColor: COLORS.primary,
    borderRadius: 6,             
    justifyContent: "center",
    alignItems: "center",
    marginRight: scale(4),
  },
})

export default ConductoresScreen
//crear, modificar, eliminar, obtener