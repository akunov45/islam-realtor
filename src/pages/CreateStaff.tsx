import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { usersApi } from '../api/users'
import type { CreateStaffPayload, CreateStaffRole } from '../api/users'
import { useAuth } from '../store/authStore'
import AppLayout from '../components/AppLayout'
import type { Role } from '../types/api'

// API поддерживает только agent и director
const STAFF_ROLES: { value: CreateStaffRole; label: string; forRoles: Role[] }[] = [
    { value: 'agent', label: 'Агент', forRoles: ['director', 'superadmin'] },
    { value: 'director', label: 'Директор', forRoles: ['superadmin'] },
]

export default function CreateStaff() {
    const navigate = useNavigate()
    const { user } = useAuth()
    const availableRoles = STAFF_ROLES.filter(r => user?.role && r.forRoles.includes(user.role as Role))

    const [form, setForm] = useState<CreateStaffPayload>({
        email: '',
        first_name: '',
        last_name: '',
        phone: null,
        inn: '',
        role: availableRoles[0]?.value ?? 'agent',
    })
    const [error, setError] = useState('')
    const [success, setSuccess] = useState<{ email: string; role: string } | null>(null)
    const [loading, setLoading] = useState(false)

    const set = (k: keyof CreateStaffPayload) =>
        (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
            setForm(f => ({ ...f, [k]: e.target.value }))

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        if (!form.inn.trim()) { setError('ИНН обязателен'); return }
        setLoading(true)
        try {
            await usersApi.createStaff({
                email: form.email,
                first_name: form.first_name,
                last_name: form.last_name || undefined,
                phone: form.phone || null,
                inn: form.inn,
                role: form.role,
            })
            setSuccess({
                email: form.email,
                role: availableRoles.find(r => r.value === form.role)?.label ?? form.role ?? 'agent',
            })
            setForm({ email: '', first_name: '', last_name: '', phone: null, inn: '', role: availableRoles[0]?.value ?? 'agent' })
        } catch (err: unknown) {
            const msg = (err as { response?: { data?: { error?: string; message?: string } } })?.response?.data
            setError(msg?.error ?? msg?.message ?? 'Ошибка создания сотрудника')
        } finally {
            setLoading(false)
        }
    }

    return (
        <AppLayout
            title="Создать сотрудника"
            breadcrumbs={[{ label: 'Дашборд', path: '/dashboard' }, { label: 'Создать сотрудника' }]}
        >
            <div style={{ maxWidth: 520, margin: '0 auto' }}>
                <div className="g-card">
                    <h2 style={{ fontSize: 17, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>
                        Новый сотрудник
                    </h2>
                    <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 20 }}>
                        Временный пароль генерируется автоматически и отправляется на email.
                    </p>

                    {error && (
                        <div style={{
                            background: 'var(--badge-err-bg)', border: '1px solid var(--badge-err-text)',
                            borderRadius: 10, padding: '12px 16px', marginBottom: 16,
                            fontSize: 13, color: 'var(--badge-err-text)',
                        }}>
                            ⚠ {error}
                        </div>
                    )}

                    {success && (
                        <div style={{
                            background: 'var(--score-high-bg)', border: '1px solid var(--score-high-text)',
                            borderRadius: 10, padding: '14px 16px', marginBottom: 20,
                            fontSize: 13, color: 'var(--score-high-text)',
                        }}>
                            ✓ Сотрудник <strong>{success.email}</strong> ({success.role}) создан.
                            Данные для входа отправлены на email.
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        {/* Имя + Фамилия */}
                        <div className="grid-2" style={{ marginBottom: 14 }}>
                            <div className="form-group">
                                <label className="form-label">Имя *</label>
                                <input className="form-input" placeholder="Алия" value={form.first_name}
                                    onChange={set('first_name')} required autoFocus />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Фамилия</label>
                                <input className="form-input" placeholder="Сейткали" value={form.last_name ?? ''}
                                    onChange={set('last_name')} />
                            </div>
                        </div>

                        {/* Email */}
                        <div className="form-group" style={{ marginBottom: 14 }}>
                            <label className="form-label">Email *</label>
                            <input className="form-input" type="email" placeholder="agent@crm.com"
                                value={form.email} onChange={set('email')} required />
                        </div>

                        {/* Телефон */}
                        <div className="form-group" style={{ marginBottom: 14 }}>
                            <label className="form-label">Телефон</label>
                            <input className="form-input" type="tel" placeholder="+996700123456"
                                value={form.phone ?? ''} onChange={set('phone')} />
                        </div>

                        {/* ИНН — обязательное поле */}
                        <div className="form-group" style={{ marginBottom: 14 }}>
                            <label className="form-label">ИНН *</label>
                            <input className="form-input" placeholder="12345678901234"
                                value={form.inn} onChange={set('inn')} required maxLength={20} />
                            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
                                Идентификационный номер налогоплательщика
                            </div>
                        </div>

                        {/* Роль */}
                        <div className="form-group" style={{ marginBottom: 24 }}>
                            <label className="form-label">Роль *</label>
                            <select className="form-select" value={form.role ?? 'agent'} onChange={set('role')}>
                                {availableRoles.map(r => (
                                    <option key={r.value} value={r.value}>{r.label}</option>
                                ))}
                            </select>
                            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
                                Доступны только: Агент и Директор
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: 10 }}>
                            <button type="button" className="btn btn--outline" onClick={() => navigate(-1)}>
                                Отмена
                            </button>
                            <button className="btn btn--primary" style={{ flex: 1, justifyContent: 'center' }} disabled={loading}>
                                {loading ? 'Создание...' : 'Создать сотрудника'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </AppLayout>
    )
}