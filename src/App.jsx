import { BrowserRouter, Routes, Route } from 'react-router-dom'
import BuilderPage from './pages/BuilderPage'
import StylePage from './pages/StylePage'
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'
import SettingsPage from './pages/SettingsPage'
import AdminPage from './pages/admin/AdminPage'
import HomePage from './pages/HomePage'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/"        element={<HomePage />} />
        <Route path="/builder" element={<BuilderPage />} />
        <Route path="/style"   element={<StylePage />} />
        <Route path="/login"   element={<LoginPage />} />
        <Route path="/signup"  element={<SignupPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/admin"   element={<AdminPage />} />
      </Routes>
    </BrowserRouter>
  )
}
