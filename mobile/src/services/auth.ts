import { Platform } from 'react-native';

// Replace with your machine's IP address if running on physical device
const DEV_API_URL = 'http://192.168.1.104:4000/api'; 
const PROD_API_URL = 'https://api.suba.com/api';

export const API_URL = __DEV__ ? DEV_API_URL : PROD_API_URL;

export const authService = {
  async registerRider(data: any) {
    console.log('[AUTH] Iniciando registro de rider...');
    console.log('[AUTH] URL:', `${API_URL}/auth/register/rider`);
    console.log('[AUTH] Datos a enviar:', JSON.stringify(data, null, 2));
    
    try {
      const response = await fetch(`${API_URL}/auth/register/rider`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      
      console.log('[AUTH] Response status:', response.status);
      const json = await response.json();
      console.log('[AUTH] Response body:', JSON.stringify(json, null, 2));
      
      if (!response.ok) {
        console.error('[AUTH] Error en registro:', json.error);
        throw new Error(json.error || 'Error en registro');
      }
      
      console.log('[AUTH] Registro exitoso!');
      return json;
    } catch (error: any) {
      console.error('[AUTH] Error de red o fetch:', error.message);
      throw error;
    }
  },

  // Login unificado - el backend detecta el rol automáticamente
  async login(data: { email: string; password: string }) {
    console.log('[AUTH] Iniciando login...');
    console.log('[AUTH] URL:', `${API_URL}/auth/login`);
    console.log('[AUTH] Email:', data.email);
    
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: data.email, password: data.password }),
      });
      
      console.log('[AUTH] Response status:', response.status);
      const json = await response.json();
      console.log('[AUTH] Response body:', JSON.stringify(json, null, 2));
      
      if (!response.ok) {
        console.error('[AUTH] Error en login:', json.error);
        throw new Error(json.error || 'Error en inicio de sesión');
      }
      
      console.log('[AUTH] Login exitoso!');
      return json;
    } catch (error: any) {
      console.error('[AUTH] Error de red o fetch:', error.message);
      throw error;
    }
  }
};
