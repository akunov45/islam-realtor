type PropertyCard = {
    id: number
    title: string
    price: string
    type: string
    tag: string
    image?: string
}

type Props = {
    role: "user" | "assistant"
    text: string
    timestamp: number
    status: "sending" | "sent" | "delivered"
    properties?: PropertyCard[]
    agentName?: string
}

const formatTime = (ts: number) =>
    new Date(ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })

function PropertyCardItem({ card }: { card: PropertyCard }) {
    return (
        <div className="rc-property-card">
            <div className="rc-property-card__image">
                {card.image ? (
                    <img src={card.image} alt={card.title} />
                ) : (
                    <div className="rc-property-card__image-placeholder" />
                )}
                <div className="rc-property-card__tags">
                    <span className="rc-property-card__tag rc-property-card__tag--buy">Купить</span>
                    <span className="rc-property-card__tag rc-property-card__tag--type">{card.type}</span>
                </div>
            </div>
            <div className="rc-property-card__info">
                <div className="rc-property-card__title">{card.title}</div>
                <div className="rc-property-card__price">{card.price}</div>
            </div>
        </div>
    )
}

export default function RealtorChatMessage({ role, text, timestamp, status, properties, agentName }: Props) {
    const isUser = role === "user"

    return (
        <div className={`rc-message ${isUser ? "rc-message--user" : "rc-message--assistant"}`}>
            {!isUser && (
                <div className="rc-message__avatar">
                    <div className="rc-message__avatar-img">С</div>
                </div>
            )}

            <div className="rc-message__content">
                {!isUser && (
                    <div className="rc-message__agent-name">{agentName ?? "Сара"}</div>
                )}

                <div className={`rc-message__bubble ${isUser ? "rc-message__bubble--user" : "rc-message__bubble--assistant"}`}>
                    <p className="rc-message__text">{text}</p>
                </div>

                {properties && properties.length > 0 && (
                    <div className="rc-message__properties">
                        {properties.map((card) => (
                            <PropertyCardItem key={card.id} card={card} />
                        ))}
                    </div>
                )}

                <div className={`rc-message__meta ${isUser ? "rc-message__meta--user" : ""}`}>
                    <span className="rc-message__time">{formatTime(timestamp)}</span>
                    {isUser && <span className="rc-message__status">{status === "delivered" ? "✓✓" : "✓"}</span>}
                </div>
            </div>

            {isUser && (
                <div className="rc-message__avatar rc-message__avatar--user">
                    <div className="rc-message__avatar-img rc-message__avatar-img--user">В</div>
                </div>
            )}
        </div>
    )
}
