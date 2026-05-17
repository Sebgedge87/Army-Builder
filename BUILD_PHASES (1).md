# Classic Fantasy Battles — Phased Build Plan

A staged, gate-driven plan. **Do not start a phase until the previous one is signed off.**
Each phase has: scope → deliverables → logic/contracts → done criteria.

---

## Phase 0 — Foundation & Tooling (PWA)
*Goal: leave the prototype, enter a real codebase. Ship as an installable PWA from day one.*

**Scope**
- Convert the Babel-in-browser prototype into a real Vite + React 18 project
- Set up repo structure, ESLint/Prettier, Git branching, env files
- Pick & wire backend SDK (Firebase — Auth, Firestore, Storage, Hosting, Functions)
- **PWA setup**: `vite-plugin-pwa` + Workbox, manifest, icons, service worker

**Deliverables**
- `package.json`, `vite.config.js` (with `VitePWA` configured), `.env.example`
- `/src` skeleton: `components/`, `hooks/`, `services/`, `pages/`, `lib/`
- React Router installed with placeholder routes: `/`, `/login`, `/signup`, `/builder`, `/settings`, `/admin`
- Design tokens extracted to `src/theme.css` (colors, spacing, type) from the prototype
- `public/manifest.webmanifest` — name, short_name, theme_color, background_color, display: standalone, icons (192, 512, maskable)
- `public/icons/` — 192, 512, maskable PNGs derived from a single source SVG
- Service worker via Workbox: precache app shell, runtime-cache Firestore/Storage GETs
- Install prompt component (`components/pwa/InstallPrompt.jsx`) with deferred-prompt handling
- Update toast (`components/pwa/UpdateAvailable.jsx`) when a new SW activates
- Firestore offline persistence enabled in `services/firebase.js`

**Logic / contracts**
- `services/firebase.js` — exports `auth`, `db`, `storage`; enables `enableIndexedDbPersistence`
- `services/storage.js` — `uploadImage`, `getImageUrl`, `deleteImage` helpers
- `services/pwa.js` — `registerSW()`, `onUpdateAvailable(cb)`, `promptInstall()`
- `lib/types.ts` (or JSDoc) — `Unit`, `Army`, `User`, `SystemManifest`, `Attachment`

**PWA caching strategy (Workbox)**
- App shell (HTML/JS/CSS): **precache**, stale-while-revalidate
- Firestore reads: handled by Firestore SDK offline persistence (IndexedDB), not Workbox
- Storage images: **cache-first**, 30-day expiry, max 200 entries — **thumb + card sizes only**, never `full`
- Fonts: **cache-first**, 1-year expiry

**PWA implications (must implement)**
- **iOS install flow:** Safari does not fire `beforeinstallprompt`. `InstallPrompt.jsx` must detect iOS user agent and render a custom "Tap Share → Add to Home Screen" hint with an illustration. No programmatic install attempt on iOS.
- **iOS storage cap:** ~50 MB IndexedDB; PWA data can be evicted after 7 days of inactivity. Cache `thumb` (160×160) and `card` (600×400) image variants only; load `full` from network on demand.
- **Standalone display mode:** browser chrome is hidden when installed. The app shell's top bar is the only navigation surface — don't add a redundant address bar.
- **Update toast UX:** "Update available · Reload" button. New SW activates only on user click (skipWaiting on user gesture), so we don't yank state mid-edit.

**Done when**
- `npm run dev` boots a blank app with the routes navigating
- `npm run build && npm run preview` serves a working PWA
- Lighthouse PWA score ≥ 90 (installable, has SW, offline fallback)
- Can install to home screen on iOS Safari, Android Chrome, desktop Chrome/Edge
- Going offline after first load: app shell still loads, last-fetched units still render
- New deploy triggers "Update available" toast within ~minutes

**Done when**
- `npm run dev` boots a blank app with the routes navigating
- CI builds a production bundle without warnings
- Lint passes

---

## Phase 1 — UI Shell & Design System
*Goal: every screen renders, but nothing is wired.*

**Scope**
- Port the three layout variations from the canvas into real components
- Build the **shell**: top bar, sidebar, footer, modal/toast primitives
- Lock the visual system: typography, color, spacing, button/input/card components
- Loading + empty + error states for every screen

**Deliverables**
- `components/shell/AppShell.jsx`
- `components/ui/` — `Button`, `Input`, `Select`, `Card`, `Modal`, `Toast`, `Tag`, `Stat`
- `pages/BuilderPage.jsx` (with chosen layout — recommend Compact as default)
- Style guide page at `/style` showing every primitive

