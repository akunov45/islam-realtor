import { useState, useEffect, useRef } from "react"
import ChatInput from "./ChatInput"
import ChatMessage from "./ChatMessage"

export type Message = {
    id: number
    role: "user" | "assistant"
    text: string
    timestamp: number
    status: "sending" | "sent" | "delivered"
}

export default function ChatWindow() {
    const bottomRef = useRef<HTMLDivElement | null>(null)
    const [loading, setLoading] = useState(false)
    const [messages, setMessages] = useState<Message[]>([])

   
    useEffect(() => {
        const history: Message[] = [
            {
                id: 1,
                role: "assistant",
                text: "Hello! How can I help?",
                timestamp: Date.now(),
                status: "delivered",
            },
            {
                id: 2,
                role: "user",
                text: "Hi!",
                timestamp: Date.now(),
                status: "delivered",
            },
        ]

        setMessages(history)
    }, [])

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" })
    }, [messages])

   
    const handleSend = async (text: string) => {
        const newMessage: Message = {
            id: Date.now(),
            role: "user",
            text,
            timestamp: Date.now(),
            status: "sent",
        }

        setMessages((prev) => [...prev, newMessage])

        setLoading(true)

        
        setTimeout(() => {
            setLoading(false)
        }, 1000)
    }

    return (
        <div className="flex flex-col flex-1">
            
            <div className="flex-1 p-4 space-y-3 overflow-y-auto">
                {messages.map((msg) => (
                    <ChatMessage
                        key={msg.id}
                        role={msg.role}
                        text={msg.text}
                        timestamp={msg.timestamp}
                        status={msg.status}
                    />
                ))}

                <div ref={bottomRef} />
            </div>

            
            <ChatInput onSend={handleSend} loading={loading} />
        </div>
    )
}