export default function AppShell({ children }) {
  return (
    <div
      style={{
        width: '100vw',
        height: '100vh',
        background: 'var(--color-bg-base)',
        color: 'var(--color-text-primary)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      {children}
    </div>
  )
}
