import { useState, useEffect } from "react"
import { useNavigate, useParams } from "react-router-dom"
import AppLayout from "../components/AppLayout"
import { leadsApi } from "../api/leads"
import { agentsApi } from "../api/agents"
import { conversationsApi } from "../api/conversations"
import type { LeadDetail as ILeadDetail, LeadStatus, LeadSource, Conversation } from "../types/api"
import type { AgentKPIBrief } from "../api/agents"

const STATUS_LABELS: Record<LeadStatus, string> = {
    new: "Новый", in_progress: "В работе", won: "Сделка", lost: "Отказ",
}
const SOURCE_LABELS: Record<LeadSource, string> = {
    telegram: "Telegram", whatsapp: "WhatsApp", instagram: "Instagram", manual: "Ручной ввод",
}

function ScoreBadge({ score }: { score?: number | null }) {
    if (score === undefined || score === null) return <span style={{ color: "var(--text-muted)" }}>—</span>
    const bg = score >= 70 ? "var(--score-high-bg)" : score >= 40 ? "var(--score-mid-bg)" : "var(--score-low-bg)"
    const color = score >= 70 ? "var(--score-high-text)" : score >= 40 ? "var(--score-mid-text)" : "var(--score-low-text)"
    return <span style={{ background: bg, color, padding: "4px 12px", borderRadius: 6, fontSize: 14, fontWeight: 700 }}>{score}</span>
}

function StatusBadge({ status }: { status: LeadStatus }) {
    const map: Record<LeadStatus, string> = {
        new: "status-badge--new", in_progress: "status-badge--progress",
        won: "status-badge--done", lost: "status-badge--lost",
    }
    return <span className={`status-badge ${map[status]}`}>{STATUS_LABELS[status]}</span>
}

function formatDate(iso: string) {
    return new Date(iso).toLocaleString("ru-RU", {
        day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit"
    })
}

function InfoRow({ label, value }: { label: string; value: string | React.ReactNode }) {
    return (
        <div>
            <div style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 3 }}>{label}</div>
            <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>{value}</div>
        </div>
    )
}

