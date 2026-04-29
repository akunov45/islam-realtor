import { api } from './client'

export interface Agent {
  id: string
  first_name: string
  last_name: string
  email: string
  phone_number?: string | null
  agent_profile?: {
    agency_name?: string
    license_number?: string
    experience_years?: number
    rating?: string
  }
}

export interface AgentStats {
  total_leads: number
  active_deals: number
  conversion_rate: number
  revenue: string
  rating: number
}

export interface TeamStats {
  total_agents: number
  avg_conversion_rate: number
  total_revenue: string
  avg_rating: number
  top_agent_id: number | null
}

export const agentsApi = {
  async list(): Promise<Agent[]> {
    const { data } = await api.get('/api/agents/')
    return data?.results ?? data
  },

  async get(id: string): Promise<Agent> {
    const { data } = await api.get(`/api/agents/${id}/`)
    return data
  },

  async getStats(id: string): Promise<AgentStats> {
    const { data } = await api.get(`/api/agents/${id}/stats/`)
    return data
  },

  async updateProfile(id: string, payload: Partial<Agent['agent_profile']>): Promise<void> {
    await api.patch(`/api/agents/${id}/profile/`, payload)
  },

  async teamStats(): Promise<TeamStats> {
    const { data } = await api.get('/api/agents/team-stats/')
    return data
  },

  async top(): Promise<Agent[]> {
    const { data } = await api.get('/api/agents/top/')
    return data?.results ?? data
  },
}