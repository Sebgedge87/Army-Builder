import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { db, storage } from '../../services/firebase'
import Button from '../../components/ui/Button'

const INIT = {
  step: 1,
  systemId:    '',
  name:        '',
  shortName:   '',
  description: '',
  branding: {
    accentColor:      '#8b2635',
    accentHoverColor: '#a02d40',
    appName:          '',
    logoUrl:          '',
  },
  rules: {
    pointLimit:            6000,
    allowMultipleFactions: false,
  },
  factions: [
    { id: 'Faction1', name: 'Faction1', availableToAll: false },
  ],
  statDefinitions: [
    { id: 'stat1', name: 'Stat 1', shortName: 'ST1', label: 'Stat 1 (ST1)' },
  ],
  saving:    false,
  uploading: false,
  error:     '',
}

export default function SystemWizardPage() {
  const { systemId } = useParams()
  const navigate     = useNavigate()
  const isNew        = !systemId || systemId === 'new'
  const [s, setS]    = useState(INIT)
  const upd = patch => setS(prev => ({ ...prev, ...patch }))
  const fileInputRef = useRef(null)

  async function uploadLogo(file) {
    if (!file) return
    const id = isNew
      ? (s.systemId || s.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''))
      : systemId
    if (!id) { upd({ error: 'Set a system name in Step 1 first so we know where to store the logo.' }); return }
    const ext = file.name.split('.').pop()
    upd({ uploading: true })
    try {
      const storageRef = ref(storage, `systems/${id}/logo.${ext}`)
      await uploadBytes(storageRef, file)
      const url = await getDownloadURL(storageRef)
      upd({ branding: { ...s.branding, logoUrl: url } })
    } finally {
      upd({ uploading: false })
    }
  }

  useEffect(() => {
    if (isNew) return
    getDoc(doc(db, 'systems', systemId)).then(snap => {
      if (!snap.exists()) return
      const d = snap.data()
      setS(prev => ({
        ...prev,
        systemId,
        name:        d.name        ?? '',
        shortName:   d.shortName   ?? '',
        description: d.description ?? '',
        branding:    { ...INIT.branding,  ...(d.branding        ?? {}) },
        rules:       { ...INIT.rules,     ...(d.rules           ?? {}) },
        factions:        d.factions        ?? INIT.factions,
        statDefinitions: d.statDefinitions ?? INIT.statDefinitions,
      }))
    })
  }, [systemId, isNew])

  async function handleSave() {
    const id = isNew
      ? (s.systemId || s.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''))
      : systemId
    if (!id) { upd({ error: 'System ID is required — set a name or slug in Step 1.', step: 1 }); return }
    upd({ saving: true })
    try {
      await setDoc(doc(db, 'systems', id), {
        systemId:        id,
        name:            s.name,
        shortName:       s.shortName,
        description:     s.description,
        branding:        s.branding,
        rules:           s.rules,
        factions:        s.factions,
        statDefinitions: s.statDefinitions,
        updatedAt:       new Date().toISOString(),
        ...(isNew ? { createdAt: new Date().toISOString() } : {}),
      }, { merge: true })
      navigate('/admin/systems')
    } finally {
      upd({ saving: false })
    }
  }

  const STEPS = ['Identity', 'Branding', 'Stats', 'Factions & Rules']

  return (
    <div style={{ padding: 'var(--space-5)', maxWidth: 700 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-5)' }}>
        <h1 style={{ fontSize: 'var(--font-size-xl)', fontWeight: 700 }}>
          {isNew ? 'New Game System' : `Edit: ${s.name || systemId}`}
        </h1>
        <Button variant="secondary" size="sm" onClick={() => navigate('/admin/systems')}>Cancel</Button>
      </div>

      {/* Step bar */}
      <div style={{ display: 'flex', gap: 0, marginBottom: 'var(--space-5)', borderBottom: '1px solid var(--color-border)', paddingBottom: 'var(--space-3)' }}>
        {STEPS.map((label, i) => {
          const n = i + 1
          const done   = n < s.step
          const active = n === s.step
          return (
            <div key={n} style={{ display: 'flex', alignItems: 'center', gap: 6, marginRight: 'var(--space-3)', cursor: 'pointer' }} onClick={() => upd({ step: n, error: '' })}>
              <div style={{
                width: 22, height: 22, borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 'var(--font-size-xs)', fontWeight: 700,
                background: done ? 'var(--color-accent)' : active ? 'var(--color-bg-hover)' : 'var(--color-bg-surface)',
                border: `1px solid ${active ? 'var(--color-accent)' : 'var(--color-border)'}`,
                color: done ? '#fff' : active ? 'var(--color-text-primary)' : 'var(--color-text-secondary)',
              }}>{done ? '✓' : n}</div>
              <span style={{ fontSize: 'var(--font-size-sm)', color: active ? 'var(--color-text-primary)' : 'var(--color-text-secondary)', fontWeight: active ? 600 : 400 }}>{label}</span>
            </div>
          )
        })}
      </div>

      {/* Inline error notice */}
      {s.error && (
        <div style={{ padding: 'var(--space-2) var(--space-3)', background: 'rgba(139,38,53,0.1)', border: '1px solid rgba(139,38,53,0.3)', borderRadius: 'var(--radius-md)', color: '#e05a6a', fontSize: 'var(--font-size-sm)', marginBottom: 'var(--space-4)' }}>
          {s.error}
        </div>
      )}

      {/* Step 1 — Identity */}
      {s.step === 1 && (
        <WizSection label="Identity">
          <WizRow>
            <WizField label="System Name *" style={{ flex: 2 }}>
              <WizInput value={s.name} onChange={v => upd({ name: v })} placeholder="Classic Fantasy Battles" />
            </WizField>
            <WizField label="Short Name" style={{ flex: 1 }}>
              <WizInput value={s.shortName} onChange={v => upd({ shortName: v })} placeholder="CFB" maxLength={8} />
            </WizField>
          </WizRow>
          {isNew && (
            <WizField label="System ID (slug)">
              <WizInput
                value={s.systemId}
                onChange={v => upd({ systemId: v.toLowerCase().replace(/[^a-z0-9-]/g, '') })}
                placeholder="auto-generated from name if blank"
              />
            </WizField>
          )}
          <WizField label="Description">
            <textarea
              value={s.description}
              onChange={e => upd({ description: e.target.value })}
              rows={3}
              placeholder="Brief description of the game system"
              style={textareaStyle}
            />
          </WizField>
          <NavRow onNext={() => upd({ step: 2, error: '' })} nextLabel="Branding →" />
        </WizSection>
      )}

      {/* Step 2 — Branding */}
      {s.step === 2 && (
        <WizSection label="Branding">
          {/* Logo upload */}
          <WizField label="System Logo">
            <div style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'center' }}>
              {/* Preview */}
              <div style={{
                width: 80, height: 80, flexShrink: 0,
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-md)',
                background: 'var(--color-bg-surface)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                overflow: 'hidden',
              }}>
                {s.branding.logoUrl
                  ? <img src={s.branding.logoUrl} alt="logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                  : <span style={{ fontSize: 28, opacity: 0.3 }}>🖼</span>
                }
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={e => uploadLogo(e.target.files?.[0])}
                />
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={s.uploading}
                >
                  {s.uploading ? 'Uploading…' : s.branding.logoUrl ? 'Replace Logo' : 'Upload Logo'}
                </Button>
                {s.branding.logoUrl && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => upd({ branding: { ...s.branding, logoUrl: '' } })}
                  >
                    Remove
                  </Button>
                )}
                <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)' }}>
                  PNG, SVG, or WebP recommended. Used in the app header and browser tab favicon.
                </span>
              </div>
            </div>
          </WizField>

          <WizRow>
            <WizField label="Accent Colour" style={{ flex: 1 }}>
              <div style={{ display: 'flex', gap: 'var(--space-2)', alignItems: 'center' }}>
                <input
                  type="color"
                  value={s.branding.accentColor}
                  onChange={e => upd({ branding: { ...s.branding, accentColor: e.target.value } })}
                  style={{ width: 48, height: 36, border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', background: 'none', cursor: 'pointer' }}
                />
                <WizInput value={s.branding.accentColor} onChange={v => upd({ branding: { ...s.branding, accentColor: v } })} placeholder="#8b2635" />
              </div>
            </WizField>
            <WizField label="Accent Hover Colour" style={{ flex: 1 }}>
              <div style={{ display: 'flex', gap: 'var(--space-2)', alignItems: 'center' }}>
                <input
                  type="color"
                  value={s.branding.accentHoverColor}
                  onChange={e => upd({ branding: { ...s.branding, accentHoverColor: e.target.value } })}
                  style={{ width: 48, height: 36, border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', background: 'none', cursor: 'pointer' }}
                />
                <WizInput value={s.branding.accentHoverColor} onChange={v => upd({ branding: { ...s.branding, accentHoverColor: v } })} placeholder="#a02d40" />
              </div>
            </WizField>
          </WizRow>
          <WizField label="App / Browser Tab Name">
            <WizInput value={s.branding.appName} onChange={v => upd({ branding: { ...s.branding, appName: v } })} placeholder="CFB Builder" />
          </WizField>
          <div style={{ padding: 'var(--space-3)', background: 'var(--color-bg-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>
            Preview: <span style={{ color: s.branding.accentColor, fontWeight: 700 }}>■</span> {s.branding.accentColor}
            <br />
            <span style={{ opacity: 0.7, marginTop: 4, display: 'block' }}>
              PWA home-screen icons (when installed) are baked at build time — replace <code>public/icons/*.png</code> before running <code>npm run deploy</code>.
            </span>
          </div>
          <NavRow onBack={() => upd({ step: 1, error: '' })} onNext={() => upd({ step: 3, error: '' })} nextLabel="Stats →" />
        </WizSection>
      )}

      {/* Step 3 — Stats */}
      {s.step === 3 && (
        <WizSection label="Stat Definitions">
          <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', marginBottom: 'var(--space-3)' }}>
            Define the stats each unit has. Order matters — it controls column order in the admin table.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)', marginBottom: 'var(--space-3)' }}>
            {s.statDefinitions.map((stat, i) => (
              <div key={i} style={{ display: 'flex', gap: 'var(--space-2)', alignItems: 'flex-end', background: 'var(--color-bg-surface)', padding: 'var(--space-3)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
                <WizField label="Name" style={{ flex: 2 }}>
                  <WizInput value={stat.name} onChange={v => updStat(i, 'name', v)} placeholder="Movement" />
                </WizField>
                <WizField label="Short" style={{ flex: 1 }}>
                  <WizInput value={stat.shortName} onChange={v => updStat(i, 'shortName', v)} placeholder="MOV" maxLength={5} />
                </WizField>
                <WizField label="ID (slug)" style={{ flex: 1 }}>
                  <WizInput value={stat.id} onChange={v => updStat(i, 'id', v.toLowerCase().replace(/[^a-z0-9_]/g, ''))} placeholder="movement" />
                </WizField>
                <button
                  onClick={() => upd({ statDefinitions: s.statDefinitions.filter((_, j) => j !== i) })}
                  style={removeBtnStyle}
                  title="Remove"
                >✕</button>
              </div>
            ))}
          </div>
          <Button size="sm" variant="secondary" onClick={() => upd({ statDefinitions: [...s.statDefinitions, { id: '', name: '', shortName: '', label: '' }] })}>
            + Add Stat
          </Button>
          <NavRow onBack={() => upd({ step: 2, error: '' })} onNext={() => upd({ step: 4, error: '' })} nextLabel="Factions →" />
        </WizSection>
      )}

      {/* Step 4 — Factions + Rules */}
      {s.step === 4 && (
        <WizSection label="Factions & Rules">
          <div style={{ marginBottom: 'var(--space-4)' }}>
            <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 'var(--space-2)' }}>Factions</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)', marginBottom: 'var(--space-3)' }}>
              {s.factions.map((f, i) => (
                <div key={i} style={{ display: 'flex', gap: 'var(--space-2)', alignItems: 'center', background: 'var(--color-bg-surface)', padding: 'var(--space-3)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
                  <WizField label="Name" style={{ flex: 2 }}>
                    <WizInput value={f.name} onChange={v => updFaction(i, 'name', v)} placeholder="Good" />
                  </WizField>
                  <WizField label="ID" style={{ flex: 1 }}>
                    <WizInput value={f.id} onChange={v => updFaction(i, 'id', v)} placeholder="good" />
                  </WizField>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 'var(--font-size-sm)', whiteSpace: 'nowrap', paddingBottom: 2 }}>
                    <input type="checkbox" checked={!!f.availableToAll} onChange={e => updFaction(i, 'availableToAll', e.target.checked)} />
                    Universal
                  </label>
                  <button onClick={() => upd({ factions: s.factions.filter((_, j) => j !== i) })} style={removeBtnStyle} title="Remove">✕</button>
                </div>
              ))}
            </div>
            <Button size="sm" variant="secondary" onClick={() => upd({ factions: [...s.factions, { id: '', name: '', availableToAll: false }] })}>
              + Add Faction
            </Button>
          </div>

          <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: 'var(--space-4)' }}>
            <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 'var(--space-3)' }}>Army Rules</div>
            <WizField label="Point Limit">
              <WizInput type="number" value={s.rules.pointLimit} onChange={v => upd({ rules: { ...s.rules, pointLimit: Number(v) || 0 } })} />
            </WizField>
            <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', fontSize: 'var(--font-size-sm)', marginTop: 'var(--space-3)', cursor: 'pointer' }}>
              <input type="checkbox" checked={!!s.rules.allowMultipleFactions} onChange={e => upd({ rules: { ...s.rules, allowMultipleFactions: e.target.checked } })} />
              Allow multiple factions in one army
            </label>
          </div>

          <NavRow
            onBack={() => upd({ step: 3, error: '' })}
            onNext={handleSave}
            nextLabel={s.saving ? 'Saving…' : (isNew ? 'Create System' : 'Save Changes')}
            nextDisabled={s.saving}
          />
        </WizSection>
      )}
    </div>
  )

  function updStat(i, field, val) {
    const updated = s.statDefinitions.map((st, j) => {
      if (j !== i) return st
      const next = { ...st, [field]: val }
      if (field === 'name' || field === 'shortName') {
        next.label = `${next.name} (${next.shortName})`
      }
      return next
    })
    upd({ statDefinitions: updated })
  }

  function updFaction(i, field, val) {
    upd({ factions: s.factions.map((f, j) => j === i ? { ...f, [field]: val } : f) })
  }
}

