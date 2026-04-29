import { useNavigate, useLocation } from "react-router-dom"
import { useAuth } from "../store/authStore"
import type { Role } from "../types/api"
import logoSvg from '../assets/logo.svg'

type NavSection = {
    label?: string
    items: NavItem[]
}

type NavItem = {
    icon: React.ReactNode
    label: string
    path: string
    badge?: number
    roles?: Role[]
}

const Icon = ({ d }: { d: string }) => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d={d} />
    </svg>
)

const sections: NavSection[] = [
    {
        items: [
            { label: "Админпанель", path: "/dashboard", icon: <Icon d="M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z" /> },
        ]
    },
    {
        label: "Leads",
        items: [
            { label: "Диалоги", path: "/dialogs", icon: <Icon d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />, badge: 3 },
            { label: "Лиды", path: "/leads", icon: <Icon d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8zM23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" /> },
            { label: "Скоринг лидов", path: "/scoring", icon: <Icon d="M18 20V10M12 20V4M6 20v-6" /> },
            { label: "Сообщения", path: "/messages", icon: <Icon d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2zM22 6l-10 7L2 6" /> },
            { label: "Теги", path: "/tags", icon: <Icon d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82zM7 7h.01" /> },
        ]
    },
    {
        label: "Периодические Задачи",
        items: [
            { label: "Crontab", path: "/crontab", icon: <Icon d="M12 2a10 10 0 100 20A10 10 0 0012 2zM12 6v6l4 2" /> },
            { label: "Астрономические события", path: "/astronomy", icon: <Icon d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" /> },
            { label: "Время", path: "/time", icon: <Icon d="M12 2a10 10 0 100 20A10 10 0 0012 2zM12 6v6l4 2" /> },
        ]
    }
]

type Props = {
    children: React.ReactNode
    title: string
    breadcrumbs?: { label: string; path?: string }[]
    actions?: React.ReactNode
}

export default function AppLayout({ children, title, breadcrumbs, actions }: Props) {
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

    const displayName = user
        ? `${user.first_name} ${user.last_name}`.trim() || user.email
        : '...'

    return (
        <div className="app-shell">
            <aside className="g-sidebar">
                <div className="g-sidebar__logo">
                    <div className="g-sidebar__logo-icon" style={{ background: 'none', padding: 0 }}>
                        <img src={logoSvg} alt="logo" style={{ width: 34, height: 34 }} />
                    </div>
                    <div>
                        <div className="g-sidebar__logo-text">RealtorAiSystem</div>
                    </div>
                </div>

                <div className="g-sidebar__user" style={{ cursor: 'pointer' }} onClick={() => navigate('/profile')}>
                    <div className="g-sidebar__user-avatar" style={{ background: '#3b82f6', color: 'white', fontWeight: 700, fontSize: 13 }}>
                        {initials}
                    </div>
                    <div style={{ overflow: 'hidden' }}>
                        <div className="g-sidebar__user-name" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {displayName}
                        </div>
                        {user?.role && (
                            <div style={{ fontSize: 10, color: '#6b7280', textTransform: 'capitalize' }}>
                                {user.role}
                            </div>
                        )}
                    </div>
                </div>

                {sections.map((section, si) => (
                    <div key={si}>
                        {section.label && (
                            <div className="g-sidebar__section-label">{section.label}</div>
                        )}
                        <nav className="g-sidebar__nav">
                            {section.items.map((item) => (
                                <button
                                    key={item.path}
                                    className={`g-sidebar__nav-item ${location.pathname === item.path || location.pathname.startsWith(item.path + "/") ? "g-sidebar__nav-item--active" : ""}`}
                                    onClick={() => navigate(item.path)}
                                >
                                    {item.icon}
                                    {item.label}
                                    {item.badge && (
                                        <span className="g-sidebar__nav-badge">{item.badge}</span>
                                    )}
                                </button>
                            ))}
                        </nav>
                    </div>
                ))}

                <div className="g-sidebar__bottom">
                    <nav className="g-sidebar__nav">
                        {(user?.role === 'director' || user?.role === 'superadmin') && (
                            <button className="g-sidebar__nav-item" onClick={() => navigate('/create-staff')}>
                                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                                    <path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M12.5 7a4 4 0 110 8 4 4 0 010-8zM19 8v6M22 11h-6" />
                                </svg>
                                Добавить сотрудника
                            </button>
                        )}
                        <button className="g-sidebar__nav-item" onClick={() => navigate("/settings")}>
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                                <circle cx="12" cy="12" r="3" />
                                <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />
                            </svg>
                            Настройки
                        </button>
                        <button className="g-sidebar__nav-item" onClick={handleLogout}>
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                                <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" />
                            </svg>
                            Выйти
                        </button>
                    </nav>
                </div>
            </aside>

            <div className="g-main">
                <header className="g-topbar">
                    <div className="g-topbar__left">
                        {breadcrumbs ? (
                            breadcrumbs.map((b, i) => (
                                <span key={i} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                    {i > 0 && <span>›</span>}
                                    {b.path ? <a href="#" onClick={e => { e.preventDefault(); navigate(b.path!) }}>{b.label}</a> : <span style={{ color: "#374151" }}>{b.label}</span>}
                                </span>
                            ))
                        ) : (
                            <span style={{ color: "#374151", fontWeight: 600 }}>{title}</span>
                        )}
                    </div>

                    <div className="g-topbar__search">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2"><circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" strokeLinecap="round" /></svg>
                        <input placeholder="Поиск лидов, сделок, объектов..." />
                    </div>

                    <div className="g-topbar__actions">
                        <button className="g-topbar__icon-btn">
                            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0" strokeLinecap="round" /></svg>
                            <span className="badge">3</span>
                        </button>
                        <button className="g-topbar__icon-btn" onClick={() => navigate('/settings')}>
                            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" strokeLinecap="round" /></svg>
                        </button>
                        <div className="g-topbar__avatar" style={{ cursor: 'pointer' }} onClick={() => navigate('/profile')}>{initials}</div>
                    </div>
                </header>

                <div className="g-content">
                    <div className="page-header">
                        <div>
                            <h1 className="page-title">{title}</h1>
                        </div>
                        {actions && <div style={{ display: "flex", gap: 10 }}>{actions}</div>}
                    </div>
                    {children}
                </div>
            </div>
        </div>
    )
}