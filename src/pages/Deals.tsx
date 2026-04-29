import { useState, useEffect, useCallback } from "react"
import AppLayout from "../components/AppLayout"
import { dealsApi } from "../api/deals"
import { agentsApi } from "../api/agents"
import type { Deal, DealStatus, CreateDealPayload } from "../api/deals"
import type { AgentKPIBrief } from "../api/agents"

const STATUS_LABELS: Record<DealStatus, string> = {
    new: "Новая", in_progress: "В работе", closed: "Закрыта", failed: "Провалена",
}

const STATUS_COLORS: Record<DealStatus, string> = {
    new: "var(--accent)", in_progress: "#f59e0b", closed: "#10b981", failed: "#ef4444",
}

const STATUS_BG: Record<DealStatus, string> = {
    new: "var(--badge-new-bg)", in_progress: "var(--badge-warn-bg)",
    closed: "var(--score-high-bg)", failed: "var(--badge-err-bg)",
}

const STATUS_TEXT: Record<DealStatus, string> = {
    new: "var(--badge-new-text)", in_progress: "var(--badge-warn-text)",
    closed: "var(--score-high-text)", failed: "var(--badge-err-text)",
}

function formatMoney(val?: string | null) {
    if (!val) return "—"
    const n = parseFloat(val)
    if (isNaN(n)) return "—"
    if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`
    if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`
    return `$${n.toFixed(0)}`
}

function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString("ru-RU", { day: "numeric", month: "short", year: "numeric" })
}

type ModalMode = "create" | "edit" | null

