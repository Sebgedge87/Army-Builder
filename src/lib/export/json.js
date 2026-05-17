export function exportToJSON(name, faction, entries) {
  return {
    version: 1,
    name,
    faction,
    systemId: 'cfb',
    units: entries.map(({ instanceId, unitId, count, attachments, attachedTo }) => ({
      instanceId,
      unitId,
      count:       count ?? 1,
      attachments: attachments ?? [],
      attachedTo:  attachedTo ?? null,
    })),
    exportedAt: new Date().toISOString(),
  }
}

export function downloadJSON(name, faction, entries) {
  const data = exportToJSON(name, faction, entries)
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url  = URL.createObjectURL(blob)
  const a    = document.createElement('a')
  a.href     = url
  a.download = `${name.replace(/\s+/g, '_')}.json`
  a.click()
  URL.revokeObjectURL(url)
}

export function importFromJSON(jsonString, allUnits) {
  let parsed
  try {
    parsed = JSON.parse(jsonString)
  } catch {
    throw new Error('Invalid JSON file')
  }

  if (!Array.isArray(parsed.units)) throw new Error('Missing units array in JSON')
  if (!parsed.name || !parsed.faction)  throw new Error('Missing name or faction in JSON')

  const entries = parsed.units.map(u => {
    const unit = allUnits.find(x => x.id === u.unitId)
    if (!unit) throw new Error(`Unknown unit ID: ${u.unitId}`)
    return { ...u, unit }
  })

  return { name: parsed.name, faction: parsed.faction, entries }
}
