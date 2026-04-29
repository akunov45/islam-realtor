import { api } from './client'

export interface Task {
  id: number
  title: string
  due_date?: string | null
  is_done?: boolean
  lead?: number | null
  created_at: string
}

export const tasksApi = {
  async list(): Promise<Task[]> {
    const { data } = await api.get('/api/tasks/')
    return data?.results ?? data
  },

  async get(id: number): Promise<Task> {
    const { data } = await api.get(`/api/tasks/${id}/`)
    return data
  },

  async update(id: number, payload: Partial<Task>): Promise<Task> {
    const { data } = await api.patch(`/api/tasks/${id}/`, payload)
    return data
  },

  async delete(id: number): Promise<void> {
    await api.delete(`/api/tasks/${id}/`)
  },
}