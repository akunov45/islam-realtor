import { useState } from "react"

type Props = {
    onSend: (text: string) => void
    loading: boolean
}

export default function ChatInput({ onSend, loading }: Props) {
    const [value, setValue] = useState("")

    const sendMessage = () => {
        if (!value.trim() || loading) return

        onSend(value)
        setValue("")
    }

    return (
        <div className="border-t p-3 flex gap-2">
            <input
                className="flex-1 border rounded p-2"
                value={value}
                disabled={loading}
                onChange={(e) => setValue(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                placeholder={loading ? "Sending..." : "Type message..."}
            />

            <button
                className={`px-4 rounded text-white ${loading ? "bg-gray-400" : "bg-black"
                    }`}
                onClick={sendMessage}
                disabled={loading}
            >
                {loading ? "..." : "Send"}
            </button>
        </div>
    )
}