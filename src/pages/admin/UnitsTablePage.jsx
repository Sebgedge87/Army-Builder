import { useState, useEffect, useRef, useCallback } from 'react'
import { collection, getDocs, doc, updateDoc, deleteDoc, addDoc, setDoc } from 'firebase/firestore'
import { useNavigate } from 'react-router-dom'
import { db } from '../../services/firebase'
import { uploadImage } from '../../services/storage'
import Button from '../../components/ui/Button'
import { exportToJSON } from '../../lib/export/json'
import { exportToText } from '../../lib/export/txt'

const STAT_KEYS   = ['movement', 'melee', 'ranged', 'defence', 'morale', 'wounds']
const STAT_LABELS = ['MOV', 'MEL', 'RNG', 'DEF', 'MOR', 'WND']
const FACTIONS    = ['Good', 'Evil', 'Mercenary']

export default function UnitsTablePage() {
  const navigate = useNavigate()
  const [units, setUnits]     = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch]   = useState('')
  const [sortKey, setSortKey] = useState('name')
  const [sortDir, setSortDir] = useState('asc')
  const [uploading, setUploading] = useState({})
  const fileRefs = useRef({})

  useEffect(() => {
    getDocs(collection(db, 'units'))
      .then(snap => setUnits(snap.docs.map(d => ({ id: d.id, ...d.data() }))))
      .finally(() => setLoading(false))
  }, [])

  // ── Helpers ────────────────────────────────────────────────────────
  async function patchUnit(unitId, patch) {
    await updateDoc(doc(db, 'units', unitId), patch)
    setUnits(prev => prev.map(u => u.id === unitId ? { ...u, ...patch } : u))
  }

  function handleSort(key) {
    if (key === sortKey) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortKey(key); setSortDir('asc') }
  }

  async function handleDelete(unitId) {
    if (!window.confirm('Delete this unit? This cannot be undone.')) return
    await deleteDoc(doc(db, 'units', unitId))
    setUnits(prev => prev.filter(u => u.id !== unitId))
  }

  async function handleDuplicate(unit) {
    const { id, ...rest } = unit
    const newUnit = { ...rest, name: `${rest.name} (copy)` }
    const ref = await addDoc(collection(db, 'units'), newUnit)
    setUnits(prev => [...prev, { id: ref.id, ...newUnit }])
  }

  async function handleImageUpload(unit, file) {
    setUploading(prev => ({ ...prev, [unit.id]: true }))
    try {
      const ext = file.name.split('.').pop()
      const path = `systems/cfb/units/${unit.id}.${ext}`
      const url = await uploadImage(path, file)
      const images = { ...(unit.images ?? {}), thumb: url, card: url, full: url, icon: url }
      await patchUnit(unit.id, { images })
    } finally {
      setUploading(prev => ({ ...prev, [unit.id]: false }))
    }
  }

  // ── Filter + sort ─────────────────────────────────────────────────
  const q = search.toLowerCase()
  const displayed = units
    .filter(u => !q || u.name?.toLowerCase().includes(q) || u.race?.toLowerCase().includes(q))
    .sort((a, b) => {
      let av = a[sortKey] ?? a.stats?.[sortKey] ?? ''
      let bv = b[sortKey] ?? b.stats?.[sortKey] ?? ''
      if (typeof av === 'number' && typeof bv === 'number') return sortDir === 'asc' ? av - bv : bv - av
      return sortDir === 'asc'
        ? String(av).localeCompare(String(bv))
        : String(bv).localeCompare(String(av))
    })

  // ── Export helpers ────────────────────────────────────────────────
  function exportCSV() {
    const headers = ['id', 'name', 'faction', 'race', 'types', 'points', ...STAT_KEYS, 'keywords', 'specialRules', 'flavorText']
    const rows = displayed.map(u => [
      u.id, u.name, u.faction, u.race,
      (u.types ?? []).join(';'),
      u.points ?? '',
      ...STAT_KEYS.map(k => u.stats?.[k] ?? ''),
      (u.keywords ?? []).join(';'),
      (u.specialRules ?? []).join(';'),
      u.flavorText ?? '',
    ].map(v => `"${String(v ?? '').replace(/"/g, '""')}"`).join(','))
    const csv  = [headers.join(','), ...rows].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href = url; a.download = 'units.csv'; a.click()
    URL.revokeObjectURL(url)
  }

  if (loading) return <Pad>Loading units…</Pad>

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Toolbar */}
      <div style={{
        padding: 'var(--space-3) var(--space-4)',
        borderBottom: '1px solid var(--color-border)',
        display: 'flex',
        gap: 'var(--space-2)',
        alignItems: 'center',
        flexWrap: 'wrap',
      }}>
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search units…"
          style={inputStyle}
        />
        <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', marginLeft: 'auto' }}>
          {displayed.length} / {units.length}
        </span>
        <Button size="sm" variant="secondary" onClick={exportCSV}>Export CSV</Button>
        <Button size="sm" onClick={() => navigate('/admin/import')}>Import</Button>
        <Button size="sm" onClick={() => navigate('/admin/unit/new')}>+ New Unit</Button>
      </div>

      {/* Table */}
      <div style={{ flex: 1, overflow: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 'var(--font-size-sm)', minWidth: 1100 }}>
          <thead>
            <tr style={{ background: 'var(--color-bg-surface)', borderBottom: '2px solid var(--color-border)', position: 'sticky', top: 0, zIndex: 1 }}>
              <Th w={50}>Img</Th>
              <Th sortKey="name"   currentSort={sortKey} dir={sortDir} onSort={handleSort} w={160}>Name</Th>
              <Th sortKey="faction" currentSort={sortKey} dir={sortDir} onSort={handleSort} w={90}>Faction</Th>
              <Th sortKey="race"   currentSort={sortKey} dir={sortDir} onSort={handleSort} w={90}>Race</Th>
              <Th w={90}>Types</Th>
              <Th sortKey="points" currentSort={sortKey} dir={sortDir} onSort={handleSort} w={60}>Pts</Th>
              {STAT_LABELS.map(l => <Th key={l} w={42}>{l}</Th>)}
              <Th w={110}>Actions</Th>
            </tr>
          </thead>
          <tbody>
            {displayed.map(unit => (
              <UnitRow
                key={unit.id}
                unit={unit}
                uploading={!!uploading[unit.id]}
                fileRef={el => fileRefs.current[unit.id] = el}
                onPatch={(patch) => patchUnit(unit.id, patch)}
                onEdit={() => navigate(`/admin/unit/${unit.id}`)}
                onDuplicate={() => handleDuplicate(unit)}
                onDelete={() => handleDelete(unit.id)}
                onImagePick={() => fileRefs.current[unit.id]?.click()}
                onImageFile={file => handleImageUpload(unit, file)}
              />
            ))}
          </tbody>
        </table>
        {displayed.length === 0 && <Pad>No units match your search.</Pad>}
      </div>
    </div>
  )
}

