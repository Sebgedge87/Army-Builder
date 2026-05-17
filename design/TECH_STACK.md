# Classic Fantasy Battles - Army Builder
## Technical Design Document

---

## Project Overview

A web-based army builder for 10mm tabletop wargaming, allowing players to create and manage armies with a 6,000 point limit across multiple factions (Good/Evil) and races (Horse Lords, Dwarves, Elves, Orcs, Boneblades, Mercenaries).

---

## Current Prototype Tech Stack

### Frontend
- **HTML5** - Semantic markup
- **CSS3** - Custom styling, CSS Grid, Flexbox
- **React 18.3.1** - UI components and state management
- **Babel Standalone 7.29.0** - In-browser JSX compilation (no build step)
- **Vanilla JavaScript** - Core logic

### Data Storage (Prototype)
- **Static JSON** (`data/all-units.json`) - Unit catalogue
- **localStorage** - Client-side army list persistence (future)

### Current Limitations
- ❌ No backend server
- ❌ No database
- ❌ No real authentication (UI mockups only)
- ❌ Manual JSON editing required for new units
- ❌ No multi-device sync
- ❌ No sharing/collaboration features

---

## Production Architecture Options

### Option 1: Firebase (Recommended for MVP)

#### Tech Stack
```
Frontend:
  - React 18+ (Vite build for production)
  - React Router (multi-page navigation)
  - React Hook Form (forms)
  - Tailwind CSS or styled-components

Backend:
  - Firebase Firestore (NoSQL database)
  - Firebase Authentication (Google OAuth + Email/Password)
  - Firebase Hosting (CDN deployment)
  - Firebase Cloud Functions (serverless API)
  - Firebase Storage (PDF exports, images)

Admin:
  - Custom React admin panel
  - Firebase Admin SDK
```

#### Database Schema (Firestore)
```javascript
// Collection: units
{
  id: "orc_light_infantry",
  name: "Orc Light Infantry",
  faction: "Evil",
  race: "Orcs",
  type: "Infantry",
  points: 73,
  baseSize: "40mm x 20mm",
  stats: {
    movement: 7,
    melee: 4,
    ranged: 10,
    defence: 6,
    morale: 6,
    wounds: 2
  },
  weapons: [
    {
      name: "Orcish Swords",
      range: "Melee",
      attacks: 4,
      damage: 1,
      armourPiercing: "-"
    }
  ],
  keywords: ["Evil", "Orcs", "Infantry"],
  createdAt: timestamp,
  updatedAt: timestamp
}

// Collection: users
{
  uid: "firebase_auth_uid",
  email: "user@example.com",
  displayName: "Player Name",
  createdAt: timestamp,
  isAdmin: false
}

// Collection: armies
{
  id: "auto_generated_id",
  userId: "firebase_auth_uid",
  name: "My Orc Horde",
  faction: "Evil",
  units: [
    { unitId: "orc_light_infantry", instanceId: "unique_instance" },
    // ... more units
  ],
  totalPoints: 1200,
  createdAt: timestamp,
  updatedAt: timestamp,
  isPublic: false,
  shareToken: "random_token" // for sharing
}
```

#### Admin Panel Features
- Login with admin credentials
- Visual form for adding/editing units
- Bulk import from Excel/CSV
- Unit preview before publishing
- Version history

#### Cost Estimate (Firebase)
- **Free tier**: 50k reads/day, 20k writes/day
- **Blaze plan**: $0.06/100k reads, $0.18/100k writes
- **Estimated monthly**: $10-50 for moderate usage

---

### Option 2: Supabase

#### Tech Stack
```
Frontend: Same as Firebase option

Backend:
  - Supabase (PostgreSQL database)
  - Supabase Auth
  - Supabase Storage
  - PostgREST API (auto-generated)
  - Row Level Security (RLS)
```

#### Database Schema (PostgreSQL)
```sql
-- Units table
CREATE TABLE units (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  faction TEXT NOT NULL,
  race TEXT NOT NULL,
  type TEXT NOT NULL,
  points INTEGER NOT NULL,
  base_size TEXT,
  stats JSONB NOT NULL,
  weapons JSONB NOT NULL,
  keywords TEXT[] NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Users table (managed by Supabase Auth)
-- Additional profile table
CREATE TABLE user_profiles (
  id UUID REFERENCES auth.users PRIMARY KEY,
  display_name TEXT,
  is_admin BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Armies table
CREATE TABLE armies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users NOT NULL,
  name TEXT NOT NULL,
  faction TEXT NOT NULL,
  units JSONB NOT NULL,
  total_points INTEGER NOT NULL,
  is_public BOOLEAN DEFAULT FALSE,
  share_token TEXT UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_units_faction ON units(faction);
CREATE INDEX idx_armies_user ON armies(user_id);
CREATE INDEX idx_armies_share ON armies(share_token);
```

