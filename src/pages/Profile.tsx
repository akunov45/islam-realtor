import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../store/authStore'
import { usersApi } from '../api/users'
import AppLayout from '../components/AppLayout'
import type { Role } from '../types/api'

const ROLE_LABELS: Record<Role, string> = {
    buyer: 'Покупатель', seller: 'Продавец', agent: 'Агент',
    lawyer: 'Юрист', director: 'Директор', superadmin: 'Суперадмин',
}

export default function Profile() {
    const { user, refreshUser } = useAuth()
    const navigate = useNavigate()
    const [editing, setEditing] = useState(false)
    const [form, setForm] = useState({ first_name: user?.first_name ?? '', last_name: user?.last_name ?? '', phone_number: user?.phone_number ?? '' })
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')
    const [loading, setLoading] = useState(false)

    const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) => setForm(f => ({ ...f, [k]: e.target.value }))

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault(); setError(''); setSuccess(''); setLoading(true)
        try {
            await usersApi.updateMe(form)
            await refreshUser()
            setEditing(false)
            setSuccess('Профиль обновлён')
            setTimeout(() => setSuccess(''), 3000)
        } catch (err: unknown) {
            setError((err as { response?: { data?: { error?: string } } })?.response?.data?.error ?? 'Ошибка при сохранении')
        } finally { setLoading(false) }
    }

    if (!user) return null
    
    const initials = `${user.first_name?.[0] ?? ''}${user.last_name?.[0] ?? ''}`.toUpperCase() || (user.email?.[0]?.toUpperCase() ?? 'U')

    return (
        <AppLayout title="Профиль" breadcrumbs={[{ label: 'Профиль' }]}>
            <div style={{ maxWidth: 640, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 16 }}>

                <div className="g-card" style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                    <div style={{ width: 72, height: 72, borderRadius: '50%', background: '#1e2433', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 24, fontWeight: 700, flexShrink: 0 }}>
                        {initials}
                    </div>
                    <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 20, fontWeight: 700, color: '#111827' }}>{user.first_name} {user.last_name}</div>
                        <div style={{ fontSize: 13, color: '#6b7280', marginTop: 2 }}>{user.email}</div>
                        <div style={{ marginTop: 8, display: 'flex', gap: 8 }}>
                            <span className="status-badge status-badge--new">{ROLE_LABELS[user.role]}</span>
                            {user.is_blocked && <span className="status-badge status-badge--lost">Заблокирован</span>}
                        </div>
                    </div>
                    {!editing && <button className="btn btn--outline btn--sm" onClick={() => setEditing(true)}>Редактировать</button>}
                </div>

                {editing && (
                    <div className="g-card">
                        <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>Редактирование</h3>
                        {error && <div className="auth-error" style={{ marginBottom: 12 }}>{error}</div>}
                        <form onSubmit={handleSave}>
                            <div className="grid-2" style={{ marginBottom: 14 }}>
                                <div className="form-group"><label className="form-label">Имя</label><input className="form-input" value={form.first_name} onChange={set('first_name')} required /></div>
                                <div className="form-group"><label className="form-label">Фамилия</label><input className="form-input" value={form.last_name} onChange={set('last_name')} /></div>
                            </div>
                            <div className="form-group" style={{ marginBottom: 20 }}>
                                <label className="form-label">Телефон</label>
                                <input className="form-input" type="tel" placeholder="+996700123456" value={form.phone_number} onChange={set('phone_number')} />
                            </div>
                            <div style={{ display: 'flex', gap: 10 }}>
                                <button type="button" className="btn btn--outline" onClick={() => { setEditing(false); setError('') }}>Отмена</button>
                                <button className="btn btn--primary" disabled={loading}>{loading ? 'Сохранение...' : 'Сохранить'}</button>
                            </div>
                        </form>
                    </div>
                )}

                <div className="g-card">
                    <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>Данные аккаунта</h3>
                    {[
                        { label: 'Email', value: user.email },
                        { label: 'Телефон', value: user.phone_number ?? '—' },
                        { label: 'Роль', value: ROLE_LABELS[user.role] },
                        { label: 'Дата регистрации', value: new Date(user.date_joined).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' }) },
                    ].map(row => (
                        <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, borderBottom: '1px solid #f3f4f6', padding: '10px 0' }}>
                            <span style={{ color: '#6b7280' }}>{row.label}</span>
                            <span style={{ color: '#111827', fontWeight: 500 }}>{row.value}</span>
                        </div>
                    ))}
                </div>

                {user.agent_profile && (
                    <div className="g-card">
                        <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>Профиль агента</h3>
                        {[
                            { label: 'Агентство', value: user.agent_profile.agency_name ?? '—' },
                            { label: 'Лицензия', value: user.agent_profile.license_number ?? '—' },
                            { label: 'Опыт', value: user.agent_profile.experience_years ? `${user.agent_profile.experience_years} лет` : '—' },
                            { label: 'Рейтинг', value: user.agent_profile.rating ?? '—' },
                        ].map(row => (
                            <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, borderBottom: '1px solid #f3f4f6', padding: '8px 0' }}>
                                <span style={{ color: '#6b7280' }}>{row.label}</span>
                                <span style={{ color: '#111827', fontWeight: 500 }}>{row.value}</span>
                            </div>
                        ))}
                    </div>
                )}

                <div className="g-card">
                    <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>Безопасность</h3>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div>
                            <div style={{ fontSize: 13, fontWeight: 500 }}>Пароль</div>
                            <div style={{ fontSize: 12, color: '#9ca3af' }}>Изменить пароль аккаунта</div>
                        </div>
                        <button className="btn btn--outline btn--sm" onClick={() => navigate('/change-password')}>Сменить пароль</button>
                    </div>
                </div>

                {success && <div className="toast toast--success">{success}</div>}
            </div>
        </AppLayout>
    )
}