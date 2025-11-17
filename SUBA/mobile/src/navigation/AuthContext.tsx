import React, { createContext, useContext } from "react"

type UserRole = "user" | "admin"

export interface AuthContextValue {
  isAuthenticated: boolean
  role: UserRole
  isAdmin: boolean
  signIn: () => void
  signInAsAdmin: () => void
  signOut: () => void
  setRole: (r: UserRole) => void
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used within AuthContext.Provider")
  return ctx
}
