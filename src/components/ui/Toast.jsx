import { useEffect } from 'react'

const typeStyles = {
  info:    { background: 'var(--color-bg-hover)',  borderColor: 'var(--color-border)' },
  success: { background: '#1a3d28',               borderColor: '#2a6040' },
  error:   { background: 'var(--color-accent)',    borderColor: '#a02d40' },
  warning: { background: '#4a3a00',               borderColor: '#7a6000' },
}

export default function Toast({ message, type = 'info', onClose, duration = 3000 }) {
  useEffect(() => {
    const t = setTimeout(onClose, duration)
    return () => clearTimeout(t)
  }, [onClose, duration])

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 'var(--space-5)',
        right: 'var(--space-5)',
        padding: 'var(--space-3) var(--space-4)',
        borderRadius: 'var(--radius-md)',
        border: `1px solid ${typeStyles[type].borderColor}`,
        background: typeStyles[type].background,
        color: 'var(--color-text-primary)',
        fontSize: 'var(--font-size-md)',
        zIndex: 300,
        maxWidth: 320,
        boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
      }}
    >
      {message}
    </div>
  )
}