export default function Deals() {
    const [deals, setDeals] = useState<Deal[]>([])
    const [agents, setAgents] = useState<AgentKPIBrief[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState("")
    const [toast, setToast] = useState("")

    const [filterStatus, setFilterStatus] = useState("")
    const [filterPeriod, setFilterPeriod] = useState("all")

    const [modalMode, setModalMode] = useState<ModalMode>(null)
    const [editingDeal, setEditingDeal] = useState<Deal | null>(null)
    const [deleteConfirm, setDeleteConfirm] = useState<Deal | null>(null)
    const [saving, setSaving] = useState(false)

    const [form, setForm] = useState<{
        agent_id: string
        status: DealStatus
        title: string
        price: string
        commission: string
        lead?: number | null | undefined
    }>({
        agent_id: "", status: "new", title: "", price: "", commission: "",
    })

    const showToast = (msg: string, type: "success" | "error" = "success") => {
        setToast(msg)
        setTimeout(() => setToast(""), 3000)
    }

    const fetchDeals = useCallback(async () => {
        setLoading(true)
        setError("")
        try {
            const data = await dealsApi.list({
                status: filterStatus || undefined,
                period: filterPeriod as "all" | "week" | "month" | "quarter",
            })
            setDeals(data)
        } catch {
            setError("Ошибка загрузки сделок")
        } finally {
            setLoading(false)
        }
    }, [filterStatus, filterPeriod])

    useEffect(() => {
        fetchDeals()
        agentsApi.list().then(setAgents).catch(() => { })
    }, [fetchDeals])

    const openCreate = () => {
        setForm({ agent_id: "", status: "new", title: "", price: "", commission: "", lead: undefined })
        setEditingDeal(null)
        setModalMode("create")
    }

    const openEdit = (deal: Deal) => {
        setForm({
            agent_id: String(deal.agent?.id ?? ""),
            status: deal.status ?? "new",
            title: deal.title ?? "",
            price: deal.price ?? "",
            commission: deal.commission ?? "",
            lead: deal.lead ?? undefined,
        })
        setEditingDeal(deal)
        setModalMode("edit")
    }

    const handleSave = async () => {
        if (!form.agent_id) { showToast("Выберите агента", "error"); return }
        setSaving(true)
        try {
            if (modalMode === "create") {
                const created = await dealsApi.create({
                    agent_id: parseInt(form.agent_id),
                    status: form.status,
                    title: form.title || undefined,
                    price: form.price || undefined,
                    commission: form.commission || undefined,
                    lead: form.lead,
                })
                setDeals(prev => [created, ...prev])
                showToast("Сделка создана!")
            } else if (modalMode === "edit" && editingDeal) {
                const updated = await dealsApi.update(editingDeal.id, {
                    status: form.status,
                    title: form.title || undefined,
                    price: form.price || undefined,
                    commission: form.commission || undefined,
                })
                setDeals(prev => prev.map(d => d.id === editingDeal.id ? updated : d))
                showToast("Сделка обновлена!")
            }
            setModalMode(null)
        } catch {
            showToast("Ошибка сохранения", "error")
        } finally {
            setSaving(false)
        }
    }

    const handleDelete = async () => {
        if (!deleteConfirm) return
        try {
            await dealsApi.delete(deleteConfirm.id)
            setDeals(prev => prev.filter(d => d.id !== deleteConfirm.id))
            showToast("Сделка удалена")
            setDeleteConfirm(null)
        } catch {
            showToast("Ошибка удаления", "error")
        }
    }

    // Quick status change
    const handleStatusChange = async (deal: Deal, status: DealStatus) => {
        try {
            const updated = await dealsApi.update(deal.id, { status })
            setDeals(prev => prev.map(d => d.id === deal.id ? updated : d))
            showToast("Статус обновлён")
        } catch {
            showToast("Ошибка обновления", "error")
        }
    }

    // Stats
    const totalRevenue = deals.filter(d => d.status === "closed").reduce((s, d) => s + parseFloat(d.price ?? "0"), 0)
    const totalCommission = deals.filter(d => d.status === "closed").reduce((s, d) => s + parseFloat(d.commission ?? "0"), 0)

    return (
        <AppLayout
            title="Сделки"
            breadcrumbs={[{ label: "Дашборд", path: "/dashboard" }, { label: "Сделки" }]}
            actions={
                <button className="btn btn--primary btn--sm" onClick={openCreate}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
                    Новая сделка
                </button>
            }
        >
            {/* Stats row */}
            <div className="grid-4" style={{ marginBottom: 20 }}>
                {[
                    { label: "Всего сделок", value: String(deals.length), color: "var(--accent)" },
                    { label: "В работе", value: String(deals.filter(d => d.status === "in_progress").length), color: "#f59e0b" },
                    { label: "Закрытых", value: String(deals.filter(d => d.status === "closed").length), color: "#10b981" },
                    { label: "Выручка", value: totalRevenue >= 1_000_000 ? `$${(totalRevenue / 1_000_000).toFixed(1)}M` : `$${(totalRevenue / 1_000).toFixed(0)}K`, color: "var(--accent)" },
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
                    <select className="form-select" style={{ width: 150 }} value={filterStatus}
                        onChange={e => setFilterStatus(e.target.value)}>
                        <option value="">Все статусы</option>
                        <option value="new">Новые</option>
                        <option value="in_progress">В работе</option>
                        <option value="closed">Закрытые</option>
                        <option value="failed">Провалены</option>
                    </select>
                    <select className="form-select" style={{ width: 150 }} value={filterPeriod}
                        onChange={e => setFilterPeriod(e.target.value)}>
                        <option value="all">Всё время</option>
                        <option value="week">Неделя</option>
                        <option value="month">Месяц</option>
                        <option value="quarter">Квартал</option>
                    </select>
                    <button className="btn btn--outline btn--sm" onClick={fetchDeals}>
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="23 4 23 10 17 10" /><path d="M20.49 15a9 9 0 11-2.12-9.36L23 10" strokeLinecap="round" /></svg>
                        Обновить
                    </button>
                    <span style={{ marginLeft: "auto", fontSize: 13, color: "var(--text-muted)" }}>
                        {deals.length} сделок · комиссия {totalCommission >= 1000 ? `$${(totalCommission / 1000).toFixed(0)}K` : `$${totalCommission.toFixed(0)}`}
                    </span>
                </div>
            </div>

            {/* Table */}
            <div className="g-card" style={{ padding: 0, overflow: "hidden" }}>
                {error && (
                    <div style={{ padding: "12px 16px", color: "#ef4444", fontSize: 13, borderBottom: "1px solid var(--border-color)" }}>
                        ⚠ {error}
                    </div>
                )}
                <div style={{ overflowX: "auto" }}>
                    <table className="g-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Название</th>
                                <th>Агент</th>
                                <th>Статус</th>
                                <th>Стоимость</th>
                                <th>Комиссия</th>
                                <th>Создана</th>
                                <th>Закрыта</th>
                                <th style={{ width: 100 }}>Действия</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan={9}>
                                    <div className="empty-state" style={{ padding: "40px 0" }}>
                                        <div style={{ fontSize: 13, color: "var(--text-muted)" }}>Загрузка...</div>
                                    </div>
                                </td></tr>
                            ) : deals.length === 0 ? (
                                <tr><td colSpan={9}>
                                    <div className="empty-state">
                                        <div className="empty-state__icon">📋</div>
                                        <div className="empty-state__title">Нет сделок</div>
                                        <div className="empty-state__text">Создайте первую сделку</div>
                                    </div>
                                </td></tr>
                            ) : deals.map(deal => (
                                <tr key={deal.id}>
                                    <td>
                                        <span style={{ fontWeight: 700, color: "var(--accent)", fontSize: 13 }}>#{deal.id}</span>
                                    </td>
                                    <td>
                                        <div style={{ fontWeight: 600, color: "var(--text-primary)", fontSize: 13 }}>
                                            {deal.title || `Сделка #${deal.id}`}
                                        </div>
                                        {deal.lead && (
                                            <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>Лид #{deal.lead}</div>
                                        )}
                                    </td>
                                    <td>
                                        <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                                            <div style={{ width: 26, height: 26, borderRadius: "50%", background: "var(--accent-light)", color: "var(--accent)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, flexShrink: 0 }}>
                                                {deal.agent?.full_name?.charAt(0) ?? "?"}
                                            </div>
                                            <span style={{ fontSize: 13, color: "var(--text-secondary)" }}>{deal.agent?.full_name ?? "—"}</span>
                                        </div>
                                    </td>
                                    <td onClick={e => e.stopPropagation()}>
                                        <select
                                            style={{
                                                padding: "3px 24px 3px 8px", fontSize: 11, borderRadius: 6,
                                                border: `1px solid ${STATUS_COLORS[deal.status as DealStatus] ?? "var(--border-color)"}`,
                                                background: STATUS_BG[deal.status as DealStatus] ?? "var(--bg-hover)",
                                                color: STATUS_TEXT[deal.status as DealStatus] ?? "var(--text-secondary)",
                                                fontWeight: 600, cursor: "pointer", outline: "none",
                                                appearance: "none",
                                                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E")`,
                                                backgroundRepeat: "no-repeat", backgroundPosition: "right 6px center",
                                            }}
                                            value={deal.status}
                                            onChange={e => handleStatusChange(deal, e.target.value as DealStatus)}
                                        >
                                            <option value="new">Новая</option>
                                            <option value="in_progress">В работе</option>
                                            <option value="closed">Закрыта</option>
                                            <option value="failed">Провалена</option>
                                        </select>
                                    </td>
                                    <td>
                                        <span style={{ fontWeight: 700, color: "var(--accent)", fontSize: 13 }}>
                                            {formatMoney(deal.price)}
                                        </span>
                                    </td>
                                    <td>
                                        <span style={{ fontSize: 13, color: "#10b981", fontWeight: 600 }}>
                                            {formatMoney(deal.commission)}
                                        </span>
                                    </td>
                                    <td style={{ fontSize: 12, color: "var(--text-muted)", whiteSpace: "nowrap" }}>
                                        {formatDate(deal.created_at)}
                                    </td>
                                    <td style={{ fontSize: 12, color: "var(--text-muted)", whiteSpace: "nowrap" }}>
                                        {deal.closed_at ? formatDate(deal.closed_at) : "—"}
                                    </td>
                                    <td>
                                        <div style={{ display: "flex", gap: 6 }}>
                                            <button
                                                className="btn btn--outline btn--sm"
                                                style={{ padding: "4px 8px" }}
                                                onClick={() => openEdit(deal)}
                                                title="Редактировать"
                                            >
                                                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
                                            </button>
                                            <button
                                                className="btn btn--sm"
                                                style={{ padding: "4px 8px", background: "var(--badge-err-bg)", color: "var(--badge-err-text)", border: "1px solid var(--badge-err-bg)" }}
                                                onClick={() => setDeleteConfirm(deal)}
                                                title="Удалить"
                                            >
                                                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6M10 11v6M14 11v6" /></svg>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Create/Edit Modal */}
            {modalMode && (
                <div className="modal-overlay" onClick={() => setModalMode(null)}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <div className="modal__header">
                            <div className="modal__title">
                                {modalMode === "create" ? "Новая сделка" : "Редактировать сделку"}
                            </div>
                            <button className="modal__close" onClick={() => setModalMode(null)}>✕</button>
                        </div>

                        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                            <div className="form-group">
                                <label className="form-label">Название / объект</label>
                                <input className="form-input" placeholder="ЖК Рассвет, 3-комн. кв." value={form.title}
                                    onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
                            </div>

                            {modalMode === "create" && (
                                <div className="form-group">
                                    <label className="form-label">Агент *</label>
                                    <select className="form-select" value={form.agent_id}
                                        onChange={e => setForm(f => ({ ...f, agent_id: e.target.value }))}>
                                        <option value="">— Выберите агента —</option>
                                        {agents.map(a => (
                                            <option key={a.agent_id} value={String(a.agent_id)}>
                                                {a.full_name} ({a.department})
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            <div className="form-group">
                                <label className="form-label">Статус</label>
                                <select className="form-select" value={form.status}
                                    onChange={e => setForm(f => ({ ...f, status: e.target.value as DealStatus }))}>
                                    <option value="new">Новая</option>
                                    <option value="in_progress">В работе</option>
                                    <option value="closed">Закрыта</option>
                                    <option value="failed">Провалена</option>
                                </select>
                            </div>

                            <div className="grid-2">
                                <div className="form-group">
                                    <label className="form-label">Стоимость ($)</label>
                                    <input className="form-input" type="number" placeholder="1200000" value={form.price}
                                        onChange={e => setForm(f => ({ ...f, price: e.target.value }))} />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Комиссия ($)</label>
                                    <input className="form-input" type="number" placeholder="36000" value={form.commission}
                                        onChange={e => setForm(f => ({ ...f, commission: e.target.value }))} />
                                </div>
                            </div>
                        </div>

                        <div className="modal__footer">
                            <button className="btn btn--outline" onClick={() => setModalMode(null)}>Отмена</button>
                            <button className="btn btn--primary" onClick={handleSave} disabled={saving}>
                                {saving ? "Сохранение..." : modalMode === "create" ? "Создать" : "Сохранить"}
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
                            <div className="modal__title">Удалить сделку?</div>
                            <button className="modal__close" onClick={() => setDeleteConfirm(null)}>✕</button>
                        </div>
                        <p style={{ fontSize: 14, color: "var(--text-secondary)", margin: "0 0 4px" }}>
                            Вы уверены что хотите удалить <strong style={{ color: "var(--text-primary)" }}>«{deleteConfirm.title || `Сделка #${deleteConfirm.id}`}»</strong>?
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