import { useState, useEffect, useCallback } from "react"
import AppLayout from "../components/AppLayout"
import { agentsApi } from "../api/agents"
import { api } from "../api/client"
import type { AgentKPIBrief, AgentKPIFull, TeamStats } from "../api/agents"

// ─── Types ────────────────────────────────────────────────────────────────────

interface LeaderboardItem {
    rank: number
    rank_change: string
    agent_id: number
    full_name: string
    email: string
    department: string
    rating: number
    leads_count: number
    closed_deals: number
    conversion_rate: number
    total_revenue: string
    avg_response_time_sec: number
    is_active: boolean
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatMoney(val?: string | number | null) {
    if (!val) return "—"
    const n = parseFloat(String(val))
    if (isNaN(n)) return "—"
    if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`
    if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`
    return `$${n.toFixed(0)}`
}

function formatTime(secs: number) {
    if (secs < 60) return `${secs}с`
    if (secs < 3600) return `${Math.floor(secs / 60)}м`
    return `${Math.floor(secs / 3600)}ч`
}

function RatingStars({ rating }: { rating: number }) {
    const full = Math.floor(rating)
    return (
        <div style={{ display: "flex", alignItems: "center", gap: 2 }}>
            {[1, 2, 3, 4, 5].map(i => (
                <svg key={i} width="12" height="12" viewBox="0 0 24 24"
                    fill={i <= full ? "#f59e0b" : "none"} stroke="#f59e0b" strokeWidth="2">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
            ))}
            <span style={{ fontSize: 11, color: "var(--text-muted)", marginLeft: 3 }}>{rating.toFixed(1)}</span>
        </div>
    )
}

function ProgressBar({ value }: { value: number }) {
    return (
        <div className="progress-bar">
            <div className="progress-bar__fill" style={{ width: `${Math.min(value, 100)}%` }} />
        </div>
    )
}

function RankChange({ change }: { change: string }) {
    if (change === "up" || change === "+") return <span style={{ color: "#10b981", fontSize: 12 }}>↑</span>
    if (change === "down" || change === "-") return <span style={{ color: "#ef4444", fontSize: 12 }}>↓</span>
    return <span style={{ color: "var(--text-muted)", fontSize: 12 }}>—</span>
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function Agents() {
    const [activeTab, setActiveTab] = useState<"cards" | "leaderboard">("leaderboard")
    const [period, setPeriod] = useState<"week" | "month" | "quarter" | "all">("month")
    const [toast, setToast] = useState("")

    // Cards tab state
    const [agents, setAgents] = useState<AgentKPIBrief[]>([])
    const [teamStats, setTeamStats] = useState<TeamStats | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState("")
    const [search, setSearch] = useState("")
    const [sortBy, setSortBy] = useState<"revenue" | "deals" | "conversion" | "rating">("revenue")

    // Leaderboard tab state
    const [leaderboard, setLeaderboard] = useState<LeaderboardItem[]>([])
    const [lbLoading, setLbLoading] = useState(true)
    const [lbError, setLbError] = useState("")
    const [lbGeneratedAt, setLbGeneratedAt] = useState<string | null>(null)

    // Detail modal
    const [detailAgent, setDetailAgent] = useState<AgentKPIFull | null>(null)
    const [detailLoading, setDetailLoading] = useState(false)
    const [editAgent, setEditAgent] = useState<AgentKPIBrief | null>(null)
    const [editForm, setEditForm] = useState({ agency_name: "", license_number: "", experience_years: "" })
    const [editSaving, setEditSaving] = useState(false)

    const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(""), 3000) }

    // Fetch agents cards
    const fetchAgents = useCallback(async () => {
        setLoading(true)
        setError("")
        try {
            const [agentsData, statsData] = await Promise.all([
                agentsApi.list({ period, search: search || undefined }),
                agentsApi.teamStats({ period }),
            ])
            setAgents(agentsData)
            setTeamStats(statsData)
        } catch { setError("Ошибка загрузки агентов") }
        finally { setLoading(false) }
    }, [period, search])

    // Fetch leaderboard
    const fetchLeaderboard = useCallback(async () => {
        setLbLoading(true)
        setLbError("")
        try {
            const { data } = await api.get('/api/v2/admin/agents/leaderboard/', { params: { period, limit: 50 } })
            setLeaderboard(data.results ?? [])
            setLbGeneratedAt(data.generated_at ?? null)
        } catch { setLbError("Ошибка загрузки лидерборда") }
        finally { setLbLoading(false) }
    }, [period])

