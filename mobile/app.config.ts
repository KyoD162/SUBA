import type { ExpoConfig } from 'expo/config'

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:4000'

export default function defineConfig(): ExpoConfig {
  return {
    name: 'SUBA',
    slug: 'suba-transport',
    scheme: 'suba',
    version: '1.0.0',
    orientation: 'portrait',
    userInterfaceStyle: 'light',
    splash: {
      resizeMode: 'contain',
      backgroundColor: '#184E77',
    },
    assetBundlePatterns: ['**/*'],
    ios: {
      supportsTablet: true,
      config: {
        googleMapsApiKey: 'YOUR_IOS_GOOGLE_MAPS_API_KEY',
      },
    },
    android: {
      adaptiveIcon: {
        backgroundColor: '#184E77',
      },
      config: {
        googleMaps: {
          apiKey: 'YOUR_ANDROID_GOOGLE_MAPS_API_KEY',
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
      [
        'expo-maps',
        {
          requestLocationPermission: true,
          locationPermission:
            'Permite que SUBA use tu ubicación para mostrar rutas cercanas',
        },
      ],
    ],
    extra: { API_URL },
  }
}
