import { useState, useEffect, useCallback } from "react"
import { useNavigate } from "react-router-dom"
import AppLayout from "../components/AppLayout"
import { leadsApi } from "../api/leads"
import type { Lead, LeadStatus, LeadSource } from "../types/api"

// ─── Helpers ─────────────────────────────────────────────────────────────────

const STATUS_LABELS: Record<LeadStatus, string> = {
    new: "Новый",
    in_progress: "В работе",
    won: "Сделка",
    lost: "Отказ",
}

const SOURCE_LABELS: Record<LeadSource, string> = {
    telegram: "Telegram",
    whatsapp: "WhatsApp",
    instagram: "Instagram",
    manual: "Ручной ввод",
}

function ScoreBadge({ score }: { score?: number | undefined }) {
    if (score === undefined || score === null) return <span style={{ color: "#9ca3af" }}>—</span>
    const cls = score >= 70 ? "score-badge--high" : score >= 40 ? "score-badge--mid" : "score-badge--low"
    return <span className={`score-badge ${cls}`}>{score}</span>
}

function StatusBadge({ status }: { status: LeadStatus }) {
    const map: Record<LeadStatus, string> = {
        new: "status-badge--new",
        in_progress: "status-badge--progress",
        won: "status-badge--done",
        lost: "status-badge--lost",
    }
    return <span className={`status-badge ${map[status]}`}>{STATUS_LABELS[status]}</span>
}

function formatDate(iso: string) {
    return new Date(iso).toLocaleString("ru-RU", {
        day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit"
    })
}

