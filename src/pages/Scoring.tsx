import AppLayout from "../components/AppLayout"

const kpiRows = [
    { metric: "Скорость первого ответа", current: "42 сек", target: "< 1 минута", red: "> 5 минут", tool: "amoCRM + Make", ok: true },
    { metric: "Скорость назначения риелтора", current: "1.5 мин", target: "< 2 минуты", red: "> 10 минут", tool: "amoCRM", ok: true },
    { metric: "Время до первого контакта", current: "32 мин", target: "< 15 минут", red: "> 30 минут", tool: "amoCRM SLA", ok: false },
    { metric: "Конверсия лид → показ", current: "28.4%", target: "> 25%", red: "< 15%", tool: "amoCRM Pipeline", ok: true },
    { metric: "Конверсия показ → сделка", current: "32.1%", target: "> 30%", red: "< 15%", tool: "amoCRM Pipeline", ok: true },
    { metric: "Конверсия лид → сделка", current: "9.2%", target: "> 8%", red: "< 4%", tool: "amoCRM Pipeline", ok: true },
    { metric: "Нагрузка на риелтора", current: "18 сделок", target: "< 15 сделок", red: "> 25 сделок", tool: "amoCRM", ok: false },
    { metric: "SLA нарушения в неделю", current: "3.8%", target: "< 5%", red: "> 15%", tool: "Google Sheets", ok: true },
    { metric: "Потерянные лиды без ответа", current: "1.2%", target: "< 2%", red: "> 5%", tool: "amoCRM + Sheets", ok: true },
]

const financialKpis = [
    { label: "CPL", desc: "Стоимость лида", value: "482 сом", target: "< 500", icon: "📊", ok: true },
    { label: "CPV", desc: "Стоимость показа", value: "2 140 сом", target: "< 2 000", icon: "📉", ok: false },
    { label: "CPA", desc: "Стоимость сделки", value: "5 820 сом", target: "< 6 000", icon: "💰", ok: true },
    { label: "Выручка/риелтор", desc: "Рост MoM", value: "+22%", target: "> 20%", icon: "👤", ok: true },
    { label: "ROI автоматизации", desc: "Эффективность", value: "412%", target: "> 300%", icon: "🚀", ok: true },
]

const scoreDistribution = [
    { label: "Горячий (>70)", count: 8, color: "#10b981", pct: 40 },
    { label: "Тёплый (40–70)", count: 7, color: "#f59e0b", pct: 35 },
    { label: "Холодный (<40)", count: 5, color: "#ef4444", pct: 25 },
]

const sourceSplit = [
    { label: "Instagram", count: 12, pct: 40 },
    { label: "Telegram", count: 8, pct: 27 },
    { label: "WhatsApp", count: 5, pct: 17 },
    { label: "Lalafo", count: 3, pct: 10 },
    { label: "Website", count: 2, pct: 6 },
]

