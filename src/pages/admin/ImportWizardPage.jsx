import { useState } from 'react'
import { collection, doc, setDoc, addDoc, deleteDoc, getDocs } from 'firebase/firestore'
import { useNavigate } from 'react-router-dom'
import { db } from '../../services/firebase'
import Button from '../../components/ui/Button'
import { parseCSV, autoDetectMapping, applyMapping } from '../../lib/import/parseCSV'
import { validateRows, normaliseRow } from '../../lib/import/validateRows'
import { computeDiff } from '../../lib/import/diff'

const UNIT_FIELDS = [
  { key: 'ignore',           label: '— Skip —' },
  { key: 'name',             label: 'Name' },
  { key: 'faction',          label: 'Faction' },
  { key: 'race',             label: 'Race' },
  { key: 'type',             label: 'Type' },
  { key: 'points',           label: 'Points' },
  { key: 'stats.movement',   label: 'MOV' },
  { key: 'stats.melee',      label: 'MEL' },
  { key: 'stats.ranged',     label: 'RNG' },
  { key: 'stats.defence',    label: 'DEF' },
  { key: 'stats.morale',     label: 'MOR' },
  { key: 'stats.wounds',     label: 'WND' },
  { key: 'keywords',         label: 'Keywords' },
  { key: 'specialRules',     label: 'Special Rules' },
  { key: 'flavorText',       label: 'Flavor Text' },
]

const INIT = {
  step:       1,
  source:     null,    // 'csv' | 'json'
  rawText:    '',
  headers:    [],
  fieldMap:   {},
  mappedRows: [],
  results:    [],      // validateRows output
  mode:       'upsert',
  diff:       null,
  committing: false,
}

