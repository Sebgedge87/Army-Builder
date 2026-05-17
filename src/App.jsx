import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import './theme.css'

import HomePage           from './pages/HomePage'
import LoginPage          from './pages/LoginPage'
import SignupPage         from './pages/SignupPage'
import ForgotPasswordPage from './pages/ForgotPasswordPage'
import BuilderPage        from './pages/BuilderPage'
import SettingsPage       from './pages/SettingsPage'
import AdminPage          from './pages/admin/AdminPage'
import InstallPrompt      from './components/pwa/InstallPrompt'
import UpdateAvailable    from './components/pwa/UpdateAvailable'

export default function App() {
  return (
    <BrowserRouter>
      <UpdateAvailable />
      <Routes>
        <Route path="/"            element={<HomePage />} />
        <Route path="/login"       element={<LoginPage />} />
        <Route path="/signup"      element={<SignupPage />} />
        <Route path="/forgot"      element={<ForgotPasswordPage />} />
        <Route path="/builder"     element={<BuilderPage />} />
        <Route path="/settings"    element={<SettingsPage />} />
        <Route path="/admin/*"     element={<AdminPage />} />
        <Route path="*"            element={<Navigate to="/" replace />} />
      </Routes>
      <InstallPrompt />
    </BrowserRouter>
  )
}
