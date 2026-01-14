import { apiFetch, API_URL } from './api';

// ==========================================
// TYPES
// ==========================================

export interface AdminUser {
  id: string;
  email: string;
  name?: string;
  phone?: string;
  type: 'Estudiante' | 'Adulto' | 'Tercera Edad' | 'Especial';
  status: 'Activo' | 'Inactivo';
  registeredAt: string;
  balance: number;
  trips: number;
}

export interface AdminDriver {
  id: string;
  email: string;
  name?: string;
  phone?: string;
  vehicle: string;
  status: 'Activo' | 'Inactivo';
  registeredAt: string;
  salary: number;
  trips: number;
  licenseNumber?: string;
  vehiclePlate?: string;
  rating?: number;
}

export interface DashboardStats {
  totalUsers: number;
  totalRiders: number;
  totalDrivers: number;
  totalAdmins: number;
  activeDrivers: number;
  totalTickets: number;
  activeTickets: number;
  totalRevenue: number;
  userDistribution: Record<string, number>;
  dailyRevenue: Array<{
    _id: string;
    revenue: number;
    count: number;
  }>;
}

export interface RecentActivity {
  users: AdminUser[];
  tickets: Array<{
    id: string;
    ticketNumber: string;
    name: string;
    price: number;
    status: string;
    purchasedAt: string;
    user: {
      name?: string;
      email: string;
    };
  }>;
}

export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export interface PricingConfig {
  basePrice: number;
  bsPrice: number;
  exchangeRate: number;
  discounts: {
    adult: { active: boolean; discount: number };
    student: { active: boolean; discount: number };
    senior: { active: boolean; discount: number };
    disability: { active: boolean; discount: number };
  };
  ticketTypes: Array<{
    id: string;
    name: string;
    price: number;
    category: string;
  }>;
}

// ==========================================
// DASHBOARD
// ==========================================

export async function getDashboardStats(): Promise<{
  stats: DashboardStats;
  recentActivity: RecentActivity;
}> {
  const response = await apiFetch(`${API_URL}/admin/dashboard`);
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Error al obtener estadísticas');
  }
  return response.json();
}

// ==========================================
// USERS MANAGEMENT
// ==========================================

export interface GetUsersOptions {
  page?: number;
  limit?: number;
  search?: string;
  type?: string;
  status?: string;
}

export async function getUsers(options: GetUsersOptions = {}): Promise<{
  users: AdminUser[];
  pagination: PaginationInfo;
}> {
  const params = new URLSearchParams();
  if (options.page) params.append('page', options.page.toString());
  if (options.limit) params.append('limit', options.limit.toString());
  if (options.search) params.append('search', options.search);
  if (options.type && options.type !== 'Todos los tipos') params.append('type', options.type);
  if (options.status) params.append('status', options.status);

  const queryString = params.toString();
  const url = `${API_URL}/admin/users${queryString ? `?${queryString}` : ''}`;

  const response = await apiFetch(url);
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Error al obtener usuarios');
  }
  
  const data = await response.json();
  
  // Format dates for display
  const users = data.users.map((user: any) => ({
    ...user,
    registeredAt: new Date(user.createdAt).toLocaleDateString('es-VE')
  }));

  return { users, pagination: data.pagination };
}

export async function updateUser(id: string, data: Partial<AdminUser>): Promise<AdminUser> {
  const response = await apiFetch(`${API_URL}/admin/users/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Error al actualizar usuario');
  }
  const result = await response.json();
  return result.user;
}

export async function deleteUser(id: string): Promise<void> {
  const response = await apiFetch(`${API_URL}/admin/users/${id}`, {
    method: 'DELETE'
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Error al eliminar usuario');
  }
}

// ==========================================
// DRIVERS MANAGEMENT
// ==========================================

export interface GetDriversOptions {
  page?: number;
  limit?: number;
  search?: string;
  vehicle?: string;
  status?: string;
}

export async function getDrivers(options: GetDriversOptions = {}): Promise<{
  drivers: AdminDriver[];
  pagination: PaginationInfo;
}> {
  const params = new URLSearchParams();
  if (options.page) params.append('page', options.page.toString());
  if (options.limit) params.append('limit', options.limit.toString());
  if (options.search) params.append('search', options.search);
  if (options.vehicle && options.vehicle !== 'Todos los tipos') params.append('vehicle', options.vehicle);
  if (options.status) params.append('status', options.status);

  const queryString = params.toString();
  const url = `${API_URL}/admin/drivers${queryString ? `?${queryString}` : ''}`;

  const response = await apiFetch(url);
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Error al obtener conductores');
  }
  
  const data = await response.json();
  
  // Format dates for display
  const drivers = data.drivers.map((driver: any) => ({
    ...driver,
    registeredAt: new Date(driver.createdAt).toLocaleDateString('es-VE')
  }));

  return { drivers, pagination: data.pagination };
}

export interface CreateDriverData {
  email: string;
  password: string;
  name: string;
  phone?: string;
  licenseNumber: string;
  vehiclePlate: string;
  vehicleModel?: string;
}

export async function createDriver(data: CreateDriverData): Promise<AdminDriver> {
  const response = await apiFetch(`${API_URL}/admin/drivers`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Error al crear conductor');
  }
  const result = await response.json();
  return result.driver;
}

export async function updateDriver(id: string, data: Partial<AdminDriver>): Promise<AdminDriver> {
  const response = await apiFetch(`${API_URL}/admin/drivers/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Error al actualizar conductor');
  }
  const result = await response.json();
  return result.driver;
}

export async function deleteDriver(id: string): Promise<void> {
  const response = await apiFetch(`${API_URL}/admin/drivers/${id}`, {
    method: 'DELETE'
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Error al eliminar conductor');
  }
}

// ==========================================
// PRICING MANAGEMENT
// ==========================================

export async function getPricing(): Promise<PricingConfig> {
  const response = await apiFetch(`${API_URL}/admin/pricing`);
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Error al obtener precios');
  }
  const data = await response.json();
  return data.pricing;
}

export async function updatePricing(data: {
  basePrice?: number;
  exchangeRate?: number;
  discounts?: PricingConfig['discounts'];
}): Promise<PricingConfig> {
  const response = await apiFetch(`${API_URL}/admin/pricing`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Error al actualizar precios');
  }
  const result = await response.json();
  return result.pricing;
}
