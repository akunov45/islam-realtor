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
    const [showPassword, setShowPassword] = useState(false)

    useEffect(() => {
        if (!user) return
        if (user.must_change_password) {
            navigate('/change-password', { replace: true })
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
                    <div style={{ position: 'relative' }}>
                        <input
                            className="form-input"
                            type={showPassword ? 'text' : 'password'}
                            placeholder="••••••••"
                            value={form.password}
                            onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                            style={{ paddingRight: 42, width: '100%' }}
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(p => !p)}
                            style={{
                                position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                                background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: 0,
                                display: 'flex', alignItems: 'center',
                            }}
                        >
                            {showPassword ? (
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                                    <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" />
                                    <line x1="1" y1="1" x2="23" y2="23" />
                                </svg>
                            ) : (
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                    <circle cx="12" cy="12" r="3" />
                                </svg>
                            )}
                        </button>
                    </div>
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
            </div>
        </div>
    )
}