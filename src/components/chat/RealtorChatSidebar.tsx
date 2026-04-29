import { useState } from "react"

type ChatSession = {
    id: number
    title: string
    preview: string
    time: string
    active?: boolean
}

const mockSessions: ChatSession[] = [
    { id: 1, title: "Сан-Франциско", preview: "Трёхкомнатная, $1.5M", time: "сейчас", active: true },
    { id: 2, title: "Манхэттен", preview: "Студия рядом с метро", time: "вчера" },
    { id: 3, title: "Майами Бич", preview: "Вилла с бассейном", time: "3 дня" },
    { id: 4, title: "Лос-Анджелес", preview: "Дом в Беверли Хиллс", time: "неделю" },
]

type Props = {
    onNewChat?: () => void
}

export default function RealtorChatSidebar({ onNewChat }: Props) {
    const [active, setActive] = useState(1)

    return (
        <aside className="realtor-sidebar">
            <div className="realtor-sidebar__logo">
                <div className="realtor-sidebar__logo-icon">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                        <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="2"/>
                        <path d="M8 12h8M12 8v8" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                </div>
                <span className="realtor-sidebar__logo-text">Home AI</span>
            </div>

            <button className="realtor-sidebar__new-btn" onClick={onNewChat}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
                Новый чат
            </button>

            <nav className="realtor-sidebar__nav">
                <a className="realtor-sidebar__nav-item realtor-sidebar__nav-item--saved" href="#">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z" stroke="currentColor" strokeWidth="2"/>
                    </svg>
                    Сохранённые
                </a>
                <a className="realtor-sidebar__nav-item" href="#">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                    Аналитика рынка
                </a>
                <a className="realtor-sidebar__nav-item" href="#">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2"/>
                        <path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83" stroke="currentColor" strokeWidth="2"/>
                    </svg>
                    Настройки
                </a>
            </nav>

            <div className="realtor-sidebar__history">
                {mockSessions.map((s) => (
                    <div
                        key={s.id}
                        className={`realtor-sidebar__session ${active === s.id ? "realtor-sidebar__session--active" : ""}`}
                        onClick={() => setActive(s.id)}
                    >
                        <div className="realtor-sidebar__session-title">{s.title}</div>
                        <div className="realtor-sidebar__session-preview">{s.preview}</div>
                        <div className="realtor-sidebar__session-time">{s.time}</div>
                    </div>
                ))}
            </div>

            <div className="realtor-sidebar__footer">
                <div className="realtor-sidebar__agent">
                    <div className="realtor-sidebar__agent-avatar">С</div>
                    <div>
                        <div className="realtor-sidebar__agent-name">Ассистент</div>
                        <div className="realtor-sidebar__agent-role">Куратор контента</div>
                    </div>
                </div>
                <button className="realtor-sidebar__pro-btn">Перейти на PRO</button>
            </div>
        </aside>
    )
}
