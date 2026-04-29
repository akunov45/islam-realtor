import { useState } from 'react'
import { useAuth } from '../../store/authStore'
import { usersApi } from '../../api/users'
import { useNavigate } from 'react-router-dom'
import GuestLayout from './GuestLayout'

export default function GuestProfile() {
    const { user, refreshUser, logout } = useAuth()
    const navigate = useNavigate()
    const [editing, setEditing] = useState(false)
    const [form, setForm] = useState({
        first_name: user?.first_name ?? '',
        last_name: user?.last_name ?? '',
        phone_number: user?.phone_number ?? '',
    })
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')
    const [loading, setLoading] = useState(false)

    const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
        setForm(f => ({ ...f, [k]: e.target.value }))

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault()
        setError(''); setSuccess(''); setLoading(true)
        try {
            await usersApi.updateMe(form)
            await refreshUser()
            setEditing(false)
            setSuccess('Профиль обновлён')
            setTimeout(() => setSuccess(''), 3000)
        } catch {
            setError('Ошибка при сохранении')
        } finally {
            setLoading(false)
        }
    }

    const handleLogout = async () => {
        await logout()
        navigate('/login', { replace: true })
    }

    if (!user) return null

    const initials = `${user.first_name?.[0] ?? ''}${user.last_name?.[0] ?? ''}`.toUpperCase()
        || (user.email?.[0]?.toUpperCase() ?? 'U')

    const ROLE_LABELS: Record<string, string> = {
        buyer: 'Покупатель',
        seller: 'Продавец',
    }

    return (
        <GuestLayout>
            <div className="gp-body" style={{ maxWidth: 640 }}>

                {/* Avatar block */}
                <div className="gp-card" style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 16 }}>
                    <div style={{
                        width: 72, height: 72, borderRadius: '50%',
                        background: 'linear-gradient(135deg,#0d9488,#14b8a6)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: 'white', fontSize: 26, fontWeight: 800, flexShrink: 0,
                    }}>{initials}</div>
                    <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 20, fontWeight: 800, color: '#0f172a' }}>
                            {user.first_name} {user.last_name}
                        </div>
                        <div style={{ fontSize: 13, color: '#64748b', marginTop: 2 }}>{user.email}</div>
                        <div style={{ marginTop: 8 }}>
                            <span style={{ background: '#ccfbf1', color: '#0f766e', padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600 }}>
                                {ROLE_LABELS[user.role] ?? user.role}
                            </span>
                        </div>
                    </div>
                    {!editing && (
                        <button className="gp-btn gp-btn--outline gp-btn--sm" onClick={() => setEditing(true)}>
                            Редактировать
                        </button>
                    )}
                </div>

                {/* Edit form */}
                {editing && (
                    <div className="gp-card" style={{ marginBottom: 16 }}>
                        <div style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', marginBottom: 16 }}>Редактирование</div>
                        {error && <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 9, padding: '10px 14px', fontSize: 13, color: '#dc2626', marginBottom: 14 }}>{error}</div>}
                        <form onSubmit={handleSave}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
                                <div className="form-group">
                                    <label className="form-label">Имя</label>
                                    <input className="form-input" value={form.first_name} onChange={set('first_name')} required />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Фамилия</label>
                                    <input className="form-input" value={form.last_name} onChange={set('last_name')} />
                                </div>
                            </div>
                            <div className="form-group" style={{ marginBottom: 20 }}>
                                <label className="form-label">Телефон</label>
                                <input className="form-input" type="tel" placeholder="+996700123456" value={form.phone_number} onChange={set('phone_number')} />
                            </div>
                            <div style={{ display: 'flex', gap: 10 }}>
                                <button type="button" className="gp-btn gp-btn--outline" onClick={() => { setEditing(false); setError('') }}>Отмена</button>
                                <button className="gp-btn gp-btn--primary" disabled={loading}>{loading ? 'Сохранение...' : 'Сохранить'}</button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Info */}
                <div className="gp-card" style={{ marginBottom: 16 }}>
                    <div style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', marginBottom: 14 }}>Данные аккаунта</div>
                    {[
                        { label: 'Email', value: user.email },
                        { label: 'Телефон', value: user.phone_number ?? '—' },
                        { label: 'Роль', value: ROLE_LABELS[user.role] ?? user.role },
                        { label: 'Дата регистрации', value: new Date(user.date_joined).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' }) },
                    ].map(row => (
                        <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, borderBottom: '1px solid #f0fdfa', padding: '10px 0' }}>
                            <span style={{ color: '#64748b' }}>{row.label}</span>
                            <span style={{ color: '#0f172a', fontWeight: 500 }}>{row.value}</span>
                        </div>
                    ))}
                </div>

                {/* Security */}
                <div className="gp-card" style={{ marginBottom: 16 }}>
                    <div style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', marginBottom: 14 }}>Безопасность</div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div>
                            <div style={{ fontSize: 13, fontWeight: 500, color: '#0f172a' }}>Пароль</div>
                            <div style={{ fontSize: 12, color: '#94a3b8' }}>Изменить пароль аккаунта</div>
                        </div>
                        <button className="gp-btn gp-btn--outline gp-btn--sm" onClick={() => navigate('/guest/change-password')}>
                            Сменить пароль
                        </button>
                    </div>
                </div>

                {/* Logout */}
                <div className="gp-card">
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div>
                            <div style={{ fontSize: 13, fontWeight: 500, color: '#0f172a' }}>Выход из аккаунта</div>
                            <div style={{ fontSize: 12, color: '#94a3b8' }}>Завершить текущую сессию</div>
                        </div>
                        <button className="gp-btn gp-btn--sm" style={{ background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca' }} onClick={handleLogout}>
                            Выйти
                        </button>
                    </div>
                </div>

                {success && (
                    <div className="gp-toast">{success}</div>
                )}
            </div>
        </GuestLayout>
    )
}