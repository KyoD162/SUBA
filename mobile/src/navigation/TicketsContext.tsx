"use client"

import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from "react"
import { useAuth } from "./AuthContext"

export type PassStatus = "active" | "expiring_soon" | "expired"

export type ActivePass = {
  id: string
  type: string
  ticketNumber: string
  validUntil?: string
  tripsRemaining: number | "unlimited"
  status: PassStatus
  color?: string
}

export type TicketHistoryItem = {
  id: string
  ticketId: string
  type: string
  status: "active" | "used" | "expired"
  from?: string
  to?: string
  date: string
  time?: string
}

type TicketsContextValue = {
  currentPass: ActivePass | null
  history: TicketHistoryItem[]
  purchasePass: (params: { kind: "single" | "bundle" | "unlimited"; trips?: number; priceUSD: number }) => ActivePass
  clearPasses: () => void
}

const TicketsContext = createContext<TicketsContextValue | undefined>(undefined)

export function useTickets() {
  const ctx = useContext(TicketsContext)
  if (!ctx) throw new Error("useTickets must be used within TicketsProvider")
  return ctx
}

function formatDate(d = new Date()) {
  const day = d.getDate()
  const month = d.toLocaleString("es-ES", { month: "short" })
  const year = d.getFullYear()
  return `${day} ${month} ${year}`
}

export function TicketsProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth()
  const previousIsAuthenticated = useRef(isAuthenticated)

  const [currentPass, setCurrentPass] = useState<ActivePass | null>(null)
  const [history, setHistory] = useState<TicketHistoryItem[]>([
    // seed minimal history for realism
    {
      id: "h-1",
      ticketId: "TKT-2024-156",
      type: "Viaje Sencillo",
      status: "used",
      from: "Terminal Central",
      to: "Parque Bolívar",
      date: "5 Nov 2025",
      time: "14:15 PM",
    },
    {
      id: "h-2",
      ticketId: "TKT-2024-155",
      type: "Viaje Sencillo",
      status: "used",
      from: "Plaza de Bolívar",
      to: "Centro Comercial",
      date: "4 Nov 2025",
      time: "10:30 AM",
    },
  ])

  const purchasePass: TicketsContextValue["purchasePass"] = ({ kind, trips, priceUSD }) => {
    const now = new Date()
    const idSuffix = Math.floor(100 + Math.random() * 900)
    const ticketNumber = `TKT-${now.getFullYear()}-${idSuffix}`

    let newPass: ActivePass
    if (kind === "unlimited") {
      const validUntilDate = new Date(now)
      validUntilDate.setDate(validUntilDate.getDate() + 30)
      newPass = {
        id: `p-${Date.now()}`,
        type: "Mensual Ilimitado",
        ticketNumber,
        validUntil: formatDate(validUntilDate),
        tripsRemaining: "unlimited",
        status: "active",
      }
    } else if (kind === "bundle") {
      const count = Math.max(1, trips || 10)
      newPass = {
        id: `p-${Date.now()}`,
        type: `${count} Viajes`,
        ticketNumber,
        tripsRemaining: count,
        status: "active",
      }
    } else {
      // single
      newPass = {
        id: `p-${Date.now()}`,
        type: "Viaje Sencillo",
        ticketNumber,
        tripsRemaining: 1,
        status: "active",
      }
    }

    setCurrentPass(newPass)
    setHistory((prev) => [
      {
        id: `h-${Date.now()}`,
        ticketId: ticketNumber,
        type: newPass.type,
        status: "active",
        date: formatDate(now),
      },
      ...prev,
    ])
    return newPass
  }

  const clearPasses = () => {
    setCurrentPass(null)
    setHistory([])
  }

  // Limpia datos sensibles al cerrar sesión (solo en transición true -> false)
  useEffect(() => {
    if (previousIsAuthenticated.current && !isAuthenticated) {
      clearPasses()
    }
    previousIsAuthenticated.current = isAuthenticated
  }, [isAuthenticated])

  const value = useMemo(() => ({ currentPass, history, purchasePass, clearPasses }), [currentPass, history])
  return <TicketsContext.Provider value={value}>{children}</TicketsContext.Provider>
}
