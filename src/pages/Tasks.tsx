import { useState, useEffect, useCallback } from "react"
import AppLayout from "../components/AppLayout"
import { tasksApi } from "../api/tasks"
import type { Task } from "../api/tasks"

function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString("ru-RU", {
        day: "numeric", month: "short", year: "numeric"
    })
}

function formatDateTime(iso: string) {
    return new Date(iso).toLocaleString("ru-RU", {
        day: "numeric", month: "short", hour: "2-digit", minute: "2-digit"
    })
}

function isOverdue(due_date?: string | null) {
    if (!due_date) return false
    return new Date(due_date) < new Date()
}

export default function Tasks() {
    const [tasks, setTasks] = useState<Task[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState("")
    const [toast, setToast] = useState("")

    const [filterDone, setFilterDone] = useState<"" | "true" | "false">("")
    const [search, setSearch] = useState("")
    const [searchInput, setSearchInput] = useState("")

    const [modalOpen, setModalOpen] = useState(false)
    const [editingTask, setEditingTask] = useState<Task | null>(null)
    const [deleteConfirm, setDeleteConfirm] = useState<Task | null>(null)
    const [saving, setSaving] = useState(false)

    const [form, setForm] = useState<{ title: string; due_date: string; lead?: number | undefined }>({
        title: "", due_date: "",
    })

    const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(""), 3000) }

    const fetchTasks = useCallback(async () => {
        setLoading(true)
        setError("")
        try {
            const data = await tasksApi.list({
                is_done: filterDone === "" ? undefined : filterDone === "true",
            })
            setTasks(data)
        } catch {
            setError("Ошибка загрузки задач")
        } finally {
            setLoading(false)
        }
    }, [filterDone, search])

    useEffect(() => { fetchTasks() }, [fetchTasks])

    const openCreate = () => {
        setForm({ title: "", due_date: "" })
        setEditingTask(null)
        setModalOpen(true)
    }

    const openEdit = (task: Task) => {
        setForm({
            title: task.title,
            due_date: task.due_date ? task.due_date.slice(0, 16) : "",
            lead: task.lead ?? undefined,
        })
        setEditingTask(task)
        setModalOpen(true)
    }

    const handleSave = async () => {
        if (!form.title.trim()) { showToast("Введите название задачи"); return }
        setSaving(true)
        try {
            if (!editingTask) {
                if (!form.lead) { showToast("Укажите ID лида"); return }
                await tasksApi.createForLead(form.lead, {
                    title: form.title,
                    due_date: form.due_date || undefined,
                })
                showToast("Задача создана!")
                await fetchTasks()
                setModalOpen(false)
            }
            setModalOpen(false)
        } catch {
            showToast("Ошибка сохранения")
        } finally {
            setSaving(false)
        }
    }

    const handleToggleDone = async (task: Task) => {
        try {
            const updated = await tasksApi.update(task.id, { is_done: !task.is_done })
            setTasks(prev => prev.map(t => t.id === task.id ? updated : t))
            showToast(updated.is_done ? "Задача выполнена ✓" : "Задача возобновлена")
        } catch {
            showToast("Ошибка обновления")
        }
    }

    const handleDelete = async () => {
        if (!deleteConfirm) return
        try {
            await tasksApi.delete(deleteConfirm.id)
            setTasks(prev => prev.filter(t => t.id !== deleteConfirm.id))
            showToast("Задача удалена")
            setDeleteConfirm(null)
        } catch {
            showToast("Ошибка удаления")
        }
    }

    const totalDone = tasks.filter(t => t.is_done).length
    const totalOverdue = tasks.filter(t => !t.is_done && isOverdue(t.due_date)).length
    const totalPending = tasks.filter(t => !t.is_done).length

    const filtered = tasks.filter(t => {
        if (searchInput && !t.title.toLowerCase().includes(searchInput.toLowerCase())) return false
        return true
    })

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
            {/* Stats */}
            <div className="grid-4" style={{ marginBottom: 20 }}>
                {[
                    { label: "Всего задач", value: String(tasks.length), color: "var(--text-primary)" },
                    { label: "Выполнено", value: String(totalDone), color: "#10b981" },
                    { label: "Ожидают", value: String(totalPending), color: "var(--accent)" },
                    { label: "Просрочено", value: String(totalOverdue), color: "#ef4444" },
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
                    <select className="form-select" style={{ width: 160 }} value={filterDone}
                        onChange={e => setFilterDone(e.target.value as "" | "true" | "false")}>
                        <option value="">Все задачи</option>
                        <option value="false">Активные</option>
                        <option value="true">Выполненные</option>
                    </select>
                    <input
                        className="form-input"
                        style={{ flex: 1 }}
                        placeholder="Поиск по названию..."
                        value={searchInput}
                        onChange={e => setSearchInput(e.target.value)}
                        onKeyDown={e => e.key === "Enter" && (setSearch(searchInput), fetchTasks())}
                    />
                    <button className="btn btn--outline btn--sm" onClick={fetchTasks}>
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="23 4 23 10 17 10" /><path d="M20.49 15a9 9 0 11-2.12-9.36L23 10" strokeLinecap="round" /></svg>
                        Обновить
                    </button>
                </div>
            </div>

            {error && (
                <div style={{ padding: "12px 16px", color: "#ef4444", fontSize: 13, marginBottom: 16 }}>⚠ {error}</div>
            )}

            {/* Tasks list */}
            {loading ? (
                <div className="empty-state"><div style={{ color: "var(--text-muted)" }}>Загрузка...</div></div>
            ) : filtered.length === 0 ? (
                <div className="empty-state">
                    <div className="empty-state__icon">✅</div>
                    <div className="empty-state__title">Задачи не найдены</div>
                    <div className="empty-state__text">Создайте первую задачу</div>
                </div>
            ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {filtered.map(task => {
                        const overdue = !task.is_done && isOverdue(task.due_date)
                        return (
                            <div key={task.id} className="g-card" style={{
                                padding: "14px 16px",
                                display: "flex", alignItems: "center", gap: 14,
                                borderLeft: `3px solid ${task.is_done ? "#10b981" : overdue ? "#ef4444" : "var(--accent)"}`,
                                opacity: task.is_done ? 0.7 : 1,
                                transition: "all 0.15s",
                            }}>
                                {/* Checkbox */}
                                <button
                                    onClick={() => handleToggleDone(task)}
                                    style={{
                                        width: 22, height: 22, borderRadius: "50%", flexShrink: 0,
                                        border: `2px solid ${task.is_done ? "#10b981" : "var(--border-color)"}`,
                                        background: task.is_done ? "#10b981" : "transparent",
                                        display: "flex", alignItems: "center", justifyContent: "center",
                                        cursor: "pointer", transition: "all 0.15s",
                                    }}
                                >
                                    {task.is_done && (
                                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round">
                                            <polyline points="20 6 9 17 4 12" />
                                        </svg>
                                    )}
                                </button>

                                {/* Content */}
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{
                                        fontSize: 14, fontWeight: 600,
                                        color: task.is_done ? "var(--text-muted)" : "var(--text-primary)",
                                        textDecoration: task.is_done ? "line-through" : "none",
                                        whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                                    }}>
                                        {task.title}
                                    </div>
                                    <div style={{ display: "flex", gap: 12, marginTop: 4, flexWrap: "wrap" }}>
                                        {task.due_date && (
                                            <span style={{
                                                fontSize: 11,
                                                color: overdue ? "#ef4444" : "var(--text-muted)",
                                                fontWeight: overdue ? 600 : 400,
                                                display: "flex", alignItems: "center", gap: 4,
                                            }}>
                                                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
                                                {overdue ? "Просрочено · " : ""}{formatDate(task.due_date)}
                                            </span>
                                        )}
                                        {task.lead && (
                                            <span style={{ fontSize: 11, color: "var(--accent)" }}>
                                                Лид #{task.lead}
                                            </span>
                                        )}
                                        <span style={{ fontSize: 11, color: "var(--text-muted)" }}>
                                            Создана {formatDateTime(task.created_at)}
                                        </span>
                                    </div>
                                </div>

                                {/* Status badge */}
                                <div style={{ flexShrink: 0 }}>
                                    {task.is_done ? (
                                        <span style={{ background: "var(--score-high-bg)", color: "var(--score-high-text)", fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 20 }}>
                                            Выполнено
                                        </span>
                                    ) : overdue ? (
                                        <span style={{ background: "var(--badge-err-bg)", color: "var(--badge-err-text)", fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 20 }}>
                                            Просрочено
                                        </span>
                                    ) : (
                                        <span style={{ background: "var(--badge-new-bg)", color: "var(--badge-new-text)", fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 20 }}>
                                            Активна
                                        </span>
                                    )}
                                </div>

                                {/* Actions */}
                                <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                                    <button
                                        className="btn btn--outline btn--sm"
                                        style={{ padding: "4px 8px" }}
                                        onClick={() => openEdit(task)}
                                        title="Редактировать"
                                    >
                                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
                                    </button>
                                    <button
                                        className="btn btn--sm"
                                        style={{ padding: "4px 8px", background: "var(--badge-err-bg)", color: "var(--badge-err-text)", border: "1px solid var(--badge-err-bg)" }}
                                        onClick={() => setDeleteConfirm(task)}
                                        title="Удалить"
                                    >
                                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6M10 11v6M14 11v6" /></svg>
                                    </button>
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}

            {/* Create/Edit Modal */}
            {modalOpen && (
                <div className="modal-overlay" onClick={() => setModalOpen(false)}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <div className="modal__header">
                            <div className="modal__title">{editingTask ? "Редактировать задачу" : "Новая задача"}</div>
                            <button className="modal__close" onClick={() => setModalOpen(false)}>✕</button>
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                            <div className="form-group">
                                <label className="form-label">ID лида *</label>
                                <input
                                    className="form-input"
                                    type="number"
                                    placeholder="Обязательно — задача привязывается к лиду"
                                    value={form.lead ?? ""}
                                    onChange={e => setForm(f => ({ ...f, lead: e.target.value ? parseInt(e.target.value) : undefined }))}
                                    autoFocus
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Название *</label>
                                <input
                                    className="form-input"
                                    placeholder="Позвонить клиенту, отправить документы..."
                                    value={form.title}
                                    onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                                    autoFocus
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Срок выполнения</label>
                                <input
                                    className="form-input"
                                    type="datetime-local"
                                    value={form.due_date}
                                    onChange={e => setForm(f => ({ ...f, due_date: e.target.value }))}
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Привязать к лиду (ID)</label>
                                <input
                                    className="form-input"
                                    type="number"
                                    placeholder="Необязательно"
                                    value={form.lead ?? ""}
                                    onChange={e => setForm(f => ({ ...f, lead: e.target.value ? parseInt(e.target.value) : undefined }))}
                                />
                            </div>
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
                        <p style={{ fontSize: 14, color: "var(--text-secondary)", margin: "0 0 4px" }}>
                            Удалить <strong style={{ color: "var(--text-primary)" }}>«{deleteConfirm.title}»</strong>?
                        </p>
                        <p style={{ fontSize: 13, color: "var(--text-muted)" }}>Это действие необратимо.</p>
                        <div className="modal__footer">
                            <button className="btn btn--outline" onClick={() => setDeleteConfirm(null)}>Отмена</button>
                            <button className="btn btn--danger" onClick={handleDelete}>Удалить</button>
                        </div>
                    </div>
                </div>
            )}

            {toast && <div className="toast toast--success">✓ {toast}</div>}
        </AppLayout>
    )
}