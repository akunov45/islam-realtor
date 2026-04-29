import GuestLayout from './GuestLayout'

const news = [
    { date: '24 апр 2026', title: 'Цены на жильё в Бишкеке выросли на 4.2% за квартал', text: 'По данным аналитиков рынка недвижимости, средняя стоимость квадратного метра в Бишкеке продолжает расти. Особенно заметен рост в центральных районах города.' },
    { date: '22 апр 2026', title: 'Новые ЖК: 3 комплекса сдаются в 2026 году', text: 'В текущем году планируется сдача трёх крупных жилых комплексов общей площадью более 150 000 м². Все объекты расположены в развитых районах с хорошей инфраструктурой.' },
    { date: '19 апр 2026', title: 'Ипотека под 8% — банки снижают ставки', text: 'Ряд ведущих банков страны объявили о снижении ипотечных ставок. Теперь можно оформить кредит на жильё под 8% годовых при первоначальном взносе от 20%.' },
    { date: '15 апр 2026', title: 'Рынок недвижимости: итоги первого квартала 2026', text: 'Первый квартал 2026 года показал стабильный рост спроса на жилую недвижимость. Особенно востребованы 2 и 3-комнатные квартиры в новостройках.' },
]

export default function GuestNews() {
    return (
        <GuestLayout>
            <div className="gp-body">
                <div style={{ marginBottom: 20 }}>
                    <h1 style={{ fontSize: 22, fontWeight: 800, color: '#0f172a', marginBottom: 4 }}>Новости рынка</h1>
                    <p style={{ fontSize: 13, color: '#64748b' }}>Актуальная информация о рынке недвижимости</p>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    {news.map((n, i) => (
                        <div key={i} className="gp-card" style={{ cursor: 'pointer' }}>
                            <div className="gp-news-item__date">{n.date}</div>
                            <div style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', margin: '6px 0 8px' }}>{n.title}</div>
                            <div style={{ fontSize: 13, color: '#64748b', lineHeight: 1.6 }}>{n.text}</div>
                            <div style={{ marginTop: 12 }}>
                                <span style={{ fontSize: 12, color: '#0d9488', fontWeight: 600, cursor: 'pointer' }}>Читать далее →</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </GuestLayout>
    )
}
