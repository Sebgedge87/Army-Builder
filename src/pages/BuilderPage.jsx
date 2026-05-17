import { useState, useMemo } from 'react'
import AppShell from '../components/shell/AppShell'
import UnitBrowser from '../components/builder/UnitBrowser'
import ArmyList from '../components/builder/ArmyList'
import Stat from '../components/ui/Stat'
import Tag from '../components/ui/Tag'
import allUnits from '../../data/all-units.json'

const POINT_LIMIT = 6000
const STAT_KEYS   = ['movement', 'melee', 'ranged', 'defence', 'morale', 'wounds']
const STAT_LABELS = ['MOV', 'MEL', 'RNG', 'DEF', 'MOR', 'WND']

export default function BuilderPage() {
  const [faction, setFaction]           = useState('Evil')
  const [search, setSearch]             = useState('')
  const [selectedRace, setSelectedRace] = useState('All')
  const [selectedType, setSelectedType] = useState('All')
  const [army, setArmy]                 = useState([])
  const [selectedUnit, setSelectedUnit] = useState(null)

  const races = useMemo(() => {
    const r = [...new Set(allUnits.map(u => u.race).filter(Boolean))].sort()
    return ['All', ...r]
  }, [])

  const types = useMemo(() => {
    const t = [...new Set(allUnits.map(u => u.type).filter(Boolean))].sort()
    return ['All', ...t]
  }, [])

  const filteredUnits = useMemo(() =>
    allUnits.filter(u => {
      if (u.faction !== faction && u.faction !== 'Mercenary') return false
      if (selectedRace !== 'All' && u.race !== selectedRace) return false
      if (selectedType !== 'All' && u.type !== selectedType) return false
      if (search && !u.name.toLowerCase().includes(search.toLowerCase())) return false
      return true
    }),
    [faction, search, selectedRace, selectedType]
  )

  const totalPoints = army.reduce((sum, e) => sum + (e.unit.points || 0), 0)

  function addUnit(unit) {
    setArmy(prev => [...prev, { instanceId: crypto.randomUUID(), unit }])
    setSelectedUnit(unit)
  }

  function removeUnit(instanceId) {
    setArmy(prev => prev.filter(e => e.instanceId !== instanceId))
  }

  return (
    <AppShell>
      <div
        style={{
          flex: 1,
          display: 'grid',
          gridTemplateColumns: '360px 1fr 340px',
          gap: '1px',
          overflow: 'hidden',
          background: 'var(--color-border)',
        }}
      >
        {/* Left: unit browser */}
        <UnitBrowser
          units={filteredUnits}
          faction={faction}
          onFactionChange={setFaction}
          search={search}
          onSearchChange={setSearch}
          selectedRace={selectedRace}
          onRaceChange={setSelectedRace}
          races={races}
          selectedType={selectedType}
          onTypeChange={setSelectedType}
          types={types}
          onAddUnit={addUnit}
        />

        {/* Centre: unit detail */}
        <div style={{ background: 'var(--color-bg-base)', display: 'flex', flexDirection: 'column', overflow: 'auto' }}>
          {selectedUnit ? (
            <UnitDetail unit={selectedUnit} />
          ) : (
            <EmptyDetail />
          )}
        </div>

        {/* Right: army list */}
        <ArmyList
          army={army}
          onRemoveUnit={removeUnit}
          totalPoints={totalPoints}
          pointLimit={POINT_LIMIT}
        />
      </div>
    </AppShell>
  )
}

function EmptyDetail() {
  return (
    <div
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'var(--color-text-secondary)',
        gap: 'var(--space-3)',
        padding: 'var(--space-6)',
      }}
    >
      <div style={{ fontSize: 48, opacity: 0.3 }}>⚔</div>
      <div style={{ fontSize: 'var(--font-size-lg)', fontWeight: 600, color: 'var(--color-text-tertiary)' }}>
        Select a unit to view details
      </div>
      <div style={{ fontSize: 'var(--font-size-base)' }}>
        Click any unit in the browser to inspect it, or add it to your army
      </div>
    </div>
  )
}

function UnitDetail({ unit }) {
  return (
    <div style={{ padding: 'var(--space-6)', flex: 1 }}>
      {/* Name + meta */}
      <div style={{ marginBottom: 'var(--space-5)' }}>
        <h1 style={{ fontSize: 'var(--font-size-xl)', fontWeight: 700, marginBottom: 'var(--space-1)' }}>
          {unit.name}
        </h1>
        <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
          {unit.faction && <Tag accent>{unit.faction}</Tag>}
          {unit.race    && <Tag>{unit.race}</Tag>}
          {unit.type    && <Tag>{unit.type}</Tag>}
        </div>
      </div>

      {/* Stats */}
      <div style={{ marginBottom: 'var(--space-5)' }}>
        <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 'var(--space-3)' }}>
          Stats
        </div>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(6, 1fr)',
            gap: 'var(--space-2)',
            padding: 'var(--space-4)',
            background: 'var(--color-bg-surface)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--color-border)',
          }}
        >
          {STAT_KEYS.map((key, i) => (
            <Stat key={key} label={STAT_LABELS[i]} value={unit.stats?.[key] ?? '—'} size="lg" />
          ))}
        </div>
      </div>

      {/* Weapons */}
      {unit.weapons?.length > 0 && (
        <div style={{ marginBottom: 'var(--space-5)' }}>
          <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 'var(--space-3)' }}>
            Weapons
          </div>
          <div style={{ background: 'var(--color-bg-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 'var(--font-size-base)' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
                  {['Name', 'Range', 'Attacks', 'Damage', 'AP'].map(h => (
                    <th key={h} style={{ padding: '8px var(--space-3)', textAlign: 'left', fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', fontWeight: 600 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {unit.weapons.map((w, i) => (
                  <tr key={i} style={{ borderBottom: i < unit.weapons.length - 1 ? '1px solid var(--color-border)' : 'none' }}>
                    <td style={tdStyle}>{w.name}</td>
                    <td style={tdStyle}>{w.range}</td>
                    <td style={tdStyle}>{w.attacks}</td>
                    <td style={tdStyle}>{w.damage}</td>
                    <td style={tdStyle}>{w.armourPiercing}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Keywords */}
      {unit.keywords?.length > 0 && (
        <div style={{ marginBottom: 'var(--space-5)' }}>
          <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 'var(--space-3)' }}>
            Keywords
          </div>
          <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
            {unit.keywords.map(k => <Tag key={k}>{k}</Tag>)}
          </div>
        </div>
      )}

      {/* Points */}
      <div style={{ marginTop: 'auto', paddingTop: 'var(--space-4)', borderTop: '1px solid var(--color-border)' }}>
        <span style={{ fontSize: 'var(--font-size-base)', color: 'var(--color-text-secondary)' }}>Points cost: </span>
        <span style={{ fontSize: 'var(--font-size-lg)', fontWeight: 700, color: 'var(--color-accent)' }}>
          {unit.points ? `${unit.points} pts` : 'TBC'}
        </span>
      </div>
    </div>
  )
}

const tdStyle = {
  padding: '8px var(--space-3)',
  color: 'var(--color-text-primary)',
}