// ── Row ──────────────────────────────────────────────────────────────
function UnitRow({ unit, uploading, fileRef, onPatch, onEdit, onDuplicate, onDelete, onImagePick, onImageFile }) {
  const thumb = unit.images?.thumb

  function save(path, rawVal) {
    if (path.startsWith('stats.')) {
      const key = path.split('.')[1]
      onPatch({ stats: { ...(unit.stats ?? {}), [key]: Number(rawVal) || 0 } })
    } else if (path === 'points') {
      onPatch({ points: rawVal === '' ? null : Number(rawVal) })
    } else if (path === 'types') {
      onPatch({ types: rawVal.split(';').map(t => t.trim()).filter(Boolean) })
    } else {
      onPatch({ [path]: rawVal })
    }
  }

  return (
    <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
      {/* Thumb */}
      <td style={tdBase}>
        {thumb
          ? <img src={thumb} alt="" style={{ width: 36, height: 36, objectFit: 'cover', borderRadius: 'var(--radius-sm)', display: 'block' }} />
          : <div style={{ width: 36, height: 36, background: 'var(--color-bg-hover)', borderRadius: 'var(--radius-sm)' }} />
        }
        <input type="file" accept="image/*" style={{ display: 'none' }} ref={fileRef} onChange={e => { const f = e.target.files?.[0]; if (f) onImageFile(f); e.target.value = '' }} />
      </td>
      {/* Name */}
      <td style={tdBase}><EC value={unit.name  ?? ''} onSave={v => save('name', v)} /></td>
      {/* Faction */}
      <td style={tdBase}><EC value={unit.faction ?? ''} type="select" options={FACTIONS} onSave={v => save('faction', v)} /></td>
      {/* Race */}
      <td style={tdBase}><EC value={unit.race ?? ''} onSave={v => save('race', v)} /></td>
      {/* Types */}
      <td style={tdBase}><EC value={(unit.types ?? []).join(';')} onSave={v => save('types', v)} /></td>
      {/* Points */}
      <td style={tdBase}><EC value={unit.points ?? ''} type="number" onSave={v => save('points', v)} /></td>
      {/* Stats */}
      {STAT_KEYS.map(k => (
        <td key={k} style={tdBase}>
          <EC value={unit.stats?.[k] ?? ''} type="number" onSave={v => save(`stats.${k}`, v)} />
        </td>
      ))}
      {/* Actions */}
      <td style={{ ...tdBase, whiteSpace: 'nowrap' }}>
        <div style={{ display: 'flex', gap: 4 }}>
          <ActionBtn onClick={onEdit} title="Edit full form">✎</ActionBtn>
          <ActionBtn onClick={onImagePick} title={uploading ? 'Uploading…' : 'Upload image'} disabled={uploading}>🖼</ActionBtn>
          <ActionBtn onClick={onDuplicate} title="Duplicate">⎘</ActionBtn>
          <ActionBtn onClick={onDelete} title="Delete" danger>✕</ActionBtn>
        </div>
      </td>
    </tr>
  )
}

