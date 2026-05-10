import { useState, useEffect } from "react"
import { useNavigate, useParams } from "react-router-dom"
import AppLayout from "../components/AppLayout"
import { api } from "../api/client"
import { leadsApi } from "../api/leads"
import { agentsApi } from "../api/agents"
import { tasksApi } from "../api/tasks"
import type { LeadStatus } from "../types/api"
import type { AgentKPIBrief } from "../api/agents"

// ─── Types ────────────────────────────────────────────────────────────────────

interface LeadFull {
    id: number
    full_name: string
    username: string | null
    source: string
    status: string
    stage: { id: number | null; name: string | null }
    score: number
    score_label: string
    score_detail: { budget: number; urgency: number; intent: number; engagement: number } | null
    contacts: { type: string; value: string }[]
    tags: string[]
    assigned_to: { id: number; full_name: string; email: string } | null
    tasks: {
        total: number; pending: number; overdue: number
        items: { id: number; title: string; due_date: string | null; is_done: boolean }[]
    }
    properties: {
        total: number; liked: number; requested: number
        items: { external_id: string; title: string; price: string; status: string }[]
    }
    last_conversation: {
        id: number; is_active: boolean
        last_message: string | null; last_message_at: string | null; messages_count: number
    } | null
    history: { old_status: string; new_status: string; changed_by_email: string | null; created_at: string }[]
    utm: { source: string; campaign: string; medium: string }
    created_at: string
    updated_at: string
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const STATUS_LABELS: Record<string, string> = {
    new: "Новый", in_progress: "В работе", won: "Сделка", lost: "Отказ",
}

const SOURCE_LABELS: Record<string, string> = {
    telegram: "Telegram", whatsapp: "WhatsApp", instagram: "Instagram", manual: "Ручной ввод",
}

const PROPERTY_STATUS_LABELS: Record<string, string> = {
    viewed: "Просмотрен", liked: "Понравился", disliked: "Не понравился", requested: "Звонок",
}

const PROPERTY_STATUS_COLORS: Record<string, string> = {
    viewed: "var(--text-muted)", liked: "#10b981", disliked: "#ef4444", requested: "var(--accent)",
}

function formatDate(iso: string) {
    return new Date(iso).toLocaleString("ru-RU", {
        day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit"
    })
}

function formatMoney(val?: string | null) {
    if (!val) return "—"
    const n = parseFloat(val)
    if (isNaN(n)) return "—"
    if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`
    if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`
    return `$${n.toFixed(0)}`
}

function ScoreBadge({ score, label }: { score: number; label?: string }) {
    const bg = score >= 70 ? "var(--score-high-bg)" : score >= 40 ? "var(--score-mid-bg)" : "var(--score-low-bg)"
    const color = score >= 70 ? "var(--score-high-text)" : score >= 40 ? "var(--score-mid-text)" : "var(--score-low-text)"
    return (
        <div style={{ textAlign: "center" }}>
            <div style={{ background: bg, color, padding: "4px 14px", borderRadius: 8, fontSize: 20, fontWeight: 800, display: "inline-block" }}>{score}</div>
            {label && <div style={{ fontSize: 11, color, marginTop: 3, fontWeight: 600 }}>{label}</div>}
        </div>
    )
}

function StatusBadge({ status }: { status: string }) {
    const map: Record<string, string> = {
        new: "status-badge--new", in_progress: "status-badge--progress",
        won: "status-badge--done", lost: "status-badge--lost",
    }
    return <span className={`status-badge ${map[status] ?? ""}`}>{STATUS_LABELS[status] ?? status}</span>
}

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
    return (
        <div>
            <div style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 3 }}>{label}</div>
            <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>{value}</div>
        </div>
    )
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function LeadDetail() {
    const { id } = useParams<{ id: string }>()
    const navigate = useNavigate()

    const [lead, setLead] = useState<LeadFull | null>(null)
    const [agents, setAgents] = useState<AgentKPIBrief[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState("")
    const [activeTab, setActiveTab] = useState<"overview" | "tasks" | "properties" | "history">("overview")

    const [editStatus, setEditStatus] = useState<LeadStatus>("new")
    const [saving, setSaving] = useState(false)
    const [assignModalOpen, setAssignModalOpen] = useState(false)
    const [addTaskModalOpen, setAddTaskModalOpen] = useState(false)
    const [selectedAgent, setSelectedAgent] = useState("")
    const [assigning, setAssigning] = useState(false)
    const [taskForm, setTaskForm] = useState({ title: "", due_date: "" })
    const [addingTask, setAddingTask] = useState(false)
    const [toast, setToast] = useState("")

    const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(""), 3000) }

    useEffect(() => {
        if (!id) return
        const load = async () => {
            setLoading(true)
            setError("")
            try {
                const [{ data }, agentsData] = await Promise.all([
                    api.get(`/api/v2/agent/leads/${id}/full/`),
                    agentsApi.list(),
                ])
                setLead(data)
                setEditStatus(data.status as LeadStatus)
                setAgents(agentsData)
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
            await leadsApi.changeStatus(lead.id, editStatus)
            setLead(prev => prev ? { ...prev, status: editStatus } : prev)
            showToast("Статус обновлён")
        } catch { showToast("Ошибка сохранения") }
        finally { setSaving(false) }
    }

    const handleAssign = async () => {
        if (!lead || !selectedAgent) return
        setAssigning(true)
        try {
            await leadsApi.assign(lead.id, selectedAgent)
            const agent = agents.find(a => String(a.agent_id) === selectedAgent)
            if (agent) setLead(prev => prev ? { ...prev, assigned_to: { id: agent.agent_id, full_name: agent.full_name, email: agent.email } } : prev)
            showToast("Агент назначен!")
            setAssignModalOpen(false)
        } catch { showToast("Ошибка назначения") }
        finally { setAssigning(false) }
    }

    const handleAddTask = async () => {
        if (!lead || !taskForm.title.trim()) { showToast("Введите название задачи"); return }
        setAddingTask(true)
        try {
            await tasksApi.createForLead(lead.id, { title: taskForm.title, due_date: taskForm.due_date || undefined })
            showToast("Задача добавлена!")
            setAddTaskModalOpen(false)
            setTaskForm({ title: "", due_date: "" })
            // Обновляем данные
            const { data } = await api.get(`/api/v2/agent/leads/${id}/full/`)
            setLead(data)
        } catch { showToast("Ошибка создания задачи") }
        finally { setAddingTask(false) }
    }

    const handleToggleTask = async (taskId: number, isDone: boolean) => {
        try {
            await tasksApi.update(taskId, { is_done: !isDone })
            setLead(prev => {
                if (!prev) return prev
                return {
                    ...prev,
                    tasks: {
                        ...prev.tasks,
                        items: prev.tasks.items.map(t => t.id === taskId ? { ...t, is_done: !isDone } : t)
                    }
                }
            })
            showToast(isDone ? "Задача возобновлена" : "Задача выполнена ✓")
        } catch { showToast("Ошибка обновления задачи") }
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
                    <button className="btn btn--outline btn--sm" onClick={() => setAddTaskModalOpen(true)}>+ Задача</button>
                    <button className="btn btn--primary btn--sm" onClick={() => setAssignModalOpen(true)}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M12.5 7a4 4 0 110 8 4 4 0 010-8zM19 8v6M22 11h-6" /></svg>
                        Назначить агента
                    </button>
                </div>
            }
        >
            {/* ── Header ── */}
            <div className="g-card" style={{ marginBottom: 16, padding: "20px 24px" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                        <div style={{ width: 56, height: 56, borderRadius: "50%", flexShrink: 0, background: "var(--accent-light)", color: "var(--accent)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, fontWeight: 800 }}>
                            {initials}
                        </div>
                        <div>
                            <div style={{ fontSize: 20, fontWeight: 800, color: "var(--text-primary)" }}>{lead.full_name}</div>
                            <div style={{ fontSize: 13, color: "var(--accent)", marginTop: 2 }}>{lead.username ? `@${lead.username}` : "—"}</div>
                            <div style={{ display: "flex", gap: 6, marginTop: 6, flexWrap: "wrap" }}>
                                <StatusBadge status={lead.status} />
                                {lead.stage?.name && (
                                    <span style={{ fontSize: 11, background: "var(--bg-hover)", color: "var(--text-secondary)", padding: "2px 8px", borderRadius: 10 }}>
                                        {lead.stage.name}
                                    </span>
                                )}
                                {lead.tags.map(t => (
                                    <span key={t} style={{ fontSize: 11, background: "var(--bg-hover)", color: "var(--text-secondary)", padding: "2px 8px", borderRadius: 10 }}>{t}</span>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div style={{ display: "flex", gap: 24, flexWrap: "wrap", alignItems: "center" }}>
                        <ScoreBadge score={lead.score} label={lead.score_label} />
                        <div>
                            <div style={{ fontSize: 10, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 4 }}>Источник</div>
                            <div style={{ fontWeight: 600, fontSize: 13, color: "var(--text-primary)" }}>{SOURCE_LABELS[lead.source] ?? lead.source}</div>
                        </div>
                        <div>
                            <div style={{ fontSize: 10, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 4 }}>Назначен</div>
                            {lead.assigned_to ? (
                                <div style={{ fontWeight: 600, fontSize: 13, color: "var(--accent)" }}>{lead.assigned_to.full_name}</div>
                            ) : (
                                <div style={{ fontSize: 13, color: "var(--text-muted)" }}>Не назначен</div>
                            )}
                        </div>
                        <div>
                            <div style={{ fontSize: 10, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 4 }}>Задач</div>
                            <div style={{ fontWeight: 700, fontSize: 16, color: lead.tasks.overdue > 0 ? "#ef4444" : "var(--accent)" }}>{lead.tasks.total}</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Tabs ── */}
            <div className="tabs">
                {([
                    ["overview", "Обзор"],
                    ["tasks", `Задачи (${lead.tasks.total})`],
                    ["properties", `Объекты (${lead.properties.total})`],
                    ["history", `История (${lead.history.length})`],
                ] as const).map(([key, label]) => (
                    <button key={key} className={`tab-btn ${activeTab === key ? "tab-btn--active" : ""}`} onClick={() => setActiveTab(key)}>
                        {label}
                        {key === "tasks" && lead.tasks.overdue > 0 && (
                            <span style={{ marginLeft: 6, background: "#ef4444", color: "white", borderRadius: 10, fontSize: 10, padding: "1px 6px" }}>{lead.tasks.overdue}</span>
                        )}
                    </button>
                ))}
            </div>

            {/* ── Overview Tab ── */}
            {activeTab === "overview" && (
                <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 16 }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

                        {/* Contacts */}
                        <div className="g-card">
                            <h3 style={{ margin: "0 0 16px", fontSize: 15, fontWeight: 700, color: "var(--text-primary)" }}>Контакты</h3>
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
                                {lead.contacts.length > 0 ? lead.contacts.map((c, i) => (
                                    <InfoRow key={i} label={c.type} value={c.value} />
                                )) : (
                                    <div style={{ color: "var(--text-muted)", fontSize: 13 }}>Нет контактов</div>
                                )}
                            </div>
                            <div style={{ borderTop: "1px solid var(--border-light)", paddingTop: 14 }}>
                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                                    <InfoRow label="Источник" value={SOURCE_LABELS[lead.source] ?? lead.source} />
                                    <InfoRow label="Создан" value={formatDate(lead.created_at)} />
                                    <InfoRow label="Обновлён" value={formatDate(lead.updated_at)} />
                                    {lead.utm?.campaign && <InfoRow label="UTM Campaign" value={lead.utm.campaign} />}
                                    {lead.utm?.source && <InfoRow label="UTM Source" value={lead.utm.source} />}
                                    {lead.utm?.medium && <InfoRow label="UTM Medium" value={lead.utm.medium} />}
                                </div>
                            </div>
                        </div>

                        {/* Status management */}
                        <div className="g-card">
                            <h3 style={{ margin: "0 0 14px", fontSize: 15, fontWeight: 700, color: "var(--text-primary)" }}>Управление статусом</h3>
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

                        {/* Score detail */}
                        {lead.score_detail && (
                            <div className="g-card">
                                <h3 style={{ margin: "0 0 14px", fontSize: 15, fontWeight: 700, color: "var(--text-primary)" }}>Детали скоринга</h3>
                                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                                    {[
                                        { label: "Бюджет", value: lead.score_detail.budget, max: 100 },
                                        { label: "Срочность", value: lead.score_detail.urgency, max: 10 },
                                        { label: "Намерение", value: lead.score_detail.intent, max: 10 },
                                        { label: "Активность", value: lead.score_detail.engagement, max: 10 },
                                    ].map(row => (
                                        <div key={row.label}>
                                            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 4 }}>
                                                <span style={{ color: "var(--text-secondary)" }}>{row.label}</span>
                                                <span style={{ fontWeight: 700, color: "var(--accent)" }}>{row.value}/{row.max}</span>
                                            </div>
                                            <div className="progress-bar">
                                                <div className="progress-bar__fill" style={{ width: `${(row.value / row.max) * 100}%` }} />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right column */}
                    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

                        {/* Assigned agent */}
                        <div className="g-card">
                            <h3 style={{ margin: "0 0 12px", fontSize: 14, fontWeight: 700, color: "var(--text-primary)" }}>Назначенный агент</h3>
                            {lead.assigned_to ? (
                                <div style={{ display: "flex", alignItems: "center", gap: 12, padding: 12, background: "var(--accent-light)", borderRadius: 10 }}>
                                    <div style={{ width: 40, height: 40, borderRadius: "50%", background: "linear-gradient(135deg,#0d9488,#14b8a6)", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, fontWeight: 700, flexShrink: 0 }}>
                                        {lead.assigned_to.full_name?.charAt(0) ?? "?"}
                                    </div>
                                    <div>
                                        <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)" }}>{lead.assigned_to.full_name}</div>
                                        <div style={{ fontSize: 11, color: "var(--accent)" }}>{lead.assigned_to.email}</div>
                                    </div>
                                </div>
                            ) : (
                                <div style={{ padding: 12, background: "var(--bg-tertiary)", borderRadius: 10, fontSize: 13, color: "var(--text-muted)", textAlign: "center" }}>
                                    Агент не назначен
                                    <div style={{ marginTop: 8 }}>
                                        <button className="btn btn--primary btn--sm" onClick={() => setAssignModalOpen(true)}>Назначить</button>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Last conversation */}
                        {lead.last_conversation && (
                            <div className="g-card">
                                <h3 style={{ margin: "0 0 12px", fontSize: 14, fontWeight: 700, color: "var(--text-primary)" }}>Последний диалог</h3>
                                <div style={{ padding: "10px 12px", background: "var(--bg-tertiary)", borderRadius: 9, border: "1px solid var(--border-color)" }}>
                                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                                        <span style={{ fontSize: 12, fontWeight: 600, color: "var(--text-primary)" }}>Диалог #{lead.last_conversation.id}</span>
                                        <span className={`status-badge ${lead.last_conversation.is_active ? "status-badge--new" : "status-badge--cold"}`}>
                                            {lead.last_conversation.is_active ? "Активен" : "Закрыт"}
                                        </span>
                                    </div>
                                    {lead.last_conversation.last_message && (
                                        <div style={{ fontSize: 12, color: "var(--text-secondary)", marginBottom: 4, lineHeight: 1.4 }}>
                                            {lead.last_conversation.last_message}
                                        </div>
                                    )}
                                    <div style={{ fontSize: 11, color: "var(--text-muted)" }}>
                                        {lead.last_conversation.messages_count} сообщ.
                                        {lead.last_conversation.last_message_at && ` · ${formatDate(lead.last_conversation.last_message_at)}`}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Quick tasks summary */}
                        <div className="g-card">
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                                <h3 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: "var(--text-primary)" }}>Задачи</h3>
                                <button className="btn btn--outline btn--sm" onClick={() => setActiveTab("tasks")}>Все</button>
                            </div>
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 10 }}>
                                {[
                                    { label: "Всего", value: lead.tasks.total, color: "var(--text-primary)" },
                                    { label: "Активных", value: lead.tasks.pending, color: "var(--accent)" },
                                    { label: "Просроч.", value: lead.tasks.overdue, color: "#ef4444" },
                                ].map(s => (
                                    <div key={s.label} style={{ padding: "8px", background: "var(--bg-tertiary)", borderRadius: 8, textAlign: "center" }}>
                                        <div style={{ fontSize: 18, fontWeight: 800, color: s.color }}>{s.value}</div>
                                        <div style={{ fontSize: 10, color: "var(--text-muted)" }}>{s.label}</div>
                                    </div>
                                ))}
                            </div>
                            <button className="btn btn--outline btn--sm" style={{ width: "100%" }} onClick={() => setAddTaskModalOpen(true)}>
                                + Добавить задачу
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Tasks Tab ── */}
            {activeTab === "tasks" && (
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {lead.tasks.items.length === 0 ? (
                        <div className="empty-state">
                            <div className="empty-state__icon">✅</div>
                            <div className="empty-state__title">Нет задач</div>
                            <button className="btn btn--primary btn--sm" style={{ marginTop: 16 }} onClick={() => setAddTaskModalOpen(true)}>+ Добавить задачу</button>
                        </div>
                    ) : lead.tasks.items.map(task => {
                        const overdue = !task.is_done && task.due_date && new Date(task.due_date) < new Date()
                        return (
                            <div key={task.id} className="g-card" style={{
                                padding: "14px 16px", display: "flex", alignItems: "center", gap: 14,
                                borderLeft: `3px solid ${task.is_done ? "#10b981" : overdue ? "#ef4444" : "var(--accent)"}`,
                                opacity: task.is_done ? 0.7 : 1,
                            }}>
                                <button
                                    onClick={() => handleToggleTask(task.id, task.is_done)}
                                    style={{ width: 22, height: 22, borderRadius: "50%", flexShrink: 0, border: `2px solid ${task.is_done ? "#10b981" : "var(--border-color)"}`, background: task.is_done ? "#10b981" : "transparent", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}
                                >
                                    {task.is_done && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12" /></svg>}
                                </button>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)", textDecoration: task.is_done ? "line-through" : "none" }}>
                                        {task.title}
                                    </div>
                                    {task.due_date && (
                                        <div style={{ fontSize: 11, color: overdue ? "#ef4444" : "var(--text-muted)", marginTop: 2 }}>
                                            {overdue ? "⚠ Просрочено · " : ""}{new Date(task.due_date).toLocaleDateString("ru-RU", { day: "numeric", month: "short" })}
                                        </div>
                                    )}
                                </div>
                                <span style={{ background: task.is_done ? "var(--score-high-bg)" : overdue ? "var(--badge-err-bg)" : "var(--badge-new-bg)", color: task.is_done ? "var(--score-high-text)" : overdue ? "var(--badge-err-text)" : "var(--badge-new-text)", fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 20 }}>
                                    {task.is_done ? "Выполнено" : overdue ? "Просрочено" : "Активна"}
                                </span>
                            </div>
                        )
                    })}
                    <button className="btn btn--outline btn--sm" style={{ alignSelf: "flex-start" }} onClick={() => setAddTaskModalOpen(true)}>
                        + Добавить задачу
                    </button>
                </div>
            )}

            {/* ── Properties Tab ── */}
            {activeTab === "properties" && (
                <div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10, marginBottom: 16 }}>
                        {[
                            { label: "Всего", value: lead.properties.total, color: "var(--text-primary)" },
                            { label: "Понравилось", value: lead.properties.liked, color: "#10b981" },
                            { label: "Запросы", value: lead.properties.requested, color: "var(--accent)" },
                        ].map(s => (
                            <div className="stat-card" key={s.label}>
                                <div className="stat-card__label">{s.label}</div>
                                <div className="stat-card__value" style={{ color: s.color }}>{s.value}</div>
                            </div>
                        ))}
                    </div>

                    {lead.properties.items.length === 0 ? (
                        <div className="empty-state">
                            <div className="empty-state__icon">🏠</div>
                            <div className="empty-state__title">Нет объектов</div>
                            <div className="empty-state__text">Привяжите объект через страницу Объекты</div>
                        </div>
                    ) : (
                        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                            {lead.properties.items.map(prop => (
                                <div key={prop.external_id} className="g-card" style={{ padding: "14px 16px", display: "flex", alignItems: "center", gap: 14 }}>
                                    <div style={{ width: 44, height: 44, borderRadius: 10, background: "var(--accent-light)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>
                                    </div>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{prop.title}</div>
                                        <div style={{ fontSize: 12, color: "var(--accent)", fontWeight: 700, marginTop: 2 }}>{formatMoney(prop.price)}</div>
                                    </div>
                                    <span style={{ background: PROPERTY_STATUS_COLORS[prop.status] === "#10b981" ? "var(--score-high-bg)" : "var(--bg-hover)", color: PROPERTY_STATUS_COLORS[prop.status] ?? "var(--text-muted)", fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 20, flexShrink: 0 }}>
                                        {PROPERTY_STATUS_LABELS[prop.status] ?? prop.status}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* ── History Tab ── */}
            {activeTab === "history" && (
                <div className="g-card">
                    <h3 style={{ margin: "0 0 16px", fontSize: 15, fontWeight: 700, color: "var(--text-primary)" }}>История изменений</h3>
                    {lead.history.length === 0 ? (
                        <div className="empty-state" style={{ padding: "20px 0" }}>
                            <div className="empty-state__text">Нет истории</div>
                        </div>
                    ) : (
                        <div className="timeline">
                            <div className="timeline-item">
                                <div className="timeline-dot timeline-dot--blue">●</div>
                                <div className="timeline-content">
                                    <div className="timeline-content__title">Лид создан ({SOURCE_LABELS[lead.source] ?? lead.source})</div>
                                    <div className="timeline-content__meta">{formatDate(lead.created_at)}</div>
                                </div>
                            </div>
                            {lead.history.map((h, i) => (
                                <div key={i} className="timeline-item">
                                    <div className="timeline-dot timeline-dot--green">●</div>
                                    <div className="timeline-content">
                                        <div className="timeline-content__title">
                                            Статус изменён: <span style={{ color: "var(--text-muted)" }}>{STATUS_LABELS[h.old_status] ?? h.old_status}</span>
                                            {" → "}
                                            <span style={{ color: "var(--accent)", fontWeight: 700 }}>{STATUS_LABELS[h.new_status] ?? h.new_status}</span>
                                        </div>
                                        <div className="timeline-content__meta">
                                            {formatDate(h.created_at)}
                                            {h.changed_by_email && ` · ${h.changed_by_email}`}
                                        </div>
                                    </div>
                                </div>
                            ))}
                            <div className="timeline-item">
                                <div className="timeline-dot timeline-dot--blue">●</div>
                                <div className="timeline-content">
                                    <div className="timeline-content__title">Последнее обновление</div>
                                    <div className="timeline-content__meta">{formatDate(lead.updated_at)}</div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* ── Assign Modal ── */}
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
                        {selectedAgent && (() => {
                            const agent = agents.find(a => String(a.agent_id) === selectedAgent)
                            if (!agent) return null
                            return (
                                <div style={{ padding: "12px 14px", background: "var(--accent-light)", borderRadius: 10, marginBottom: 4 }}>
                                    <div style={{ fontSize: 13, color: "var(--accent-text)" }}>
                                        <strong>{agent.full_name}</strong> — {agent.department}<br />
                                        <span style={{ color: "var(--text-secondary)", fontSize: 12 }}>
                                            {agent.closed_deals} закрытых · конверсия {(agent.conversion_rate * 100).toFixed(1)}% · рейтинг {agent.rating?.toFixed(1)}
                                        </span>
                                    </div>
                                </div>
                            )
                        })()}
                        <div className="modal__footer">
                            <button className="btn btn--outline" onClick={() => setAssignModalOpen(false)}>Отмена</button>
                            <button className="btn btn--primary" onClick={handleAssign} disabled={!selectedAgent || assigning}>
                                {assigning ? "Назначение..." : "Назначить"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Add Task Modal ── */}
            {addTaskModalOpen && (
                <div className="modal-overlay" onClick={() => setAddTaskModalOpen(false)}>
                    <div className="modal" style={{ maxWidth: 420 }} onClick={e => e.stopPropagation()}>
                        <div className="modal__header">
                            <div className="modal__title">Добавить задачу</div>
                            <button className="modal__close" onClick={() => setAddTaskModalOpen(false)}>✕</button>
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                            <div className="form-group">
                                <label className="form-label">Название *</label>
                                <input className="form-input" placeholder="Позвонить клиенту..." value={taskForm.title}
                                    onChange={e => setTaskForm(f => ({ ...f, title: e.target.value }))} autoFocus />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Срок выполнения</label>
                                <input className="form-input" type="datetime-local" value={taskForm.due_date}
                                    onChange={e => setTaskForm(f => ({ ...f, due_date: e.target.value }))} />
                            </div>
                        </div>
                        <div className="modal__footer">
                            <button className="btn btn--outline" onClick={() => setAddTaskModalOpen(false)}>Отмена</button>
                            <button className="btn btn--primary" onClick={handleAddTask} disabled={addingTask}>
                                {addingTask ? "Добавление..." : "Добавить"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {toast && <div className="toast toast--success">✓ {toast}</div>}
        </AppLayout>
    )
}