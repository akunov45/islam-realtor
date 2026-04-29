import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../store/authStore'

const GUEST_ROLES = ['buyer', 'seller']
const isGuest = (role?: string) => GUEST_ROLES.includes(role ?? '')

export function RequireAuth({ children }: { children: React.ReactNode }) {
    const { isAuthenticated, loading, user } = useAuth()
    const location = useLocation()

    if (loading) {
        return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#f0fdf9' }}>
                <div style={{ fontSize: 13, color: '#0d9488' }}>Загрузка...</div>
            </div>
        )
    }

    if (!isAuthenticated) return <Navigate to="/login" state={{ from: location }} replace />

    if (user?.must_change_password && location.pathname !== '/change-password') {
        return <Navigate to="/change-password" replace />
    }

    return <>{children}</>
}

export function RequireGuest({ children }: { children: React.ReactNode }) {
    const { isAuthenticated, loading, user } = useAuth()
    if (loading) return null
    if (isAuthenticated) {
        return <Navigate to={isGuest(user?.role) ? '/guest' : '/dashboard'} replace />
    }
    return <>{children}</>
}

// guest=true  → только buyer/seller (гостевой портал)
// guest=false → только персонал (staff)
export function RequireStaff({ children, guest = false }: { children: React.ReactNode; guest?: boolean }) {
    const { user } = useAuth()
    if (!user) return <Navigate to="/login" replace />

    const userIsGuest = isGuest(user.role)

    if (guest && !userIsGuest) return <Navigate to="/dashboard" replace />
    if (!guest && userIsGuest) return <Navigate to="/guest" replace />

    return <>{children}</>
}

export function RequireRole({ children, roles }: { children: React.ReactNode; roles: string[] }) {
    const { user } = useAuth()
    if (!user || !roles.includes(user.role)) return <Navigate to="/dashboard" replace />
    return <>{children}</>
}

export function RootRedirect() {
    const { user, loading } = useAuth()
    if (loading) return null
    if (!user) return <Navigate to="/login" replace />
    if (isGuest(user.role)) return <Navigate to="/guest" replace />
    return <Navigate to="/dashboard" replace />
}