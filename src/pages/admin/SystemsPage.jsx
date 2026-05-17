import { useState, useEffect } from 'react'
import { collection, getDocs, deleteDoc, doc, setDoc } from 'firebase/firestore'
import { useNavigate } from 'react-router-dom'
import { db } from '../../services/firebase'
import { CFB_MANIFEST } from '../../context/SystemContext'
import Button from '../../components/ui/Button'

export default function SystemsPage() {
  const navigate = useNavigate()
  const [systems, setSystems] = useState([])
  const [loading, setLoading] = useState(true)
  const [seeding, setSeeding] = useState(false)

  useEffect(() => {
    getDocs(collection(db, 'systems'))
      .then(snap => setSystems(snap.docs.map(d => ({ id: d.id, ...d.data() }))))
      .finally(() => setLoading(false))
  }, [])

  async function handleDelete(id) {
    if (!window.confirm(`Delete system "${id}"? This cannot be undone.`)) return
    await deleteDoc(doc(db, 'systems', id))
    setSystems(prev => prev.filter(s => s.id !== id))
  }

  async function handleSeedCFB() {
    setSeeding(true)
    try {
      await setDoc(doc(db, 'systems', 'cfb'), {
        ...CFB_MANIFEST,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })
      const snap = await getDocs(collection(db, 'systems'))
      setSystems(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    } finally {
      setSeeding(false)
    }
  }

  if (loading) return <Pad>Loading systems…</Pad>

  return (
    <div style={{ padding: 'var(--space-5)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-5)' }}>
        <h1 style={{ fontSize: 'var(--font-size-xl)', fontWeight: 700 }}>Game Systems</h1>
        <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
          {!systems.find(s => s.id === 'cfb') && (
            <Button variant="secondary" size="sm" disabled={seeding} onClick={handleSeedCFB}>
              {seeding ? 'Seeding…' : 'Seed CFB'}
            </Button>
          )}
          <Button size="sm" onClick={() => navigate('/admin/systems/new')}>+ New System</Button>
        </div>
      </div>

      {systems.length === 0 && (
        <div style={{ padding: 'var(--space-6)', background: 'var(--color-bg-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', textAlign: 'center', color: 'var(--color-text-secondary)' }}>
          <div style={{ fontSize: 32, marginBottom: 'var(--space-3)' }}>⚙</div>
          <div style={{ fontWeight: 600, marginBottom: 'var(--space-2)' }}>No systems yet</div>
          <p style={{ fontSize: 'var(--font-size-sm)', marginBottom: 'var(--space-4)' }}>
            Seed the CFB manifest to get started, or create a new system from scratch.
          </p>
          <Button onClick={handleSeedCFB} disabled={seeding}>{seeding ? 'Seeding…' : 'Seed Classic Fantasy Battles'}</Button>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 'var(--space-4)' }}>
        {systems.map(sys => (
          <SystemCard
            key={sys.id}
            system={sys}
            onEdit={() => navigate(`/admin/systems/${sys.id}`)}
            onDelete={() => handleDelete(sys.id)}
          />
        ))}
      </div>
    </div>
  )
}

function SystemCard({ system, onEdit, onDelete }) {
  const accent = system.branding?.accentColor ?? '#8b2635'
  const factionCount = system.factions?.length ?? 0
  const statCount = system.statDefinitions?.length ?? 0

  return (
    <div style={{
      background: 'var(--color-bg-surface)',
      border: '1px solid var(--color-border)',
      borderRadius: 'var(--radius-lg)',
      overflow: 'hidden',
    }}>
      {/* Colour band */}
      <div style={{ height: 6, background: accent }} />

      <div style={{ padding: 'var(--space-4)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-2)' }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: 'var(--font-size-md)' }}>{system.name}</div>
            <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)', marginTop: 2 }}>
              ID: <code style={{ background: 'var(--color-bg-hover)', padding: '1px 4px', borderRadius: 3 }}>{system.id}</code>
            </div>
          </div>
          <div style={{
            padding: '2px 8px',
            background: `${accent}22`,
            border: `1px solid ${accent}55`,
            borderRadius: 'var(--radius-sm)',
            fontSize: 'var(--font-size-xs)',
            color: accent,
            fontWeight: 600,
          }}>
            {system.shortName ?? system.id.toUpperCase()}
          </div>
        </div>

        {system.description && (
          <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', marginBottom: 'var(--space-3)' }}>
            {system.description}
          </p>
        )}

        <div style={{ display: 'flex', gap: 'var(--space-3)', fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)', marginBottom: 'var(--space-4)' }}>
          <span>{system.rules?.pointLimit ?? '?'}pt limit</span>
          <span>·</span>
          <span>{factionCount} factions</span>
          <span>·</span>
          <span>{statCount} stats</span>
        </div>

        <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
          <Button size="sm" onClick={onEdit} style={{ flex: 1 }}>Edit</Button>
          <Button size="sm" variant="danger" onClick={onDelete}>Delete</Button>
        </div>
      </div>
    </div>
  )
}

function Pad({ children }) {
  return <div style={{ padding: 'var(--space-6)', color: 'var(--color-text-secondary)' }}>{children}</div>
}
