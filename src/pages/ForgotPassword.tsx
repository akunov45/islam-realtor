import { useNavigate, Link } from 'react-router-dom'
import logoSvg from '../assets/logo.svg'

export default function ForgotPassword() {
    const navigate = useNavigate()

    return (
        <div className="auth-page">
            <div className="auth-card">
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28 }}>
                    <img src={logoSvg} alt="RealtorAI" style={{ width: 64, height: 64, flexShrink: 0 }} />
                    <div>
                        <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>RealtorAiSystem</div>
                        <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>CRM для агентств недвижимости</div>
                    </div>
                </div>

                <h2 className="auth-title">Восстановление пароля</h2>

                <div style={{
                    background: 'var(--badge-warn-bg)', border: '1px solid var(--badge-warn-text)',
                    borderRadius: 10, padding: '14px 16px', marginBottom: 20,
                    fontSize: 13, color: 'var(--badge-warn-text)', lineHeight: 1.6,
                }}>
                    ⚠️ Самостоятельный сброс пароля недоступен.
                </div>

                <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 20, lineHeight: 1.6 }}>
                    Для восстановления доступа обратитесь к администратору или директору агентства.
                    Они создадут новый временный пароль, который вы сможете сменить при следующем входе.
                </p>

                <div style={{
                    background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)',
                    borderRadius: 10, padding: '14px 16px', marginBottom: 24, fontSize: 13,
                }}>
                    <div style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>Как восстановить доступ:</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, color: 'var(--text-secondary)' }}>
                        <div>1. Свяжитесь с директором или суперадминистратором</div>
                        <div>2. Попросите создать новый временный пароль</div>
                        <div>3. Войдите с временным паролем</div>
                        <div>4. Система предложит сменить пароль при входе</div>
                    </div>
                </div>

                <button
                    className="btn btn--primary"
                    style={{ width: '100%', justifyContent: 'center', marginBottom: 12 }}
                    onClick={() => navigate('/login')}
                >
                    Вернуться ко входу
                </button>

                <div style={{ textAlign: 'center' }}>
                    <Link to="/login" style={{ fontSize: 12, color: 'var(--text-muted)', textDecoration: 'none' }}>
                        ← Назад
                    </Link>
                </div>
            </div>
        </div>
    )
}