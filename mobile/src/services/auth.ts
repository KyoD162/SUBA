import { API_URL } from './api'
import { sanitizeInput } from '../utils/validation'

// === TIPOS ===
export type UserRole = 'rider' | 'driver' | 'admin'

export interface LoginData {
  email: string
  password: string
}

export interface RegisterRiderData {
  email: string
  password: string
  name: string
  phone?: string
  specialDiscount?: 'none' | 'student' | 'disabled' | 'senior'
}

export interface RegisterDriverData {
  email: string
  password: string
  name: string
  phone: string
  licenseNumber: string
  vehiclePlate: string
  vehicleModel?: string
}

export interface RegisterAdminData {
  email: string
  password: string
  name: string
  phone: string
  department?: string
}

export interface UserData {
  id: string
  email: string
  role: UserRole
  name?: string
}

export interface AuthResponse {
  token: string
  refreshToken: string
  user: UserData
}

export interface AuthError {
  code: string
  message: string
  userMessage: string
}

// === CONSTANTES ===
const REQUEST_TIMEOUT = 15000 // 15 segundos

// Mensajes de error amigables en español
const ERROR_MESSAGES: Record<string, string> = {
  NETWORK_ERROR: 'No se pudo conectar con el servidor. Verifica tu conexión a internet.',
  TIMEOUT: 'El servidor no respondió a tiempo. Intenta de nuevo.',
  INVALID_CREDENTIALS: 'Correo o contraseña incorrectos.',
  USER_NOT_FOUND: 'No existe una cuenta con este correo electrónico.',
  ACCOUNT_DISABLED: 'Tu cuenta ha sido desactivada. Contacta al soporte.',
  TOO_MANY_ATTEMPTS: 'Demasiados intentos fallidos. Espera unos minutos.',
  SERVER_ERROR: 'Error del servidor. Intenta más tarde.',
  UNKNOWN_ERROR: 'Ocurrió un error inesperado. Intenta de nuevo.',
  VALIDATION_ERROR: 'Por favor verifica los datos ingresados.',
  EMAIL_IN_USE: 'Ya existe una cuenta con este correo electrónico.',
  REGISTRATION_FAILED: 'No se pudo completar el registro. Intenta de nuevo.',
  INSUFFICIENT_PERMISSIONS: 'No tienes permisos para realizar esta acción.',
  UNAUTHORIZED: 'Debes iniciar sesión para continuar.',
}

// === UTILIDADES ===
function maskEmail(email: string): string {
  const [user, domain] = email.split('@')
  if (!domain) return email
  return `${user.slice(0, 2)}***@${domain}`
}

async function parseJsonSafe(response: Response): Promise<any | null> {
  try {
    const text = await response.text()
    return text ? JSON.parse(text) : null
  } catch {
    console.warn('[AUTH] No se pudo parsear JSON de la respuesta')
    return null
  }
}

function fetchWithTimeout(url: string, options: RequestInit, timeout: number = REQUEST_TIMEOUT): Promise<Response> {
  return new Promise((resolve, reject) => {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => {
      controller.abort()
      reject(new Error('TIMEOUT'))
    }, timeout)

    fetch(url, { ...options, signal: controller.signal })
      .then((response) => {
        clearTimeout(timeoutId)
        resolve(response)
      })
      .catch((error) => {
        clearTimeout(timeoutId)
        reject(error)
      })
  })
}

function mapHttpStatusToErrorCode(status: number, body: any): string {
  // Primero revisar si el backend envía un código de error específico
  if (body?.code) return body.code
  if (body?.error) {
    const errorLower = body.error.toLowerCase()
    if (errorLower.includes('credential') || errorLower.includes('password') || errorLower.includes('invalid')) {
      return 'INVALID_CREDENTIALS'
    }
    if (errorLower.includes('not found') || errorLower.includes('no user')) {
      return 'USER_NOT_FOUND'
    }
    if (errorLower.includes('disabled') || errorLower.includes('blocked')) {
      return 'ACCOUNT_DISABLED'
    }
  }

  // Mapeo por código HTTP
  switch (status) {
    case 400:
      return 'VALIDATION_ERROR'
    case 401:
      return 'INVALID_CREDENTIALS'
    case 403:
      return 'ACCOUNT_DISABLED'
    case 404:
      return 'USER_NOT_FOUND'
    case 429:
      return 'TOO_MANY_ATTEMPTS'
    case 500:
    case 502:
    case 503:
    case 504:
      return 'SERVER_ERROR'
    default:
      return 'UNKNOWN_ERROR'
  }
}

function createAuthError(code: string, technicalMessage: string): AuthError {
  return {
    code,
    message: technicalMessage,
    userMessage: ERROR_MESSAGES[code] || ERROR_MESSAGES.UNKNOWN_ERROR,
  }
}

