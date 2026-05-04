import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import AppLayout from "../components/AppLayout"
import { usersApi } from "../api/users"
import { useAuth } from "../store/authStore"
import type { User } from "../types/api"

const ROLE_LABELS: Record<string, string> = {
    agent: "Агент", director: "Директор", superadmin: "Суперадмин",
    lawyer: "Юрист", buyer: "Покупатель", seller: "Продавец",
}

export default function Settings() {
    const navigate = useNavigate()
    const { user: currentUser } = useAuth()

    const [toast, setToast] = useState("")
    const [users, setUsers] = useState<User[]>([])
    const [loading, setLoading] = useState(true)
    const [togglingId, setTogglingId] = useState<string | number | null>(null)

    const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(""), 2500) }

    const isAdmin = currentUser?.role === "director" || currentUser?.role === "superadmin"

    const loadUsers = async () => {
        setLoading(true)
        try {
            const data = await usersApi.list()
            setUsers(data)
        } catch {
            showToast("Ошибка загрузки пользователей")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => { loadUsers() }, [])

    const handleToggleBlock = async (user: User) => {
        setTogglingId(user.id)
        try {
            await usersApi.toggleBlock(user.id)
            setUsers(prev => prev.map(u =>
                u.id === user.id ? { ...u, is_blocked: !u.is_blocked } : u
            ))
            showToast(`${user.first_name} ${user.is_blocked ? "разблокирован" : "заблокирован"}`)
        } catch {
            showToast("Ошибка изменения статуса")
        } finally {
            setTogglingId(null)
        }
    }

    const staffUsers = users.filter(u =>
        ["agent", "director", "superadmin", "lawyer"].includes(u.role as string)
    )

    return (
        <AppLayout
            title="Настройки"
            breadcrumbs={[{ label: "Дашборд", path: "/dashboard" }, { label: "Настройки" }]}
            actions={
                isAdmin ? (
                    <button className="btn btn--primary btn--sm" onClick={() => navigate("/create-staff")}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="12" y1="5" x2="12" y2="19" />
                            <line x1="5" y1="12" x2="19" y2="12" />
                        </svg>
                        Добавить сотрудника
                    </button>
                ) : undefined
            }
        >
            <div className="g-card" style={{ padding: 0, overflow: "hidden" }}>
                <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border-color)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div>
                        <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: "var(--text-primary)" }}>Команда</h3>
                        <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>
                            {staffUsers.length} сотрудников
                        </div>
                    </div>
                    <button className="btn btn--outline btn--sm" onClick={loadUsers}>
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="23 4 23 10 17 10" />
                            <path d="M20.49 15a9 9 0 11-2.12-9.36L23 10" strokeLinecap="round" />
                        </svg>
                        Обновить
                    </button>
                </div>

                <div style={{ overflowX: "auto" }}>
                    <table className="g-table">
                        <thead>
                            <tr>
                                <th>Сотрудник</th>
                                <th>Email</th>
                                <th>Роль</th>
                                <th>Статус</th>
                                {isAdmin && <th>Действия</th>}
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={isAdmin ? 5 : 4}>
                                        <div className="empty-state" style={{ padding: "40px 0" }}>
                                            <div style={{ color: "var(--text-muted)", fontSize: 13 }}>Загрузка...</div>
                                        </div>
                                    </td>
                                </tr>
                            ) : staffUsers.length === 0 ? (
                                <tr>
                                    <td colSpan={isAdmin ? 5 : 4}>
                                        <div className="empty-state">
                                            <div className="empty-state__icon">👥</div>
                                            <div className="empty-state__title">Нет сотрудников</div>
                                        </div>
                                    </td>
                                </tr>
                            ) : staffUsers.map(u => (
                                <tr key={String(u.id)}>
                                    <td>
                                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                            <div style={{
                                                width: 32, height: 32, borderRadius: "50%", flexShrink: 0,
                                                background: u.is_blocked ? "var(--bg-hover)" : "var(--accent-light)",
                                                color: u.is_blocked ? "var(--text-muted)" : "var(--accent)",
                                                display: "flex", alignItems: "center", justifyContent: "center",
                                                fontSize: 12, fontWeight: 700,
                                            }}>
                                                {u.first_name?.charAt(0)?.toUpperCase() ?? "?"}
                                            </div>
                                            <div>
                                                <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>
                                                    {u.first_name} {u.last_name}
                                                    {u.id === currentUser?.id && (
                                                        <span style={{ marginLeft: 6, fontSize: 10, background: "var(--accent-light)", color: "var(--accent)", padding: "1px 6px", borderRadius: 10 }}>
                                                            Вы
                                                        </span>
                                                    )}
                                                </div>
                                                <div style={{ fontSize: 11, color: "var(--text-muted)" }}>#{String(u.id)}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td style={{ fontSize: 13, color: "var(--text-secondary)" }}>{u.email}</td>
                                    <td>
                                        <span style={{
                                            fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 20,
                                            background: u.role === "director" || u.role === "superadmin"
                                                ? "var(--badge-warn-bg)" : "var(--accent-light)",
                                            color: u.role === "director" || u.role === "superadmin"
                                                ? "var(--badge-warn-text)" : "var(--accent)",
                                        }}>
                                            {ROLE_LABELS[u.role as string] ?? u.role}
                                        </span>
                                    </td>
                                    <td>
                                        {u.is_blocked ? (
                                            <span style={{ background: "var(--badge-err-bg)", color: "var(--badge-err-text)", fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 20 }}>
                                                Заблокирован
                                            </span>
                                        ) : (
                                            <span style={{ background: "var(--score-high-bg)", color: "var(--score-high-text)", fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 20 }}>
                                                Активен
                                            </span>
                                        )}
                                    </td>
                                    {isAdmin && (
                                        <td>
                                            {u.id !== currentUser?.id && (
                                                <button
                                                    className={`btn btn--sm ${u.is_blocked ? "btn--primary" : "btn--outline"}`}
                                                    style={{ fontSize: 12 }}
                                                    disabled={togglingId === u.id}
                                                    onClick={() => handleToggleBlock(u)}
                                                >
                                                    {togglingId === u.id ? "..." : u.is_blocked ? "Разблокировать" : "Заблокировать"}
                                                </button>
                                            )}
                                        </td>
                                    )}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {toast && <div className="toast toast--success">✓ {toast}</div>}
        </AppLayout>
    )
}