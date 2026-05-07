import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import AppLayout from "../components/AppLayout"
import { leadsApi } from "../api/leads"
import { agentsApi } from "../api/agents"
import { dealsApi } from "../api/deals"
import { useAuth } from "../store/authStore"
import type { Lead, LeadSource } from "../types/api"
import type { AgentKPIBrief, TeamStats } from "../api/agents"
import type { Deal } from "../api/deals"

interface LeadStats {
  total: number; new: number; in_progress: number
  won: number; lost: number; hot: number; cold: number; avg_score: number
}

const SOURCE_LABELS: Record<LeadSource, string> = {
  telegram: "Telegram", whatsapp: "WhatsApp", instagram: "Instagram", manual: "Вручную",
}

const DEAL_STATUS_COLS: { status: string; label: string; color: string }[] = [
  { status: "new", label: "Новые", color: "var(--accent)" },
  { status: "in_progress", label: "В работе", color: "#f59e0b" },
  { status: "closed", label: "Закрытые", color: "#10b981" },
  { status: "failed", label: "Провалены", color: "#ef4444" },
]

function formatMoney(val?: string | number | null) {
  if (!val) return "—"
  const n = parseFloat(String(val))
  if (isNaN(n)) return "—"
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`
  return `$${n.toFixed(0)}`
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("ru-RU", { day: "numeric", month: "short" })
}

function ScoreBadge({ score }: { score?: number | null }) {
  if (score === undefined || score === null) return <span style={{ color: "var(--text-muted)" }}>—</span>
  const bg = score >= 70 ? "var(--score-high-bg)" : score >= 40 ? "var(--score-mid-bg)" : "var(--score-low-bg)"
  const color = score >= 70 ? "var(--score-high-text)" : score >= 40 ? "var(--score-mid-text)" : "var(--score-low-text)"
  return <span style={{ background: bg, color, padding: "2px 8px", borderRadius: 6, fontSize: 12, fontWeight: 700 }}>{score}</span>
}

function StatCard({ label, value, sub, trend, icon }: {
  label: string; value: string; sub?: string
  trend?: "up" | "down" | "neutral"; icon?: React.ReactNode
}) {
  const subColor = trend === "up" ? "var(--accent)" : trend === "down" ? "#ef4444" : "var(--text-muted)"
  return (
    <div className="stat-card" style={{
      backgroundColor: "var(--bg-tertiary)",
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div className="stat-card__label">{label}</div>
        {icon && (
          <div style={{ width: 36, height: 36, borderRadius: 10, background: "var(--accent-light)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--accent)", flexShrink: 0 }}>
            {icon}
          </div>
        )}
      </div>
      <div className="stat-card__value">{value}</div>
      {sub && <div style={{
        fontSize: 12,
        color: subColor,
        fontWeight: 500,
      }}>{sub}</div>}
    </div>
  )
}

export default function Dashboard() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [leadStats, setLeadStats] = useState<LeadStats | null>(null)
  const [teamStats, setTeamStats] = useState<TeamStats | null>(null)
  const [topAgents, setTopAgents] = useState<AgentKPIBrief[]>([])
  const [hotLeads, setHotLeads] = useState<Lead[]>([])
  const [deals, setDeals] = useState<Deal[]>([])
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState<"week" | "month" | "quarter" | "all">("month")

  const displayName = user?.first_name
    ? `${user.first_name}${user.last_name ? ` ${user.last_name}` : ''}`
    : user?.email ?? ''

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const [lStats, tStats, top, leadsRes, dealsRes] = await Promise.all([
          leadsApi.stats(), agentsApi.teamStats(),
          agentsApi.top({ period, limit: 5 }),
          leadsApi.list({ page: 1 }), dealsApi.list(),
        ])
        setLeadStats(lStats as LeadStats)
        setTeamStats(tStats)
        setTopAgents(top)
        setHotLeads(leadsRes.results.filter(l => (l.score ?? 0) >= 70).slice(0, 4))
        setDeals(dealsRes)
      } catch (e) { console.error(e) }
      finally { setLoading(false) }
    }
    load()
  }, [period])

  const dealsByStatus = DEAL_STATUS_COLS.reduce((acc, col) => {
    acc[col.status] = deals.filter(d => d.status === col.status)
    return acc
  }, {} as Record<string, Deal[]>)

  const convRate = leadStats && leadStats.total > 0
    ? ((leadStats.won / leadStats.total) * 100).toFixed(1) : "0"

  return (
    <AppLayout
      title={`Добро пожаловать, ${displayName}`}
      breadcrumbs={[{ label: "Дашборд" }]}
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
      {/* Stat Cards */}
      <div className="grid-4" style={{ marginBottom: 24 }}>
        <StatCard label="Всего лидов" value={loading ? "..." : String(leadStats?.total ?? 0)} sub={`Горячих: ${leadStats?.hot ?? 0}`} trend="neutral"
          icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" /></svg>} />
        <StatCard label="Новые лиды" value={loading ? "..." : String(leadStats?.new ?? 0)} sub="Ожидают обработки" trend="up"
          icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M5 12l7-7 7 7" /></svg>} />
        <StatCard label="Конверсия" value={loading ? "..." : `${convRate}%`} sub={`${leadStats?.won ?? 0} сделок закрыто`} trend="up"
          icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17" /><polyline points="16 7 22 7 22 13" /></svg>} />
        <StatCard label="Выручка команды" value={loading ? "..." : formatMoney(teamStats?.total_revenue)} sub={`${teamStats?.total_agents ?? 0} агентов · рейтинг ${teamStats?.avg_rating?.toFixed(1) ?? "—"}`} trend="up"
          icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" /></svg>} />
      </div>

      {/* Main grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 20, marginBottom: 24 }}>

        {/* Kanban */}
        <div className="g-card" style={{
          background: "var(--bg-tertiary)",
          borderColor: "var(--border-color)",
        }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
            <h2 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: "var(--text-primary)" }}>Воронка сделок</h2>
            <button className="btn btn--outline btn--sm" onClick={() => navigate("/deals")}>Все сделки →</button>
          </div>
          {loading ? (
            <div style={{ color: "var(--text-muted)", fontSize: 13, padding: 20, textAlign: "center" }}>Загрузка...</div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 10 }}>
              {DEAL_STATUS_COLS.map(col => {
                const colDeals = dealsByStatus[col.status] ?? []
                return (
                  <div key={col.status} style={{ background: "var(--bg-tertiary)", borderRadius: 10, padding: 10, border: "1px solid var(--border-color)" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                      <span style={{ fontSize: 11, fontWeight: 700, color: col.color, textTransform: "uppercase", letterSpacing: 0.5 }}>{col.label}</span>
                      <span style={{ background: "var(--bg-hover)", color: "var(--text-muted)", fontSize: 10, padding: "1px 7px", borderRadius: 10 }}>{colDeals.length}</span>
                    </div>
                    {colDeals.length === 0 ? (
                      <div style={{ fontSize: 12, color: "var(--text-muted)", textAlign: "center", padding: "10px 0" }}>Нет сделок</div>
                    ) : colDeals.slice(0, 4).map(deal => (
                      <div key={deal.id} onClick={() => navigate("/deals")} style={{ background: "var(--bg-card)", border: "1px solid var(--border-color)", borderRadius: 8, padding: 10, marginBottom: 6, cursor: "pointer" }}>
                        <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text-primary)", marginBottom: 3 }}>{deal.title || `Сделка #${deal.id}`}</div>
                        <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 6 }}>{deal.agent?.full_name || "—"}</div>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <span style={{ fontSize: 10, color: "var(--text-muted)" }}>{formatDate(deal.created_at)}</span>
                          <span style={{ fontSize: 12, fontWeight: 700, color: "var(--accent)" }}>{formatMoney(deal.price)}</span>
                        </div>
                      </div>
                    ))}
                    {colDeals.length > 4 && (
                      <div style={{ fontSize: 12, color: "var(--accent)", textAlign: "center", padding: "4px 0", cursor: "pointer" }} onClick={() => navigate("/deals")}>
                        +{colDeals.length - 4} ещё
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Right */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div className="g-card">
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
              <h3 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: "var(--text-primary)" }}>
                <span style={{ color: "#ef4444" }}>● </span>Горячие лиды
              </h3>
              <button className="btn btn--outline btn--sm" onClick={() => navigate("/leads")}>Все</button>
            </div>
            {loading ? <div style={{ fontSize: 12, color: "var(--text-muted)" }}>Загрузка...</div>
              : hotLeads.length === 0 ? <div style={{ fontSize: 12, color: "var(--text-muted)", textAlign: "center", padding: "12px 0" }}>Нет горячих лидов</div>
                : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    {hotLeads.map(lead => (
                      <div key={lead.id} onClick={() => navigate(`/leads/${lead.id}`)} style={{ padding: "10px 12px", borderRadius: 9, cursor: "pointer", background: "var(--bg-tertiary)", border: "1px solid var(--border-color)" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 3 }}>
                          <span style={{ fontWeight: 600, fontSize: 13, color: "var(--text-primary)" }}>{lead.full_name || "—"}</span>
                          <ScoreBadge score={lead.score ?? null} />
                        </div>
                        <div style={{ fontSize: 11, color: "var(--text-muted)" }}>
                          {SOURCE_LABELS[lead.source as LeadSource] ?? lead.source}{lead.phone && ` · ${lead.phone}`}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
          </div>

          <div className="g-card">
            <h3 style={{ margin: "0 0 12px", fontSize: 14, fontWeight: 700, color: "var(--text-primary)" }}>Статистика лидов</h3>
            {loading ? <div style={{ fontSize: 12, color: "var(--text-muted)" }}>Загрузка...</div>
              : (
                <div style={{ display: "flex", flexDirection: "column" }}>
                  {[
                    { label: "Средний score", value: leadStats?.avg_score?.toFixed(1) ?? "—", color: "var(--accent)" },
                    { label: "В работе", value: String(leadStats?.in_progress ?? 0), color: "#f59e0b" },
                    { label: "Горячих", value: String(leadStats?.hot ?? 0), color: "#ef4444" },
                    { label: "Холодных", value: String(leadStats?.cold ?? 0), color: "var(--text-muted)" },
                    { label: "Потеряно", value: String(leadStats?.lost ?? 0), color: "#ef4444" },
                  ].map((row, i, arr) => (
                    <div key={row.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 13, padding: "8px 0", borderBottom: i < arr.length - 1 ? "1px solid var(--border-light)" : "none" }}>
                      <span style={{ color: "var(--text-secondary)" }}>{row.label}</span>
                      <span style={{ fontWeight: 700, color: row.color }}>{row.value}</span>
                    </div>
                  ))}
                </div>
              )}
          </div>
        </div>
      </div>

      {/* Bottom grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>

        <div className="g-card " style={{ backgroundColor: "var(--bg-tertiary)" , borderColor: "var(--border-color)"}} >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
            <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: "var(--text-primary)" }}>Топ агентов</h3>
            <button className="btn btn--outline btn--sm" onClick={() => navigate("/agents")}>Все агенты →</button>
          </div>
          {loading ? <div style={{ fontSize: 13, color: "var(--text-muted)" }}>Загрузка...</div>
            : topAgents.length === 0 ? <div className="empty-state" style={{ padding: "20px 0" }}><div className="empty-state__text">Нет данных</div></div>
              : (
                <div style={{ display: "flex", flexDirection: "column" }}>
                  {topAgents.map((agent, i) => (
                    <div key={agent.agent_id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderBottom: i < topAgents.length - 1 ? "1px solid var(--border-light)" : "none" }}>
                      <div style={{ width: 30, height: 30, borderRadius: "50%", flexShrink: 0, background: i === 0 ? "linear-gradient(135deg,#0d9488,#14b8a6)" : "var(--bg-hover)", display: "flex", alignItems: "center", justifyContent: "center", color: i === 0 ? "white" : "var(--text-muted)", fontSize: 11, fontWeight: 700 }}>
                        {i === 0 ? "★" : i + 1}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{agent.full_name}</div>
                        <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{agent.department} · {agent.closed_deals} сделок</div>
                      </div>
                      <div style={{ textAlign: "right", flexShrink: 0 }}>
                        <div style={{ fontSize: 13, fontWeight: 700, color: "var(--accent)" }}>{formatMoney(agent.total_revenue)}</div>
                        <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{(agent.conversion_rate * 100).toFixed(1)}%</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
        </div>

        <div className="g-card" >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
            <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: "var(--text-primary)" }}>Статус лидов</h3>
            <button className="btn btn--outline btn--sm" onClick={() => navigate("/scoring")}>Аналитика →</button>
          </div>
          {loading ? <div style={{ fontSize: 13, color: "var(--text-muted)" }}>Загрузка...</div>
            : (
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {[
                  { label: "Новые", value: leadStats?.new ?? 0, color: "var(--accent)" },
                  { label: "В работе", value: leadStats?.in_progress ?? 0, color: "#f59e0b" },
                  { label: "Закрытые", value: leadStats?.won ?? 0, color: "#10b981" },
                  { label: "Потеряны", value: leadStats?.lost ?? 0, color: "#ef4444" },
                ].map(row => {
                  const pct = Math.round((row.value / (leadStats?.total || 1)) * 100)
                  return (
                    <div key={row.label}>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 5 }}>
                        <span style={{ color: "var(--text-secondary)", fontWeight: 500 }}>{row.label}</span>
                        <span style={{ fontWeight: 700, color: row.color }}>{row.value} <span style={{ color: "var(--text-muted)", fontWeight: 400 }}>({pct}%)</span></span>
                      </div>
                      <div className="progress-bar">
                        <div className="progress-bar__fill" style={{ width: `${pct}%`, background: row.color }} />
                      </div>
                    </div>
                  )
                })}
                {teamStats && (
                  <div style={{ marginTop: 4, padding: 14, background: "var(--bg-card)", borderRadius: 10, display: "flex", justifyContent: "space-between" }}>
                    <div>
                      <div style={{ fontSize: 11, color: "var(--accent-text)", fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 3 }}>Конверсия команды</div>
                      <div style={{ fontSize: 22, fontWeight: 800, color: "var(--accent)" }}>{(teamStats.avg_conversion_rate * 100).toFixed(1)}%</div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: 11, color: "var(--accent-text)", fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 3 }}>Агентов</div>
                      <div style={{ fontSize: 22, fontWeight: 800, color: "var(--accent)" }}>{teamStats.total_agents}</div>
                    </div>
                  </div>
                )}
              </div>
            )}
        </div>
      </div>
    </AppLayout>
  )
}