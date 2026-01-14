import type { ExpoConfig, ConfigContext } from 'expo/config'

// URL del API - se puede sobrescribir con EXPO_PUBLIC_API_URL
const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:4000'

// Google Maps API Keys (usar variables de entorno en producción)
const GOOGLE_MAPS_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY || ''

export default function defineConfig({ config }: ConfigContext): ExpoConfig {
  return {
    ...config,
    name: 'SUBA',
    slug: 'suba-transport',
    scheme: 'suba',
    version: '1.0.0',
    orientation: 'portrait',
    userInterfaceStyle: 'light',
    // NOTA: newArchEnabled deshabilitado para compatibilidad con Expo Go
    // Habilitar solo para builds de desarrollo personalizados (expo prebuild)
    // newArchEnabled: true,
    splash: {
      resizeMode: 'contain',
      backgroundColor: '#184E77',
    },
    assetBundlePatterns: ['**/*'],
    ios: {
      supportsTablet: true,
      bundleIdentifier: 'com.suba.transport',
      config: {
        googleMapsApiKey: GOOGLE_MAPS_API_KEY,
      },
    },
    android: {
      package: 'com.suba.transport',
      adaptiveIcon: {
        backgroundColor: '#184E77',
      },
      config: {
        googleMaps: {
          apiKey: GOOGLE_MAPS_API_KEY,
        },
      },
    },
    web: { bundler: 'metro' },
    plugins: [
      [
        'expo-location',
        {
          locationAlwaysAndWhenInUsePermissions:
            'Allow SUBA to access your location to show nearby routes.',
        },
      ],
      // [
      //   'expo-maps',
      //   {
      //     requestLocationPermission: true,
      //     locationPermission:
      //       'Permite que SUBA use tu ubicación para mostrar rutas cercanas',
      //   },
      // ],
    ],
    extra: {
      API_URL,
      eas: {
        projectId: process.env.EAS_PROJECT_ID || 'your-project-id',
      },
    },
    // Expo Go: permitir desarrollo sin configuración adicional
    owner: process.env.EXPO_OWNER || undefined,
  }
}
