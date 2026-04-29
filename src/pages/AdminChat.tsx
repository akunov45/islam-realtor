import AdminChatSidebar from "../components/admin/AdminChatSidebar"
import AdminChatWindow from "../components/admin/AdminChatWindow"

export default function AdminChat() {
    return (
        <div className="admin-layout">
            <AdminChatSidebar />
            <div className="admin-layout__main">
                {/* Top bar */}
                <header className="admin-topbar">
                    <div className="admin-topbar__search">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                            <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2"/>
                            <path d="M21 21l-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                        </svg>
                        <input placeholder="Поиск лидов, сделок, объектов..." />
                    </div>
                    <div className="admin-topbar__actions">
                        <button className="admin-topbar__icon-btn" title="Уведомления">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                                <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0" stroke="currentColor" strokeWidth="2"/>
                            </svg>
                            <span className="admin-topbar__badge">3</span>
                        </button>
                        <button className="admin-topbar__icon-btn" title="Сообщения">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                                <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" stroke="currentColor" strokeWidth="2"/>
                            </svg>
                        </button>
                        <button className="admin-topbar__icon-btn" title="Настройки">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                                <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2"/>
                                <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" stroke="currentColor" strokeWidth="2"/>
                            </svg>
                        </button>
                        <div className="admin-topbar__avatar">А</div>
                    </div>
                </header>

                <AdminChatWindow />
            </div>
        </div>
    )
}
