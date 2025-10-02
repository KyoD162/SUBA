import type { ExpoConfig } from 'expo/config';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:4000';

export default function defineConfig(): ExpoConfig {
  return ({
  name: 'SUBA',
  slug: 'suba',
  scheme: 'suba',
  version: '0.1.0',
  orientation: 'portrait',
  userInterfaceStyle: 'automatic',
    ios: { supportsTablet: true },
    android: {},
  web: { bundler: 'metro' },
  extra: { API_URL },
  });
}
