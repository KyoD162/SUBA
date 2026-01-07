import { API_URL, apiFetch } from './api'
import { sanitizeInput } from '../utils/validation'

export type UserRole = 'rider' | 'driver' | 'admin'

export interface UserProfile {
  id: string
  email: string
  role: UserRole
  name?: string
  phone?: string
  city?: string
  documentId?: string
  bio?: string
}

export interface UpdateUserPayload {
  name?: string
  email?: string
  phone?: string
  city?: string
  documentId?: string
  bio?: string
}

const parseUser = (data: any): UserProfile => ({
  id: data?.id,
  email: data?.email,
  role: data?.role,
  name: data?.name,
  phone: data?.phone,
  city: data?.city,
  documentId: data?.documentId,
  bio: data?.bio,
})

export const userService = {
  async getById(id: string): Promise<UserProfile> {
    const response = await apiFetch(`${API_URL}/users/${id}`)
    const json = await response.json()

    if (!response.ok) {
      throw new Error(json?.error || 'No se pudo obtener el usuario')
    }

    if (!json?.user) throw new Error('Respuesta de usuario inválida')

    return parseUser(json.user)
  },

  async update(id: string, payload: UpdateUserPayload): Promise<UserProfile> {
    const response = await apiFetch(`${API_URL}/users/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({
        ...payload,
        name: payload.name ? sanitizeInput(payload.name) : payload.name,
        city: payload.city ? sanitizeInput(payload.city) : payload.city,
        bio: payload.bio ? sanitizeInput(payload.bio) : payload.bio,
        phone: payload.phone ? sanitizeInput(payload.phone) : payload.phone,
        documentId: payload.documentId ? sanitizeInput(payload.documentId) : payload.documentId,
        email: payload.email ? sanitizeInput(payload.email) : payload.email,
      }),
    })

    const json = await response.json()
    if (!response.ok) {
      const details = Array.isArray(json?.details)
        ? json.details.map((d: any) => d.message).join(', ')
        : undefined
      throw new Error(details || json?.error || 'No se pudo actualizar el usuario')
    }

    return parseUser(json.user)
  },
}
