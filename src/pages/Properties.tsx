import { useState, useEffect, useCallback } from "react"
import AppLayout from "../components/AppLayout"
import { propertiesApi } from "../api/properties"
import { leadsApi } from "../api/leads"
import type { Property } from "../api/properties"

function formatMoney(val?: string | number | null) {
    if (!val) return "—"
    const n = parseFloat(String(val))
    if (isNaN(n)) return "—"
    if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`
    if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`
    return `$${n.toFixed(0)}`
}

type InteractStatus = "viewed" | "liked" | "disliked" | "requested"

const INTERACT_LABELS: Record<InteractStatus, string> = {
    viewed: "Просмотрен", liked: "Понравился",
    disliked: "Не понравился", requested: "Запрошен звонок",
}

export default function Properties() {
    const [properties, setProperties] = useState<Property[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState("")
    const [toast, setToast] = useState("")

    const [filters, setFilters] = useState({
        price_min: "", price_max: "", rooms: "", area_min: "", page: 1,
    })

    const [detailModal, setDetailModal] = useState<Property | null>(null)
    const [interactModal, setInteractModal] = useState<Property | null>(null)
    const [leadId, setLeadId] = useState("")
    const [interactStatus, setInteractStatus] = useState<InteractStatus>("viewed")
    const [interacting, setInteracting] = useState(false)

    const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(""), 3000) }

    const fetchProperties = useCallback(async () => {
        setLoading(true)
        setError("")
        try {
            const data = await propertiesApi.list({
                price_min: filters.price_min || undefined,
                price_max: filters.price_max || undefined,
                rooms: filters.rooms ? parseInt(filters.rooms) : undefined,
                area_min: filters.area_min || undefined,
                page: filters.page,
            })
            setProperties(data)
        } catch {
            setError("Ошибка загрузки объектов")
        } finally {
            setLoading(false)
        }
    }, [filters])

    useEffect(() => { fetchProperties() }, [fetchProperties])

    const handleInteract = async () => {
        if (!interactModal || !leadId) { showToast("Укажите ID лида"); return }
        setInteracting(true)
        try {
            await leadsApi.interactProperty(parseInt(leadId), {
                external_id: String(interactModal.id),
                title: interactModal.title ?? `Объект #${interactModal.id}`,
                price: String(interactModal.price ?? "0"),
                status: interactStatus,
            })
            showToast(`Взаимодействие записано: ${INTERACT_LABELS[interactStatus]}`)
            setInteractModal(null)
            setLeadId("")
        } catch {
            showToast("Ошибка записи взаимодействия")
        } finally {
            setInteracting(false)
        }
    }

    const handleReset = () => {
        setFilters({ price_min: "", price_max: "", rooms: "", area_min: "", page: 1 })
    }

    return (
        <AppLayout
            title="Объекты недвижимости"
            breadcrumbs={[{ label: "Дашборд", path: "/dashboard" }, { label: "Объекты" }]}
        >
            {/* Filters */}
            <div className="g-card" style={{ marginBottom: 16 }}>
                <div className="filters-row">
                    <div className="form-group" style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                        <label className="form-label" style={{ whiteSpace: "nowrap", marginBottom: 0 }}>Цена от</label>
                        <input className="form-input" style={{ width: 120 }} placeholder="500000"
                            value={filters.price_min}
                            onChange={e => setFilters(f => ({ ...f, price_min: e.target.value, page: 1 }))} />
                    </div>
                    <div className="form-group" style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                        <label className="form-label" style={{ whiteSpace: "nowrap", marginBottom: 0 }}>до</label>
                        <input className="form-input" style={{ width: 120 }} placeholder="2000000"
                            value={filters.price_max}
                            onChange={e => setFilters(f => ({ ...f, price_max: e.target.value, page: 1 }))} />
                    </div>
                    <select className="form-select" style={{ width: 130 }} value={filters.rooms}
                        onChange={e => setFilters(f => ({ ...f, rooms: e.target.value, page: 1 }))}>
                        <option value="">Все комнаты</option>
                        <option value="1">1-комн.</option>
                        <option value="2">2-комн.</option>
                        <option value="3">3-комн.</option>
                        <option value="4">4-комн.+</option>
                    </select>
                    <div className="form-group" style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                        <label className="form-label" style={{ whiteSpace: "nowrap", marginBottom: 0 }}>Площадь от</label>
                        <input className="form-input" style={{ width: 90 }} placeholder="40"
                            value={filters.area_min}
                            onChange={e => setFilters(f => ({ ...f, area_min: e.target.value, page: 1 }))} />
                        <span style={{ fontSize: 12, color: "var(--text-muted)" }}>м²</span>
                    </div>
                    <button className="btn btn--primary btn--sm" onClick={fetchProperties}>Найти</button>
                    <button className="btn btn--outline btn--sm" onClick={handleReset}>Сбросить</button>
                </div>
            </div>

            {error && (
                <div style={{ padding: "12px 16px", color: "#ef4444", fontSize: 13, marginBottom: 16 }}>⚠ {error}</div>
            )}

            {/* Properties grid */}
            {loading ? (
                <div className="empty-state"><div style={{ color: "var(--text-muted)" }}>Загрузка объектов...</div></div>
            ) : properties.length === 0 ? (
                <div className="empty-state">
                    <div className="empty-state__icon">🏠</div>
                    <div className="empty-state__title">Объекты не найдены</div>
                    <div className="empty-state__text">Попробуйте изменить фильтры</div>
                </div>
            ) : (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
                    {properties.map(prop => (
                        <div key={prop.id} className="g-card" style={{ padding: 0, overflow: "hidden", cursor: "pointer" }}
                            onClick={() => setDetailModal(prop)}>

                            {/* Image placeholder */}
                            <div style={{
                                height: 160,
                                background: prop.coverImage
                                    ? `url(${prop.coverImage}) center/cover no-repeat`
                                    : "linear-gradient(135deg, var(--accent-light), var(--bg-hover))",
                                display: "flex", alignItems: "center", justifyContent: "center",
                                position: "relative",
                            }}>
                                {!prop.coverImage && (
                                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="1.5" opacity="0.5">
                                        <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                                        <polyline points="9 22 9 12 15 12 15 22" />
                                    </svg>
                                )}
                                {prop.rooms && (
                                    <div style={{
                                        position: "absolute", top: 10, left: 10,
                                        background: "var(--accent)", color: "white",
                                        fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 6,
                                    }}>
                                        {prop.rooms}-комн.
                                    </div>
                                )}

                                <div style={{
                                    position: "absolute", top: 10, right: 10,
                                    background: "rgba(0,0,0,0.5)", color: "white",
                                    fontSize: 10, padding: "2px 8px", borderRadius: 6,
                                }}>
                                    #{prop.id}
                                </div>
                            </div>

                            {/* Info */}
                            <div style={{ padding: 14 }}>
                                <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)", marginBottom: 4, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                    {prop.title || `Объект #${prop.id}`}
                                </div>

                                {prop.address && (
                                    <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 8, display: "flex", alignItems: "center", gap: 4 }}>
                                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" /><circle cx="12" cy="10" r="3" /></svg>
                                        {prop.address}
                                    </div>
                                )}

                                <div style={{ display: "flex", gap: 10, marginBottom: 12, flexWrap: "wrap" }}>
                                    {prop.area && (
                                        <span style={{ fontSize: 12, color: "var(--text-secondary)" }}>
                                            📐 {prop.area} м²
                                        </span>
                                    )}
                                    {prop.rooms && (
                                        <span style={{ fontSize: 12, color: "var(--text-secondary)" }}>
                                            🚪 {prop.rooms} комн.
                                        </span>
                                    )}
                                </div>

                                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                                    <div style={{ fontSize: 16, fontWeight: 800, color: "var(--accent)" }}>
                                        {formatMoney(prop.price)}
                                    </div>
                                    <button
                                        className="btn btn--outline btn--sm"
                                        onClick={e => { e.stopPropagation(); setInteractModal(prop) }}
                                    >
                                        Привязать к лиду
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Pagination */}
            {!loading && properties.length > 0 && (
                <div style={{ display: "flex", justifyContent: "center", gap: 8, marginTop: 20 }}>
                    <button className="btn btn--outline btn--sm" disabled={filters.page === 1}
                        onClick={() => setFilters(f => ({ ...f, page: f.page - 1 }))}>← Назад</button>
                    <span style={{ fontSize: 13, color: "var(--text-muted)", display: "flex", alignItems: "center", padding: "0 8px" }}>
                        Страница {filters.page}
                    </span>
                    <button className="btn btn--outline btn--sm" disabled={properties.length < 20}
                        onClick={() => setFilters(f => ({ ...f, page: f.page + 1 }))}>Вперёд →</button>
                </div>
            )}

            {/* Detail Modal */}
            {detailModal && (
                <div className="modal-overlay" onClick={() => setDetailModal(null)}>
                    <div className="modal" style={{ maxWidth: 520 }} onClick={e => e.stopPropagation()}>
                        <div className="modal__header">
                            <div className="modal__title">{detailModal.title || `Объект #${detailModal.id}`}</div>
                            <button className="modal__close" onClick={() => setDetailModal(null)}>✕</button>
                        </div>

                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
                            {[
                                { label: "Цена", value: formatMoney(detailModal.price) },
                                { label: "Площадь", value: detailModal.area ? `${detailModal.area} м²` : "—" },
                                { label: "Комнат", value: detailModal.rooms ? String(detailModal.rooms) : "—" },
                                { label: "Адрес", value: detailModal.address ?? "—" },
                            ].map(row => (
                                <div key={row.label}>
                                    <div style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 3 }}>{row.label}</div>
                                    <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>{row.value}</div>
                                </div>
                            ))}
                        </div>

                        <div className="modal__footer">
                            <button className="btn btn--outline" onClick={() => setDetailModal(null)}>Закрыть</button>
                            <button className="btn btn--primary" onClick={() => { setInteractModal(detailModal); setDetailModal(null) }}>
                                Привязать к лиду
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Interact Modal */}
            {interactModal && (
                <div className="modal-overlay" onClick={() => setInteractModal(null)}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <div className="modal__header">
                            <div className="modal__title">Привязать к лиду</div>
                            <button className="modal__close" onClick={() => setInteractModal(null)}>✕</button>
                        </div>

                        <div style={{ padding: "10px 12px", background: "var(--bg-tertiary)", borderRadius: 9, border: "1px solid var(--border-color)", marginBottom: 16 }}>
                            <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>
                                {interactModal.title || `Объект #${interactModal.id}`}
                            </div>
                            <div style={{ fontSize: 12, color: "var(--accent)", fontWeight: 700, marginTop: 3 }}>
                                {formatMoney(interactModal.price)}
                            </div>
                        </div>

                        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                            <div className="form-group">
                                <label className="form-label">ID лида *</label>
                                <input className="form-input" type="number" placeholder="Например: 42"
                                    value={leadId} onChange={e => setLeadId(e.target.value)} autoFocus />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Тип взаимодействия</label>
                                <select className="form-select" value={interactStatus}
                                    onChange={e => setInteractStatus(e.target.value as InteractStatus)}>
                                    <option value="viewed">Просмотрен</option>
                                    <option value="liked">Понравился</option>
                                    <option value="disliked">Не понравился</option>
                                    <option value="requested">Запрошен звонок</option>
                                </select>
                            </div>
                        </div>

                        <div className="modal__footer">
                            <button className="btn btn--outline" onClick={() => setInteractModal(null)}>Отмена</button>
                            <button className="btn btn--primary" onClick={handleInteract} disabled={interacting || !leadId}>
                                {interacting ? "Сохранение..." : "Записать взаимодействие"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {toast && <div className="toast toast--success">✓ {toast}</div>}
        </AppLayout>
    )
}