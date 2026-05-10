import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import AppLayout from "../components/AppLayout"
import { useAuth } from "../store/authStore"
import { api } from "../api/client"

// ─── Types ────────────────────────────────────────────────────────────────────

interface TopAgent {
  id: number
  full_name: string
  rating: number
}

interface DashboardSummary {
  role: string
  period: string
  leads: {
    total: number; new: number; in_progress: number
    won: number; lost: number; hot: number
    avg_score: number; trend: string | null
  }
  deals: {
    total: number; closed: number; in_progress: number
    total_revenue: string; avg_commission: string
  }
  tasks: {
    total: number; overdue: number; due_today: number; completed_this_week: number
  }
  agents: {
    total: number; active: number; top_agent: TopAgent | null
  }
  recent_activity: {
    type: string; lead_id: number | null; lead_name: string | null
    deal_id: number | null; amount: string | null; timestamp: string
  }[]
  cached_at: string
  cache_ttl_seconds: number
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatMoney(val?: string | number | null) {
  if (!val) return "—"
  const n = parseFloat(String(val))
  if (isNaN(n) || n === 0) return "—"
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`
  return `$${n.toFixed(0)}`
}

function formatTime(iso: string) {
  const d = new Date(iso)
  const diff = Date.now() - d.getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return "только что"
  if (mins < 60) return `${mins} мин назад`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs} ч назад`
  return d.toLocaleDateString("ru-RU", { day: "numeric", month: "short" })
}

const ACTIVITY_LABELS: Record<string, { label: string; color: string; icon: string }> = {
  lead_created: { label: "Новый лид", color: "var(--accent)", icon: "👤" },
  lead_status_changed: { label: "Статус лида", color: "#f59e0b", icon: "🔄" },
  deal_created: { label: "Новая сделка", color: "#10b981", icon: "📋" },
  deal_closed: { label: "Сделка закрыта", color: "#10b981", icon: "✅" },
  task_completed: { label: "Задача выполнена", color: "var(--accent)", icon: "☑️" },
  agent_assigned: { label: "Назначен агент", color: "#f59e0b", icon: "👔" },
}

// ─── Stat Card ────────────────────────────────────────────────────────────────

function StatCard({ label, value, sub, subColor, icon }: {
  label: string; value: string; sub?: string; subColor?: string; icon?: React.ReactNode
}) {
  return (
    <div className="stat-card">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div className="stat-card__label">{label}</div>
        {icon && (
          <div style={{ width: 36, height: 36, borderRadius: 10, background: "var(--accent-light)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--accent)", flexShrink: 0 }}>
            {icon}
          </div>
        )}
      </div>
      <div className="stat-card__value">{value}</div>
      {sub && <div style={{ fontSize: 12, color: subColor ?? "var(--text-muted)", fontWeight: 500, marginTop: 2 }}>{sub}</div>}
    </div>
  )
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function Dashboard() {
  const navigate = useNavigate()
  const { user } = useAuth()

  const [summary, setSummary] = useState<DashboardSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState<"day" | "week" | "month" | "quarter">("month")

  const displayName = user?.first_name
    ? `${user.first_name}${user.last_name ? ` ${user.last_name}` : ''}`
    : user?.email ?? ''

  const load = async () => {
    setLoading(true)
    try {
      const { data } = await api.get('/api/v2/dashboard/summary/', { params: { period } })
      setSummary(data)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [period])

  const leads = summary?.leads
  const deals = summary?.deals
  const tasks = summary?.tasks
  const agents = summary?.agents

  const convRate = leads && leads.total > 0
    ? ((leads.won / leads.total) * 100).toFixed(1) : "0"

  return (
    <AppLayout
      title={`Добро пожаловать, ${displayName}`}
      breadcrumbs={[{ label: "Дашборд" }]}
      actions={
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          {summary?.cached_at && (
            <span style={{ fontSize: 11, color: "var(--text-muted)" }}>
              Обновлено {formatTime(summary.cached_at)}
            </span>
          )}
          <select className="form-select" style={{ width: 140, height: 34, fontSize: 13 }}
            value={period} onChange={e => setPeriod(e.target.value as typeof period)}>
            <option value="day">День</option>
            <option value="week">Неделя</option>
            <option value="month">Месяц</option>
            <option value="quarter">Квартал</option>
          </select>
          <button className="btn btn--outline btn--sm" onClick={load}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="23 4 23 10 17 10" />
              <path d="M20.49 15a9 9 0 11-2.12-9.36L23 10" strokeLinecap="round" />
            </svg>
          </button>
        </div>
      }
    >
      {/* ── Leads Stats ── */}
      <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 10 }}>
        Лиды
      </div>
      <div className="grid-4" style={{ marginBottom: 24 }}>
        <StatCard label="Всего лидов" value={loading ? "..." : String(leads?.total ?? 0)}
          sub={leads?.trend ? `Тренд: ${leads.trend}` : `Горячих: ${leads?.hot ?? 0}`}
          icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" /></svg>} />
        <StatCard label="Новые" value={loading ? "..." : String(leads?.new ?? 0)}
          sub="Ожидают обработки" subColor="var(--accent)"
          icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M5 12l7-7 7 7" /></svg>} />
        <StatCard label="В работе" value={loading ? "..." : String(leads?.in_progress ?? 0)}
          sub={`Средний score: ${leads?.avg_score?.toFixed(1) ?? "—"}`}
          icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>} />
        <StatCard label="Конверсия" value={loading ? "..." : `${convRate}%`}
          sub={`${leads?.won ?? 0} закрыто · ${leads?.lost ?? 0} потеряно`} subColor="#10b981"
          icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17" /><polyline points="16 7 22 7 22 13" /></svg>} />
      </div>

      {/* ── Deals + Tasks + Agents Stats ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, marginBottom: 24 }}>

        {/* Deals */}
        <div className="g-card">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
            <h3 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: "var(--text-primary)" }}>Сделки</h3>
            <button className="btn btn--outline btn--sm" onClick={() => navigate("/deals")}>Все →</button>
          </div>
          {[
            { label: "Всего", value: String(deals?.total ?? 0), color: "var(--text-primary)" },
            { label: "В работе", value: String(deals?.in_progress ?? 0), color: "#f59e0b" },
            { label: "Закрытых", value: String(deals?.closed ?? 0), color: "#10b981" },
            { label: "Выручка", value: formatMoney(deals?.total_revenue), color: "var(--accent)" },
            { label: "Ср. комиссия", value: formatMoney(deals?.avg_commission), color: "#10b981" },
          ].map((row, i, arr) => (
            <div key={row.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 13, padding: "7px 0", borderBottom: i < arr.length - 1 ? "1px solid var(--border-light)" : "none" }}>
              <span style={{ color: "var(--text-secondary)" }}>{row.label}</span>
              <span style={{ fontWeight: 700, color: row.color }}>{loading ? "..." : row.value}</span>
            </div>
          ))}
        </div>

        {/* Tasks */}
        <div className="g-card">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
            <h3 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: "var(--text-primary)" }}>Задачи</h3>
            <button className="btn btn--outline btn--sm" onClick={() => navigate("/tasks")}>Все →</button>
          </div>
          {[
            { label: "Всего", value: String(tasks?.total ?? 0), color: "var(--text-primary)" },
            { label: "Просрочено", value: String(tasks?.overdue ?? 0), color: "#ef4444" },
            { label: "На сегодня", value: String(tasks?.due_today ?? 0), color: "#f59e0b" },
            { label: "Выполнено за неделю", value: String(tasks?.completed_this_week ?? 0), color: "#10b981" },
          ].map((row, i, arr) => (
            <div key={row.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 13, padding: "7px 0", borderBottom: i < arr.length - 1 ? "1px solid var(--border-light)" : "none" }}>
              <span style={{ color: "var(--text-secondary)" }}>{row.label}</span>
              <span style={{ fontWeight: 700, color: row.color }}>{loading ? "..." : row.value}</span>
            </div>
          ))}
          {!loading && (tasks?.overdue ?? 0) > 0 && (
            <div style={{ marginTop: 10, padding: "8px 12px", background: "var(--badge-err-bg)", borderRadius: 8, fontSize: 12, color: "var(--badge-err-text)", fontWeight: 600 }}>
              ⚠ {tasks?.overdue} просроченных задач
            </div>
          )}
        </div>

        {/* Agents */}
        <div className="g-card">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
            <h3 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: "var(--text-primary)" }}>Агенты</h3>
            <button className="btn btn--outline btn--sm" onClick={() => navigate("/agents")}>Все →</button>
          </div>
          {[
            { label: "Всего", value: String(agents?.total ?? 0), color: "var(--text-primary)" },
            { label: "Активных", value: String(agents?.active ?? 0), color: "var(--accent)" },
          ].map((row, i, arr) => (
            <div key={row.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 13, padding: "7px 0", borderBottom: i < arr.length - 1 ? "1px solid var(--border-light)" : "none" }}>
              <span style={{ color: "var(--text-secondary)" }}>{row.label}</span>
              <span style={{ fontWeight: 700, color: row.color }}>{loading ? "..." : row.value}</span>
            </div>
          ))}
          {agents?.top_agent && (
            <div style={{ marginTop: 12, padding: "10px 12px", background: "var(--accent-light)", borderRadius: 10 }}>
              <div style={{ fontSize: 10, color: "var(--accent-text)", fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 6 }}>Топ агент</div>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 32, height: 32, borderRadius: "50%", background: "linear-gradient(135deg,#0d9488,#14b8a6)", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, flexShrink: 0 }}>
                  {agents.top_agent.full_name?.charAt(0) ?? "?"}
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)" }}>{agents.top_agent.full_name}</div>
                  <div style={{ fontSize: 11, color: "var(--accent)" }}>★ {agents.top_agent.rating?.toFixed(1)}</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Leads distribution + Recent activity ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>

        {/* Leads distribution */}
        <div className="g-card">
          <h3 style={{ margin: "0 0 16px", fontSize: 15, fontWeight: 700, color: "var(--text-primary)" }}>
            Распределение лидов
          </h3>
          {loading ? (
            <div style={{ color: "var(--text-muted)", fontSize: 13 }}>Загрузка...</div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {[
                { label: "Новые", value: leads?.new ?? 0, color: "var(--accent)" },
                { label: "В работе", value: leads?.in_progress ?? 0, color: "#f59e0b" },
                { label: "Горячие", value: leads?.hot ?? 0, color: "#ef4444" },
                { label: "Закрытые", value: leads?.won ?? 0, color: "#10b981" },
                { label: "Потеряны", value: leads?.lost ?? 0, color: "var(--text-muted)" },
              ].map(row => {
                const total = leads?.total || 1
                const pct = Math.round((row.value / total) * 100)
                return (
                  <div key={row.label}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 4 }}>
                      <span style={{ color: "var(--text-secondary)", fontWeight: 500 }}>{row.label}</span>
                      <span style={{ fontWeight: 700, color: row.color }}>
                        {row.value} <span style={{ color: "var(--text-muted)", fontWeight: 400 }}>({pct}%)</span>
                      </span>
                    </div>
                    <div className="progress-bar">
                      <div className="progress-bar__fill" style={{ width: `${pct}%`, background: row.color }} />
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Recent activity */}
        <div className="g-card">
          <h3 style={{ margin: "0 0 16px", fontSize: 15, fontWeight: 700, color: "var(--text-primary)" }}>
            Последние события
          </h3>
          {loading ? (
            <div style={{ color: "var(--text-muted)", fontSize: 13 }}>Загрузка...</div>
          ) : !summary?.recent_activity?.length ? (
            <div className="empty-state" style={{ padding: "20px 0" }}>
              <div className="empty-state__text">Нет активности</div>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
              {summary.recent_activity.slice(0, 8).map((item, i, arr) => {
                const meta = ACTIVITY_LABELS[item.type] ?? { label: item.type, color: "var(--text-muted)", icon: "📌" }
                return (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "9px 0", borderBottom: i < arr.length - 1 ? "1px solid var(--border-light)" : "none" }}>
                    <div style={{ width: 32, height: 32, borderRadius: "50%", background: "var(--bg-hover)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, flexShrink: 0 }}>
                      {meta.icon}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>
                        {meta.label}
                        {item.lead_name && (
                          <span
                            style={{ color: "var(--accent)", cursor: item.lead_id ? "pointer" : "default", marginLeft: 4 }}
                            onClick={() => item.lead_id && navigate(`/leads/${item.lead_id}`)}
                          >
                            — {item.lead_name}
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 1 }}>
                        {formatTime(item.timestamp)}
                        {item.amount && ` · ${formatMoney(item.amount)}`}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  )
}