**Logic / contracts**
- All UI components are **stateless / presentational** — no fetching here
- Variant + size props standardized (`variant="primary|secondary|ghost"`, `size="sm|md|lg"`)

**Done when**
- All screens render with mock data
- Style guide passes a manual review
- Mobile (375px) and desktop (1440px) both work

---

## Phase 2 — Authentication
*Goal: real users can sign up, log in, log out.*

**Scope**
- Firebase Auth (Email/Password + Google OAuth)
- Login, Signup, Forgot Password, Email Verification screens (port from `auth-screens.jsx`)
- Protected routes + redirect-after-login
- User profile document on signup

**Deliverables**
- `pages/LoginPage.jsx`, `SignupPage.jsx`, `ForgotPasswordPage.jsx`
- `hooks/useAuth.js` — `{ user, loading, login, signup, logout, resetPassword }`
- `components/RequireAuth.jsx` — route guard
- Firestore `users/{uid}` doc created on first login

**Logic / contracts**
```js
useAuth() => {
  user: { uid, email, displayName, isAdmin } | null,
  loading: boolean,
  login(email, password): Promise<User>,
  signup(email, password, displayName): Promise<User>,
  loginWithGoogle(): Promise<User>,
  logout(): Promise<void>,
  resetPassword(email): Promise<void>
}
```

**Done when**
- Can sign up → redirected to `/builder`
- Refresh keeps you logged in
- Logout clears session
- Protected routes bounce to `/login`
- Errors surface as toasts (wrong password, email taken, etc.)

---

## Phase 3 — Settings
*Goal: users can manage their account.*

**Scope**
- Profile (display name, avatar)
- Account (change email, change password, delete account)
- Preferences (default layout: compact/cards/tactical, dark mode, units imperial/metric)
- Data (export my data, clear local cache)

**Deliverables**
- `pages/SettingsPage.jsx` with tabs: Profile, Account, Preferences, Data
- `hooks/useUserPrefs.js` — reads/writes Firestore + localStorage cache

**Logic / contracts**
- Prefs stored in `users/{uid}.prefs`
- Mirrored in `localStorage` for instant app boot
- Changes sync optimistically, rollback on failure

**Done when**
- Display name change reflects in app shell immediately
- Layout preference persists across reload + devices
- Delete account removes user + all owned armies (Cloud Function)

---

## Phase 4 — Unit Catalogue (Read-Only)
*Goal: app shows the unit library from the database.*

**Scope**
- One-time import script: `data/units-structured.json` → Firestore `units/` collection
- Unit list, filters (faction, race, type, points range), search
- Unit detail modal/drawer with images

**Deliverables**
- `scripts/seed-units.js` — admin-run import
- `hooks/useUnits.js` — `{ units, loading, filter, search }`
- `components/builder/UnitBrowser.jsx`
- `components/builder/UnitCard.jsx` — uses thumbnail size
- `components/builder/UnitDetail.jsx` — uses card/full size + gallery

**Unit data shape (extended)**
```js
units/{unitId} = {
  id, name, faction, race, types, points,
  stats: { movement, melee, ranged, defence, morale, wounds },
  weapons: [...],
  keywords: [...],
  specialRules: [...],
  flavorText,
  images: {
    full:  "https://cdn.../full/orc.webp",
    card:  "https://cdn.../card/orc.webp",
    thumb: "https://cdn.../thumb/orc.webp",
    icon:  "https://cdn.../icon/orc.webp"
  },
  // NEW — attachment metadata (see Attachment Model section below)
  attachable: {
    role: "host" | "attachment" | "both",
    asHost: {                               // present if role host/both
      slots: [
        { id: "hero",    accepts: ["hero"],    max: 1 },
        { id: "banner",  accepts: ["banner"],  max: 1 },
        { id: "musician",accepts: ["musician"],max: 1 }
      ]
    },
    asAttachment: {                         // present if role attachment/both
      attachmentType: "hero",               // matches host slot.accepts
      canAttachTo: {                        // allow-list of legal hosts
        types:    ["infantry", "cavalry"],  // by unit type
        keywords: ["Horse Lords"],          // and/or by keyword
        unitIds:  []                        // and/or specific units (rare)
      },
      grants: [                             // rule-driven buffs (see DSL below)
        { target: "host",   stat: "melee",   op: "+", value: 1 },
        { target: "self",   stat: "defence", op: "+", value: 1 },
        { target: "combined", rule: "Inspiring", op: "add" },
        { target: "host",   stat: "morale",  op: "+", value: 1,
          condition: "host.keywords includes 'Horse Lords'" }
      ]
    }
  }
}
```

