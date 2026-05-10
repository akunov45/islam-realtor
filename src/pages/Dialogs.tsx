import { useState, useEffect, useCallback } from "react"
import { useNavigate } from "react-router-dom"
import AppLayout from "../components/AppLayout"
import { conversationsApi } from "../api/conversations"
import type { Conversation } from "../types/api"

function formatDate(iso: string) {
    return new Date(iso).toLocaleString("ru-RU", {
        day: "numeric", month: "short", year: "numeric",
        hour: "2-digit", minute: "2-digit"
    })
}

export default function Dialogs() {
    const navigate = useNavigate()
    const [conversations, setConversations] = useState<Conversation[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState("")
    const [filterActive, setFilterActive] = useState<"" | "true" | "false">("")
    const [filterLead, setFilterLead] = useState("")
    const [page, setPage] = useState(1)
    const [count, setCount] = useState(0)
    const [selected, setSelected] = useState<Conversation | null>(null)

    const fetchConversations = useCallback(async () => {
        setLoading(true)
        setError("")
        try {
            const res = await conversationsApi.list({
                is_active: filterActive === "" ? undefined : filterActive === "true",
                lead: filterLead ? parseInt(filterLead) : undefined,
                page,
            })
            setConversations(res.results)
            setCount(res.count)
        } catch {
            setError("Ошибка загрузки диалогов")
        } finally {
            setLoading(false)
        }
    }, [filterActive, filterLead, page])

    useEffect(() => { fetchConversations() }, [fetchConversations])

    const totalPages = Math.ceil(count / 20)
    const activeCount = conversations.filter(c => c.is_active).length

    return (
        <AppLayout
            title="Диалоги"
            breadcrumbs={[{ label: "Дашборд", path: "/dashboard" }, { label: "Диалоги" }]}
            actions={
                <button className="btn btn--outline btn--sm" onClick={fetchConversations}>
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
                    { label: "Всего диалогов", value: String(count), color: "var(--text-primary)" },
                    { label: "Активных", value: String(activeCount), color: "var(--accent)" },
                    { label: "Закрытых", value: String(conversations.filter(c => !c.is_active).length), color: "var(--text-muted)" },
                    { label: "Сообщений", value: String(conversations.reduce((s, c) => s + c.messages.length, 0)), color: "var(--accent)" },
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
                    <select className="form-select" style={{ width: 160 }} value={filterActive}
                        onChange={e => { setFilterActive(e.target.value as "" | "true" | "false"); setPage(1) }}>
                        <option value="">Все диалоги</option>
                        <option value="true">Активные</option>
                        <option value="false">Закрытые</option>
                    </select>
                    <input className="form-input" style={{ width: 160 }} placeholder="ID лида..."
                        value={filterLead} onChange={e => { setFilterLead(e.target.value); setPage(1) }}
                        type="number" />
                    <button className="btn btn--outline btn--sm" onClick={() => { setFilterActive(""); setFilterLead(""); setPage(1) }}>
                        Сбросить
                    </button>
                </div>
            </div>

            {error && <div style={{ padding: "12px 16px", color: "#ef4444", fontSize: 13, marginBottom: 16 }}>⚠ {error}</div>}

            {/* Two column layout */}
            <div style={{ display: "grid", gridTemplateColumns: selected ? "1fr 1fr" : "1fr", gap: 16 }}>

                {/* Conversations list */}
                <div className="g-card" style={{ padding: 0, overflow: "hidden" }}>
                    {loading ? (
                        <div className="empty-state" style={{ padding: "40px 0" }}>
                            <div style={{ color: "var(--text-muted)", fontSize: 13 }}>Загрузка...</div>
                        </div>
                    ) : conversations.length === 0 ? (
                        <div className="empty-state">
                            <div className="empty-state__icon">💬</div>
                            <div className="empty-state__title">Диалоги не найдены</div>
                        </div>
                    ) : (
                        <div>
                            {conversations.map(conv => (
                                <div
                                    key={conv.id}
                                    onClick={() => setSelected(selected?.id === conv.id ? null : conv)}
                                    style={{
                                        display: "flex", alignItems: "center", gap: 14,
                                        padding: "14px 16px", cursor: "pointer",
                                        borderBottom: "1px solid var(--border-light)",
                                        background: selected?.id === conv.id ? "var(--accent-light)" : "transparent",
                                        transition: "background 0.15s",
                                    }}
                                >
                                    <div style={{
                                        width: 40, height: 40, borderRadius: "50%", flexShrink: 0,
                                        background: conv.is_active ? "var(--accent-light)" : "var(--bg-hover)",
                                        color: conv.is_active ? "var(--accent)" : "var(--text-muted)",
                                        display: "flex", alignItems: "center", justifyContent: "center",
                                        fontSize: 14, fontWeight: 700,
                                    }}>
                                        #{conv.id}
                                    </div>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
                                            <span style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)" }}>
                                                Диалог #{conv.id}
                                            </span>
                                            <span style={{
                                                fontSize: 10, fontWeight: 600, padding: "1px 8px", borderRadius: 10,
                                                background: conv.is_active ? "var(--badge-new-bg)" : "var(--bg-hover)",
                                                color: conv.is_active ? "var(--badge-new-text)" : "var(--text-muted)",
                                            }}>
                                                {conv.is_active ? "Активен" : "Закрыт"}
                                            </span>
                                        </div>
                                        <div style={{ fontSize: 12, color: "var(--text-muted)" }}>
                                            {conv.messages.length} сообщ. · {formatDate(conv.updated_at ?? conv.created_at)}
                                        </div>
                                        {(conv.messages?.length ?? 0) > 0 && (
                                            <div style={{ fontSize: 12, color: "var(--text-secondary)", marginTop: 3, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                                {conv.messages?.[conv.messages.length - 1]?.content as string}
                                            </div>
                                        )}
                                    </div>
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: "var(--text-muted)", flexShrink: 0 }}>
                                        <path d="M9 18l6-6-6-6" />
                                    </svg>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div style={{ padding: "12px 16px", borderTop: "1px solid var(--border-light)", display: "flex", alignItems: "center", justifyContent: "space-between", background: "var(--bg-tertiary)" }}>
                            <span style={{ fontSize: 13, color: "var(--text-muted)" }}>
                                Всего {count} диалогов
                            </span>
                            <div style={{ display: "flex", gap: 6 }}>
                                <button className="btn btn--outline btn--sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>←</button>
                                <span style={{ fontSize: 13, color: "var(--text-muted)", display: "flex", alignItems: "center", padding: "0 8px" }}>{page}/{totalPages}</span>
                                <button className="btn btn--outline btn--sm" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>→</button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Selected conversation detail */}
                {selected && (
                    <div className="g-card" style={{ padding: 0, overflow: "hidden", display: "flex", flexDirection: "column" }}>
                        <div style={{ padding: "14px 16px", borderBottom: "1px solid var(--border-color)", display: "flex", alignItems: "center", justifyContent: "space-between", background: "var(--bg-tertiary)" }}>
                            <div>
                                <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)" }}>Диалог #{selected.id}</div>
                                <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{selected.messages.length} сообщений</div>
                            </div>
                            <button onClick={() => setSelected(null)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", fontSize: 18 }}>✕</button>
                        </div>

                        <div style={{ flex: 1, overflowY: "auto", padding: "16px", display: "flex", flexDirection: "column", gap: 10, maxHeight: 500 }}>
                            {selected.messages.length === 0 ? (
                                <div className="empty-state" style={{ padding: "20px 0" }}>
                                    <div className="empty-state__text">Нет сообщений</div>
                                </div>
                            ) : selected.messages.map((msg, i) => {
                                const isUser = (msg as { role?: string }).role === "user"
                                return (
                                    <div key={i} style={{ display: "flex", justifyContent: isUser ? "flex-end" : "flex-start" }}>
                                        <div style={{
                                            maxWidth: "80%", padding: "10px 14px", borderRadius: 12,
                                            background: isUser ? "linear-gradient(135deg,#0d9488,#0f766e)" : "var(--bg-hover)",
                                            color: isUser ? "white" : "var(--text-primary)",
                                            border: isUser ? "none" : "1px solid var(--border-color)",
                                            fontSize: 13, lineHeight: 1.5,
                                            borderBottomRightRadius: isUser ? 4 : 12,
                                            borderBottomLeftRadius: isUser ? 12 : 4,
                                        }}>
                                            {String(msg.content ?? (msg as { text?: string }).text ?? "")}
                                            <div style={{ fontSize: 10, opacity: 0.7, marginTop: 4, textAlign: isUser ? "right" : "left" }}>
                                                {new Date(msg.created_at).toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" })}
                                            </div>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    )
}