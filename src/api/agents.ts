import { api } from './client'

export interface AgentKPIBrief {
    agent_id: number
    email: string
    full_name: string
    department: string
    team: string
    total_deals: number
    closed_deals: number
    in_progress_deals: number
    conversion_rate: number
    total_revenue: string
    rating: number
    period: string
}

export interface AgentKPIFull {
    agent_id: number
    email: string
    full_name: string
    department: string
    team: string
    hire_date?: string | null | undefined
    total_deals: number
    closed_deals: number
    failed_deals: number
    in_progress_deals: number
    conversion_rate: number
    total_revenue: string
    avg_deal_value: string
    avg_commission: string
    deals_this_week: number
    deals_this_month: number
    rating: number
    period: string
}

export interface TeamStats {
    total_agents: number
    avg_conversion_rate: number
    total_revenue: string
    avg_rating: number
    top_agent_id: number | null
}

export interface AgentProfilePayload {
    agency_name?: string | undefined
    license_number?: string | undefined
    experience_years?: number | undefined
}

export const agentsApi = {
    async list(params?: {
        department?: string | undefined
        period?: string | undefined
        search?: string | undefined
        page?: number | undefined
    }): Promise<AgentKPIBrief[]> {
        const { data } = await api.get('/api/agents/', { params })
        return data?.results ?? data ?? []
    },

    async get(id: number): Promise<AgentKPIBrief> {
        const { data } = await api.get(`/api/agents/${id}/`)
        return data
    },

  async getStats(id: number): Promise<AgentKPIFull> {
    const { data } = await api.get(`/api/agents/${id}/stats/`)
    return data?.data ?? data
},

    async updateProfile(id: number, payload: AgentProfilePayload): Promise<void> {
        await api.patch(`/api/agents/${id}/profile/`, payload)
    },

    async teamStats(params?: {
        department?: string | undefined
        period?: string | undefined
    }): Promise<TeamStats> {
        const { data } = await api.get('/api/agents/team-stats/', { params })
        return data
    },

    async top(params?: {
        department?: string | undefined
        period?: string | undefined
        limit?: number | undefined
    }): Promise<AgentKPIBrief[]> {
        const { data } = await api.get('/api/agents/top/', { params })
        return data?.results ?? data ?? []
    },
}