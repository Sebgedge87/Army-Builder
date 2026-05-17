import { createContext, useContext, useState, useEffect } from 'react'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '../services/firebase'

export const CFB_MANIFEST = {
  systemId: 'cfb',
  name: 'Classic Fantasy Battles',
  shortName: 'CFB',
  description: '10mm fantasy wargaming',
  branding: {
    accentColor:      '#8b2635',
    accentHoverColor: '#a02d40',
    appName:          'CFB Builder',
  },
  rules: {
    pointLimit:            6000,
    allowMultipleFactions: false,
  },
  factions: [
    { id: 'Good',       name: 'Good'       },
    { id: 'Evil',       name: 'Evil'       },
    { id: 'Mercenary',  name: 'Mercenary', availableToAll: true },
  ],
  statDefinitions: [
    { id: 'movement', name: 'Movement', shortName: 'MOV', label: 'Movement (MOV)' },
    { id: 'melee',    name: 'Melee',    shortName: 'MEL', label: 'Melee (MEL)'    },
    { id: 'ranged',   name: 'Ranged',   shortName: 'RNG', label: 'Ranged (RNG)'   },
    { id: 'defence',  name: 'Defence',  shortName: 'DEF', label: 'Defence (DEF)'  },
    { id: 'morale',   name: 'Morale',   shortName: 'MOR', label: 'Morale (MOR)'   },
    { id: 'wounds',   name: 'Wounds',   shortName: 'WND', label: 'Wounds (WND)'   },
  ],
}

const SystemContext = createContext(CFB_MANIFEST)

export function useSystem() {
  return useContext(SystemContext)
}

function applyBranding(b = {}) {
  const root = document.documentElement
  if (b.accentColor)      root.style.setProperty('--color-accent',       b.accentColor)
  if (b.accentHoverColor) root.style.setProperty('--color-accent-hover', b.accentHoverColor)
}

export function SystemProvider({ systemId = 'cfb', children }) {
  const [system, setSystem] = useState(CFB_MANIFEST)

  useEffect(() => {
    getDoc(doc(db, 'systems', systemId))
      .then(snap => {
        if (!snap.exists()) {
          applyBranding(CFB_MANIFEST.branding)
          return
        }
        const manifest = { systemId, ...snap.data() }
        applyBranding(manifest.branding)
        if (manifest.branding?.appName) document.title = manifest.branding.appName
        setSystem(manifest)
      })
      .catch(() => applyBranding(CFB_MANIFEST.branding))
  }, [systemId])

  return (
    <SystemContext.Provider value={system}>
      {children}
    </SystemContext.Provider>
  )
}
