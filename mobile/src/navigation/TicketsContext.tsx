"use client"

import React, { createContext, useContext, useEffect, useMemo, useRef, useState, useCallback } from "react"
import { useAuth } from "./AuthContext"
import { 
  Ticket, 
  TicketType as TicketTypeAPI, 
  getUserTickets, 
  purchaseTicket as purchaseTicketAPI,
  getTicketTypes
} from "../services/tickets"

export type PassStatus = "active" | "expiring_soon" | "expired" | "used" | "cancelled"

export type ActivePass = {
  id: string
  type: string
  ticketNumber: string
  qrCode: string
  qrData: string
  validUntil?: string
  tripsRemaining: number | "unlimited"
  status: PassStatus
  color: string
  category: 'single' | 'multi' | 'time_based'
  timeRemaining: number | null
  purchasedAt: string
}

export type TicketHistoryItem = {
  id: string
  ticketId: string
  type: string
  status: "active" | "used" | "expired" | "cancelled"
  from?: string
  to?: string
  date: string
  time?: string
  color: string
}

type TicketsContextValue = {
  // Data
  currentPass: ActivePass | null
  tickets: ActivePass[]
  history: TicketHistoryItem[]
  availableTicketTypes: TicketTypeAPI[]
  
  // Loading states
  isLoading: boolean
  isPurchasing: boolean
  
  // Actions
  purchasePass: (ticketTypeId: string) => Promise<ActivePass>
  refreshTickets: () => Promise<void>
  refreshTicketTypes: () => Promise<void>
  clearPasses: () => void
}

const TicketsContext = createContext<TicketsContextValue | undefined>(undefined)

export function useTickets() {
  const ctx = useContext(TicketsContext)
  if (!ctx) throw new Error("useTickets must be used within TicketsProvider")
  return ctx
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr)
  const day = d.getDate()
  const month = d.toLocaleString("es-ES", { month: "short" })
  const year = d.getFullYear()
  return `${day} ${month} ${year}`
}

function formatTime(dateStr: string) {
  const d = new Date(dateStr)
  return d.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" })
}

function ticketToActivePass(ticket: Ticket): ActivePass {
  let validUntil: string | undefined = undefined
  
  if (ticket.expiresAt) {
    validUntil = formatDate(ticket.expiresAt)
  } else if (ticket.category === 'time_based' && ticket.durationMinutes) {
    validUntil = `${ticket.durationMinutes} minutos desde activación`
  }
  
  return {
    id: ticket.id,
    type: ticket.name,
    ticketNumber: ticket.ticketNumber,
    qrCode: ticket.qrCode,
    qrData: ticket.qrData,
    validUntil,
    tripsRemaining: ticket.remainingUses,
    status: ticket.status as PassStatus,
    color: ticket.color,
    category: ticket.category,
    timeRemaining: ticket.timeRemaining,
    purchasedAt: ticket.purchasedAt
  }
}

function ticketToHistoryItem(ticket: Ticket): TicketHistoryItem {
  return {
    id: `h-${ticket.id}`,
    ticketId: ticket.ticketNumber,
    type: ticket.name,
    status: ticket.status as "active" | "used" | "expired" | "cancelled",
    date: formatDate(ticket.purchasedAt),
    time: formatTime(ticket.purchasedAt),
    color: ticket.color
  }
}

export function TicketsProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth()
  const previousIsAuthenticated = useRef(isAuthenticated)

  const [tickets, setTickets] = useState<ActivePass[]>([])
  const [history, setHistory] = useState<TicketHistoryItem[]>([])
  const [availableTicketTypes, setAvailableTicketTypes] = useState<TicketTypeAPI[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isPurchasing, setIsPurchasing] = useState(false)

  // Get current active pass (first active ticket)
  const currentPass = useMemo(() => {
    return tickets.find(t => t.status === 'active') || null
  }, [tickets])

  // Fetch user tickets from API
  const refreshTickets = useCallback(async () => {
    if (!isAuthenticated) return
    
    setIsLoading(true)
    try {
      const response = await getUserTickets({ limit: 50 })
      
      const activePasses = response.tickets
        .filter(t => t.status === 'active')
        .map(ticketToActivePass)
      
      const historyItems = response.tickets
        .filter(t => t.status !== 'active')
        .map(ticketToHistoryItem)
      
      setTickets(activePasses)
      setHistory(historyItems)
    } catch (error) {
      console.error('[TicketsContext] Error fetching tickets:', error)
    } finally {
      setIsLoading(false)
    }
  }, [isAuthenticated])

  // Fetch available ticket types
  const refreshTicketTypes = useCallback(async () => {
    try {
      const types = await getTicketTypes(true)
      setAvailableTicketTypes(types)
    } catch (error) {
      console.error('[TicketsContext] Error fetching ticket types:', error)
    }
  }, [])

  // Purchase a new ticket
  const purchasePass = useCallback(async (ticketTypeId: string): Promise<ActivePass> => {
    setIsPurchasing(true)
    try {
      const ticket = await purchaseTicketAPI(ticketTypeId)
      const newPass = ticketToActivePass(ticket)
      
      // Add to tickets list
      setTickets(prev => [newPass, ...prev])
      
      return newPass
    } finally {
      setIsPurchasing(false)
    }
  }, [])

  const clearPasses = useCallback(() => {
    setTickets([])
    setHistory([])
    setAvailableTicketTypes([])
  }, [])

  // Load tickets when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      refreshTickets()
      refreshTicketTypes()
    }
  }, [isAuthenticated, refreshTickets, refreshTicketTypes])

  // Clear data on logout
  useEffect(() => {
    if (previousIsAuthenticated.current && !isAuthenticated) {
      clearPasses()
    }
    previousIsAuthenticated.current = isAuthenticated
  }, [isAuthenticated, clearPasses])

  const value = useMemo(() => ({ 
    currentPass, 
    tickets,
    history, 
    availableTicketTypes,
    isLoading,
    isPurchasing,
    purchasePass, 
    refreshTickets,
    refreshTicketTypes,
    clearPasses 
  }), [
    currentPass, 
    tickets,
    history, 
    availableTicketTypes,
    isLoading,
    isPurchasing,
    purchasePass, 
    refreshTickets,
    refreshTicketTypes,
    clearPasses
  ])
  
  return <TicketsContext.Provider value={value}>{children}</TicketsContext.Provider>
}
