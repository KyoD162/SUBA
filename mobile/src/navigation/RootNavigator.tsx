'use client';

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { scale, verticalScale, responsiveFont } from '../utils/responsive';

import type { RootStackParamList, MainTabParamList } from './types';
import { COLORS, SPACING } from '../theme';
import { AuthContext } from './AuthContext';
import { TicketsProvider } from './TicketsContext';

// Auth screens
import LoginScreen from '../screens/auth/LoginScreen';

// Main app screens
import HomeScreen from '../screens/main/HomeScreen';
import RoutesScreen from '../screens/main/RoutesMapScreen';
import TicketsScreen from '../screens/main/TicketsScreen';
import ProfileScreen from '../screens/main/ProfileScreen';
import EditProfileScreen from '../screens/main/EditProfileScreen';

// Detail screens
import RouteDetailScreen from '../screens/details/RouteDetailScreen';
import PaymentCheckoutScreen from '../screens/details/PaymentCheckoutScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

function MainTabNavigator() {
  const insets = useSafeAreaInsets();
  return (
    <Tab.Navigator
      screenOptions={({ route }) => {
        let iconName: keyof typeof Ionicons.glyphMap = 'home';
        if (route.name === 'Home') iconName = 'home-outline';
        else if (route.name === 'Routes') iconName = 'navigate-outline';
        else if (route.name === 'Tickets') iconName = 'ticket-outline';
        else if (route.name === 'Profile') iconName = 'person-outline';
        return {
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name={iconName} size={scale(size)} color={color} />
          ),
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
            fontWeight: '500',
            marginTop: verticalScale(2),
            paddingBottom: verticalScale(2),
          },
        };
      }}
    >
      <Tab.Screen name="Home" component={HomeScreen} options={{ title: 'Inicio' }} />
      <Tab.Screen name="Routes" component={RoutesScreen} options={{ title: 'Rutas' }} />
      <Tab.Screen name="Tickets" component={TicketsScreen} options={{ title: 'Mis Tickets' }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ title: 'Perfil' }} />
    </Tab.Navigator>
  );
}

export function RootNavigator() {
  const [isAuthenticated, setIsAuthenticated] = React.useState(false);

  const authValue = React.useMemo(
    () => ({
      isAuthenticated,
      signIn: () => setIsAuthenticated(true),
      signOut: () => setIsAuthenticated(false),
    }),
    [isAuthenticated],
  );

  return (
    <AuthContext.Provider value={authValue}>
      <TicketsProvider>
        <NavigationContainer>
          <Stack.Navigator
            screenOptions={{
              headerShown: false,
              // use native-stack 'animation' instead of deprecated/unsupported 'animationEnabled'
              animation: 'default',
            }}
          >
            {isAuthenticated ? (
              <Stack.Group>
                <Stack.Screen name="MainApp" component={MainTabNavigator} />
                <Stack.Screen
                  name="RouteDetail"
                  component={RouteDetailScreen}
                  options={{
                    animation: 'default',
                    // native-stack uses contentStyle instead of cardStyle
                    contentStyle: { backgroundColor: COLORS.background },
                  }}
                />
                <Stack.Screen
                  name="PaymentCheckout"
                  component={PaymentCheckoutScreen}
                  options={{
                    animation: 'default',
                    contentStyle: { backgroundColor: COLORS.background },
                  }}
                />
                <Stack.Screen
                  name="EditProfile"
                  component={EditProfileScreen}
                  options={{
                    animation: 'slide_from_right',
                    contentStyle: { backgroundColor: COLORS.background },
                  }}
                />
              </Stack.Group>
            ) : (
              <Stack.Group screenOptions={{ animation: 'none' }}>
                <Stack.Screen name="Auth" component={LoginScreen} />
                <Stack.Screen
                  name="Register"
                  component={require('../screens/auth/RegisterScreen').default}
                />
              </Stack.Group>
            )}
          </Stack.Navigator>
        </NavigationContainer>
      </TicketsProvider>
    </AuthContext.Provider>
  );
}