    useEffect(() => {
        if (activeTab === "cards") fetchAgents()
        else fetchLeaderboard()
    }, [activeTab, fetchAgents, fetchLeaderboard])

    const handleOpenDetail = async (agentId: number) => {
        setDetailLoading(true)
        setDetailAgent(null)
        try {
            const full = await agentsApi.getStats(agentId)
            setDetailAgent(full)
        } catch { showToast("Ошибка загрузки KPI") }
        finally { setDetailLoading(false) }
    }

    const handleOpenEdit = (agent: AgentKPIBrief) => {
        setEditAgent(agent)
        setEditForm({ agency_name: "", license_number: "", experience_years: "" })
    }

    const handleSaveProfile = async () => {
        if (!editAgent) return
        setEditSaving(true)
        try {
            await agentsApi.updateProfile(editAgent.agent_id, {
                agency_name: editForm.agency_name || undefined,
                license_number: editForm.license_number || undefined,
                experience_years: editForm.experience_years ? parseInt(editForm.experience_years) : undefined,
            })
            showToast("Профиль обновлён!")
            setEditAgent(null)
        } catch { showToast("Ошибка сохранения профиля") }
        finally { setEditSaving(false) }
    }

    const sorted = [...agents].sort((a, b) => {
        if (sortBy === "revenue") return parseFloat(b.total_revenue) - parseFloat(a.total_revenue)
        if (sortBy === "deals") return b.closed_deals - a.closed_deals
        if (sortBy === "conversion") return b.conversion_rate - a.conversion_rate
        if (sortBy === "rating") return b.rating - a.rating
        return 0
    })

