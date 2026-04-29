import { useState, useEffect, useRef } from "react"

type Message = {
    id: number
    role: "user" | "assistant" | "system"
    text: string
    timestamp: number
    status: "sending" | "sent" | "delivered"
    senderName?: string
}

const initialMessages: Message[] = [
    {
        id: 1,
        role: "assistant",
        senderName: "AI-Ассистент",
        text: "Добрый день! Я проанализировал профиль Ивана Иванова. Score: 85 — высокий приоритет. Рекомендую позвонить сегодня до 17:00.",
        timestamp: Date.now() - 300000,
        status: "delivered",
    },
    {
        id: 2,
        role: "user",
        senderName: "Анна (риелтор)",
        text: "Уже связалась. Иван подтвердил интерес к объекту в ЖК Рассвет, хочет приехать на просмотр в субботу.",
        timestamp: Date.now() - 240000,
        status: "delivered",
    },
    {
        id: 3,
        role: "assistant",
        senderName: "AI-Ассистент",
        text: "Отлично! Я уже создал задачу на просмотр на субботу в 14:00 и отправил подтверждение клиенту. Также подготовил сравнительный анализ похожих объектов — отправить вам?",
        timestamp: Date.now() - 180000,
        status: "delivered",
    },
    {
        id: 4,
        role: "user",
        senderName: "Анна (риелтор)",
        text: "Да, пришли анализ. И проверь, нет ли других горячих лидов на сегодня.",
        timestamp: Date.now() - 60000,
        status: "delivered",
    },
    {
        id: 5,
        role: "assistant",
        senderName: "AI-Ассистент",
        text: "Отправляю анализ: 3 аналогичных объекта в радиусе 2 км, средняя цена на 8% ниже. По горячим лидам: Мария Петрова (score 55) ожидает ответ по ипотечным вариантам более 2 часов — SLA нарушение через 15 минут.",
        timestamp: Date.now() - 30000,
        status: "delivered",
    },
]

const formatTime = (ts: number) =>
    new Date(ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })

export default function AdminChatWindow() {
    const bottomRef = useRef<HTMLDivElement | null>(null)
    const [loading, setLoading] = useState(false)
    const [messages, setMessages] = useState<Message[]>(initialMessages)
    const [inputValue, setInputValue] = useState("")

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" })
    }, [messages])

    const handleSend = () => {
        if (!inputValue.trim() || loading) return

        const userMsg: Message = {
            id: Date.now(),
            role: "user",
            senderName: "Анна (риелтор)",
            text: inputValue,
            timestamp: Date.now(),
            status: "sent",
        }
        setMessages((prev) => [...prev, userMsg])
        setInputValue("")
        setLoading(true)

        setTimeout(() => {
            const reply: Message = {
                id: Date.now() + 1,
                role: "assistant",
                senderName: "AI-Ассистент",
                text: "Принято! Обрабатываю запрос и подготавливаю данные...",
                timestamp: Date.now(),
                status: "delivered",
            }
            setMessages((prev) => [...prev, reply])
            setLoading(false)
        }, 1000)
    }

    return (
        <div className="admin-chat-window">
            {/* Header */}
            <div className="admin-chat-window__header">
                <div className="admin-chat-window__header-left">
                    <div className="admin-chat-window__avatar">ИИ</div>
                    <div>
                        <div className="admin-chat-window__client-name">Иван Иванов</div>
                        <div className="admin-chat-window__client-meta">
                            <span className="admin-chat-window__score admin-chat-window__score--high">Score: 85</span>
                            <span className="admin-chat-window__stage">Новый лид</span>
                        </div>
                    </div>
                </div>
                <div className="admin-chat-window__header-actions">
                    <button className="admin-chat-window__action-btn admin-chat-window__action-btn--primary">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                            <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.68 9.83a19.79 19.79 0 01-3.07-8.67A2 2 0 012.59 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.91 9.55a16 16 0 006.54 6.54l1.87-1.87a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" stroke="currentColor" strokeWidth="2"/>
                        </svg>
                        Позвонить
                    </button>
                    <button className="admin-chat-window__action-btn">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" stroke="currentColor" strokeWidth="2"/>
                            <polyline points="22,6 12,13 2,6" stroke="currentColor" strokeWidth="2"/>
                        </svg>
                        Email
                    </button>
                    <button className="admin-chat-window__icon-btn" title="Детали лида">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                            <circle cx="12" cy="12" r="1" fill="currentColor"/>
                            <circle cx="19" cy="12" r="1" fill="currentColor"/>
                            <circle cx="5" cy="12" r="1" fill="currentColor"/>
                        </svg>
                    </button>
                </div>
            </div>

            {/* SLA Alert */}
            <div className="admin-chat-window__sla-alert">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                    <line x1="12" y1="8" x2="12" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    <line x1="12" y1="16" x2="12.01" y2="16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
                SLA: срок ответа клиенту Мария Петрова истекает через 15 минут
                <button className="admin-chat-window__sla-btn">Ответить</button>
            </div>

            {/* Messages */}
            <div className="admin-chat-window__messages">
                {messages.map((msg) => (
                    <div
                        key={msg.id}
                        className={`admin-msg ${msg.role === "user" ? "admin-msg--user" : "admin-msg--assistant"}`}
                    >
                        <div className="admin-msg__sender">{msg.senderName}</div>
                        <div className="admin-msg__bubble">
                            {msg.text}
                        </div>
                        <div className="admin-msg__meta">{formatTime(msg.timestamp)}</div>
                    </div>
                ))}

                {loading && (
                    <div className="admin-msg admin-msg--assistant">
                        <div className="admin-msg__sender">AI-Ассистент</div>
                        <div className="admin-msg__bubble admin-msg__bubble--typing">
                            <span /><span /><span />
                        </div>
                    </div>
                )}

                <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div className="admin-chat-window__input-area">
                <div className="admin-chat-window__input-row">
                    <input
                        className="admin-chat-window__input"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleSend()}
                        placeholder="Напишите сообщение или задайте вопрос AI-ассистенту..."
                        disabled={loading}
                    />
                    <button
                        className={`admin-chat-window__send-btn ${inputValue.trim() ? "admin-chat-window__send-btn--active" : ""}`}
                        onClick={handleSend}
                        disabled={loading || !inputValue.trim()}
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                            <path d="M22 2L11 13M22 2L15 22l-4-9-9-4 20-7z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                    </button>
                </div>
                <div className="admin-chat-window__input-hints">
                    <span>↵ Отправить</span>
                    <span>/ Команды AI</span>
                    <span>@ Упомянуть</span>
                </div>
            </div>
        </div>
    )
}
