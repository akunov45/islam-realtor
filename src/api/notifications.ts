import { api } from './client'

export interface NotificationItem {
    id: string
    type: string
    priority: string
    read: boolean
    created_at: string
    title: string
    body: string
    action_url: string
    data: Record<string, unknown>
}

export interface NotificationsResponse {
    unread_count: number
    results: NotificationItem[]
    has_more: boolean
    next_poll_at: string
}

export const notificationsApi = {
    async list(params?: {
        limit?: number | undefined
        since?: string | undefined
        unread_only?: boolean | undefined
    }): Promise<NotificationsResponse> {
        const { data } = await api.get('/api/v2/agent/notifications/', { params })
        return data
    },

    async markRead(ids?: string[]): Promise<{ marked_read: number }> {
        const { data } = await api.post('/api/v2/agent/notifications/', ids ? { ids } : {})
        return data
    },
}