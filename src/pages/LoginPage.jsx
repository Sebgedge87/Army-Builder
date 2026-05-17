import { useState } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { useAuth, authErrorMessage } from '../hooks/useAuth'
import AuthLayout, {
  AuthField,
  AuthButton,
  GoogleButton,
  Divider,
  AuthFooter,
  AuthLink,
  ErrorBanner,
} from '../components/auth/AuthLayout'

export default function LoginPage() {
  const { login, loginWithGoogle }  = useAuth()
  const navigate                    = useNavigate()
  const location                    = useLocation()
  const redirectTo                  = location.state?.from?.pathname ?? '/builder'

  const [email, setEmail]     = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]     = useState('')
  const [busy, setBusy]       = useState(false)

  async function handleLogin(e) {
    e.preventDefault()
    setError('')
    setBusy(true)
    try {
      await login(email, password)
      navigate(redirectTo, { replace: true })
    } catch (err) {
      const msg = authErrorMessage(err.code)
      if (msg) setError(msg)
    } finally {
      setBusy(false)
    }
  }

  async function handleGoogle() {
    setError('')
    setBusy(true)
    try {
      await loginWithGoogle()
      navigate(redirectTo, { replace: true })
    } catch (err) {
      const msg = authErrorMessage(err.code)
      if (msg) setError(msg)
    } finally {
      setBusy(false)
    }
  }

  return (
    <AuthLayout>
      <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 24 }}>Welcome Back</h2>

      <ErrorBanner message={error} />

      <form onSubmit={handleLogin}>
        <AuthField
          label="Email"
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="you@example.com"
          autoComplete="email"
        />
        <AuthField
          label="Password"
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          placeholder="••••••••"
          autoComplete="current-password"
        />

        <div style={{ textAlign: 'right', marginBottom: 20, marginTop: -12 }}>
          <Link to="/forgot-password" style={{ fontSize: 'var(--font-size-base)', color: 'var(--color-text-secondary)', textDecoration: 'none' }}>
            Forgot password?
          </Link>
        </div>

        <AuthButton type="submit" disabled={busy}>
          {busy ? 'Signing in…' : 'Sign In'}
        </AuthButton>
      </form>

      <Divider />
      <GoogleButton onClick={handleGoogle} disabled={busy} />

      <AuthFooter>
        Don&apos;t have an account?{' '}
        <AuthLink onClick={() => navigate('/signup')}>Sign up</AuthLink>
      </AuthFooter>
    </AuthLayout>
  )
}
