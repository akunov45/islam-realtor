import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../store/authStore'
import GuestLayout from './GuestLayout'

export default function GuestHome() {
    const navigate = useNavigate()
    const { user } = useAuth()
    const firstName = user?.first_name || 'Гость'

    return (
        <GuestLayout>
            <div className="gp-body">

                {/* Hero */}
                <div className="gp-hero">
                    <div>
                        <div className="gp-hero__title">Добро пожаловать, {firstName}!</div>
                        <div className="gp-hero__sub">Ваша заявка на покупку недвижимости в работе.</div>
                        <div className="gp-hero__btns">
                            <button className="gp-hero__btn gp-hero__btn--white" onClick={() => navigate('/guest/requests')}>
                                Мои заявки
                            </button>
                            <button className="gp-hero__btn gp-hero__btn--ghost" onClick={() => navigate('/guest/properties')}>
                                Подобрать дом
                            </button>
                        </div>
                    </div>
                    <div className="gp-hero__stats">
                        <div className="gp-hero__stat">
                            <div className="gp-hero__stat-val">2</div>
                            <div className="gp-hero__stat-lbl">Заявки</div>
                        </div>
                        <div className="gp-hero__stat">
                            <div className="gp-hero__stat-val">5</div>
                            <div className="gp-hero__stat-lbl">Варианты</div>
                        </div>
                    </div>
                </div>

                {/* Stats */}
                <div className="gp-stats">
                    <div className="gp-stat-card" onClick={() => navigate('/guest/requests')} style={{ cursor: 'pointer' }}>
                        <div className="gp-stat-card__icon" style={{ background: '#ccfbf1' }}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0f766e" strokeWidth="2"><path d="M9 11l3 3L22 4" /><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" /></svg>
                        </div>
                        <div className="gp-stat-card__val">2</div>
                        <div className="gp-stat-card__lbl">Активные заявки</div>
                    </div>
                    <div className="gp-stat-card" onClick={() => navigate('/guest/properties')} style={{ cursor: 'pointer' }}>
                        <div className="gp-stat-card__icon" style={{ background: '#fef3c7' }}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#b45309" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>
                        </div>
                        <div className="gp-stat-card__val">5</div>
                        <div className="gp-stat-card__lbl">Просмотрено домов</div>
                    </div>
                    <div className="gp-stat-card" onClick={() => navigate('/guest/chat')} style={{ cursor: 'pointer' }}>
                        <div className="gp-stat-card__icon" style={{ background: '#e0e7ff' }}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#4338ca" strokeWidth="2"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" /></svg>
                        </div>
                        <div className="gp-stat-card__val">3</div>
                        <div className="gp-stat-card__lbl">Новых сообщения</div>
                    </div>
                </div>

                {/* Статус + Агент */}
                <div className="gp-grid-2">
                    <div className="gp-card">
                        <div className="gp-card__title">
                            <div className="gp-card__title-icon" style={{ background: '#ccfbf1' }}>
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0f766e" strokeWidth="2"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
                            </div>
                            Статус сделки
                        </div>
                        <div className="gp-steps">
                            {[
                                { label: 'Заявка подана', sub: '21 апр, 2026', state: 'done' },
                                { label: 'Агент назначен', sub: '21 апр, 2026', state: 'done' },
                                { label: 'Подбор объектов', sub: 'В процессе...', state: 'active' },
                                { label: 'Просмотр', sub: 'Ожидается', state: 'pending' },
                                { label: 'Сделка', sub: 'Ожидается', state: 'pending' },
                            ].map((step, i) => (
                                <div key={i} className="gp-step">
                                    <div className={`gp-step__dot gp-step__dot--${step.state}`}>
                                        {step.state === 'done' ? '✓' : i + 1}
                                    </div>
                                    <div>
                                        <div className="gp-step__title">{step.label}</div>
                                        <div className="gp-step__sub">{step.sub}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="gp-card">
                        <div className="gp-card__title">
                            <div className="gp-card__title-icon" style={{ background: '#ccfbf1' }}>
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0f766e" strokeWidth="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                            </div>
                            Ваш агент
                        </div>
                        <div className="gp-agent">
                            <div className="gp-agent__avatar">А</div>
                            <div>
                                <div className="gp-agent__name">Анна Сейткали</div>
                                <div className="gp-agent__role">Старший риелтор</div>
                                <div className="gp-agent__meta">Опыт 7 лет · Рейтинг 4.9 ⭐</div>
                            </div>
                        </div>
                        <div className="gp-agent__btns">
                            <button className="gp-btn gp-btn--primary gp-btn--sm" onClick={() => navigate('/guest/chat')}>
                                Написать
                            </button>
                            <button className="gp-btn gp-btn--outline gp-btn--sm">
                                Позвонить
                            </button>
                        </div>
                        <div className="gp-last-msg" style={{ marginTop: 14 }}>
                            <div className="gp-last-msg__label">Последнее сообщение</div>
                            <div className="gp-last-msg__text">"Иван, нашла 3 отличных варианта под ваш бюджет. Отправлю сегодня вечером!"</div>
                            <div className="gp-last-msg__time">Сегодня, 14:32</div>
                        </div>
                    </div>
                </div>

                {/* Подобранные дома */}
                <div className="gp-grid-full">
                    <div className="gp-card">
                        <div className="gp-card__title">
                            <div className="gp-card__title-icon" style={{ background: '#fef3c7' }}>
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#b45309" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" /></svg>
                            </div>
                            Подобранные варианты
                            <span className="gp-card__more" onClick={() => navigate('/guest/properties')}>Все варианты →</span>
                        </div>
                        {[
                            { rooms: '3-к', title: 'ЖК Рассвет, 3-комн. кв.', meta: 'Бишкек, ул. Манаса · 85 м²', price: '$1 200 000' },
                            { rooms: '2-к', title: 'ЖК Асман, 2-комн. кв.', meta: 'Бишкек, мкр. Джал · 65 м²', price: '$850 000' },
                            { rooms: '4-к', title: 'ЖК Элит, 4-комн. кв.', meta: 'Бишкек, ул. Токомбаева · 120 м²', price: '$1 800 000' },
                        ].map((p, i) => (
                            <div key={i} className="gp-prop">
                                <div className="gp-prop__img">{p.rooms}</div>
                                <div style={{ flex: 1 }}>
                                    <div className="gp-prop__title">{p.title}</div>
                                    <div className="gp-prop__meta">{p.meta}</div>
                                    <div className="gp-prop__price">{p.price}</div>
                                </div>
                                <button className={`gp-btn gp-btn--sm ${i === 0 ? 'gp-btn--primary' : 'gp-btn--outline'}`}
                                    onClick={() => navigate('/guest/properties')}>
                                    Смотреть
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Новости + Советы */}
                <div className="gp-grid-2">
                    <div className="gp-card">
                        <div className="gp-card__title">
                            <div className="gp-card__title-icon" style={{ background: '#e0e7ff' }}>
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#4338ca" strokeWidth="2"><path d="M4 22h16a2 2 0 002-2V4a2 2 0 00-2-2H8a2 2 0 00-2 2v16a2 2 0 01-2 2zm0 0a2 2 0 01-2-2v-9" /></svg>
                            </div>
                            Новости рынка
                            <span className="gp-card__more" onClick={() => navigate('/guest/news')}>Все →</span>
                        </div>
                        {[
                            { date: '24 апр 2026', title: 'Цены на жильё в Бишкеке выросли на 4.2% за квартал' },
                            { date: '22 апр 2026', title: 'Новые ЖК: 3 комплекса сдаются в 2026 году' },
                            { date: '19 апр 2026', title: 'Ипотека под 8% — банки снижают ставки' },
                        ].map((n, i) => (
                            <div key={i} className="gp-news-item">
                                <div className="gp-news-item__date">{n.date}</div>
                                <div className="gp-news-item__title">{n.title}</div>
                            </div>
                        ))}
                    </div>

                    <div className="gp-card">
                        <div className="gp-card__title">
                            <div className="gp-card__title-icon" style={{ background: '#ccfbf1' }}>
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0f766e" strokeWidth="2"><circle cx="12" cy="12" r="10" /><path d="M12 8v4M12 16h.01" /></svg>
                            </div>
                            Советы покупателю
                            <span className="gp-card__more" onClick={() => navigate('/guest/tips')}>Все →</span>
                        </div>
                        {[
                            'Проверьте юридическую чистоту объекта перед подписанием договора',
                            'Осмотрите квартиру лично — фото не всегда отражают реальность',
                            'Уточните все коммунальные расходы до заключения сделки',
                            'Торгуйтесь — большинство продавцов готовы к скидке 5-10%',
                        ].map((tip, i) => (
                            <div key={i} className="gp-tip">
                                <div className="gp-tip__num">{i + 1}</div>
                                <div className="gp-tip__text">{tip}</div>
                            </div>
                        ))}
                    </div>
                </div>

            </div>
        </GuestLayout>
    )
}
