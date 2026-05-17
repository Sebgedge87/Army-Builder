export default function Stat({ label, value, size = 'md' }) {
  const valueSize = size === 'lg' ? 'var(--font-size-xl)' : 'var(--font-size-base)'
  const labelSize = size === 'lg' ? 'var(--font-size-sm)' : 'var(--font-size-xs)'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
      <span
        style={{
          color: 'var(--color-text-secondary)',
          fontSize: labelSize,
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
        }}
      >
        {label}
      </span>
      <span
        style={{
          color: 'var(--color-text-primary)',
          fontWeight: 700,
          fontSize: valueSize,
        }}
      >
        {value ?? '—'}
      </span>
    </div>
  )
}
