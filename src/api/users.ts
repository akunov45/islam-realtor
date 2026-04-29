import { api } from './client'
import type { User, CreateStaffRequest } from '../types/api'

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

  async createStaff(payload: CreateStaffRequest): Promise<User> {
    const { data } = await api.post('/api/users/create-staff/', payload)
    return unwrap<User>(data)
  },

  async blockUser(user_id: string): Promise<void> {
    await api.post('/api/users/block/', { user_id })
  },

  async unblockUser(user_id: string): Promise<void> {
    await api.post('/api/users/unblock/', { user_id })
  },
}