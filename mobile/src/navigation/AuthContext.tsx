import React, { createContext, useContext, useState, useEffect, useCallback } from "react"
import AsyncStorage from '@react-native-async-storage/async-storage'
import { API_URL, apiFetch } from '../services/api'
import type { UserRole, UserData } from '../services/auth'

// Constantes para las claves de almacenamiento
const STORAGE_KEYS = {
  TOKEN: 'auth_token',
  REFRESH_TOKEN: 'auth_refresh_token',
  USER: 'auth_user',
} as const

type AuthContextValue = {
  isAuthenticated: boolean
  isLoading: boolean
  role: UserRole | null
  user: UserData | null
  token: string | null
  refreshToken: string | null
  signIn: (token: string, refreshToken: string, user: UserData) => Promise<void>
  signOut: () => Promise<void>
  refreshAccessToken: () => Promise<boolean>
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(true)
  const [token, setToken] = useState<string | null>(null)
  const [refreshTokenState, setRefreshTokenState] = useState<string | null>(null)
  const [user, setUser] = useState<UserData | null>(null)

  const normalizeRole = (role?: string | null): UserRole | null => {
    if (!role) return null
    const trimmed = role.trim().toLowerCase()
    if (trimmed === 'rider' || trimmed === 'driver' || trimmed === 'admin') return trimmed
    console.warn('[AUTH] Rol desconocido recibido:', role)
    return null
  }

  useEffect(() => {
    loadStorageData()
  }, [])

  const loadStorageData = async () => {
    try {
      const storedToken = await AsyncStorage.getItem(STORAGE_KEYS.TOKEN)
      const storedRefreshToken = await AsyncStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN)
      const storedUser = await AsyncStorage.getItem(STORAGE_KEYS.USER)
      
      if (storedToken && storedUser) {
        setToken(storedToken)
        setRefreshTokenState(storedRefreshToken)
        const parsed = JSON.parse(storedUser)
        const normalizedRole = normalizeRole(parsed?.role)
        if (normalizedRole) {
          setUser({ ...parsed, role: normalizedRole })
        } else {
          await signOut()
        }
      }
    } catch (e) {
      console.error('[AUTH] Failed to load auth data', e)
    } finally {
      setIsLoading(false)
    }
  }

  const signIn = async (newToken: string, newRefreshToken: string, newUser: UserData) => {
    try {
      const normalizedRole = normalizeRole(newUser?.role)
      if (!normalizedRole) {
        throw new Error('Rol de usuario no reconocido en login')
      }
      const userToSave = { ...newUser, role: normalizedRole }

      await AsyncStorage.setItem(STORAGE_KEYS.TOKEN, newToken)
      await AsyncStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, newRefreshToken)
      await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(userToSave))
      setToken(newToken)
      setRefreshTokenState(newRefreshToken)
      setUser(userToSave)
      console.log('[AUTH] SignIn exitoso, rol:', normalizedRole)
    } catch (e) {
      console.error('[AUTH] Failed to save auth data', e)
      throw e // Re-throw para que el componente que llama pueda manejarlo
    }
  }

  const signOut = async () => {
    console.log('[AUTH] Iniciando signOut...')
    // Flujo secuencial (best-effort backend -> limpieza storage -> limpieza memoria)
    try {
      try {
        // No bloquea el logout local si falla el backend.
        await apiFetch(`${API_URL}/auth/logout`, {
          method: 'POST',
          body: JSON.stringify({ refreshToken: refreshTokenState }),
        })
      } catch (e) {
        // Ignorar: aun si hay problema de red / token expirado, se elimina el estado local.
        console.log('[AUTH] Backend logout falló (ignorado):', e)
      }

      await AsyncStorage.multiRemove([STORAGE_KEYS.TOKEN, STORAGE_KEYS.REFRESH_TOKEN, STORAGE_KEYS.USER])
    } catch (e) {
      // Fallback: intentar individualmente
      try {
        await AsyncStorage.removeItem(STORAGE_KEYS.TOKEN)
        await AsyncStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN)
        await AsyncStorage.removeItem(STORAGE_KEYS.USER)
      } catch (inner) {
        console.error('[AUTH] Failed to remove auth data', inner)
      }
    } finally {
      // Garantizar limpieza en memoria aunque el storage falle.
      setToken(null)
      setRefreshTokenState(null)
      setUser(null)
      console.log('[AUTH] SignOut completado')
    }
  }

  const refreshAccessToken = async (): Promise<boolean> => {
    if (!refreshTokenState) return false
    
    try {
      console.log('[AUTH] Intentando refrescar token...')
      const response = await fetch(`${API_URL}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken: refreshTokenState }),
      })
      
      const json = await response.json()
      
      if (response.ok && json.token) {
        await AsyncStorage.setItem(STORAGE_KEYS.TOKEN, json.token)
        setToken(json.token)
        if (json.user) {
          const normalizedRole = normalizeRole(json.user.role)
          if (!normalizedRole) {
            await signOut()
            return false
          }
          const normalizedUser = { ...json.user, role: normalizedRole }
          setUser(normalizedUser)
          await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(normalizedUser))
        }
        console.log('[AUTH] Token refrescado exitosamente')
        return true
      }
      
      // Si el refresh token expiró, cerrar sesión
      console.log('[AUTH] Refresh token expirado, cerrando sesión')
      await signOut()
      return false
    } catch (e) {
      console.error('[AUTH] Failed to refresh token', e)
      return false
    }
  }

  const value: AuthContextValue = {
    isAuthenticated: !!token,
    isLoading,
    role: user?.role || null,
    user,
    token,
    refreshToken: refreshTokenState,
    signIn,
    signOut,
    refreshAccessToken
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used within AuthContext.Provider")
  return ctx
}
