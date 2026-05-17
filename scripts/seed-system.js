/**
 * Seeds the active game system manifest from systems/{SYSTEM_ID}/system.json
 * into Firestore systems/{SYSTEM_ID}.
 *
 * Usage:
 *   node scripts/seed-system.js
 *
 * Requires:
 *   - VITE_SYSTEM_ID in .env (defaults to 'cfb')
 *   - scripts/service-account.json (Firebase Admin service account key)
 *     Download from: Firebase Console → Project Settings → Service accounts
 */

import { readFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
import { initializeApp, cert } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = resolve(__dirname, '..')

// Load .env manually (no dotenv dependency needed)
let systemId = 'cfb'
try {
  const env = readFileSync(resolve(root, '.env'), 'utf-8')
  const match = env.match(/^VITE_SYSTEM_ID=(.+)$/m)
  if (match) systemId = match[1].trim()
} catch {
  // .env not found — use default
}

console.log(`\nSeeding system: ${systemId}`)

// Load system manifest
const manifestPath = resolve(root, 'systems', systemId, 'system.json')
let manifest
try {
  manifest = JSON.parse(readFileSync(manifestPath, 'utf-8'))
} catch (e) {
  console.error(`\nCould not read ${manifestPath}`)
  console.error('Create systems/${systemId}/system.json first.\n')
  process.exit(1)
}

// Init Firebase Admin
const serviceAccountPath = resolve(__dirname, 'service-account.json')
let serviceAccount
try {
  serviceAccount = JSON.parse(readFileSync(serviceAccountPath, 'utf-8'))
} catch {
  console.error('\nCould not read scripts/service-account.json')
  console.error('Download it from: Firebase Console → Project Settings → Service accounts\n')
  process.exit(1)
}

initializeApp({ credential: cert(serviceAccount) })
const db = getFirestore()

// Write to Firestore
await db.collection('systems').doc(systemId).set({
  ...manifest,
  systemId,
  updatedAt: new Date().toISOString(),
}, { merge: true })

console.log(`✓ systems/${systemId} written to Firestore`)
console.log(`  Name:        ${manifest.name}`)
console.log(`  Point limit: ${manifest.rules?.pointLimit ?? '?'}`)
console.log(`  Factions:    ${manifest.factions?.map(f => f.name).join(', ')}`)
console.log(`  Stats:       ${manifest.statDefinitions?.map(s => s.shortName).join(', ')}\n`)
