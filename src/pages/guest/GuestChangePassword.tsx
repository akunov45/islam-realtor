import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { authApi } from '../../api/auth'
import { useAuth } from '../../store/authStore'
import GuestLayout from './GuestLayout'

export default function GuestChangePassword() {
    const navigate = useNavigate()
    const { refreshUser } = useAuth()
    const [form, setForm] = useState({ old_password: '', new_password: '', confirm: '' })
    const [error, setError] = useState('')
    const [success, setSuccess] = useState(false)
    const [loading, setLoading] = useState(false)

    const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
        setForm(f => ({ ...f, [k]: e.target.value }))

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        if (form.new_password !== form.confirm) { setError('Пароли не совпадают'); return }
        if (form.new_password.length < 8) { setError('Минимум 8 символов'); return }
        setLoading(true)
        try {
            await authApi.changePassword({ old_password: form.old_password, new_password: form.new_password })
            await refreshUser()
            setSuccess(true)
            setTimeout(() => navigate('/guest/profile'), 1500)
        } catch (err: unknown) {
            setError((err as { response?: { data?: { error?: string } } })?.response?.data?.error ?? 'Текущий пароль неверен')
        } finally {
            setLoading(false)
        }
    }

    return (
        <GuestLayout>
            <div className="gp-body" style={{ maxWidth: 480 }}>
                <div className="gp-card">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
                        <button
                            onClick={() => navigate('/guest/profile')}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#0d9488', fontSize: 13, fontWeight: 600, padding: 0 }}
                        >
                            ← Назад
                        </button>
                        <div style={{ fontSize: 17, fontWeight: 700, color: '#0f172a' }}>Смена пароля</div>
                    </div>

                    {error && (
                        <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 9, padding: '10px 14px', fontSize: 13, color: '#dc2626', marginBottom: 16 }}>
                            {error}
                        </div>
                    )}

                    {success ? (
                        <div style={{ textAlign: 'center', padding: '20px 0', color: '#0d9488' }}>
                            <div style={{ fontSize: 32, marginBottom: 8 }}>✓</div>
                            <div style={{ fontWeight: 600 }}>Пароль успешно изменён!</div>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit}>
                            <div className="form-group" style={{ marginBottom: 14 }}>
                                <label className="form-label">Текущий пароль</label>
                                <input className="form-input" type="password" placeholder="••••••••" value={form.old_password} onChange={set('old_password')} required autoFocus />
                            </div>
                            <div className="form-group" style={{ marginBottom: 14 }}>
                                <label className="form-label">Новый пароль (мин. 8 символов)</label>
                                <input className="form-input" type="password" placeholder="••••••••" value={form.new_password} onChange={set('new_password')} required />
                            </div>
                            <div className="form-group" style={{ marginBottom: 24 }}>
                                <label className="form-label">Повторите новый пароль</label>
                                <input className="form-input" type="password" placeholder="••••••••" value={form.confirm} onChange={set('confirm')} required />
                            </div>
                            <div style={{ display: 'flex', gap: 10 }}>
                                <button type="button" className="gp-btn gp-btn--outline" onClick={() => navigate('/guest/profile')}>
                                    Отмена
                                </button>
                                <button className="gp-btn gp-btn--primary" style={{ flex: 1, justifyContent: 'center' }} disabled={loading}>
                                    {loading ? 'Сохранение...' : 'Сменить пароль'}
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </GuestLayout>
    )
}