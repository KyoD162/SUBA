import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// Replace with your machine's IP address if running on physical device
const DEV_API_URL = 'http://192.168.1.104:4000/api'; 
const PROD_API_URL = 'https://api.suba.com/api';

export const API_URL = __DEV__ ? DEV_API_URL : PROD_API_URL;

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
