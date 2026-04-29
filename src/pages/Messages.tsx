import AppLayout from "../components/AppLayout"

export default function Messages() {
    return (
        <AppLayout title="Сообщения" breadcrumbs={[{ label: "Начало", path: "/dashboard" }, { label: "Сообщения" }]}>
            <div className="g-card" style={{ textAlign: "center", padding: "60px 20px" }}>
                <div style={{ fontSize: 48, marginBottom: 16 }}>✉️</div>
                <h2 style={{ margin: "0 0 8px", color: "#111827" }}>Центр сообщений</h2>
                <p style={{ color: "#6b7280", fontSize: 14, margin: "0 0 20px" }}>Все входящие и исходящие сообщения из всех каналов собраны здесь</p>
                <button className="btn btn--primary">Перейти к диалогам</button>
            </div>
        </AppLayout>
    )
}

export function Crontab() {
    const tasks = [
        { name: "AI квалификация лидов", schedule: "*/5 * * * *", last: "09:10", status: "ok" },
        { name: "SLA контроль (эскалации)", schedule: "*/5 * * * *", last: "09:10", status: "ok" },
        { name: "Lalafo polling", schedule: "*/5 * * * *", last: "09:05", status: "ok" },
        { name: "Еженедельный отчёт", schedule: "0 9 * * MON", last: "14 апр, 09:00", status: "ok" },
        { name: "Реактивация холодных лидов", schedule: "0 10 * * *", last: "17 апр, 10:00", status: "ok" },
        { name: "Синхронизация Google Sheets", schedule: "0 * * * *", last: "09:00", status: "warning" },
    ]
    return (
        <AppLayout title="Crontab" breadcrumbs={[{ label: "Начало", path: "/dashboard" }, { label: "Crontab" }]}>
            <div className="g-card" style={{ padding: 0 }}>
                <table className="g-table">
                    <thead><tr><th>Задача</th><th>Расписание</th><th>Последний запуск</th><th>Статус</th><th>Действие</th></tr></thead>
                    <tbody>
                        {tasks.map(t => (
                            <tr key={t.name}>
                                <td style={{ fontWeight: 600 }}>{t.name}</td>
                                <td><code style={{ background: "#f3f4f6", padding: "2px 6px", borderRadius: 4, fontSize: 12 }}>{t.schedule}</code></td>
                                <td style={{ color: "#6b7280" }}>{t.last}</td>
                                <td><span className={`status-badge ${t.status === "ok" ? "status-badge--done" : "status-badge--progress"}`}>{t.status === "ok" ? "✓ Активна" : "⚠ Предупреждение"}</span></td>
                                <td><button className="btn btn--outline btn--sm">▶ Запустить</button></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </AppLayout>
    )
}
