import { Link } from 'react-router-dom'

export default function HomePage() {
  return (
    <div style={{ padding: 'var(--space-8)', textAlign: 'center' }}>
      <h1 style={{ fontSize: 'var(--text-3xl)', marginBottom: 'var(--space-4)' }}>
        CFB Army Builder
      </h1>
      <p style={{ color: 'var(--color-text-secondary)', marginBottom: 'var(--space-8)' }}>
        Classic Fantasy Battles — 6,000pt army builder
      </p>
      <Link to="/builder" style={{ color: 'var(--color-primary)' }}>Go to Builder</Link>
    </div>
  )
}
