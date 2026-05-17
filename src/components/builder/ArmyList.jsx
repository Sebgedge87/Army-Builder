import { useState } from 'react'
import Button from '../ui/Button'
import { getLegalHosts } from '../../lib/validation'

export default function ArmyList({
  name, onNameChange,
  entries,
  onRemoveUnit, onAttachUnit, onDetachUnit,
  totalPoints, pointLimit,
  validation,
  saving, onSave,
}) {
  const [attachTarget, setAttachTarget] = useState(null)

  const pct      = Math.min((totalPoints / pointLimit) * 100, 100)
  const overLimit = totalPoints > pointLimit

  const topLevel = entries.filter(e => !e.attachedTo)

  function getAttachments(entry) {
    return (entry.attachments ?? [])
      .map(id => entries.find(e => e.instanceId === id))
      .filter(Boolean)
  }

  function isAttachmentType(entry) {
    const role = entry.unit?.attachable?.role
    return role === 'attachment' || role === 'both'
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', background: 'var(--color-bg-base)', position: 'relative' }}>

      {/* Header */}
      <div style={{ padding: 'var(--space-4) var(--space-5)', borderBottom: '1px solid var(--color-border)' }}>
        <input
          value={name}
          onChange={e => onNameChange(e.target.value)}
          placeholder="Army name…"
          style={{
            width: '100%',
            fontSize: 'var(--font-size-md)',
            fontWeight: 700,
            background: 'transparent',
            border: 'none',
            borderBottom: '1px solid var(--color-border)',
            color: 'var(--color-text-primary)',
            fontFamily: 'var(--font-family)',
            padding: '4px 0',
            outline: 'none',
            marginBottom: 'var(--space-2)',
          }}
        />
        <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>
          {topLevel.length} {topLevel.length === 1 ? 'unit' : 'units'}
          {entries.length - topLevel.length > 0 && ` • ${entries.length - topLevel.length} attachment${entries.length - topLevel.length !== 1 ? 's' : ''}`}
        </div>
      </div>

      {/* Validation errors */}
      {validation?.errors?.length > 0 && (
        <div style={{ padding: 'var(--space-2) var(--space-3)', background: 'rgba(139,38,53,0.15)', borderBottom: '1px solid rgba(139,38,53,0.3)' }}>
          {validation.errors.map((err, i) => (
            <div key={i} style={{ fontSize: 'var(--font-size-sm)', color: '#e05a6a' }}>{err}</div>
          ))}
        </div>
      )}

      {/* Unit list */}
      <div style={{ flex: 1, overflow: 'auto', padding: 'var(--space-3)' }}>
        {topLevel.length === 0 ? (
          <div style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-base)', textAlign: 'center', padding: 'var(--space-6)' }}>
            Click units to add them to your army
          </div>
        ) : (
          topLevel.map(entry => {
            const attachments = getAttachments(entry)
            const canAttach   = isAttachmentType(entry) && !entry.attachedTo
            const legalHosts  = canAttach ? getLegalHosts(entry, entries) : []
            const hasSlots    = (entry.unit?.attachable?.asHost?.slots ?? []).length > 0

            return (
              <div key={entry.instanceId} style={{ marginBottom: 'var(--space-2)' }}>

                {/* Host / standalone row */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  padding: '10px var(--space-3)',
                  background: 'var(--color-bg-surface)',
                  border: '1px solid var(--color-border)',
                  borderRadius: (attachments.length > 0 || hasSlots)
                    ? 'var(--radius-md) var(--radius-md) 0 0'
                    : 'var(--radius-md)',
                }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 'var(--font-size-base)', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {entry.unit.name}
                    </div>
                    <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', marginTop: 2 }}>
                      {entry.unit.points ? `${entry.unit.points} pts` : 'TBC'}
                    </div>
                    {/* Buff chips from attachments */}
                    {(entry.buffSources ?? []).filter(b => b.stat).length > 0 && (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 3, marginTop: 4 }}>
                        {entry.buffSources.filter(b => b.stat).map((b, i) => (
                          <span key={i} style={{
                            fontSize: 'var(--font-size-xs)',
                            padding: '2px 5px',
                            background: 'rgba(60,140,60,0.2)',
                            border: '1px solid rgba(60,140,60,0.4)',
                            borderRadius: 'var(--radius-sm)',
                            color: '#7dc87d',
                          }}>
                            {b.stat.slice(0, 3).toUpperCase()} {b.delta > 0 ? '+' : ''}{b.delta}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div style={{ display: 'flex', gap: 'var(--space-1)', alignItems: 'center', flexShrink: 0, marginLeft: 'var(--space-2)' }}>
                    {canAttach && (
                      <Button
                        variant="ghost"
                        size="sm"
                        disabled={legalHosts.length === 0}
                        onClick={() => setAttachTarget(entry)}
                        style={{ fontSize: 'var(--font-size-xs)' }}
                      >
                        Attach
                      </Button>
                    )}
                    <Button variant="ghost" size="sm" onClick={() => onRemoveUnit(entry.instanceId)}>✕</Button>
                  </div>
                </div>

                {/* Attached units */}
                {attachments.map(a => (
                  <div key={a.instanceId} style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '7px var(--space-3) 7px calc(var(--space-3) + 14px)',
                    background: '#232323',
                    borderLeft: '1px solid var(--color-border)',
                    borderRight: '1px solid var(--color-border)',
                    borderBottom: '1px solid var(--color-border)',
                    position: 'relative',
                  }}>
                    <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-secondary)', fontSize: 10, lineHeight: 1 }}>└</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: 'var(--color-text-secondary)' }}>
                        {a.unit.name}
                      </div>
                      <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)', opacity: 0.7 }}>
                        {a.unit.points ? `${a.unit.points} pts` : 'TBC'}
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 'var(--space-1)' }}>
                      <Button variant="ghost" size="sm" onClick={() => onDetachUnit(a.instanceId)} style={{ fontSize: 'var(--font-size-xs)' }}>Detach</Button>
                      <Button variant="ghost" size="sm" onClick={() => onRemoveUnit(a.instanceId)}>✕</Button>
                    </div>
                  </div>
                ))}

                {/* Slot indicators */}
                {hasSlots && (
                  <div style={{
                    display: 'flex',
                    gap: 4,
                    padding: '4px var(--space-3)',
                    background: '#1e1e1e',
                    border: '1px solid var(--color-border)',
                    borderTop: 'none',
                    borderRadius: '0 0 var(--radius-md) var(--radius-md)',
                  }}>
                    {entry.unit.attachable.asHost.slots.map(slot => {
                      const used = attachments.filter(
                        a => slot.accepts?.includes(a.unit?.attachable?.asAttachment?.attachmentType)
                      ).length
                      return (
                        <span key={slot.id} style={{
                          fontSize: 'var(--font-size-xs)',
                          padding: '2px 6px',
                          background: used >= slot.max ? 'rgba(139,38,53,0.2)' : 'rgba(255,255,255,0.04)',
                          border: `1px solid ${used >= slot.max ? 'rgba(139,38,53,0.4)' : 'var(--color-border)'}`,
                          borderRadius: 'var(--radius-sm)',
                          color: 'var(--color-text-secondary)',
                        }}>
                          {slot.id} {used}/{slot.max}
                        </span>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })
        )}
      </div>

      {/* Attach modal overlay */}
      {attachTarget && (
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.65)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10, padding: 'var(--space-4)' }}>
          <div style={{
            background: 'var(--color-bg-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-lg)',
            padding: 'var(--space-5)',
            width: '100%',
            maxWidth: 260,
          }}>
            <div style={{ fontWeight: 700, fontSize: 'var(--font-size-md)', marginBottom: 4 }}>
              Attach {attachTarget.unit.name}
            </div>
            <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', marginBottom: 'var(--space-3)' }}>
              Select a host unit:
            </div>
            {getLegalHosts(attachTarget, entries).length === 0 ? (
              <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', marginBottom: 'var(--space-3)' }}>
                No legal hosts in your army.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)', marginBottom: 'var(--space-3)' }}>
                {getLegalHosts(attachTarget, entries).map(host => (
                  <button
                    key={host.instanceId}
                    onClick={() => { onAttachUnit(attachTarget.instanceId, host.instanceId); setAttachTarget(null) }}
                    style={{
                      padding: '8px var(--space-3)',
                      background: 'var(--color-bg-base)',
                      border: '1px solid var(--color-border)',
                      borderRadius: 'var(--radius-md)',
                      color: 'var(--color-text-primary)',
                      fontFamily: 'var(--font-family)',
                      fontSize: 'var(--font-size-base)',
                      cursor: 'pointer',
                      textAlign: 'left',
                    }}
                  >
                    {host.unit.name}
                  </button>
                ))}
              </div>
            )}
            <Button variant="ghost" size="sm" onClick={() => setAttachTarget(null)} style={{ width: '100%' }}>Cancel</Button>
          </div>
        </div>
      )}

      {/* Footer: points + save */}
      <div style={{ padding: 'var(--space-4) var(--space-5)', borderTop: '1px solid var(--color-border)', background: 'var(--color-bg-base)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 'var(--space-2)' }}>
          <span style={{ fontSize: 'var(--font-size-base)', color: 'var(--color-text-secondary)' }}>Total Points</span>
          <span style={{ fontSize: 'var(--font-size-xl)', fontWeight: 700, color: overLimit ? '#e05a6a' : 'var(--color-text-primary)' }}>
            {totalPoints.toLocaleString()}
          </span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 'var(--space-2)' }}>
          <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>
            / {pointLimit.toLocaleString()} pts
          </span>
        </div>
        <div style={{ width: '100%', height: 8, background: 'var(--color-bg-surface)', borderRadius: 'var(--radius-sm)', overflow: 'hidden', marginBottom: 'var(--space-3)' }}>
          <div style={{
            height: '100%',
            width: `${pct}%`,
            background: overLimit ? '#e05a6a' : 'var(--color-accent)',
            borderRadius: 'var(--radius-sm)',
            transition: 'width var(--transition-normal)',
          }} />
        </div>
        {overLimit && (
          <div style={{ marginBottom: 'var(--space-3)', padding: 'var(--space-2) var(--space-3)', background: 'rgba(139,38,53,0.2)', borderRadius: 'var(--radius-md)', fontSize: 'var(--font-size-sm)', textAlign: 'center', color: '#e05a6a' }}>
            {(totalPoints - pointLimit).toLocaleString()} pts over limit
          </div>
        )}
        <Button style={{ width: '100%' }} disabled={saving || overLimit} onClick={onSave}>
          {saving ? 'Saving…' : 'Save Army'}
        </Button>
      </div>
    </div>
  )
}
