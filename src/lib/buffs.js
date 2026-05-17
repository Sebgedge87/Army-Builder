export function applyBuffs(hostEntry, attachmentEntries) {
  const effectiveStats = { ...(hostEntry.unit?.stats ?? {}) }
  const effectiveRules = [...(hostEntry.unit?.specialRules ?? [])]
  const effectiveKeywords = [...(hostEntry.unit?.keywords ?? [])]
  const buffSources = []

  for (const a of attachmentEntries) {
    const grants = a.unit?.attachable?.asAttachment?.grants ?? []
    for (const grant of grants) {
      if (grant.condition && !evalCondition(grant.condition, hostEntry)) continue

      if (grant.target === 'host' || grant.target === 'combined') {
        if (grant.stat && grant.op === '+') {
          effectiveStats[grant.stat] = (effectiveStats[grant.stat] ?? 0) + grant.value
          buffSources.push({ stat: grant.stat, delta: grant.value, fromUnit: a.unit.name })
        } else if (grant.stat && grant.op === '-') {
          effectiveStats[grant.stat] = (effectiveStats[grant.stat] ?? 0) - grant.value
          buffSources.push({ stat: grant.stat, delta: -grant.value, fromUnit: a.unit.name })
        } else if (grant.rule && grant.op === 'add' && !effectiveRules.includes(grant.rule)) {
          effectiveRules.push(grant.rule)
          buffSources.push({ rule: grant.rule, fromUnit: a.unit.name })
        } else if (grant.keyword && grant.op === 'add' && !effectiveKeywords.includes(grant.keyword)) {
          effectiveKeywords.push(grant.keyword)
        }
      }
    }
  }

  return { effectiveStats, effectiveRules, effectiveKeywords, buffSources }
}

function evalCondition(condition, hostEntry) {
  const host = hostEntry.unit
  const kwMatch = condition.match(/host\.keywords includes ['"](.+)['"]/)
  if (kwMatch) return (host?.keywords ?? []).includes(kwMatch[1])
  const typeMatch = condition.match(/host\.types includes ['"](.+)['"]/)
  if (typeMatch) {
    const types = host?.types ?? (host?.type ? [host.type] : [])
    return types.includes(typeMatch[1])
  }
  return true
}
