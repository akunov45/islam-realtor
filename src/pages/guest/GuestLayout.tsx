import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../store/authStore'
import logoSvg from '../../assets/logo.svg'

type Tab = { label: string; path: string; icon: React.ReactNode }

const Icon = ({ d }: { d: string }) => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d={d} />
    </svg>
)

const tabs: Tab[] = [
    { label: 'Главная',   path: '/guest',             icon: <Icon d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" /> },
    { label: 'Мои заявки', path: '/guest/requests',   icon: <Icon d="M9 11l3 3L22 4M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" /> },
    { label: 'Чат',        path: '/guest/chat',        icon: <Icon d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" /> },
    { label: 'Дома',       path: '/guest/properties',  icon: <Icon d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" /> },
    { label: 'Новости',    path: '/guest/news',        icon: <Icon d="M4 22h16a2 2 0 002-2V4a2 2 0 00-2-2H8a2 2 0 00-2 2v16a2 2 0 01-2 2zm0 0a2 2 0 01-2-2v-9" /> },
    { label: 'Советы',     path: '/guest/tips',        icon: <Icon d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /> },
    { label: 'Профиль', path: '/guest/profile', icon: <Icon d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 11a4 4 0 100-8 4 4 0 000 8z" /> },
]

type Props = { children: React.ReactNode }

export default function GuestLayout({ children }: Props) {
    const navigate = useNavigate()
    const location = useLocation()
    const { user, logout } = useAuth()

    const handleLogout = async () => {
        await logout()
        navigate('/login', { replace: true })
    }

    const initials = user
        ? (`${user.first_name?.[0] ?? ''}${user.last_name?.[0] ?? ''}`.toUpperCase() || (user.email?.[0]?.toUpperCase() ?? 'U'))
        : 'U'

    const displayName = user ? `${user.first_name} ${user.last_name}`.trim() || user.email : ''

    return (
        <div className="gp-shell">
            <nav className="gp-nav">
                <div className="gp-nav__logo" onClick={() => navigate('/guest')} style={{ cursor: 'pointer' }}>
                    <div className="gp-nav__logo-icon">
                        <img src={logoSvg} alt="logo" style={{ width: 36, height: 36 }} />
                    </div>
                    RealtorAiSystem
                </div>

                <div className="gp-nav__tabs">
                    {tabs.map(tab => (
                        <button
                            key={tab.path}
                            className={`gp-nav__tab ${location.pathname === tab.path ? 'gp-nav__tab--active' : ''}`}
                            onClick={() => navigate(tab.path)}
                        >
                            {tab.icon}
                            {tab.label}
                        </button>
                    ))}
                </div>

                <div className="gp-nav__user">
                    <span className="gp-nav__user-name">{displayName}</span>
                    <div className="gp-nav__avatar" onClick={() => navigate('/guest/profile')} style={{ cursor: 'pointer' }}>
                        {initials}
                    </div>
                </div>
            </nav>

            {children}
        </div>
    )
}
