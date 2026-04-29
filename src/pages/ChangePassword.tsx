import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { authApi } from '../api/auth'
import { useAuth } from '../store/authStore'
import AppLayout from '../components/AppLayout'

export default function ChangePassword() {
    const navigate = useNavigate()
    const { user, refreshUser } = useAuth()
    const [form, setForm] = useState({ old_password: '', new_password: '', confirm: '' })
    const [error, setError] = useState('')
    const [success, setSuccess] = useState(false)
    const [loading, setLoading] = useState(false)

    const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) => setForm(f => ({ ...f, [k]: e.target.value }))

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault(); setError('')
        if (form.new_password !== form.confirm) { setError('Пароли не совпадают'); return }
        if (form.new_password.length < 8) { setError('Минимум 8 символов'); return }
        setLoading(true)
        try {
            await authApi.changePassword({ old_password: form.old_password, new_password: form.new_password })
            await refreshUser()
            setSuccess(true)
            setTimeout(() => navigate('/dashboard'), 1500)
        } catch (err: unknown) {
            setError((err as { response?: { data?: { error?: string } } })?.response?.data?.error ?? 'Текущий пароль неверен')
        } finally { setLoading(false) }
    }

    const isMustChange = user?.must_change_password

    const formJsx = (
        <form onSubmit={handleSubmit}>
            {error && <div className="auth-error" style={{ marginBottom: 14 }}>{error}</div>}
            {success ? (
                <div style={{ textAlign: 'center', padding: '20px 0', color: '#10b981' }}>
                    <div style={{ fontSize: 32 }}>✓</div>
                    <div style={{ fontWeight: 600, marginTop: 8 }}>Пароль успешно изменён!</div>
                </div>
            ) : (
                <>
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
                        {!isMustChange && (
                            <button type="button" className="btn btn--outline" onClick={() => navigate(-1)}>Отмена</button>
                        )}
                        <button className="btn btn--primary" style={{ flex: 1, justifyContent: 'center' }} disabled={loading}>
                            {loading ? 'Сохранение...' : 'Сменить пароль'}
                        </button>
                    </div>
                </>
            )}
        </form>
    )

    if (isMustChange) {
        return (
            <div className="auth-page">
                <div className="auth-card">
                    <div style={{ background: '#fff7ed', border: '1px solid #fed7aa', borderRadius: 10, padding: '12px 16px', marginBottom: 20, fontSize: 13, color: '#c2410c' }}>
                        ⚠️ Для продолжения необходимо сменить временный пароль.
                    </div>
                    <h2 className="auth-title">Смена пароля</h2>
                    {formJsx}
                </div>
            </div>
        )
    }

    return (
        <AppLayout title="Смена пароля" breadcrumbs={[{ label: 'Профиль', path: '/profile' }, { label: 'Смена пароля' }]}>
            <div style={{ maxWidth: 440, margin: '0 auto' }}>
                <div className="g-card">{formJsx}</div>
            </div>
        </AppLayout>
    )
}