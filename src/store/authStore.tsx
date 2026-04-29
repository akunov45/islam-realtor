import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { usersApi } from '../api/users'
import { authApi } from '../api/auth'
import { getAccessToken, clearTokens } from '../api/client'
import type { User } from '../types/api'

interface AuthState {
    user: User | null
    loading: boolean
    isAuthenticated: boolean
}

interface AuthContextValue extends AuthState {
    refreshUser: () => Promise<void>
    logout: () => Promise<void>
    setUser: (u: User | null) => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null)
    const [loading, setLoading] = useState(true)

    const refreshUser = useCallback(async () => {
        try {
            const me = await usersApi.getMe()
            setUser(me)
        } catch {
            setUser(null)
            clearTokens()
        }
    }, [])

    const logout = useCallback(async () => {
        await authApi.logout()
        setUser(null)
    }, [])

    useEffect(() => {
        if (getAccessToken()) {
            refreshUser().finally(() => setLoading(false))
        } else {
            setLoading(false)
        }
    }, [refreshUser])

    return (
        <AuthContext.Provider value={{ user, loading, isAuthenticated: !!user, refreshUser, logout, setUser }}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    const ctx = useContext(AuthContext)
    if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
    return ctx
}