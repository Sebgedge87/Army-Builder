import { useState, useEffect, useCallback, useMemo } from 'react'
import { doc, getDoc, setDoc, addDoc, updateDoc, collection } from 'firebase/firestore'
import { db } from '../services/firebase'
import { useAuth } from './useAuth'
import { validateArmy, checkAttachmentLegality } from '../lib/validation'
import { applyBuffs } from '../lib/buffs'

const CFB_SYSTEM = { pointLimit: 6000, systemId: 'cfb' }

export function useArmy(armyId, allUnits) {
  const { user } = useAuth()

  const [name, setName]           = useState('New Army')
  const [faction, setFaction]     = useState('Evil')
  const [entries, setEntries]     = useState([])
  const [isPublic, setIsPublic]   = useState(false)
  const [shareToken, setShareToken] = useState(null)
  const [loading, setLoading]     = useState(!!armyId)
  const [saving, setSaving]       = useState(false)
  const [savedId, setSavedId]     = useState(armyId ?? null)

  useEffect(() => {
    if (!armyId || !allUnits.length) return
    setLoading(true)
    getDoc(doc(db, 'armies', armyId))
      .then(snap => {
        if (!snap.exists()) return
        const data = snap.data()
        setName(data.name ?? 'Untitled Army')
        setFaction(data.faction ?? 'Evil')
        setIsPublic(data.isPublic ?? false)
        setShareToken(data.shareToken ?? null)
        const hydrated = (data.units ?? [])
          .map(e => ({ ...e, unit: allUnits.find(u => u.id === e.unitId) ?? null }))
          .filter(e => e.unit)
        setEntries(hydrated)
      })
      .finally(() => setLoading(false))
  }, [armyId, allUnits])

  const addUnit = useCallback((unit) => {
    setEntries(prev => [...prev, {
      instanceId:  crypto.randomUUID(),
      unitId:      unit.id,
      unit,
      count:       1,
      attachments: [],
      attachedTo:  null,
    }])
  }, [])

  const removeUnit = useCallback((instanceId) => {
    setEntries(prev => {
      const entry = prev.find(e => e.instanceId === instanceId)
      if (!entry) return prev
      const toRemove = new Set([instanceId, ...(entry.attachments ?? [])])
      return prev
        .filter(e => !toRemove.has(e.instanceId))
        .map(e => ({
          ...e,
          attachments: (e.attachments ?? []).filter(id => !toRemove.has(id)),
          attachedTo:  toRemove.has(e.attachedTo) ? null : e.attachedTo,
        }))
    })
  }, [])

  const attachUnit = useCallback((attachmentId, hostId) => {
    setEntries(prev => {
      const attachment = prev.find(e => e.instanceId === attachmentId)
      const host       = prev.find(e => e.instanceId === hostId)
      if (!attachment || !host) return prev
      if (!checkAttachmentLegality(attachment, host, prev).ok) return prev
      return prev.map(e => {
        if (e.instanceId === attachmentId) return { ...e, attachedTo: hostId }
        if (e.instanceId === hostId)       return { ...e, attachments: [...(e.attachments ?? []), attachmentId] }
        return e
      })
    })
  }, [])

  const detachUnit = useCallback((attachmentId) => {
    setEntries(prev => {
      const attachment = prev.find(e => e.instanceId === attachmentId)
      if (!attachment?.attachedTo) return prev
      const hostId = attachment.attachedTo
      return prev.map(e => {
        if (e.instanceId === attachmentId) return { ...e, attachedTo: null }
        if (e.instanceId === hostId)       return { ...e, attachments: (e.attachments ?? []).filter(id => id !== attachmentId) }
        return e
      })
    })
  }, [])

  const importArmy = useCallback(({ name: n, faction: f, entries: e }) => {
    setName(n)
    setFaction(f)
    setEntries(e)
    setSavedId(null)
    setIsPublic(false)
    setShareToken(null)
  }, [])

  const save = useCallback(async () => {
    if (!user) return
    setSaving(true)
    const { totalPoints } = validateArmy(entries, CFB_SYSTEM)
    const payload = {
      userId:     user.uid,
      name,
      systemId:   CFB_SYSTEM.systemId,
      faction,
      units: entries.map(({ instanceId, unitId, count, attachments, attachedTo }) => ({
        instanceId,
        unitId,
        count:       count ?? 1,
        attachments: attachments ?? [],
        attachedTo:  attachedTo ?? null,
      })),
      totalPoints,
      isPublic,
      shareToken,
      updatedAt: new Date().toISOString(),
    }
    try {
      if (savedId) {
        await setDoc(doc(db, 'armies', savedId), payload, { merge: true })
      } else {
        payload.createdAt = new Date().toISOString()
        const ref = await addDoc(collection(db, 'armies'), payload)
        setSavedId(ref.id)
      }
    } finally {
      setSaving(false)
    }
  }, [user, name, faction, entries, isPublic, shareToken, savedId])

  const togglePublic = useCallback(async () => {
    if (!savedId) return
    const newPublic = !isPublic
    const newToken  = newPublic ? (shareToken ?? crypto.randomUUID().replace(/-/g, '').slice(0, 16)) : shareToken
    setIsPublic(newPublic)
    if (newPublic) setShareToken(newToken)
    await updateDoc(doc(db, 'armies', savedId), {
      isPublic:   newPublic,
      shareToken: newPublic ? newToken : null,
    })
  }, [savedId, isPublic, shareToken])

  const effectiveEntries = useMemo(() =>
    entries.map(entry => {
      const attachmentEntries = (entry.attachments ?? [])
        .map(id => entries.find(e => e.instanceId === id))
        .filter(Boolean)
      return { ...entry, ...applyBuffs(entry, attachmentEntries) }
    }),
    [entries]
  )

  const validation = useMemo(() => validateArmy(entries, CFB_SYSTEM), [entries])

  return {
    name, setName,
    faction, setFaction,
    entries: effectiveEntries,
    isPublic, shareToken,
    loading, saving,
    armyId: savedId,
    addUnit, removeUnit, attachUnit, detachUnit,
    importArmy, save, togglePublic,
    validation,
    totalPoints: validation.totalPoints,
  }
}
