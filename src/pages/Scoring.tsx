import { useState, useEffect } from "react"
import AppLayout from "../components/AppLayout"
import { leadsApi } from "../api/leads"
import { kpiApi } from "../api/kpi"

interface LeadStats {
    total: number; new: number; in_progress: number
    won: number; lost: number; hot: number; cold: number; avg_score: number
}

interface AgentKPI {
    agent_id: number
    full_name: string
    email: string
    department: string
    team: string
    total_deals: number
    closed_deals: number
    in_progress_deals: number
    failed_deals?: number
    conversion_rate: number
    total_revenue: string
    avg_deal_value?: string
    avg_commission?: string
    deals_this_week?: number
    deals_this_month?: number
    rating: number
    period: string
    hire_date?: string | null
}

function formatMoney(val?: string | number | null) {
    if (!val && val !== 0) return "—"
    const n = parseFloat(String(val))
    if (isNaN(n) || n === 0) return "—"
    if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`
    if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`
    return `$${n.toFixed(0)}`
}

function RatingBar({ value, max = 5 }: { value: number; max?: number }) {
    const pct = Math.min((value / max) * 100, 100)
    return (
        <div className="progress-bar">
            <div className="progress-bar__fill" style={{ width: `${pct}%` }} />
        </div>
    )
}

