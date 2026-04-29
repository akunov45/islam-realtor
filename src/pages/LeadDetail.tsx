import { useState, useEffect } from "react"
import { useNavigate, useParams } from "react-router-dom"
import AppLayout from "../components/AppLayout"
import { leadsApi } from "../api/leads"
import { conversationsApi } from "../api/conversations"
import type { LeadDetail as ILeadDetail, LeadStatus, LeadSource, Conversation } from "../types/api"

const STATUS_LABELS: Record<LeadStatus, string> = {
    new: "Новый", in_progress: "В работе", won: "Сделка", lost: "Отказ",
}
const SOURCE_LABELS: Record<LeadSource, string> = {
    telegram: "Telegram", whatsapp: "WhatsApp", instagram: "Instagram", manual: "Ручной ввод",
}

function ScoreBadge({ score }: { score?: number | undefined }) {
    if (score === undefined || score === null) return <span style={{ color: "#9ca3af" }}>—</span>
    const cls = score >= 70 ? "score-badge--high" : score >= 40 ? "score-badge--mid" : "score-badge--low"
    return <span className={`score-badge ${cls}`} style={{ fontSize: 14, padding: "4px 12px" }}>{score}</span>
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

export default function LeadDetail() {
    const { id } = useParams<{ id: string }>()
    const navigate = useNavigate()

    const [lead, setLead] = useState<ILeadDetail | null>(null)
    const [conversations, setConversations] = useState<Conversation[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState("")

    const [activeTab, setActiveTab] = useState<"overview" | "messages" | "history">("overview")
    const [assignModalOpen, setAssignModalOpen] = useState(false)
    const [editStatus, setEditStatus] = useState<LeadStatus>("new")
    const [saving, setSaving] = useState(false)
    const [toast, setToast] = useState("")

    const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(""), 3000) }

    useEffect(() => {
        if (!id) return
        const load = async () => {
            setLoading(true)
            setError("")
            try {
                const [leadData, convData] = await Promise.all([
                    leadsApi.get(parseInt(id)),
                    conversationsApi.list({ lead: parseInt(id) }),
                ])
                setLead(leadData)
                setEditStatus(leadData.status as LeadStatus)
                setConversations(convData.results)
            } catch {
                setError("Ошибка загрузки лида")
            } finally {
                setLoading(false)
            }
        }
        load()
    }, [id])

    const handleSaveStatus = async () => {
        if (!lead) return
        setSaving(true)
        try {
            await leadsApi.update(lead.id, { status: editStatus })
            setLead(prev => prev ? { ...prev, status: editStatus } : prev)
            showToast("Статус обновлён")
        } catch {
            showToast("Ошибка сохранения")
        } finally {
            setSaving(false)
        }
    }

    if (loading) return (
        <AppLayout title="Загрузка..." breadcrumbs={[{ label: "Лиды", path: "/leads" }, { label: "..." }]}>
            <div className="empty-state"><div style={{ color: "#9ca3af" }}>Загрузка...</div></div>
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
                { label: "Начало", path: "/dashboard" },
                { label: "Лиды", path: "/leads" },
                { label: lead.full_name || `Лид #${lead.id}` }
            ]}
            actions={
                <div style={{ display: "flex", gap: 8 }}>
                    <button className="btn btn--outline" onClick={() => navigate("/leads")}>← Назад</button>
                    <button className="btn btn--primary" onClick={() => setAssignModalOpen(true)}>Назначить риелтора</button>
                </div>
            }
        >
            {/* Header card */}
            <div className="g-card" style={{ marginBottom: 16, padding: "20px 24px" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                        <div style={{ width: 56, height: 56, background: "#e0e7ff", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, fontWeight: 700, color: "#4338ca" }}>
                            {initials}
                        </div>
                        <div>
                            <div style={{ fontSize: 20, fontWeight: 800, color: "#111827" }}>{lead.full_name || "—"}</div>
                            <div style={{ fontSize: 13, color: "#3b82f6" }}>{lead.username ? `@${lead.username}` : "—"}</div>
                            <div style={{ display: "flex", gap: 8, marginTop: 4, flexWrap: "wrap" }}>
                                {lead.status && <StatusBadge status={lead.status as LeadStatus} />}
                                {(lead.tags as string[])?.map((t: string) => (
                                    <span key={t} style={{ fontSize: 11, background: "#f3f4f6", color: "#6b7280", padding: "2px 8px", borderRadius: 10 }}>{t}</span>
                                ))}
                            </div>
                        </div>
                    </div>
                    <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
                        <div style={{ textAlign: "center" }}>
                            <div style={{ fontSize: 11, color: "#9ca3af", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 4 }}>AI Score</div>
                            <ScoreBadge score={lead.score} />
                        </div>
                        <div>
                            <div style={{ fontSize: 11, color: "#9ca3af", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 4 }}>Источник</div>
                            <div style={{ fontWeight: 600, fontSize: 13 }}>{SOURCE_LABELS[lead.source as LeadSource] ?? lead.source}</div>
                        </div>
                        <div>
                            <div style={{ fontSize: 11, color: "#9ca3af", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 4 }}>Телефон</div>
                            <div style={{ fontWeight: 600, fontSize: 13 }}>{lead.phone ?? "—"}</div>
                        </div>
                        <div>
                            <div style={{ fontSize: 11, color: "#9ca3af", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 4 }}>Диалогов</div>
                            <div style={{ fontWeight: 700, fontSize: 14, color: "#111827" }}>{conversations.length}</div>
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
                            <span style={{ marginLeft: 6, background: "#3b82f6", color: "white", borderRadius: 10, fontSize: 10, padding: "1px 6px" }}>{allMessages.length}</span>
                        )}
                    </button>
                ))}
            </div>

            {/* Overview tab */}
            {activeTab === "overview" && (
                <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 16 }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

                        {/* Contact info */}
                        <div className="g-card">
                            <h3 style={{ margin: "0 0 14px", fontSize: 15, fontWeight: 700 }}>Контактная информация</h3>
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                                {[
                                    ["Имя", lead.full_name || "—"],
                                    ["Телефон", lead.phone ?? "—"],
                                    ["Email", lead.email ?? "—"],
                                    ["Источник", SOURCE_LABELS[lead.source as LeadSource] ?? lead.source],
                                    ["Активный", lead.is_active ? "Да" : "Нет"],
                                    ["Дата создания", formatDate(lead.created_at)],
                                    ["Последнее обновление", formatDate(lead.updated_at)],
                                ].map(([k, v]) => (
                                    <div key={k}>
                                        <div style={{ fontSize: 11, color: "#9ca3af", marginBottom: 2 }}>{k}</div>
                                        <div style={{ fontSize: 13, fontWeight: 600, color: "#111827" }}>{v}</div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Change status */}
                        <div className="g-card">
                            <h3 style={{ margin: "0 0 14px", fontSize: 15, fontWeight: 700 }}>Управление статусом</h3>
                            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                                <select className="form-select" style={{ flex: 1 }} value={editStatus} onChange={e => setEditStatus(e.target.value as LeadStatus)}>
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
                            <h3 style={{ margin: "0 0 14px", fontSize: 15, fontWeight: 700 }}>Быстрые действия</h3>
                            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                                <button className="btn btn--primary" onClick={() => setActiveTab("messages")}>💬 Сообщения</button>
                                <button className="btn btn--outline" onClick={() => showToast("Звонок инициирован")}>📞 Позвонить</button>
                                <button className="btn btn--outline" onClick={() => showToast("Email отправлен")}>✉️ Email</button>
                                <button className="btn btn--outline" onClick={() => setAssignModalOpen(true)}>👤 Назначить</button>
                            </div>
                        </div>
                    </div>

                    {/* Right: score detail + timeline */}
                    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                        {lead.score_detail && (
                            <div className="ai-block">
                                <div className="ai-block__label">🤖 Score Detail</div>
                                <div className="ai-block__text" style={{ fontSize: 12 }}>
                                    <pre style={{ margin: 0, fontFamily: "inherit", whiteSpace: "pre-wrap" }}>
                                        {JSON.stringify(lead.score_detail as Record<string, unknown>, null, 2)}
                                    </pre>
                                </div>
                            </div>
                        )}

                        <div className="g-card">
                            <h3 style={{ margin: "0 0 16px", fontSize: 15, fontWeight: 700 }}>Диалоги</h3>
                            {conversations.length === 0 ? (
                                <div className="empty-state" style={{ padding: "20px 0" }}>
                                    <div className="empty-state__text">Нет диалогов</div>
                                </div>
                            ) : (
                                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                                    {conversations.map(c => (
                                        <div key={c.id} style={{ padding: "10px 12px", background: "#f9fafb", borderRadius: 8, fontSize: 13 }}>
                                            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                                                <span style={{ fontWeight: 600 }}>Диалог #{c.id}</span>
                                                <span className={`status-badge ${c.is_active ? "status-badge--new" : "status-badge--cold"}`}>
                                                    {c.is_active ? "Активен" : "Закрыт"}
                                                </span>
                                            </div>
                                            <div style={{ color: "#9ca3af", fontSize: 11 }}>{formatDate(c.created_at)}</div>
                                            <div style={{ color: "#6b7280", fontSize: 11, marginTop: 2 }}>{c.messages.length} сообщ.</div>
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
                <div className="g-card" style={{ display: "flex", flexDirection: "column", height: 500 }}>
                    <div style={{ flex: 1, overflowY: "auto", padding: "12px 0", display: "flex", flexDirection: "column", gap: 12 }}>
                        {allMessages.length === 0 ? (
                            <div className="empty-state">
                                <div className="empty-state__icon">💬</div>
                                <div className="empty-state__title">Нет сообщений</div>
                            </div>
                        ) : allMessages.map((m, i) => (
                            <div key={i} style={{ display: "flex", justifyContent: "flex-start" }}>
                                <div style={{
                                    maxWidth: "70%", padding: "10px 14px", borderRadius: 12,
                                    fontSize: 13, lineHeight: 1.5, background: "#f3f4f6", color: "#374151",
                                }}>
                                    {String(m.content)}
                                    <div style={{ fontSize: 10, opacity: 0.7, marginTop: 4 }}>
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
                    <h3 style={{ margin: "0 0 16px", fontSize: 15, fontWeight: 700 }}>История изменений</h3>
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
                                <div className={`timeline-dot ${lead.score >= 70 ? "timeline-dot--green" : lead.score >= 40 ? "timeline-dot--yellow" : "timeline-dot--gray"}`}>●</div>
                                <div className="timeline-content">
                                    <div className="timeline-content__title">AI скоринг: Score {lead.score}</div>
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
                            <div className="modal__title">Назначить риелтора</div>
                            <button className="modal__close" onClick={() => setAssignModalOpen(false)}>✕</button>
                        </div>
                        <div className="ai-block">
                            <div className="ai-block__label">🤖 AI рекомендация</div>
                            <div className="ai-block__text">
                                {lead.score !== undefined && lead.score >= 70
                                    ? "Горячий лид — назначьте старшего риелтора немедленно."
                                    : lead.score !== undefined && lead.score >= 40
                                        ? "Тёплый лид — назначьте риелтора в течение дня."
                                        : "Холодный лид — можно распределить по очереди."}
                            </div>
                        </div>
                        <div className="modal__footer">
                            <button className="btn btn--outline" onClick={() => setAssignModalOpen(false)}>Отмена</button>
                            <button className="btn btn--primary" onClick={() => { showToast("Функция назначения в разработке"); setAssignModalOpen(false) }}>
                                Назначить
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {toast && <div className="toast toast--success">✓ {toast}</div>}
        </AppLayout>
    )
}