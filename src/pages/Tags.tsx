import AppLayout from "../components/AppLayout"
import { useState } from "react"

const initialTags = [
    { id: 1, name: "Горячий", color: "#ef4444", count: 8 },
    { id: 2, name: "Тёплый", color: "#f59e0b", count: 7 },
    { id: 3, name: "Холодный", color: "#6b7280", count: 5 },
    { id: 4, name: "Ипотека", color: "#3b82f6", count: 4 },
    { id: 5, name: "ЖК Рассвет", color: "#8b5cf6", count: 3 },
    { id: 6, name: "Срочно", color: "#ef4444", count: 2 },
    { id: 7, name: "Эконом-класс", color: "#10b981", count: 6 },
    { id: 8, name: "Первичный контакт", color: "#2563eb", count: 11 },
]

export default function Tags() {
    const [tags, setTags] = useState(initialTags)
    const [newTag, setNewTag] = useState("")
    const [newColor, setNewColor] = useState("#3b82f6")
    const [toast, setToast] = useState("")

    const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(""), 2000) }

    const addTag = () => {
        if (!newTag.trim()) return
        setTags(prev => [...prev, { id: Date.now(), name: newTag, color: newColor, count: 0 }])
        setNewTag("")
        showToast("Тег добавлен!")
    }

    const deleteTag = (id: number) => {
        setTags(prev => prev.filter(t => t.id !== id))
        showToast("Тег удалён")
    }

    return (
        <AppLayout title="Теги" breadcrumbs={[{ label: "Начало", path: "/dashboard" }, { label: "Теги" }]}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 20 }}>
                <div className="g-card">
                    <h3 style={{ margin: "0 0 16px", fontSize: 15, fontWeight: 700 }}>Все теги ({tags.length})</h3>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                        {tags.map(tag => (
                            <div key={tag.id} style={{ display: "flex", alignItems: "center", gap: 8, background: tag.color + "18", border: `1px solid ${tag.color}44`, borderRadius: 8, padding: "8px 12px" }}>
                                <div style={{ width: 10, height: 10, borderRadius: "50%", background: tag.color }} />
                                <span style={{ fontWeight: 600, fontSize: 13, color: "#111827" }}>{tag.name}</span>
                                <span style={{ fontSize: 11, color: "#9ca3af", background: "#f3f4f6", padding: "1px 6px", borderRadius: 10 }}>{tag.count}</span>
                                <button onClick={() => deleteTag(tag.id)} style={{ border: "none", background: "none", color: "#9ca3af", cursor: "pointer", fontSize: 14, padding: 0, lineHeight: 1 }}>✕</button>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="g-card">
                    <h3 style={{ margin: "0 0 16px", fontSize: 15, fontWeight: 700 }}>Добавить тег</h3>
                    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                        <div className="form-group">
                            <label className="form-label">Название</label>
                            <input className="form-input" placeholder="Название тега" value={newTag} onChange={e => setNewTag(e.target.value)} onKeyDown={e => e.key === "Enter" && addTag()} />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Цвет</label>
                            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                                {["#ef4444","#f59e0b","#10b981","#3b82f6","#8b5cf6","#ec4899","#6b7280","#1d4ed8"].map(c => (
                                    <div key={c} onClick={() => setNewColor(c)} style={{ width: 28, height: 28, borderRadius: "50%", background: c, cursor: "pointer", border: newColor === c ? "3px solid #111827" : "3px solid transparent" }} />
                                ))}
                            </div>
                        </div>
                        <button className="btn btn--primary" onClick={addTag}>+ Добавить тег</button>
                    </div>
                </div>
            </div>
            {toast && <div className="toast toast--success">✓ {toast}</div>}
        </AppLayout>
    )
}