export default function Scoring() {
    const [leadStats, setLeadStats] = useState<LeadStats | null>(null)
    const [kpiData, setKpiData] = useState<AgentKPI[]>([])
    const [loading, setLoading] = useState(true)
    const [period, setPeriod] = useState<"all" | "day" | "week" | "month">("month")
    const [activeTab, setActiveTab] = useState<"overview" | "agents">("overview")

    useEffect(() => {
        const load = async () => {
            setLoading(true)
            try {
                const [stats, kpi] = await Promise.all([
                    leadsApi.stats(),
                    kpiApi.leadKpis({ period }),
                ])
                setLeadStats(stats as LeadStats)
                // KPI может быть массивом или объектом
                if (Array.isArray(kpi)) setKpiData(kpi)
                else if (Array.isArray((kpi as { results?: AgentKPI[] })?.results)) setKpiData((kpi as { results: AgentKPI[] }).results)
                else if (kpi && typeof kpi === 'object') setKpiData([kpi as AgentKPI])
                else setKpiData([])
            } catch (e) {
                console.error(e)
            } finally {
                setLoading(false)
            }
        }
        load()
    }, [period])

    const total = leadStats?.total || 1
    const hot = leadStats?.hot ?? 0
    const warm = (leadStats?.in_progress ?? 0)
    const cold = leadStats?.cold ?? 0

    return (
        <AppLayout
            title="Скоринг и KPI"
            breadcrumbs={[{ label: "Дашборд", path: "/dashboard" }, { label: "Скоринг" }]}
            actions={
                <select className="form-select" style={{ width: 140, height: 34, fontSize: 13 }}
                    value={period} onChange={e => setPeriod(e.target.value as typeof period)}>
                    <option value="day">День</option>
                    <option value="week">Неделя</option>
                    <option value="month">Месяц</option>
                    <option value="all">Всё время</option>
                </select>
            }
        >
            {/* Tabs */}
            <div className="tabs" style={{ marginBottom: 20 }}>
                <button className={`tab-btn ${activeTab === "overview" ? "tab-btn--active" : ""}`} onClick={() => setActiveTab("overview")}>
                    Обзор лидов
                </button>
                <button className={`tab-btn ${activeTab === "agents" ? "tab-btn--active" : ""}`} onClick={() => setActiveTab("agents")}>
                    KPI агентов
                    {kpiData.length > 0 && (
                        <span style={{ marginLeft: 6, background: "var(--accent)", color: "white", borderRadius: 10, fontSize: 10, padding: "1px 6px" }}>
                            {kpiData.length}
                        </span>
                    )}
                </button>
            </div>

            {/* ── Overview Tab ── */}
            {activeTab === "overview" && (
                <>
                    {/* Stat cards */}
                    <div className="grid-4" style={{ marginBottom: 24 }}>
                        {[
                            { label: "Всего лидов", value: loading ? "..." : String(leadStats?.total ?? 0), color: "var(--text-primary)" },
                            { label: "Средний score", value: loading ? "..." : (leadStats?.avg_score?.toFixed(1) ?? "—"), color: "var(--accent)" },
                            { label: "Горячих", value: loading ? "..." : String(hot), color: "#ef4444" },
                            { label: "Конверсия", value: loading ? "..." : `${((leadStats?.won ?? 0) / total * 100).toFixed(1)}%`, color: "#10b981" },
                        ].map(s => (
                            <div className="stat-card" key={s.label}>
                                <div className="stat-card__label">{s.label}</div>
                                <div className="stat-card__value" style={{ color: s.color }}>{s.value}</div>
                            </div>
                        ))}
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 24 }}>

                        {/* Score distribution */}
                        <div className="g-card">
                            <h3 style={{ margin: "0 0 16px", fontSize: 15, fontWeight: 700, color: "var(--text-primary)" }}>
                                Распределение по Score
                            </h3>
                            {loading ? (
                                <div style={{ color: "var(--text-muted)", fontSize: 13 }}>Загрузка...</div>
                            ) : (
                                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                                    {[
                                        { label: "Горячие (score ≥ 70)", count: hot, color: "#ef4444" },
                                        { label: "Тёплые (30–70)", count: warm, color: "#f59e0b" },
                                        { label: "Холодные (< 30)", count: cold, color: "var(--accent)" },
                                        { label: "Закрытые (won)", count: leadStats?.won ?? 0, color: "#10b981" },
                                        { label: "Потеряны (lost)", count: leadStats?.lost ?? 0, color: "var(--text-muted)" },
                                    ].map(s => {
                                        const pct = Math.round((s.count / total) * 100)
                                        return (
                                            <div key={s.label}>
                                                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 5 }}>
                                                    <span style={{ color: "var(--text-secondary)", fontWeight: 500 }}>{s.label}</span>
                                                    <span style={{ fontWeight: 700, color: s.color }}>{s.count} <span style={{ color: "var(--text-muted)", fontWeight: 400 }}>({pct}%)</span></span>
                                                </div>
                                                <div className="progress-bar">
                                                    <div className="progress-bar__fill" style={{ width: `${pct}%`, background: s.color }} />
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            )}
                        </div>

                        {/* Status breakdown */}
                        <div className="g-card">
                            <h3 style={{ margin: "0 0 16px", fontSize: 15, fontWeight: 700, color: "var(--text-primary)" }}>
                                Статусы лидов
                            </h3>
                            {loading ? (
                                <div style={{ color: "var(--text-muted)", fontSize: 13 }}>Загрузка...</div>
                            ) : (
                                <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
                                    {[
                                        { label: "Новые", value: leadStats?.new ?? 0, badge: "status-badge--new" },
                                        { label: "В работе", value: leadStats?.in_progress ?? 0, badge: "status-badge--progress" },
                                        { label: "Закрытые", value: leadStats?.won ?? 0, badge: "status-badge--done" },
                                        { label: "Потеряны", value: leadStats?.lost ?? 0, badge: "status-badge--lost" },
                                    ].map((row, i, arr) => (
                                        <div key={row.label} style={{
                                            display: "flex", justifyContent: "space-between", alignItems: "center",
                                            padding: "10px 0", fontSize: 13,
                                            borderBottom: i < arr.length - 1 ? "1px solid var(--border-light)" : "none",
                                        }}>
                                            <span style={{ color: "var(--text-secondary)" }}>{row.label}</span>
                                            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                                <div style={{ width: 80 }}>
                                                    <div className="progress-bar" style={{ height: 4, marginBottom: 0 }}>
                                                        <div className="progress-bar__fill" style={{ width: `${Math.round((row.value / total) * 100)}%` }} />
                                                    </div>
                                                </div>
                                                <span style={{ fontWeight: 700, color: "var(--text-primary)", minWidth: 30, textAlign: "right" }}>
                                                    {row.value}
                                                </span>
                                            </div>
                                        </div>
                                    ))}

                                    {/* Summary */}
                                    <div style={{ marginTop: 16, padding: 14, background: "var(--accent-light)", borderRadius: 10 }}>
                                        <div style={{ fontSize: 11, color: "var(--accent-text)", fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 6 }}>
                                            Средний score по всем лидам
                                        </div>
                                        <div style={{ fontSize: 28, fontWeight: 800, color: "var(--accent)" }}>
                                            {leadStats?.avg_score?.toFixed(1) ?? "—"}
                                        </div>
                                        <div style={{ marginTop: 8 }}>
                                            <RatingBar value={leadStats?.avg_score ?? 0} max={100} />
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </>
            )}

            {/* ── Agents KPI Tab ── */}
            {activeTab === "agents" && (
                <>
                    {loading ? (
                        <div className="empty-state"><div style={{ color: "var(--text-muted)" }}>Загрузка...</div></div>
                    ) : kpiData.length === 0 ? (
                        <div className="empty-state">
                            <div className="empty-state__icon">📊</div>
                            <div className="empty-state__title">Нет данных KPI</div>
                            <div className="empty-state__text">Данные появятся когда агенты начнут работать с лидами</div>
                        </div>
                    ) : (
                        <>
                            {/* KPI summary cards */}
                            <div className="grid-4" style={{ marginBottom: 20 }}>
                                {[
                                    { label: "Агентов", value: String(kpiData.length) },
                                    { label: "Всего сделок", value: String(kpiData.reduce((s, a) => s + (a.total_deals ?? 0), 0)) },
                                    { label: "Закрытых", value: String(kpiData.reduce((s, a) => s + (a.closed_deals ?? 0), 0)) },
                                    { label: "Общая выручка", value: formatMoney(kpiData.reduce((s, a) => s + parseFloat(a.total_revenue || "0"), 0)) },
                                ].map(s => (
                                    <div className="stat-card" key={s.label}>
                                        <div className="stat-card__label">{s.label}</div>
                                        <div className="stat-card__value" style={{ color: "var(--accent)" }}>{s.value}</div>
                                    </div>
                                ))}
                            </div>

                            {/* KPI Table */}
                            <div className="g-card" style={{ padding: 0, overflow: "hidden" }}>
                                <div style={{ overflowX: "auto" }}>
                                    <table className="g-table">
                                        <thead>
                                            <tr>
                                                <th>Агент</th>
                                                <th>Отдел</th>
                                                <th>Конверсия</th>
                                                <th>Всего</th>
                                                <th>Закрытых</th>
                                                <th>В работе</th>
                                                <th>Провалено</th>
                                                <th>За неделю</th>
                                                <th>За месяц</th>
                                                <th>Выручка</th>
                                                <th>Ср. сделка</th>
                                                <th>Рейтинг</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {kpiData.map((agent, i) => (
                                                <tr key={agent.agent_id}>
                                                    <td>
                                                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                                            <div style={{
                                                                width: 28, height: 28, borderRadius: "50%", flexShrink: 0,
                                                                background: i === 0 ? "linear-gradient(135deg,#0d9488,#14b8a6)" : "var(--accent-light)",
                                                                color: i === 0 ? "white" : "var(--accent)",
                                                                display: "flex", alignItems: "center", justifyContent: "center",
                                                                fontSize: 11, fontWeight: 700,
                                                            }}>
                                                                {i === 0 ? "★" : agent.full_name?.charAt(0) ?? "?"}
                                                            </div>
                                                            <div>
                                                                <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>{agent.full_name}</div>
                                                                <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{agent.email}</div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <span style={{ fontSize: 12, color: "var(--text-secondary)" }}>{agent.department}</span>
                                                    </td>
                                                    <td>
                                                        <div>
                                                            <div style={{ fontSize: 13, fontWeight: 700, color: "var(--accent)", marginBottom: 3 }}>
                                                                {(agent.conversion_rate * 100).toFixed(1)}%
                                                            </div>
                                                            <div style={{ width: 60 }}>
                                                                <RatingBar value={agent.conversion_rate * 100} max={100} />
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td style={{ fontWeight: 600, color: "var(--text-primary)" }}>{agent.total_deals}</td>
                                                    <td>
                                                        <span style={{ color: "#10b981", fontWeight: 700 }}>{agent.closed_deals}</span>
                                                    </td>
                                                    <td>
                                                        <span style={{ color: "#f59e0b", fontWeight: 600 }}>{agent.in_progress_deals}</span>
                                                    </td>
                                                    <td>
                                                        <span style={{ color: "#ef4444", fontWeight: 600 }}>{agent.failed_deals ?? 0}</span>
                                                    </td>
                                                    <td style={{ color: "var(--text-secondary)" }}>{agent.deals_this_week ?? "—"}</td>
                                                    <td style={{ color: "var(--text-secondary)" }}>{agent.deals_this_month ?? "—"}</td>
                                                    <td>
                                                        <span style={{ fontWeight: 700, color: "var(--accent)" }}>{formatMoney(agent.total_revenue)}</span>
                                                    </td>
                                                    <td style={{ color: "var(--text-secondary)" }}>{formatMoney(agent.avg_deal_value)}</td>
                                                    <td>
                                                        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                                                            <span style={{ color: "#f59e0b", fontSize: 12 }}>★</span>
                                                            <span style={{ fontWeight: 600, color: "var(--text-primary)", fontSize: 13 }}>
                                                                {agent.rating?.toFixed(1) ?? "—"}
                                                            </span>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </>
                    )}
                </>
            )}
        </AppLayout>
    )
}