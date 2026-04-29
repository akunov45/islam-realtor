import { api } from './client'
import type { Lead, LeadDetail, PaginatedLeadList, LeadStatus, LeadSource } from '../types/api'

export interface LeadsQuery {
  page?: number | undefined
  search?: string | undefined
  status?: LeadStatus | undefined
  source?: LeadSource | undefined
  is_active?: boolean | undefined
  ordering?: string | undefined
}

export const leadsApi = {
  async list(params?: LeadsQuery): Promise<PaginatedLeadList> {
    const { data } = await api.get('/api/leads/', { params })
    return data
  },

  async get(id: number): Promise<LeadDetail> {
    const { data } = await api.get(`/api/leads/${id}/`)
    return data
  },

  async update(id: number, payload: Partial<Lead>): Promise<Lead> {
    const { data } = await api.patch(`/api/leads/${id}/`, payload)
    return data
  },

  async stats(): Promise<unknown> {
    const { data } = await api.get('/api/leads/stats/')
    return data
  },
}