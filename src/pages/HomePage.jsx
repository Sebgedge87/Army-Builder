import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useSystem } from '../context/SystemContext'
import Button from '../components/ui/Button'

export default function HomePage() {
  const { user, loading } = useAuth()
  const system            = useSystem()
  const navigate          = useNavigate()

  if (loading) return null

  if (user) {
    return (
      <main style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'var(--color-bg-base)', padding: 'var(--space-5)', textAlign: 'center' }}>
        <div style={{ fontSize: 48, marginBottom: 'var(--space-3)' }}>⚔</div>
        <h1 style={{ fontSize: 'var(--font-size-xl)', fontWeight: 700, marginBottom: 'var(--space-2)' }}>
          {system.name}
        </h1>
        <p style={{ color: 'var(--color-text-secondary)', marginBottom: 'var(--space-5)', fontSize: 'var(--font-size-md)' }}>
          {system.description ?? 'Army builder'}
        </p>
        <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
          <Button onClick={() => navigate('/armies')}>My Armies</Button>
          <Button variant="secondary" onClick={() => navigate('/builder')}>New Army</Button>
        </div>
      </main>
    )
  }

  return (
    <main style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'var(--color-bg-base)', padding: 'var(--space-5)', textAlign: 'center' }}>
      <div style={{ fontSize: 48, marginBottom: 'var(--space-3)' }}>⚔</div>
      <h1 style={{ fontSize: 'var(--font-size-xl)', fontWeight: 700, marginBottom: 'var(--space-2)' }}>
        {system.name}
      </h1>
      <p style={{ color: 'var(--color-text-secondary)', marginBottom: 'var(--space-5)', fontSize: 'var(--font-size-md)', maxWidth: 420 }}>
        {system.description ?? 'Build and share armies for your tabletop wargame.'}
      </p>
      <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
        <Button onClick={() => navigate('/login')}>Sign in</Button>
        <Button variant="secondary" onClick={() => navigate('/signup')}>Create account</Button>
      </div>
    </main>
  )
}
