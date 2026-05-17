import Button from '../ui/Button'

export default function ArmyList({ army, onRemoveUnit, totalPoints, pointLimit }) {
  const pct = Math.min((totalPoints / pointLimit) * 100, 100)
  const overLimit = totalPoints > pointLimit

  return (
    <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', background: 'var(--color-bg-base)', borderLeft: '1px solid var(--color-border)' }}>
      {/* Header */}
      <div style={{ padding: 'var(--space-5)', borderBottom: '1px solid var(--color-border)' }}>
        <div style={{ fontSize: 'var(--font-size-lg)', fontWeight: 700, marginBottom: '4px' }}>
          My Army
        </div>
        <div style={{ fontSize: 'var(--font-size-base)', color: 'var(--color-text-secondary)' }}>
          {army.length} {army.length === 1 ? 'unit' : 'units'}
        </div>
      </div>

      {/* Army entries */}
      <div style={{ flex: 1, overflow: 'auto', padding: 'var(--space-3)' }}>
        {army.length === 0 ? (
          <div style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-base)', textAlign: 'center', padding: 'var(--space-6)' }}>
            Click units to add them to your army
          </div>
        ) : (
          army.map(entry => (
            <div
              key={entry.instanceId}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '10px var(--space-3)',
                background: 'var(--color-bg-surface)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-md)',
                marginBottom: 'var(--space-2)',
              }}
            >
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 'var(--font-size-base)', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {entry.unit.name}
                </div>
                <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>
                  {entry.unit.points ? `${entry.unit.points} pts` : 'TBC'}
                </div>
              </div>
              <Button variant="ghost" size="sm" onClick={() => onRemoveUnit(entry.instanceId)}>
                ✕
              </Button>
            </div>
          ))
        )}
      </div>

      {/* Points footer */}
      <div style={{ padding: 'var(--space-4) var(--space-5)', borderTop: '1px solid var(--color-border)', background: 'var(--color-bg-base)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 'var(--space-2)' }}>
          <span style={{ fontSize: 'var(--font-size-base)', color: 'var(--color-text-secondary)' }}>
            Total Points
          </span>
          <span style={{ fontSize: 'var(--font-size-xl)', fontWeight: 700, color: overLimit ? '#e05a6a' : 'var(--color-text-primary)' }}>
            {totalPoints.toLocaleString()}
          </span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 'var(--space-2)' }}>
          <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>
            / {pointLimit.toLocaleString()} pts
          </span>
        </div>
        {/* Progress bar */}
        <div style={{ width: '100%', height: 8, background: 'var(--color-bg-surface)', borderRadius: 'var(--radius-sm)', overflow: 'hidden' }}>
          <div
            style={{
              height: '100%',
              width: `${pct}%`,
              background: overLimit ? '#e05a6a' : 'var(--color-accent)',
              borderRadius: 'var(--radius-sm)',
              transition: 'width var(--transition-normal)',
            }}
          />
        </div>
        {overLimit && (
          <div style={{ marginTop: 'var(--space-2)', padding: 'var(--space-2) var(--space-3)', background: 'var(--color-accent)', borderRadius: 'var(--radius-md)', fontSize: 'var(--font-size-sm)', textAlign: 'center' }}>
            {(totalPoints - pointLimit).toLocaleString()} pts over limit
          </div>
        )}
      </div>
    </div>
  )
}
