import { Platform } from 'react-native';

// Replace with your machine's IP address if running on physical device
const DEV_API_URL = 'http://192.168.1.104:4000/api'; 
const PROD_API_URL = 'https://api.suba.com/api';

export const API_URL = __DEV__ ? DEV_API_URL : PROD_API_URL;

export const authService = {
  async registerRider(data: any) {
    const response = await fetch(`${API_URL}/auth/register/rider`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const json = await response.json();
    if (!response.ok) throw new Error(json.error || 'Error en registro');
    return json;
  },

  async login(data: { email: string; password: string; role: 'rider' | 'driver' | 'admin' }) {
    const response = await fetch(`${API_URL}/auth/login/${data.role}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: data.email, password: data.password }),
    });
    const json = await response.json();
    if (!response.ok) throw new Error(json.error || 'Error en inicio de sesión');
    return json;
  }
};