// ─── Component ───────────────────────────────────────────────────────────────

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
    const [actionValue, setActionValue] = useState("----------")
    const [toast, setToast] = useState("")

    const showToast = (msg: string) => {
        setToast(msg)
        setTimeout(() => setToast(""), 3000)
    }

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

    useEffect(() => {
        fetchLeads()
    }, [fetchLeads])

    // Search on Enter
    const handleSearchKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") setSearch(searchInput)
    }

    const handleReset = () => {
        setFilterStatus("")
        setFilterSource("")
        setFilterActive("")
        setSearch("")
        setSearchInput("")
        setPage(1)
    }

    const handleSelect = (id: number) => {
        setSelected(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id])
    }
    const handleSelectAll = () => {
        setSelected(selected.length === leads.length ? [] : leads.map(l => l.id))
    }

    const handleAction = async () => {
        if (actionValue === "delete" && selected.length > 0) {
            showToast(`Выбрано ${selected.length} лидов (удаление недоступно через API)`)
        }
        setSelected([])
    }

    const totalPages = Math.ceil(count / 20)

    return (
        <AppLayout
            title="Лиды"
            breadcrumbs={[{ label: "Начало", path: "/dashboard" }, { label: "Лиды" }]}
            actions={
                <button className="btn btn--success" onClick={fetchLeads}>
                    ↻ Обновить
                </button>
            }
        >
            {/* Filters */}
            <div className="g-card" style={{ marginBottom: 16 }}>
                <div className="filters-row">
                    <select className="form-select" style={{ width: 160 }} value={filterStatus}
                        onChange={e => { setFilterStatus(e.target.value as LeadStatus | ""); setPage(1) }}>
                        <option value="">Статус лида</option>
                        <option value="new">Новый</option>
                        <option value="in_progress">В работе</option>
                        <option value="won">Сделка</option>
                        <option value="lost">Отказ</option>
                    </select>

                    <select className="form-select" style={{ width: 150 }} value={filterSource}
                        onChange={e => { setFilterSource(e.target.value as LeadSource | ""); setPage(1) }}>
                        <option value="">Источник</option>
                        <option value="telegram">Telegram</option>
                        <option value="whatsapp">WhatsApp</option>
                        <option value="instagram">Instagram</option>
                        <option value="manual">Ручной ввод</option>
                    </select>

                    <select className="form-select" style={{ width: 150 }} value={filterActive}
                        onChange={e => { setFilterActive(e.target.value as "" | "true" | "false"); setPage(1) }}>
                        <option value="">Активность</option>
                        <option value="true">Активный</option>
                        <option value="false">Неактивный</option>
                    </select>

                    <input
                        className="form-input"
                        style={{ width: 200 }}
                        placeholder="Поиск... (Enter)"
                        value={searchInput}
                        onChange={e => setSearchInput(e.target.value)}
                        onKeyDown={handleSearchKeyDown}
                    />

                    <button className="btn btn--primary" onClick={() => { setSearch(searchInput); setPage(1) }}>
                        Найти
                    </button>
                    <button className="btn btn--outline" onClick={handleReset}>
                        Сбросить
                    </button>
                </div>

                <div className="filters-row" style={{ borderTop: "1px solid #f3f4f6", paddingTop: 12, marginTop: 4 }}>
                    <select className="form-select" style={{ width: 200 }} value={actionValue}
                        onChange={e => setActionValue(e.target.value)}>
                        <option value="----------">----------</option>
                        <option value="delete">Удалить выбранные</option>
                    </select>
                    <button className="btn btn--primary" onClick={handleAction}>Выполнить</button>
                    <span style={{ fontSize: 13, color: "#6b7280" }}>
                        Выбрано {selected.length} из {leads.length} (всего {count})
                    </span>
                </div>
            </div>

            {/* Table */}
            <div className="g-card" style={{ padding: 0 }}>
                {error && (
                    <div style={{ padding: 16, color: "#dc2626", fontSize: 13 }}>⚠ {error}</div>
                )}

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
                            <th>Дата создания</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan={10}>
                                    <div className="empty-state">
                                        <div style={{ fontSize: 13, color: "#9ca3af" }}>Загрузка...</div>
                                    </div>
                                </td>
                            </tr>
                        ) : leads.length === 0 ? (
                            <tr>
                                <td colSpan={10}>
                                    <div className="empty-state">
                                        <div className="empty-state__icon">🔍</div>
                                        <div className="empty-state__title">Лиды не найдены</div>
                                        <div className="empty-state__text">Измените фильтры</div>
                                    </div>
                                </td>
                            </tr>
                        ) : leads.map((lead) => (
                            <tr key={lead.id} className="clickable" onClick={() => navigate(`/leads/${lead.id}`)}>
                                <td onClick={e => e.stopPropagation()}>
                                    <input type="checkbox"
                                        checked={selected.includes(lead.id)}
                                        onChange={() => handleSelect(lead.id)} />
                                </td>
                                <td style={{ fontWeight: 700, color: "#3b82f6" }}>{lead.id}</td>
                                <td style={{ fontWeight: 600 }}>{lead.full_name || "—"}</td>
                                <td style={{ color: "#3b82f6" }}>{lead.username ? `@${lead.username}` : "—"}</td>
                                <td>{SOURCE_LABELS[lead.source as LeadSource] ?? lead.source}</td>
                                <td>{lead.status ? <StatusBadge status={lead.status as LeadStatus} /> : "—"}</td>
                                <td><ScoreBadge score={lead.score} /></td>
                                <td style={{ color: "#6b7280" }}>{lead.phone ?? "—"}</td>
                                <td>
                                    {(lead.tags as string[])?.length > 0
                                        ? (lead.tags as string[]).map((t, i) => (
                                            <span key={i} style={{ background: "#f3f4f6", borderRadius: 4, padding: "2px 6px", fontSize: 11, marginRight: 4 }}>{t}</span>
                                        ))
                                        : <span style={{ color: "#9ca3af" }}>—</span>
                                    }
                                </td>
                                <td style={{ color: "#6b7280", fontSize: 12 }}>{formatDate(lead.created_at)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {/* Pagination */}
                <div style={{ padding: "12px 16px", borderTop: "1px solid #f3f4f6", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <span style={{ fontSize: 13, color: "#6b7280" }}>
                        Всего {count} лид{count !== 1 ? "ов" : ""}
                    </span>
                    {totalPages > 1 && (
                        <div style={{ display: "flex", gap: 6 }}>
                            <button className="btn btn--outline btn--sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>
                                ← Назад
                            </button>
                            <span style={{ fontSize: 13, color: "#6b7280", display: "flex", alignItems: "center", padding: "0 8px" }}>
                                {page} / {totalPages}
                            </span>
                            <button className="btn btn--outline btn--sm" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>
                                Вперёд →
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {toast && <div className="toast toast--success">✓ {toast}</div>}
        </AppLayout>
    )
}