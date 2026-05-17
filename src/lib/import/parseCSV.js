export function parseCSV(text) {
  const lines = splitLines(text)
  if (!lines.length) return { headers: [], rows: [] }

  const headers = parseLine(lines[0])
  const rows = []

  for (let i = 1; i < lines.length; i++) {
    if (!lines[i].trim()) continue
    const values = parseLine(lines[i])
    const row = {}
    headers.forEach((h, j) => { row[h] = values[j] ?? '' })
    rows.push(row)
  }

  return { headers, rows }
}

function splitLines(text) {
  return text.split(/\r?\n/)
}

function parseLine(line) {
  const result = []
  let current = ''
  let inQuotes = false

  for (let i = 0; i < line.length; i++) {
    const ch = line[i]
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') { current += '"'; i++ }
      else inQuotes = !inQuotes
    } else if (ch === ',' && !inQuotes) {
      result.push(current.trim())
      current = ''
    } else {
      current += ch
    }
  }
  result.push(current.trim())
  return result
}

/** Auto-detect which CSV column maps to which unit field */
export function autoDetectMapping(headers) {
  const patterns = {
    name:            /^name$/i,
    faction:         /^faction$/i,
    race:            /^race$/i,
    type:            /^types?$/i,
    points:          /^points?$/i,
    'stats.movement':  /^mov(ement)?$/i,
    'stats.melee':     /^mel(ee)?$/i,
    'stats.ranged':    /^ran(ged)?$/i,
    'stats.defence':   /^def(ence|ense)?$/i,
    'stats.morale':    /^mor(ale)?$/i,
    'stats.wounds':    /^wnd|wounds?$/i,
    keywords:        /^keywords?$/i,
    specialRules:    /^special.?rules?$/i,
    flavorText:      /^flavor.?text|fluff$/i,
  }
  const map = {}
  for (const h of headers) {
    let matched = 'ignore'
    for (const [field, re] of Object.entries(patterns)) {
      if (re.test(h)) { matched = field; break }
    }
    map[h] = matched
  }
  return map
}

/** Apply a field map to raw CSV rows → normalised unit-shaped objects */
export function applyMapping(rows, fieldMap) {
  return rows.map(row => {
    const u = {
      name: '', faction: '', race: '', type: '', points: '',
      'stats.movement': '', 'stats.melee': '', 'stats.ranged': '',
      'stats.defence': '', 'stats.morale': '', 'stats.wounds': '',
      keywords: '', specialRules: '', flavorText: '',
    }
    for (const [csvKey, unitKey] of Object.entries(fieldMap)) {
      if (unitKey !== 'ignore' && row[csvKey] !== undefined) {
        u[unitKey] = row[csvKey]
      }
    }
    return u
  })
}
