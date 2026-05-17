import { useState, useEffect } from 'react'
import { collection, query, where, getDocs } from 'firebase/firestore'
import { db } from '../services/firebase'
import { useParams } from 'react-router-dom'
import { useUnits } from '../hooks/useUnits'
import AppShell from '../components/shell/AppShell'
import TopBar from '../components/shell/TopBar'
import UnitDetail, { EmptyDetail } from '../components/builder/UnitDetail'

export default function PublicArmyPage() {
  const { shareToken }    = useParams()
  const { units }         = useUnits()
  const [army, setArmy]   = useState(null)
  const [entries, setEntries] = useState([])
  const [selected, setSelected] = useState(null)
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState(null)

  // Fetch army by shareToken
  useEffect(() => {
    if (!shareToken) return
    getDocs(query(
      collection(db, 'armies'),
      where('shareToken', '==', shareToken),
      where('isPublic',   '==', true)
    ))
      .then(snap => {
        if (snap.empty) { setError('Army not found or no longer public.'); return }
        setArmy({ id: snap.docs[0].id, ...snap.docs[0].data() })
      })
      .catch(() => setError('Failed to load army.'))
      .finally(() => setLoading(false))
  }, [shareToken])

  // Hydrate entries once both army + units are ready
  useEffect(() => {
    if (!army || !units.length) return
    const hydrated = (army.units ?? [])
      .map(e => ({ ...e, unit: units.find(u => u.id === e.unitId) ?? null }))
      .filter(e => e.unit)
    setEntries(hydrated)
    if (hydrated.length) setSelected(hydrated[0].unit)
  }, [army, units])

  if (loading) return <Shell><Centered>Loading army…</Centered></Shell>
  if (error)   return <Shell><Centered icon>⚔ {error}</Centered></Shell>

  const topLevel    = entries.filter(e => !e.attachedTo)
  const totalPoints = entries.reduce((sum, e) => sum + (e.unit?.points || 0), 0)

  return (
    <Shell>
      <div style={{
        flex: 1,
        display: 'grid',
        gridTemplateColumns: '300px 1fr',
        gap: '1px',
        overflow: 'hidden',
        background: 'var(--color-border)',
      }}>
        {/* Left: roster */}
        <div style={{ background: 'var(--color-bg-base)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <div style={{ padding: 'var(--space-4) var(--space-5)', borderBottom: '1px solid var(--color-border)' }}>
            <div style={{ fontWeight: 700, fontSize: 'var(--font-size-lg)', marginBottom: 4 }}>{army.name}</div>
            <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>
              {army.faction} • {totalPoints.toLocaleString()} pts
            </div>
            <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)', marginTop: 4, opacity: 0.6 }}>
              Read-only shared view
            </div>
          </div>

          <div style={{ flex: 1, overflow: 'auto', padding: 'var(--space-3)' }}>
            {topLevel.map(entry => {
              const attachments = (entry.attachments ?? [])
                .map(id => entries.find(e => e.instanceId === id))
                .filter(Boolean)

              return (
                <div key={entry.instanceId} style={{ marginBottom: 'var(--space-2)' }}>
                  <div
                    onClick={() => setSelected(entry.unit)}
                    style={{
                      padding: '10px var(--space-3)',
                      background: selected?.id === entry.unit.id ? 'var(--color-bg-hover)' : 'var(--color-bg-surface)',
                      border: `1px solid ${selected?.id === entry.unit.id ? 'var(--color-accent)' : 'var(--color-border)'}`,
                      borderRadius: attachments.length ? 'var(--radius-md) var(--radius-md) 0 0' : 'var(--radius-md)',
                      cursor: 'pointer',
                      transition: 'background var(--transition-fast), border-color var(--transition-fast)',
                    }}
                  >
                    <div style={{ fontWeight: 600, fontSize: 'var(--font-size-base)' }}>{entry.unit.name}</div>
                    <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', marginTop: 2 }}>
                      {entry.unit.points ? `${entry.unit.points} pts` : 'TBC'}
                    </div>
                  </div>

                  {attachments.map(a => (
                    <div
                      key={a.instanceId}
                      onClick={() => setSelected(a.unit)}
                      style={{
                        padding: '6px var(--space-3) 6px calc(var(--space-3) + 14px)',
                        background: selected?.id === a.unit.id ? 'var(--color-bg-hover)' : '#232323',
                        border: `1px solid ${selected?.id === a.unit.id ? 'var(--color-accent)' : 'var(--color-border)'}`,
                        borderTop: 'none',
                        cursor: 'pointer',
                        position: 'relative',
                        transition: 'background var(--transition-fast), border-color var(--transition-fast)',
                      }}
                    >
                      <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-secondary)', fontSize: 10 }}>└</span>
                      <div style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600, color: 'var(--color-text-secondary)' }}>
                        {a.unit.name}
                      </div>
                    </div>
                  ))}
                </div>
              )
            })}
          </div>
        </div>

        {/* Right: unit detail */}
        <div style={{ background: 'var(--color-bg-base)', display: 'flex', flexDirection: 'column', overflow: 'auto' }}>
          {selected ? <UnitDetail unit={selected} /> : <EmptyDetail />}
        </div>
      </div>
    </Shell>
  )
}

function Shell({ children }) {
  return (
    <AppShell>
      <TopBar />
      {children}
    </AppShell>
  )
}

function Centered({ children, icon }) {
  return (
    <div style={{
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 'var(--space-3)',
      color: 'var(--color-text-secondary)',
      padding: 'var(--space-6)',
    }}>
      {icon && <div style={{ fontSize: 40, opacity: 0.2 }}>⚔</div>}
      <div>{children}</div>
    </div>
  )
}
