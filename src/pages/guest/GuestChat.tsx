import { useState, useRef, useEffect } from 'react'
import { useAuth } from '../../store/authStore'
import GuestLayout from './GuestLayout'

type Message = { id: number; from: 'agent' | 'client'; text: string; time: string }

const initialMessages: Message[] = [
    { id: 1, from: 'agent', text: 'Здравствуйте! Я ваш персональный агент по недвижимости. Чем могу помочь?', time: '09:00' },
    { id: 2, from: 'agent', text: 'Я уже изучила ваши предпочтения и подобрала несколько отличных вариантов в вашем бюджете.', time: '09:01' },
    { id: 3, from: 'client', text: 'Отлично! Хотелось бы посмотреть варианты в центре города.', time: '09:15' },
    { id: 4, from: 'agent', text: 'Конечно! Могу предложить ЖК Рассвет на ул. Манаса — 3-комнатная, 85 м², $1 200 000. Есть также несколько вариантов в мкр. Джал. Когда вам удобно назначить просмотр?', time: '09:17' },
]

export default function GuestChat() {
    const { user } = useAuth()
    const [messages, setMessages] = useState<Message[]>(initialMessages)
    const [input, setInput] = useState('')
    const messagesEndRef = useRef<HTMLDivElement>(null)

    const initials = user
        ? (`${user.first_name?.[0] ?? ''}${user.last_name?.[0] ?? ''}`.toUpperCase() || 'К')
        : 'К'

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages])

    const handleSend = () => {
        if (!input.trim()) return
        const now = new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })
        const newMsg: Message = { id: Date.now(), from: 'client', text: input, time: now }
        setMessages(prev => [...prev, newMsg])
        setInput('')

        // Имитация ответа агента
        setTimeout(() => {
            setMessages(prev => [...prev, {
                id: Date.now() + 1,
                from: 'agent',
                text: 'Получила ваше сообщение! Отвечу в течение нескольких минут.',
                time: new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }),
            }])
        }, 1200)
    }

    return (
        <GuestLayout>
            <div className="gp-chat-layout">
                {/* Sidebar */}
                <div className="gp-chat-sidebar">
                    <div className="gp-chat-sidebar__header">Сообщения</div>
                    <div className="gp-chat-sidebar__agent">
                        <div className="gp-chat-sidebar__agent-av">
                            А
                            <div className="gp-chat-sidebar__online" />
                        </div>
                        <div>
                            <div className="gp-chat-sidebar__agent-name">Анна Сейткали</div>
                            <div className="gp-chat-sidebar__agent-status">Онлайн</div>
                        </div>
                    </div>
                </div>

                {/* Chat window */}
                <div className="gp-chat-window">
                    <div className="gp-chat-window__header">
                        <div className="gp-chat-window__av">
                            А
                            <div className="gp-chat-window__online" />
                        </div>
                        <div>
                            <div className="gp-chat-window__name">Анна Сейткали</div>
                            <div className="gp-chat-window__status">● Онлайн · Старший риелтор</div>
                        </div>
                    </div>

                    <div className="gp-chat-window__messages">
                        {messages.map(msg => (
                            <div key={msg.id} className={`gp-msg gp-msg--${msg.from}`}>
                                <div className={`gp-msg__av gp-msg__av--${msg.from}`}>
                                    {msg.from === 'agent' ? 'А' : initials}
                                </div>
                                <div>
                                    <div className={`gp-msg__bubble gp-msg__bubble--${msg.from}`}>
                                        {msg.text}
                                    </div>
                                    <div className="gp-msg__time">{msg.time}</div>
                                </div>
                            </div>
                        ))}
                        <div ref={messagesEndRef} />
                    </div>

                    <div className="gp-chat-input">
                        <input
                            className="gp-chat-input__field"
                            placeholder="Напишите сообщение..."
                            value={input}
                            onChange={e => setInput(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && handleSend()}
                        />
                        <button className="gp-chat-input__send" onClick={handleSend}>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" /></svg>
                        </button>
                    </div>
                </div>
            </div>
        </GuestLayout>
    )
}
