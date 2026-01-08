import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

// Puerto del backend API
const API_PORT = 4000;

const extractHost = (value: string): string | null => {
  if (!value) return null;
  // Acepta: "192.168.1.10:8081", "exp://192.168.1.10:8081", "http://192.168.1.10:8081/--/..."
  const withoutScheme = value.replace(/^[a-z]+:\/\//i, '');
  const hostPort = withoutScheme.split('/')[0];
  const host = hostPort.split(':')[0];
  return host || null;
};

/**
 * Obtiene la URL del API de forma DINÁMICA
 * 
 * En desarrollo: Usa automáticamente la IP del servidor Expo (funciona en cualquier dispositivo/red)
 * En producción: Usa la URL de producción configurada
 * 
 * NO necesitas configurar nada manualmente - funciona automáticamente para todo el equipo
 */
const getApiUrl = (): string => {
  // 1. Variable de entorno tiene prioridad (para casos especiales o producción)
  const envUrl = process.env.EXPO_PUBLIC_API_URL;
  if (envUrl) {
    console.log('[API] Usando URL de variable de entorno:', envUrl);
    return envUrl.endsWith('/api') ? envUrl : `${envUrl}/api`;
  }
  
  // 2. En desarrollo: Obtener IP automáticamente del servidor Expo
  if (__DEV__) {
    // Intentar detectar el host del servidor Expo en distintas versiones (Expo Go / Dev Client)
    // Valores esperados: "192.168.1.108:8081" o similar
    const hostUri = Constants.expoConfig?.hostUri;
    const debuggerHost =
      (Constants as any).expoGoConfig?.debuggerHost ||
      (Constants as any).manifest?.debuggerHost ||
      (Constants as any).manifest2?.extra?.expoGo?.debuggerHost;
    const linkingUri = (Constants as any).linkingUri;

    const detectedRaw = hostUri || debuggerHost || linkingUri;
    const detectedFrom = hostUri
      ? 'expoConfig.hostUri'
      : debuggerHost
        ? 'debuggerHost'
        : linkingUri
          ? 'linkingUri'
          : null;
    
    if (detectedRaw) {
      const host = extractHost(detectedRaw);
      if (host) {
        // Si estás usando Tunnel, el host puede ser exp.host / *.exp.direct, lo cual NO sirve para tu API local.
        if (host === 'exp.host' || host.endsWith('.exp.direct') || host.endsWith('.expo.dev')) {
          console.warn(
            `[API] Host detectado (${detectedFrom}) apunta a tunnel (${host}). ` +
              'Para consumir tu API local, usa modo LAN o define EXPO_PUBLIC_API_URL con la IP de tu PC.'
          );
        } else {
          const apiUrl = `http://${host}:${API_PORT}/api`;
          console.log(`[API] URL dinámica detectada (${detectedFrom}):`, apiUrl);
          return apiUrl;
        }
      }
    }
    
    // Fallback para emuladores sin hostUri
    // Android emulator usa 10.0.2.2 para acceder al localhost del host
    // iOS simulator puede usar localhost directamente
    const fallbackHost = Platform.OS === 'android' ? '10.0.2.2' : 'localhost';
    const fallbackUrl = `http://${fallbackHost}:${API_PORT}/api`;

    // En un dispositivo físico iOS, "localhost" apunta al teléfono, no al PC.
    // Mejor avisar explícitamente para evitar requests colgadas/confusas.
    if (fallbackHost === 'localhost') {
      console.warn(
        '[API] No se pudo detectar la IP del servidor Expo. En un teléfono, "localhost" NO es tu PC. ' +
          'Configura EXPO_PUBLIC_API_URL con la IP de tu PC (ej: http://192.168.1.50:4000) o ejecuta Expo en modo LAN.'
      );
    } else {
      console.warn('[API] No se pudo detectar IP. Usando fallback:', fallbackUrl);
    }

    return fallbackUrl;
  }
  
  // 3. Producción
  return 'https://api.suba.com/api';
};

export const API_URL = getApiUrl();

// Helper para hacer fetch con auto-refresh de token
export async function apiFetch(url: string, options: RequestInit = {}) {
  const token = await AsyncStorage.getItem('auth_token');
  
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  let response = await fetch(url, { ...options, headers });

  // Si el token expiró, intentar refrescarlo
  if (response.status === 401) {
    const errorData = await response.json();
    
    if (errorData.code === 'TOKEN_EXPIRED') {
      const refreshed = await refreshAccessToken();
      
      if (refreshed) {
        // Reintentar la petición con el nuevo token
        const newToken = await AsyncStorage.getItem('auth_token');
        const newHeaders = {
          ...headers,
          ...(newToken ? { Authorization: `Bearer ${newToken}` } : {}),
        };
        
        response = await fetch(url, { ...options, headers: newHeaders });
      } else {
        // Si no se pudo refrescar, lanzar error para que el usuario se reautentique
        throw new Error('Session expired. Please login again.');
      }
    }
  }

  return response;
}

async function refreshAccessToken(): Promise<boolean> {
  try {
    const refreshToken = await AsyncStorage.getItem('auth_refresh_token');
    if (!refreshToken) return false;

    const response = await fetch(`${API_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });

    const json = await response.json();

    if (response.ok && json.token) {
      await AsyncStorage.setItem('auth_token', json.token);
      if (json.user) {
        await AsyncStorage.setItem('auth_user', JSON.stringify(json.user));
      }
      return true;
    }

    return false;
  } catch (e) {
    console.error('Failed to refresh token', e);
    return false;
  }
}
