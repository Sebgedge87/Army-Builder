import { useState, useRef } from 'react'
import Button from '../ui/Button'
import { downloadTxt } from '../../lib/export/txt'
import { downloadJSON, importFromJSON } from '../../lib/export/json'
import { exportToPDF } from '../../lib/export/pdf'

export default function ShareModal({
  name, faction, entries, totalPoints, pointLimit,
  armyId, isPublic, shareToken,
  onTogglePublic, allUnits, onImport, onClose,
}) {
  const [copied, setCopied]         = useState(false)
  const [importError, setImportError] = useState(null)
  const fileRef = useRef(null)

  const shareUrl = shareToken ? `${window.location.origin}/army/${shareToken}` : null

  async function handleCopy() {
    if (!shareUrl) return
    await navigator.clipboard.writeText(shareUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  function handleFileChange(e) {
    const file = e.target.files?.[0]
    if (!file) return
    setImportError(null)
    const reader = new FileReader()
    reader.onload = ev => {
      try {
        const result = importFromJSON(ev.target.result, allUnits)
        onImport(result)
        onClose()
      } catch (err) {
        setImportError(err.message)
      }
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  return (
    <div
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: 'var(--space-4)' }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div style={{
        background: 'var(--color-bg-surface)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-lg)',
        padding: 'var(--space-5)',
        width: '100%',
        maxWidth: 440,
      }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
          <div style={{ fontWeight: 700, fontSize: 'var(--font-size-lg)' }}>Share & Export</div>
          <Button variant="ghost" size="sm" onClick={onClose}>✕</Button>
        </div>

        {/* ── Share link ── */}
        <SectionLabel>Share Link</SectionLabel>
        {!armyId ? (
          <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', padding: 'var(--space-3)', background: 'var(--color-bg-base)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', marginBottom: 'var(--space-4)' }}>
            Save your army first to generate a share link.
          </div>
        ) : (
          <div style={{ marginBottom: 'var(--space-4)' }}>
            <div style={{ display: 'flex', gap: 'var(--space-2)', alignItems: 'center', marginBottom: 'var(--space-2)' }}>
              <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', flex: 1 }}>
                {isPublic ? 'Anyone with the link can view' : 'Army is private'}
              </span>
              <Button size="sm" variant={isPublic ? 'danger' : 'secondary'} onClick={onTogglePublic}>
                {isPublic ? 'Make Private' : 'Make Public'}
              </Button>
            </div>
            {isPublic && shareUrl && (
              <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                <input
                  readOnly
                  value={shareUrl}
                  style={{
                    flex: 1,
                    padding: '8px 10px',
                    background: 'var(--color-bg-base)',
                    border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-md)',
                    color: 'var(--color-text-secondary)',
                    fontFamily: 'var(--font-family)',
                    fontSize: 'var(--font-size-sm)',
                    outline: 'none',
                    minWidth: 0,
                  }}
                />
                <Button size="sm" onClick={handleCopy}>{copied ? 'Copied!' : 'Copy'}</Button>
              </div>
            )}
          </div>
        )}

        <Divider />

        {/* ── Export ── */}
        <SectionLabel>Export</SectionLabel>
        <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap', marginBottom: 'var(--space-4)' }}>
          <Button size="sm" variant="secondary" onClick={() => downloadTxt(name, faction, entries, totalPoints, pointLimit)}>
            Text (.txt)
          </Button>
          <Button size="sm" variant="secondary" onClick={() => downloadJSON(name, faction, entries)}>
            JSON (.json)
          </Button>
          <Button size="sm" variant="secondary" onClick={() => exportToPDF(name, faction, entries, totalPoints, pointLimit)}>
            PDF (.pdf)
          </Button>
        </div>

        <Divider />

        {/* ── Import ── */}
        <SectionLabel>Import</SectionLabel>
        <div>
          <Button size="sm" variant="secondary" onClick={() => fileRef.current?.click()}>
            Import JSON
          </Button>
          <input ref={fileRef} type="file" accept=".json" onChange={handleFileChange} style={{ display: 'none' }} />
          {importError && (
            <div style={{ marginTop: 'var(--space-2)', fontSize: 'var(--font-size-sm)', color: '#e05a6a' }}>
              {importError}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function SectionLabel({ children }) {
  return (
    <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 'var(--space-2)' }}>
      {children}
    </div>
  )
}

function Divider() {
  return <div style={{ height: 1, background: 'var(--color-border)', margin: 'var(--space-4) 0' }} />
}
