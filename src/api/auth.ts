import { api, saveTokens, clearTokens } from './client'
import type { ChangePasswordRequest } from '../types/api'

export const authApi = {
  async login(payload: { email: string; password: string }): Promise<{ access: string; refresh: string; must_change_password?: boolean }> {
    const { data } = await api.post('/api/auth/login/', payload)
    const d = data?.data
    saveTokens(d.tokens.access, d.tokens.refresh)
    return {
      access: d.tokens.access,
      refresh: d.tokens.refresh,
      must_change_password: d.user?.must_change_password,
    }
  },

 async firstLogin(payload: { email: string; old_password: string; new_password: string }): Promise<void> {
    await api.post('/api/auth/first-login/', payload)
},

  async changePassword(payload: ChangePasswordRequest): Promise<void> {
    await api.post('/api/auth/change-password/', payload)
  },

  async logout(): Promise<void> {
    const refresh = localStorage.getItem('refresh_token')
    try {
      if (refresh) await api.post('/api/auth/logout/', { refresh })
    } finally {
      clearTokens()
    }
  },
}