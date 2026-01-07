import React, { createContext, useContext, useState, useEffect } from "react"
import AsyncStorage from '@react-native-async-storage/async-storage'
import { API_URL, apiFetch } from '../services/api'

type UserRole = 'rider' | 'driver' | 'admin'

interface UserData {
  id: string
  email: string
  role: UserRole
  name?: string
  phone?: string
  city?: string
  documentId?: string
  bio?: string
}

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
  updateUser: (user: UserData) => Promise<void>
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
      const storedToken = await AsyncStorage.getItem('auth_token')
      const storedRefreshToken = await AsyncStorage.getItem('auth_refresh_token')
      const storedUser = await AsyncStorage.getItem('auth_user')
      
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
      console.error('Failed to load auth data', e)
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

      await AsyncStorage.setItem('auth_token', newToken)
      await AsyncStorage.setItem('auth_refresh_token', newRefreshToken)
      await AsyncStorage.setItem('auth_user', JSON.stringify(userToSave))
      setToken(newToken)
      setRefreshTokenState(newRefreshToken)
      setUser(userToSave)
    } catch (e) {
      console.error('Failed to save auth data', e)
    }
  }

  const updateUser = async (newUser: UserData) => {
    const normalizedRole = normalizeRole(newUser?.role)
    if (!normalizedRole) return

    const userToSave = { ...newUser, role: normalizedRole }
    try {
      await AsyncStorage.setItem('auth_user', JSON.stringify(userToSave))
      setUser(userToSave)
    } catch (e) {
      console.error('Failed to update user data', e)
    }
  }

  const signOut = async () => {
    // Flujo secuencial (best-effort backend -> limpieza storage -> limpieza memoria)
    try {
      try {
        // No bloquea el logout local si falla el backend.
        await apiFetch(`${API_URL}/auth/logout`, {
          method: 'POST',
          // El backend actual no requiere body, pero lo dejamos listo para futuros refresh tokens revocables.
          body: JSON.stringify({ refreshToken: refreshTokenState }),
        })
      } catch (e) {
        // Ignorar: aun si hay problema de red / token expirado, se elimina el estado local.
      }

      await AsyncStorage.multiRemove(['auth_token', 'auth_refresh_token', 'auth_user'])
    } catch (e) {
      // Fallback: intentar individualmente
      try {
        await AsyncStorage.removeItem('auth_token')
        await AsyncStorage.removeItem('auth_refresh_token')
        await AsyncStorage.removeItem('auth_user')
      } catch (inner) {
        console.error('Failed to remove auth data', inner)
      }
    } finally {
      // Garantizar limpieza en memoria aunque el storage falle.
      setToken(null)
      setRefreshTokenState(null)
      setUser(null)
    }
  }

  const refreshAccessToken = async (): Promise<boolean> => {
    if (!refreshTokenState) return false
    
    try {
      const response = await fetch(`${API_URL}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken: refreshTokenState }),
      })
      
      const json = await response.json()
      
      if (response.ok && json.token) {
        await AsyncStorage.setItem('auth_token', json.token)
        setToken(json.token)
        if (json.user) {
          const normalizedRole = normalizeRole(json.user.role)
          if (!normalizedRole) {
            await signOut()
            return false
          }
          const normalizedUser = { ...json.user, role: normalizedRole }
          setUser(normalizedUser)
          await AsyncStorage.setItem('auth_user', JSON.stringify(normalizedUser))
        }
        return true
      }
      
      // Si el refresh token expiró, cerrar sesión
      await signOut()
      return false
    } catch (e) {
      console.error('Failed to refresh token', e)
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
    refreshAccessToken,
    updateUser
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
