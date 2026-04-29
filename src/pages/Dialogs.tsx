import { useState } from "react"
import { useNavigate } from "react-router-dom"
import AppLayout from "../components/AppLayout"

type Dialog = {
    id: number
    leadName: string
    leadId: number
    source: string
    lastMessage: string
    time: string
    unread: number
    score: number
    status: "active" | "waiting" | "closed"
}

const dialogs: Dialog[] = [
    { id: 1, leadName: "Islam Duishobaev", leadId: 1, source: "Telegram", lastMessage: "Привет, интересует квартира", time: "09:12", unread: 1, score: 4, status: "waiting" },
    { id: 2, leadName: "Иван Иванов", leadId: 2, source: "Instagram", lastMessage: "Да, хочу посмотреть 3-комнатную", time: "08:46", unread: 0, score: 85, status: "active" },
    { id: 3, leadName: "Мария Петрова", leadId: 3, source: "Website", lastMessage: "Интересует ипотека от 15%", time: "вчера", unread: 0, score: 55, status: "waiting" },
    { id: 4, leadName: "Алексей Смирнов", leadId: 4, source: "Facebook", lastMessage: "Пришлите варианты ещё раз", time: "вчера", unread: 0, score: 30, status: "active" },
    { id: 5, leadName: "Elena Petrova", leadId: 5, source: "Lalafo", lastMessage: "Буду готова встретиться на этой неделе", time: "17 апр", unread: 2, score: 92, status: "active" },
    { id: 6, leadName: "Marcus Thorne", leadId: 6, source: "WhatsApp", lastMessage: "Уточните стоимость включая коммуналку", time: "16 апр", unread: 0, score: 71, status: "closed" },
]

function ScoreBadge({ score }: { score: number }) {
    const cls = score >= 70 ? "score-badge--high" : score >= 40 ? "score-badge--mid" : "score-badge--low"
    return <span className={`score-badge ${cls}`}>{score}</span>
}

const sourceColor: Record<string, string> = {
    Telegram: "#2563eb", Instagram: "#db2777", WhatsApp: "#16a34a",
    Facebook: "#1d4ed8", Website: "#6b7280", Lalafo: "#d97706",
}

export default function Dialogs() {
    const navigate = useNavigate()
    const [filter, setFilter] = useState<"all" | "active" | "waiting" | "closed">("all")
    const [search, setSearch] = useState("")

    const filtered = dialogs.filter(d => {
        if (filter !== "all" && d.status !== filter) return false
        if (search && !d.leadName.toLowerCase().includes(search.toLowerCase())) return false
        return true
    })

    return (
        <AppLayout
            title="Диалоги"
            breadcrumbs={[{ label: "Начало", path: "/dashboard" }, { label: "Диалоги" }]}
            actions={<button className="btn btn--primary">+ Новый диалог</button>}
        >
            <div style={{ display: "grid", gridTemplateColumns: "320px 1fr", gap: 16 }}>
                {/* Left: dialog list */}
                <div className="g-card" style={{ padding: 0 }}>
                    <div style={{ padding: "14px 16px", borderBottom: "1px solid #e5e7eb" }}>
                        <input
                            className="form-input"
                            placeholder="Поиск диалогов..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            style={{ marginBottom: 10 }}
                        />
                        <div style={{ display: "flex", gap: 4 }}>
                            {(["all", "active", "waiting", "closed"] as const).map(f => (
                                <button
                                    key={f}
                                    onClick={() => setFilter(f)}
                                    style={{
                                        padding: "4px 10px", border: "none", borderRadius: 6, cursor: "pointer", fontSize: 12,
                                        background: filter === f ? "#3b82f6" : "#f3f4f6",
                                        color: filter === f ? "white" : "#6b7280",
                                        fontWeight: filter === f ? 600 : 400,
                                    }}
                                >
                                    {{ all: "Все", active: "Активные", waiting: "Ожидание", closed: "Закрытые" }[f]}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div style={{ maxHeight: "calc(100vh - 260px)", overflowY: "auto" }}>
                        {filtered.map(d => (
                            <div
                                key={d.id}
                                onClick={() => navigate(`/leads/${d.leadId}`)}
                                style={{
                                    display: "flex", gap: 12, padding: "14px 16px",
                                    borderBottom: "1px solid #f3f4f6", cursor: "pointer",
                                    transition: "background 0.1s",
                                }}
                                onMouseEnter={e => (e.currentTarget.style.background = "#f9fafb")}
                                onMouseLeave={e => (e.currentTarget.style.background = "white")}
                            >
                                {/* Avatar */}
                                <div style={{
                                    width: 42, height: 42, borderRadius: "50%", flex: "none",
                                    background: sourceColor[d.source] || "#6b7280",
                                    display: "flex", alignItems: "center", justifyContent: "center",
                                    color: "white", fontWeight: 700, fontSize: 15,
                                }}>
                                    {d.leadName.charAt(0)}
                                </div>

                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 2 }}>
                                        <span style={{ fontWeight: 600, fontSize: 13, color: "#111827" }}>{d.leadName}</span>
                                        <span style={{ fontSize: 11, color: "#9ca3af" }}>{d.time}</span>
                                    </div>
                                    <div style={{ fontSize: 12, color: "#6b7280", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", marginBottom: 4 }}>
                                        {d.lastMessage}
                                    </div>
                                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                        <span style={{ fontSize: 10, background: sourceColor[d.source] + "22", color: sourceColor[d.source], padding: "1px 6px", borderRadius: 4, fontWeight: 600 }}>
                                            {d.source}
                                        </span>
                                        <ScoreBadge score={d.score} />
                                        {d.unread > 0 && (
                                            <span style={{ marginLeft: "auto", background: "#3b82f6", color: "white", fontSize: 10, fontWeight: 700, padding: "1px 6px", borderRadius: 10 }}>
                                                {d.unread}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                        {filtered.length === 0 && (
                            <div className="empty-state"><div className="empty-state__icon">💬</div><div className="empty-state__title">Диалогов нет</div></div>
                        )}
                    </div>
                </div>

                {/* Right: placeholder */}
                <div className="g-card" style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: 400 }}>
                    <div style={{ textAlign: "center", color: "#9ca3af" }}>
                        <div style={{ fontSize: 48, marginBottom: 12 }}>💬</div>
                        <div style={{ fontSize: 16, fontWeight: 600, color: "#374151", marginBottom: 6 }}>Выберите диалог</div>
                        <div style={{ fontSize: 13 }}>Кликните на диалог слева для просмотра</div>
                    </div>
                </div>
            </div>
        </AppLayout>
    )
}
