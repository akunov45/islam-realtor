import AppLayout from "../components/AppLayout"

type CityTime = {
    city: string
    timezone: string
    offset: number 
}

const cities: CityTime[] = [
    { city: "Бишкек", timezone: "UTC+6", offset: 6 },
    { city: "Москва", timezone: "UTC+3", offset: 3 },
    { city: "Дубай", timezone: "UTC+4", offset: 4 },
    { city: "Астана", timezone: "UTC+5", offset: 5 }
]

function getTime(offset: number) {
    const now = new Date()

    const utc = now.getTime() + now.getTimezoneOffset() * 60000

    const cityTime = new Date(utc + 3600000 * offset)

    const date = cityTime.toLocaleDateString("ru-RU", {
        day: "2-digit",
        month: "short"
    })

    const time = cityTime.toLocaleTimeString("ru-RU", {
        hour: "2-digit",
        minute: "2-digit"
    })

    return { date, time }
}

export default function Time() {
    return (
        <AppLayout
            title="Время"
            breadcrumbs={[
                { label: "Начало", path: "/dashboard" },
                { label: "Время" }
            ]}
        >
            <div className="grid-2">
                {cities.map(({ city, timezone, offset }) => {
                    const { date, time } = getTime(offset)

                    return (
                        <div className="stat-card" key={city}>
                            <div className="stat-card__label">
                                {city} ({timezone})
                            </div>

                            <div
                                className="stat-card__value"
                                style={{ fontSize: 32, letterSpacing: -1 }}
                            >
                                {time}
                            </div>

                            <div className="stat-card__sub stat-card__sub--neutral">
                                {date}
                            </div>
                        </div>
                    )
                })}
            </div>
        </AppLayout>
    )
}