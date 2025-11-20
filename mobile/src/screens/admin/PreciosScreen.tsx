"use client"

import React, { useState } from "react"
import { SafeAreaView } from "react-native-safe-area-context"
import { StyleSheet, View, Text, Alert, Switch, ScrollView, TouchableOpacity, TextInput } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import Slider from "@react-native-community/slider"
import { COLORS, globalStyles, SPACING, TEXT_STYLES, RADIUS } from "../../theme"
import AdminHeader from "../../components/AdminHeader"
import { Card } from "../../components/Card"
import { Button } from "../../components/Button"
import { Input } from "../../components/Input"

interface DiscountCardProps {
  title: string
  icon: keyof typeof Ionicons.glyphMap
  basePrice: number
  discount: number
  isActive: boolean
  onToggle: (value: boolean) => void
  onDiscountChange: (value: string) => void
  onSliderChange: (value: number) => void
  iconColor?: string
  iconBg?: string
}

const DiscountCard: React.FC<DiscountCardProps> = ({
  title,
  icon,
  basePrice,
  discount,
  isActive,
  onToggle,
  onDiscountChange,
  onSliderChange,
  iconColor = COLORS.primary,
  iconBg = "#E0F7FA"
}) => {
  const finalPrice = (basePrice * (1 - discount / 100)).toFixed(2)
  
  return (
    <Card style={styles.discountCard}>
      <View style={styles.discountHeader}>
        <View style={styles.discountTitleRow}>
          <View style={[styles.iconContainer, { backgroundColor: iconBg }]}>
            <Ionicons name={icon} size={20} color={iconColor} />
          </View>
          <View>
            <Text style={styles.discountTitle}>{title}</Text>
            <Text style={styles.basePriceLabel}>Precio base: ${basePrice.toFixed(2)} USD</Text>
          </View>
        </View>
        <View style={styles.switchContainer}>
          <Text style={[styles.statusText, { color: isActive ? COLORS.success : COLORS.textTertiary }]}>
            {isActive ? "Activo" : "Inactivo"}
          </Text>
          <Switch
            trackColor={{ false: COLORS.disabled, true: COLORS.primary }}
            thumbColor={COLORS.surface}
            ios_backgroundColor={COLORS.disabled}
            onValueChange={onToggle}
            value={isActive}
          />
        </View>
      </View>

      <View style={styles.discountControls}>
        <View style={styles.discountInputRow}>
          <Text style={styles.discountLabel}>Descuento (%)</Text>
          <View style={[
            styles.percentageInputContainer, 
            !isActive && styles.disabledInput
          ]}>
            <TextInput
              value={discount.toString()}
              onChangeText={onDiscountChange}
              keyboardType="numeric"
              style={styles.percentageTextInput}
              editable={isActive}
              maxLength={3}
            />
            <Text style={styles.percentageSymbol}>%</Text>
          </View>
        </View>
        
        <Slider
          style={{ width: '100%', height: 40 }}
          minimumValue={0}
          maximumValue={100}
          step={1}
          value={discount}
          onValueChange={onSliderChange}
          minimumTrackTintColor={isActive ? COLORS.primary : COLORS.disabled}
          maximumTrackTintColor={COLORS.border}
          thumbTintColor={isActive ? COLORS.primary : COLORS.disabled}
          disabled={!isActive}
        />

        <View style={styles.summaryRow}>
          <View>
            <Text style={styles.summaryLabel}>Precio Original</Text>
            <Text style={styles.summaryValue}>${basePrice.toFixed(2)}</Text>
          </View>
          <View>
            <Text style={styles.summaryLabel}>Descuento</Text>
            <Text style={[styles.summaryValue, { color: COLORS.danger }]}>-{discount}%</Text>
          </View>
          <View>
            <Text style={styles.summaryLabel}>Precio Final</Text>
            <Text style={[styles.summaryValue, { color: COLORS.success }]}>${finalPrice}</Text>
          </View>
        </View>
      </View>
    </Card>
  )
}

