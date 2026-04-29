import GuestLayout from './GuestLayout'

const tips = [
    { title: 'Проверьте юридическую чистоту', text: 'Перед подписанием договора убедитесь, что объект не находится под арестом, в залоге или обременении. Запросите выписку из реестра недвижимости.' },
    { title: 'Осмотрите лично', text: 'Фотографии не всегда отражают реальное состояние квартиры. Обязательно посетите объект лично, желательно в дневное время.' },
    { title: 'Изучите инфраструктуру', text: 'Оцените доступность школ, детских садов, магазинов, транспортных узлов. Это влияет не только на удобство жизни, но и на будущую стоимость объекта.' },
    { title: 'Уточните коммунальные расходы', text: 'До заключения сделки узнайте размер ежемесячных коммунальных платежей, тарифы управляющей компании и наличие задолженностей.' },
    { title: 'Торгуйтесь', text: 'Большинство продавцов готовы к снижению цены на 5-10%. Ваш агент поможет провести переговоры и добиться оптимальной цены.' },
    { title: 'Не торопитесь', text: 'Покупка недвижимости — серьёзное решение. Не поддавайтесь на искусственно создаваемое давление "срочно, иначе другие купят".' },
    { title: 'Проверьте застройщика', text: 'Для новостроек важно изучить репутацию застройщика: сданные объекты, отзывы жильцов, финансовое состояние компании.' },
    { title: 'Изучите договор', text: 'Перед подписанием внимательно прочитайте все условия договора. При необходимости привлеките юриста для проверки документов.' },
]

export default function GuestTips() {
    return (
        <GuestLayout>
            <div className="gp-body">
                <div style={{ marginBottom: 20 }}>
                    <h1 style={{ fontSize: 22, fontWeight: 800, color: '#0f172a', marginBottom: 4 }}>Советы покупателю</h1>
                    <p style={{ fontSize: 13, color: '#64748b' }}>Полезные советы для успешной покупки недвижимости</p>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {tips.map((tip, i) => (
                        <div key={i} className="gp-card" style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                            <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg,#0d9488,#14b8a6)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 14, flexShrink: 0 }}>
                                {i + 1}
                            </div>
                            <div>
                                <div style={{ fontSize: 14, fontWeight: 700, color: '#0f172a', marginBottom: 4 }}>{tip.title}</div>
                                <div style={{ fontSize: 13, color: '#64748b', lineHeight: 1.6 }}>{tip.text}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </GuestLayout>
    )
}
