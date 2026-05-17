import { CFB_MANIFEST } from '../../context/SystemContext'

export function validateRow(row, system = CFB_MANIFEST) {
  const errors   = []
  const warnings = []

  if (!String(row.name ?? '').trim()) errors.push('Name is required')

  const validFactions = new Set(system.factions.map(f => f.name))
  const faction = String(row.faction ?? '').trim()
  if (faction && !validFactions.has(faction)) {
    errors.push(`Unknown faction "${faction}" — must be ${[...validFactions].join(', ')}`)
  }
  if (!faction) warnings.push('No faction set')

  const pts = row.points
  if (pts !== undefined && pts !== '' && isNaN(Number(pts))) {
    errors.push(`Points must be a number, got "${pts}"`)
  }

  for (const statDef of system.statDefinitions) {
    const v = row[`stats.${statDef.id}`] ?? row.stats?.[statDef.id]
    if (v !== undefined && v !== '' && isNaN(Number(v))) {
      warnings.push(`Stat "${statDef.id}" should be a number, got "${v}"`)
    }
  }

  return { errors, warnings, isValid: errors.length === 0 }
}

export function validateRows(rows, system = CFB_MANIFEST) {
  return rows.map((row, i) => ({ rowIndex: i, ...validateRow(row, system) }))
}

/** Convert a mapped flat row to the canonical Firestore unit shape */
export function normaliseRow(row, system = CFB_MANIFEST) {
  function num(v) { const n = Number(v); return isNaN(n) ? 0 : n }
  function list(v) {
    if (Array.isArray(v)) return v
    return String(v ?? '').split(/[;,]/).map(s => s.trim()).filter(Boolean)
  }

  const stats = {}
  for (const statDef of system.statDefinitions) {
    stats[statDef.id] = num(row[`stats.${statDef.id}`] ?? row.stats?.[statDef.id])
  }

  return {
    name:    String(row.name ?? '').trim(),
    faction: String(row.faction ?? '').trim(),
    race:    String(row.race ?? '').trim(),
    types:   row.types ? list(row.types)
           : row.type  ? [String(row.type).trim()]
           : [],
    points:  row.points !== '' && row.points != null ? Number(row.points) : null,
    stats,
    weapons:      Array.isArray(row.weapons)      ? row.weapons      : [],
    keywords:     list(row.keywords     ?? ''),
    specialRules: list(row.specialRules ?? ''),
    flavorText:   String(row.flavorText ?? '').trim(),
    images:       row.images     ?? null,
    attachable:   row.attachable ?? null,
  }
}
