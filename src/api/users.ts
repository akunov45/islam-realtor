import { api } from './client'
import type { User } from '../types/api'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function unwrap<T>(data: any): T {
  return data?.data ?? data
}

export const usersApi = {
  async getMe(): Promise<User> {
    const { data } = await api.get('/api/users/me/')
    return unwrap<User>(data)
  },

  async updateMe(payload: Partial<Pick<User, 'first_name' | 'last_name' | 'phone_number'>>): Promise<User> {
    const { data } = await api.patch('/api/users/me/', payload)
    return unwrap<User>(data)
  },

  async list(): Promise<User[]> {
    const { data } = await api.get('/api/users/')
    return unwrap<User[]>(data)
  },

  async createUser(payload: { email: string; role: string; first_name: string; last_name?: string }): Promise<User> {
    const { data } = await api.post('/api/users/create/', payload)
    return unwrap<User>(data)
  },

  async toggleBlock(id: string): Promise<void> {
    await api.post(`/api/users/${id}/toggle-block/`)
  },
}