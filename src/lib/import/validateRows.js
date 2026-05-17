const VALID_FACTIONS = new Set(['Good', 'Evil', 'Mercenary'])

export function validateRow(row) {
  const errors   = []
  const warnings = []

  if (!String(row.name ?? '').trim()) errors.push('Name is required')

  const faction = String(row.faction ?? '').trim()
  if (faction && !VALID_FACTIONS.has(faction)) {
    errors.push(`Unknown faction "${faction}" — must be Good, Evil or Mercenary`)
  }
  if (!faction) warnings.push('No faction set')

  const pts = row.points
  if (pts !== undefined && pts !== '' && isNaN(Number(pts))) {
    errors.push(`Points must be a number, got "${pts}"`)
  }

  const statKeys = ['movement', 'melee', 'ranged', 'defence', 'morale', 'wounds']
  for (const k of statKeys) {
    const v = row[`stats.${k}`] ?? row.stats?.[k]
    if (v !== undefined && v !== '' && isNaN(Number(v))) {
      warnings.push(`Stat "${k}" should be a number, got "${v}"`)
    }
  }

  return { errors, warnings, isValid: errors.length === 0 }
}

export function validateRows(rows) {
  return rows.map((row, i) => ({ rowIndex: i, ...validateRow(row) }))
}

/** Convert a mapped flat row to the canonical Firestore unit shape */
export function normaliseRow(row) {
  function num(v) { const n = Number(v); return isNaN(n) ? 0 : n }
  function list(v) {
    if (Array.isArray(v)) return v
    return String(v ?? '').split(/[;,]/).map(s => s.trim()).filter(Boolean)
  }

  return {
    name:    String(row.name ?? '').trim(),
    faction: String(row.faction ?? '').trim(),
    race:    String(row.race ?? '').trim(),
    types:   row.types ? list(row.types)
           : row.type  ? [String(row.type).trim()]
           : [],
    points:  row.points !== '' && row.points != null ? Number(row.points) : null,
    stats: {
      movement: num(row['stats.movement'] ?? row.stats?.movement),
      melee:    num(row['stats.melee']    ?? row.stats?.melee),
      ranged:   num(row['stats.ranged']   ?? row.stats?.ranged),
      defence:  num(row['stats.defence']  ?? row.stats?.defence),
      morale:   num(row['stats.morale']   ?? row.stats?.morale),
      wounds:   num(row['stats.wounds']   ?? row.stats?.wounds),
    },
    weapons:      Array.isArray(row.weapons)      ? row.weapons      : [],
    keywords:     list(row.keywords     ?? ''),
    specialRules: list(row.specialRules ?? ''),
    flavorText:   String(row.flavorText ?? '').trim(),
    images:       row.images     ?? null,
    attachable:   row.attachable ?? null,
  }
}
