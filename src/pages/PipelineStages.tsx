import { useState, useEffect, useCallback } from "react"
import AppLayout from "../components/AppLayout"
import { pipelineApi } from "../api/pipeline"
import type { PipelineStage } from "../api/pipeline"

export default function PipelineStages() {
    const [stages, setStages] = useState<PipelineStage[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState("")
    const [toast, setToast] = useState("")
    const [search, setSearch] = useState("")
    const [modalOpen, setModalOpen] = useState(false)
    const [editingStage, setEditingStage] = useState<PipelineStage | null>(null)
    const [deleteConfirm, setDeleteConfirm] = useState<PipelineStage | null>(null)
    const [saving, setSaving] = useState(false)
    const [form, setForm] = useState({ name: "", order: "0", is_active: true })

    const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(""), 3000) }

    const fetchStages = useCallback(async () => {
        setLoading(true)
        setError("")
        try {
            const data = await pipelineApi.list({
                search: search || undefined,
                ordering: "order",
            })
            setStages(data)
        } catch {
            setError("Ошибка загрузки этапов")
        } finally {
            setLoading(false)
        }
    }, [search])

    useEffect(() => { fetchStages() }, [fetchStages])

    const openCreate = () => {
        const maxOrder = stages.length > 0 ? Math.max(...stages.map(s => s.order ?? 0)) + 1 : 0
        setForm({ name: "", order: String(maxOrder), is_active: true })
        setEditingStage(null)
        setModalOpen(true)
    }

    const openEdit = (stage: PipelineStage) => {
        setForm({ name: stage.name, order: String(stage.order ?? 0), is_active: stage.is_active ?? true })
        setEditingStage(stage)
        setModalOpen(true)
    }

    const handleSave = async () => {
        if (!form.name.trim()) { showToast("Введите название этапа"); return }
        setSaving(true)
        try {
            const payload = {
                name: form.name.trim(),
                order: parseInt(form.order) || 0,
                is_active: form.is_active,
            }
            if (editingStage) {
                const updated = await pipelineApi.update(editingStage.id, payload)
                if (!updated.is_active) {
                    setStages(prev => prev.filter(s => s.id !== editingStage.id))
                } else {
                    setStages(prev => prev.map(s => s.id === editingStage.id ? updated : s))
                }
                showToast("Этап обновлён")
            } else {
                const created = await pipelineApi.create(payload)
                setStages(prev => [...prev, created].sort((a, b) => (a.order ?? 0) - (b.order ?? 0)))
                showToast("Этап создан!")
            }
            setModalOpen(false)
        } catch (err: unknown) {
            const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error
            showToast(msg ?? "Ошибка сохранения")
        } finally {
            setSaving(false)
        }
    }

    const handleDelete = async () => {
        if (!deleteConfirm) return
        try {
            await pipelineApi.delete(deleteConfirm.id)
            setStages(prev => prev.filter(s => s.id !== deleteConfirm.id))
            showToast("Этап удалён")
            setDeleteConfirm(null)
        } catch {
            showToast("Ошибка удаления")
        }
    }

    const handleToggleActive = async (stage: PipelineStage) => {
        try {
            const updated = await pipelineApi.update(stage.id, { is_active: !stage.is_active })
            setStages(prev => stage.is_active
                ? prev.filter(s => s.id !== stage.id) 
                : prev.map(s => s.id === stage.id ? updated : s) 
            )
            showToast(`Этап ${updated.is_active ? "активирован" : "деактивирован"}`)
        } catch {
            showToast("Ошибка обновления")
        }
    }

    const activeCount = stages.filter(s => s.is_active).length
    const inactiveCount = stages.filter(s => !s.is_active).length

    return (
        <AppLayout
            title="Этапы воронки"
            breadcrumbs={[{ label: "Дашборд", path: "/dashboard" }, { label: "Этапы воронки" }]}
            actions={
                <button className="btn btn--primary btn--sm" onClick={openCreate}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                    </svg>
                    Новый этап
                </button>
            }
        >
            {/* Stats */}
            <div className="grid-4" style={{ marginBottom: 20 }}>
                {[
                    { label: "Всего этапов", value: String(stages.length), color: "var(--text-primary)" },
                    { label: "Активных", value: String(activeCount), color: "var(--accent)" },
                    { label: "Неактивных", value: String(inactiveCount), color: "var(--text-muted)" },
                    { label: "Макс. порядок", value: stages.length > 0 ? String(Math.max(...stages.map(s => s.order ?? 0))) : "—", color: "var(--text-secondary)" },
                ].map(s => (
                    <div className="stat-card" key={s.label}>
                        <div className="stat-card__label">{s.label}</div>
                        <div className="stat-card__value" style={{ color: s.color }}>{s.value}</div>
                    </div>
                ))}
            </div>

            {/* Search */}
            <div className="g-card" style={{ marginBottom: 16 }}>
                <div className="filters-row">
                    <input className="form-input" style={{ flex: 1 }} placeholder="Поиск по названию..."
                        value={search} onChange={e => setSearch(e.target.value)} />
                    <button className="btn btn--outline btn--sm" onClick={fetchStages}>
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="23 4 23 10 17 10" />
                            <path d="M20.49 15a9 9 0 11-2.12-9.36L23 10" strokeLinecap="round" />
                        </svg>
                        Обновить
                    </button>
                </div>
            </div>

            {error && <div style={{ padding: "12px 16px", color: "#ef4444", fontSize: 13, marginBottom: 16 }}>⚠ {error}</div>}

            {/* Stages list */}
            {loading ? (
                <div className="empty-state"><div style={{ color: "var(--text-muted)" }}>Загрузка...</div></div>
            ) : stages.length === 0 ? (
                <div className="empty-state">
                    <div className="empty-state__icon">📋</div>
                    <div className="empty-state__title">Этапы не найдены</div>
                    <div className="empty-state__text">Создайте первый этап воронки</div>
                    <button className="btn btn--primary btn--sm" style={{ marginTop: 16 }} onClick={openCreate}>
                        + Создать этап
                    </button>
                </div>
            ) : (
                <div className="g-card" style={{ padding: 0, overflow: "hidden" }}>
                    <div style={{ overflowX: "auto" }}>
                        <table className="g-table">
                            <thead>
                                <tr>
                                    <th style={{ width: 60 }}>Порядок</th>
                                    <th>Название этапа</th>
                                    <th style={{ width: 120 }}>Статус</th>
                                    <th style={{ width: 160 }}>Действия</th>
                                </tr>
                            </thead>
                            <tbody>
                                {stages.map((stage, index) => (
                                    <tr key={stage.id}>
                                        <td>
                                            <div style={{
                                                width: 32, height: 32, borderRadius: "50%",
                                                background: stage.is_active ? "var(--accent-light)" : "var(--bg-hover)",
                                                color: stage.is_active ? "var(--accent)" : "var(--text-muted)",
                                                display: "flex", alignItems: "center", justifyContent: "center",
                                                fontSize: 12, fontWeight: 700,
                                            }}>
                                                {stage.order ?? index + 1}
                                            </div>
                                        </td>
                                        <td>
                                            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                                <div style={{
                                                    width: 10, height: 10, borderRadius: "50%", flexShrink: 0,
                                                    background: stage.is_active ? "var(--accent)" : "var(--text-muted)",
                                                }} />
                                                <div>
                                                    <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)" }}>
                                                        {stage.name}
                                                    </div>
                                                    <div style={{ fontSize: 11, color: "var(--text-muted)" }}>ID: {stage.id}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <button
                                                onClick={() => handleToggleActive(stage)}
                                                style={{
                                                    background: stage.is_active ? "var(--score-high-bg)" : "var(--bg-hover)",
                                                    color: stage.is_active ? "var(--score-high-text)" : "var(--text-muted)",
                                                    border: "none", borderRadius: 20, padding: "4px 12px",
                                                    fontSize: 11, fontWeight: 600, cursor: "pointer",
                                                    transition: "all 0.15s",
                                                }}
                                            >
                                                {stage.is_active ? "Активна" : "Неактивна"}
                                            </button>
                                        </td>
                                        <td>
                                            <div style={{ display: "flex", gap: 6 }}>
                                                <button className="btn btn--outline btn--sm" style={{ padding: "4px 8px" }}
                                                    onClick={() => openEdit(stage)} title="Редактировать">
                                                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                        <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                                                        <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                                                    </svg>
                                                </button>
                                                <button className="btn btn--sm" style={{ padding: "4px 8px", background: "var(--badge-err-bg)", color: "var(--badge-err-text)", border: "1px solid var(--badge-err-bg)" }}
                                                    onClick={() => setDeleteConfirm(stage)} title="Удалить">
                                                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                        <polyline points="3 6 5 6 21 6" />
                                                        <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6M10 11v6M14 11v6" />
                                                    </svg>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Create/Edit Modal */}
            {modalOpen && (
                <div className="modal-overlay" onClick={() => setModalOpen(false)}>
                    <div className="modal" style={{ maxWidth: 420 }} onClick={e => e.stopPropagation()}>
                        <div className="modal__header">
                            <div className="modal__title">{editingStage ? "Редактировать этап" : "Новый этап"}</div>
                            <button className="modal__close" onClick={() => setModalOpen(false)}>✕</button>
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                            <div className="form-group">
                                <label className="form-label">Название *</label>
                                <input className="form-input" placeholder="Например: Переговоры" value={form.name}
                                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))} autoFocus />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Порядок (0–32767)</label>
                                <input className="form-input" type="number" min="0" max="32767" value={form.order}
                                    onChange={e => setForm(f => ({ ...f, order: e.target.value }))} />
                            </div>
                            <label style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13, cursor: "pointer" }}>
                                <input type="checkbox" checked={form.is_active}
                                    onChange={e => setForm(f => ({ ...f, is_active: e.target.checked }))} />
                                <span style={{ color: "var(--text-secondary)" }}>Активна</span>
                            </label>
                        </div>
                        <div className="modal__footer">
                            <button className="btn btn--outline" onClick={() => setModalOpen(false)}>Отмена</button>
                            <button className="btn btn--primary" onClick={handleSave} disabled={saving}>
                                {saving ? "Сохранение..." : editingStage ? "Сохранить" : "Создать"}
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
                            <div className="modal__title">Удалить этап?</div>
                            <button className="modal__close" onClick={() => setDeleteConfirm(null)}>✕</button>
                        </div>
                        <p style={{ fontSize: 14, color: "var(--text-secondary)", margin: "0 0 4px" }}>
                            Удалить <strong style={{ color: "var(--text-primary)" }}>«{deleteConfirm.name}»</strong>?
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