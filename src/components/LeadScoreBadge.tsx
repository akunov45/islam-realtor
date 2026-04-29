type Props = {
    score: number
}

export default function LeadScoreBadge({ score }: Props) {
    let color = ""

    if (score < 40) color = "bg-red-500"
    else if (score <= 70) color = "bg-yellow-400"
    else color = "bg-green-500"

    return (
        <span className={`${color} text-white px-2 py-1 rounded`}>
            {score}
        </span>
    )
}