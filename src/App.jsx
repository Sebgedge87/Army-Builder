import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import AuthProvider from './components/auth/AuthProvider'
import { useAuth } from './hooks/useAuth'
import RequireAuth from './components/RequireAuth'

import BuilderPage        from './pages/BuilderPage'
import ArmiesPage         from './pages/ArmiesPage'
import PublicArmyPage     from './pages/PublicArmyPage'
import StylePage          from './pages/StylePage'
import LoginPage          from './pages/LoginPage'
import SignupPage         from './pages/SignupPage'
import ForgotPasswordPage from './pages/ForgotPasswordPage'
import SettingsPage       from './pages/SettingsPage'
import AdminPage          from './pages/admin/AdminPage'
import UnitsTablePage     from './pages/admin/UnitsTablePage'
import ImportWizardPage   from './pages/admin/ImportWizardPage'
import UnitFormPage       from './pages/admin/UnitFormPage'
import HomePage           from './pages/HomePage'

function GuestOnly({ children }) {
  const { user, loading } = useAuth()
  if (loading) return null
  if (user) return <Navigate to="/builder" replace />
  return children
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public */}
          <Route path="/"                  element={<HomePage />} />
          <Route path="/style"             element={<StylePage />} />
          <Route path="/army/:shareToken"  element={<PublicArmyPage />} />

          {/* Guest-only — redirect logged-in users away */}
          <Route path="/login"           element={<GuestOnly><LoginPage /></GuestOnly>} />
          <Route path="/signup"          element={<GuestOnly><SignupPage /></GuestOnly>} />
          <Route path="/forgot-password" element={<GuestOnly><ForgotPasswordPage /></GuestOnly>} />

          {/* Protected */}
          <Route path="/armies"           element={<RequireAuth><ArmiesPage /></RequireAuth>} />
          <Route path="/builder"          element={<RequireAuth><BuilderPage /></RequireAuth>} />
          <Route path="/builder/:armyId"  element={<RequireAuth><BuilderPage /></RequireAuth>} />
          <Route path="/settings"         element={<RequireAuth><SettingsPage /></RequireAuth>} />
          <Route path="/admin"            element={<RequireAuth><AdminPage /></RequireAuth>}>
            <Route index                  element={<UnitsTablePage />} />
            <Route path="import"          element={<ImportWizardPage />} />
            <Route path="unit/new"        element={<UnitFormPage />} />
            <Route path="unit/:unitId"    element={<UnitFormPage />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
