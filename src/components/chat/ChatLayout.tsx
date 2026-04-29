import Sidebar from "./Sidebar"
import ChatWindow from "./ChatWindow"

export default function ChatLayout() {
    return (
        <div className="flex h-screen">
            <Sidebar />

            <div className="flex flex-col flex-1">
                <ChatWindow />
            </div>
        </div>
    )
}