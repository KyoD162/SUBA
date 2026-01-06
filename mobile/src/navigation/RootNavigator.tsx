import React from "react"
import { NavigationContainer } from "@react-navigation/native"
import { createNativeStackNavigator } from "@react-navigation/native-stack"
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { Ionicons } from "@expo/vector-icons"
import { scale, verticalScale, responsiveFont } from "../utils/responsive"

import type { RootStackParamList, MainTabParamList, DriverTabParamList, AdminTabParamList } from "./types"
import { COLORS, SPACING } from "../theme"
import { AuthProvider, useAuth } from "./AuthContext"
import { TicketsProvider } from "./TicketsContext"

// Auth screens
import LoginScreen from "../screens/auth/LoginScreen"

// Main app screens
import HomeScreen from "../screens/main/HomeScreen"
import RoutesScreen from "../screens/main/RoutesMapScreen"
import TicketsScreen from "../screens/main/TicketsScreen"
import ProfileScreen from "../screens/main/ProfileScreen"
// AdminPanel eliminado

// Detail screens
import RouteDetailScreen from "../screens/details/RouteDetailScreen"
import PaymentCheckoutScreen from "../screens/details/PaymentCheckoutScreen"
// Admin screens will be lazy loaded in AdminTabNavigator

const Stack = createNativeStackNavigator<RootStackParamList>()
const Tab = createBottomTabNavigator<MainTabParamList>()
const DriverTab = createBottomTabNavigator<DriverTabParamList>()
const AdminTab = createBottomTabNavigator<AdminTabParamList>()

function MainTabNavigator() {
  const insets = useSafeAreaInsets()
  return (
    <Tab.Navigator
      screenOptions={({ route }) => {
        let iconName: keyof typeof Ionicons.glyphMap = "home"
        if (route.name === "Home") iconName = "home-outline"
        else if (route.name === "Routes") iconName = "navigate-outline"
        else if (route.name === "Tickets") iconName = "ticket-outline"
        else if (route.name === "Profile") iconName = "person-outline"
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
            // Provide comfortable vertical spacing while avoiding overlap with device gesture/navigation area
            paddingTop: verticalScale(SPACING.xs),
            paddingBottom: insets.bottom > 0 ? insets.bottom : verticalScale(SPACING.md),
            // Let height grow naturally instead of forcing a fixed size that can collide with system UI
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
      <Tab.Screen name="Home" component={HomeScreen} options={{ title: "Inicio" }} />
      <Tab.Screen name="Routes" component={RoutesScreen} options={{ title: "Rutas" }} />
      <Tab.Screen name="Tickets" component={TicketsScreen} options={{ title: "Mis Tickets" }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ title: "Perfil" }} />
    </Tab.Navigator>
  )
}

function DriverTabNavigator() {
  const insets = useSafeAreaInsets()
  return (
    <DriverTab.Navigator
      screenOptions={({ route }) => {
        let iconName: keyof typeof Ionicons.glyphMap = 'map-outline'
        if (route.name === 'Trip') iconName = 'navigate-outline'
        else if (route.name === 'DriverProfile') iconName = 'person-outline'
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
            fontWeight: '500',
            marginTop: verticalScale(2),
            paddingBottom: verticalScale(2),
          },
        }
      }}
    >
      <DriverTab.Screen name="Trip" component={require('../screens/driver/DriverRouteScreen').default} options={{ title: 'Viaje' }} />
      <DriverTab.Screen 
        name="CargarPasajero" 
        component={require('../screens/driver/CargarPasajeroScreen').default} 
        options={{ 
          title: 'Cargar Pasajero',
          tabBarButton: () => null, // Hide from tab bar
        }} 
      />
      <DriverTab.Screen name="DriverProfile" component={require('../screens/driver/DriverProfileScreen').default} options={{ title: 'Perfil' }} />
    </DriverTab.Navigator>
  )
}

function AdminTabNavigator() {
  const insets = useSafeAreaInsets()
  return (
    <AdminTab.Navigator
      screenOptions={({ route }) => {
        let iconName: keyof typeof Ionicons.glyphMap = 'grid-outline'
        if (route.name === 'Overview') iconName = 'stats-chart-outline'
        else if (route.name === 'Rutas') iconName = 'navigate-outline'
        else if (route.name === 'Conductores') iconName = 'car-outline'
        else if (route.name === 'Usuarios') iconName = 'people-outline'
        else if (route.name === 'Precios') iconName = 'pricetag-outline'
        else if (route.name === 'AdminProfile') iconName = 'person-outline'
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
            fontWeight: '500',
            marginTop: verticalScale(2),
            paddingBottom: verticalScale(2),
          },
        }
      }}
    >
      <AdminTab.Screen name="Overview" component={require('../screens/admin/OverviewScreen').default} />
      <AdminTab.Screen name="Rutas" component={require('../screens/admin/RutasScreen').default} />
      <AdminTab.Screen name="Conductores" component={require('../screens/admin/ConductoresScreen').default} />
      <AdminTab.Screen name="Usuarios" component={require('../screens/admin/UsuariosScreen').default} />
      <AdminTab.Screen name="Precios" component={require('../screens/admin/PreciosScreen').default} />
      <AdminTab.Screen name="AdminProfile" component={require('../screens/admin/AdminProfileScreen').default} options={{ title: 'Perfil' }} />
    </AdminTab.Navigator>
  )
}

function NavigationContent() {
  const { isAuthenticated, user, isLoading } = useAuth()

  if (isAuthenticated) {
    console.log('[NAV] Usuario autenticado con rol:', user?.role)
  } else {
    console.log('[NAV] Usuario no autenticado, mostrando flujo Auth')
  }

  if (isLoading) {
    // Podríamos mostrar un splash screen aquí
    return null
  }

  const role = user?.role

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          animation: "default",
        }}
      >
        {isAuthenticated ? (
          <Stack.Group>
            {role === 'driver' && <Stack.Screen name="DriverMain" component={DriverTabNavigator} />}
            {role === 'admin' && <Stack.Screen name="AdminMain" component={AdminTabNavigator} />}
            {role === 'rider' && <Stack.Screen name="MainApp" component={MainTabNavigator} />}
            {role === 'rider' && (
              <Stack.Screen
                name="EditProfile"
                component={require('../screens/main/EditProfileScreen').default}
                options={{ animation: 'default', contentStyle: { backgroundColor: COLORS.background } }}
              />
            )}
            {/* Fallback: si hay token pero rol no coincide, regresamos al login para evitar loops */}
            {role !== 'driver' && role !== 'admin' && role !== 'rider' && (
              <Stack.Screen name="Auth" component={LoginScreen} />
            )}
            <Stack.Screen
              name="RouteDetail"
              component={RouteDetailScreen}
              options={{
                animation: "default",
                contentStyle: { backgroundColor: COLORS.background },
              }}
            />
            <Stack.Screen
              name="PaymentCheckout"
              component={PaymentCheckoutScreen}
              options={{
                animation: "default",
                contentStyle: { backgroundColor: COLORS.background },
              }}
            />
          </Stack.Group>
        ) : (
          <Stack.Group screenOptions={{ animation: "none" }}>
            <Stack.Screen name="Auth" component={LoginScreen} />
            <Stack.Screen name="Register" component={require("../screens/auth/RegisterScreen").default} />
          </Stack.Group>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  )
}

export function RootNavigator() {
  return (
    <AuthProvider>
      <TicketsProvider>
        <NavigationContent />
      </TicketsProvider>
    </AuthProvider>
  )
}
