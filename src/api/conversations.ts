import { api } from './client'
import type { Conversation, PaginatedConversationList, Message } from '../types/api'

export const conversationsApi = {
  async list(params?: { is_active?: boolean; lead?: number; page?: number }): Promise<PaginatedConversationList> {
    const { data } = await api.get('/api/conversations/', { params })
    return data
  },

  async get(id: number): Promise<Conversation> {
    const { data } = await api.get(`/api/conversations/${id}/`)
    return data
  },
}

export const messagesApi = {
  async list(params?: { page?: number; ordering?: string }): Promise<{ count: number; results: Message[] }> {
    const { data } = await api.get('/api/messages/', { params })
    return data
  },
}