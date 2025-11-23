import React from 'react'

export type UserRole = 'user' | 'driver' | 'admin' | null

interface AuthContextValue {
  isAuthenticated: boolean
  role: UserRole
  signInUser: () => void
  signInDriver: () => void
  signInAdmin: () => void
  signOut: () => void
}

export const AuthContext = React.createContext<AuthContextValue | undefined>(undefined)

export function useAuth() {
  const ctx = React.useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthContext.Provider')
  return ctx
}
