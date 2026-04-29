import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { authApi } from '../api/auth'
import { useAuth } from '../store/authStore'
import logoSvg from '../assets/logo.svg'

export default function Register() {
    const navigate = useNavigate()
    const { refreshUser } = useAuth()
    const [form, setForm] = useState({ email: '', password: '', confirm_password: '', first_name: '', last_name: '', phone_number: '', role: 'buyer' as 'buyer' | 'seller' })
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    const set = (key: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
        setForm(f => ({ ...f, [key]: e.target.value }))

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        if (form.password !== form.confirm_password) { setError('Пароли не совпадают'); return }
        if (form.password.length < 8) { setError('Пароль — минимум 8 символов'); return }
        setLoading(true)
        try {
            await authApi.register({ email: form.email, password: form.password, first_name: form.first_name, last_name: form.last_name, phone_number: form.phone_number || undefined, role: form.role })
            await authApi.login({ email: form.email, password: form.password })
            await refreshUser()
            navigate('/dashboard', { replace: true })
        } catch (err: unknown) {
            const msg = (err as { response?: { data?: { error?: string; message?: string } } })?.response?.data
            setError(msg?.error ?? msg?.message ?? 'Ошибка регистрации')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="auth-page">
            <div className="auth-card">
                <div className="auth-logo" style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28 }}>
                    <img src={logoSvg} alt="RealtorAI" style={{ width: 64, height: 64, flexShrink: 0 }} />
                    <div style={{ fontSize: 16, fontWeight: 700, color: '#0f172a' }}>RealtorAiSystem</div>
                </div>
                <h2 className="auth-title">Регистрация</h2>
                {error && <div className="auth-error">{error}</div>}
                <form onSubmit={handleSubmit}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 14, marginBottom: 14 }}>
                        <div className="form-group">
                            <label className="form-label">Имя *</label>
                            <input className="form-input" placeholder="Иван" value={form.first_name} onChange={set('first_name')} required />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Фамилия</label>
                            <input className="form-input" placeholder="Петров" value={form.last_name} onChange={set('last_name')} />
                        </div>
                    </div>
                    <div className="form-group" style={{ marginBottom: 14 }}>
                        <label className="form-label">Email *</label>
                        <input className="form-input" type="email" placeholder="ivan@example.com" value={form.email} onChange={set('email')} required />
                    </div>
                    <div className="form-group" style={{ marginBottom: 14 }}>
                        <label className="form-label">Телефон</label>
                        <input className="form-input" type="tel" placeholder="+996700123456" value={form.phone_number} onChange={set('phone_number')} />
                    </div>
                    <div className="form-group" style={{ marginBottom: 14 }}>
                        <label className="form-label">Роль *</label>
                        <select className="form-select" value={form.role} onChange={set('role')}>
                            <option value="buyer">Покупатель</option>
                            <option value="seller">Продавец</option>
                        </select>
                    </div>
                    <div className="form-group" style={{ marginBottom: 14 }}>
                        <label className="form-label">Пароль * (мин. 8 символов)</label>
                        <input className="form-input" type="password" placeholder="••••••••" value={form.password} onChange={set('password')} required />
                    </div>
                    <div className="form-group" style={{ marginBottom: 24 }}>
                        <label className="form-label">Повторите пароль *</label>
                        <input className="form-input" type="password" placeholder="••••••••" value={form.confirm_password} onChange={set('confirm_password')} required />
                    </div>
                    <button className="btn btn--primary" style={{ width: '100%', justifyContent: 'center' }} disabled={loading}>
                        {loading ? 'Регистрация...' : 'Зарегистрироваться'}
                    </button>
                </form>
                <div style={{ textAlign: 'center', marginTop: 20, fontSize: 13, color: '#6b7280' }}>
                    Уже есть аккаунт?{' '}
                    <Link to="/login" style={{ color: '#3b82f6', textDecoration: 'none', fontWeight: 600 }}>Войти</Link>
                </div>
            </div>
        </div>
    )
}