import { api } from './client'

export type DealStatus = 'pending' | 'active' | 'closed' | 'cancelled'

export interface Deal {
  id: number
  agent: { id: string; first_name: string; last_name: string }
  lead?: number | null
  status: DealStatus
  price?: string
  commission?: string
  title?: string
  created_at: string
  closed_at?: string | null
}

export interface CreateDealPayload {
  lead?: number
  status?: DealStatus
  price?: string
  commission?: string
  title?: string
}

export const dealsApi = {
  async list(): Promise<Deal[]> {
    const { data } = await api.get('/api/deals/')
    return data?.results ?? data
  },

  async get(id: number): Promise<Deal> {
    const { data } = await api.get(`/api/deals/${id}/`)
    return data
  },

  async create(payload: CreateDealPayload): Promise<Deal> {
    const { data } = await api.post('/api/deals/', payload)
    return data
  },

  async update(id: number, payload: Partial<CreateDealPayload>): Promise<Deal> {
    const { data } = await api.patch(`/api/deals/${id}/`, payload)
    return data
  },

  async delete(id: number): Promise<void> {
    await api.delete(`/api/deals/${id}/`)
  },
}