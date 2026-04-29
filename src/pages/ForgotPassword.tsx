import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { authApi } from '../api/auth'
import logoSvg from '../assets/logo.svg'

type Step = 'email' | 'otp' | 'newpass' | 'done'

export default function ForgotPassword() {
    const navigate = useNavigate()
    const [step, setStep] = useState<Step>('email')
    const [email, setEmail] = useState('')
    const [otp, setOtp] = useState('')
    const [resetToken, setResetToken] = useState('')
    const [newPassword, setNewPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    const handleSendOtp = async (e: React.FormEvent) => {
        e.preventDefault(); setError(''); setLoading(true)
        try {
            await authApi.sendOtp({ identifier: email, via: 'email', purpose: 'reset_password' })
            setStep('otp')
        } catch (err: unknown) {
            setError((err as { response?: { data?: { error?: string } } })?.response?.data?.error ?? 'Пользователь не найден')
        } finally { setLoading(false) }
    }

    const handleVerifyOtp = async (e: React.FormEvent) => {
        e.preventDefault(); setError(''); setLoading(true)
        try {
            const res = await authApi.verifyOtp({ identifier: email, code: otp, via: 'email', purpose: 'reset_password' })
            if (!res.reset_token) throw new Error('no token')
            setResetToken(res.reset_token)
            setStep('newpass')
        } catch (err: unknown) {
            setError((err as { response?: { data?: { error?: string } } })?.response?.data?.error ?? 'Неверный или истёкший код')
        } finally { setLoading(false) }
    }

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault(); setError('')
        if (newPassword !== confirmPassword) { setError('Пароли не совпадают'); return }
        if (newPassword.length < 8) { setError('Минимум 8 символов'); return }
        setLoading(true)
        try {
            await authApi.resetPassword({ reset_token: resetToken, new_password: newPassword })
            setStep('done')
        } catch (err: unknown) {
            setError((err as { response?: { data?: { error?: string } } })?.response?.data?.error ?? 'Ошибка сброса пароля')
        } finally { setLoading(false) }
    }

    const stepIndex = { email: 0, otp: 1, newpass: 2, done: 3 }

    return (
        <div className="auth-page">
            <div className="auth-card">
                <div className="auth-logo">
                    <div className="auth-logo" style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28 }}>
                        <img src={logoSvg} alt="RealtorAI" style={{ width: 64, height: 64, flexShrink: 0 }} />
                        <div style={{ fontSize: 16, fontWeight: 700, color: '#0f172a' }}>RealtorAiSystem</div>
                    </div>
                </div>

                {step !== 'done' && (
                    <div style={{ display: 'flex', gap: 8, marginBottom: 24, alignItems: 'center' }}>
                        {[0, 1, 2].map(i => (
                            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <div style={{
                                    width: 26, height: 26, borderRadius: '50%',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontSize: 11, fontWeight: 700,
                                    background: stepIndex[step] === i ? '#3b82f6' : stepIndex[step] > i ? '#10b981' : '#e5e7eb',
                                    color: stepIndex[step] >= i ? 'white' : '#9ca3af',
                                }}>{i + 1}</div>
                                {i < 2 && <div style={{ width: 24, height: 2, background: '#e5e7eb' }} />}
                            </div>
                        ))}
                        <span style={{ fontSize: 12, color: '#6b7280', marginLeft: 8 }}>
                            {step === 'email' && 'Введите email'}
                            {step === 'otp' && 'Введите код'}
                            {step === 'newpass' && 'Новый пароль'}
                        </span>
                    </div>
                )}

                {error && <div className="auth-error">{error}</div>}

                {step === 'email' && (
                    <form onSubmit={handleSendOtp}>
                        <h2 className="auth-title">Восстановление пароля</h2>
                        <p style={{ fontSize: 13, color: '#6b7280', marginBottom: 20 }}>Введите email — мы отправим код для сброса пароля.</p>
                        <div className="form-group" style={{ marginBottom: 20 }}>
                            <label className="form-label">Email</label>
                            <input className="form-input" type="email" placeholder="ivan@example.com" value={email} onChange={e => setEmail(e.target.value)} required autoFocus />
                        </div>
                        <button className="btn btn--primary" style={{ width: '100%', justifyContent: 'center' }} disabled={loading}>
                            {loading ? 'Отправка...' : 'Отправить код'}
                        </button>
                    </form>
                )}

                {step === 'otp' && (
                    <form onSubmit={handleVerifyOtp}>
                        <h2 className="auth-title">Введите код</h2>
                        <p style={{ fontSize: 13, color: '#6b7280', marginBottom: 20 }}>Код отправлен на <strong>{email}</strong>. Действителен 5 минут.</p>
                        <div className="form-group" style={{ marginBottom: 20 }}>
                            <label className="form-label">6-значный код</label>
                            <input className="form-input" type="text" inputMode="numeric" maxLength={6} placeholder="483920"
                                value={otp} onChange={e => setOtp(e.target.value.replace(/\D/g, ''))} required autoFocus
                                style={{ letterSpacing: 6, fontSize: 22, textAlign: 'center' }} />
                        </div>
                        <button className="btn btn--primary" style={{ width: '100%', justifyContent: 'center' }} disabled={loading}>
                            {loading ? 'Проверка...' : 'Подтвердить'}
                        </button>
                        <button type="button" onClick={() => { setStep('email'); setOtp(''); setError('') }}
                            style={{ width: '100%', marginTop: 10, background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer', fontSize: 12 }}>
                            ← Изменить email
                        </button>
                    </form>
                )}

                {step === 'newpass' && (
                    <form onSubmit={handleResetPassword}>
                        <h2 className="auth-title">Новый пароль</h2>
                        <div className="form-group" style={{ marginBottom: 14 }}>
                            <label className="form-label">Новый пароль (мин. 8 символов)</label>
                            <input className="form-input" type="password" placeholder="••••••••" value={newPassword} onChange={e => setNewPassword(e.target.value)} required autoFocus />
                        </div>
                        <div className="form-group" style={{ marginBottom: 24 }}>
                            <label className="form-label">Повторите пароль</label>
                            <input className="form-input" type="password" placeholder="••••••••" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required />
                        </div>
                        <button className="btn btn--primary" style={{ width: '100%', justifyContent: 'center' }} disabled={loading}>
                            {loading ? 'Сохранение...' : 'Сохранить пароль'}
                        </button>
                    </form>
                )}

                {step === 'done' && (
                    <div style={{ textAlign: 'center', padding: '20px 0' }}>
                        <div style={{ fontSize: 48, marginBottom: 16 }}>✅</div>
                        <h2 className="auth-title">Пароль изменён!</h2>
                        <p style={{ color: '#6b7280', fontSize: 13, marginBottom: 24 }}>Теперь можете войти с новым паролем.</p>
                        <button className="btn btn--primary" onClick={() => navigate('/login')} style={{ width: '100%', justifyContent: 'center' }}>
                            Перейти ко входу
                        </button>
                    </div>
                )}

                {step !== 'done' && (
                    <div style={{ textAlign: 'center', marginTop: 20 }}>
                        <Link to="/login" style={{ fontSize: 12, color: '#9ca3af', textDecoration: 'none' }}>← Вернуться ко входу</Link>
                    </div>
                )}
            </div>
        </div>
    )
}