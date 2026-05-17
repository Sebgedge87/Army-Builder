export default function Tag({ children, accent = false }) {
  return (
    <span
      style={{
        display: 'inline-block',
        padding: '2px 7px',
        background: accent ? 'var(--color-accent)' : 'var(--color-bg-hover)',
        border: `1px solid ${accent ? 'transparent' : 'var(--color-border)'}`,
        borderRadius: 'var(--radius-sm)',
        fontSize: 'var(--font-size-sm)',
        color: accent ? 'var(--color-text-primary)' : 'var(--color-text-secondary)',
        whiteSpace: 'nowrap',
      }}
    >
      {children}
    </span>
  )
}
