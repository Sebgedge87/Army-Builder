import { useState, useEffect } from 'react'
import { collection, getDocs } from 'firebase/firestore'
import { db } from '../services/firebase'
import fallbackUnits from '../../data/all-units.json'

// In-memory session cache — single fetch per page load
let sessionCache = null

export function useUnits() {
  const [units, setUnits]     = useState(sessionCache ?? [])
  const [loading, setLoading] = useState(sessionCache === null)
  const [error, setError]     = useState(null)

  useEffect(() => {
    if (sessionCache !== null) return

    getDocs(collection(db, 'units'))
      .then(snap => {
        const docs = snap.docs.map(d => ({ id: d.id, ...d.data() }))
        // If Firestore is empty, fall back to local JSON
        sessionCache = docs.length > 0 ? docs : normalise(fallbackUnits)
        setUnits(sessionCache)
      })
      .catch(() => {
        // Firestore unavailable — use local JSON so the UI still works
        sessionCache = normalise(fallbackUnits)
        setUnits(sessionCache)
        setError('Firebase not connected — showing local unit data.')
      })
      .finally(() => setLoading(false))
  }, [])

  return { units, loading, error }
}

/** Map legacy flat JSON shape → canonical Firestore shape */
function normalise(raw) {
  return raw.map(u => ({
    ...u,
    types: u.types ?? (u.type ? [u.type] : []),
    stats: {
      movement: u.stats?.movement ?? 0,
      melee:    u.stats?.melee    ?? 0,
      ranged:   u.stats?.ranged   ?? 0,
      defence:  u.stats?.defence  ?? 0,
      morale:   u.stats?.morale   ?? 0,
      wounds:   u.stats?.wounds   ?? 0,
    },
    specialRules: u.specialRules ?? [],
    flavorText:   u.flavorText   ?? '',
    images:       u.images       ?? null,
    attachable:   u.attachable   ?? null,
  }))
}
