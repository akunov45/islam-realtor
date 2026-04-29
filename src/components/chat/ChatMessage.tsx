type Props = {
    role: "user" | "assistant"
    text: string
    timestamp: number
    status: "sending" | "sent" | "delivered"
}

const formatTime = (ts: number) => {
    const date = new Date(ts)
    return date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
    })
}

export default function ChatMessage({
    role,
    text,
    timestamp,
    status,
}: Props) {
    return (
        <div
            className={`p-3 rounded max-w-md flex flex-col gap-1 ${role === "user"
                    ? "bg-blue-500 text-white ml-auto"
                    : "bg-gray-200"
                }`}
        >
            <div>{text}</div>

            <div className="text-xs opacity-70 flex justify-between gap-3">
                <span>{formatTime(timestamp)}</span>
                <span>{status}</span>
            </div>
        </div>
    )
}