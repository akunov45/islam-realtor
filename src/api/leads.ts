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
    const { data } = await api.put(`/api/leads/${id}/`, payload)
    return data
  },

  async changeStatus(id: number, status: LeadStatus): Promise<void> {
    await api.post(`/api/leads/${id}/change-status/`, { status })
  },

  async assign(id: number, agent_id: string): Promise<void> {
    await api.post(`/api/leads/${id}/assign/`, { agent_id })
  },

  async addTask(id: number, payload: { title: string; due_date?: string }): Promise<void> {
    await api.post(`/api/leads/${id}/add-task/`, payload)
  },

  async interactProperty(id: number, payload: {
    external_id: string
    title?: string | undefined
    price?: string | undefined
    status: "viewed" | "liked" | "disliked" | "requested"
}): Promise<void> {
    await api.post(`/api/leads/${id}/interact-property/`, payload)
},

  async stats(): Promise<unknown> {
    const { data } = await api.get('/api/leads/stats/')
    return data
  },
}