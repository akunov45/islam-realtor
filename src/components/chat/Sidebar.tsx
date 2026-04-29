export default function Sidebar() {
    return (
        <div className="w-64 border-r p-4">
            <h2 className="font-bold mb-4">Chats</h2>

            <div className="space-y-2">
                <div className="p-2 rounded bg-gray-100 cursor-pointer">
                    Chat 1
                </div>
                <div className="p-2 rounded bg-gray-100 cursor-pointer">
                    Chat 2
                </div>
            </div>
        </div>
    )
}