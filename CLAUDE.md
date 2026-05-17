# CLAUDE.md — Classic Fantasy Battles Builder

Persistent context for every chat in this project. Read this first.

---

## What this project is

A web-based **army builder** for 10mm tabletop wargaming. Primary game system is **Classic Fantasy Battles (CFB)** with a 6,000 point limit across Good / Evil / Mercenary factions and several races (Horse Lords, Dwarves, Elves, Orcs, Boneblades, Mercenaries).

The architecture is intentionally **system-agnostic** — CFB is the first system, but the platform must support additional systems (40K-style, AoS-style, custom) via configuration files. See `SYSTEM_AGNOSTIC_DESIGN.md`.

---

## Current state (as of last update)

**Prototype only.** Not production-ready. What exists:
- High-fidelity React mockups (3 builder layouts: compact, cards, tactical) running via in-browser Babel
- Login + signup screen mockups (UI only, no real auth)
- Unit data JSON files (`units-structured.json`, `unit-data-orcs.json`, `data/all-units.json`)
- Architecture + tech docs (`TECH_STACK.md`, `SYSTEM_AGNOSTIC_DESIGN.md`)
- Phased build plan (`BUILD_PHASES.md`) — **the source of truth for what to build next**

What does NOT exist yet:
- Vite / build tooling
- Real auth, database, persistence
- Routing, state management, settings, admin panel, export, image storage

---

## How to work in this project

1. **Always read `BUILD_PHASES.md` first.** It defines the 9 gated phases. Do not jump ahead — each phase has explicit "Done when" criteria that must be ticked before moving on.
2. **Preserve the prototype** in `Army Builder.html` + sibling JSX files. It is the visual reference, not the production code. The real app will live in `/src` once Phase 0 begins.
3. **Read `TECH_STACK.md`** for the chosen stack: Vite + React 18 + React Router + Firebase (Auth, Firestore, Storage, Cloud Functions, Hosting).
4. **Read `SYSTEM_AGNOSTIC_DESIGN.md`** before touching anything related to stat definitions, units, factions, or the admin panel — those must stay config-driven.

---

## Key decisions already locked

### Stack
- **Frontend:** React 18 + Vite + React Router + (Tailwind OR styled-components — TBD)
- **Backend:** Firebase (Firestore + Auth + Storage + Cloud Functions + Hosting)
- **Build target:** SPA on Firebase Hosting
- **No** Babel-in-browser in production

### Build order (from `BUILD_PHASES.md`)
1. Phase 0 — Foundation & Tooling
2. Phase 1 — UI Shell & Design System
3. Phase 2 — Authentication
4. Phase 3 — Settings (can be deferred)
5. Phase 4 — Unit Catalogue (read-only)
6. Phase 5 — Army Builder Core + **Attachments**
7. Phase 6 — Sharing & Export
8. Phase 7 — Admin Panel (Import Wizard + Editable Table + Image Storage)
9. Phase 8 — System-agnostic refactor (only after Phase 7 is rock solid)

**Recommended path to first working demo:** 0 → 1 → 2 → 4 → 5, then circle back for 3 → 6 → 7.

### Layout
Three builder layouts exist in the prototype. **Compact** is the default; Cards and Tactical are user-selectable via Settings.

---

## Unit attachments (important — the design is non-obvious)

Some units can attach to others (e.g. a Hero joins a regiment of Horse Lord Riders). Rules:

- **No nesting** — an attachment cannot itself receive an attachment.
- **Attached units count their own points** toward the 6,000pt total.
- **Buff scope** (`host` / `self` / `combined`) is defined per buff in the unit data, sourced from the game system's rules.
- **Multiple attachments** per host are supported when the host has multiple slots (hero, banner, musician, etc.).

### Two-tier data model — DO NOT change this without consulting BUILD_PHASES.md

1. **Allow-list** lives on the *attachment* — "I can attach to anything matching these types/keywords". Never list specific host names; couple by type/keyword only.
2. **Slots** live on the *host* — "I have 1 hero slot, 1 banner slot".
3. **Grants** live on the *attachment* as a small structured DSL.

### CSV columns for attachments
```csv
name,role,attachment_type,host_slot_capacity,attach_to_types,attach_to_keywords,grants
```
- `role`: `host` | `attachment` | `both`
- `host_slot_capacity`: `hero:1;banner:1`
- `attach_to_types`: `cavalry;infantry`
- `attach_to_keywords`: `Horse Lords`
- `grants`: DSL, semicolon-separated

### Grants DSL
```
host.melee+1; self.defence+1; combined.rule:Inspiring
host.morale+1 WHEN host.keywords includes "Horse Lords"
```
- **Targets:** `host`, `self`, `combined`
- **Ops:** `+ - set min max rule:Name keyword:Name`
- **Conditions:** first-class `WHEN` clauses

Buff resolution lives in `lib/buffs.js` (Phase 5). It is **pure** — input army + system, output effective stats. No side effects.

---

## Admin panel — non-negotiables

Per Phase 7 of `BUILD_PHASES.md`:

1. **Editable units table** is the *primary* admin workspace, not the single-unit form. Spreadsheet-style; inline cell edits save on blur.
2. **Import Wizard** (CSV + JSON) lands on the editable table at step 4, so admins can fix errors before commit.
3. **Image storage** is first-class: Firebase Storage bucket per system, Cloud Function auto-generates 4 sizes (full / card / thumb / icon) as WebP on upload.
4. **Grants** render as chips with an edit popover in the table — never raw DSL text unless the admin explicitly drops into "raw" mode.
5. Export current view as CSV/JSON must **round-trip losslessly** with the import wizard.

---

## Validation rules

All in `lib/validation.js` (Phase 5) — pure functions, no side effects:

- `totalPoints <= system.rules.pointLimit` (default 6,000 for CFB)
- All units share a faction (Mercenaries excepted via `availableToAll`)
- Min 1 unit
- Attachment legality: `canAttachTo` types match host type, host has free slot capacity, no nesting

---

## File / folder conventions

```
Classic Fantasy Battles Builder/
├── CLAUDE.md                       ← this file
├── BUILD_PHASES.md                 ← source of truth for what to build
├── TECH_STACK.md
├── SYSTEM_AGNOSTIC_DESIGN.md
├── prototype/                      ← (post-cleanup) all current .jsx + .html mockups
├── data/                           ← seed JSON for units
└── src/                            ← real app, created in Phase 0
    ├── components/
    ├── hooks/
    ├── pages/
    ├── services/                   ← firebase.js, storage.js, units.js
    └── lib/                        ← validation.js, buffs.js, import/
```

Style objects in React components must be **uniquely named** per component (`compactStyles`, not `styles`) — name collisions break the prototype.

---

## When in doubt

- Ask before adding scope or new sections.
- Don't refactor across phases — finish the current phase first.
- Don't introduce new dependencies without flagging them.
- Don't touch the system-agnostic abstraction until Phase 8.
- Keep CFB-specific data in `data/` and `systems/cfb/` — never hardcode in components.

---

*Last updated: 17 May 2026*