function handleNetworkError(error: any): never {
  console.error('[AUTH] Error de red:', error?.message || error)

  if (error?.message === 'TIMEOUT' || error?.name === 'AbortError') {
    throw createAuthError('TIMEOUT', `Timeout conectando a ${API_URL}`)
  }

  if (
    error?.message?.includes('Network request failed') ||
    error?.message?.includes('fetch failed') ||
    error?.message?.includes('Failed to fetch')
  ) {
    throw createAuthError(
      'NETWORK_ERROR',
      `No se pudo conectar a ${API_URL}. Verifica que el servidor esté corriendo y la URL sea accesible.`
    )
  }

  throw createAuthError('UNKNOWN_ERROR', error?.message || 'Error desconocido')
}

// === SERVICIO DE AUTENTICACIÓN ===
export const authService = {
  /**
   * Registro de usuario tipo rider (pasajero)
   * Solo los riders se registran desde la app móvil principal
   */
  async registerRider(data: RegisterRiderData): Promise<AuthResponse> {
    console.log('[AUTH] Iniciando registro de rider...')
    console.log('[AUTH] URL:', `${API_URL}/auth/register/rider`)

    // Sanitizar datos
    const sanitizedData = {
      email: sanitizeInput(data.email.toLowerCase().trim()),
      password: data.password.trim(),
      name: sanitizeInput(data.name.trim()),
      phone: data.phone ? sanitizeInput(data.phone.trim()) : undefined,
      specialDiscount: data.specialDiscount || 'none',
    }

    console.log('[AUTH] Email:', maskEmail(sanitizedData.email))
    console.log('[AUTH] Nombre:', sanitizedData.name)

    try {
      const response = await fetchWithTimeout(`${API_URL}/auth/register/rider`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sanitizedData),
      })

      const json = await parseJsonSafe(response)
      console.log('[AUTH] Response status:', response.status)

      if (!response.ok) {
        // Mapear error específico de email duplicado
        if (response.status === 409 || json?.error?.toLowerCase().includes('email in use')) {
          throw createAuthError('EMAIL_IN_USE', json?.error || 'Email ya registrado')
        }
        
        const errorCode = mapHttpStatusToErrorCode(response.status, json)
        const technicalMessage = json?.error || json?.message || `HTTP ${response.status}`
        console.error(`[AUTH] Registro falló: ${technicalMessage}`)
        throw createAuthError(errorCode, technicalMessage)
      }

      // Validar respuesta del servidor
      if (!json?.token || !json?.user) {
        console.error('[AUTH] Respuesta del servidor incompleta')
        throw createAuthError('REGISTRATION_FAILED', 'Respuesta del servidor incompleta')
      }

      console.log('[AUTH] Registro exitoso! ID:', json.user.id)
      return json as AuthResponse
    } catch (error: any) {
      if (error.code && error.userMessage) {
        throw error
      }
      handleNetworkError(error)
    }
  },

  /**
   * Login unificado - el backend detecta el rol automáticamente
   */
  async login(data: LoginData): Promise<AuthResponse> {
    console.log('[AUTH] Iniciando login...')
    console.log('[AUTH] URL:', `${API_URL}/auth/login`)

    // Sanitizar y preparar datos
    const sanitizedEmail = sanitizeInput(data.email.toLowerCase().trim())
    const trimmedPassword = data.password.trim()
    const passwordTrimmed = trimmedPassword.length !== data.password.length

    console.log('[AUTH] Email:', maskEmail(sanitizedEmail))
    console.log('[AUTH] Password length:', trimmedPassword.length)
    if (passwordTrimmed) {
      console.warn('[AUTH] Password tenía espacios al inicio/fin; se recortaron')
    }

    try {
      const response = await fetchWithTimeout(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email: sanitizedEmail, 
          password: trimmedPassword 
        }),
      })

      const json = await parseJsonSafe(response)
      console.log('[AUTH] Response status:', response.status)
      
      if (json && process.env.NODE_ENV !== 'production') {
        // Solo loguear en desarrollo, ocultando datos sensibles
        const safeJson = { ...json, token: json?.token ? '[OCULTO]' : undefined }
        console.log('[AUTH] Response body:', JSON.stringify(safeJson, null, 2))
      }

      if (!response.ok) {
        const errorCode = mapHttpStatusToErrorCode(response.status, json)
        const technicalMessage = json?.error || json?.message || `HTTP ${response.status}`
        console.error(`[AUTH] Login falló: ${technicalMessage}`)
        throw createAuthError(errorCode, technicalMessage)
      }

      // Validar respuesta del servidor
      if (!json?.token || !json?.user) {
        console.error('[AUTH] Respuesta del servidor incompleta')
        throw createAuthError('SERVER_ERROR', 'Respuesta del servidor incompleta')
      }

      // Validar rol
      const validRoles = ['rider', 'driver', 'admin']
      if (!json.user.role || !validRoles.includes(json.user.role)) {
        console.error('[AUTH] Rol de usuario inválido:', json.user.role)
        throw createAuthError('SERVER_ERROR', `Rol inválido: ${json.user.role}`)
      }

      console.log('[AUTH] Login exitoso! Rol:', json.user.role)
      return json as AuthResponse
    } catch (error: any) {
      // Si ya es un AuthError, re-lanzar
      if (error.code && error.userMessage) {
        throw error
      }
      // Si no, procesar como error de red
      handleNetworkError(error)
    }
  },

  /**
   * Verificar si un error es de tipo AuthError
   */
  isAuthError(error: any): error is AuthError {
    return error && typeof error.code === 'string' && typeof error.userMessage === 'string'
  },

  /**
   * Obtener mensaje amigable de cualquier error
   */
  getErrorMessage(error: any): string {
    if (this.isAuthError(error)) {
      return error.userMessage
    }
    if (error?.message) {
      // Limpiar mensajes técnicos para el usuario
      const msg = error.message
      if (msg.includes('[AUTH]')) {
        return ERROR_MESSAGES.UNKNOWN_ERROR
      }
      return msg
    }
    return ERROR_MESSAGES.UNKNOWN_ERROR
  },

  /**
   * Registro de conductor (solo para admins)
   * Requiere token de administrador en el header
   */
  async registerDriver(data: RegisterDriverData, adminToken: string): Promise<AuthResponse> {
    console.log('[AUTH] Iniciando registro de driver (admin)...')
    console.log('[AUTH] URL:', `${API_URL}/auth/register/driver`)

    const sanitizedData = {
      email: sanitizeInput(data.email.toLowerCase().trim()),
      password: data.password.trim(),
      name: sanitizeInput(data.name.trim()),
      phone: sanitizeInput(data.phone.trim()),
      licenseNumber: sanitizeInput(data.licenseNumber.trim()),
      vehiclePlate: sanitizeInput(data.vehiclePlate.trim().toUpperCase()),
      vehicleModel: data.vehicleModel ? sanitizeInput(data.vehicleModel.trim()) : undefined,
    }

    console.log('[AUTH] Email conductor:', maskEmail(sanitizedData.email))

    try {
      const response = await fetchWithTimeout(`${API_URL}/auth/register/driver`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`,
        },
        body: JSON.stringify(sanitizedData),
      })

      const json = await parseJsonSafe(response)
      console.log('[AUTH] Response status:', response.status)

      if (!response.ok) {
        if (response.status === 401) {
          throw createAuthError('UNAUTHORIZED', json?.error || 'Token inválido')
        }
        if (response.status === 403) {
          throw createAuthError('INSUFFICIENT_PERMISSIONS', json?.error || 'Sin permisos')
        }
        if (response.status === 409 || json?.error?.toLowerCase().includes('email in use')) {
          throw createAuthError('EMAIL_IN_USE', json?.error || 'Email ya registrado')
        }
        
        const errorCode = mapHttpStatusToErrorCode(response.status, json)
        throw createAuthError(errorCode, json?.error || `HTTP ${response.status}`)
      }

      if (!json?.token || !json?.user) {
        throw createAuthError('REGISTRATION_FAILED', 'Respuesta del servidor incompleta')
      }

      console.log('[AUTH] Driver registrado! ID:', json.user.id)
      return json as AuthResponse
    } catch (error: any) {
      if (error.code && error.userMessage) {
        throw error
      }
      handleNetworkError(error)
    }
  },

  /**
   * Registro de administrador (solo para admins existentes)
   * Requiere token de administrador en el header
   */
  async registerAdmin(data: RegisterAdminData, adminToken: string): Promise<AuthResponse> {
    console.log('[AUTH] Iniciando registro de admin (admin)...')
    console.log('[AUTH] URL:', `${API_URL}/auth/register/admin`)

    const sanitizedData = {
      email: sanitizeInput(data.email.toLowerCase().trim()),
      password: data.password.trim(),
      name: sanitizeInput(data.name.trim()),
      phone: sanitizeInput(data.phone.trim()),
      department: data.department ? sanitizeInput(data.department.trim()) : undefined,
    }

    console.log('[AUTH] Email admin:', maskEmail(sanitizedData.email))

    try {
      const response = await fetchWithTimeout(`${API_URL}/auth/register/admin`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`,
        },
        body: JSON.stringify(sanitizedData),
      })

      const json = await parseJsonSafe(response)
      console.log('[AUTH] Response status:', response.status)

      if (!response.ok) {
        if (response.status === 401) {
          throw createAuthError('UNAUTHORIZED', json?.error || 'Token inválido')
        }
        if (response.status === 403) {
          throw createAuthError('INSUFFICIENT_PERMISSIONS', json?.error || 'Sin permisos')
        }
        if (response.status === 409 || json?.error?.toLowerCase().includes('email in use')) {
          throw createAuthError('EMAIL_IN_USE', json?.error || 'Email ya registrado')
        }
        
        const errorCode = mapHttpStatusToErrorCode(response.status, json)
        throw createAuthError(errorCode, json?.error || `HTTP ${response.status}`)
      }

      if (!json?.token || !json?.user) {
        throw createAuthError('REGISTRATION_FAILED', 'Respuesta del servidor incompleta')
      }

      console.log('[AUTH] Admin registrado! ID:', json.user.id)
      return json as AuthResponse
    } catch (error: any) {
      if (error.code && error.userMessage) {
        throw error
      }
      handleNetworkError(error)
    }
  },
}
