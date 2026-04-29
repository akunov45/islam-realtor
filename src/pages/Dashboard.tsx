import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import AppLayout from "../components/AppLayout"
import { leadsApi } from "../api/leads"
import { useAuth } from "../store/authStore"
import type { Lead, LeadStatus, LeadSource } from "../types/api"

const SOURCE_LABELS: Record<LeadSource, string> = {
    telegram: "Telegram", whatsapp: "WhatsApp", instagram: "Instagram", manual: "Ручной ввод",
}

const STATUS_LABELS: Record<LeadStatus, string> = {
    new: "Новый", in_progress: "В работе", won: "Сделка", lost: "Отказ",
}

const FUNNEL_COLS: { status: LeadStatus; label: string; color: string }[] = [
    { status: "new", label: "Новый лид", color: "#3b82f6" },
    { status: "in_progress", label: "В работе", color: "#f59e0b" },
    { status: "won", label: "Сделка", color: "#10b981" },
    { status: "lost", label: "Отказ", color: "#ef4444" },
]

function ScoreBadge({ score }: { score?: number | undefined }) {
    if (score === undefined || score === null) return <span style={{ color: "#9ca3af" }}>—</span>
    const cls = score >= 70 ? "score-badge--high" : score >= 40 ? "score-badge--mid" : "score-badge--low"
    return <span className={`score-badge ${cls}`}>{score}</span>
}

const marketInsights = [
    { label: "Новый тренд", title: "Рост спроса на 3-комнатные квартиры +18%", tag: "Тренд" },
    { label: "Срочный инсайт", title: "Network Synergy: 3 лида подходят под ваш объект «The Azure».", tag: "AI" },
    { label: "Отчёт по рынку", title: "Средняя цена кв. м выросла на 4.2% за квартал", tag: "Аналитика" },
]

