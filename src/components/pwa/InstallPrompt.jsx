import { useState, useEffect } from 'react'
import { canInstall, promptInstall } from '../../services/pwa'

const installPromptStyles = {
  bar: {
    position: 'fixed',
    bottom: 0,
    left: 0,
    right: 0,
    background: 'var(--color-bg-elevated)',
    borderTop: '1px solid var(--color-border)',
    padding: 'var(--space-4) var(--space-6)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 'var(--space-4)',
    zIndex: 'var(--z-toast)',
  },
  text: {
    fontSize: 'var(--text-sm)',
    color: 'var(--color-text-secondary)',
  },
  actions: { display: 'flex', gap: 'var(--space-2)' },
  btn: {
    padding: 'var(--space-2) var(--space-4)',
    borderRadius: 'var(--radius-md)',
    border: 'none',
    cursor: 'pointer',
    fontSize: 'var(--text-sm)',
    fontWeight: 'var(--weight-medium)',
  },
  install: {
    background: 'var(--color-primary)',
    color: 'var(--color-primary-text)',
  },
  dismiss: {
    background: 'transparent',
    color: 'var(--color-text-muted)',
  },
}

export default function InstallPrompt() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    // Show only if the deferred prompt is available (Chromium only)
    const check = () => setVisible(canInstall())
    check()
    window.addEventListener('beforeinstallprompt', check)
    return () => window.removeEventListener('beforeinstallprompt', check)
  }, [])

  if (!visible) return null

  async function handleInstall() {
    const accepted = await promptInstall()
    if (accepted) setVisible(false)
  }

  return (
    <div style={installPromptStyles.bar}>
      <span style={installPromptStyles.text}>Install CFB Builder for offline use</span>
      <div style={installPromptStyles.actions}>
        <button
          style={{ ...installPromptStyles.btn, ...installPromptStyles.dismiss }}
          onClick={() => setVisible(false)}
        >
          Not now
        </button>
        <button
          style={{ ...installPromptStyles.btn, ...installPromptStyles.install }}
          onClick={handleInstall}
        >
          Install
        </button>
      </div>
    </div>
  )
}
