import { useState, useEffect, useCallback } from "react"
import { useNavigate } from "react-router-dom"
import AppLayout from "../components/AppLayout"
import { leadsApi } from "../api/leads"
import type { Lead, LeadStatus, LeadSource } from "../types/api"

const STATUS_LABELS: Record<LeadStatus, string> = {
    new: "Новый", in_progress: "В работе", won: "Сделка", lost: "Отказ",
}

const SOURCE_LABELS: Record<LeadSource, string> = {
    telegram: "Telegram", whatsapp: "WhatsApp", instagram: "Instagram", manual: "Ручной ввод",
}

function ScoreBadge({ score }: { score?: number | undefined }) {
    if (score === undefined || score === null) return <span style={{ color: "var(--text-muted)" }}>—</span>
    const bg = score >= 70 ? "var(--score-high-bg)" : score >= 40 ? "var(--score-mid-bg)" : "var(--score-low-bg)"
    const color = score >= 70 ? "var(--score-high-text)" : score >= 40 ? "var(--score-mid-text)" : "var(--score-low-text)"
    return <span style={{ background: bg, color, padding: "2px 8px", borderRadius: 6, fontSize: 12, fontWeight: 700 }}>{score}</span>
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
        day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit"
    })
}

export default function Leads() {
    const navigate = useNavigate()

    const [leads, setLeads] = useState<Lead[]>([])
    const [count, setCount] = useState(0)
    const [page, setPage] = useState(1)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState("")

    const [filterStatus, setFilterStatus] = useState<LeadStatus | "">("")
    const [filterSource, setFilterSource] = useState<LeadSource | "">("")
    const [filterActive, setFilterActive] = useState<"" | "true" | "false">("")
    const [search, setSearch] = useState("")
    const [searchInput, setSearchInput] = useState("")
    const [selected, setSelected] = useState<number[]>([])
    const [toast, setToast] = useState("")

    const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(""), 3000) }

    const fetchLeads = useCallback(async () => {
        setLoading(true)
        setError("")
        try {
            const res = await leadsApi.list({
                page,
                status: filterStatus || undefined,
                source: filterSource || undefined,
                is_active: filterActive === "" ? undefined : filterActive === "true",
                search: search || undefined,
            })
            setLeads(res.results)
            setCount(res.count)
        } catch {
            setError("Ошибка загрузки лидов")
        } finally {
            setLoading(false)
        }
    }, [page, filterStatus, filterSource, filterActive, search])

    useEffect(() => { fetchLeads() }, [fetchLeads])

    const handleReset = () => {
        setFilterStatus(""); setFilterSource(""); setFilterActive("")
        setSearch(""); setSearchInput(""); setPage(1)
    }

    const handleSelect = (id: number) =>
        setSelected(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id])

    const handleSelectAll = () =>
        setSelected(selected.length === leads.length ? [] : leads.map(l => l.id))

    // Смена статуса через новый эндпоинт
    const handleChangeStatus = async (id: number, status: LeadStatus, e: React.MouseEvent) => {
        e.stopPropagation()
        try {
            await leadsApi.changeStatus(id, status)
            setLeads(prev => prev.map(l => l.id === id ? { ...l, status } : l))
            showToast("Статус обновлён")
        } catch {
            showToast("Ошибка обновления статуса")
        }
    }

    const totalPages = Math.ceil(count / 20)

    return (
        <AppLayout
            title="Лиды"
            breadcrumbs={[{ label: "Дашборд", path: "/dashboard" }, { label: "Лиды" }]}
            actions={
                <button className="btn btn--outline btn--sm" onClick={fetchLeads}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="23 4 23 10 17 10" /><path d="M20.49 15a9 9 0 11-2.12-9.36L23 10" strokeLinecap="round" /></svg>
                    Обновить
                </button>
            }
        >
            {/* Filters */}
            <div className="g-card" style={{ marginBottom: 16 }}>
                <div className="filters-row">
                    <select className="form-select" style={{ width: 150 }} value={filterStatus}
                        onChange={e => { setFilterStatus(e.target.value as LeadStatus | ""); setPage(1) }}>
                        <option value="">Все статусы</option>
                        <option value="new">Новый</option>
                        <option value="in_progress">В работе</option>
                        <option value="won">Сделка</option>
                        <option value="lost">Отказ</option>
                    </select>

                    <select className="form-select" style={{ width: 140 }} value={filterSource}
                        onChange={e => { setFilterSource(e.target.value as LeadSource | ""); setPage(1) }}>
                        <option value="">Все источники</option>
                        <option value="telegram">Telegram</option>
                        <option value="whatsapp">WhatsApp</option>
                        <option value="instagram">Instagram</option>
                        <option value="manual">Ручной ввод</option>
                    </select>

                    <select className="form-select" style={{ width: 140 }} value={filterActive}
                        onChange={e => { setFilterActive(e.target.value as "" | "true" | "false"); setPage(1) }}>
                        <option value="">Активность</option>
                        <option value="true">Активный</option>
                        <option value="false">Неактивный</option>
                    </select>

                    <div style={{ flex: 1, display: "flex", gap: 8, minWidth: 0 }}>
                        <input
                            className="form-input"
                            style={{ flex: 1 }}
                            placeholder="Поиск по имени, телефону..."
                            value={searchInput}
                            onChange={e => setSearchInput(e.target.value)}
                            onKeyDown={e => e.key === "Enter" && (setSearch(searchInput), setPage(1))}
                        />
                        <button className="btn btn--primary btn--sm" onClick={() => { setSearch(searchInput); setPage(1) }}>
                            Найти
                        </button>
                        <button className="btn btn--outline btn--sm" onClick={handleReset}>
                            Сбросить
                        </button>
                    </div>
                </div>

                {selected.length > 0 && (
                    <div style={{ display: "flex", alignItems: "center", gap: 12, paddingTop: 12, borderTop: "1px solid var(--border-light)", marginTop: 8 }}>
                        <span style={{ fontSize: 13, color: "var(--text-secondary)", fontWeight: 500 }}>
                            Выбрано: {selected.length}
                        </span>
                        <button className="btn btn--outline btn--sm" onClick={() => setSelected([])}>
                            Снять выделение
                        </button>
                    </div>
                )}
            </div>

            {/* Table */}
            <div className="g-card" style={{ padding: 0, overflow: "hidden" }}>
                {error && (
                    <div style={{ padding: "12px 16px", color: "#ef4444", fontSize: 13, borderBottom: "1px solid var(--border-color)", background: "var(--badge-err-bg)" }}>
                        ⚠ {error}
                    </div>
                )}

                <div style={{ overflowX: "auto" }}>
                    <table className="g-table">
                        <thead>
                            <tr>
                                <th style={{ width: 40 }}>
                                    <input type="checkbox"
                                        checked={selected.length === leads.length && leads.length > 0}
                                        onChange={handleSelectAll} />
                                </th>
                                <th>ID</th>
                                <th>Имя</th>
                                <th>Username</th>
                                <th>Источник</th>
                                <th>Статус</th>
                                <th>Score</th>
                                <th>Телефон</th>
                                <th>Теги</th>
                                <th>Создан</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={10}>
                                        <div className="empty-state" style={{ padding: "40px 0" }}>
                                            <div style={{ fontSize: 13, color: "var(--text-muted)" }}>Загрузка...</div>
                                        </div>
                                    </td>
                                </tr>
                            ) : leads.length === 0 ? (
                                <tr>
                                    <td colSpan={10}>
                                        <div className="empty-state">
                                            <div className="empty-state__icon">🔍</div>
                                            <div className="empty-state__title">Лиды не найдены</div>
                                            <div className="empty-state__text">Попробуйте изменить фильтры</div>
                                        </div>
                                    </td>
                                </tr>
                            ) : leads.map(lead => (
                                <tr key={lead.id} className="clickable" onClick={() => navigate(`/leads/${lead.id}`)}>
                                    <td onClick={e => e.stopPropagation()}>
                                        <input type="checkbox"
                                            checked={selected.includes(lead.id)}
                                            onChange={() => handleSelect(lead.id)} />
                                    </td>
                                    <td>
                                        <span style={{ fontWeight: 700, color: "var(--accent)", fontSize: 13 }}>#{lead.id}</span>
                                    </td>
                                    <td>
                                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                            <div style={{
                                                width: 28, height: 28, borderRadius: "50%", flexShrink: 0,
                                                background: "var(--accent-light)", color: "var(--accent)",
                                                display: "flex", alignItems: "center", justifyContent: "center",
                                                fontSize: 11, fontWeight: 700,
                                            }}>
                                                {lead.full_name?.charAt(0)?.toUpperCase() ?? "?"}
                                            </div>
                                            <span style={{ fontWeight: 600, color: "var(--text-primary)", fontSize: 13 }}>
                                                {lead.full_name || "—"}
                                            </span>
                                        </div>
                                    </td>
                                    <td style={{ color: "var(--accent)", fontSize: 13 }}>
                                        {lead.username ? `@${lead.username}` : "—"}
                                    </td>
                                    <td>
                                        <span style={{ fontSize: 12, color: "var(--text-secondary)" }}>
                                            {SOURCE_LABELS[lead.source as LeadSource] ?? lead.source}
                                        </span>
                                    </td>
                                    <td onClick={e => e.stopPropagation()}>
                                        {lead.status ? (
                                            <select
                                                className="form-select"
                                                style={{ padding: "3px 24px 3px 8px", fontSize: 11, height: 28, width: "auto", minWidth: 110 }}
                                                value={lead.status}
                                                onChange={e => handleChangeStatus(lead.id, e.target.value as LeadStatus, e as unknown as React.MouseEvent)}
                                                onClick={e => e.stopPropagation()}
                                            >
                                                <option value="new">Новый</option>
                                                <option value="in_progress">В работе</option>
                                                <option value="won">Сделка</option>
                                                <option value="lost">Отказ</option>
                                            </select>
                                        ) : "—"}
                                    </td>
                                    <td><ScoreBadge score={lead.score} /></td>
                                    <td style={{ color: "var(--text-secondary)", fontSize: 13 }}>
                                        {lead.phone ?? "—"}
                                    </td>
                                    <td>
                                        {(lead.tags as string[])?.length > 0 ? (
                                            <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                                                {(lead.tags as string[]).map((t, i) => (
                                                    <span key={i} style={{
                                                        background: "var(--bg-hover)", color: "var(--text-secondary)",
                                                        borderRadius: 4, padding: "2px 6px", fontSize: 11,
                                                    }}>{t}</span>
                                                ))}
                                            </div>
                                        ) : <span style={{ color: "var(--text-muted)" }}>—</span>}
                                    </td>
                                    <td style={{ color: "var(--text-muted)", fontSize: 12, whiteSpace: "nowrap" }}>
                                        {formatDate(lead.created_at)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div style={{
                    padding: "12px 16px", borderTop: "1px solid var(--border-light)",
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    background: "var(--bg-tertiary)",
                }}>
                    <span style={{ fontSize: 13, color: "var(--text-muted)" }}>
                        Всего <strong style={{ color: "var(--text-primary)" }}>{count}</strong> лид{count !== 1 ? "ов" : ""}
                    </span>
                    {totalPages > 1 && (
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                            <button className="btn btn--outline btn--sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>
                                ←
                            </button>
                            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                                const p = page <= 3 ? i + 1 : page - 2 + i
                                if (p < 1 || p > totalPages) return null
                                return (
                                    <button
                                        key={p}
                                        className="btn btn--sm"
                                        style={{
                                            background: p === page ? "var(--accent)" : "var(--bg-card)",
                                            color: p === page ? "white" : "var(--text-secondary)",
                                            border: `1px solid ${p === page ? "var(--accent)" : "var(--border-color)"}`,
                                            minWidth: 32,
                                        }}
                                        onClick={() => setPage(p)}
                                    >
                                        {p}
                                    </button>
                                )
                            })}
                            <button className="btn btn--outline btn--sm" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>
                                →
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {toast && <div className="toast toast--success">✓ {toast}</div>}
        </AppLayout>
    )
}