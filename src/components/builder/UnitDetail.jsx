import Stat from '../ui/Stat'
import Tag from '../ui/Tag'

const STAT_KEYS   = ['movement', 'melee', 'ranged', 'defence', 'morale', 'wounds']
const STAT_LABELS = ['MOV', 'MEL', 'RNG', 'DEF', 'MOR', 'WND']

const FACTION_COLORS = {
  Good:      '#1a3a5c',
  Evil:      '#4a1520',
  Mercenary: '#2d2a1a',
}

export function EmptyDetail() {
  return (
    <div
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 'var(--space-3)',
        padding: 'var(--space-6)',
        color: 'var(--color-text-secondary)',
      }}
    >
      <div style={{ fontSize: 48, opacity: 0.2 }}>⚔</div>
      <div style={{ fontSize: 'var(--font-size-lg)', fontWeight: 600, color: 'var(--color-text-tertiary)' }}>
        Select a unit to view details
      </div>
      <div style={{ fontSize: 'var(--font-size-base)' }}>
        Click any unit in the browser to inspect it, or add it to your army
      </div>
    </div>
  )
}

export default function UnitDetail({ unit }) {
  const types = unit.types ?? (unit.type ? [unit.type] : [])

  return (
    <div style={{ padding: 'var(--space-5)', flex: 1, overflow: 'auto' }}>

      {/* Image placeholder */}
      <UnitImage unit={unit} />

      {/* Name + tags */}
      <div style={{ marginBottom: 'var(--space-4)' }}>
        <h1 style={{ fontSize: 'var(--font-size-xl)', fontWeight: 700, marginBottom: 'var(--space-2)' }}>
          {unit.name}
        </h1>
        <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
          {unit.faction && <Tag accent>{unit.faction}</Tag>}
          {unit.race    && <Tag>{unit.race}</Tag>}
          {types.map(t  => <Tag key={t}>{t}</Tag>)}
        </div>
      </div>

      {/* Stats */}
      <SectionLabel>Stats</SectionLabel>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(6, 1fr)',
          gap: 'var(--space-2)',
          padding: 'var(--space-4)',
          background: 'var(--color-bg-surface)',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--color-border)',
          marginBottom: 'var(--space-4)',
        }}
      >
        {STAT_KEYS.map((key, i) => (
          <Stat key={key} label={STAT_LABELS[i]} value={unit.stats?.[key] ?? '—'} size="lg" />
        ))}
      </div>

      {/* Weapons */}
      {unit.weapons?.length > 0 && (
        <>
          <SectionLabel>Weapons</SectionLabel>
          <div style={{ background: 'var(--color-bg-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', overflow: 'hidden', marginBottom: 'var(--space-4)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 'var(--font-size-base)' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
                  {['Name', 'Range', 'Attacks', 'Dmg', 'AP'].map(h => (
                    <th key={h} style={thStyle}>{h}</th>
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
        </>
      )}

      {/* Special rules */}
      {unit.specialRules?.length > 0 && (
        <>
          <SectionLabel>Special Rules</SectionLabel>
          <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap', marginBottom: 'var(--space-4)' }}>
            {unit.specialRules.map(r => <Tag key={r}>{r}</Tag>)}
          </div>
        </>
      )}

      {/* Keywords */}
      {unit.keywords?.length > 0 && (
        <>
          <SectionLabel>Keywords</SectionLabel>
          <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap', marginBottom: 'var(--space-4)' }}>
            {unit.keywords.map(k => <Tag key={k}>{k}</Tag>)}
          </div>
        </>
      )}

      {/* Flavour text */}
      {unit.flavorText && (
        <p style={{ fontSize: 'var(--font-size-base)', color: 'var(--color-text-secondary)', fontStyle: 'italic', marginBottom: 'var(--space-4)', paddingLeft: 'var(--space-3)', borderLeft: '2px solid var(--color-border)' }}>
          {unit.flavorText}
        </p>
      )}

      {/* Points */}
      <div style={{ paddingTop: 'var(--space-4)', borderTop: '1px solid var(--color-border)' }}>
        <span style={{ fontSize: 'var(--font-size-base)', color: 'var(--color-text-secondary)' }}>Points cost: </span>
        <span style={{ fontSize: 'var(--font-size-lg)', fontWeight: 700, color: 'var(--color-accent)' }}>
          {unit.points ? `${unit.points} pts` : 'TBC'}
        </span>
      </div>
    </div>
  )
}

function UnitImage({ unit }) {
  if (unit.images?.card) {
    return (
      <img
        src={unit.images.card}
        alt={unit.name}
        style={{ width: '100%', height: 160, objectFit: 'cover', borderRadius: 'var(--radius-md)', marginBottom: 'var(--space-4)' }}
        onError={e => { e.target.style.display = 'none' }}
      />
    )
  }
  // Faction-tinted placeholder
  const bg = FACTION_COLORS[unit.faction] ?? FACTION_COLORS.Mercenary
  const initials = unit.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
  return (
    <div style={{
      width: '100%', height: 120,
      background: bg,
      border: '1px solid var(--color-border)',
      borderRadius: 'var(--radius-md)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: 32, fontWeight: 700, color: 'rgba(255,255,255,0.25)',
      marginBottom: 'var(--space-4)',
      letterSpacing: 4,
    }}>
      {initials}
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

const thStyle = {
  padding: '8px var(--space-3)',
  textAlign: 'left',
  fontSize: 'var(--font-size-sm)',
  color: 'var(--color-text-secondary)',
  fontWeight: 600,
}

const tdStyle = {
  padding: '8px var(--space-3)',
  color: 'var(--color-text-primary)',
  fontSize: 'var(--font-size-base)',
}
