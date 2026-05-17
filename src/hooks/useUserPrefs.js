import { useState, useEffect } from 'react'
import { doc, updateDoc, getDoc } from 'firebase/firestore'
import { db } from '../services/firebase'
import { useAuth } from './useAuth'

const PREFS_KEY     = 'cfb_prefs'
const DEFAULT_PREFS = { layout: 'compact', unitSystem: 'metric' }

export function useUserPrefs() {
  const { user } = useAuth()

  const [prefs, setPrefs] = useState(() => {
    try {
      const stored = localStorage.getItem(PREFS_KEY)
      return stored ? { ...DEFAULT_PREFS, ...JSON.parse(stored) } : DEFAULT_PREFS
    } catch {
      return DEFAULT_PREFS
    }
  })

  // Sync from Firestore when user logs in (server prefs win over local cache)
  useEffect(() => {
    if (!user) return
    getDoc(doc(db, 'users', user.uid))
      .then(snap => {
        if (snap.exists() && snap.data().prefs) {
          const merged = { ...DEFAULT_PREFS, ...snap.data().prefs }
          setPrefs(merged)
          localStorage.setItem(PREFS_KEY, JSON.stringify(merged))
        }
      })
      .catch(() => {})
  }, [user])

  async function updatePrefs(updates) {
    const prev = prefs
    const next = { ...prefs, ...updates }

    // Optimistic update
    setPrefs(next)
    localStorage.setItem(PREFS_KEY, JSON.stringify(next))

    if (user) {
      try {
        await updateDoc(doc(db, 'users', user.uid), { prefs: next })
      } catch {
        // Rollback
        setPrefs(prev)
        localStorage.setItem(PREFS_KEY, JSON.stringify(prev))
        throw new Error('Failed to save preferences. Please try again.')
      }
    }
  }

  function clearCache() {
    localStorage.removeItem(PREFS_KEY)
    setPrefs(DEFAULT_PREFS)
  }

  return { prefs, updatePrefs, clearCache }
}