#### Admin Workflow
1. Admin logs into admin panel
2. Uses form to add unit data
3. Data validates client-side
4. POST to Supabase API
5. Row-level security ensures only admins can write

#### Cost Estimate
- **Free tier**: 500MB database, 1GB file storage, 50k monthly active users
- **Pro plan**: $25/month (8GB database, 100GB storage)

---

### Option 3: Google Sheets + Backend Sync

#### Tech Stack
```
Frontend: React (same)

Backend:
  - Node.js + Express OR Cloudflare Workers
  - Google Sheets API
  - Scheduled sync (cron job every 5 min)

Data Flow:
  Admin edits Google Sheet
    ↓
  Sync job reads sheet via API
    ↓
  Converts to JSON
    ↓
  Writes to static hosting (Cloudflare Pages/Netlify)
    ↓
  Frontend fetches JSON
```

#### Google Sheet Structure
```
Column A: Unit ID
Column B: Unit Name
Column C: Faction
Column D: Race
Column E: Type
Column F: Points
Column G: Movement
Column H: Melee
... (one column per field)
```

#### Pros
- Admins use familiar spreadsheet interface
- No custom admin panel needed
- Very cheap ($0-5/month)

#### Cons
- Not real-time (5-min delay)
- Limited to ~10k units (Sheet row limit)
- No complex validation

---

### Option 4: Headless CMS (Strapi/Directus)

#### Tech Stack
```
Frontend: React

Backend:
  - Strapi 4+ OR Directus
  - PostgreSQL/MySQL
  - Node.js server
  - REST/GraphQL API (auto-generated)

Hosting:
  - Frontend: Vercel/Netlify
  - Backend: Railway/Render/DigitalOcean
```

#### Content Types (Strapi)
```javascript
// Unit content type
{
  name: { type: "string", required: true },
  faction: { type: "enumeration", enum: ["Good", "Evil", "Mercenary"] },
  race: { type: "string" },
  type: { type: "string" },
  points: { type: "integer", required: true },
  stats: { type: "json" },
  weapons: { type: "component", repeatable: true },
  keywords: { type: "json" }
}
```

#### Admin Panel
- **Out of the box** - Strapi/Directus provide complete admin UI
- Drag-and-drop content type builder
- Media library for unit images
- User roles/permissions built-in

#### Cost Estimate
- **Strapi Cloud**: $99/month
- **Self-hosted**: $10-20/month (DigitalOcean/Railway)

---

## Recommended Stack for Launch

### Phase 1: MVP (0-3 months)
**Firebase** - Get to market fastest

```
Frontend: React + Vite
Backend: Firebase (Firestore + Auth + Hosting)
Admin: Simple React admin panel
Features:
  ✓ User authentication
  ✓ Create/save/edit armies
  ✓ Admin unit management
  ✓ PDF export (client-side)
  ✓ Share army links
```

### Phase 2: Growth (3-12 months)
Add advanced features on Firebase

```
New Features:
  ✓ Army templates/presets
  ✓ Community sharing
  ✓ Unit comments/ratings
  ✓ Battle calculator
  ✓ Mobile app (React Native + Firebase)
```

### Phase 3: Scale (12+ months)
If Firebase costs grow, migrate to:

```
Supabase + PostgreSQL
  - Better pricing at scale
  - More complex queries
  - Full SQL control
```

---

## Admin Panel Design

### Non-Dev Admin Interface

#### Add Unit Form
```
┌─────────────────────────────────────┐
│ Add New Unit                        │
├─────────────────────────────────────┤
│                                     │
│ Unit Name: [________________]       │
│                                     │
│ Faction:   [⚪ Good  ⚫ Evil]       │
│                                     │
│ Race:      [Dropdown: Orcs ▼]      │
│                                     │
│ Type:      [☐ Infantry ☐ Cavalry]  │
│                                     │
│ Points:    [____]                   │
│                                     │
│ Base Size: [40mm x 20mm]            │
│                                     │
│ ─── Stats ───                       │
│ Movement:  [_] Melee:    [_]        │
│ Ranged:    [_] Defence:  [_]        │
│ Morale:    [_] Wounds:   [_]        │
│                                     │
│ ─── Weapons ───                     │
│ ┌──────────────────────────────┐    │
│ │ Name:   [Orcish Sword]       │    │
│ │ Range:  [Melee]              │    │
│ │ Attacks:[4]  Damage: [1]     │    │
│ │ AP:     [-]                  │    │
│ │                      [Remove]│    │
│ └──────────────────────────────┘    │
│ [+ Add Another Weapon]              │
│                                     │
│ Keywords: [Evil], [Orcs], [Infantry]│
│           [+ Add Keyword]           │
│                                     │
│ [Cancel]  [Save Draft]  [Publish]   │
└─────────────────────────────────────┘
```