    return (
        <AppLayout
            title="Агенты"
            breadcrumbs={[{ label: "Дашборд", path: "/dashboard" }, { label: "Агенты" }]}
            actions={
                <select className="form-select" style={{ width: 140, height: 34, fontSize: 13 }}
                    value={period} onChange={e => setPeriod(e.target.value as typeof period)}>
                    <option value="week">Неделя</option>
                    <option value="month">Месяц</option>
                    <option value="quarter">Квартал</option>
                    <option value="all">Всё время</option>
                </select>
            }
        >
            {/* Team stats */}
            {teamStats && activeTab === "cards" && (
                <div className="grid-4" style={{ marginBottom: 20 }}>
                    {[
                        { label: "Всего агентов", value: String(teamStats.total_agents), color: "var(--accent)" },
                        { label: "Выручка команды", value: formatMoney(teamStats.total_revenue), color: "var(--accent)" },
                        { label: "Средняя конверсия", value: `${(teamStats.avg_conversion_rate * 100).toFixed(1)}%`, color: "#10b981" },
                        { label: "Средний рейтинг", value: teamStats.avg_rating.toFixed(2), color: "#f59e0b" },
                    ].map(s => (
                        <div className="stat-card" key={s.label}>
                            <div className="stat-card__label">{s.label}</div>
                            <div className="stat-card__value" style={{ color: s.color }}>{s.value}</div>
                        </div>
                    ))}
                </div>
            )}

            {/* Tabs */}
            <div className="tabs" style={{ marginBottom: 20 }}>
                <button className={`tab-btn ${activeTab === "leaderboard" ? "tab-btn--active" : ""}`} onClick={() => setActiveTab("leaderboard")}>
                    🏆 Лидерборд
                </button>
                <button className={`tab-btn ${activeTab === "cards" ? "tab-btn--active" : ""}`} onClick={() => setActiveTab("cards")}>
                    Карточки агентов
                </button>
            </div>

            {/* ── Leaderboard Tab ── */}
            {activeTab === "leaderboard" && (
                <>
                    {lbGeneratedAt && (
                        <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 12 }}>
                            Сформировано: {new Date(lbGeneratedAt).toLocaleString("ru-RU")}
                        </div>
                    )}
                    {lbError && <div style={{ color: "#ef4444", fontSize: 13, marginBottom: 16 }}>⚠ {lbError}</div>}
                    {lbLoading ? (
                        <div className="empty-state"><div style={{ color: "var(--text-muted)" }}>Загрузка...</div></div>
                    ) : leaderboard.length === 0 ? (
                        <div className="empty-state">
                            <div className="empty-state__icon">🏆</div>
                            <div className="empty-state__title">Нет данных</div>
                        </div>
                    ) : (
                        <div className="g-card" style={{ padding: 0, overflow: "hidden" }}>
                            <div style={{ overflowX: "auto" }}>
                                <table className="g-table">
                                    <thead>
                                        <tr>
                                            <th style={{ width: 60 }}>Место</th>
                                            <th>Агент</th>
                                            <th>Конверсия</th>
                                            <th>Лиды</th>
                                            <th>Сделки</th>
                                            <th>Выручка</th>
                                            <th>Время ответа</th>
                                            <th>Рейтинг</th>
                                            <th>Статус</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {leaderboard.map(item => (
                                            <tr key={item.agent_id} style={{ cursor: "pointer" }}
                                                onClick={() => handleOpenDetail(item.agent_id)}>
                                                <td>
                                                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                                        <div style={{
                                                            width: 28, height: 28, borderRadius: "50%", flexShrink: 0,
                                                            background: item.rank === 1 ? "linear-gradient(135deg,#f59e0b,#d97706)"
                                                                : item.rank === 2 ? "linear-gradient(135deg,#94a3b8,#64748b)"
                                                                    : item.rank === 3 ? "linear-gradient(135deg,#b45309,#92400e)"
                                                                        : "var(--bg-hover)",
                                                            color: item.rank <= 3 ? "white" : "var(--text-muted)",
                                                            display: "flex", alignItems: "center", justifyContent: "center",
                                                            fontSize: 11, fontWeight: 700,
                                                        }}>
                                                            {item.rank <= 3 ? ["🥇", "🥈", "🥉"][item.rank - 1] : item.rank}
                                                        </div>
                                                        <RankChange change={item.rank_change} />
                                                    </div>
                                                </td>
                                                <td>
                                                    <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                                                        <div style={{
                                                            width: 30, height: 30, borderRadius: "50%", flexShrink: 0,
                                                            background: item.rank === 1 ? "linear-gradient(135deg,#0d9488,#14b8a6)" : "var(--accent-light)",
                                                            color: item.rank === 1 ? "white" : "var(--accent)",
                                                            display: "flex", alignItems: "center", justifyContent: "center",
                                                            fontSize: 11, fontWeight: 700,
                                                        }}>
                                                            {item.full_name?.charAt(0) ?? "?"}
                                                        </div>
                                                        <div>
                                                            <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>{item.full_name}</div>
                                                            <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{item.department}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td>
                                                    <div>
                                                        <div style={{ fontSize: 13, fontWeight: 700, color: "var(--accent)", marginBottom: 3 }}>
                                                            {(item.conversion_rate * 100).toFixed(1)}%
                                                        </div>
                                                        <div style={{ width: 60 }}>
                                                            <ProgressBar value={item.conversion_rate * 100} />
                                                        </div>
                                                    </div>
                                                </td>
                                                <td style={{ fontWeight: 600, color: "var(--text-primary)" }}>{item.leads_count}</td>
                                                <td style={{ fontWeight: 700, color: "#10b981" }}>{item.closed_deals}</td>
                                                <td style={{ fontWeight: 700, color: "var(--accent)" }}>{formatMoney(item.total_revenue)}</td>
                                                <td style={{ color: "var(--text-secondary)", fontSize: 13 }}>{formatTime(item.avg_response_time_sec)}</td>
                                                <td><RatingStars rating={item.rating} /></td>
                                                <td>
                                                    <span style={{
                                                        fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 20,
                                                        background: item.is_active ? "var(--score-high-bg)" : "var(--bg-hover)",
                                                        color: item.is_active ? "var(--score-high-text)" : "var(--text-muted)",
                                                    }}>
                                                        {item.is_active ? "Активен" : "Неактивен"}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </>
            )}

            {/* ── Cards Tab ── */}
            {activeTab === "cards" && (
                <>
                    <div className="g-card" style={{ marginBottom: 16 }}>
                        <div className="filters-row">
                            <input className="form-input" style={{ width: 220 }} placeholder="Поиск по имени..."
                                value={search} onChange={e => setSearch(e.target.value)}
                                onKeyDown={e => e.key === "Enter" && fetchAgents()} />
                            <select className="form-select" style={{ width: 170 }} value={sortBy}
                                onChange={e => setSortBy(e.target.value as typeof sortBy)}>
                                <option value="revenue">По выручке</option>
                                <option value="deals">По сделкам</option>
                                <option value="conversion">По конверсии</option>
                                <option value="rating">По рейтингу</option>
                            </select>
                            <button className="btn btn--outline btn--sm" onClick={fetchAgents}>Обновить</button>
                            <span style={{ marginLeft: "auto", fontSize: 13, color: "var(--text-muted)" }}>{agents.length} агентов</span>
                        </div>
                    </div>

                    {error && <div style={{ color: "#ef4444", fontSize: 13, marginBottom: 16 }}>⚠ {error}</div>}

                    {loading ? (
                        <div className="empty-state"><div style={{ color: "var(--text-muted)" }}>Загрузка...</div></div>
                    ) : sorted.length === 0 ? (
                        <div className="empty-state">
                            <div className="empty-state__icon">👥</div>
                            <div className="empty-state__title">Агенты не найдены</div>
                        </div>
                    ) : (
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 16 }}>
                            {sorted.map((agent, index) => {
                                const isTop = index === 0 && sortBy === "revenue"
                                return (
                                    <div key={agent.agent_id} className="g-card" style={{ border: isTop ? "2px solid var(--accent)" : "1px solid var(--border-color)", position: "relative", overflow: "hidden" }}>
                                        {isTop && <div style={{ position: "absolute", top: 0, right: 0, background: "var(--accent)", color: "white", fontSize: 10, fontWeight: 700, padding: "3px 10px", borderBottomLeftRadius: 8 }}>★ Топ</div>}
                                        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
                                            <div style={{ width: 44, height: 44, borderRadius: "50%", flexShrink: 0, background: isTop ? "linear-gradient(135deg,#0d9488,#14b8a6)" : "var(--accent-light)", color: isTop ? "white" : "var(--accent)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 800 }}>
                                                {agent.full_name?.charAt(0) ?? "?"}
                                            </div>
                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{agent.full_name}</div>
                                                <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>{agent.department} · {agent.team}</div>
                                                <div style={{ marginTop: 4 }}><RatingStars rating={agent.rating} /></div>
                                            </div>
                                        </div>
                                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 14 }}>
                                            {[
                                                { label: "Выручка", value: formatMoney(agent.total_revenue), color: "var(--accent)", big: true },
                                                { label: "Конверсия", value: `${(agent.conversion_rate * 100).toFixed(1)}%`, color: "#10b981", big: true },
                                                { label: "Всего", value: String(agent.total_deals), color: "var(--text-primary)" },
                                                { label: "Закрытых", value: String(agent.closed_deals), color: "#10b981" },
                                                { label: "В работе", value: String(agent.in_progress_deals), color: "#f59e0b" },
                                            ].map(kpi => (
                                                <div key={kpi.label} style={{ padding: "8px 10px", background: "var(--bg-tertiary)", borderRadius: 8, border: "1px solid var(--border-light)" }}>
                                                    <div style={{ fontSize: 10, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: 0.4, marginBottom: 3 }}>{kpi.label}</div>
                                                    <div style={{ fontSize: kpi.big ? 16 : 14, fontWeight: 700, color: kpi.color }}>{kpi.value}</div>
                                                </div>
                                            ))}
                                        </div>
                                        <div style={{ marginBottom: 14 }}>
                                            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "var(--text-muted)", marginBottom: 4 }}>
                                                <span>Конверсия</span>
                                                <span style={{ color: "var(--accent)", fontWeight: 600 }}>{(agent.conversion_rate * 100).toFixed(1)}%</span>
                                            </div>
                                            <ProgressBar value={agent.conversion_rate * 100} />
                                        </div>
                                        <div style={{ display: "flex", gap: 8 }}>
                                            <button className="btn btn--outline btn--sm" style={{ flex: 1 }} onClick={() => handleOpenDetail(agent.agent_id)}>Полный KPI</button>
                                            <button className="btn btn--primary btn--sm" style={{ flex: 1 }} onClick={() => handleOpenEdit(agent)}>Профиль</button>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    )}
                </>
            )}

            {/* Detail Modal */}
            {(detailAgent || detailLoading) && (
                <div className="modal-overlay" onClick={() => { setDetailAgent(null); setDetailLoading(false) }}>
                    <div className="modal" style={{ maxWidth: 560 }} onClick={e => e.stopPropagation()}>
                        <div className="modal__header">
                            <div className="modal__title">{detailLoading ? "Загрузка..." : `KPI — ${detailAgent?.full_name}`}</div>
                            <button className="modal__close" onClick={() => { setDetailAgent(null); setDetailLoading(false) }}>✕</button>
                        </div>
                        {detailLoading ? (
                            <div style={{ padding: "30px 0", textAlign: "center", color: "var(--text-muted)" }}>Загрузка...</div>
                        ) : detailAgent && (
                            <div>
                                <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 20, padding: 14, background: "var(--bg-tertiary)", borderRadius: 12 }}>
                                    <div style={{ width: 48, height: 48, borderRadius: "50%", background: "linear-gradient(135deg,#0d9488,#14b8a6)", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, fontWeight: 800, flexShrink: 0 }}>
                                        {detailAgent.full_name?.charAt(0) ?? "?"}
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)" }}>{detailAgent.full_name}</div>
                                        <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{detailAgent.department} · {detailAgent.team}</div>
                                        {detailAgent.hire_date && <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>Найм: {new Date(detailAgent.hire_date).toLocaleDateString("ru-RU")}</div>}
                                    </div>
                                    <RatingStars rating={detailAgent.rating} />
                                </div>
                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 16 }}>
                                    {[
                                        { label: "Всего сделок", value: String(detailAgent.total_deals), color: "var(--text-primary)" },
                                        { label: "Закрытых", value: String(detailAgent.closed_deals), color: "#10b981" },
                                        { label: "В работе", value: String(detailAgent.in_progress_deals), color: "#f59e0b" },
                                        { label: "Провалено", value: String(detailAgent.failed_deals), color: "#ef4444" },
                                        { label: "За неделю", value: String(detailAgent.deals_this_week), color: "var(--accent)" },
                                        { label: "За месяц", value: String(detailAgent.deals_this_month), color: "var(--accent)" },
                                        { label: "Выручка", value: formatMoney(detailAgent.total_revenue), color: "var(--accent)" },
                                        { label: "Ср. сделка", value: formatMoney(detailAgent.avg_deal_value), color: "var(--text-secondary)" },
                                        { label: "Ср. комиссия", value: formatMoney(detailAgent.avg_commission), color: "#10b981" },
                                    ].map(kpi => (
                                        <div key={kpi.label} style={{ padding: "10px 12px", background: "var(--bg-tertiary)", borderRadius: 9, border: "1px solid var(--border-light)" }}>
                                            <div style={{ fontSize: 10, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: 0.4, marginBottom: 4 }}>{kpi.label}</div>
                                            <div style={{ fontSize: 15, fontWeight: 700, color: kpi.color }}>{kpi.value}</div>
                                        </div>
                                    ))}
                                </div>
                                <div style={{ padding: "12px 14px", background: "var(--accent-light)", borderRadius: 10 }}>
                                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 6 }}>
                                        <span style={{ color: "var(--accent-text)", fontWeight: 600 }}>Конверсия</span>
                                        <span style={{ fontWeight: 800, color: "var(--accent)", fontSize: 16 }}>{(detailAgent.conversion_rate * 100).toFixed(1)}%</span>
                                    </div>
                                    <ProgressBar value={detailAgent.conversion_rate * 100} />
                                </div>
                            </div>
                        )}
                        <div className="modal__footer">
                            <button className="btn btn--outline" onClick={() => { setDetailAgent(null); setDetailLoading(false) }}>Закрыть</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Profile Modal */}
            {editAgent && (
                <div className="modal-overlay" onClick={() => setEditAgent(null)}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <div className="modal__header">
                            <div className="modal__title">Профиль — {editAgent.full_name}</div>
                            <button className="modal__close" onClick={() => setEditAgent(null)}>✕</button>
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                            <div className="form-group">
                                <label className="form-label">Название агентства</label>
                                <input className="form-input" placeholder="RealtorAI" value={editForm.agency_name}
                                    onChange={e => setEditForm(f => ({ ...f, agency_name: e.target.value }))} autoFocus />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Номер лицензии</label>
                                <input className="form-input" placeholder="LIC-123456" value={editForm.license_number}
                                    onChange={e => setEditForm(f => ({ ...f, license_number: e.target.value }))} />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Опыт работы (лет)</label>
                                <input className="form-input" type="number" min="0" placeholder="5" value={editForm.experience_years}
                                    onChange={e => setEditForm(f => ({ ...f, experience_years: e.target.value }))} />
                            </div>
                        </div>
                        <div className="modal__footer">
                            <button className="btn btn--outline" onClick={() => setEditAgent(null)}>Отмена</button>
                            <button className="btn btn--primary" onClick={handleSaveProfile} disabled={editSaving}>
                                {editSaving ? "Сохранение..." : "Сохранить"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {toast && <div className="toast toast--success">✓ {toast}</div>}
        </AppLayout>
    )
}