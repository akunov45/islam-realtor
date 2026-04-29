import { api, saveTokens, clearTokens } from './client'
import type {
  LoginRequest,
  RegisterRequest,
  SendOtpRequest,
  VerifyOtpRequest,
  ResetPasswordRequest,
  ChangePasswordRequest,
  TokenPair,
  User,
} from '../types/api'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function unwrap<T>(data: any): T {
  return data?.data ?? data
}

export const authApi = {
  async login(payload: LoginRequest): Promise<{ access: string; refresh: string; must_change_password?: boolean }> {
  const { data } = await api.post('/api/auth/login/', payload)
  const d = data?.data
  saveTokens(d.tokens.access, d.tokens.refresh)
  return {
    access: d.tokens.access,
    refresh: d.tokens.refresh,
    must_change_password: d.user?.must_change_password,
  }
},

  async register(payload: RegisterRequest): Promise<User> {
    const { data } = await api.post('/api/auth/register/', payload)
    return unwrap<User>(data)
  },

  async sendOtp(payload: SendOtpRequest): Promise<void> {
    await api.post('/api/auth/send-otp/', payload)
  },

  async verifyOtp(payload: VerifyOtpRequest): Promise<{ access?: string; refresh?: string; reset_token?: string }> {
    const { data } = await api.post('/api/auth/verify-otp/', payload)
    const d = unwrap<{ access?: string; refresh?: string; reset_token?: string }>(data)
    if (d.access && d.refresh) saveTokens(d.access, d.refresh)
    return d
  },

  async resetPassword(payload: ResetPasswordRequest): Promise<void> {
    await api.post('/api/auth/reset-password/', payload)
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