// ── Shared primitives ──────────────────────────────────────────────────
function WizSection({ label, children }) {
  return (
    <div>
      <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 'var(--space-4)', paddingBottom: 'var(--space-2)', borderBottom: '1px solid var(--color-border)' }}>
        {label}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
        {children}
      </div>
    </div>
  )
}

function WizRow({ children }) {
  return <div style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'flex-end' }}>{children}</div>
}

function WizField({ label, children, style }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4, ...style }}>
      <label style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.3px' }}>{label}</label>
      {children}
    </div>
  )
}

function WizInput({ value, onChange, type = 'text', placeholder, maxLength }) {
  return (
    <input
      type={type}
      value={value ?? ''}
      maxLength={maxLength}
      placeholder={placeholder}
      onChange={e => onChange(e.target.value)}
      style={inputStyle}
    />
  )
}

function NavRow({ onBack, onNext, nextLabel = 'Next →', nextDisabled }) {
  return (
    <div style={{ display: 'flex', gap: 'var(--space-2)', marginTop: 'var(--space-2)', paddingTop: 'var(--space-4)', borderTop: '1px solid var(--color-border)' }}>
      {onBack && <Button variant="secondary" onClick={onBack}>← Back</Button>}
      <Button onClick={onNext} disabled={nextDisabled}>{nextLabel}</Button>
    </div>
  )
}

const inputStyle = {
  padding: '8px 10px',
  background: 'var(--color-bg-surface)',
  border: '1px solid var(--color-border)',
  borderRadius: 'var(--radius-md)',
  color: 'var(--color-text-primary)',
  fontFamily: 'var(--font-family)',
  fontSize: 'var(--font-size-base)',
  outline: 'none',
  width: '100%',
  boxSizing: 'border-box',
}

const textareaStyle = {
  ...inputStyle,
  resize: 'vertical',
  fontFamily: 'var(--font-family)',
}

const removeBtnStyle = {
  width: 28, height: 28,
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  background: 'rgba(139,38,53,0.15)',
  border: '1px solid rgba(139,38,53,0.3)',
  borderRadius: 'var(--radius-sm)',
  color: '#e05a6a',
  cursor: 'pointer',
  fontSize: 11,
  flexShrink: 0,
  alignSelf: 'center',
  marginBottom: 2,
}
