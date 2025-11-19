"use client"

import React from "react"
import { StyleSheet } from "react-native"
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { Ionicons } from "@expo/vector-icons"
import { COLORS, SPACING } from "../../theme"
import { scale, verticalScale, responsiveFont } from "../../utils/responsive"
import OverviewScreen from "./OverviewScreen"
import RutasScreen from "./RutasScreen"
import ConductoresScreen from "./ConductoresScreen"
import UsuariosScreen from "./UsuariosScreen"
import PreciosScreen from "./PreciosScreen"

type AdminTabParamList = {
  Overview: undefined
  Rutas: undefined
  Conductores: undefined
  Usuarios: undefined
  Precios: undefined
}

const Tab = createBottomTabNavigator<AdminTabParamList>()

const AdminPanel: React.FC = () => {
  const insets = useSafeAreaInsets()

  return (
    <Tab.Navigator
      screenOptions={({ route }) => {
        let iconName: keyof typeof Ionicons.glyphMap = "grid-outline"
        if (route.name === "Overview") iconName = "speedometer-outline"
        else if (route.name === "Rutas") iconName = "navigate-outline"
        else if (route.name === "Conductores") iconName = "car-outline"
        else if (route.name === "Usuarios") iconName = "people-outline"
        else if (route.name === "Precios") iconName = "pricetag-outline"

        return {
          headerShown: false,
          tabBarIcon: ({ color, size }) => <Ionicons name={iconName} size={scale(size)} color={color} />,
          tabBarActiveTintColor: COLORS.primary,
          tabBarInactiveTintColor: COLORS.textTertiary,
          safeAreaInsets: { bottom: insets.bottom },
          tabBarStyle: {
            backgroundColor: COLORS.surface,
            borderTopColor: COLORS.border,
            borderTopWidth: 1,
            paddingTop: verticalScale(SPACING.xs),
            paddingBottom: insets.bottom > 0 ? insets.bottom : verticalScale(SPACING.md),
            minHeight: verticalScale(54) + (insets.bottom || 0),
          },
          tabBarLabelStyle: {
            fontSize: responsiveFont(12),
            fontWeight: "500",
            marginTop: verticalScale(2),
            paddingBottom: verticalScale(2),
          },
        }
      }}
    >
      <Tab.Screen name="Overview" component={OverviewScreen} options={{ title: "Overview" }} />
      <Tab.Screen name="Rutas" component={RutasScreen} options={{ title: "Rutas" }} />
      <Tab.Screen name="Conductores" component={ConductoresScreen} options={{ title: "Conductores" }} />
      <Tab.Screen name="Usuarios" component={UsuariosScreen} options={{ title: "Usuarios" }} />
      <Tab.Screen name="Precios" component={PreciosScreen} options={{ title: "Precios" }} />
    </Tab.Navigator>
  )
}

const styles = StyleSheet.create({
  
})

export default AdminPanel
