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

    const isMustChange = user?.must_change_password

    const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
        setForm(f => ({ ...f, [k]: e.target.value }))

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        if (form.new_password !== form.confirm) { setError('Пароли не совпадают'); return }
        if (form.new_password.length < 8) { setError('Минимум 8 символов'); return }
        setLoading(true)
        try {
            if (isMustChange) {
                // Первый вход — используем /api/auth/first-login/
                await authApi.firstLogin({
                    email: user?.email ?? '',
                    old_password: form.old_password,
                    new_password: form.new_password,
                })
            } else {
                // Обычная смена пароля
                await authApi.changePassword({
                    old_password: form.old_password,
                    new_password: form.new_password,
                })
            }
            await refreshUser()
            setSuccess(true)
            setTimeout(() => {
                navigate(isMustChange ? '/dashboard' : '/profile', { replace: true })
            }, 1500)
        } catch (err: unknown) {
            const msg = (err as { response?: { data?: { error?: string; message?: string } } })?.response?.data
            setError(msg?.error ?? msg?.message ?? 'Текущий пароль неверен')
        } finally {
            setLoading(false)
        }
    }

    const formJsx = (
        <form onSubmit={handleSubmit}>
            {error && (
                <div style={{
                    background: 'var(--badge-err-bg)', border: '1px solid var(--badge-err-text)',
                    borderRadius: 9, padding: '10px 14px', fontSize: 13,
                    color: 'var(--badge-err-text)', marginBottom: 14,
                }}>
                    ⚠ {error}
                </div>
            )}

            {success ? (
                <div style={{ textAlign: 'center', padding: '20px 0', color: 'var(--accent)' }}>
                    <div style={{ fontSize: 40 }}>✓</div>
                    <div style={{ fontWeight: 700, marginTop: 10, fontSize: 15 }}>Пароль успешно изменён!</div>
                    <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 6 }}>
                        Перенаправление...
                    </div>
                </div>
            ) : (
                <>
                    <div className="form-group" style={{ marginBottom: 14 }}>
                        <label className="form-label">
                            {isMustChange ? 'Временный пароль' : 'Текущий пароль'}
                        </label>
                        <input
                            className="form-input" type="password" placeholder="••••••••"
                            value={form.old_password} onChange={set('old_password')}
                            required autoFocus
                        />
                    </div>
                    <div className="form-group" style={{ marginBottom: 14 }}>
                        <label className="form-label">Новый пароль (мин. 8 символов)</label>
                        <input
                            className="form-input" type="password" placeholder="••••••••"
                            value={form.new_password} onChange={set('new_password')} required
                        />
                    </div>
                    <div className="form-group" style={{ marginBottom: 24 }}>
                        <label className="form-label">Повторите новый пароль</label>
                        <input
                            className="form-input" type="password" placeholder="••••••••"
                            value={form.confirm} onChange={set('confirm')} required
                        />
                    </div>
                    <div style={{ display: 'flex', gap: 10 }}>
                        {!isMustChange && (
                            <button type="button" className="btn btn--outline" onClick={() => navigate(-1)}>
                                Отмена
                            </button>
                        )}
                        <button
                            className="btn btn--primary"
                            style={{ flex: 1, justifyContent: 'center' }}
                            disabled={loading}
                        >
                            {loading ? 'Сохранение...' : 'Сменить пароль'}
                        </button>
                    </div>
                </>
            )}
        </form>
    )

    // must_change_password — показываем auth страницу без layout
    if (isMustChange) {
        return (
            <div className="auth-page">
                <div className="auth-card">
                    <div style={{
                        background: 'var(--badge-warn-bg)', border: '1px solid var(--badge-warn-text)',
                        borderRadius: 10, padding: '12px 16px', marginBottom: 20,
                        fontSize: 13, color: 'var(--badge-warn-text)',
                    }}>
                        ⚠️ Для продолжения необходимо сменить временный пароль.
                    </div>
                    <h2 className="auth-title">Смена пароля</h2>
                    {formJsx}
                </div>
            </div>
        )
    }

    return (
        <AppLayout
            title="Смена пароля"
            breadcrumbs={[{ label: 'Профиль', path: '/profile' }, { label: 'Смена пароля' }]}
        >
            <div style={{ maxWidth: 440, margin: '0 auto' }}>
                <div className="g-card">{formJsx}</div>
            </div>
        </AppLayout>
    )
}