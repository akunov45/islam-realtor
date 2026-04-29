import { useState } from "react"

type Props = {
    onSend: (text: string) => void
    loading: boolean
}

export default function RealtorChatInput({ onSend, loading }: Props) {
    const [value, setValue] = useState("")

    const send = () => {
        if (!value.trim() || loading) return
        onSend(value)
        setValue("")
    }

    return (
        <div className="rc-input">
            <button className="rc-input__attach" title="Прикрепить файл">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                    <path d="M12 8v8M8 12h8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
            </button>

            <input
                className="rc-input__field"
                value={value}
                disabled={loading}
                onChange={(e) => setValue(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && send()}
                placeholder="Опишите ваш идеальный дом..."
            />

            <button
                className={`rc-input__send ${value.trim() && !loading ? "rc-input__send--active" : ""}`}
                onClick={send}
                disabled={loading || !value.trim()}
                title="Отправить"
            >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <path d="M22 2L11 13M22 2L15 22l-4-9-9-4 20-7z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
            </button>
        </div>
    )
}