export default function LeadDetail() {
    const { id } = useParams<{ id: string }>()
    const navigate = useNavigate()

    const [lead, setLead] = useState<ILeadDetail | null>(null)
    const [conversations, setConversations] = useState<Conversation[]>([])
    const [agents, setAgents] = useState<AgentKPIBrief[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState("")

    const [activeTab, setActiveTab] = useState<"overview" | "messages" | "history">("overview")
    const [assignModalOpen, setAssignModalOpen] = useState(false)
    const [selectedAgent, setSelectedAgent] = useState<string>("")
    const [editStatus, setEditStatus] = useState<LeadStatus>("new")
    const [saving, setSaving] = useState(false)
    const [assigning, setAssigning] = useState(false)
    const [toast, setToast] = useState("")

    const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(""), 3000) }

    useEffect(() => {
        if (!id) return
        const load = async () => {
            setLoading(true)
            setError("")
            try {
                const [leadData, convData, agentsData] = await Promise.all([
                    leadsApi.get(parseInt(id)),
                    conversationsApi.list({ lead: parseInt(id) }),
                    agentsApi.list(),
                ])
                setLead(leadData)
                setEditStatus(leadData.status as LeadStatus)
                setConversations(convData.results)
                setAgents(agentsData)
            } catch {
                setError("Ошибка загрузки лида")
            } finally {
                setLoading(false)
            }
        }
        load()
    }, [id])

    // Смена статуса через новый эндпоинт
    const handleSaveStatus = async () => {
        if (!lead) return
        setSaving(true)
        try {
            await leadsApi.changeStatus(lead.id, editStatus)
            setLead(prev => prev ? { ...prev, status: editStatus } : prev)
            showToast("Статус обновлён")
        } catch {
            showToast("Ошибка сохранения")
        } finally {
            setSaving(false)
        }
    }

    // Назначение агента через реальный API
    const handleAssign = async () => {
        if (!lead || !selectedAgent) return
        setAssigning(true)
        try {
            await leadsApi.assign(lead.id, selectedAgent)
            showToast("Агент назначен!")
            setAssignModalOpen(false)
        } catch {
            showToast("Ошибка назначения агента")
        } finally {
            setAssigning(false)
        }
    }

    if (loading) return (
        <AppLayout title="Загрузка..." breadcrumbs={[{ label: "Лиды", path: "/leads" }, { label: "..." }]}>
            <div className="empty-state"><div style={{ color: "var(--text-muted)" }}>Загрузка...</div></div>
        </AppLayout>
    )

    if (error || !lead) return (
        <AppLayout title="Ошибка" breadcrumbs={[{ label: "Лиды", path: "/leads" }, { label: "Ошибка" }]}>
            <div className="empty-state">
                <div className="empty-state__icon">⚠️</div>
                <div className="empty-state__title">{error || "Лид не найден"}</div>
                <button className="btn btn--primary" onClick={() => navigate("/leads")} style={{ marginTop: 16 }}>← Назад</button>
            </div>
        </AppLayout>
    )

    const initials = lead.full_name?.charAt(0)?.toUpperCase() ?? "?"
    const allMessages = conversations.flatMap(c => c.messages)

    return (
        <AppLayout
            title={lead.full_name || "Лид"}
            breadcrumbs={[
                { label: "Дашборд", path: "/dashboard" },
                { label: "Лиды", path: "/leads" },
                { label: lead.full_name || `Лид #${lead.id}` }
            ]}
            actions={
                <div style={{ display: "flex", gap: 8 }}>
                    <button className="btn btn--outline btn--sm" onClick={() => navigate("/leads")}>← Назад</button>
                    <button className="btn btn--primary btn--sm" onClick={() => setAssignModalOpen(true)}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M12.5 7a4 4 0 110 8 4 4 0 010-8zM19 8v6M22 11h-6" /></svg>
                        Назначить агента
                    </button>
                </div>
            }
        >
            {/* Header */}
            <div className="g-card" style={{ marginBottom: 16, padding: "20px 24px" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                        <div style={{
                            width: 56, height: 56, borderRadius: "50%", flexShrink: 0,
                            background: "var(--accent-light)", color: "var(--accent)",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            fontSize: 22, fontWeight: 800,
                        }}>
                            {initials}
                        </div>
                        <div>
                            <div style={{ fontSize: 20, fontWeight: 800, color: "var(--text-primary)" }}>
                                {lead.full_name || "—"}
                            </div>
                            <div style={{ fontSize: 13, color: "var(--accent)", marginTop: 2 }}>
                                {lead.username ? `@${lead.username}` : "—"}
                            </div>
                            <div style={{ display: "flex", gap: 6, marginTop: 6, flexWrap: "wrap" }}>
                                {lead.status && <StatusBadge status={lead.status as LeadStatus} />}
                                {(lead.tags as string[])?.map((t: string) => (
                                    <span key={t} style={{
                                        fontSize: 11, background: "var(--bg-hover)",
                                        color: "var(--text-secondary)", padding: "2px 8px", borderRadius: 10,
                                    }}>{t}</span>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div style={{ display: "flex", gap: 28, flexWrap: "wrap" }}>
                        <div style={{ textAlign: "center" }}>
                            <div style={{ fontSize: 10, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 6 }}>Score</div>
                            <ScoreBadge score={lead.score ?? null} />
                        </div>
                        <div>
                            <div style={{ fontSize: 10, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 4 }}>Источник</div>
                            <div style={{ fontWeight: 600, fontSize: 13, color: "var(--text-primary)" }}>
                                {SOURCE_LABELS[lead.source as LeadSource] ?? lead.source}
                            </div>
                        </div>
                        <div>
                            <div style={{ fontSize: 10, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 4 }}>Телефон</div>
                            <div style={{ fontWeight: 600, fontSize: 13, color: "var(--text-primary)" }}>{lead.phone ?? "—"}</div>
                        </div>
                        <div>
                            <div style={{ fontSize: 10, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 4 }}>Диалогов</div>
                            <div style={{ fontWeight: 700, fontSize: 16, color: "var(--accent)" }}>{conversations.length}</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="tabs">
                {([["overview", "Обзор"], ["messages", "Сообщения"], ["history", "История"]] as const).map(([key, label]) => (
                    <button key={key} className={`tab-btn ${activeTab === key ? "tab-btn--active" : ""}`} onClick={() => setActiveTab(key)}>
                        {label}
                        {key === "messages" && allMessages.length > 0 && (
                            <span style={{ marginLeft: 6, background: "var(--accent)", color: "white", borderRadius: 10, fontSize: 10, padding: "1px 6px" }}>
                                {allMessages.length}
                            </span>
                        )}
                    </button>
                ))}
            </div>

            {/* Overview */}
            {activeTab === "overview" && (
                <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 16 }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

                        {/* Contact info */}
                        <div className="g-card">
                            <h3 style={{ margin: "0 0 16px", fontSize: 15, fontWeight: 700, color: "var(--text-primary)" }}>
                                Контактная информация
                            </h3>
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                                <InfoRow label="Имя" value={lead.full_name || "—"} />
                                <InfoRow label="Телефон" value={lead.phone ?? "—"} />
                                <InfoRow label="Email" value={lead.email ?? "—"} />
                                <InfoRow label="Источник" value={SOURCE_LABELS[lead.source as LeadSource] ?? lead.source} />
                                <InfoRow label="Активный" value={lead.is_active ? "✓ Да" : "✗ Нет"} />
                                <InfoRow label="Дата создания" value={formatDate(lead.created_at)} />
                                <InfoRow label="Обновлён" value={formatDate(lead.updated_at)} />
                            </div>
                        </div>

                        {/* Status management */}
                        <div className="g-card">
                            <h3 style={{ margin: "0 0 14px", fontSize: 15, fontWeight: 700, color: "var(--text-primary)" }}>
                                Управление статусом
                            </h3>
                            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                                <select className="form-select" style={{ flex: 1 }}
                                    value={editStatus} onChange={e => setEditStatus(e.target.value as LeadStatus)}>
                                    <option value="new">Новый</option>
                                    <option value="in_progress">В работе</option>
                                    <option value="won">Сделка</option>
                                    <option value="lost">Отказ</option>
                                </select>
                                <button className="btn btn--primary" onClick={handleSaveStatus} disabled={saving}>
                                    {saving ? "Сохранение..." : "Сохранить"}
                                </button>
                            </div>
                        </div>

                        {/* Quick actions */}
                        <div className="g-card">
                            <h3 style={{ margin: "0 0 14px", fontSize: 15, fontWeight: 700, color: "var(--text-primary)" }}>
                                Быстрые действия
                            </h3>
                            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                                <button className="btn btn--primary btn--sm" onClick={() => setActiveTab("messages")}>
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" /></svg>
                                    Сообщения
                                </button>
                                <button className="btn btn--outline btn--sm" onClick={() => showToast("Звонок инициирован")}>
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013 4.18 2 2 0 015 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L9.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z" /></svg>
                                    Позвонить
                                </button>
                                <button className="btn btn--outline btn--sm" onClick={() => setAssignModalOpen(true)}>
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8" /></svg>
                                    Назначить агента
                                </button>
                            </div>
                        </div>

                        {/* Score detail */}
                        {lead.score_detail && (
                            <div className="ai-block">
                                <div className="ai-block__label">Score Detail</div>
                                <div className="ai-block__text" style={{ fontSize: 12 }}>
                                    <pre style={{ margin: 0, fontFamily: "inherit", whiteSpace: "pre-wrap", color: "var(--text-secondary)" }}>
                                        {JSON.stringify(lead.score_detail as Record<string, unknown>, null, 2)}
                                    </pre>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right */}
                    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                        <div className="g-card">
                            <h3 style={{ margin: "0 0 14px", fontSize: 15, fontWeight: 700, color: "var(--text-primary)" }}>Диалоги</h3>
                            {conversations.length === 0 ? (
                                <div className="empty-state" style={{ padding: "20px 0" }}>
                                    <div className="empty-state__text">Нет диалогов</div>
                                </div>
                            ) : (
                                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                                    {conversations.map(c => (
                                        <div key={c.id} style={{
                                            padding: "10px 12px", background: "var(--bg-tertiary)",
                                            borderRadius: 9, border: "1px solid var(--border-color)", fontSize: 13,
                                        }}>
                                            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                                                <span style={{ fontWeight: 600, color: "var(--text-primary)" }}>Диалог #{c.id}</span>
                                                <span className={`status-badge ${c.is_active ? "status-badge--new" : "status-badge--cold"}`}>
                                                    {c.is_active ? "Активен" : "Закрыт"}
                                                </span>
                                            </div>
                                            <div style={{ color: "var(--text-muted)", fontSize: 11 }}>{formatDate(c.created_at)}</div>
                                            <div style={{ color: "var(--text-secondary)", fontSize: 11, marginTop: 2 }}>{c.messages.length} сообщ.</div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Messages tab */}
            {activeTab === "messages" && (
                <div className="g-card" style={{ display: "flex", flexDirection: "column", height: 520 }}>
                    <div style={{ flex: 1, overflowY: "auto", padding: "12px 0", display: "flex", flexDirection: "column", gap: 10 }}>
                        {allMessages.length === 0 ? (
                            <div className="empty-state">
                                <div className="empty-state__icon">💬</div>
                                <div className="empty-state__title">Нет сообщений</div>
                            </div>
                        ) : allMessages.map((m, i) => (
                            <div key={i} style={{ display: "flex", justifyContent: "flex-start" }}>
                                <div style={{
                                    maxWidth: "72%", padding: "10px 14px", borderRadius: 12,
                                    fontSize: 13, lineHeight: 1.5,
                                    background: "var(--bg-hover)", color: "var(--text-primary)",
                                    border: "1px solid var(--border-color)",
                                }}>
                                    {String(m.content)}
                                    <div style={{ fontSize: 10, color: "var(--text-muted)", marginTop: 4 }}>
                                        {new Date(m.created_at).toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" })}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* History tab */}
            {activeTab === "history" && (
                <div className="g-card">
                    <h3 style={{ margin: "0 0 16px", fontSize: 15, fontWeight: 700, color: "var(--text-primary)" }}>История</h3>
                    <div className="timeline">
                        <div className="timeline-item">
                            <div className="timeline-dot timeline-dot--blue">●</div>
                            <div className="timeline-content">
                                <div className="timeline-content__title">Лид создан ({SOURCE_LABELS[lead.source as LeadSource] ?? lead.source})</div>
                                <div className="timeline-content__meta">{formatDate(lead.created_at)}</div>
                            </div>
                        </div>
                        {lead.score !== undefined && (
                            <div className="timeline-item">
                                <div className={`timeline-dot ${(lead.score ?? 0) >= 70 ? "timeline-dot--green" : (lead.score ?? 0) >= 40 ? "timeline-dot--yellow" : "timeline-dot--gray"}`}>●</div>
                                <div className="timeline-content">
                                    <div className="timeline-content__title">Скоринг: {lead.score}</div>
                                    <div className="timeline-content__meta">{formatDate(lead.created_at)}</div>
                                </div>
                            </div>
                        )}
                        <div className="timeline-item">
                            <div className="timeline-dot timeline-dot--blue">●</div>
                            <div className="timeline-content">
                                <div className="timeline-content__title">Последнее обновление</div>
                                <div className="timeline-content__meta">{formatDate(lead.updated_at)}</div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Assign Modal */}
            {assignModalOpen && (
                <div className="modal-overlay" onClick={() => setAssignModalOpen(false)}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <div className="modal__header">
                            <div className="modal__title">Назначить агента</div>
                            <button className="modal__close" onClick={() => setAssignModalOpen(false)}>✕</button>
                        </div>

                        <div className="form-group" style={{ marginBottom: 16 }}>
                            <label className="form-label">Выберите агента</label>
                            <select className="form-select" value={selectedAgent} onChange={e => setSelectedAgent(e.target.value)}>
                                <option value="">— Выберите агента —</option>
                                {agents.map(a => (
                                    <option key={a.agent_id} value={String(a.agent_id)}>
                                        {a.full_name} · {a.closed_deals} сделок · {(a.conversion_rate * 100).toFixed(0)}%
                                    </option>
                                ))}
                            </select>
                        </div>

                        {selectedAgent && (
                            <div style={{
                                padding: "12px 14px", background: "var(--accent-light)",
                                borderRadius: 10, marginBottom: 4,
                            }}>
                                {(() => {
                                    const agent = agents.find(a => String(a.agent_id) === selectedAgent)
                                    if (!agent) return null
                                    return (
                                        <div style={{ fontSize: 13, color: "var(--accent-text)" }}>
                                            <strong>{agent.full_name}</strong> — {agent.department}<br />
                                            <span style={{ color: "var(--text-secondary)", fontSize: 12 }}>
                                                {agent.closed_deals} закрытых · конверсия {(agent.conversion_rate * 100).toFixed(1)}% · рейтинг {agent.rating?.toFixed(1)}
                                            </span>
                                        </div>
                                    )
                                })()}
                            </div>
                        )}

                        <div className="modal__footer">
                            <button className="btn btn--outline" onClick={() => setAssignModalOpen(false)}>Отмена</button>
                            <button className="btn btn--primary" onClick={handleAssign} disabled={!selectedAgent || assigning}>
                                {assigning ? "Назначение..." : "Назначить"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {toast && <div className="toast toast--success">✓ {toast}</div>}
        </AppLayout>
    )
}