import AppLayout from "../components/AppLayout"
import { useState } from "react"

export default function Settings() {
    const [activeTab, setActiveTab] = useState<"general" | "ai" | "sla" | "integrations" | "team">("general")
    const [toast, setToast] = useState("")
    const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(""), 2500) }

    const realtors = [
        { id: 1, name: "Анна", email: "anna@realtor.kg", role: "Старший риелтор", deals: 8, active: true },
        { id: 2, name: "Олег", email: "oleg@realtor.kg", role: "Риелтор", deals: 12, active: true },
        { id: 3, name: "Мария", email: "maria@realtor.kg", role: "Риелтор", deals: 6, active: true },
    ]

    return (
        <AppLayout title="Настройки" breadcrumbs={[{ label: "Начало", path: "/dashboard" }, { label: "Настройки" }]}>
            <div className="tabs">
                {([["general", "Общие"], ["ai", "AI настройки"], ["sla", "SLA"], ["integrations", "Интеграции"], ["team", "Команда"]] as const).map(([k, l]) => (
                    <button key={k} className={`tab-btn ${activeTab === k ? "tab-btn--active" : ""}`} onClick={() => setActiveTab(k)}>{l}</button>
                ))}
            </div>

            {activeTab === "general" && (
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
                    <div className="g-card">
                        <h3 style={{ margin: "0 0 16px", fontSize: 15, fontWeight: 700 }}>Информация об агентстве</h3>
                        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                            {[["Название агентства", "RealtorAiSystem"], ["Email", "admin@realtor.kg"], ["Телефон", "+996 312 000 000"], ["Адрес", "Бишкек, ул. Московская 123"]].map(([l, v]) => (
                                <div className="form-group" key={l}>
                                    <label className="form-label">{l}</label>
                                    <input className="form-input" defaultValue={v} />
                                </div>
                            ))}
                            <button className="btn btn--primary" onClick={() => showToast("Настройки сохранены")}>Сохранить</button>
                        </div>
                    </div>
                    <div className="g-card">
                        <h3 style={{ margin: "0 0 16px", fontSize: 15, fontWeight: 700 }}>Уведомления</h3>
                        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                            {["Уведомления о новых лидах", "SLA нарушения", "Еженедельный отчёт", "Email-дайджест", "Push-уведомления"].map(label => (
                                <label key={label} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 13 }}>
                                    <span style={{ color: "#374151" }}>{label}</span>
                                    <input type="checkbox" defaultChecked style={{ width: 16, height: 16 }} />
                                </label>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {activeTab === "ai" && (
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
                    <div className="g-card">
                        <h3 style={{ margin: "0 0 16px", fontSize: 15, fontWeight: 700 }}>AI Скоринг</h3>
                        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                            <div className="form-group">
                                <label className="form-label">Порог «Горячий» лид</label>
                                <input className="form-input" type="number" defaultValue={70} min={0} max={100} />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Порог «Холодный» лид</label>
                                <input className="form-input" type="number" defaultValue={40} min={0} max={100} />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Модель AI</label>
                                <select className="form-select">
                                    <option>GPT-4o (рекомендуется)</option>
                                    <option>GPT-4o-mini (экономичный)</option>
                                    <option>GPT-3.5-turbo (быстрый)</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label className="form-label">OpenAI API Key</label>
                                <input className="form-input" type="password" placeholder="sk-..." />
                            </div>
                            <button className="btn btn--primary" onClick={() => showToast("AI настройки сохранены")}>Сохранить</button>
                        </div>
                    </div>
                    <div className="g-card">
                        <h3 style={{ margin: "0 0 16px", fontSize: 15, fontWeight: 700 }}>Системный промпт</h3>
                        <div className="form-group">
                            <label className="form-label">Промпт квалификации</label>
                            <textarea className="form-textarea" style={{ minHeight: 160, fontSize: 12, fontFamily: "monospace" }}
                                defaultValue={`Ты — эксперт по недвижимости и квалификации клиентов.\nТвоя задача — проанализировать входящее обращение\nи вернуть JSON без лишнего текста.`}
                            />
                        </div>
                        <button className="btn btn--outline btn--sm" onClick={() => showToast("Промпт обновлён")}>Обновить промпт</button>
                    </div>
                </div>
            )}

            {activeTab === "sla" && (
                <div className="g-card">
                    <h3 style={{ margin: "0 0 16px", fontSize: 15, fontWeight: 700 }}>Параметры SLA</h3>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                        {[
                            ["Макс. время первого ответа (мин)", "1"],
                            ["Назначение риелтора (мин)", "2"],
                            ["Первый контакт (мин)", "15"],
                            ["Эскалация к РОПу (мин)", "30"],
                            ["Эскалация к директору (мин)", "60"],
                            ["Макс. лидов на риелтора", "15"],
                        ].map(([l, v]) => (
                            <div className="form-group" key={l}>
                                <label className="form-label">{l}</label>
                                <input className="form-input" type="number" defaultValue={v} />
                            </div>
                        ))}
                    </div>
                    <button className="btn btn--primary" style={{ marginTop: 16 }} onClick={() => showToast("SLA настройки сохранены")}>Сохранить</button>
                </div>
            )}

            {activeTab === "integrations" && (
                <div className="grid-2">
                    {[
                        { name: "Instagram Meta API", status: true, desc: "Получение DM и комментариев через Meta Graph API" },
                        { name: "WhatsApp Business API", status: true, desc: "Интеграция через 360dialog для входящих сообщений" },
                        { name: "Telegram Bot", status: true, desc: "Приём заявок через Telegram-бота" },
                        { name: "Lalafo Parser", status: false, desc: "Polling парсинг объявлений каждые 5 минут" },
                        { name: "amoCRM", status: true, desc: "Основная CRM — контакты, сделки, задачи" },
                        { name: "Make.com (n8n)", status: true, desc: "Слой автоматизации workflow" },
                        { name: "Google Sheets", status: false, desc: "Дашборд директора и аналитика" },
                        { name: "OpenAI API", status: true, desc: "AI-квалификация и скоринг лидов" },
                    ].map(int => (
                        <div className="g-card" key={int.name}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                                <div style={{ fontWeight: 700, fontSize: 14, color: "#111827" }}>{int.name}</div>
                                <span style={{ fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 20, background: int.status ? "#dcfce7" : "#fee2e2", color: int.status ? "#16a34a" : "#dc2626" }}>
                                    {int.status ? "Активна" : "Отключена"}
                                </span>
                            </div>
                            <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 12 }}>{int.desc}</div>
                            <button className={`btn btn--sm ${int.status ? "btn--outline" : "btn--primary"}`} onClick={() => showToast(int.status ? `${int.name} отключена` : `${int.name} включена`)}>
                                {int.status ? "Отключить" : "Подключить"}
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {activeTab === "team" && (
                <div className="g-card">
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
                        <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700 }}>Команда риелторов</h3>
                        <button className="btn btn--primary btn--sm" onClick={() => showToast("Приглашение отправлено")}>+ Пригласить</button>
                    </div>
                    <table className="g-table">
                        <thead>
                            <tr><th>Имя</th><th>Email</th><th>Роль</th><th>Сделок</th><th>Статус</th><th>Действия</th></tr>
                        </thead>
                        <tbody>
                            {realtors.map(r => (
                                <tr key={r.id}>
                                    <td style={{ fontWeight: 600 }}>{r.name}</td>
                                    <td style={{ color: "#6b7280" }}>{r.email}</td>
                                    <td>{r.role}</td>
                                    <td>{r.deals}</td>
                                    <td><span className={`status-badge ${r.active ? "status-badge--done" : "status-badge--cold"}`}>{r.active ? "Активен" : "Неактивен"}</span></td>
                                    <td>
                                        <button className="btn btn--outline btn--sm" onClick={() => showToast(`Права ${r.name} изменены`)}>Изменить</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {toast && <div className="toast toast--success">✓ {toast}</div>}
        </AppLayout>
    )
}