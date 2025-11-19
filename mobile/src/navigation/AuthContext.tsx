import React, { createContext, useContext } from "react"

type AuthContextValue = {
  isAuthenticated: boolean
  signIn: () => void
  signOut: () => void
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used within AuthContext.Provider")
  return ctx
}