### Attachment model — the two-tier approach

Your `attachment_unit_1, attachment_1_rules, …` shape works for *one specific pairing*, but fails when:
- The same hero can attach to 5 different hosts (you'd repeat the rules 5×)
- A buff has a condition ("only vs Evil", "only if host has Horse Lords keyword")
- You want to add a new host later without re-editing the hero row

**Cleaner split:**

1. **Allow-list** lives on the *attachment* (the hero/banner/champion) → "I can attach to anything matching these types/keywords"
2. **Slot definition** lives on the *host* → "I have 1 hero slot, 1 banner slot"
3. **Grants** (the buffs) live on the *attachment* as a small structured list, expressed in CSV as a mini-DSL.

This way each unit row owns its own behavior — no cross-row coupling, no duplication.

### Grants DSL (what goes in the CSV cell)

One cell, semicolon-separated. Each grant: `target.stat OP value [WHEN condition]` or `target.rule:Name`.

```
host.melee+1; self.defence+1; combined.rule:Inspiring
host.morale+1 WHEN host.keywords includes "Horse Lords"
host.ranged+1; host.ranged-cap:2     # +1 to ranged, capped at +2 total
```

- **Targets:** `host` (the unit being joined), `self` (the attachment itself), `combined` (the joined unit acts as one)
- **Ops:** `+`, `-`, `set`, `min`, `max`, `rule:Name` (grants a named rule), `keyword:Name`
- **Conditions:** simple expressions referenced by the buff engine — `host.types includes X`, `host.keywords includes X`, `combat=melee`, `enemy.faction=Evil`
- The parser is strict but errors are surfaced row-by-row in the import wizard's validation step

### CSV columns for attachments

Instead of `attachment_unit_1, attachment_1_rules, attachment_unit_2, …` (which couples a hero row to specific host names), use **role-based columns** that describe each row's own behavior:

```csv
name,role,attachment_type,host_slot_capacity,attach_to_types,attach_to_keywords,grants
Horse Lord Riders,host,,hero:1;banner:1,,,
Horse Lord Hero,attachment,hero,,cavalry;infantry,Horse Lords,"host.melee+1; combined.rule:Inspiring"
Horse Lord Banner,attachment,banner,,infantry,Horse Lords,"host.morale+1; host.ranged+1 WHEN combat=ranged"
Horse Lord Champion,both,hero,hero:1,cavalry,Horse Lords,"host.melee+1; self.defence+1"
```

Column meanings:
- `role` — `host` | `attachment` | `both`
- `attachment_type` — what slot this fills (`hero`, `banner`, `musician`, custom)
- `host_slot_capacity` — semicolon list of `slotType:max` (e.g. `hero:1;banner:1`)
- `attach_to_types` — semicolon list of unit types this can join
- `attach_to_keywords` — semicolon list of required host keywords (AND with types)
- `grants` — the DSL above

### Why this is better than your proposal

| Concern | `attachment_unit_N, attachment_N_rules` | Role-based + DSL |
|---|---|---|
| Add a new host later | Edit every hero row | No change needed |
| One hero, many hosts | Repeat rules N times | One row |
| Conditional buffs | Awkward inline | First-class `WHEN` |
| Validation | Hard (which IDs exist?) | Trivial (types/keywords are enums) |
| Round-trip with editable table | Cell explosion | Stable column count |

### Round-trip with the editable table

In Phase 7b the editable table:
- Renders `grants` as a chip list (`host melee +1`, `combined Inspiring`) with an "edit" popover, not a raw string
- Renders `host_slot_capacity` as `hero ×1` `banner ×1` pills
- On save, serializes back to the DSL so export → re-import is lossless

**Logic / contracts**
- Units are **public read** (no auth needed)
- Cached in memory for the session — single fetch
- Filters are pure-functional client-side
- Image URLs come from Firebase Storage via the catalogue document; placeholder fallback if missing

**Done when**
- All units from the JSON appear, correctly statted
- Filters and search work without lag (debounced)
- Unit detail shows weapons, keywords, special rules, image gallery
- Missing images render a faction-tinted placeholder, not a broken icon

---

## Phase 5 — Army Builder Core (CRUD + Logic + Attachments)
*Goal: the actual product works, including hero/character attachments.*

**Scope**
- Create / rename / delete armies
- Add / remove / duplicate units
- **Attach / detach** characters to host units (drag onto a host, or "Attach to…" menu)
- Live point total + 6,000pt validation
- Live **effective stats** showing buffs from attachments (e.g. `Melee 4 → 3 ⬆`)
- Faction enforcement (Good vs Evil + Mercenaries-allowed-to-all)
- Attachment legality enforcement (canAttachTo / canReceive / maxAttachments)
- Save to Firestore, list user's armies on a dashboard

**Deliverables**
- `pages/ArmiesPage.jsx` — list of user's armies
- `pages/BuilderPage.jsx` — single army editor
- `hooks/useArmy.js` — `{ army, addUnit, removeUnit, attachUnit, detachUnit, updateUnit, save }`
- `lib/validation.js` — pure validation
- `lib/buffs.js` — pure buff resolution: `applyBuffs(host, attachments) => effectiveStats`

**Storage shape (with attachments)**
```js
armies/{armyId} = {
  userId, name, systemId: "cfb",
  faction,
  units: [
    {
      instanceId: "u1",
      unitId: "horse_lord_riders",
      count: 3,
      attachments: ["a1"]              // refs to instanceIds below
    },
    {
      instanceId: "a1",
      unitId: "horse_lord_hero",
      count: 1,
      attachedTo: "u1"                 // back-pointer
    }
  ],
  totalPoints,
  isPublic: false, shareToken: null,
  createdAt, updatedAt
}
```

**Logic / contracts**
```js
// lib/validation.js
validateArmy(army, system) => {
  errors, warnings, totalPoints, isValid
}

// Attachment rules
- attachment.unitId.attachable.role must be "attachment" or "both"
- host.unitId.attachable.canReceive must include attachment's role/type
- attachment.unitId.attachable.canAttachTo must include host's type
- host.unitId.attachable.maxAttachments not exceeded
- An attachment cannot itself receive attachments (no nesting in v1)
- An attachment counts its own points toward total

// lib/buffs.js
applyBuffs(host, attachments) => {
  effectiveStats: {...},          // host.stats merged with grants
  effectiveRules: [...],          // union of rule grants
  buffSources: [{stat, delta, fromUnitId}]  // for UI tooltips
}
```

**UI for attachments**
- Hero/champion units show an **"Attach"** action when at least one legal host exists in the army
- Host units show a slot indicator: `Attachments: 0/1`
- Attached unit renders nested under host with a connector line + "→ +1 Melee" buff chips
- Detach button on the attachment

**Done when**
- Can build a 6,000pt army from scratch including hero attachments
- Effective stats update live when attaching/detaching
- Illegal attachments rejected with a clear reason ("Heroes cannot attach to Cavalry")
- Reload restores attachments correctly
- Over-limit shows red warning, blocks save

---

## Phase 6 — Sharing & Export
*Goal: armies leave the app.*

**Scope**
- Public share link (`isPublic: true` + `shareToken`)
- Read-only public army view
- PDF export (client-side, `jspdf` or `react-pdf`)
- Plain text export (for forums)
- JSON export/import

**Deliverables**
- `pages/PublicArmyPage.jsx` — `/army/:shareToken`
- `lib/export/pdf.js`, `txt.js`, `json.js`
- Share modal with copy-link, social preview meta tags

**Done when**
- Anonymous user can open a share link and see the army (read-only)
- PDF prints cleanly, one page if possible, includes all stats + weapons
- JSON round-trips: export → import produces the same army

---

## Phase 7 — Admin Panel (Import Wizard + Editable Table + Image Storage)
*Goal: non-devs maintain the unit catalogue end-to-end.*

**Scope**
- Admin-only route `/admin` (gated by `users/{uid}.isAdmin == true`)
- **Online-only** — `/admin` checks `navigator.onLine` on mount and on every action. If offline, render an "Admin requires an internet connection" screen. Reason: bulk imports + image uploads partially failing offline cause silent data loss.
- **Import Wizard** (CSV or JSON) — multi-step flow
- **Editable Units Table** — primary workspace; spreadsheet-style edits with inline validation
- **Image Storage** — drag/drop image folder, auto-match to units, auto-resize
- Single-unit form (for one-offs)
- Audit log (who changed what, when)

### 7a — Import Wizard (CSV / JSON)

```
Step 1: Choose source
  ◯ Upload CSV   ◯ Upload JSON   ◯ Paste JSON

Step 2: Field mapping
  - Auto-detect columns vs system stat definitions
  - Manual override dropdowns for unmatched columns
  - Preview first 5 rows live

Step 3: Validation report
  - ✓ 45 rows valid
  - ⚠ 3 warnings (e.g. missing flavor text)
  - ✗ 2 errors (unknown faction, points not numeric)
  - User can fix in the next step OR cancel

Step 4: Editable preview table  ← **default view after every import**
  - Spreadsheet-like grid; every cell editable
  - Errors highlighted red, warnings amber
  - Bulk-edit: select rows → set faction, set keyword, multiply points
  - Add/remove rows
  - Re-validate on every change
  - "Cannot save while errors exist"

Step 5: Image attachment (if CSV referenced filenames)
  - Drag image folder
  - Auto-match by filename → unit
  - Show missing/extra images
  - Auto-generate full / card / thumb / icon sizes via Cloud Function

Step 6: Confirm & write
  - Choose: Insert new only / Upsert (merge by id) / Replace all
  - Show diff: 12 new, 33 updated, 0 deleted
  - Commit to Firestore in a batch
```

### 7b — Editable Units Table (the daily admin workspace)

A persistent spreadsheet view of every unit in a system.
- Columns: name, faction, race, type, points, all stats, weapons summary, image thumb, last edited
- Inline edit any cell — saves on blur, optimistic with rollback
- Row actions: duplicate, delete, view full form, upload image
- Bulk actions on selection: change faction, add keyword, adjust points by %, delete
- Filter + sort + search across all columns
- "Export current view as CSV/JSON" — round-trips with the import wizard

### 7c — Image Storage

- Firebase Storage bucket: `systems/{systemId}/units/{size}/{unitId}.webp`
- Upload via admin UI or wizard step 5
- Cloud Function on upload: generates `full` (1200×800), `card` (600×400), `thumb` (160×160), `icon` (64×64) WebP variants
- Writes URLs back into the unit's `images` map
- Public read via Firebase Storage rules; CDN-cached
- Delete unit → Cloud Function purges all 4 image variants

**Deliverables**
- `pages/admin/UnitsTablePage.jsx` — the editable table (default landing for /admin)
- `pages/admin/ImportWizardPage.jsx` — 6-step flow
- `pages/admin/UnitFormPage.jsx` — full single-unit form (for new entries / edge cases)
- `lib/import/parseCSV.js`, `parseJSON.js`, `mapFields.js`, `validateRows.js`
- `lib/import/diff.js` — compute insert/update/delete sets
- `services/storage.js` — already from Phase 0; extended with batch upload + match-by-filename
- Cloud Function `onImageUpload` — resize + WebP convert
- Firestore rule: only admins can write `units/`; only admins can write to `systems/{id}/units/` storage prefix

**Done when**
- Admin can import a 100-row CSV: see validation report, fix 3 errors in the editable table, attach 100 images by drag/drop, commit
- Editable table saves cell edits within <1s with no jank on 500 rows
- Images appear in the user-facing builder without a manual step
- Non-admin gets 403 on `/admin`
- All admin actions land in an audit log readable on `/admin/audit`

---

## Phase 8 — System-Agnostic Refactor (Optional / Later)
*Goal: support 40K, AoS, custom systems per `SYSTEM_AGNOSTIC_DESIGN.md`.*

Only attempt after Phase 7 is rock-solid for CFB. Risk: premature abstraction.

---

## Sign-off gate template

Before moving from Phase N to N+1, confirm:
- [ ] All "Done when" boxes ticked
- [ ] Manual QA on mobile + desktop
- [ ] No console errors / warnings
- [ ] Deployed to staging
- [ ] User (you) has clicked through every flow
- [ ] Notes added to a `CHANGELOG.md`

---

## Recommended order of attack right now

1. **Phase 0** this week — get off Babel-in-browser
2. **Phase 1** next — port the *Compact* layout only (pick one, ship it)
3. **Phase 2** — auth, smallest possible
4. Skip ahead to **Phase 4 + 5** before Phase 3 if you want a working demo faster — Settings can wait

Settings/profile features are usually overbuilt early. Build the core loop (auth → browse units → build army → save) before polish.
