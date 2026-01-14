import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

// Puerto del backend API
const API_PORT = 4000;

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
    // Constants.expoConfig?.hostUri contiene "IP:PUERTO" del servidor Expo
    // Ejemplo: "192.168.1.108:8081"
    const hostUri = Constants.expoConfig?.hostUri;
    
    if (hostUri) {
      // Extraer solo la IP (sin el puerto de Expo)
      const host = hostUri.split(':')[0];
      const apiUrl = `http://${host}:${API_PORT}/api`;
      console.log('[API] URL dinámica detectada:', apiUrl);
      return apiUrl;
    }
    
    // Fallback si no hay hostUri (raro, pero por si acaso)
    console.warn('[API] No se pudo detectar IP. Usando localhost');
    return `http://localhost:${API_PORT}/api`;
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
