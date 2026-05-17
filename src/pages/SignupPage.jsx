import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
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

export default function SignupPage() {
  const { signup, loginWithGoogle } = useAuth()
  const navigate                    = useNavigate()

  const [displayName, setDisplayName]       = useState('')
  const [email, setEmail]                   = useState('')
  const [password, setPassword]             = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError]                   = useState('')
  const [busy, setBusy]                     = useState(false)

  async function handleSignup(e) {
    e.preventDefault()
    setError('')

    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }

    setBusy(true)
    try {
      await signup(email, password, displayName)
      navigate('/builder', { replace: true })
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
      navigate('/builder', { replace: true })
    } catch (err) {
      const msg = authErrorMessage(err.code)
      if (msg) setError(msg)
    } finally {
      setBusy(false)
    }
  }

  return (
    <AuthLayout>
      <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 24 }}>Create Account</h2>

      <ErrorBanner message={error} />

      <form onSubmit={handleSignup}>
        <AuthField
          label="Display name"
          value={displayName}
          onChange={e => setDisplayName(e.target.value)}
          placeholder="Commander"
          autoComplete="name"
        />
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
          autoComplete="new-password"
        />
        <AuthField
          label="Confirm password"
          type="password"
          value={confirmPassword}
          onChange={e => setConfirmPassword(e.target.value)}
          placeholder="••••••••"
          autoComplete="new-password"
        />

        <AuthButton type="submit" disabled={busy}>
          {busy ? 'Creating account…' : 'Create Account'}
        </AuthButton>
      </form>

      <Divider />
      <GoogleButton onClick={handleGoogle} disabled={busy} />

      <AuthFooter>
        Already have an account?{' '}
        <AuthLink onClick={() => navigate('/login')}>Sign in</AuthLink>
      </AuthFooter>
    </AuthLayout>
  )
}
