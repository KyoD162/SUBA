import React, { createContext, useContext, useState, useEffect } from "react"
import AsyncStorage from '@react-native-async-storage/async-storage'

type UserRole = 'rider' | 'driver' | 'admin'

interface UserData {
  id: string
  email: string
  role: UserRole
  name?: string
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
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(true)
  const [token, setToken] = useState<string | null>(null)
  const [refreshTokenState, setRefreshTokenState] = useState<string | null>(null)
  const [user, setUser] = useState<UserData | null>(null)

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
        setUser(JSON.parse(storedUser))
      }
    } catch (e) {
      console.error('Failed to load auth data', e)
    } finally {
      setIsLoading(false)
    }
  }

  const signIn = async (newToken: string, newRefreshToken: string, newUser: UserData) => {
    try {
      await AsyncStorage.setItem('auth_token', newToken)
      await AsyncStorage.setItem('auth_refresh_token', newRefreshToken)
      await AsyncStorage.setItem('auth_user', JSON.stringify(newUser))
      setToken(newToken)
      setRefreshTokenState(newRefreshToken)
      setUser(newUser)
    } catch (e) {
      console.error('Failed to save auth data', e)
    }
  }

  const signOut = async () => {
    try {
      await AsyncStorage.removeItem('auth_token')
      await AsyncStorage.removeItem('auth_refresh_token')
      await AsyncStorage.removeItem('auth_user')
      setToken(null)
      setRefreshTokenState(null)
      setUser(null)
    } catch (e) {
      console.error('Failed to remove auth data', e)
    }
  }

  const refreshAccessToken = async (): Promise<boolean> => {
    if (!refreshTokenState) return false
    
    try {
      // Importar API_URL desde el servicio centralizado
      const { API_URL } = require('../services/auth')
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
          setUser(json.user)
          await AsyncStorage.setItem('auth_user', JSON.stringify(json.user))
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
