import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth, authErrorMessage } from '../hooks/useAuth'
import AuthLayout, {
  AuthField,
  AuthButton,
  AuthFooter,
  AuthLink,
  ErrorBanner,
} from '../components/auth/AuthLayout'

export default function ForgotPasswordPage() {
  const { resetPassword } = useAuth()
  const navigate          = useNavigate()

  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [sent, setSent]   = useState(false)
  const [busy, setBusy]   = useState(false)

  async function handleReset(e) {
    e.preventDefault()
    setError('')
    setBusy(true)
    try {
      await resetPassword(email)
      setSent(true)
    } catch (err) {
      const msg = authErrorMessage(err.code)
      if (msg) setError(msg)
    } finally {
      setBusy(false)
    }
  }

  if (sent) {
    return (
      <AuthLayout>
        <div style={{ textAlign: 'center', padding: '24px 0' }}>
          <div style={{ fontSize: 40, marginBottom: 16 }}>📬</div>
          <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>Check your email</h2>
          <p style={{ color: 'var(--color-text-secondary)', marginBottom: 24, fontSize: 'var(--font-size-md)' }}>
            We sent a reset link to <strong style={{ color: 'var(--color-text-primary)' }}>{email}</strong>
          </p>
          <AuthFooter>
            <AuthLink onClick={() => navigate('/login')}>Back to sign in</AuthLink>
          </AuthFooter>
        </div>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout>
      <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>Reset Password</h2>
      <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-md)', marginBottom: 24 }}>
        Enter your email and we&apos;ll send you a reset link.
      </p>

      <ErrorBanner message={error} />

      <form onSubmit={handleReset}>
        <AuthField
          label="Email"
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="you@example.com"
          autoComplete="email"
        />
        <AuthButton type="submit" disabled={busy}>
          {busy ? 'Sending…' : 'Send Reset Email'}
        </AuthButton>
      </form>

      <AuthFooter>
        <AuthLink onClick={() => navigate('/login')}>Back to sign in</AuthLink>
      </AuthFooter>
    </AuthLayout>
  )
}
