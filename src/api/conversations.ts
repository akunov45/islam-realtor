import { api } from './client'
import type { Conversation, Message } from '../types/api'

export interface ConversationQuery {
    is_active?: boolean | undefined
    lead?: number | undefined
    page?: number | undefined
}

export interface MessagesQuery {
    conversation_id?: number | undefined
    lead_id?: number | undefined
    ordering?: string | undefined
    page?: number | undefined
}

export const conversationsApi = {
    async list(params?: ConversationQuery): Promise<{ count: number; results: Conversation[] }> {
        const { data } = await api.get('/api/conversations/', { params })
        return data
    },

    async get(id: number): Promise<Conversation> {
        const { data } = await api.get(`/api/conversations/${id}/`)
        return data
    },
}

export const messagesApi = {
    async list(params?: MessagesQuery): Promise<{ count: number; results: Message[] }> {
        const { data } = await api.get('/api/messages/', { params })
        return data
    },
}