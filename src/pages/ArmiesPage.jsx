import { useState, useEffect } from 'react'
import { collection, query, where, getDocs, deleteDoc, doc } from 'firebase/firestore'
import { db } from '../services/firebase'
import { useAuth } from '../hooks/useAuth'
import { useNavigate } from 'react-router-dom'
import AppShell from '../components/shell/AppShell'
import TopBar from '../components/shell/TopBar'
import Button from '../components/ui/Button'

export default function ArmiesPage() {
  const { user }   = useAuth()
  const navigate   = useNavigate()
  const [armies, setArmies]   = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    getDocs(query(collection(db, 'armies'), where('userId', '==', user.uid)))
      .then(snap => {
        const docs = snap.docs.map(d => ({ id: d.id, ...d.data() }))
        docs.sort((a, b) => (b.updatedAt ?? '').localeCompare(a.updatedAt ?? ''))
        setArmies(docs)
      })
      .finally(() => setLoading(false))
  }, [user])

  async function handleDelete(id) {
    await deleteDoc(doc(db, 'armies', id))
    setArmies(prev => prev.filter(a => a.id !== id))
  }

  return (
    <AppShell>
      <TopBar />
      <div style={{ flex: 1, overflow: 'auto', padding: 'var(--space-6)' }}>
        <div style={{ maxWidth: 720, margin: '0 auto' }}>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-5)' }}>
            <h1 style={{ fontSize: 'var(--font-size-xl)', fontWeight: 700 }}>My Armies</h1>
            <Button onClick={() => navigate('/builder')}>+ New Army</Button>
          </div>

          {loading ? (
            <div style={{ color: 'var(--color-text-secondary)', padding: 'var(--space-4)' }}>Loading…</div>
          ) : armies.length === 0 ? (
            <div style={{
              padding: 'var(--space-6)',
              color: 'var(--color-text-secondary)',
              textAlign: 'center',
              background: 'var(--color-bg-surface)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-md)',
            }}>
              <div style={{ fontSize: 40, marginBottom: 'var(--space-3)', opacity: 0.2 }}>⚔</div>
              <div>No armies yet — create your first!</div>
            </div>
          ) : (
            armies.map(army => (
              <div
                key={army.id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: 'var(--space-4)',
                  background: 'var(--color-bg-surface)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-md)',
                  marginBottom: 'var(--space-3)',
                }}
              >
                <div>
                  <div style={{ fontWeight: 600, fontSize: 'var(--font-size-md)', marginBottom: 4 }}>
                    {army.name}
                  </div>
                  <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>
                    {army.faction} • {(army.totalPoints ?? 0).toLocaleString()} pts • {army.units?.length ?? 0} units
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                  <Button size="sm" onClick={() => navigate(`/builder/${army.id}`)}>Edit</Button>
                  <Button size="sm" variant="danger" onClick={() => handleDelete(army.id)}>Delete</Button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </AppShell>
  )
}
