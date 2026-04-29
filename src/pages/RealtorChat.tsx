import RealtorChatSidebar from "../components/chat/RealtorChatSidebar"
import RealtorChatWindow from "../components/chat/RealtorChatWindow"

export default function RealtorChat() {
    return (
        <div className="rc-layout">
            <RealtorChatSidebar />
            <RealtorChatWindow />
        </div>
    )
}
