import { Routes, Route } from 'react-router-dom'
import { ThemeProvider } from './store/themeStore'
import './global.css'
import './chat-pages.css'
import './pages/guest/guest.css'


import { AuthProvider } from './store/authStore'
import { RequireAuth, RequireGuest, RequireRole, RequireStaff, RootRedirect } from './components/Guards'

import Dashboard from './pages/Dashboard'
import Leads from './pages/Leads'
import LeadDetail from './pages/LeadDetail'
import Dialogs from './pages/Dialogs'
import Scoring from './pages/Scoring'
import Settings from './pages/Settings'
import Messages from './pages/Messages'



import Login from './pages/Login'
import ForgotPassword from './pages/ForgotPassword'
import ChangePassword from './pages/ChangePassword'
import Profile from './pages/Profile'
import CreateStaff from './pages/CreateStaff'

import GuestHome from './pages/guest/GuestHome'
import GuestChat from './pages/guest/GuestChat'
import GuestProperties from './pages/guest/GuestProperties'
import GuestNews from './pages/guest/GuestNews'
import GuestTips from './pages/guest/GuestTips'
import GuestRequests from './pages/guest/GuestRequests'
import GuestProfile from './pages/guest/GuestProfile'
import GuestChangePassword from './pages/guest/GuestChangePassword'
import Deals from './pages/Deals'
import Agents from './pages/Agents'
import Tasks from './pages/Tasks'
import Properties from './pages/Properties'
import PipelineStages from './pages/PipelineStages'







function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<RootRedirect />} />

          {/* Публичные */}
          <Route path="/login" element={<RequireGuest><Login /></RequireGuest>} />
          <Route path="/forgot-password" element={<RequireGuest><ForgotPassword /></RequireGuest>} />

          {/* Смена пароля */}
          <Route path="/change-password" element={<RequireAuth><ChangePassword /></RequireAuth>} />

          {/* Профиль — доступен всем авторизованным */}
          <Route path="/profile" element={<RequireAuth><Profile /></RequireAuth>} />

          {/* Гостевой портал — только buyer/seller */}
          <Route path="/guest" element={<RequireAuth><RequireStaff guest><GuestHome /></RequireStaff></RequireAuth>} />
          <Route path="/guest/chat" element={<RequireAuth><RequireStaff guest><GuestChat /></RequireStaff></RequireAuth>} />
          <Route path="/guest/properties" element={<RequireAuth><RequireStaff guest><GuestProperties /></RequireStaff></RequireAuth>} />
          <Route path="/guest/news" element={<RequireAuth><RequireStaff guest><GuestNews /></RequireStaff></RequireAuth>} />
          <Route path="/guest/tips" element={<RequireAuth><RequireStaff guest><GuestTips /></RequireStaff></RequireAuth>} />
          <Route path="/guest/requests" element={<RequireAuth><RequireStaff guest><GuestRequests /></RequireStaff></RequireAuth>} />
          <Route path="/guest/profile" element={<RequireAuth><RequireStaff guest><GuestProfile /></RequireStaff></RequireAuth>} />
          <Route path="/guest/change-password" element={<RequireAuth><RequireStaff guest><GuestChangePassword /></RequireStaff></RequireAuth>} />

          {/* Страницы персонала — только staff */}
          <Route path="/dashboard" element={<RequireAuth><RequireStaff><Dashboard /></RequireStaff></RequireAuth>} />
          <Route path="/leads" element={<RequireAuth><RequireStaff><Leads /></RequireStaff></RequireAuth>} />
          <Route path="/leads/:id" element={<RequireAuth><RequireStaff><LeadDetail /></RequireStaff></RequireAuth>} />
          <Route path="/dialogs" element={<RequireAuth><RequireStaff><Dialogs /></RequireStaff></RequireAuth>} />
          <Route path="/scoring" element={<RequireAuth><RequireStaff><Scoring /></RequireStaff></RequireAuth>} />
          <Route path="/messages" element={<RequireAuth><RequireStaff><Messages /></RequireStaff></RequireAuth>} />
          <Route path="/settings" element={<RequireAuth><RequireStaff><Settings /></RequireStaff></RequireAuth>} />
          <Route path="/deals" element={<RequireAuth><RequireStaff><Deals /></RequireStaff></RequireAuth>} />
          <Route path="/agents" element={<RequireAuth><RequireStaff><Agents /></RequireStaff></RequireAuth>} />
          <Route path="/tasks" element={<RequireAuth><RequireStaff><Tasks /></RequireStaff></RequireAuth>} />
          <Route path="/properties" element={<RequireAuth><RequireStaff><Properties /></RequireStaff></RequireAuth>} />
          <Route path="/pipeline" element={<RequireAuth><RequireStaff><PipelineStages /></RequireStaff></RequireAuth>} />



          {/* Только директор и суперадмин */}
          <Route path="/create-staff" element={
            <RequireAuth>
              <RequireRole roles={['director', 'superadmin']}>
                <CreateStaff />
              </RequireRole>
            </RequireAuth>
          } />
        </Routes>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App