export default function ImportWizardPage() {
  const navigate = useNavigate()
  const [s, setS] = useState(INIT)
  const upd = patch => setS(prev => ({ ...prev, ...patch }))

  // ── Step 1: source selection ─────────────────────────────────────
  function handleFile(e) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = ev => {
      const text = ev.target.result
      if (file.name.endsWith('.json')) {
        handleJSONText(text)
      } else {
        const { headers, rows } = parseCSV(text)
        const fieldMap = autoDetectMapping(headers)
        upd({ source: 'csv', rawText: text, headers, mappedRows: rows, fieldMap })
      }
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  function handleJSONText(text) {
    try {
      const parsed = JSON.parse(text)
      const arr = Array.isArray(parsed) ? parsed : parsed.units ?? []
      upd({ source: 'json', rawText: text, mappedRows: arr, headers: [], fieldMap: {} })
    } catch {
      alert('Invalid JSON')
    }
  }

  // ── Step 3: validate ─────────────────────────────────────────────
  function runValidation(rows) {
    const normed = s.source === 'csv'
      ? applyMapping(rows, s.fieldMap).map(normaliseRow)
      : rows.map(normaliseRow)
    const results = validateRows(normed)
    upd({ mappedRows: normed, results, step: 3 })
  }

  // ── Step 6: commit ───────────────────────────────────────────────
  async function handleCommit() {
    upd({ committing: true })
    try {
      const { toInsert, toUpdate, toDelete } = s.diff
      const col = collection(db, 'units')

      for (const unit of toInsert) {
        const id = unit.name.toLowerCase().replace(/[^a-z0-9]+/g, '_')
        await setDoc(doc(col, id), unit, { merge: true })
      }
      for (const { updated } of toUpdate) {
        const id = updated.id ?? updated.name.toLowerCase().replace(/[^a-z0-9]+/g, '_')
        await setDoc(doc(col, id), updated, { merge: true })
      }
      if (s.mode === 'replace') {
        for (const u of toDelete) {
          if (u.id) await deleteDoc(doc(col, u.id))
        }
      }
      navigate('/admin')
    } finally {
      upd({ committing: false })
    }
  }

  // ── Render steps ─────────────────────────────────────────────────
  return (
    <div style={{ padding: 'var(--space-5)', maxWidth: 900 }}>
      {/* Step indicator */}
      <StepBar current={s.step} />

      {s.step === 1 && (
        <Step1
          onFile={handleFile}
          onPaste={text => { upd({ rawText: text }) }}
          onJSONPaste={() => handleJSONText(s.rawText)}
          rawText={s.rawText}
          onRawTextChange={t => upd({ rawText: t })}
          onNext={() => {
            if (!s.mappedRows.length) { alert('Upload or paste a file first'); return }
            upd({ step: s.source === 'csv' ? 2 : 3 })
            if (s.source !== 'csv') runValidation(s.mappedRows)
          }}
        />
      )}

      {s.step === 2 && s.source === 'csv' && (
        <Step2
          headers={s.headers}
          fieldMap={s.fieldMap}
          sampleRows={s.mappedRows.slice(0, 3)}
          onChange={(h, val) => upd({ fieldMap: { ...s.fieldMap, [h]: val } })}
          onBack={() => upd({ step: 1 })}
          onNext={() => runValidation(s.mappedRows)}
        />
      )}

      {s.step === 3 && (
        <Step3
          results={s.results}
          onBack={() => upd({ step: s.source === 'csv' ? 2 : 1 })}
          onNext={() => upd({ step: 4 })}
        />
      )}

      {s.step === 4 && (
        <Step4
          rows={s.mappedRows}
          results={s.results}
          onChange={(i, field, val) => {
            const updated = s.mappedRows.map((r, j) => j === i ? { ...r, [field]: val } : r)
            const results = validateRows(updated)
            upd({ mappedRows: updated, results })
          }}
          onBack={() => upd({ step: 3 })}
          onNext={() => upd({ step: 5 })}
        />
      )}

      {s.step === 5 && (
        <Step5
          onBack={() => upd({ step: 4 })}
          onNext={() => upd({ step: 5.5 })}  // actually goes to 6 via async
          onSkip={async () => {
            const existing = await getDocs(collection(db, 'units'))
            const existingUnits = existing.docs.map(d => ({ id: d.id, ...d.data() }))
            const diff = computeDiff(s.mappedRows, existingUnits, s.mode)
            upd({ diff, step: 6 })
          }}
        />
      )}

      {s.step === 6 && s.diff && (
        <Step6
          diff={s.diff}
          mode={s.mode}
          onModeChange={m => upd({ mode: m })}
          committing={s.committing}
          onBack={() => upd({ step: 5 })}
          onCommit={handleCommit}
        />
      )}
    </div>
  )
}

// ── Step components ──────────────────────────────────────────────────

function StepBar({ current }) {
  const steps = ['Source', 'Mapping', 'Validate', 'Preview', 'Images', 'Commit']
  return (
    <div style={{ display: 'flex', gap: 0, marginBottom: 'var(--space-5)', borderBottom: '1px solid var(--color-border)', paddingBottom: 'var(--space-3)' }}>
      {steps.map((label, i) => {
        const n = i + 1
        const done = n < current
        const active = n === current || (n === 2 && current === 1.5)
        return (
          <div key={n} style={{ display: 'flex', alignItems: 'center', gap: 6, marginRight: 'var(--space-3)' }}>
            <div style={{
              width: 22, height: 22, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 'var(--font-size-xs)', fontWeight: 700,
              background: done ? 'var(--color-accent)' : active ? 'var(--color-bg-hover)' : 'var(--color-bg-surface)',
              border: `1px solid ${active ? 'var(--color-accent)' : 'var(--color-border)'}`,
              color: done ? '#fff' : active ? 'var(--color-text-primary)' : 'var(--color-text-secondary)',
            }}>{done ? '✓' : n}</div>
            <span style={{ fontSize: 'var(--font-size-sm)', color: active ? 'var(--color-text-primary)' : 'var(--color-text-secondary)', fontWeight: active ? 600 : 400 }}>{label}</span>
          </div>
        )
      })}
    </div>
  )
}

function Step1({ onFile, rawText, onRawTextChange, onJSONPaste, onNext }) {
  return (
    <div>
      <SH>Step 1 — Choose Source</SH>
      <div style={{ display: 'flex', gap: 'var(--space-4)', flexWrap: 'wrap', marginBottom: 'var(--space-4)' }}>
        <label style={uploadBoxStyle}>
          <div style={{ fontSize: 24, marginBottom: 4 }}>📄</div>
          <div style={{ fontWeight: 600 }}>Upload CSV or JSON</div>
          <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', marginTop: 2 }}>Click to choose file</div>
          <input type="file" accept=".csv,.json" onChange={onFile} style={{ display: 'none' }} />
        </label>
      </div>
      <div style={{ marginBottom: 'var(--space-4)' }}>
        <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', marginBottom: 'var(--space-2)' }}>Or paste JSON:</div>
        <textarea
          value={rawText}
          onChange={e => onRawTextChange(e.target.value)}
          placeholder='[{"name":"Orc Warriors","faction":"Evil",...}]'
          style={{ width: '100%', height: 120, background: 'var(--color-bg-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', color: 'var(--color-text-primary)', fontFamily: 'monospace', fontSize: 'var(--font-size-sm)', padding: 'var(--space-3)', outline: 'none', resize: 'vertical', boxSizing: 'border-box' }}
        />
        <Button size="sm" variant="secondary" style={{ marginTop: 'var(--space-2)' }} onClick={onJSONPaste}>Parse JSON</Button>
      </div>
      <Button onClick={onNext}>Next →</Button>
    </div>
  )
}

function Step2({ headers, fieldMap, sampleRows, onChange, onBack, onNext }) {
  return (
    <div>
      <SH>Step 2 — Field Mapping</SH>
      <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)', marginBottom: 'var(--space-4)' }}>
        Map each CSV column to a unit field. Columns set to "Skip" are ignored.
      </p>
      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 'var(--space-4)', fontSize: 'var(--font-size-sm)' }}>
        <thead>
          <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
            <th style={thStyle}>CSV Column</th>
            <th style={thStyle}>Maps to</th>
            {sampleRows.map((_, i) => <th key={i} style={thStyle}>Row {i + 1}</th>)}
          </tr>
        </thead>
        <tbody>
          {headers.map(h => (
            <tr key={h} style={{ borderBottom: '1px solid var(--color-border)' }}>
              <td style={tdStyle2}><code style={{ fontSize: 'var(--font-size-xs)', background: 'var(--color-bg-hover)', padding: '2px 5px', borderRadius: 3 }}>{h}</code></td>
              <td style={tdStyle2}>
                <select value={fieldMap[h] ?? 'ignore'} onChange={e => onChange(h, e.target.value)} style={{ background: 'var(--color-bg-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', color: 'var(--color-text-primary)', padding: '3px 6px', fontFamily: 'var(--font-family)', fontSize: 'var(--font-size-sm)', outline: 'none' }}>
                  {UNIT_FIELDS.map(f => <option key={f.key} value={f.key}>{f.label}</option>)}
                </select>
              </td>
              {sampleRows.map((row, i) => <td key={i} style={{ ...tdStyle2, color: 'var(--color-text-secondary)', maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{row[h] ?? ''}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
      <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
        <Button variant="secondary" onClick={onBack}>← Back</Button>
        <Button onClick={onNext}>Next →</Button>
      </div>
    </div>
  )
}

function Step3({ results, onBack, onNext }) {
  const errCount  = results.filter(r => !r.isValid).length
  const warnCount = results.filter(r => r.warnings.length).length
  const okCount   = results.filter(r => r.isValid && !r.warnings.length).length
  return (
    <div>
      <SH>Step 3 — Validation Report</SH>
      <div style={{ display: 'flex', gap: 'var(--space-3)', marginBottom: 'var(--space-4)' }}>
        <Chip color="#4a9e4a">{okCount} valid</Chip>
        {warnCount > 0 && <Chip color="#9e8a4a">{warnCount} warnings</Chip>}
        {errCount  > 0 && <Chip color="#9e4a4a">{errCount} errors</Chip>}
      </div>
      <div style={{ maxHeight: 300, overflow: 'auto', marginBottom: 'var(--space-4)', display: 'flex', flexDirection: 'column', gap: 4 }}>
        {results.map(r => (r.errors.length > 0 || r.warnings.length > 0) && (
          <div key={r.rowIndex} style={{ padding: 'var(--space-2) var(--space-3)', background: r.errors.length ? 'rgba(139,38,53,0.1)' : 'rgba(100,80,0,0.1)', borderRadius: 'var(--radius-sm)', border: `1px solid ${r.errors.length ? 'rgba(139,38,53,0.3)' : 'rgba(100,80,0,0.3)'}`, fontSize: 'var(--font-size-sm)' }}>
            <strong>Row {r.rowIndex + 1}:</strong>{' '}
            {[...r.errors.map(e => <span key={e} style={{ color: '#e05a6a' }}>{e}</span>), ...r.warnings.map(w => <span key={w} style={{ color: '#c8a040' }}>{w}</span>)].reduce((a, b) => [a, ' • ', b])}
          </div>
        ))}
      </div>
      <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)', marginBottom: 'var(--space-3)' }}>
        You can fix errors in the next step before committing.
      </p>
      <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
        <Button variant="secondary" onClick={onBack}>← Back</Button>
        <Button onClick={onNext}>Review & Edit →</Button>
      </div>
    </div>
  )
}

function Step4({ rows, results, onChange, onBack, onNext }) {
  const errCount = results.filter(r => !r.isValid).length
  return (
    <div>
      <SH>Step 4 — Preview & Edit</SH>
      {errCount > 0 && (
        <div style={{ padding: 'var(--space-2) var(--space-3)', background: 'rgba(139,38,53,0.1)', border: '1px solid rgba(139,38,53,0.3)', borderRadius: 'var(--radius-md)', marginBottom: 'var(--space-3)', fontSize: 'var(--font-size-sm)', color: '#e05a6a' }}>
          {errCount} row(s) still have errors. Fix them before committing.
        </div>
      )}
      <div style={{ overflowX: 'auto', marginBottom: 'var(--space-4)' }}>
        <table style={{ borderCollapse: 'collapse', fontSize: 'var(--font-size-xs)', minWidth: 900 }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--color-border)', background: 'var(--color-bg-surface)' }}>
              {['#', 'Name', 'Faction', 'Race', 'Types', 'Pts', 'MOV', 'MEL', 'RNG', 'DEF', 'MOR', 'WND'].map(h => (
                <th key={h} style={{ padding: '6px 8px', textAlign: 'left', fontWeight: 600, color: 'var(--color-text-secondary)', whiteSpace: 'nowrap' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => {
              const r = results[i]
              const bg = !r?.isValid ? 'rgba(139,38,53,0.08)' : r?.warnings.length ? 'rgba(100,80,0,0.06)' : 'transparent'
              const makeInput = (field, type = 'text') => (
                <input
                  type={type}
                  value={row[field] ?? ''}
                  onChange={e => onChange(i, field, type === 'number' ? Number(e.target.value) : e.target.value)}
                  style={{ width: '100%', background: 'transparent', border: 'none', borderBottom: '1px solid var(--color-border)', color: 'var(--color-text-primary)', fontFamily: 'var(--font-family)', fontSize: 'var(--font-size-xs)', padding: '1px 2px', outline: 'none', minWidth: 60 }}
                />
              )
              return (
                <tr key={i} style={{ borderBottom: '1px solid var(--color-border)', background: bg }}>
                  <td style={{ padding: '4px 8px', color: 'var(--color-text-secondary)', fontSize: 10 }}>{i + 1}</td>
                  <td style={{ padding: '4px 8px' }}>{makeInput('name')}</td>
                  <td style={{ padding: '4px 8px' }}>{makeInput('faction')}</td>
                  <td style={{ padding: '4px 8px' }}>{makeInput('race')}</td>
                  <td style={{ padding: '4px 8px' }}>{makeInput('types')}</td>
                  <td style={{ padding: '4px 8px' }}>{makeInput('points', 'number')}</td>
                  {['movement','melee','ranged','defence','morale','wounds'].map(k => (
                    <td key={k} style={{ padding: '4px 8px' }}>
                      <input type="number" value={row.stats?.[k] ?? ''} onChange={e => onChange(i, `stats.${k}`, Number(e.target.value))} style={{ width: 36, background: 'transparent', border: 'none', borderBottom: '1px solid var(--color-border)', color: 'var(--color-text-primary)', fontFamily: 'var(--font-family)', fontSize: 'var(--font-size-xs)', padding: '1px 2px', outline: 'none' }} />
                    </td>
                  ))}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
        <Button variant="secondary" onClick={onBack}>← Back</Button>
        <Button onClick={onNext}>Images →</Button>
      </div>
    </div>
  )
}

function Step5({ onBack, onSkip }) {
  return (
    <div>
      <SH>Step 5 — Image Attachment</SH>
      <div style={{ padding: 'var(--space-5)', background: 'var(--color-bg-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', marginBottom: 'var(--space-4)' }}>
        <div style={{ fontSize: 32, marginBottom: 'var(--space-3)', opacity: 0.3 }}>🖼</div>
        <div style={{ fontWeight: 600, marginBottom: 'var(--space-2)' }}>Bulk image matching requires a Cloud Function</div>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)', margin: 0 }}>
          Auto-generating card / thumb / icon sizes from uploads requires the <code>onImageUpload</code> Cloud Function.
          Skip this step and upload images individually from the Units Table after importing.
        </p>
      </div>
      <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
        <Button variant="secondary" onClick={onBack}>← Back</Button>
        <Button onClick={onSkip}>Skip → Review</Button>
      </div>
    </div>
  )
}

function Step6({ diff, mode, onModeChange, committing, onBack, onCommit }) {
  const { toInsert, toUpdate, toDelete } = diff
  return (
    <div>
      <SH>Step 6 — Confirm & Write</SH>
      <div style={{ display: 'flex', gap: 'var(--space-3)', marginBottom: 'var(--space-4)' }}>
        <Chip color="#4a9e4a">+{toInsert.length} new</Chip>
        <Chip color="#4a7a9e">~{toUpdate.length} updated</Chip>
        {toDelete.length > 0 && <Chip color="#9e4a4a">−{toDelete.length} deleted</Chip>}
      </div>

      <div style={{ marginBottom: 'var(--space-4)' }}>
        <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', marginBottom: 'var(--space-2)' }}>Import mode:</div>
        {[['upsert', 'Upsert (add new + update existing)'], ['insert', 'Insert new only (skip existing)'], ['replace', 'Replace all (delete units not in import)']].map(([val, label]) => (
          <label key={val} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-2)', cursor: 'pointer', fontSize: 'var(--font-size-sm)' }}>
            <input type="radio" name="mode" value={val} checked={mode === val} onChange={() => onModeChange(val)} />
            {label}
          </label>
        ))}
      </div>

      {mode === 'replace' && toDelete.length > 0 && (
        <div style={{ padding: 'var(--space-3)', background: 'rgba(139,38,53,0.15)', border: '1px solid rgba(139,38,53,0.3)', borderRadius: 'var(--radius-md)', fontSize: 'var(--font-size-sm)', color: '#e05a6a', marginBottom: 'var(--space-4)' }}>
          Warning: {toDelete.length} existing units will be permanently deleted.
        </div>
      )}

      <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
        <Button variant="secondary" onClick={onBack}>← Back</Button>
        <Button disabled={committing} onClick={onCommit}>
          {committing ? 'Committing…' : `Commit ${toInsert.length + toUpdate.length} units`}
        </Button>
      </div>
    </div>
  )
}

// ── Shared primitives ─────────────────────────────────────────────────
function SH({ children }) {
  return <h2 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 700, marginBottom: 'var(--space-3)' }}>{children}</h2>
}

function Chip({ children, color }) {
  return (
    <div style={{ padding: '4px 12px', borderRadius: 'var(--radius-sm)', background: `${color}22`, border: `1px solid ${color}66`, fontSize: 'var(--font-size-sm)', fontWeight: 600, color }}>
      {children}
    </div>
  )
}

const uploadBoxStyle = {
  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
  width: 180, height: 120, padding: 'var(--space-4)',
  background: 'var(--color-bg-surface)',
  border: '2px dashed var(--color-border)',
  borderRadius: 'var(--radius-lg)',
  cursor: 'pointer',
  textAlign: 'center',
  transition: 'border-color var(--transition-fast)',
}

const thStyle = { padding: '8px var(--space-3)', textAlign: 'left', fontWeight: 600, fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', borderBottom: '1px solid var(--color-border)' }
const tdStyle2 = { padding: '6px var(--space-3)', fontSize: 'var(--font-size-sm)', color: 'var(--color-text-primary)' }
