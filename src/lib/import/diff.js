/**
 * Compute what will happen when importing rows into the existing unit collection.
 * @param {object[]} importedRows  - normalised unit objects being imported
 * @param {object[]} existingUnits - current units from Firestore
 * @param {'insert'|'upsert'|'replace'} mode
 */
export function computeDiff(importedRows, existingUnits, mode = 'upsert') {
  const byId   = new Map(existingUnits.map(u => [u.id,               u]))
  const byName = new Map(existingUnits.map(u => [u.name?.toLowerCase(), u]))

  const toInsert  = []
  const toUpdate  = []

  for (const row of importedRows) {
    const existing = (row.id ? byId.get(row.id) : null)
                  ?? byName.get(row.name?.toLowerCase())

    if (!existing || mode === 'insert') {
      toInsert.push(row)
    } else {
      toUpdate.push({ existing, updated: { ...existing, ...row } })
    }
  }

  const importedNames = new Set(importedRows.map(r => r.name?.toLowerCase()))
  const toDelete = mode === 'replace'
    ? existingUnits.filter(u => !importedNames.has(u.name?.toLowerCase()))
    : []

  return { toInsert, toUpdate, toDelete }
}
