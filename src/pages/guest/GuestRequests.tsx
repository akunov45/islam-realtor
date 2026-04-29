import GuestLayout from './GuestLayout'

const requests = [
    { id: 1, title: 'Покупка квартиры', status: 'В работе', date: '21 апр 2026', agent: 'Анна Сейткали', budget: '$800K – $1.5M', rooms: '2-3 комнаты', district: 'Центр, Джал' },
    { id: 2, title: 'Аренда офиса', status: 'Новая', date: '23 апр 2026', agent: 'Не назначен', budget: '$1000/мес', rooms: '50-80 м²', district: 'Центр' },
]

const statusColor: Record<string, string> = {
    'В работе': '#ccfbf1',
    'Новая': '#dbeafe',
    'Закрыта': '#f1f5f9',
}

const statusText: Record<string, string> = {
    'В работе': '#0f766e',
    'Новая': '#1d4ed8',
    'Закрыта': '#64748b',
}

export default function GuestRequests() {
    return (
        <GuestLayout>
            <div className="gp-body">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                    <div>
                        <h1 style={{ fontSize: 22, fontWeight: 800, color: '#0f172a', marginBottom: 4 }}>Мои заявки</h1>
                        <p style={{ fontSize: 13, color: '#64748b' }}>Все ваши заявки и их статус</p>
                    </div>
                    <button className="gp-btn gp-btn--primary">+ Новая заявка</button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    {requests.map(r => (
                        <div key={r.id} className="gp-card">
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                    <div style={{ width: 42, height: 42, borderRadius: 11, background: '#f0fdfa', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0d9488" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/></svg>
                                    </div>
                                    <div>
                                        <div style={{ fontSize: 15, fontWeight: 700, color: '#0f172a' }}>#{r.id} — {r.title}</div>
                                        <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>Создана {r.date}</div>
                                    </div>
                                </div>
                                <span style={{ background: statusColor[r.status], color: statusText[r.status], padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 600 }}>
                                    {r.status}
                                </span>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, padding: '12px 0', borderTop: '1px solid #f0fdfa' }}>
                                {[
                                    { label: 'Агент', value: r.agent },
                                    { label: 'Бюджет', value: r.budget },
                                    { label: 'Район', value: r.district },
                                ].map(f => (
                                    <div key={f.label}>
                                        <div style={{ fontSize: 11, color: '#94a3b8', marginBottom: 3 }}>{f.label}</div>
                                        <div style={{ fontSize: 13, fontWeight: 600, color: '#0f172a' }}>{f.value}</div>
                                    </div>
                                ))}
                            </div>
                            <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                                <button className="gp-btn gp-btn--outline gp-btn--sm">Подробнее</button>
                                <button className="gp-btn gp-btn--primary gp-btn--sm">Написать агенту</button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </GuestLayout>
    )
}
