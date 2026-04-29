import GuestLayout from './GuestLayout'

const properties = [
    { rooms: '3-к', title: 'ЖК Рассвет', desc: '3-комн. кв., 85 м²', area: 'Бишкек, ул. Манаса', price: '$1 200 000', badge: 'Рекомендовано' },
    { rooms: '2-к', title: 'ЖК Асман', desc: '2-комн. кв., 65 м²', area: 'Бишкек, мкр. Джал', price: '$850 000', badge: '' },
    { rooms: '4-к', title: 'ЖК Элит', desc: '4-комн. кв., 120 м²', area: 'Бишкек, ул. Токомбаева', price: '$1 800 000', badge: '' },
    { rooms: '1-к', title: 'ЖК Манас', desc: '1-комн. кв., 42 м²', area: 'Бишкек, центр', price: '$520 000', badge: 'Новинка' },
    { rooms: '3-к', title: 'ЖК Бишкек Сити', desc: '3-комн. кв., 92 м²', area: 'Бишкек, ул. Чуй', price: '$1 450 000', badge: '' },
    { rooms: '2-к', title: 'ЖК Дипломат', desc: '2-комн. кв., 70 м²', area: 'Бишкек, ул. Гоголя', price: '$980 000', badge: '' },
]

export default function GuestProperties() {
    return (
        <GuestLayout>
            <div className="gp-body">
                <div style={{ marginBottom: 20 }}>
                    <h1 style={{ fontSize: 22, fontWeight: 800, color: '#0f172a', marginBottom: 4 }}>Подобранные варианты</h1>
                    <p style={{ fontSize: 13, color: '#64748b' }}>Ваш агент подобрал {properties.length} вариантов под ваши критерии</p>
                </div>

                <div className="gp-props-grid">
                    {properties.map((p, i) => (
                        <div key={i} className="gp-prop-card">
                            <div className="gp-prop-card__img">
                                {p.rooms}
                                {p.badge && <span className="gp-prop-card__badge">{p.badge}</span>}
                            </div>
                            <div className="gp-prop-card__body">
                                <div className="gp-prop-card__title">{p.title}</div>
                                <div className="gp-prop-card__meta">{p.desc}</div>
                                <div className="gp-prop-card__meta" style={{ marginTop: 2 }}>{p.area}</div>
                                <div className="gp-prop-card__price">{p.price}</div>
                                <div className="gp-prop-card__footer">
                                    <button className="gp-btn gp-btn--outline gp-btn--sm">Подробнее</button>
                                    <button className="gp-btn gp-btn--primary gp-btn--sm">Записаться</button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </GuestLayout>
    )
}
