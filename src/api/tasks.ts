import { api } from './client'

export interface Task {
    id: number
    title: string
    due_date?: string | null | undefined
    is_done?: boolean | undefined
    lead?: number | null | undefined
    created_at: string
}

export interface TasksQuery {
    is_done?: boolean | undefined
    lead?: number | undefined
    assigned_to?: number | undefined
    due_after?: string | undefined
    due_before?: string | undefined
    ordering?: string | undefined
    page?: number | undefined
}

export const tasksApi = {
    async list(params?: TasksQuery): Promise<Task[]> {
        const { data } = await api.get('/api/tasks/', { params })
        return data?.results ?? data
    },

    async get(id: number): Promise<Task> {
        const { data } = await api.get(`/api/tasks/${id}/`)
        return data
    },

    // Создание только через лид
    async createForLead(leadId: number, payload: { title: string; due_date?: string | undefined }): Promise<void> {
        await api.post(`/api/leads/${leadId}/add-task/`, payload)
    },

    async update(id: number, payload: Partial<Task>): Promise<Task> {
        const { data } = await api.patch(`/api/tasks/${id}/`, payload)
        return data
    },

    async delete(id: number): Promise<void> {
        await api.delete(`/api/tasks/${id}/`)
    },
}