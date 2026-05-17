export default function AdminPage() {
  if (!navigator.onLine) {
    return (
      <div style={{ padding: 'var(--space-8)', textAlign: 'center' }}>
        <h2>Admin requires an internet connection</h2>
        <p style={{ color: 'var(--color-text-secondary)', marginTop: 'var(--space-4)' }}>
          Please reconnect and try again.
        </p>
      </div>
    )
  }
  return (
    <div style={{ padding: 'var(--space-8)' }}>
      <h2>Admin Panel</h2>
      <p style={{ color: 'var(--color-text-secondary)' }}>Coming in Phase 7</p>
    </div>
  )
}
