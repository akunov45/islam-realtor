import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { authApi } from '../api/auth'
import { useAuth } from '../store/authStore'
import logoSvg from '../assets/logo.svg'

export default function Login() {
    const navigate = useNavigate()
    const { refreshUser, user } = useAuth()

    const [form, setForm] = useState({ email: '', password: '' })
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        if (!user) return
        if (user.must_change_password) {
            navigate('/change-password', { replace: true })
        } else if (user.role === 'buyer' || user.role === 'seller') {
            navigate('/guest', { replace: true })
        } else {
            navigate('/dashboard', { replace: true })
        }
    }, [user, navigate])

    return (
        <div className="auth-page">
            <div className="auth-card">
                <div className="auth-logo" style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28 }}>
                    <img src={logoSvg} alt="RealtorAI" style={{ width: 64, height: 64, flexShrink: 0 }} />
                    <div>
                        <div style={{ fontSize: 16, fontWeight: 700, color: '#0f172a' }}>RealtorAiSystem</div>
                        <div style={{ fontSize: 12, color: '#94a3b8' }}>CRM для агентств недвижимости</div>
                    </div>
                </div>

                <h2 className="auth-title">Вход в систему</h2>

                {error && (
                    <div className="auth-error">
                        {error}
                        <button
                            onClick={() => setError('')}
                            style={{ float: 'right', background: 'none', border: 'none', cursor: 'pointer', color: '#dc2626', fontWeight: 700, fontSize: 16, lineHeight: 1, padding: 0 }}
                        >×</button>
                    </div>
                )}

                <div className="form-group" style={{ marginBottom: 14 }}>
                    <label className="form-label">Email</label>
                    <input
                        className="form-input"
                        type="email"
                        placeholder="agent@crm.com"
                        value={form.email}
                        onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                        autoFocus
                    />
                </div>
                <div className="form-group" style={{ marginBottom: 8 }}>
                    <label className="form-label">Пароль</label>
                    <input
                        className="form-input"
                        type="password"
                        placeholder="••••••••"
                        value={form.password}
                        onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                    />
                </div>

                <div style={{ textAlign: 'right', marginBottom: 24 }}>
                    <Link to="/forgot-password" style={{ fontSize: 12, color: '#0d9488', textDecoration: 'none' }}>
                        Забыли пароль?
                    </Link>
                </div>

                <button
                    type="button"
                    className="btn btn--primary"
                    style={{ width: '100%', justifyContent: 'center' }}
                    disabled={loading}
                    onClick={async () => {
                        if (!form.email || !form.password) { setError('Заполните все поля'); return }
                        setError('')
                        setLoading(true)
                        try {
                            await authApi.login(form)
                            await refreshUser()
                            // редирект сработает через useEffect когда user обновится
                        } catch (err: unknown) {
                            const msg = (err as { response?: { data?: { error?: string; message?: string } } })?.response?.data
                            setError(msg?.error ?? msg?.message ?? 'Неверный email или пароль')
                        } finally {
                            setLoading(false)
                        }
                    }}
                >
                    {loading ? 'Вход...' : 'Войти'}
                </button>

                <div style={{ textAlign: 'center', marginTop: 20, fontSize: 13, color: '#6b7280' }}>
                    Нет аккаунта?{' '}
                    <Link to="/register" style={{ color: '#0d9488', textDecoration: 'none', fontWeight: 600 }}>
                        Зарегистрироваться
                    </Link>
                </div>
            </div>
        </div>
    )
}