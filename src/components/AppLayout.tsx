import { useState } from 'react'
import { useNavigate, useLocation } from "react-router-dom"
import { useAuth } from "../store/authStore"
import { useTheme } from '../store/themeStore'
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

const Icon = ({ d, d2 }: { d: string; d2?: string }) => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d={d} />
        {d2 && <path d={d2} />}
    </svg>
)

const sections: NavSection[] = [
    {
        items: [
            { label: "Дашборд", path: "/dashboard", icon: <Icon d="M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z" /> },
        ]
    },
    {
        label: "CRM",
        items: [
            { label: "Лиды", path: "/leads", icon: <Icon d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8zM23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" /> },
            { label: "Сделки", path: "/deals", icon: <Icon d="M12 2L2 7l10 5 10-5-10-5M2 17l10 5 10-5M2 12l10 5 10-5" /> },
            { label: "Диалоги", path: "/dialogs", icon: <Icon d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />, badge: 3 },
            { label: "Задачи", path: "/tasks", icon: <Icon d="M9 11l3 3L22 4M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" /> },
        ]
    },
    {
        label: "Аналитика",
        items: [
            { label: "Скоринг", path: "/scoring", icon: <Icon d="M18 20V10M12 20V4M6 20v-6" /> },
            { label: "Агенты", path: "/agents", icon: <Icon d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M12 11a4 4 0 100-8 4 4 0 000 8M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" /> },
            { label: "Объекты", path: "/properties", icon: <Icon d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" d2="M9 22V12h6v10" /> },
        ]
    },
    {
        label: "Система",
        items: [
            { label: "Сообщения", path: "/messages", icon: <Icon d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2zM22 6l-10 7L2 6" /> },
            { label: "Воронка", path: "/pipeline", icon: <Icon d="M22 12H3M22 12l-4-4M22 12l-4 4M3 12l4-4M3 12l4 4" /> },
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
    const { toggleTheme, isDark } = useTheme()
    const [sidebarOpen, setSidebarOpen] = useState(false)

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
            {/* Mobile overlay */}
            {sidebarOpen && (
                <div
                    onClick={() => setSidebarOpen(false)}
                    style={{
                        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
                        zIndex: 99, display: 'none'
                    }}
                    className="sidebar-overlay"
                />
            )}

            {/* ── Sidebar ── */}
            <aside className={`g-sidebar ${sidebarOpen ? 'g-sidebar--open' : ''}`}>
                {/* Logo */}
                <div className="g-sidebar__logo">
                    <img src={logoSvg} alt="logo" style={{ width: 32, height: 32, flexShrink: 0 }} />
                    <div>
                        <div className="g-sidebar__logo-text">RealtorAI</div>
                        <div className="g-sidebar__logo-sub">System</div>
                    </div>
                </div>

                {/* User */}
                <div className="g-sidebar__user" onClick={() => navigate('/profile')}>
                    <div className="g-sidebar__user-avatar">{initials}</div>
                    <div style={{ overflow: 'hidden', flex: 1 }}>
                        <div className="g-sidebar__user-name">{displayName}</div>
                        <div className="g-sidebar__user-role">{user?.role ?? ''}</div>
                    </div>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" style={{ color: 'var(--text-sidebar)', flexShrink: 0 }}>
                        <path d="M9 18l6-6-6-6" />
                    </svg>
                </div>

                {/* Nav */}
                <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', scrollbarWidth: 'thin', scrollbarColor: '#0d9488 transparent' }}>
                    {sections.map((section, si) => (
                        <div key={si}>
                            {section.label && (
                                <div className="g-sidebar__section-label">{section.label}</div>
                            )}
                            <nav className="g-sidebar__nav">
                                {section.items.map((item) => {
                                    const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + "/")
                                    return (
                                        <button
                                            key={item.path}
                                            className={`g-sidebar__nav-item ${isActive ? 'g-sidebar__nav-item--active' : ''}`}
                                            onClick={() => { navigate(item.path); setSidebarOpen(false) }}
                                        >
                                            {item.icon}
                                            <span style={{ flex: 1 }}>{item.label}</span>
                                            {item.badge && (
                                                <span className="g-sidebar__nav-badge">{item.badge}</span>
                                            )}
                                        </button>
                                    )
                                })}
                            </nav>
                        </div>
                    ))}
                </div>

                {/* Bottom */}
                <div className="g-sidebar__bottom">
                    <nav className="g-sidebar__nav">
                        {(user?.role === 'director' || user?.role === 'superadmin') && (
                            <button className="g-sidebar__nav-item" onClick={() => navigate('/create-staff')}>
                                <Icon d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M12.5 7a4 4 0 110 8 4 4 0 010-8zM19 8v6M22 11h-6" />
                                <span>Добавить сотрудника</span>
                            </button>
                        )}
                        <button className="g-sidebar__nav-item" onClick={() => navigate("/settings")}>
                            <Icon d="M12 15a3 3 0 100-6 3 3 0 000 6zM19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />
                            <span>Настройки</span>
                        </button>
                        <button className="g-sidebar__nav-item" onClick={handleLogout} style={{ color: '#ef4444' }}>
                            <Icon d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" />
                            <span>Выйти</span>
                        </button>
                    </nav>
                </div>
            </aside>

            {/* ── Main ── */}
            <div className="g-main">
                {/* Topbar */}
                <header className="g-topbar">
                    {/* Mobile burger */}
                    <button
                        className="g-topbar__burger"
                        onClick={() => setSidebarOpen(p => !p)}
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                            <line x1="3" y1="6" x2="21" y2="6" />
                            <line x1="3" y1="12" x2="21" y2="12" />
                            <line x1="3" y1="18" x2="21" y2="18" />
                        </svg>
                    </button>

                    {/* Breadcrumbs */}
                    <div className="g-topbar__left">
                        {breadcrumbs ? (
                            breadcrumbs.map((b, i) => (
                                <span key={i} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                    {i > 0 && <span style={{ color: 'var(--text-muted)' }}>›</span>}
                                    {b.path
                                        ? <a href="#" onClick={e => { e.preventDefault(); navigate(b.path!) }} style={{ color: 'var(--accent)', textDecoration: 'none', fontWeight: 500, fontSize: 13 }}>{b.label}</a>
                                        : <span style={{ color: 'var(--text-secondary)', fontSize: 13 }}>{b.label}</span>
                                    }
                                </span>
                            ))
                        ) : (
                            <span style={{ color: 'var(--text-primary)', fontWeight: 600, fontSize: 13 }}>{title}</span>
                        )}
                    </div>

                    {/* Search */}
                    <div className="g-topbar__search">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: 'var(--text-muted)', flexShrink: 0 }}>
                            <circle cx="11" cy="11" r="8" />
                            <path d="M21 21l-4.35-4.35" strokeLinecap="round" />
                        </svg>
                        <input placeholder="Поиск лидов, сделок..." />
                    </div>

                    {/* Actions */}
                    <div className="g-topbar__actions">
                        {/* Theme toggle */}
                        <button className="g-topbar__icon-btn" onClick={toggleTheme} title={isDark ? 'Светлая тема' : 'Тёмная тема'}>
                            {isDark ? (
                                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                                    <circle cx="12" cy="12" r="5" />
                                    <line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" />
                                    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                                    <line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" />
                                    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                                </svg>
                            ) : (
                                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                                    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                                </svg>
                            )}
                        </button>

                        {/* Notifications */}
                        <button className="g-topbar__icon-btn">
                            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0" strokeLinecap="round" />
                            </svg>
                            <span className="badge">3</span>
                        </button>

                        {/* Avatar */}
                        <div className="g-topbar__avatar" onClick={() => navigate('/profile')} title="Профиль">
                            {initials}
                        </div>
                    </div>
                </header>

                {/* Content */}
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