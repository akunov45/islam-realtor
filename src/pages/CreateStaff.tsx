import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { usersApi } from '../api/users'
import { useAuth } from '../store/authStore'
import AppLayout from '../components/AppLayout'
import type { Role } from '../types/api'

const STAFF_ROLES: { value: Role; label: string; forRoles: Role[] }[] = [
    { value: 'agent', label: 'Агент', forRoles: ['director', 'superadmin'] },
    { value: 'lawyer', label: 'Юрист', forRoles: ['director', 'superadmin'] },
    { value: 'director', label: 'Директор', forRoles: ['superadmin'] },
    { value: 'superadmin', label: 'Суперадмин', forRoles: ['superadmin'] },
]

export default function CreateStaff() {
    const navigate = useNavigate()
    const { user } = useAuth()
    const availableRoles = STAFF_ROLES.filter(r => user?.role && r.forRoles.includes(user.role))
    const [form, setForm] = useState({ email: '', first_name: '', last_name: '', role: availableRoles[0]?.value ?? 'agent' })
    const [error, setError] = useState('')
    const [success, setSuccess] = useState<{ email: string; role: string } | null>(null)
    const [loading, setLoading] = useState(false)

    const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setForm(f => ({ ...f, [k]: e.target.value }))

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault(); setError(''); setLoading(true)
        try {
            await usersApi.createStaff({ email: form.email, first_name: form.first_name, last_name: form.last_name || undefined, role: form.role as Role })
            setSuccess({ email: form.email, role: availableRoles.find(r => r.value === form.role)?.label ?? form.role })
            setForm({ email: '', first_name: '', last_name: '', role: availableRoles[0]?.value ?? 'agent' })
        } catch (err: unknown) {
            const msg = (err as { response?: { data?: { error?: string; message?: string } } })?.response?.data
            setError(msg?.error ?? msg?.message ?? 'Ошибка создания сотрудника')
        } finally { setLoading(false) }
    }

    return (
        <AppLayout title="Создать сотрудника" breadcrumbs={[{ label: 'Настройки', path: '/settings' }, { label: 'Создать сотрудника' }]}>
            <div style={{ maxWidth: 500, margin: '0 auto' }}>
                <div className="g-card">
                    <h2 style={{ fontSize: 17, fontWeight: 700, marginBottom: 6 }}>Новый сотрудник</h2>
                    <p style={{ fontSize: 13, color: '#6b7280', marginBottom: 20 }}>Пароль генерируется автоматически и отправляется на email.</p>

                    {error && <div className="auth-error" style={{ marginBottom: 16 }}>{error}</div>}
                    {success && (
                        <div style={{ background: '#dcfce7', border: '1px solid #86efac', borderRadius: 10, padding: '14px 16px', marginBottom: 20, fontSize: 13, color: '#15803d' }}>
                            ✓ Сотрудник <strong>{success.email}</strong> ({success.role}) создан. Данные для входа отправлены на email.
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        <div className="grid-2" style={{ marginBottom: 14 }}>
                            <div className="form-group"><label className="form-label">Имя *</label><input className="form-input" placeholder="Алия" value={form.first_name} onChange={set('first_name')} required autoFocus /></div>
                            <div className="form-group"><label className="form-label">Фамилия</label><input className="form-input" placeholder="Сейткали" value={form.last_name} onChange={set('last_name')} /></div>
                        </div>
                        <div className="form-group" style={{ marginBottom: 14 }}>
                            <label className="form-label">Email *</label>
                            <input className="form-input" type="email" placeholder="agent@crm.com" value={form.email} onChange={set('email')} required />
                        </div>
                        <div className="form-group" style={{ marginBottom: 24 }}>
                            <label className="form-label">Роль *</label>
                            <select className="form-select" value={form.role} onChange={set('role')}>
                                {availableRoles.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                            </select>
                        </div>
                        <div style={{ display: 'flex', gap: 10 }}>
                            <button type="button" className="btn btn--outline" onClick={() => navigate(-1)}>Отмена</button>
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