#### Bulk Import (CSV/Excel)
1. Download template spreadsheet
2. Fill in unit data
3. Upload file
4. Review parsed data
5. Confirm & publish

---

## File Structure (Production)

```
classic-fantasy-battles/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── auth/
│   │   │   │   ├── LoginScreen.jsx
│   │   │   │   └── SignupScreen.jsx
│   │   │   ├── builder/
│   │   │   │   ├── UnitBrowser.jsx
│   │   │   │   ├── ArmyList.jsx
│   │   │   │   ├── UnitCard.jsx
│   │   │   │   └── PointTracker.jsx
│   │   │   ├── admin/
│   │   │   │   ├── UnitForm.jsx
│   │   │   │   ├── UnitList.jsx
│   │   │   │   └── BulkImport.jsx
│   │   │   └── shared/
│   │   │       ├── Header.jsx
│   │   │       └── Footer.jsx
│   │   ├── hooks/
│   │   │   ├── useAuth.js
│   │   │   ├── useUnits.js
│   │   │   └── useArmy.js
│   │   ├── services/
│   │   │   ├── firebase.js
│   │   │   ├── units.js
│   │   │   └── armies.js
│   │   ├── utils/
│   │   │   ├── validation.js
│   │   │   └── pdf-export.js
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── public/
│   └── package.json
│
├── firebase/
│   ├── functions/
│   │   ├── src/
│   │   │   ├── index.js
│   │   │   └── units.js
│   │   └── package.json
│   ├── firestore.rules
│   ├── storage.rules
│   └── firebase.json
│
└── docs/
    ├── TECH_STACK.md (this file)
    ├── API.md
    └── DEPLOYMENT.md
```

---

## Security Considerations

### Firestore Security Rules
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Units: read by all, write by admins only
    match /units/{unitId} {
      allow read: if true;
      allow write: if request.auth != null && 
                     get(/databases/$(database)/documents/users/$(request.auth.uid)).data.isAdmin == true;
    }
    
    // Armies: users can only access their own
    match /armies/{armyId} {
      allow read: if request.auth != null && 
                    (resource.data.userId == request.auth.uid || 
                     resource.data.isPublic == true);
      allow create: if request.auth != null && 
                      request.resource.data.userId == request.auth.uid;
      allow update, delete: if request.auth != null && 
                              resource.data.userId == request.auth.uid;
    }
    
    // Users: users can only read/write their own profile
    match /users/{userId} {
      allow read: if request.auth != null && request.auth.uid == userId;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

---

## Deployment Pipeline

### Development
```bash
npm run dev          # Local dev server (Vite)
firebase emulators:start  # Local Firebase emulation
```

### Staging
```bash
npm run build        # Production build
firebase deploy --only hosting:staging
```

### Production
```bash
npm run build
npm run test         # Run tests
firebase deploy      # Deploy everything
```

---

## Future Enhancements

### Short-term
- [ ] Drag-and-drop unit reordering
- [ ] Army validation warnings (over-limit, faction errors)
- [ ] PDF export with multiple format options
- [ ] Unit images/icons
- [ ] Mobile-optimized layouts

### Medium-term
- [ ] Army templates/presets
- [ ] Share army via link
- [ ] Print-friendly view
- [ ] Unit comparison tool
- [ ] Battle calculator

### Long-term
- [ ] Mobile app (React Native)
- [ ] Multiplayer army matchups
- [ ] Tournament mode
- [ ] Community army sharing
- [ ] AI army suggestions
- [ ] 3D unit previews

---

## Cost Analysis

### Firebase (Estimated Monthly Costs)

**Scenario: 1,000 active users**

| Service | Usage | Cost |
|---------|-------|------|
| Firestore Reads | 500k/month | $0.30 |
| Firestore Writes | 100k/month | $1.08 |
| Auth | 1,000 users | Free |
| Hosting | 10GB/month | $0.15 |
| Storage | 5GB | $0.10 |
| **Total** | | **~$2/month** |

**Scenario: 10,000 active users**

| Service | Usage | Cost |
|---------|-------|------|
| Firestore Reads | 5M/month | $3.00 |
| Firestore Writes | 1M/month | $10.80 |
| Auth | 10,000 users | Free |
| Hosting | 50GB/month | $0.75 |
| Storage | 25GB | $0.50 |
| **Total** | | **~$15/month** |

---

## Conclusion

**Recommended path**: Start with **Firebase** for rapid MVP launch, with an admin panel for non-technical users to manage the unit catalogue through a simple web form. This provides the fastest time-to-market while keeping infrastructure costs low and enabling future scaling.

Migration to Supabase/self-hosted can be considered if monthly costs exceed $100 or custom SQL queries become necessary.

---

*Last updated: [Current Date]*
*Version: 1.0*
