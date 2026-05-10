import { useState, useEffect, useCallback } from "react"
import { useNavigate } from "react-router-dom"
import AppLayout from "../components/AppLayout"
import { tasksApi } from "../api/tasks"
import { api } from "../api/client"
import type { Task } from "../api/tasks"

// ─── Types ────────────────────────────────────────────────────────────────────

interface TaskTodayItem {
    id: number
    lead_id: number
    lead_name: string
    title: string
    due_date: string | null
    is_done: boolean
    overdue_hours: number | null
}

interface TasksTodayResponse {
    agent_id: number
    today: string
    overdue: { count: number; items: TaskTodayItem[] }
    due_today: { count: number; items: TaskTodayItem[] }
    upcoming: { count: number; next_due_at: string | null }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString("ru-RU", { day: "numeric", month: "short", year: "numeric" })
}

function formatDateTime(iso: string) {
    return new Date(iso).toLocaleString("ru-RU", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })
}

function isOverdue(due_date?: string | null) {
    if (!due_date) return false
    return new Date(due_date) < new Date()
}

// ─── Task Row ─────────────────────────────────────────────────────────────────

function TaskRow({ task, onToggle, onDelete, leadLink }: {
    task: { id: number; title: string; due_date?: string | null | undefined; is_done?: boolean | undefined; lead?: number | null | undefined }
    onToggle: (id: number, isDone: boolean) => void
    onDelete: (id: number) => void
    leadLink?: number | null
}) {
    const navigate = useNavigate()
    const overdue = !task.is_done && isOverdue(task.due_date)
    return (
        <div className="g-card" style={{
            padding: "14px 16px", display: "flex", alignItems: "center", gap: 14,
            borderLeft: `3px solid ${task.is_done ? "#10b981" : overdue ? "#ef4444" : "var(--accent)"}`,
            opacity: task.is_done ? 0.7 : 1,
        }}>
            <button
                onClick={() => onToggle(task.id, task.is_done ?? false)}
                style={{ width: 22, height: 22, borderRadius: "50%", flexShrink: 0, border: `2px solid ${task.is_done ? "#10b981" : "var(--border-color)"}`, background: task.is_done ? "#10b981" : "transparent", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", transition: "all 0.15s" }}
            >
                {task.is_done && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12" /></svg>}
            </button>
            <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)", textDecoration: task.is_done ? "line-through" : "none", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {task.title}
                </div>
                <div style={{ display: "flex", gap: 10, marginTop: 3, flexWrap: "wrap" }}>
                    {task.due_date && (
                        <span style={{ fontSize: 11, color: overdue ? "#ef4444" : "var(--text-muted)", fontWeight: overdue ? 600 : 400, display: "flex", alignItems: "center", gap: 3 }}>
                            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
                            {overdue ? "Просрочено · " : ""}{formatDate(task.due_date)}
                        </span>
                    )}
                    {leadLink && (
                        <span style={{ fontSize: 11, color: "var(--accent)", cursor: "pointer" }} onClick={() => navigate(`/leads/${leadLink}`)}>
                            Лид #{leadLink} →
                        </span>
                    )}
                </div>
            </div>
            <span style={{ background: task.is_done ? "var(--score-high-bg)" : overdue ? "var(--badge-err-bg)" : "var(--badge-new-bg)", color: task.is_done ? "var(--score-high-text)" : overdue ? "var(--badge-err-text)" : "var(--badge-new-text)", fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 20, flexShrink: 0 }}>
                {task.is_done ? "Выполнено" : overdue ? "Просрочено" : "Активна"}
            </span>
            <button
                onClick={() => onDelete(task.id)}
                style={{ padding: "4px 8px", background: "var(--badge-err-bg)", color: "var(--badge-err-text)", border: "1px solid var(--badge-err-bg)", borderRadius: 7, cursor: "pointer", flexShrink: 0 }}
            >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6M10 11v6M14 11v6" /></svg>
            </button>
        </div>
    )
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function Tasks() {
    const navigate = useNavigate()
    const [activeTab, setActiveTab] = useState<"today" | "all">("today")

    // Today tab
    const [todayData, setTodayData] = useState<TasksTodayResponse | null>(null)
    const [todayLoading, setTodayLoading] = useState(true)

    // All tab
    const [tasks, setTasks] = useState<Task[]>([])
    const [loading, setLoading] = useState(true)
    const [filterDone, setFilterDone] = useState<"" | "true" | "false">("")
    const [searchInput, setSearchInput] = useState("")

    const [modalOpen, setModalOpen] = useState(false)
    const [editingTask, setEditingTask] = useState<Task | null>(null)
    const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null)
    const [saving, setSaving] = useState(false)
    const [form, setForm] = useState<{ title: string; due_date: string; lead?: number | undefined }>({ title: "", due_date: "" })
    const [toast, setToast] = useState("")

    const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(""), 3000) }

    // Fetch today tasks
    const fetchToday = useCallback(async () => {
        setTodayLoading(true)
        try {
            const { data } = await api.get('/api/v2/agent/tasks/today/')
            setTodayData(data)
        } catch { /* тихо */ }
        finally { setTodayLoading(false) }
    }, [])

    // Fetch all tasks
    const fetchAll = useCallback(async () => {
        setLoading(true)
        try {
            const data = await tasksApi.list({ is_done: filterDone === "" ? undefined : filterDone === "true" })
            setTasks(data)
        } catch { /* тихо */ }
        finally { setLoading(false) }
    }, [filterDone])

    useEffect(() => {
        if (activeTab === "today") fetchToday()
        else fetchAll()
    }, [activeTab, fetchToday, fetchAll])

    const handleToggle = async (id: number, isDone: boolean) => {
        try {
            await tasksApi.update(id, { is_done: !isDone })
            if (activeTab === "today") fetchToday()
            else setTasks(prev => prev.map(t => t.id === id ? { ...t, is_done: !isDone } : t))
            showToast(isDone ? "Задача возобновлена" : "Задача выполнена ✓")
        } catch { showToast("Ошибка обновления") }
    }

    const handleDelete = async (id: number) => {
        try {
            await tasksApi.delete(id)
            if (activeTab === "today") fetchToday()
            else setTasks(prev => prev.filter(t => t.id !== id))
            showToast("Задача удалена")
            setDeleteConfirm(null)
        } catch { showToast("Ошибка удаления") }
    }

    const handleSave = async () => {
        if (!form.title.trim()) { showToast("Введите название задачи"); return }
        setSaving(true)
        try {
            if (editingTask) {
                const updated = await tasksApi.update(editingTask.id, { title: form.title, due_date: form.due_date || undefined })
                setTasks(prev => prev.map(t => t.id === editingTask.id ? updated : t))
                showToast("Задача обновлена")
            } else {
                if (!form.lead) { showToast("Укажите ID лида"); setSaving(false); return }
                await tasksApi.createForLead(form.lead, { title: form.title, due_date: form.due_date || undefined })
                showToast("Задача создана!")
                if (activeTab === "today") fetchToday()
                else fetchAll()
            }
            setModalOpen(false)
        } catch { showToast("Ошибка сохранения") }
        finally { setSaving(false) }
    }

    const openCreate = () => { setForm({ title: "", due_date: "" }); setEditingTask(null); setModalOpen(true) }
    const openEdit = (task: Task) => {
        setForm({ title: task.title, due_date: task.due_date ? task.due_date.slice(0, 16) : "", lead: task.lead ?? undefined })
        setEditingTask(task)
        setModalOpen(true)
    }

    const filtered = tasks.filter(t => !searchInput || t.title.toLowerCase().includes(searchInput.toLowerCase()))

    // Today stats
    const overdueCount = todayData?.overdue?.count ?? 0
    const todayCount = todayData?.due_today?.count ?? 0
    const upcomingCount = todayData?.upcoming?.count ?? 0

    return (
        <AppLayout
            title="Задачи"
            breadcrumbs={[{ label: "Дашборд", path: "/dashboard" }, { label: "Задачи" }]}
            actions={
                <button className="btn btn--primary btn--sm" onClick={openCreate}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
                    Новая задача
                </button>
            }
        >
            {/* Tabs */}
            <div className="tabs" style={{ marginBottom: 20 }}>
                <button className={`tab-btn ${activeTab === "today" ? "tab-btn--active" : ""}`} onClick={() => setActiveTab("today")}>
                    📅 На сегодня
                    {overdueCount > 0 && <span style={{ marginLeft: 6, background: "#ef4444", color: "white", borderRadius: 10, fontSize: 10, padding: "1px 6px" }}>{overdueCount}</span>}
                </button>
                <button className={`tab-btn ${activeTab === "all" ? "tab-btn--active" : ""}`} onClick={() => setActiveTab("all")}>
                    Все задачи
                </button>
            </div>

            {/* ── Today Tab ── */}
            {activeTab === "today" && (
                <>
                    {/* Stats */}
                    <div className="grid-4" style={{ marginBottom: 20 }}>
                        {[
                            { label: "Просрочено", value: String(overdueCount), color: "#ef4444" },
                            { label: "На сегодня", value: String(todayCount), color: "#f59e0b" },
                            { label: "Предстоящих", value: String(upcomingCount), color: "var(--accent)" },
                            { label: "Следующая", value: todayData?.upcoming?.next_due_at ? formatDateTime(todayData.upcoming.next_due_at) : "—", color: "var(--text-secondary)" },
                        ].map(s => (
                            <div className="stat-card" key={s.label} style={{ backgroundColor: "var(--bg-tertiary)" }}>
                                <div className="stat-card__label">{s.label}</div>
                                <div className="stat-card__value" style={{ color: s.color, fontSize: s.label === "Следующая" ? 16 : undefined }}>{s.value}</div>
                            </div>
                        ))}
                    </div>

                    {todayLoading ? (
                        <div className="empty-state"><div style={{ color: "var(--text-muted)" }}>Загрузка...</div></div>
                    ) : (
                        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

                            {/* Overdue */}
                            {(todayData?.overdue?.items?.length ?? 0) > 0 && (
                                <div>
                                    <div style={{ fontSize: 13, fontWeight: 700, color: "#ef4444", marginBottom: 10, display: "flex", alignItems: "center", gap: 8 }}>
                                        <span>⚠ Просроченные ({overdueCount})</span>
                                    </div>
                                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                                        {todayData?.overdue?.items?.map(item => (
                                            <div key={item.id} className="g-card" style={{ padding: "14px 16px", display: "flex", alignItems: "center", gap: 14, borderLeft: "3px solid #ef4444" }}>
                                                <button onClick={() => handleToggle(item.id, item.is_done)}
                                                    style={{ width: 22, height: 22, borderRadius: "50%", flexShrink: 0, border: "2px solid var(--border-color)", background: "transparent", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }} />
                                                <div style={{ flex: 1, minWidth: 0 }}>
                                                    <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)" }}>{item.title}</div>
                                                    <div style={{ display: "flex", gap: 10, marginTop: 3 }}>
                                                        <span style={{ fontSize: 11, color: "#ef4444", fontWeight: 600 }}>
                                                            {item.overdue_hours ? `${item.overdue_hours.toFixed(1)}ч просрочено` : "Просрочено"}
                                                        </span>
                                                        <span style={{ fontSize: 11, color: "var(--accent)", cursor: "pointer" }} onClick={() => navigate(`/leads/${item.lead_id}`)}>
                                                            {item.lead_name} →
                                                        </span>
                                                    </div>
                                                </div>
                                                <button onClick={() => handleDelete(item.id)}
                                                    style={{ padding: "4px 8px", background: "var(--badge-err-bg)", color: "var(--badge-err-text)", border: "none", borderRadius: 7, cursor: "pointer" }}>
                                                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" /></svg>
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Due today */}
                            {(todayData?.due_today?.items?.length ?? 0) > 0 && (
                                <div>
                                    <div style={{ fontSize: 13, fontWeight: 700, color: "#f59e0b", marginBottom: 10 }}>
                                        📅 На сегодня ({todayCount})
                                    </div>
                                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                                        {todayData?.due_today?.items?.map(item => (
                                            <div key={item.id} className="g-card" style={{ padding: "14px 16px", display: "flex", alignItems: "center", gap: 14, borderLeft: `3px solid ${item.is_done ? "#10b981" : "#f59e0b"}`, opacity: item.is_done ? 0.7 : 1 }}>
                                                <button onClick={() => handleToggle(item.id, item.is_done)}
                                                    style={{ width: 22, height: 22, borderRadius: "50%", flexShrink: 0, border: `2px solid ${item.is_done ? "#10b981" : "var(--border-color)"}`, background: item.is_done ? "#10b981" : "transparent", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                                                    {item.is_done && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12" /></svg>}
                                                </button>
                                                <div style={{ flex: 1, minWidth: 0 }}>
                                                    <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)", textDecoration: item.is_done ? "line-through" : "none" }}>{item.title}</div>
                                                    <div style={{ display: "flex", gap: 10, marginTop: 3 }}>
                                                        {item.due_date && <span style={{ fontSize: 11, color: "var(--text-muted)" }}>{formatDateTime(item.due_date)}</span>}
                                                        <span style={{ fontSize: 11, color: "var(--accent)", cursor: "pointer" }} onClick={() => navigate(`/leads/${item.lead_id}`)}>
                                                            {item.lead_name} →
                                                        </span>
                                                    </div>
                                                </div>
                                                <span style={{ background: item.is_done ? "var(--score-high-bg)" : "var(--badge-warn-bg)", color: item.is_done ? "var(--score-high-text)" : "var(--badge-warn-text)", fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 20, flexShrink: 0 }}>
                                                    {item.is_done ? "Выполнено" : "Сегодня"}
                                                </span>
                                                <button onClick={() => handleDelete(item.id)}
                                                    style={{ padding: "4px 8px", background: "var(--badge-err-bg)", color: "var(--badge-err-text)", border: "none", borderRadius: 7, cursor: "pointer" }}>
                                                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" /></svg>
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Upcoming */}
                            {upcomingCount > 0 && (
                                <div className="g-card" style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 16px" }}>
                                    <div style={{ width: 40, height: 40, borderRadius: 10, background: "var(--accent-light)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
                                    </div>
                                    <div>
                                        <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)" }}>Предстоящих задач: {upcomingCount}</div>
                                        {todayData?.upcoming?.next_due_at && (
                                            <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>
                                                Следующая: {formatDateTime(todayData.upcoming.next_due_at)}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {overdueCount === 0 && todayCount === 0 && upcomingCount === 0 && (
                                <div className="empty-state">
                                    <div className="empty-state__icon">✅</div>
                                    <div className="empty-state__title">Все задачи выполнены!</div>
                                    <div className="empty-state__text">На сегодня задач нет</div>
                                </div>
                            )}
                        </div>
                    )}
                </>
            )}

            {/* ── All Tasks Tab ── */}
            {activeTab === "all" && (
                <>
                    <div className="grid-4" style={{ marginBottom: 20 }}>
                        {[
                            { label: "Всего", value: String(tasks.length), color: "var(--text-primary)" },
                            { label: "Выполнено", value: String(tasks.filter(t => t.is_done).length), color: "#10b981" },
                            { label: "Активных", value: String(tasks.filter(t => !t.is_done).length), color: "var(--accent)" },
                            { label: "Просрочено", value: String(tasks.filter(t => !t.is_done && isOverdue(t.due_date)).length), color: "#ef4444" },
                        ].map(s => (
                            <div className="stat-card" key={s.label}>
                                <div className="stat-card__label">{s.label}</div>
                                <div className="stat-card__value" style={{ color: s.color }}>{s.value}</div>
                            </div>
                        ))}
                    </div>

                    <div className="g-card" style={{ marginBottom: 16 }}>
                        <div className="filters-row">
                            <select className="form-select" style={{ width: 160 }} value={filterDone}
                                onChange={e => setFilterDone(e.target.value as "" | "true" | "false")}>
                                <option value="">Все задачи</option>
                                <option value="false">Активные</option>
                                <option value="true">Выполненные</option>
                            </select>
                            <input className="form-input" style={{ flex: 1 }} placeholder="Поиск по названию..."
                                value={searchInput} onChange={e => setSearchInput(e.target.value)} />
                            <button className="btn btn--outline btn--sm" onClick={fetchAll}>Обновить</button>
                        </div>
                    </div>

                    {loading ? (
                        <div className="empty-state"><div style={{ color: "var(--text-muted)" }}>Загрузка...</div></div>
                    ) : filtered.length === 0 ? (
                        <div className="empty-state">
                            <div className="empty-state__icon">✅</div>
                            <div className="empty-state__title">Задачи не найдены</div>
                            <button className="btn btn--primary btn--sm" style={{ marginTop: 16 }} onClick={openCreate}>+ Создать задачу</button>
                        </div>
                    ) : (
                        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                            {filtered.map(task => (
                                <TaskRow key={task.id} task={task}
                                    onToggle={handleToggle}
                                    onDelete={(id) => setDeleteConfirm(id)}
                                    leadLink={task.lead ?? null} />
                            ))}
                        </div>
                    )}
                </>
            )}

            {/* Create/Edit Modal */}
            {modalOpen && (
                <div className="modal-overlay" onClick={() => setModalOpen(false)}>
                    <div className="modal" style={{ maxWidth: 420 }} onClick={e => e.stopPropagation()}>
                        <div className="modal__header">
                            <div className="modal__title">{editingTask ? "Редактировать задачу" : "Новая задача"}</div>
                            <button className="modal__close" onClick={() => setModalOpen(false)}>✕</button>
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                            <div className="form-group">
                                <label className="form-label">Название *</label>
                                <input className="form-input" placeholder="Позвонить клиенту..." value={form.title}
                                    onChange={e => setForm(f => ({ ...f, title: e.target.value }))} autoFocus />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Срок выполнения</label>
                                <input className="form-input" type="datetime-local" value={form.due_date}
                                    onChange={e => setForm(f => ({ ...f, due_date: e.target.value }))} />
                            </div>
                            {!editingTask && (
                                <div className="form-group">
                                    <label className="form-label">ID лида *</label>
                                    <input className="form-input" type="number" placeholder="Обязательно"
                                        value={form.lead ?? ""}
                                        onChange={e => setForm(f => ({ ...f, lead: e.target.value ? parseInt(e.target.value) : undefined }))} />
                                </div>
                            )}
                        </div>
                        <div className="modal__footer">
                            <button className="btn btn--outline" onClick={() => setModalOpen(false)}>Отмена</button>
                            <button className="btn btn--primary" onClick={handleSave} disabled={saving}>
                                {saving ? "Сохранение..." : editingTask ? "Сохранить" : "Создать"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete confirm */}
            {deleteConfirm && (
                <div className="modal-overlay" onClick={() => setDeleteConfirm(null)}>
                    <div className="modal" style={{ maxWidth: 400 }} onClick={e => e.stopPropagation()}>
                        <div className="modal__header">
                            <div className="modal__title">Удалить задачу?</div>
                            <button className="modal__close" onClick={() => setDeleteConfirm(null)}>✕</button>
                        </div>
                        <p style={{ fontSize: 14, color: "var(--text-secondary)", margin: "0 0 4px" }}>Это действие необратимо.</p>
                        <div className="modal__footer">
                            <button className="btn btn--outline" onClick={() => setDeleteConfirm(null)}>Отмена</button>
                            <button className="btn btn--danger" onClick={() => handleDelete(deleteConfirm)}>Удалить</button>
                        </div>
                    </div>
                </div>
            )}

            {toast && <div className="toast toast--success">✓ {toast}</div>}
        </AppLayout>
    )
}