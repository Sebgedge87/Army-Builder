import { useState } from 'react'
import Stat from '../ui/Stat'
import Tag from '../ui/Tag'
import Button from '../ui/Button'

const STAT_KEYS   = ['movement', 'melee', 'ranged', 'defence', 'morale', 'wounds']
const STAT_LABELS = ['MOV', 'MEL', 'RNG', 'DEF', 'MOR', 'WND']

const FACTION_COLORS = {
  Good:      '#1a3a5c',
  Evil:      '#4a1520',
  Mercenary: '#2d2a1a',
}

export default function UnitCard({ unit, onAdd, onSelect }) {
  const [hovered, setHovered] = useState(false)
  const types = unit.types ?? (unit.type ? [unit.type] : [])
  const initials = unit.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
  const placeholderBg = FACTION_COLORS[unit.faction] ?? FACTION_COLORS.Mercenary

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => onSelect?.(unit)}
      style={{
        background: hovered ? 'var(--color-bg-hover)' : 'var(--color-bg-surface)',
        border: `1px solid ${hovered ? 'var(--color-accent)' : 'var(--color-border)'}`,
        borderRadius: 'var(--radius-md)',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        cursor: 'pointer',
        transition: 'border-color var(--transition-fast), background var(--transition-fast)',
      }}
    >
      {/* Thumbnail */}
      {unit.images?.thumb ? (
        <img
          src={unit.images.thumb}
          alt={unit.name}
          style={{ width: '100%', height: 100, objectFit: 'cover' }}
          onError={e => { e.target.style.display = 'none' }}
        />
      ) : (
        <div style={{
          width: '100%', height: 100,
          background: placeholderBg,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 28, fontWeight: 700, color: 'rgba(255,255,255,0.2)',
          letterSpacing: 4,
        }}>
          {initials}
        </div>
      )}

      {/* Body */}
      <div style={{ padding: 'var(--space-3)', flex: 1, display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
        <div style={{ fontWeight: 600, fontSize: 'var(--font-size-md)' }}>{unit.name}</div>

        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
          {unit.faction && <Tag accent>{unit.faction}</Tag>}
          {unit.race    && <Tag>{unit.race}</Tag>}
          {types[0]     && <Tag>{types[0]}</Tag>}
        </div>

        {/* Stats grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 2 }}>
          {STAT_KEYS.map((key, i) => (
            <Stat key={key} label={STAT_LABELS[i]} value={unit.stats?.[key] ?? '—'} />
          ))}
        </div>

        {/* First weapon */}
        {unit.weapons?.[0] && (
          <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {unit.weapons[0].name}
          </div>
        )}

        {/* Footer */}
        <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 'var(--font-size-base)', fontWeight: 700, color: 'var(--color-accent)' }}>
            {unit.points ? `${unit.points} pts` : 'TBC'}
          </span>
          <Button
            size="sm"
            onClick={e => { e.stopPropagation(); onAdd?.(unit) }}
          >
            + Add
          </Button>
        </div>
      </div>
    </div>
  )
}
