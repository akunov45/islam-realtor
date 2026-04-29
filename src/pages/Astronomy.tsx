import AppLayout from "../components/AppLayout"


export default function Astronomy() {
    return (
        <AppLayout title="Астрономические события" breadcrumbs={[{ label: "Начало", path: "/dashboard" }, { label: "Астрономические события" }]}>
            <div className="g-card">
                <h3 style={{ margin: "0 0 16px", fontSize: 15, fontWeight: 700 }}>Запланированные события</h3>
                <p style={{ color: "#6b7280", fontSize: 13 }}>Триггеры на основе расписания для периодических задач автоматизации CRM.</p>
                <table className="g-table" style={{ marginTop: 16 }}>
                    <thead><tr><th>Событие</th><th>Тип</th><th>Следующий запуск</th><th>Статус</th></tr></thead>
                    <tbody>
                        {[
                            ["Ежедневный AI-отчёт", "Ежедневно", "18 апр, 09:00", "Активно"],
                            ["Еженедельный SLA-анализ", "Еженедельно", "21 апр, 09:00", "Активно"],
                            ["Ежемесячный финансовый отчёт", "Ежемесячно", "1 мая, 10:00", "Активно"],
                            ["Реактивация лидов 30 дней", "Ежедневно", "18 апр, 10:00", "Активно"],
                        ].map(([n, t, next, s]) => (
                            <tr key={n}>
                                <td style={{ fontWeight: 600 }}>{n}</td>
                                <td>{t}</td>
                                <td style={{ color: "#6b7280" }}>{next}</td>
                                <td><span className="status-badge status-badge--done">{s}</span></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </AppLayout>
    )
}