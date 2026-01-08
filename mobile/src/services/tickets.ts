import { apiFetch, API_URL } from './api';

// ==========================================
// TYPES
// ==========================================

export type TicketTypeCategory = 'single' | 'multi' | 'time_based';
export type TicketStatus = 'active' | 'used' | 'expired' | 'cancelled';

export interface TicketType {
  _id: string;
  name: string;
  description: string;
  category: TicketTypeCategory;
  price: number;
  usageLimit: number | null;
  durationMinutes: number | null;
  isActive: boolean;
  color: string;
  icon: string;
}

export interface TicketUsage {
  usedAt: string;
  tripId?: string;
  driverId?: string;
  location?: {
    lat: number;
    lng: number;
  };
}

export interface Ticket {
  id: string;
  ticketNumber: string;
  qrCode: string;
  qrData: string;
  name: string;
  category: TicketTypeCategory;
  price: number;
  usageLimit: number | null;
  durationMinutes: number | null;
  color: string;
  icon: string;
  status: TicketStatus;
  usageCount: number;
  usageHistory?: TicketUsage[];
  remainingUses: number | 'unlimited';
  timeRemaining: number | null;
  expiresAt: string | null;
  activatedAt: string | null;
  purchasedAt: string;
}

export interface TicketStats {
  totalTickets: number;
  activeTickets: number;
  usedTickets: number;
  expiredTickets: number;
  totalRevenue: number;
  ticketsByCategory: Record<string, number>;
}

// ==========================================
// TICKET TYPES API (for purchasing options)
// ==========================================

export async function getTicketTypes(activeOnly: boolean = true): Promise<TicketType[]> {
  const response = await apiFetch(`${API_URL}/tickets/types?activeOnly=${activeOnly}`);
  if (!response.ok) {
    throw new Error('Error al obtener tipos de tickets');
  }
  const data = await response.json();
  return data.ticketTypes;
}

export async function getTicketType(id: string): Promise<TicketType> {
  const response = await apiFetch(`${API_URL}/tickets/types/${id}`);
  if (!response.ok) {
    throw new Error('Error al obtener tipo de ticket');
  }
  const data = await response.json();
  return data.ticketType;
}

// ==========================================
// ADMIN: TICKET TYPES MANAGEMENT
// ==========================================

export async function createTicketType(ticketType: Omit<TicketType, '_id'>): Promise<TicketType> {
  const response = await apiFetch(`${API_URL}/tickets/types`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(ticketType)
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Error al crear tipo de ticket');
  }
  const data = await response.json();
  return data.ticketType;
}

export async function updateTicketType(id: string, updates: Partial<TicketType>): Promise<TicketType> {
  const response = await apiFetch(`${API_URL}/tickets/types/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates)
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Error al actualizar tipo de ticket');
  }
  const data = await response.json();
  return data.ticketType;
}

export async function deleteTicketType(id: string): Promise<void> {
  const response = await apiFetch(`${API_URL}/tickets/types/${id}`, {
    method: 'DELETE'
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Error al eliminar tipo de ticket');
  }
}

// ==========================================
// USER TICKETS API
// ==========================================

export async function purchaseTicket(ticketTypeId: string): Promise<Ticket> {
  const response = await apiFetch(`${API_URL}/tickets/purchase`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ticketTypeId })
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Error al comprar ticket');
  }
  const data = await response.json();
  return data.ticket;
}

export interface GetTicketsOptions {
  status?: TicketStatus;
  page?: number;
  limit?: number;
}

export interface GetTicketsResponse {
  tickets: Ticket[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export async function getUserTickets(options: GetTicketsOptions = {}): Promise<GetTicketsResponse> {
  const params = new URLSearchParams();
  if (options.status) params.append('status', options.status);
  if (options.page) params.append('page', options.page.toString());
  if (options.limit) params.append('limit', options.limit.toString());
  
  const queryString = params.toString();
  const url = `${API_URL}/tickets/my-tickets${queryString ? `?${queryString}` : ''}`;
  
  const response = await apiFetch(url);
  if (!response.ok) {
    throw new Error('Error al obtener tickets');
  }
  return response.json();
}

export async function getTicketDetail(id: string): Promise<Ticket> {
  const response = await apiFetch(`${API_URL}/tickets/my-tickets/${id}`);
  if (!response.ok) {
    throw new Error('Error al obtener ticket');
  }
  const data = await response.json();
  return data.ticket;
}

// ==========================================
// DRIVER: TICKET VALIDATION/REDEMPTION
// ==========================================

export interface ValidateTicketResponse {
  valid: boolean;
  ticket?: {
    ticketNumber: string;
    name: string;
    category: TicketTypeCategory;
    status: TicketStatus;
    usageCount: number;
    remainingUses: number | 'unlimited';
    timeRemaining: number | null;
    user: {
      name: string;
      email: string;
    };
  };
  error?: string;
}

export async function validateTicket(qrCode: string): Promise<ValidateTicketResponse> {
  const response = await apiFetch(`${API_URL}/tickets/validate/${qrCode}`);
  return response.json();
}

export interface RedeemTicketRequest {
  qrCode: string;
  tripId?: string;
  location?: {
    lat: number;
    lng: number;
  };
}

export interface RedeemTicketResponse {
  message: string;
  ticket: {
    ticketNumber: string;
    name: string;
    status: TicketStatus;
    usageCount: number;
    remainingUses: number | 'unlimited';
    timeRemaining: number | null;
  };
}

export async function redeemTicket(data: RedeemTicketRequest): Promise<RedeemTicketResponse> {
  const response = await apiFetch(`${API_URL}/tickets/redeem`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Error al canjear ticket');
  }
  return response.json();
}

// ==========================================
// ADMIN: STATISTICS
// ==========================================

export async function getTicketStats(): Promise<TicketStats> {
  const response = await apiFetch(`${API_URL}/tickets/stats`);
  if (!response.ok) {
    throw new Error('Error al obtener estadísticas');
  }
  const data = await response.json();
  return data.stats;
}
