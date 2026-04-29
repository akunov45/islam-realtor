import { api } from './client'

export type DealStatus = 'new' | 'in_progress' | 'closed' | 'failed'

export interface Deal {
    id: number
    agent: {
        id: number
        email: string
        full_name: string
        department: string
        team: string
    } | null
    lead?: number | null
    status: DealStatus
    price?: string | null
    commission?: string | null
    title?: string | null
    created_at: string
    closed_at?: string | null
}

export interface CreateDealPayload {
    agent_id: number
    lead?: number | null | undefined
    status?: DealStatus | undefined
    price?: string | undefined
    commission?: string | undefined
    title?: string | undefined
}

export interface DealsQuery {
    status?: string | undefined
    period?: 'week' | 'month' | 'quarter' | 'all' | undefined
    agent?: number | undefined
    date_from?: string | undefined
    date_to?: string | undefined
    ordering?: string | undefined
    page?: number | undefined
}

export const dealsApi = {
    async list(params?: DealsQuery): Promise<Deal[]> {
        const { data } = await api.get('/api/deals/', { params })
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

    async update(id: number, payload: Partial<Omit<CreateDealPayload, 'agent_id'>>): Promise<Deal> {
        const { data } = await api.patch(`/api/deals/${id}/`, payload)
        return data
    },

    async delete(id: number): Promise<void> {
        await api.delete(`/api/deals/${id}/`)
    },
}