import { useState, useEffect } from "react"
import AppLayout from "../components/AppLayout"
import { api } from "../api/client"

// ─── Types ────────────────────────────────────────────────────────────────────

interface AdminAnalytics {
    period: string
    group_by: string
    funnel: {
        new: number; in_progress: number; won: number; lost: number
        conversion_rate: number
        drop_rate: { new_to_in_progress: number; in_progress_to_won: number }
    }
    revenue: {
        total: string; avg_deal: string
        by_period: { period: string; revenue: string; deals: number }[]
    }
    sources: { source: string; leads: number; won: number; conversion: number }[]
    pipeline_distribution: { stage: string; count: number }[]
    avg_time_to_close_days: number
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const SOURCE_LABELS: Record<string, string> = {
    telegram: "Telegram", whatsapp: "WhatsApp", instagram: "Instagram", manual: "Ручной ввод",
}

function formatMoney(val?: string | number | null) {
    if (!val) return "—"
    const n = parseFloat(String(val))
    if (isNaN(n) || n === 0) return "—"
    if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`
    if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`
    return `$${n.toFixed(0)}`
}

function pct(val: number) {
    return `${(val * 100).toFixed(1)}%`
}

// ─── Simple bar chart ─────────────────────────────────────────────────────────

function MiniBarChart({ data }: { data: { label: string; value: number; color?: string }[] }) {
    const max = Math.max(...data.map(d => d.value), 1)
    return (
        <div style={{ display: "flex", alignItems: "flex-end", gap: 4, height: 80 }}>
            {data.map((d, i) => (
                <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                    <div style={{ fontSize: 10, color: "var(--text-muted)", fontWeight: 600 }}>
                        {d.value > 0 ? (d.value >= 1000 ? `${(d.value / 1000).toFixed(0)}K` : String(d.value)) : ""}
                    </div>
                    <div style={{
                        width: "100%", borderRadius: "4px 4px 0 0",
                        background: d.color ?? "var(--accent)",
                        height: `${Math.max((d.value / max) * 60, d.value > 0 ? 4 : 0)}px`,
                        transition: "height 0.3s",
                    }} />
                    <div style={{ fontSize: 9, color: "var(--text-muted)", textAlign: "center", wordBreak: "break-all" }}>
                        {d.label}
                    </div>
                </div>
            ))}
        </div>
    )
}

// ─── Funnel step ──────────────────────────────────────────────────────────────

function FunnelStep({ label, value, total, color }: { label: string; value: number; total: number; color: string }) {
    const pct = total > 0 ? Math.round((value / total) * 100) : 0
    const width = Math.max(pct, 5)
    return (
        <div style={{ marginBottom: 10 }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 5 }}>
                <span style={{ color: "var(--text-secondary)", fontWeight: 500 }}>{label}</span>
                <span style={{ fontWeight: 700, color }}>
                    {value} <span style={{ color: "var(--text-muted)", fontWeight: 400 }}>({pct}%)</span>
                </span>
            </div>
            <div style={{ height: 8, background: "var(--bg-hover)", borderRadius: 4, overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${width}%`, background: color, borderRadius: 4, transition: "width 0.4s" }} />
            </div>
        </div>
    )
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function Scoring() {
    const [data, setData] = useState<AdminAnalytics | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState("")
    const [period, setPeriod] = useState<"day" | "week" | "month" | "quarter" | "all">("month")
    const groupBy = period === "day" || period === "week" ? "week" : "month"

    useEffect(() => {
        const load = async () => {
            setLoading(true)
            setError("")
            try {
                const { data: res } = await api.get('/api/v2/admin/analytics/', { params: { period, group_by: groupBy } })
                setData(res)
            } catch {
                setError("Ошибка загрузки аналитики")
            } finally {
                setLoading(false)
            }
        }
        load()
    }, [period, groupBy])

    const funnel = data?.funnel
    const revenue = data?.revenue
    const sources = data?.sources ?? []
    const pipeline = data?.pipeline_distribution ?? []
    const totalLeads = funnel ? (funnel.new + funnel.in_progress + funnel.won + funnel.lost) : 0

    return (
        <AppLayout
            title="Аналитика"
            breadcrumbs={[{ label: "Дашборд", path: "/dashboard" }, { label: "Аналитика" }]}
            actions={
                <div style={{ display: "flex", gap: 8 }}>
                    <select className="form-select" style={{ width: 140, height: 34, fontSize: 13 }}
                        value={period} onChange={e => setPeriod(e.target.value as typeof period)}>
                        <option value="day">День</option>
                        <option value="week">Неделя</option>
                        <option value="month">Месяц</option>
                        <option value="quarter">Квартал</option>
                        <option value="all">Всё время</option>
                    </select>
                </div>
            }
        >
            {error && <div style={{ padding: "12px 16px", color: "#ef4444", fontSize: 13, marginBottom: 16 }}>⚠ {error}</div>}

            {/* ── KPI Cards ── */}
            <div className="grid-4" style={{ marginBottom: 24 }}>
                {[
                    { label: "Конверсия", value: loading ? "..." : pct(funnel?.conversion_rate ?? 0), color: "var(--accent)", sub: "лид → сделка" },
                    { label: "Общая выручка", value: loading ? "..." : formatMoney(revenue?.total), color: "#10b981", sub: "за период" },
                    { label: "Средняя сделка", value: loading ? "..." : formatMoney(revenue?.avg_deal), color: "var(--accent)", sub: "средний чек" },
                    { label: "Среднее закрытие", value: loading ? "..." : `${data?.avg_time_to_close_days?.toFixed(1) ?? "—"} дн`, color: "#f59e0b", sub: "дней до закрытия" },
                ].map(s => (
                    <div className="stat-card" key={s.label}>
                        <div className="stat-card__label">{s.label}</div>
                        <div className="stat-card__value" style={{ color: s.color }}>{s.value}</div>
                        <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>{s.sub}</div>
                    </div>
                ))}
            </div>

            {/* ── Funnel + Sources ── */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 20 }}>

                {/* Funnel */}
                <div className="g-card">
                    <h3 style={{ margin: "0 0 16px", fontSize: 15, fontWeight: 700, color: "var(--text-primary)" }}>Воронка лидов</h3>
                    {loading ? <div style={{ color: "var(--text-muted)", fontSize: 13 }}>Загрузка...</div> : funnel ? (
                        <>
                            <FunnelStep label="Новые" value={funnel.new} total={totalLeads} color="var(--accent)" />
                            <FunnelStep label="В работе" value={funnel.in_progress} total={totalLeads} color="#f59e0b" />
                            <FunnelStep label="Закрытые" value={funnel.won} total={totalLeads} color="#10b981" />
                            <FunnelStep label="Потеряны" value={funnel.lost} total={totalLeads} color="#ef4444" />

                            <div style={{ marginTop: 16, padding: "12px 14px", background: "var(--bg-tertiary)", borderRadius: 10 }}>
                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                                    <div>
                                        <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 3 }}>Новый → В работе</div>
                                        <div style={{ fontSize: 15, fontWeight: 700, color: "var(--accent)" }}>
                                            {pct(funnel.drop_rate.new_to_in_progress)}
                                        </div>
                                    </div>
                                    <div>
                                        <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 3 }}>В работе → Сделка</div>
                                        <div style={{ fontSize: 15, fontWeight: 700, color: "#10b981" }}>
                                            {pct(funnel.drop_rate.in_progress_to_won)}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </>
                    ) : null}
                </div>

                {/* Sources */}
                <div className="g-card">
                    <h3 style={{ margin: "0 0 16px", fontSize: 15, fontWeight: 700, color: "var(--text-primary)" }}>Источники лидов</h3>
                    {loading ? <div style={{ color: "var(--text-muted)", fontSize: 13 }}>Загрузка...</div>
                        : sources.length === 0 ? <div style={{ color: "var(--text-muted)", fontSize: 13 }}>Нет данных</div>
                            : (
                                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                                    {sources.map(s => {
                                        const totalSources = sources.reduce((a, b) => a + b.leads, 0) || 1
                                        const barPct = Math.round((s.leads / totalSources) * 100)
                                        return (
                                            <div key={s.source}>
                                                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 4 }}>
                                                    <span style={{ color: "var(--text-secondary)", fontWeight: 500 }}>
                                                        {SOURCE_LABELS[s.source] ?? s.source}
                                                    </span>
                                                    <div style={{ display: "flex", gap: 12, fontSize: 12 }}>
                                                        <span style={{ color: "var(--text-muted)" }}>{s.leads} лидов</span>
                                                        <span style={{ fontWeight: 700, color: "#10b981" }}>{pct(s.conversion)}</span>
                                                    </div>
                                                </div>
                                                <div style={{ height: 6, background: "var(--bg-hover)", borderRadius: 3, overflow: "hidden" }}>
                                                    <div style={{ height: "100%", width: `${barPct}%`, background: "var(--accent)", borderRadius: 3 }} />
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            )}
                </div>
            </div>

            {/* ── Revenue chart + Pipeline distribution ── */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>

                {/* Revenue by period */}
                <div className="g-card">
                    <h3 style={{ margin: "0 0 16px", fontSize: 15, fontWeight: 700, color: "var(--text-primary)" }}>Выручка по периодам</h3>
                    {loading ? <div style={{ color: "var(--text-muted)", fontSize: 13 }}>Загрузка...</div>
                        : !revenue?.by_period?.length ? <div style={{ color: "var(--text-muted)", fontSize: 13 }}>Нет данных</div>
                            : (
                                <>
                                    <MiniBarChart data={revenue.by_period.map(p => ({
                                        label: p.period,
                                        value: parseFloat(p.revenue) || 0,
                                        color: "var(--accent)",
                                    }))} />
                                    <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 6 }}>
                                        {revenue.by_period.slice(-5).map(p => (
                                            <div key={p.period} style={{ display: "flex", justifyContent: "space-between", fontSize: 12 }}>
                                                <span style={{ color: "var(--text-secondary)" }}>{p.period}</span>
                                                <div style={{ display: "flex", gap: 12 }}>
                                                    <span style={{ color: "var(--text-muted)" }}>{p.deals} сделок</span>
                                                    <span style={{ fontWeight: 700, color: "var(--accent)" }}>{formatMoney(p.revenue)}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </>
                            )}
                </div>

                {/* Pipeline distribution */}
                <div className="g-card">
                    <h3 style={{ margin: "0 0 16px", fontSize: 15, fontWeight: 700, color: "var(--text-primary)" }}>Распределение по воронке</h3>
                    {loading ? <div style={{ color: "var(--text-muted)", fontSize: 13 }}>Загрузка...</div>
                        : pipeline.length === 0 ? <div style={{ color: "var(--text-muted)", fontSize: 13 }}>Нет данных</div>
                            : (
                                <>
                                    <MiniBarChart data={pipeline.map((p, i) => ({
                                        label: p.stage,
                                        value: p.count,
                                        color: i === 0 ? "var(--accent)" : i === pipeline.length - 1 ? "#10b981" : "#f59e0b",
                                    }))} />
                                    <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 6 }}>
                                        {pipeline.map((p, i) => {
                                            const totalPipeline = pipeline.reduce((a, b) => a + b.count, 0) || 1
                                            const barPct = Math.round((p.count / totalPipeline) * 100)
                                            return (
                                                <div key={p.stage}>
                                                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 3 }}>
                                                        <span style={{ color: "var(--text-secondary)" }}>{p.stage}</span>
                                                        <span style={{ fontWeight: 700, color: "var(--text-primary)" }}>{p.count} <span style={{ color: "var(--text-muted)", fontWeight: 400 }}>({barPct}%)</span></span>
                                                    </div>
                                                    <div style={{ height: 4, background: "var(--bg-hover)", borderRadius: 2, overflow: "hidden" }}>
                                                        <div style={{ height: "100%", width: `${barPct}%`, background: i === 0 ? "var(--accent)" : i === pipeline.length - 1 ? "#10b981" : "#f59e0b", borderRadius: 2 }} />
                                                    </div>
                                                </div>
                                            )
                                        })}
                                    </div>
                                </>
                            )}
                </div>
            </div>
        </AppLayout>
    )
}