import { useState } from "react"
import { useNavigate, useLocation } from "react-router-dom"

type NavItem = {
    icon: React.ReactNode
    label: string
    path: string
}

const navItems: NavItem[] = [
    {
        label: "Рабочий стол",
        path: "/dashboard",
        icon: (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <rect x="3" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2"/>
                <rect x="14" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2"/>
                <rect x="14" y="14" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2"/>
                <rect x="3" y="14" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2"/>
            </svg>
        ),
    },
    {
        label: "Лиды",
        path: "/leads",
        icon: (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="2"/>
                <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
        ),
    },
    {
        label: "Сделки",
        path: "/deals",
        icon: (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" stroke="currentColor" strokeWidth="2"/>
            </svg>
        ),
    },
    {
        label: "Задачи",
        path: "/tasks",
        icon: (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M9 11l3 3L22 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
        ),
    },
    {
        label: "AI Аналитика",
        path: "/analytics",
        icon: (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
        ),
    },
    {
        label: "AI Чат",
        path: "/chat",
        icon: (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
        ),
    },
]

type ChatThread = {
    id: number
    clientName: string
    preview: string
    time: string
    unread?: number
    score?: number
}

const mockThreads: ChatThread[] = [
    { id: 1, clientName: "Иван Иванов", preview: "Когда можно приехать на просмотр?", time: "14:32", unread: 2, score: 85 },
    { id: 2, clientName: "Мария Петрова", preview: "Интересует ипотека от 15%", time: "11:20", score: 55 },
    { id: 3, clientName: "Алексей Смирнов", preview: "Пришлите варианты ещё раз", time: "вчера", score: 30 },
    { id: 4, clientName: "AI-Ассистент", preview: "Обработано 14 новых заявок", time: "10:00" },
]

export default function AdminChatSidebar() {
    const navigate = useNavigate()
    const location = useLocation()
    const [activeThread, setActiveThread] = useState(1)

    return (
        <aside className="admin-sidebar">
            {/* Logo */}
            <div className="admin-sidebar__brand">
                <div className="admin-sidebar__brand-icon">EA</div>
                <div>
                    <div className="admin-sidebar__brand-name">Editorial Architect</div>
                    <div className="admin-sidebar__brand-sub">Premium Real Estate</div>
                </div>
            </div>

            {/* Nav */}
            <nav className="admin-sidebar__nav">
                {navItems.map((item) => (
                    <button
                        key={item.path}
                        className={`admin-sidebar__nav-item ${location.pathname === item.path ? "admin-sidebar__nav-item--active" : ""}`}
                        onClick={() => navigate(item.path)}
                    >
                        {item.icon}
                        {item.label}
                    </button>
                ))}
            </nav>

            {/* Chat threads */}
            <div className="admin-sidebar__threads-label">Чаты с клиентами</div>
            <div className="admin-sidebar__threads">
                {mockThreads.map((thread) => (
                    <div
                        key={thread.id}
                        className={`admin-sidebar__thread ${activeThread === thread.id ? "admin-sidebar__thread--active" : ""}`}
                        onClick={() => setActiveThread(thread.id)}
                    >
                        <div className="admin-sidebar__thread-avatar">
                            {thread.clientName.charAt(0)}
                        </div>
                        <div className="admin-sidebar__thread-info">
                            <div className="admin-sidebar__thread-name">{thread.clientName}</div>
                            <div className="admin-sidebar__thread-preview">{thread.preview}</div>
                        </div>
                        <div className="admin-sidebar__thread-meta">
                            <span className="admin-sidebar__thread-time">{thread.time}</span>
                            {thread.unread && (
                                <span className="admin-sidebar__thread-badge">{thread.unread}</span>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* Bottom actions */}
            <div className="admin-sidebar__bottom">
                <button className="admin-sidebar__new-obj-btn">+ Новый объект</button>
                <div className="admin-sidebar__bottom-links">
                    <button className="admin-sidebar__bottom-link">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                            <path d="M12 8v4l3 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                        </svg>
                        Поддержка
                    </button>
                    <button className="admin-sidebar__bottom-link">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                            <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        Выйти
                    </button>
                </div>
            </div>
        </aside>
    )
}