// ── Editable cell ───────────────────────────────────────────────────
function EC({ value, type = 'text', options, onSave }) {
  const [editing, setEditing] = useState(false)
  const [local, setLocal]     = useState(String(value))

  useEffect(() => { if (!editing) setLocal(String(value)) }, [value, editing])

  function commit() { onSave(local); setEditing(false) }

  if (editing) {
    if (type === 'select') {
      return (
        <select value={local} autoFocus
          onChange={e => setLocal(e.target.value)}
          onBlur={() => commit()}
          style={{ ...cellInputStyle, appearance: 'auto' }}
        >
          {options.map(o => <option key={o} value={o}>{o}</option>)}
        </select>
      )
    }
    return (
      <input
        autoFocus
        type={type === 'number' ? 'number' : 'text'}
        value={local}
        onChange={e => setLocal(e.target.value)}
        onBlur={commit}
        onKeyDown={e => { if (e.key === 'Enter' || e.key === 'Escape') commit() }}
        style={cellInputStyle}
      />
    )
  }

  return (
    <div
      onClick={() => { setLocal(String(value)); setEditing(true) }}
      style={{ cursor: 'text', minHeight: 20, padding: '2px 0', color: value === '' || value === null || value === undefined ? 'var(--color-text-secondary)' : 'inherit' }}
    >
      {value !== '' && value !== null && value !== undefined ? String(value) : <span style={{ opacity: 0.3 }}>—</span>}
    </div>
  )
}

// ── Small helpers ────────────────────────────────────────────────────
function Th({ children, sortKey, currentSort, dir, onSort, w }) {
  const active = sortKey && sortKey === currentSort
  return (
    <th
      onClick={sortKey ? () => onSort(sortKey) : undefined}
      style={{
        padding: '8px var(--space-2)',
        textAlign: 'left',
        fontWeight: 600,
        fontSize: 'var(--font-size-xs)',
        color: active ? 'var(--color-accent)' : 'var(--color-text-secondary)',
        cursor: sortKey ? 'pointer' : 'default',
        userSelect: 'none',
        width: w,
        whiteSpace: 'nowrap',
      }}
    >
      {children}{active ? (dir === 'asc' ? ' ▲' : ' ▼') : ''}
    </th>
  )
}

function ActionBtn({ children, onClick, title, danger, disabled }) {
  return (
    <button
      onClick={onClick}
      title={title}
      disabled={disabled}
      style={{
        width: 24, height: 24,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: danger ? 'rgba(139,38,53,0.2)' : 'var(--color-bg-hover)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-sm)',
        color: danger ? '#e05a6a' : 'var(--color-text-secondary)',
        cursor: disabled ? 'not-allowed' : 'pointer',
        fontSize: 11,
        opacity: disabled ? 0.5 : 1,
        fontFamily: 'var(--font-family)',
      }}
    >
      {children}
    </button>
  )
}

function Pad({ children }) {
  return <div style={{ padding: 'var(--space-6)', color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-base)' }}>{children}</div>
}

const inputStyle = {
  padding: '7px 12px',
  background: 'var(--color-bg-surface)',
  border: '1px solid var(--color-border)',
  borderRadius: 'var(--radius-md)',
  color: 'var(--color-text-primary)',
  fontFamily: 'var(--font-family)',
  fontSize: 'var(--font-size-base)',
  outline: 'none',
  width: 220,
}

const tdBase = {
  padding: '4px var(--space-2)',
  verticalAlign: 'middle',
  maxWidth: 0,
  overflow: 'hidden',
}

const cellInputStyle = {
  width: '100%',
  padding: '2px 4px',
  background: 'var(--color-bg-base)',
  border: '1px solid var(--color-accent)',
  borderRadius: 'var(--radius-sm)',
  color: 'var(--color-text-primary)',
  fontFamily: 'var(--font-family)',
  fontSize: 'var(--font-size-sm)',
  outline: 'none',
  boxSizing: 'border-box',
}
