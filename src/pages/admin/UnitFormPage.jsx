import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { doc, getDoc, setDoc, addDoc, collection } from 'firebase/firestore'
import { db } from '../../services/firebase'
import Button from '../../components/ui/Button'

const FACTIONS    = ['Good', 'Evil', 'Mercenary']
const STAT_KEYS   = ['movement', 'melee', 'ranged', 'defence', 'morale', 'wounds']
const STAT_LABELS = { movement: 'Movement (MOV)', melee: 'Melee (MEL)', ranged: 'Ranged (RNG)', defence: 'Defence (DEF)', morale: 'Morale (MOR)', wounds: 'Wounds (WND)' }
const ATTACHMENT_ROLES = ['', 'host', 'attachment', 'both']

const EMPTY = {
  name: '', faction: 'Evil', race: '', types: [],
  points: '',
  stats: { movement: 0, melee: 0, ranged: 0, defence: 0, morale: 0, wounds: 0 },
  weapons: [], keywords: [], specialRules: [],
  flavorText: '',
  images: { full: '', card: '', thumb: '', icon: '' },
  attachable: null,
}

export default function UnitFormPage() {
  const { unitId }   = useParams()
  const navigate     = useNavigate()
  const isNew        = !unitId || unitId === 'new'
  const [form, setForm] = useState(EMPTY)
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(!isNew)

  useEffect(() => {
    if (isNew) return
    getDoc(doc(db, 'units', unitId))
      .then(snap => {
        if (!snap.exists()) return
        const d = snap.data()
        setForm({
          ...EMPTY,
          ...d,
          images:     { full: '', card: '', thumb: '', icon: '', ...(d.images ?? {}) },
          attachable: d.attachable ?? null,
        })
      })
      .finally(() => setLoading(false))
  }, [unitId, isNew])

  function upd(patch) { setForm(prev => ({ ...prev, ...patch })) }
  function updStat(k, v) { setForm(prev => ({ ...prev, stats: { ...prev.stats, [k]: Number(v) || 0 } })) }
  function updImg(k, v)  { setForm(prev => ({ ...prev, images: { ...prev.images, [k]: v } })) }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.name.trim()) { alert('Name is required'); return }
    setSaving(true)
    const payload = {
      ...form,
      types:        form.types,
      points:       form.points !== '' ? Number(form.points) : null,
      images:       Object.fromEntries(Object.entries(form.images).filter(([, v]) => v)),
      attachable:   form.attachable,
    }
    try {
      if (isNew) {
        const id = form.name.toLowerCase().replace(/[^a-z0-9]+/g, '_')
        await setDoc(doc(db, 'units', id), payload, { merge: true })
      } else {
        await setDoc(doc(db, 'units', unitId), payload, { merge: true })
      }
      navigate('/admin')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <Pad>Loading…</Pad>

  return (
    <form onSubmit={handleSubmit} style={{ padding: 'var(--space-5)', maxWidth: 700 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-5)' }}>
        <h1 style={{ fontSize: 'var(--font-size-xl)', fontWeight: 700 }}>
          {isNew ? 'New Unit' : `Edit: ${form.name || '—'}`}
        </h1>
        <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
          <Button type="button" variant="secondary" onClick={() => navigate('/admin')}>Cancel</Button>
          <Button type="submit" disabled={saving}>{saving ? 'Saving…' : 'Save Unit'}</Button>
        </div>
      </div>

      {/* ── Identity ── */}
      <Section label="Identity">
        <Row>
          <Field label="Name *" style={{ flex: 2 }}>
            <TI value={form.name} onChange={v => upd({ name: v })} required />
          </Field>
          <Field label="Faction" style={{ flex: 1 }}>
            <select value={form.faction} onChange={e => upd({ faction: e.target.value })} style={selectStyle}>
              {FACTIONS.map(f => <option key={f} value={f}>{f}</option>)}
            </select>
          </Field>
        </Row>
        <Row>
          <Field label="Race" style={{ flex: 1 }}>
            <TI value={form.race} onChange={v => upd({ race: v })} />
          </Field>
          <Field label="Types (comma-separated)" style={{ flex: 2 }}>
            <TI value={form.types.join(', ')} onChange={v => upd({ types: v.split(',').map(t => t.trim()).filter(Boolean) })} />
          </Field>
          <Field label="Points" style={{ flex: 0.5 }}>
            <TI type="number" value={form.points} onChange={v => upd({ points: v })} />
          </Field>
        </Row>
      </Section>

      {/* ── Stats ── */}
      <Section label="Stats">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--space-3)' }}>
          {STAT_KEYS.map(k => (
            <Field key={k} label={STAT_LABELS[k]}>
              <TI type="number" value={form.stats[k]} onChange={v => updStat(k, v)} min={0} />
            </Field>
          ))}
        </div>
      </Section>

      {/* ── Weapons ── */}
      <Section label="Weapons">
        {form.weapons.map((w, i) => (
          <div key={i} style={{ display: 'flex', gap: 'var(--space-2)', alignItems: 'flex-end', marginBottom: 'var(--space-2)', background: 'var(--color-bg-surface)', padding: 'var(--space-3)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
            <Field label="Name" style={{ flex: 2 }}><TI value={w.name ?? ''} onChange={v => updWeapon(i, 'name', v)} /></Field>
            <Field label="Range"   style={{ flex: 1 }}><TI value={w.range ?? ''} onChange={v => updWeapon(i, 'range', v)} /></Field>
            <Field label="Attacks" style={{ flex: 1 }}><TI value={w.attacks ?? ''} onChange={v => updWeapon(i, 'attacks', v)} /></Field>
            <Field label="Damage"  style={{ flex: 1 }}><TI value={w.damage ?? ''} onChange={v => updWeapon(i, 'damage', v)} /></Field>
            <Field label="AP"      style={{ flex: 1 }}><TI value={w.armourPiercing ?? ''} onChange={v => updWeapon(i, 'armourPiercing', v)} /></Field>
            <Button type="button" variant="danger" size="sm" onClick={() => upd({ weapons: form.weapons.filter((_, j) => j !== i) })}>✕</Button>
          </div>
        ))}
        <Button type="button" size="sm" variant="secondary" onClick={() => upd({ weapons: [...form.weapons, { name: '', range: '', attacks: '', damage: '', armourPiercing: '' }] })}>
          + Add Weapon
        </Button>
      </Section>

      {/* ── Rules & flavour ── */}
      <Section label="Rules & Keywords">
        <Row>
          <Field label="Special Rules (comma-separated)" style={{ flex: 1 }}>
            <TI value={form.specialRules.join(', ')} onChange={v => upd({ specialRules: v.split(',').map(r => r.trim()).filter(Boolean) })} />
          </Field>
        </Row>
        <Row>
          <Field label="Keywords (comma-separated)" style={{ flex: 1 }}>
            <TI value={form.keywords.join(', ')} onChange={v => upd({ keywords: v.split(',').map(k => k.trim()).filter(Boolean) })} />
          </Field>
        </Row>
        <Field label="Flavor Text">
          <textarea
            value={form.flavorText}
            onChange={e => upd({ flavorText: e.target.value })}
            rows={3}
            style={{ ...inputStyle, width: '100%', resize: 'vertical', fontFamily: 'var(--font-family)' }}
          />
        </Field>
      </Section>

      {/* ── Images ── */}
      <Section label="Image URLs">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)' }}>
          {['thumb', 'card', 'full', 'icon'].map(k => (
            <Field key={k} label={k.charAt(0).toUpperCase() + k.slice(1)}>
              <TI value={form.images?.[k] ?? ''} onChange={v => updImg(k, v)} placeholder="https://…" />
            </Field>
          ))}
        </div>
      </Section>

      {/* ── Attachment role ── */}
      <Section label="Attachment Role">
        <Field label="Role">
          <select
            value={form.attachable?.role ?? ''}
            onChange={e => {
              const role = e.target.value
              upd({ attachable: role ? { ...(form.attachable ?? {}), role } : null })
            }}
            style={selectStyle}
          >
            {ATTACHMENT_ROLES.map(r => <option key={r} value={r}>{r || '— None —'}</option>)}
          </select>
        </Field>
        {form.attachable && (
          <div style={{ marginTop: 'var(--space-2)', padding: 'var(--space-3)', background: 'var(--color-bg-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>
            Full attachment configuration (slots, canAttachTo, grants) can be edited directly in Firestore or via the import wizard.
          </div>
        )}
      </Section>

      <div style={{ paddingTop: 'var(--space-4)', borderTop: '1px solid var(--color-border)', display: 'flex', gap: 'var(--space-2)' }}>
        <Button type="button" variant="secondary" onClick={() => navigate('/admin')}>Cancel</Button>
        <Button type="submit" disabled={saving}>{saving ? 'Saving…' : 'Save Unit'}</Button>
      </div>

    </form>
  )

  function updWeapon(i, field, val) {
    upd({ weapons: form.weapons.map((w, j) => j === i ? { ...w, [field]: val } : w) })
  }
}

// ── Shared form primitives ────────────────────────────────────────────
function Section({ label, children }) {
  return (
    <div style={{ marginBottom: 'var(--space-5)' }}>
      <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 'var(--space-3)', paddingBottom: 'var(--space-2)', borderBottom: '1px solid var(--color-border)' }}>
        {label}
      </div>
      {children}
    </div>
  )
}

function Row({ children }) {
  return <div style={{ display: 'flex', gap: 'var(--space-3)', marginBottom: 'var(--space-3)', alignItems: 'flex-end' }}>{children}</div>
}

function Field({ label, children, style }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4, ...style }}>
      <label style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.3px' }}>{label}</label>
      {children}
    </div>
  )
}

function TI({ value, onChange, type = 'text', required, min, placeholder }) {
  return (
    <input
      required={required}
      type={type}
      min={min}
      value={value ?? ''}
      placeholder={placeholder}
      onChange={e => onChange(e.target.value)}
      style={inputStyle}
    />
  )
}

function Pad({ children }) {
  return <div style={{ padding: 'var(--space-6)', color: 'var(--color-text-secondary)' }}>{children}</div>
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

const selectStyle = {
  ...inputStyle,
  cursor: 'pointer',
}