const PreciosScreen: React.FC = () => {
  const [ticketPrice, setTicketPrice] = useState("5.00")
  const [bsPrice, setBsPrice] = useState("180.00")
  const [isEditing, setIsEditing] = useState(false)
  const [newPrice, setNewPrice] = useState("")
  const [newBsPrice, setNewBsPrice] = useState("")

  // Discounts State
  const [discounts, setDiscounts] = useState({
    adult: { active: true, discount: 0 },
    student: { active: true, discount: 30 },
    senior: { active: true, discount: 50 },
    disability: { active: true, discount: 50 },
  })

  const updateDiscount = (type: keyof typeof discounts, field: 'active' | 'discount', value: boolean | number) => {
    setDiscounts(prev => ({
      ...prev,
      [type]: {
        ...prev[type],
        [field]: value
      }
    }))
  }

  const handleEdit = () => {
    setNewPrice(ticketPrice)
    setNewBsPrice(bsPrice)
    setIsEditing(true)
  }

  const handleSave = () => {
    if (!newPrice || isNaN(Number(newPrice))) {
      Alert.alert("Error", "Por favor ingrese un precio en USD válido")
      return
    }
    if (!newBsPrice || isNaN(Number(newBsPrice))) {
      Alert.alert("Error", "Por favor ingrese un precio en Bs válido")
      return
    }
    setTicketPrice(parseFloat(newPrice).toFixed(2))
    setBsPrice(parseFloat(newBsPrice).toFixed(2))
    setIsEditing(false)
    Alert.alert("Éxito", "Precios actualizados correctamente")
  }

  const handleCancel = () => {
    setIsEditing(false)
    setNewPrice("")
    setNewBsPrice("")
  }

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <View style={[globalStyles.screenPadding, { flex: 1 }]}>
        <AdminHeader name="Admin" />
        
        <ScrollView 
          showsVerticalScrollIndicator={false} 
          contentContainerStyle={{ paddingBottom: SPACING.xl }}
          style={{ flex: 1 }}
        >
          <View style={styles.content}>
            <Text style={styles.title}>Gestión de Precios</Text>
            
            <Card style={styles.card}>
              <Text style={styles.cardTitle}>Precio del Ticket</Text>
              <Text style={styles.cardSubtitle}>Precio actual por viaje</Text>
              
              {isEditing ? (
                <View style={styles.editContainer}>
                  <Input
                    value={newPrice}
                    onChangeText={setNewPrice}
                    keyboardType="numeric"
                    placeholder="0.00"
                    containerStyle={styles.input}
                    icon="cash-outline"
                    label="Precio en USD"
                  />
                  <Input
                    value={newBsPrice}
                    onChangeText={setNewBsPrice}
                    keyboardType="numeric"
                    placeholder="0.00"
                    containerStyle={styles.input}
                    icon="wallet-outline"
                    label="Precio en Bs"
                  />
                  <View style={styles.buttonRow}>
                    <Button 
                      title="Cancelar" 
                      onPress={handleCancel} 
                      variant="outline" 
                      style={styles.button}
                      size="sm"
                    />
                    <Button 
                      title="Guardar" 
                      onPress={handleSave} 
                      style={styles.button}
                      size="sm"
                    />
                  </View>
                </View>
              ) : (
                <View style={styles.displayContainer}>
                  <Text style={styles.price}>${ticketPrice}</Text>
                  <Text style={styles.bsPrice}>Bs {bsPrice}</Text>
                  <Button 
                    title="Editar Precios" 
                    onPress={handleEdit} 
                    variant="outline"
                    style={styles.editButton}
                    textStyle={{ color: COLORS.primary }}
                    icon={<Ionicons name="pencil" size={18} color={COLORS.primary} style={{ marginRight: 8 }} />}
                  />
                </View>
              )}
            </Card>

            <Text style={styles.sectionTitle}>% Descuentos por Tipo de Usuario</Text>
            
            <View style={styles.discountsContainer}>
              <DiscountCard
                title="Adulto Regular"
                icon="person-outline"
                basePrice={parseFloat(ticketPrice)}
                discount={discounts.adult.discount}
                isActive={discounts.adult.active}
                onToggle={(val) => updateDiscount('adult', 'active', val)}
                onDiscountChange={(val) => updateDiscount('adult', 'discount', Number(val))}
                onSliderChange={(val) => updateDiscount('adult', 'discount', val)}
                iconBg="#E0F7FA"
                iconColor={COLORS.primary}
              />
              
              <DiscountCard
                title="Estudiante"
                icon="school-outline"
                basePrice={parseFloat(ticketPrice)}
                discount={discounts.student.discount}
                isActive={discounts.student.active}
                onToggle={(val) => updateDiscount('student', 'active', val)}
                onDiscountChange={(val) => updateDiscount('student', 'discount', Number(val))}
                onSliderChange={(val) => updateDiscount('student', 'discount', val)}
                iconBg="#E8F5E9"
                iconColor={COLORS.success}
              />

              <DiscountCard
                title="Tercera Edad"
                icon="walk-outline"
                basePrice={parseFloat(ticketPrice)}
                discount={discounts.senior.discount}
                isActive={discounts.senior.active}
                onToggle={(val) => updateDiscount('senior', 'active', val)}
                onDiscountChange={(val) => updateDiscount('senior', 'discount', Number(val))}
                onSliderChange={(val) => updateDiscount('senior', 'discount', val)}
                iconBg="#FFF3E0"
                iconColor={COLORS.warning}
              />

              <DiscountCard
                title="Discapacidad"
                icon="heart-outline"
                basePrice={parseFloat(ticketPrice)}
                discount={discounts.disability.discount}
                isActive={discounts.disability.active}
                onToggle={(val) => updateDiscount('disability', 'active', val)}
                onDiscountChange={(val) => updateDiscount('disability', 'discount', Number(val))}
                onSliderChange={(val) => updateDiscount('disability', 'discount', val)}
                iconBg="#F3E5F5"
                iconColor="#9C27B0"
              />
            </View>

            <Button
              title="Guardar Cambios"
              onPress={() => Alert.alert("Éxito", "Configuración guardada correctamente")}
              style={styles.saveButton}
              size="lg"
            />
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    marginTop: SPACING.lg,
  },
  title: {
    ...TEXT_STYLES.h2,
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  card: {
    padding: SPACING.lg,
  },
  cardTitle: {
    ...TEXT_STYLES.h3,
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  cardSubtitle: {
    ...TEXT_STYLES.bodySm,
    color: COLORS.textTertiary,
    marginBottom: SPACING.lg,
  },
  displayContainer: {
    alignItems: "center",
    gap: SPACING.md,
    paddingVertical: SPACING.md,
  },
  price: {
    ...TEXT_STYLES.h1,
    color: COLORS.primary,
    fontSize: 48,
    fontWeight: "bold",
  },
  bsPrice: {
    ...TEXT_STYLES.h2,
    color: COLORS.text,
    fontSize: 32,
    fontWeight: "600",
  },
  editContainer: {
    gap: SPACING.md,
  },
  input: {
    marginBottom: SPACING.sm,
  },
  buttonRow: {
    flexDirection: "row",
    gap: SPACING.md,
    justifyContent: "flex-end",
  },
  button: {
    flex: 1,
  },
  editButton: {
    backgroundColor: "#E0F7FA",
    borderColor: "#E0F7FA",
  },
  sectionTitle: {
    ...TEXT_STYLES.h3,
    fontSize: 18,
    color: COLORS.text,
    marginBottom: SPACING.md,
    marginTop: SPACING.xl,
  },
  discountsContainer: {
    gap: SPACING.md,
  },
  discountCard: {
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  discountHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: SPACING.md,
  },
  discountTitleRow: {
    flexDirection: "row",
    gap: SPACING.sm,
    alignItems: "center",
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.md,
    justifyContent: "center",
    alignItems: "center",
  },
  discountTitle: {
    ...TEXT_STYLES.body,
    fontWeight: "600",
    color: COLORS.text,
  },
  basePriceLabel: {
    ...TEXT_STYLES.caption,
    color: COLORS.textTertiary,
  },
  switchContainer: {
    alignItems: "flex-end",
  },
  statusText: {
    ...TEXT_STYLES.caption,
    marginBottom: 4,
    fontWeight: "600",
  },
  discountControls: {
    gap: SPACING.sm,
  },
  discountInputRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  discountLabel: {
    ...TEXT_STYLES.bodySm,
    color: COLORS.text,
    fontWeight: "500",
  },
  percentageInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: SPACING.md,
    height: 48,
    minWidth: 90,
    justifyContent: "center",
  },
  disabledInput: {
    backgroundColor: COLORS.background,
    opacity: 0.6,
  },
  percentageTextInput: {
    ...TEXT_STYLES.body,
    fontWeight: "600",
    color: COLORS.text,
    textAlign: "right",
    minWidth: 24,
    padding: 0,
  },
  percentageSymbol: {
    ...TEXT_STYLES.body,
    color: COLORS.textTertiary,
    marginLeft: 2,
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: COLORS.background,
    borderRadius: 4,
    marginVertical: SPACING.sm,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    borderRadius: 4,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: SPACING.sm,
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
  },
  summaryLabel: {
    ...TEXT_STYLES.caption,
    color: COLORS.textTertiary,
    marginBottom: 2,
  },
  summaryValue: {
    ...TEXT_STYLES.bodySm,
    fontWeight: "600",
    color: COLORS.text,
  },
  saveButton: {
    marginTop: SPACING.lg,
  },
})

export default PreciosScreen
