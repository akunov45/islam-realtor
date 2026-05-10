import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate, useLocation } from "react-router-dom"
import { useAuth } from "../store/authStore"
import { useTheme } from '../store/themeStore'
import { notificationsApi } from '../api/notifications'
import type { NotificationItem } from '../api/notifications'
import type { Role } from "../types/api"
import logoSvg from '../assets/logo.svg'

type NavSection = { label?: string; items: NavItem[] }
type NavItem = { icon: React.ReactNode; label: string; path: string; badge?: number; roles?: Role[] }

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
    label: "CRM", items: [
      { label: "Лиды", path: "/leads", icon: <Icon d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" /> },
      { label: "Сделки", path: "/deals", icon: <Icon d="M12 2L2 7l10 5 10-5-10-5M2 17l10 5 10-5M2 12l10 5 10-5" /> },
      { label: "Диалоги", path: "/dialogs", icon: <Icon d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" /> },
      { label: "Задачи", path: "/tasks", icon: <Icon d="M9 11l3 3L22 4M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" /> },
    ]
  },
  {
    label: "Аналитика", items: [
      { label: "Скоринг", path: "/scoring", icon: <Icon d="M18 20V10M12 20V4M6 20v-6" /> },
      { label: "Агенты", path: "/agents", icon: <Icon d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M12 11a4 4 0 100-8 4 4 0 000 8M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" /> },
      { label: "Объекты", path: "/properties", icon: <Icon d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" d2="M9 22V12h6v10" /> },
    ]
  },
  {
    label: "Система", items: [
      { label: "Сообщения", path: "/messages", icon: <Icon d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2zM22 6l-10 7L2 6" /> },
      { label: "Воронка", path: "/pipeline", icon: <Icon d="M22 12H3M22 12l-4-4M22 12l-4 4M3 12l4-4M3 12l4 4" /> },
    ]
  },
]

const PRIORITY_COLORS: Record<string, string> = {
  high: "#ef4444", medium: "#f59e0b", low: "var(--accent)",
}

const NOTIF_ICONS: Record<string, string> = {
  new_lead: "👤", overdue_task: "⏰", deal_closed: "✅",
  lead_assigned: "👔", status_changed: "🔄",
}

function formatNotifTime(iso: string) {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return "только что"
  if (mins < 60) return `${mins} мин`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs} ч`
  return `${Math.floor(hrs / 24)} д`
}

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

  // Notifications state
  const [notifications, setNotifications] = useState<NotificationItem[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [notifOpen, setNotifOpen] = useState(false)
  const notifRef = useRef<HTMLDivElement>(null)

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

  // ── Polling notifications ──────────────────────────────────────────────────
  const fetchNotifications = useCallback(async () => {
    try {
      const res = await notificationsApi.list({ limit: 20, unread_only: false })
      setNotifications(res.results)
      setUnreadCount(res.unread_count)
    } catch {
      // тихо — не ломаем UI
    }
  }, [])

  useEffect(() => {
    fetchNotifications()
    const interval = setInterval(fetchNotifications, 30000) // каждые 30 сек
    return () => clearInterval(interval)
  }, [fetchNotifications])

  // Закрывать dropdown при клике вне
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false)
      }
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [])

  const handleOpenNotif = async () => {
    setNotifOpen(p => !p)
    if (!notifOpen && unreadCount > 0) {
      try {
        await notificationsApi.markRead()
        setUnreadCount(0)
        setNotifications(prev => prev.map(n => ({ ...n, read: true })))
      } catch { /* тихо */ }
    }
  }

  const handleNotifClick = (notif: NotificationItem) => {
    setNotifOpen(false)
    if (notif.action_url) {
      const path = notif.action_url.replace(/^https?:\/\/[^/]+/, '')
      navigate(path)
    }
  }

  return (
    <div className="app-shell">
      {sidebarOpen && (
        <div onClick={() => setSidebarOpen(false)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 99, display: 'none' }}
          className="sidebar-overlay" />
      )}

      {/* ── Sidebar ── */}
      <aside className={`g-sidebar ${sidebarOpen ? 'g-sidebar--open' : ''}`}>
        <div className="g-sidebar__logo">
          <img src={logoSvg} alt="logo" style={{ width: 32, height: 32, flexShrink: 0 }} />
          <div>
            <div className="g-sidebar__logo-text">RealtorAI</div>
            <div className="g-sidebar__logo-sub">System</div>
          </div>
        </div>

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

        <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', scrollbarWidth: 'thin', scrollbarColor: '#0d9488 transparent' }}>
          {sections.map((section, si) => (
            <div key={si}>
              {section.label && <div className="g-sidebar__section-label">{section.label}</div>}
              <nav className="g-sidebar__nav">
                {section.items.map(item => {
                  const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + "/")
                  return (
                    <button key={item.path}
                      className={`g-sidebar__nav-item ${isActive ? 'g-sidebar__nav-item--active' : ''}`}
                      onClick={() => { navigate(item.path); setSidebarOpen(false) }}>
                      {item.icon}
                      <span style={{ flex: 1 }}>{item.label}</span>
                      {item.badge && <span className="g-sidebar__nav-badge">{item.badge}</span>}
                    </button>
                  )
                })}
              </nav>
            </div>
          ))}
        </div>

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
      <div className="g-main" >
        <header className="g-topbar" style={{ backgroundColor: "var(--bg-sidebar)" }}>
          <button className="g-topbar__burger" onClick={() => setSidebarOpen(p => !p)}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>

          <div className="g-topbar__left" >
            {breadcrumbs ? breadcrumbs.map((b, i) => (
              <span key={i} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                {i > 0 && <span style={{ color: 'var(--text-muted)' }}>›</span>}
                {b.path
                  ? <a href="#" onClick={e => { e.preventDefault(); navigate(b.path!) }} style={{ color: 'var(--accent)', textDecoration: 'none', fontWeight: 500, fontSize: 13 }}>{b.label}</a>
                  : <span style={{ color: 'var(--text-secondary)', fontSize: 13 }}>{b.label}</span>}
              </span>
            )) : <span style={{ color: 'var(--text-primary)', fontWeight: 600, fontSize: 13 }}>{title}</span>}
          </div>

          <div className="g-topbar__search" >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: 'var(--text-muted)', flexShrink: 0 }}>
              <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" strokeLinecap="round" />
            </svg>
            <input placeholder="Поиск лидов, сделок..." />
          </div>

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
            <div ref={notifRef} style={{ position: 'relative' }}>
              <button className="g-topbar__icon-btn" onClick={handleOpenNotif}>
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0" strokeLinecap="round" />
                </svg>
                {unreadCount > 0 && (
                  <span className="badge">{unreadCount > 99 ? "99+" : unreadCount}</span>
                )}
              </button>

              {/* Notifications dropdown */}
              {notifOpen && (
                <div style={{
                  position: 'absolute', top: 'calc(100% + 8px)', right: 0,
                  width: 360, maxHeight: 480, overflowY: 'auto',
                  background: 'var(--bg-card)', border: '1px solid var(--border-color)',
                  borderRadius: 14, boxShadow: 'var(--card-shadow-hover)',
                  zIndex: 200,
                }}>
                  <div style={{ padding: "14px 16px", borderBottom: "1px solid var(--border-color)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <span style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)" }}>Уведомления</span>
                    {unreadCount > 0 && (
                      <span style={{ fontSize: 11, background: "var(--accent)", color: "white", padding: "2px 8px", borderRadius: 10, fontWeight: 600 }}>
                        {unreadCount} новых
                      </span>
                    )}
                  </div>

                  {notifications.length === 0 ? (
                    <div style={{ padding: "30px 16px", textAlign: "center", color: "var(--text-muted)", fontSize: 13 }}>
                      Нет уведомлений
                    </div>
                  ) : notifications.map(notif => (
                    <div
                      key={notif.id}
                      onClick={() => handleNotifClick(notif)}
                      style={{
                        padding: "12px 16px", cursor: "pointer",
                        borderBottom: "1px solid var(--border-light)",
                        background: notif.read ? "transparent" : "var(--accent-light)",
                        transition: "background 0.15s",
                        display: "flex", gap: 12, alignItems: "flex-start",
                      }}
                    >
                      <div style={{ fontSize: 20, flexShrink: 0, marginTop: 1 }}>
                        {NOTIF_ICONS[notif.type] ?? "📌"}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8, marginBottom: 3 }}>
                          <div style={{ fontSize: 13, fontWeight: notif.read ? 400 : 700, color: "var(--text-primary)", lineHeight: 1.3 }}>
                            {notif.title}
                          </div>
                          <div style={{ display: "flex", gap: 4, flexShrink: 0, alignItems: "center" }}>
                            <span style={{ width: 6, height: 6, borderRadius: "50%", background: PRIORITY_COLORS[notif.priority] ?? "var(--text-muted)", flexShrink: 0 }} />
                            <span style={{ fontSize: 10, color: "var(--text-muted)", whiteSpace: "nowrap" }}>
                              {formatNotifTime(notif.created_at)}
                            </span>
                          </div>
                        </div>
                        <div style={{ fontSize: 12, color: "var(--text-secondary)", lineHeight: 1.4 }}>
                          {notif.body}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Avatar */}
            <div className="g-topbar__avatar" onClick={() => navigate('/profile')} title="Профиль" style={{ cursor: 'pointer' }}>
              {initials}
            </div>
          </div>
        </header>

        <div className="g-content" style={{ backgroundColor: 'var(--bg-body)' }}>
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