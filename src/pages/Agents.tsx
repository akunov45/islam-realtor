import { useState, useEffect, useCallback } from "react"
import AppLayout from "../components/AppLayout"
import { agentsApi } from "../api/agents"
import type { AgentKPIBrief, TeamStats } from "../api/agents"

function formatMoney(val?: string | number | null) {
    if (!val) return "—"
    const n = parseFloat(String(val))
    if (isNaN(n)) return "—"
    if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`
    if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`
    return `$${n.toFixed(0)}`
}

function RatingStars({ rating }: { rating: number }) {
    const full = Math.floor(rating)
    return (
        <div style={{ display: "flex", alignItems: "center", gap: 2 }}>
            {[1, 2, 3, 4, 5].map(i => (
                <svg key={i} width="12" height="12" viewBox="0 0 24 24"
                    fill={i <= full ? "#f59e0b" : "none"}
                    stroke="#f59e0b" strokeWidth="2">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
            ))}
            <span style={{ fontSize: 11, color: "var(--text-muted)", marginLeft: 3 }}>{rating.toFixed(1)}</span>
        </div>
    )
}

export default function Agents() {
    const [agents, setAgents] = useState<AgentKPIBrief[]>([])
    const [teamStats, setTeamStats] = useState<TeamStats | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState("")
    const [period, setPeriod] = useState<"week" | "month" | "quarter" | "all">("month")
    const [search, setSearch] = useState("")
    const [sortBy, setSortBy] = useState<"revenue" | "deals" | "conversion" | "rating">("revenue")

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
        } catch {
            setError("Ошибка загрузки агентов")
        } finally {
            setLoading(false)
        }
    }, [period, search])

    useEffect(() => { fetchAgents() }, [fetchAgents])

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
            {teamStats && (
                <div className="grid-4" style={{ marginBottom: 24 }}>
                    {[
                        { label: "Всего агентов", value: String(teamStats.total_agents), sub: "в команде", color: "var(--accent)" },
                        { label: "Выручка команды", value: formatMoney(teamStats.total_revenue), sub: "за период", color: "var(--accent)" },
                        { label: "Средняя конверсия", value: `${(teamStats.avg_conversion_rate * 100).toFixed(1)}%`, sub: "лид → сделка", color: "#10b981" },
                        { label: "Средний рейтинг", value: teamStats.avg_rating.toFixed(2), sub: "по команде", color: "#f59e0b" },
                    ].map(s => (
                        <div className="stat-card" key={s.label}>
                            <div className="stat-card__label">{s.label}</div>
                            <div className="stat-card__value" style={{ color: s.color }}>{s.value}</div>
                            <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 3 }}>{s.sub}</div>
                        </div>
                    ))}
                </div>
            )}

            {/* Filters */}
            <div className="g-card" style={{ marginBottom: 16 }}>
                <div className="filters-row">
                    <input
                        className="form-input"
                        style={{ width: 220 }}
                        placeholder="Поиск по имени..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        onKeyDown={e => e.key === "Enter" && fetchAgents()}
                    />
                    <select className="form-select" style={{ width: 170 }} value={sortBy}
                        onChange={e => setSortBy(e.target.value as typeof sortBy)}>
                        <option value="revenue">По выручке</option>
                        <option value="deals">По сделкам</option>
                        <option value="conversion">По конверсии</option>
                        <option value="rating">По рейтингу</option>
                    </select>
                    <button className="btn btn--outline btn--sm" onClick={fetchAgents}>
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="23 4 23 10 17 10" /><path d="M20.49 15a9 9 0 11-2.12-9.36L23 10" strokeLinecap="round" /></svg>
                        Обновить
                    </button>
                    <span style={{ marginLeft: "auto", fontSize: 13, color: "var(--text-muted)" }}>
                        {agents.length} агентов
                    </span>
                </div>
            </div>

            {error && (
                <div style={{ padding: "12px 16px", color: "#ef4444", fontSize: 13, marginBottom: 16 }}>⚠ {error}</div>
            )}

            {/* Agents grid */}
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
                            <div key={agent.agent_id} className="g-card" style={{
                                border: isTop ? `2px solid var(--accent)` : "1px solid var(--border-color)",
                                position: "relative", overflow: "hidden",
                            }}>
                                {isTop && (
                                    <div style={{
                                        position: "absolute", top: 0, right: 0,
                                        background: "var(--accent)", color: "white",
                                        fontSize: 10, fontWeight: 700, padding: "3px 10px",
                                        borderBottomLeftRadius: 8,
                                    }}>
                                        ★ Топ
                                    </div>
                                )}

                                {/* Header */}
                                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
                                    <div style={{
                                        width: 44, height: 44, borderRadius: "50%", flexShrink: 0,
                                        background: isTop ? "linear-gradient(135deg,#0d9488,#14b8a6)" : "var(--accent-light)",
                                        color: isTop ? "white" : "var(--accent)",
                                        display: "flex", alignItems: "center", justifyContent: "center",
                                        fontSize: 16, fontWeight: 800,
                                    }}>
                                        {agent.full_name?.charAt(0) ?? "?"}
                                    </div>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                            {agent.full_name}
                                        </div>
                                        <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>
                                            {agent.department} · {agent.team}
                                        </div>
                                        <div style={{ marginTop: 4 }}>
                                            <RatingStars rating={agent.rating} />
                                        </div>
                                    </div>
                                </div>

                                {/* KPI grid */}
                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 14 }}>
                                    {[
                                        { label: "Выручка", value: formatMoney(agent.total_revenue), color: "var(--accent)", big: true },
                                        { label: "Конверсия", value: `${(agent.conversion_rate * 100).toFixed(1)}%`, color: "#10b981", big: true },
                                        { label: "Всего сделок", value: String(agent.total_deals), color: "var(--text-primary)" },
                                        { label: "Закрытых", value: String(agent.closed_deals), color: "#10b981" },
                                        { label: "В работе", value: String(agent.in_progress_deals), color: "#f59e0b" },
                                    ].map(kpi => (
                                        <div key={kpi.label} style={{
                                            padding: "8px 10px", background: "var(--bg-tertiary)",
                                            borderRadius: 8, border: "1px solid var(--border-light)",
                                        }}>
                                            <div style={{ fontSize: 10, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: 0.4, marginBottom: 3 }}>
                                                {kpi.label}
                                            </div>
                                            <div style={{ fontSize: kpi.big ? 16 : 14, fontWeight: 700, color: kpi.color }}>
                                                {kpi.value}
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Progress bar конверсии */}
                                <div>
                                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "var(--text-muted)", marginBottom: 4 }}>
                                        <span>Конверсия</span>
                                        <span style={{ color: "var(--accent)", fontWeight: 600 }}>
                                            {(agent.conversion_rate * 100).toFixed(1)}%
                                        </span>
                                    </div>
                                    <div className="progress-bar">
                                        <div className="progress-bar__fill"
                                            style={{ width: `${Math.min(agent.conversion_rate * 100, 100)}%` }} />
                                    </div>
                                </div>

                                {/* Period badge */}
                                <div style={{ marginTop: 10, textAlign: "right" }}>
                                    <span style={{ fontSize: 10, color: "var(--text-muted)", background: "var(--bg-hover)", padding: "2px 8px", borderRadius: 10 }}>
                                        {agent.period}
                                    </span>
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}
        </AppLayout>
    )
}