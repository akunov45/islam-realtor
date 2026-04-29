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

export interface TeamStats {
    total_agents: number
    avg_conversion_rate: number
    total_revenue: string
    avg_rating: number
    top_agent_id: number | null
}

export interface Agent {
    id: number
    email: string
    full_name?: string
    first_name?: string
    last_name?: string
    phone_number?: string | null
    department?: string
    team?: string
    agent_profile?: {
        agency_name?: string
        license_number?: string
        experience_years?: number
        rating?: string
    }
}

export const agentsApi = {
    async list(params?: {
    department?: string | undefined
    period?: string | undefined
    search?: string | undefined
    page?: number | undefined
}): Promise<AgentKPIBrief[]> {
        const { data } = await api.get('/api/agents/', { params })
        return data?.results ?? data
    },

    async get(id: number): Promise<Agent> {
        const { data } = await api.get(`/api/agents/${id}/`)
        return data
    },

    async getStats(id: number): Promise<AgentKPIBrief> {
        const { data } = await api.get(`/api/agents/${id}/stats/`)
        return data
    },

    async updateProfile(id: number, payload: Partial<Agent['agent_profile']>): Promise<void> {
        await api.patch(`/api/agents/${id}/profile/`, payload)
    },

    async teamStats(params?: { department?: string; period?: string }): Promise<TeamStats> {
        const { data } = await api.get('/api/agents/team-stats/', { params })
        return data
    },

    async top(params?: { department?: string; period?: string; limit?: number }): Promise<AgentKPIBrief[]> {
        const { data } = await api.get('/api/agents/top/', { params })
        return data?.results ?? data
    },
}