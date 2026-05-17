/**
 * Seed Firestore with unit data from data/all-units.json
 *
 * Usage:
 *   node scripts/seed-units.js
 *
 * Requires:
 *   - firebase-admin installed (npm install -D firebase-admin)
 *   - scripts/service-account.json (download from Firebase Console → Project Settings → Service Accounts)
 *   - FIREBASE_PROJECT_ID env var OR the projectId encoded in service-account.json
 */

import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import admin from 'firebase-admin'

const __dirname = dirname(fileURLToPath(import.meta.url))

const serviceAccount = JSON.parse(
  readFileSync(join(__dirname, 'service-account.json'), 'utf8')
)

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
})

const db = admin.firestore()

const raw = JSON.parse(
  readFileSync(join(__dirname, '..', 'data', 'all-units.json'), 'utf8')
)

function normalise(u) {
  return {
    name:         u.name,
    faction:      u.faction,
    race:         u.race  ?? null,
    types:        u.types ?? (u.type ? [u.type] : []),
    points:       u.points ?? null,
    stats: {
      movement: u.stats?.movement ?? 0,
      melee:    u.stats?.melee    ?? 0,
      ranged:   u.stats?.ranged   ?? 0,
      defence:  u.stats?.defence  ?? 0,
      morale:   u.stats?.morale   ?? 0,
      wounds:   u.stats?.wounds   ?? 0,
    },
    weapons:      u.weapons      ?? [],
    specialRules: u.specialRules ?? [],
    keywords:     u.keywords     ?? [],
    flavorText:   u.flavorText   ?? '',
    images:       u.images       ?? null,
    attachable:   u.attachable   ?? null,
  }
}

async function seed() {
  const col = db.collection('units')
  const batch = db.batch()

  for (const unit of raw) {
    const id  = unit.id ?? unit.name.toLowerCase().replace(/\s+/g, '-')
    const ref = col.doc(id)
    batch.set(ref, normalise(unit), { merge: true })
  }

  await batch.commit()
  console.log(`Seeded ${raw.length} units into Firestore.`)
}

seed().catch(err => { console.error(err); process.exit(1) })