export default function Scoring() {
    return (
        <AppLayout
            title="Скоринг лидов"
            breadcrumbs={[{ label: "Начало", path: "/dashboard" }, { label: "Скоринг лидов" }]}
        >
            {/* Financial KPIs */}
            <div className="grid-5" style={{ marginBottom: 24 }}>
                {financialKpis.map((k) => (
                    <div className="stat-card" key={k.label}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                            <div>
                                <div className="stat-card__label">{k.label}</div>
                                <div className="stat-card__value" style={{ fontSize: 22 }}>{k.value}</div>
                                <div className={`stat-card__sub stat-card__sub--${k.ok ? "up" : "down"}`}>
                                    Цель: {k.target}
                                </div>
                            </div>
                            <span style={{ fontSize: 20 }}>{k.icon}</span>
                        </div>
                        <div style={{ fontSize: 11, color: "#9ca3af" }}>{k.desc}</div>
                    </div>
                ))}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 24 }}>
                {/* Score distribution */}
                <div className="g-card">
                    <h3 style={{ margin: "0 0 16px", fontSize: 15, fontWeight: 700 }}>Распределение по Score</h3>
                    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                        {scoreDistribution.map((s) => (
                            <div key={s.label}>
                                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 6 }}>
                                    <span style={{ fontWeight: 600, color: "#374151" }}>{s.label}</span>
                                    <span style={{ fontWeight: 700, color: s.color }}>{s.count} лидов</span>
                                </div>
                                <div className="progress-bar">
                                    <div className="progress-bar__fill" style={{ width: `${s.pct}%`, background: s.color }} />
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="ai-block" style={{ marginTop: 16 }}>
                        <div className="ai-block__label">🤖 AI Инсайт</div>
                        <div className="ai-block__text">40% лидов — горячие. Рекомендуется увеличить скорость обработки для score &gt; 70, чтобы не терять конверсию.</div>
                    </div>
                </div>

                {/* Source split */}
                <div className="g-card">
                    <h3 style={{ margin: "0 0 16px", fontSize: 15, fontWeight: 700 }}>Лиды по источникам</h3>
                    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                        {sourceSplit.map((s) => (
                            <div key={s.label}>
                                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 4 }}>
                                    <span style={{ fontWeight: 500 }}>{s.label}</span>
                                    <span style={{ color: "#6b7280" }}>{s.count} ({s.pct}%)</span>
                                </div>
                                <div className="progress-bar">
                                    <div className="progress-bar__fill" style={{ width: `${s.pct}%` }} />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* SLA table */}
            <div className="g-card">
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                    <div>
                        <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>SLA и операционный поток</h3>
                        <p style={{ margin: "4px 0 0", fontSize: 13, color: "#6b7280" }}>Мониторинг критических точек от генерации лида до заключения сделки.</p>
                    </div>
                    <div style={{ display: "flex", gap: 8 }}>
                        <button className="btn btn--outline btn--sm">📥 Экспорт CSV</button>
                        <button className="btn btn--primary btn--sm">Все каналы</button>
                    </div>
                </div>
                <table className="g-table">
                    <thead>
                        <tr>
                            <th>Метрика</th>
                            <th>Текущий показатель</th>
                            <th>Цель</th>
                            <th>Красный</th>
                            <th>Инструмент</th>
                        </tr>
                    </thead>
                    <tbody>
                        {kpiRows.map((row) => (
                            <tr key={row.metric}>
                                <td style={{ fontWeight: 600 }}>{row.metric}</td>
                                <td>
                                    <span style={{ color: row.ok ? "#10b981" : "#ef4444", fontWeight: 600 }}>
                                        ● {row.current}
                                    </span>
                                </td>
                                <td><span style={{ background: "#dcfce7", color: "#16a34a", padding: "2px 8px", borderRadius: 6, fontSize: 12 }}>{row.target}</span></td>
                                <td><span style={{ background: "#fee2e2", color: "#dc2626", padding: "2px 8px", borderRadius: 6, fontSize: 12 }}>{row.red}</span></td>
                                <td><span style={{ background: "#f3f4f6", color: "#374151", padding: "2px 8px", borderRadius: 6, fontSize: 11 }}>{row.tool}</span></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* AI insight block */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginTop: 20 }}>
                <div style={{ background: "#1e40af", borderRadius: 12, padding: 24, color: "white" }}>
                    <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5, color: "#93c5fd", marginBottom: 10 }}>Анализ рыночных настроений</div>
                    <h3 style={{ margin: "0 0 12px", fontSize: 20, fontWeight: 800, lineHeight: 1.3 }}>
                        Движок автоматизации сокращает конверсию из лида в показ на 12 дней.
                    </h3>
                    <p style={{ fontSize: 13, color: "#bfdbfe", margin: "0 0 16px", lineHeight: 1.6 }}>
                        Наша текущая интеграция amoCRM + Make эффективно устранила задержки при ручном назначении, выведя ROI на рекордный уровень в этом квартале.
                    </p>
                    <button className="btn btn--outline" style={{ background: "rgba(255,255,255,0.15)", borderColor: "rgba(255,255,255,0.3)", color: "white" }}>
                        Посмотреть воронку
                    </button>
                </div>

                <div className="g-card">
                    <h3 style={{ margin: "0 0 12px", fontSize: 15, fontWeight: 700, display: "flex", alignItems: "center", gap: 6 }}>
                        🏆 Лучший регион по показателям
                    </h3>
                    <div style={{ padding: "20px", background: "#f9fafb", borderRadius: 10, textAlign: "center" }}>
                        <div style={{ fontSize: 18, fontWeight: 800, color: "#111827", marginBottom: 4 }}>Бишкек, Центральный район</div>
                        <div style={{ fontSize: 13, color: "#10b981", fontWeight: 600 }}>↗ На 14.2% выше среднего</div>
                        <div style={{ marginTop: 12, fontSize: 12, color: "#6b7280" }}>
                            Конверсия лид→сделка: 11.4% | Средний чек: $1.1M
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    )
}
