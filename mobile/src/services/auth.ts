import { API_URL } from './api';

/**
 * Maneja errores de red y devuelve un mensaje amigable
 */
function handleNetworkError(error: any): never {
  console.error('[AUTH] Error de red:', error?.message || error);

  if (
    error?.message?.includes('Network request failed') ||
    error?.message?.includes('fetch failed') ||
    error?.message?.includes('Failed to fetch')
  ) {
    throw new Error(
      'No se puede conectar al servidor. Verifica que:\n' +
        '1. El servidor API esté ejecutándose (npm run dev en la carpeta api)\n' +
        '2. Estés conectado a la misma red WiFi\n' +
        '3. El firewall no esté bloqueando el puerto 4000'
    );
  }

  throw error;
}

function maskEmail(email: string) {
  const [user, domain] = email.split('@');
  if (!domain) return email;
  return `${user.slice(0, 2)}***@${domain}`;
}

async function parseJsonSafe(response: Response) {
  try {
    return await response.json();
  } catch (err) {
    console.warn('[AUTH] No se pudo parsear JSON de la respuesta');
    return null;
  }
}

function buildErrorMessage(context: string, status: number, body: any) {
  const detail =
    body?.error ||
    body?.message ||
    body?.details?.[0]?.message ||
    `Error ${status}`;
  return `[AUTH] ${context} fallo (status=${status}): ${detail}`;
}

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
        throw new Error(json.error || json.details?.[0]?.message || 'Error en registro');
      }
      
      console.log('[AUTH] Registro exitoso!');
      return json;
    } catch (error: any) {
      // Si ya es un error procesado, re-lanzarlo
      if (error.message && !error.message.includes('Network request failed')) {
        throw error;
      }
      handleNetworkError(error);
    }
  },

  // Login unificado - el backend detecta el rol automáticamente
  async login(data: { email: string; password: string }) {
    console.log('[AUTH] Iniciando login...');
    console.log('[AUTH] URL:', `${API_URL}/auth/login`);
    console.log('[AUTH] Email:', maskEmail(data.email));
    
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: data.email, password: data.password }),
      });
      const json = await parseJsonSafe(response);

      console.log('[AUTH] Response status:', response.status);
      if (json) {
        console.log('[AUTH] Response body:', JSON.stringify(json, null, 2));
      }

      if (!response.ok) {
        const message = buildErrorMessage('Login', response.status, json);
        console.error(message);
        throw new Error(message);
      }

      console.log('[AUTH] Login exitoso!');
      return json;
    } catch (error: any) {
      // Si ya es un error procesado, re-lanzarlo
      if (error?.message && !error.message.includes('Network request failed')) {
        throw error;
      }
      handleNetworkError(error);
    }
  }
};
