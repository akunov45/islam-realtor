import { useState, useEffect, useCallback } from "react"
import AppLayout from "../components/AppLayout"
import { messagesApi } from "../api/conversations"
import type { Message } from "../types/api"

function formatDate(iso: string) {
    return new Date(iso).toLocaleString("ru-RU", {
        day: "numeric", month: "short", hour: "2-digit", minute: "2-digit"
    })
}

const ROLE_LABELS: Record<string, string> = {
    user: "Клиент", assistant: "Ассистент", system: "Система",
}

const ROLE_COLORS: Record<string, string> = {
    user: "var(--accent)", assistant: "#f59e0b", system: "var(--text-muted)",
}

export default function Messages() {
    const [messages, setMessages] = useState<Message[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState("")
    const [count, setCount] = useState(0)
    const [page, setPage] = useState(1)
    const [filterConv, setFilterConv] = useState("")
    const [filterLead, setFilterLead] = useState("")

    const fetchMessages = useCallback(async () => {
        setLoading(true)
        setError("")
        try {
            const res = await messagesApi.list({
                conversation_id: filterConv ? parseInt(filterConv) : undefined,
                lead_id: filterLead ? parseInt(filterLead) : undefined,
                page,
                ordering: "-created_at",
            })
            setMessages(res.results)
            setCount(res.count)
        } catch {
            setError("Ошибка загрузки сообщений")
        } finally {
            setLoading(false)
        }
    }, [filterConv, filterLead, page])

    useEffect(() => { fetchMessages() }, [fetchMessages])

    const totalPages = Math.ceil(count / 20)

    const handleReset = () => { setFilterConv(""); setFilterLead(""); setPage(1) }

    return (
        <AppLayout
            title="Сообщения"
            breadcrumbs={[{ label: "Дашборд", path: "/dashboard" }, { label: "Сообщения" }]}
            actions={
                <button className="btn btn--outline btn--sm" onClick={fetchMessages}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="23 4 23 10 17 10" />
                        <path d="M20.49 15a9 9 0 11-2.12-9.36L23 10" strokeLinecap="round" />
                    </svg>
                    Обновить
                </button>
            }
        >
            {/* Stats */}
            <div className="grid-4" style={{ marginBottom: 20 }}>
                {[
                    { label: "Всего сообщений", value: String(count), color: "var(--text-primary)" },
                    { label: "От клиентов", value: String(messages.filter(m => (m as { role?: string }).role === "user").length), color: "var(--accent)" },
                    { label: "От ассистента", value: String(messages.filter(m => (m as { role?: string }).role === "assistant").length), color: "#f59e0b" },
                    { label: "На странице", value: String(messages.length), color: "var(--text-secondary)" },
                ].map(s => (
                    <div className="stat-card" key={s.label}>
                        <div className="stat-card__label">{s.label}</div>
                        <div className="stat-card__value" style={{ color: s.color }}>{s.value}</div>
                    </div>
                ))}
            </div>

            {/* Filters */}
            <div className="g-card" style={{ marginBottom: 16 }}>
                <div className="filters-row">
                    <input className="form-input" style={{ width: 160 }} placeholder="ID диалога..."
                        type="number" value={filterConv}
                        onChange={e => { setFilterConv(e.target.value); setPage(1) }} />
                    <input className="form-input" style={{ width: 160 }} placeholder="ID лида..."
                        type="number" value={filterLead}
                        onChange={e => { setFilterLead(e.target.value); setPage(1) }} />
                    <button className="btn btn--outline btn--sm" onClick={handleReset}>Сбросить</button>
                    <span style={{ marginLeft: "auto", fontSize: 13, color: "var(--text-muted)" }}>
                        Всего {count} сообщений
                    </span>
                </div>
            </div>

            {error && <div style={{ padding: "12px 16px", color: "#ef4444", fontSize: 13, marginBottom: 16 }}>⚠ {error}</div>}

            {/* Messages list */}
            {loading ? (
                <div className="empty-state"><div style={{ color: "var(--text-muted)" }}>Загрузка...</div></div>
            ) : messages.length === 0 ? (
                <div className="empty-state">
                    <div className="empty-state__icon">✉️</div>
                    <div className="empty-state__title">Сообщения не найдены</div>
                    <div className="empty-state__text">Попробуйте изменить фильтры</div>
                </div>
            ) : (
                <div className="g-card" style={{ padding: 0, overflow: "hidden" }}>
                    <div style={{ overflowX: "auto" }}>
                        <table className="g-table">
                            <thead>
                                <tr>
                                    <th style={{ width: 60 }}>ID</th>
                                    <th style={{ width: 100 }}>Роль</th>
                                    <th>Текст</th>
                                    <th style={{ width: 160 }}>Время</th>
                                </tr>
                            </thead>
                            <tbody>
                                {messages.map(msg => {
                                    const role = (msg as { role?: string }).role ?? "user"
                                    const text = (msg as { text?: string }).text ?? String(msg.content ?? "")
                                    return (
                                        <tr key={msg.id}>
                                            <td>
                                                <span style={{ fontWeight: 700, color: "var(--accent)", fontSize: 13 }}>
                                                    #{msg.id}
                                                </span>
                                            </td>
                                            <td>
                                                <span style={{
                                                    fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 20,
                                                    background: role === "user" ? "var(--badge-new-bg)" : role === "assistant" ? "var(--badge-warn-bg)" : "var(--bg-hover)",
                                                    color: ROLE_COLORS[role] ?? "var(--text-muted)",
                                                }}>
                                                    {ROLE_LABELS[role] ?? role}
                                                </span>
                                            </td>
                                            <td>
                                                <div style={{
                                                    fontSize: 13, color: "var(--text-primary)",
                                                    maxWidth: 500, whiteSpace: "nowrap",
                                                    overflow: "hidden", textOverflow: "ellipsis",
                                                }}>
                                                    {text}
                                                </div>
                                            </td>
                                            <td style={{ fontSize: 12, color: "var(--text-muted)", whiteSpace: "nowrap" }}>
                                                {formatDate(msg.created_at)}
                                            </td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    <div style={{ padding: "12px 16px", borderTop: "1px solid var(--border-light)", display: "flex", alignItems: "center", justifyContent: "space-between", background: "var(--bg-tertiary)" }}>
                        <span style={{ fontSize: 13, color: "var(--text-muted)" }}>
                            Всего <strong style={{ color: "var(--text-primary)" }}>{count}</strong> сообщений
                        </span>
                        {totalPages > 1 && (
                            <div style={{ display: "flex", gap: 6 }}>
                                <button className="btn btn--outline btn--sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>←</button>
                                <span style={{ fontSize: 13, color: "var(--text-muted)", display: "flex", alignItems: "center", padding: "0 8px" }}>{page}/{totalPages}</span>
                                <button className="btn btn--outline btn--sm" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>→</button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </AppLayout>
    )
}