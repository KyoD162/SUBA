"use client"

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
  type: "Estudiante" | "Adulto" | "Tercera Edad" | "Especial"
  status: "Activo" | "Inactivo"
  registeredAt: string
  balance: number
  trips: number
}

const MOCK_USERS: User[] = [
  {
    id: "1",
    name: "Carlos Méndez",
    email: "carlos@email.com",
    phone: "+58 412-1111111",
    type: "Estudiante",
    status: "Activo",
    registeredAt: "14/1/2024",
    balance: 5.50,
    trips: 45,
  },
  {
    id: "2",
    name: "Ana García",
    email: "ana@email.com",
    phone: "+58 414-2222222",
    type: "Adulto",
    status: "Activo",
    registeredAt: "20/2/2024",
    balance: 12.00,
    trips: 28,
  },
  {
    id: "3",
    name: "Pedro Pérez",
    email: "pedro@email.com",
    phone: "+58 416-3333333",
    type: "Tercera Edad",
    status: "Inactivo",
    registeredAt: "05/3/2024",
    balance: 2.50,
    trips: 12,
  },
]

const UsuariosScreen: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("")
  const [filterType, setFilterType] = useState("Todos los tipos")
  const [showFilter, setShowFilter] = useState(false)
  
  // Edit Modal State
  const [isEditModalVisible, setIsEditModalVisible] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [showTypeDropdown, setShowTypeDropdown] = useState(false)

  const filterOptions = ["Todos los tipos", "Estudiantes", "Adultos", "Tercera Edad", "Especiales"]
  const userTypes = ["Estudiante", "Adulto", "Tercera Edad", "Especial"]

  const handleEditUser = (user: User) => {
    setEditingUser({ ...user })
    setIsEditModalVisible(true)
  }

  const handleSaveUser = () => {
    // Here you would typically update the user in your backend or state
    console.log("Saving user:", editingUser)
    setIsEditModalVisible(false)
    setEditingUser(null)
  }

  const filteredUsers = MOCK_USERS.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase())

    if (filterType === "Todos los tipos") return matchesSearch

    const typeMap: Record<string, string> = {
      "Estudiantes": "Estudiante",
      "Adultos": "Adulto",
      "Tercera Edad": "Tercera Edad",
      "Especiales": "Especial",
    }

    return matchesSearch && user.type === typeMap[filterType]
  })

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
              label={item.type} 
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
          <CurrencyDisplay usdAmount={item.balance} size="md" />
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
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={[globalStyles.screenPadding, { flex: 1, paddingBottom: SPACING.md }]}>
        <AdminHeader name="Admin" />
        
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
          data={filteredUsers}
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
                <Text style={styles.modalTitle}>Editar Usuario</Text>
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
                  <Text style={styles.label}>Tipo de Usuario</Text>
                  <TouchableOpacity
                    style={styles.dropdownButton}
                    onPress={() => setShowTypeDropdown(!showTypeDropdown)}
                  >
                    <Text style={styles.dropdownButtonText}>{editingUser?.type}</Text>
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
                    label="Saldo Inicial"
                    value={editingUser?.balance.toString()}
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
})

export default UsuariosScreen
