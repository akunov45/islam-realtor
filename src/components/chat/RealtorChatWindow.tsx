import { useState, useEffect, useRef } from "react"
import RealtorChatMessage from "./RealtorChatMessage"
import RealtorChatInput from "./RealtorChatInput"

type PropertyCard = {
    id: number
    title: string
    price: string
    type: string
    tag: string
    image?: string
}

type Message = {
    id: number
    role: "user" | "assistant"
    text: string
    timestamp: number
    status: "sending" | "sent" | "delivered"
    properties?: PropertyCard[]
}

const mockProperties: PropertyCard[] = [
    { id: 1, title: "Pacific Heights Modern", price: "$1.45M", type: "Квартира", tag: "Купить" },
    { id: 2, title: "SoMa Loft Space", price: "$1.55M", type: "Квартира", tag: "Купить" },
]

const initialMessages: Message[] = [
    {
        id: 1,
        role: "assistant",
        text: "Привет! Я Сара, ваш персональный риелтор. Чтобы помочь вам найти дом мечты, не могли бы вы рассказать немного о вашем бюджете, предпочтительном районе и количестве комнат?",
        timestamp: Date.now() - 120000,
        status: "delivered",
    },
    {
        id: 2,
        role: "user",
        text: "Я ищу трёхкомнатную квартиру в Сан-Франциско, мой бюджет около $1.5 млн.",
        timestamp: Date.now() - 60000,
        status: "delivered",
    },
    {
        id: 3,
        role: "assistant",
        text: "Звучит замечательно! Я нашла несколько отличных вариантов в Сан-Франциско, которые соответствуют вашему запросу. Посмотрите на них:",
        timestamp: Date.now() - 30000,
        status: "delivered",
        properties: mockProperties,
    },
]

export default function RealtorChatWindow() {
    const bottomRef = useRef<HTMLDivElement | null>(null)
    const [loading, setLoading] = useState(false)
    const [messages, setMessages] = useState<Message[]>(initialMessages)

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" })
    }, [messages])

    const handleSend = async (text: string) => {
        const userMsg: Message = {
            id: Date.now(),
            role: "user",
            text,
            timestamp: Date.now(),
            status: "sent",
        }
        setMessages((prev) => [...prev, userMsg])
        setLoading(true)

        setTimeout(() => {
            const reply: Message = {
                id: Date.now() + 1,
                role: "assistant",
                text: "Отличный выбор! Я могу организовать просмотр любого из этих объектов. Когда вам удобно встретиться?",
                timestamp: Date.now(),
                status: "delivered",
            }
            setMessages((prev) => [...prev, reply])
            setLoading(false)
        }, 1200)
    }

    return (
        <div className="rc-window">
            <div className="rc-window__header">
                <div>
                    <h2 className="rc-window__title">Сан-Франциско</h2>
                    <div className="rc-window__subtitle">
                        <span className="rc-window__dot" />
                        Найдено 2 объекта
                    </div>
                </div>
                <div className="rc-window__header-actions">
                    <button className="rc-window__icon-btn" title="Поиск">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                            <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2"/>
                            <path d="M21 21l-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                        </svg>
                    </button>
                    <button className="rc-window__icon-btn" title="Уведомления">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                            <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                        </svg>
                    </button>
                    <div className="rc-window__user-avatar">А</div>
                </div>
            </div>

            <div className="rc-window__messages">
                {messages.map((msg) => (
                    <RealtorChatMessage key={msg.id} {...msg} />
                ))}
                {loading && (
                    <div className="rc-message rc-message--assistant">
                        <div className="rc-message__avatar">
                            <div className="rc-message__avatar-img">С</div>
                        </div>
                        <div className="rc-message__content">
                            <div className="rc-message__agent-name">Сара</div>
                            <div className="rc-message__bubble rc-message__bubble--assistant rc-message__bubble--typing">
                                <span /><span /><span />
                            </div>
                        </div>
                    </div>
                )}
                <div ref={bottomRef} />
            </div>

            <RealtorChatInput onSend={handleSend} loading={loading} />
        </div>
    )
}
