import { useState, useEffect } from 'react'
import { onUpdateAvailable, applyUpdate } from '../../services/pwa'

const updateStyles = {
  bar: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    background: 'var(--color-primary)',
    color: 'var(--color-primary-text)',
    padding: 'var(--space-3) var(--space-6)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 'var(--space-4)',
    zIndex: 'var(--z-toast)',
    fontSize: 'var(--text-sm)',
  },
  btn: {
    padding: 'var(--space-2) var(--space-4)',
    borderRadius: 'var(--radius-md)',
    border: '1px solid rgba(255,255,255,0.4)',
    background: 'transparent',
    color: 'white',
    cursor: 'pointer',
    fontSize: 'var(--text-sm)',
    fontWeight: 'var(--weight-medium)',
    whiteSpace: 'nowrap',
  },
}

export default function UpdateAvailable() {
  const [pending, setPending] = useState(false)

  useEffect(() => {
    onUpdateAvailable(() => setPending(true))
  }, [])

  if (!pending) return null

  return (
    <div style={updateStyles.bar}>
      <span>Update available</span>
      <button style={updateStyles.btn} onClick={applyUpdate}>
        Reload
      </button>
    </div>
  )
}
