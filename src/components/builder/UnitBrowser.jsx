import { useState } from 'react'
import Stat from '../ui/Stat'

const FACTIONS = ['Good', 'Evil']
const STAT_KEYS = ['movement', 'melee', 'ranged', 'defence', 'morale', 'wounds']
const STAT_LABELS = ['MOV', 'MEL', 'RNG', 'DEF', 'MOR', 'WND']

export default function UnitBrowser({
  units,
  loading,
  faction,
  onFactionChange,
  search,
  onSearchChange,
  selectedRace,
  onRaceChange,
  races,
  selectedType,
  onTypeChange,
  types,
  onAddUnit,
  onSelectUnit,
}) {
  const [hoveredId, setHoveredId] = useState(null)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', background: 'var(--color-bg-base)' }}>
      {/* Header */}
      <div style={{ padding: 'var(--space-5)', borderBottom: '1px solid var(--color-border)' }}>
        <div style={{ fontSize: 'var(--font-size-lg)', fontWeight: 700, marginBottom: '4px' }}>
          Unit Browser
        </div>
        <div style={{ fontSize: 'var(--font-size-base)', color: 'var(--color-text-secondary)' }}>
          {loading ? 'Loading…' : `${units.length} units available`}
        </div>
      </div>

      {/* Filters */}
      <div style={{ padding: 'var(--space-3)', borderBottom: '1px solid var(--color-border)', display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
        {/* Faction tabs */}
        <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
          {FACTIONS.map(f => (
            <button
              key={f}
              onClick={() => onFactionChange(f)}
              style={{
                flex: 1,
                padding: '8px',
                fontSize: 'var(--font-size-base)',
                fontWeight: 600,
                fontFamily: 'var(--font-family)',
                background: faction === f ? 'var(--color-accent)' : 'var(--color-bg-surface)',
                border: '1px solid',
                borderColor: faction === f ? 'var(--color-accent)' : 'var(--color-border)',
                borderRadius: 'var(--radius-sm)',
                color: 'var(--color-text-primary)',
                cursor: 'pointer',
                transition: 'background var(--transition-fast)',
              }}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Search */}
        <input
          type="text"
          value={search}
          onChange={e => onSearchChange(e.target.value)}
          placeholder="Search units…"
          style={{
            padding: '10px 12px',
            fontSize: 'var(--font-size-md)',
            background: 'var(--color-bg-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-md)',
            color: 'var(--color-text-primary)',
            fontFamily: 'var(--font-family)',
            outline: 'none',
          }}
        />

        {/* Race + Type filters */}
        <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
          <select
            value={selectedRace}
            onChange={e => onRaceChange(e.target.value)}
            style={filterSelectStyle}
          >
            {races.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
          <select
            value={selectedType}
            onChange={e => onTypeChange(e.target.value)}
            style={filterSelectStyle}
          >
            {types.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
      </div>

      {/* Unit list */}
      <div style={{ flex: 1, overflow: 'auto', padding: 'var(--space-3)' }}>
        {loading ? (
          <div style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-base)', textAlign: 'center', padding: 'var(--space-6)' }}>
            Loading units…
          </div>
        ) : units.length === 0 ? (
          <div style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-base)', textAlign: 'center', padding: 'var(--space-6)' }}>
            No units match your filters
          </div>
        ) : (
          units.map(unit => (
            <div
              key={unit.id}
              onClick={() => { onSelectUnit?.(unit); onAddUnit(unit) }}
              onMouseEnter={() => setHoveredId(unit.id)}
              onMouseLeave={() => setHoveredId(null)}
              style={{
                padding: 'var(--space-3)',
                background: hoveredId === unit.id ? 'var(--color-bg-hover)' : 'var(--color-bg-surface)',
                border: `1px solid ${hoveredId === unit.id ? 'var(--color-accent)' : 'var(--color-border)'}`,
                borderRadius: 'var(--radius-md)',
                marginBottom: 'var(--space-2)',
                cursor: 'pointer',
                transition: 'background var(--transition-fast), border-color var(--transition-fast)',
              }}
            >
              <div style={{ fontSize: 'var(--font-size-md)', fontWeight: 600, marginBottom: '4px' }}>
                {unit.name}
              </div>
              <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', marginBottom: 'var(--space-2)' }}>
                {[unit.race, ...(unit.types ?? (unit.type ? [unit.type] : []))].filter(Boolean).join(' • ')}
              </div>
              <div style={{ display: 'flex', gap: 'var(--space-3)', marginBottom: 'var(--space-2)' }}>
                {STAT_KEYS.map((key, i) => (
                  <Stat key={key} label={STAT_LABELS[i]} value={unit.stats?.[key] ?? '—'} />
                ))}
              </div>
              <div
                style={{
                  display: 'inline-block',
                  padding: '3px 10px',
                  background: 'var(--color-accent)',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: 'var(--font-size-sm)',
                  fontWeight: 600,
                }}
              >
                {unit.points ? `${unit.points} pts` : 'TBC'}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

const filterSelectStyle = {
  flex: 1,
  padding: '8px 10px',
  fontSize: 'var(--font-size-base)',
  background: 'var(--color-bg-surface)',
  border: '1px solid var(--color-border)',
  borderRadius: 'var(--radius-md)',
  color: 'var(--color-text-primary)',
  fontFamily: 'var(--font-family)',
  outline: 'none',
  cursor: 'pointer',
}
