export function validateArmy(entries, system = {}) {
  const pointLimit = system.rules?.pointLimit ?? system.pointLimit ?? 6000
  const universalFactions = new Set(
    (system.factions ?? []).filter(f => f.availableToAll).map(f => f.name)
  )
  if (universalFactions.size === 0) universalFactions.add('Mercenary')

  const errors = []
  const warnings = []
  const totalPoints = entries.reduce((sum, e) => sum + (e.unit?.points || 0), 0)
  const topLevel = entries.filter(e => !e.attachedTo)

  if (topLevel.length === 0) {
    warnings.push('Army has no units')
  }

  if (totalPoints > pointLimit) {
    errors.push(`${totalPoints}pts exceeds the ${pointLimit}pt limit`)
  }

  const factions = [...new Set(
    topLevel.map(e => e.unit?.faction).filter(f => f && !universalFactions.has(f))
  )]
  if (factions.length > 1) {
    errors.push(`Mixed factions: ${factions.join(', ')}`)
  }

  for (const e of entries.filter(e => e.attachedTo)) {
    const host = entries.find(h => h.instanceId === e.attachedTo)
    if (!host) {
      errors.push(`${e.unit?.name}: attached host no longer in army`)
      continue
    }
    const check = checkAttachmentLegality(e, host, entries)
    if (!check.ok) errors.push(check.reason)
  }

  return { errors, warnings, totalPoints, isValid: errors.length === 0 }
}

export function checkAttachmentLegality(attachEntry, hostEntry, allEntries) {
  const attach = attachEntry.unit
  const host = hostEntry.unit

  if (!attach?.attachable || !['attachment', 'both'].includes(attach.attachable.role)) {
    return { ok: false, reason: `${attach?.name} is not an attachment unit` }
  }
  if (!host?.attachable || !['host', 'both'].includes(host.attachable.role)) {
    return { ok: false, reason: `${host?.name} cannot receive attachments` }
  }
  if ((attachEntry.attachments ?? []).length > 0) {
    return { ok: false, reason: `${attach.name} has its own attachments — nesting not allowed` }
  }

  const asAttach = attach.attachable.asAttachment
  const canAttachTo = asAttach?.canAttachTo ?? {}
  const hostTypes = host.types ?? (host.type ? [host.type] : [])
  const hostKeywords = host.keywords ?? []

  if (canAttachTo.types?.length) {
    if (!canAttachTo.types.some(t => hostTypes.includes(t))) {
      return { ok: false, reason: `${attach.name} cannot attach to ${host.name} (wrong unit type)` }
    }
  }
  if (canAttachTo.keywords?.length) {
    if (!canAttachTo.keywords.every(k => hostKeywords.includes(k))) {
      return { ok: false, reason: `${attach.name} cannot attach to ${host.name} (missing keywords)` }
    }
  }

  const slots = host.attachable.asHost?.slots ?? []
  const attachType = asAttach?.attachmentType
  const slot = slots.find(s => s.accepts?.includes(attachType))
  if (!slot) {
    return { ok: false, reason: `${host.name} has no ${attachType ?? 'attachment'} slot` }
  }

  const usedCount = (hostEntry.attachments ?? []).filter(id => {
    if (id === attachEntry.instanceId) return false
    const a = allEntries.find(e => e.instanceId === id)
    return a?.unit?.attachable?.asAttachment?.attachmentType === attachType
  }).length
  if (usedCount >= slot.max) {
    return { ok: false, reason: `${host.name}'s ${attachType} slot is full` }
  }

  return { ok: true }
}

export function getLegalHosts(attachEntry, allEntries) {
  return allEntries.filter(e => {
    if (e.instanceId === attachEntry.instanceId) return false
    if (e.attachedTo) return false
    return checkAttachmentLegality(attachEntry, e, allEntries).ok
  })
}