export default function Dashboard() {
    const navigate = useNavigate()
    const { user } = useAuth()

    const [leads, setLeads] = useState<Lead[]>([])
    const [stats, setStats] = useState<Record<string, unknown> | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const load = async () => {
            setLoading(true)
            try {
                const [leadsRes, statsRes] = await Promise.all([
                    leadsApi.list({ page: 1 }),
                    leadsApi.stats(),
                ])
                setLeads(leadsRes.results)
                setStats(statsRes as Record<string, unknown>)
            } catch {
                // fallback — показываем то что есть
            } finally {
                setLoading(false)
            }
        }
        load()
    }, [])

    // Группировка лидов по статусу для канбана
    const leadsByStatus = FUNNEL_COLS.reduce((acc, col) => {
        acc[col.status] = leads.filter(l => l.status === col.status)
        return acc
    }, {} as Record<LeadStatus, Lead[]>)

    // Статистика из реальных данных
    const totalLeads = leads.length
    const newLeads = leadsByStatus["new"]?.length ?? 0
    const wonLeads = leadsByStatus["won"]?.length ?? 0
    const conversionRate = totalLeads > 0 ? ((wonLeads / totalLeads) * 100).toFixed(1) : "0"

    const displayName = user?.first_name
        ? `${user.first_name}${user.last_name ? ` ${user.last_name}` : ''}`
        : user?.email ?? ''

    // Горячие лиды (score >= 70) для срочных действий
    const hotLeads = leads.filter(l => l.score !== undefined && (l.score ?? 0) >= 70).slice(0, 3)

    return (
        <AppLayout
            title={`Добро пожаловать, ${displayName}`}
            breadcrumbs={[{ label: "Начало", path: "/dashboard" }, { label: "Dashboard" }]}
        >
            <p style={{ marginTop: -12, marginBottom: 20, color: "#6b7280", fontSize: 14 }}>
                {loading ? "Загрузка данных..." : `${newLeads} новых лидов · ${hotLeads.length} горячих`}
            </p>

            {/* Stats */}
            <div className="grid-4" style={{ marginBottom: 24 }}>
                {[
                    { label: "Всего лидов", value: loading ? "..." : String(totalLeads), sub: "Загружено с сервера", trend: "neutral" },
                    { label: "Новые лиды", value: loading ? "..." : String(newLeads), sub: "Статус: new", trend: "up" },
                    { label: "Закрытые сделки", value: loading ? "..." : String(wonLeads), sub: "Статус: won", trend: "neutral" },
                    { label: "Конверсия", value: loading ? "..." : `${conversionRate}%`, sub: "won / всего", trend: "up" },
                ].map((s, i) => (
                    <div className="stat-card" key={i}>
                        <div className="stat-card__label">{s.label}</div>
                        <div className="stat-card__value">{s.value}</div>
                        <div className={`stat-card__sub stat-card__sub--${s.trend}`}>{s.sub}</div>
                    </div>
                ))}
            </div>

            {/* Funnel + Right column */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: 20, marginBottom: 24 }}>

                {/* Kanban funnel */}
                <div className="g-card">
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                        <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>Воронка сделок</h2>
                        <button className="btn btn--outline btn--sm" onClick={() => navigate("/leads")}>
                            Все лиды →
                        </button>
                    </div>
                    {loading ? (
                        <div style={{ color: "#9ca3af", fontSize: 13, padding: 20, textAlign: "center" }}>Загрузка...</div>
                    ) : (
                        <div className="kanban">
                            {FUNNEL_COLS.map((col) => {
                                const colLeads = leadsByStatus[col.status] ?? []
                                return (
                                    <div className="kanban-col" key={col.status}>
                                        <div className="kanban-col__header">
                                            <span style={{ color: col.color }}>{col.label.toUpperCase()}</span>
                                            <span className="kanban-col__count">{colLeads.length}</span>
                                        </div>
                                        {colLeads.length === 0 ? (
                                            <div style={{ fontSize: 12, color: "#9ca3af", textAlign: "center", padding: "12px 0" }}>
                                                Нет лидов
                                            </div>
                                        ) : colLeads.slice(0, 5).map((lead) => (
                                            <div className="kanban-card" key={lead.id} onClick={() => navigate(`/leads/${lead.id}`)}>
                                                <div className="kanban-card__name">{lead.full_name || "—"}</div>
                                                <div className="kanban-card__meta">
                                                    {SOURCE_LABELS[lead.source as LeadSource] ?? lead.source}
                                                    {lead.phone && ` · ${lead.phone}`}
                                                </div>
                                                <div className="kanban-card__footer">
                                                    <span style={{ fontSize: 11, color: "#9ca3af" }}>Score:</span>
                                                    <ScoreBadge score={lead.score} />
                                                </div>
                                            </div>
                                        ))}
                                        {colLeads.length > 5 && (
                                            <div style={{ fontSize: 12, color: "#3b82f6", textAlign: "center", padding: "6px 0", cursor: "pointer" }}
                                                onClick={() => navigate(`/leads?status=${col.status}`)}>
                                                +{colLeads.length - 5} ещё
                                            </div>
                                        )}
                                    </div>
                                )
                            })}
                        </div>
                    )}
                </div>

                {/* Right panel */}
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

                    {/* Hot leads — urgent actions */}
                    <div className="g-card">
                        <h3 style={{ margin: "0 0 12px", fontSize: 14, fontWeight: 700 }}>🔥 Горячие лиды</h3>
                        {loading ? (
                            <div style={{ fontSize: 12, color: "#9ca3af" }}>Загрузка...</div>
                        ) : hotLeads.length === 0 ? (
                            <div style={{ fontSize: 12, color: "#9ca3af" }}>Нет горячих лидов</div>
                        ) : (
                            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                                {hotLeads.map((lead) => (
                                    <div key={lead.id} style={{ border: "1px solid #fca5a5", borderRadius: 8, padding: 12, background: "#fff5f5" }}>
                                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
                                            <span style={{ fontWeight: 600, fontSize: 13, color: "#111827" }}>{lead.full_name || "—"}</span>
                                            <ScoreBadge score={lead.score} />
                                        </div>
                                        <div style={{ fontSize: 11, color: "#6b7280", marginBottom: 8 }}>
                                            {SOURCE_LABELS[lead.source as LeadSource] ?? lead.source} · {STATUS_LABELS[lead.status as LeadStatus]}
                                        </div>
                                        <button className="btn btn--primary btn--sm" onClick={() => navigate(`/leads/${lead.id}`)}>
                                            Открыть лид →
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* AI Distribution */}
                    <div className="g-card">
                        <h3 style={{ margin: "0 0 12px", fontSize: 14, fontWeight: 700, display: "flex", alignItems: "center", gap: 6 }}>
                            🤖 AI Распределение
                        </h3>
                        <div style={{ marginBottom: 10 }}>
                            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 4 }}>
                                <span style={{ color: "#6b7280" }}>Горячих лидов</span>
                                <span style={{ fontWeight: 700, color: "#10b981" }}>
                                    {totalLeads > 0 ? Math.round((hotLeads.length / totalLeads) * 100) : 0}%
                                </span>
                            </div>
                            <div className="progress-bar">
                                <div className="progress-bar__fill progress-bar__fill--green"
                                    style={{ width: totalLeads > 0 ? `${(hotLeads.length / totalLeads) * 100}%` : "0%" }} />
                            </div>
                        </div>
                        <div style={{ fontSize: 12, color: "#374151", lineHeight: 1.6 }}>
                            <div>● Score ≥ 70: Требует немедленного внимания</div>
                            <div>● Score 40–70: Стандартная обработка</div>
                            <div>● Score &lt; 40: Холодный, низкий приоритет</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Stats detail + SLA */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 24 }}>
                <div className="g-card">
                    <h3 style={{ margin: "0 0 14px", fontSize: 15, fontWeight: 700 }}>Распределение по источникам</h3>
                    {loading ? (
                        <div style={{ fontSize: 13, color: "#9ca3af" }}>Загрузка...</div>
                    ) : (
                        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                            {(["telegram", "whatsapp", "instagram", "manual"] as LeadSource[]).map(source => {
                                const count = leads.filter(l => l.source === source).length
                                const pct = totalLeads > 0 ? Math.round((count / totalLeads) * 100) : 0
                                return (
                                    <div key={source}>
                                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 4 }}>
                                            <span style={{ color: "#374151" }}>{SOURCE_LABELS[source]}</span>
                                            <span style={{ fontWeight: 600 }}>{count} ({pct}%)</span>
                                        </div>
                                        <div className="progress-bar">
                                            <div className="progress-bar__fill" style={{ width: `${pct}%` }} />
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    )}
                </div>

                <div className="g-card">
                    <h3 style={{ margin: "0 0 14px", fontSize: 15, fontWeight: 700 }}>SLA Мониторинг</h3>
                    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                        {[
                            { label: "Скорость первого ответа", val: "42 сек", ok: true },
                            { label: "Назначение риелтора", val: "1.5 мин", ok: true },
                            { label: "Время до первого контакта", val: "32 мин", ok: false },
                            { label: "Нагрузка на риелтора", val: "18 сделок", ok: true },
                        ].map((m) => (
                            <div key={m.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 13 }}>
                                <span style={{ color: "#374151" }}>{m.label}</span>
                                <span style={{ fontWeight: 600, color: m.ok ? "#10b981" : "#ef4444" }}>● {m.val}</span>
                            </div>
                        ))}
                    </div>
                    <button className="btn btn--primary btn--sm" style={{ marginTop: 14, width: "100%" }} onClick={() => navigate("/scoring")}>
                        Подробная аналитика →
                    </button>
                </div>
            </div>

            {/* Market insights */}
            <div className="g-card">
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                    <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700 }}>Аналитика рынка</h3>
                    <button className="btn btn--outline btn--sm" onClick={() => navigate("/scoring")}>Все инсайты</button>
                </div>
                <div className="grid-3">
                    {marketInsights.map((ins, i) => (
                        <div key={i} style={{ background: "#f9fafb", border: "1px solid #e5e7eb", borderRadius: 10, padding: 14 }}>
                            <div style={{ fontSize: 10, fontWeight: 700, color: "#3b82f6", textTransform: "uppercase", marginBottom: 8 }}>{ins.label}</div>
                            <div style={{ fontSize: 13, fontWeight: 600, color: "#111827", lineHeight: 1.4 }}>{ins.title}</div>
                            <span style={{ fontSize: 11, background: "#dbeafe", color: "#1d4ed8", padding: "2px 8px", borderRadius: 10, display: "inline-block", marginTop: 8 }}>{ins.tag}</span>
                        </div>
                    ))}
                </div>
            </div>
        </AppLayout>
    )
}