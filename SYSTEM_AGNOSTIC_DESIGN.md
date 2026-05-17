# Multi-System Army Builder
## System-Agnostic Architecture Design

---

## Overview

Transform the Classic Fantasy Battles builder into a **system-agnostic platform** that can load any tabletop wargaming system with custom rules, units, stats, colors, and branding.

---

## Core Concept

Instead of hardcoding "Classic Fantasy Battles" rules, create a **game system loader** that reads configuration files to define:

- Stat structures (Movement, Melee, Defence, etc.)
- Unit types and categories
- Point limits and validation rules
- Factions and races
- Color schemes and branding
- Custom rules and keywords
- UI layouts and terminology

---

## System Configuration Schema

### Game System Manifest (`systems/cfb/system.json`)

```json
{
  "systemId": "classic-fantasy-battles",
  "name": "Classic Fantasy Battles",
  "version": "1.0.0",
  "author": "Your Company",
  "description": "10mm fantasy wargaming",
  
  "branding": {
    "primaryColor": "#1a1a1a",
    "secondaryColor": "#8b2635",
    "accentColor": "#f5f5f0",
    "logo": "assets/cfb-logo.svg",
    "favicon": "assets/favicon.ico",
    "fonts": {
      "primary": "system-ui",
      "headings": "system-ui"
    }
  },
  
  "rules": {
    "pointLimit": 6000,
    "allowMultipleFactions": false,
    "armyBuilding": {
      "minUnits": 1,
      "maxUnits": null,
      "requiresCommander": false
    }
  },
  
  "factions": [
    {
      "id": "good",
      "name": "Good",
      "color": "#4a9eff",
      "icon": "⚔️"
    },
    {
      "id": "evil",
      "name": "Evil",
      "color": "#8b2635",
      "icon": "🗡️"
    },
    {
      "id": "mercenary",
      "name": "Mercenary",
      "color": "#999",
      "icon": "💰",
      "availableToAll": true
    }
  ],
  
  "races": [
    { "id": "orcs", "name": "Orcs", "faction": "evil" },
    { "id": "boneblades", "name": "Boneblades", "faction": "evil" },
    { "id": "dwarves", "name": "Dwarves", "faction": "good" },
    { "id": "elves", "name": "Elves", "faction": "good" },
    { "id": "horse_lords", "name": "Horse Lords", "faction": "good" }
  ],
  
  "unitTypes": [
    { "id": "infantry", "name": "Infantry", "icon": "👥" },
    { "id": "cavalry", "name": "Cavalry", "icon": "🐎" },
    { "id": "ranged", "name": "Ranged", "icon": "🏹" },
    { "id": "artillery", "name": "Artillery", "icon": "⚙️" },
    { "id": "monster", "name": "Monster", "icon": "🐉" },
    { "id": "hero", "name": "Hero", "icon": "⭐" }
  ],
  
  "statDefinitions": [
    {
      "id": "movement",
      "name": "Movement",
      "shortName": "M",
      "type": "number",
      "unit": "\"",
      "description": "Distance the unit can move in inches"
    },
    {
      "id": "melee",
      "name": "Melee Ability",
      "shortName": "Me",
      "type": "number",
      "suffix": "+",
      "description": "Target number for melee attacks"
    },
    {
      "id": "ranged",
      "name": "Ranged Ability",
      "shortName": "Ra",
      "type": "number",
      "suffix": "+",
      "description": "Target number for ranged attacks"
    },
    {
      "id": "defence",
      "name": "Defence",
      "shortName": "D",
      "type": "number",
      "suffix": "+",
      "description": "Target number to wound this unit"
    },
    {
      "id": "morale",
      "name": "Morale",
      "shortName": "Mo",
      "type": "number",
      "suffix": "+",
      "description": "Bravery and leadership"
    },
    {
      "id": "wounds",
      "name": "Wounds",
      "shortName": "W",
      "type": "number",
      "description": "How many hits the unit can take"
    }
  ],
  
  "weaponAttributes": [
    { "id": "range", "name": "Range", "type": "text" },
    { "id": "attacks", "name": "Attacks", "type": "number" },
    { "id": "damage", "name": "Damage", "type": "number" },
    { "id": "armourPiercing", "name": "Armour Piercing", "type": "text" }
  ],
  
  "customFields": [
    {
      "id": "baseSize",
      "name": "Base Size",
      "type": "text",
      "showInCard": true
    }
  ],
  
  "validation": [
    {
      "rule": "maxPoints",
      "value": 6000,
      "message": "Army exceeds {value} point limit",
      "severity": "error"
    },
    {
      "rule": "minUnits",
      "value": 1,
      "message": "Army must have at least {value} unit",
      "severity": "error"
    }
  ],
  
  "export": {
    "formats": ["pdf", "txt", "json"],
    "pdfTemplate": "templates/army-list.hbs",
    "includeStats": true,
    "includeWeapons": true,
    "includeSpecialRules": true
  },
  
  "ui": {
    "terminology": {
      "army": "Army",
      "unit": "Unit",
      "points": "Points",
      "faction": "Faction"
    },
    "layouts": ["compact", "cards", "tactical"],
    "defaultLayout": "compact"
  }
}
```

---

## Unit Data Structure (System-Specific)

### CFB Unit Example (`systems/cfb/units/orc_warriors.json`)

```json
{
  "id": "orc_warriors",
  "name": "Orc Warriors",
  "faction": "evil",
  "race": "orcs",
  "types": ["infantry"],
  "points": 73,
  
  "stats": {
    "movement": 7,
    "melee": 4,
    "ranged": 10,
    "defence": 6,
    "morale": 6,
    "wounds": 2
  },
  
  "weapons": [
    {
      "name": "Orcish Swords",
      "range": "Melee",
      "attacks": 4,
      "damage": 1,
      "armourPiercing": "-"
    }
  ],
  
  "customFields": {
    "baseSize": "40mm x 20mm"
  },
  
  "keywords": ["Evil", "Orcs", "Infantry"],
  "specialRules": ["Brutal Charge"],
  "flavorText": "Savage warriors clad in crude armor",
  
  "assets": {
    "icon": "assets/units/orc_warriors.png",
    "image": "assets/units/orc_warriors_full.jpg"
  }
}
```

---

## Alternative System Examples

### Warhammer 40K-style System

```json
{
  "systemId": "grimdark-40k",
  "name": "Grimdark 40K",
  "branding": {
    "primaryColor": "#000000",
    "secondaryColor": "#c41e3a",
    "accentColor": "#ffd700"
  },
  "rules": {
    "pointLimit": 2000,
    "allowMultipleFactions": false,
    "armyBuilding": {
      "requiresHQ": true,
      "maxHQ": 3,
      "minTroops": 2
    }
  },
  "statDefinitions": [
    { "id": "movement", "name": "Move", "shortName": "M", "type": "text" },
    { "id": "weaponSkill", "name": "Weapon Skill", "shortName": "WS", "type": "text", "suffix": "+" },
    { "id": "ballisticSkill", "name": "Ballistic Skill", "shortName": "BS", "type": "text", "suffix": "+" },
    { "id": "strength", "name": "Strength", "shortName": "S", "type": "number" },
    { "id": "toughness", "name": "Toughness", "shortName": "T", "type": "number" },
    { "id": "wounds", "name": "Wounds", "shortName": "W", "type": "number" },
    { "id": "attacks", "name": "Attacks", "shortName": "A", "type": "text" },
    { "id": "leadership", "name": "Leadership", "shortName": "Ld", "type": "number" },
    { "id": "save", "name": "Save", "shortName": "Sv", "type": "text", "suffix": "+" }
  ],
  "unitTypes": [
    { "id": "hq", "name": "HQ", "icon": "⭐" },
    { "id": "troops", "name": "Troops", "icon": "👥" },
    { "id": "elites", "name": "Elites", "icon": "🎖️" },
    { "id": "fast_attack", "name": "Fast Attack", "icon": "🏃" },
    { "id": "heavy_support", "name": "Heavy Support", "icon": "🔨" }
  ]
}
```

### Age of Sigmar-style System

```json
{
  "systemId": "aos-fantasy",
  "name": "Age of Sigmar",
  "branding": {
    "primaryColor": "#1a2332",
    "secondaryColor": "#d4af37",
    "accentColor": "#ffffff"
  },
  "rules": {
    "pointLimit": 2000,
    "reinforcementPoints": 500
  },
  "statDefinitions": [
    { "id": "move", "shortName": "Move", "type": "text" },
    { "id": "save", "shortName": "Save", "type": "text", "suffix": "+" },
    { "id": "bravery", "shortName": "Bravery", "type": "number" },
    { "id": "wounds", "shortName": "Wounds", "type": "number" }
  ],
  "weaponAttributes": [
    { "id": "range", "name": "Range", "type": "text" },
    { "id": "attacks", "name": "Attacks", "type": "text" },
    { "id": "toHit", "name": "To Hit", "type": "text", "suffix": "+" },
    { "id": "toWound", "name": "To Wound", "type": "text", "suffix": "+" },
    { "id": "rend", "name": "Rend", "type": "text" },
    { "id": "damage", "name": "Damage", "type": "text" }
  ]
}
```

### Star Wars Legion-style System

```json
{
  "systemId": "legion",
  "name": "Legion Battles",
  "branding": {
    "primaryColor": "#000000",
    "secondaryColor": "#ffe81f",
    "accentColor": "#ffffff"
  },
  "rules": {
    "pointLimit": 800,
    "activationCount": true
  },
  "statDefinitions": [
    { "id": "courage", "shortName": "Courage", "type": "number" },
    { "id": "defense", "shortName": "Defense", "type": "text" },
    { "id": "wounds", "shortName": "Wounds", "type": "number" },
    { "id": "speed", "shortName": "Speed", "type": "number" }
  ],
  "unitTypes": [
    { "id": "commander", "name": "Commander" },
    { "id": "operative", "name": "Operative" },
    { "id": "corps", "name": "Corps" },
    { "id": "special_forces", "name": "Special Forces" },
    { "id": "support", "name": "Support" },
    { "id": "heavy", "name": "Heavy" }
  ]
}
```

---

## System Loader Architecture

### Frontend Code Structure

```javascript
// System loader service
class SystemLoader {
  async loadSystem(systemId) {
    const manifest = await fetch(`systems/${systemId}/system.json`).then(r => r.json());
    const units = await fetch(`systems/${systemId}/units/all-units.json`).then(r => r.json());
    
    return {
      manifest,
      units,
      isLoaded: true
    };
  }
  
  applyBranding(manifest) {
    document.documentElement.style.setProperty('--primary-color', manifest.branding.primaryColor);
    document.documentElement.style.setProperty('--secondary-color', manifest.branding.secondaryColor);
    document.documentElement.style.setProperty('--accent-color', manifest.branding.accentColor);
    document.title = manifest.name;
  }
}

// React context for current system
const SystemContext = React.createContext();

function SystemProvider({ systemId, children }) {
  const [system, setSystem] = useState(null);
  
  useEffect(() => {
    const loader = new SystemLoader();
    loader.loadSystem(systemId).then(sys => {
      loader.applyBranding(sys.manifest);
      setSystem(sys);
    });
  }, [systemId]);
  
  if (!system) return <LoadingScreen />;
  
  return (
    <SystemContext.Provider value={system}>
      {children}
    </SystemContext.Provider>
  );
}

// Dynamic stat rendering
function UnitStatsDisplay({ unit }) {
  const { manifest } = useContext(SystemContext);
  
  return (
    <div className="stats-grid">
      {manifest.statDefinitions.map(statDef => (
        <Stat
          key={statDef.id}
          label={statDef.shortName}
          value={unit.stats[statDef.id]}
          suffix={statDef.suffix}
          unit={statDef.unit}
        />
      ))}
    </div>
  );
}
```

---

## File Structure (Multi-System)

```
army-builder-universal/
├── systems/
│   ├── classic-fantasy-battles/
│   │   ├── system.json
│   │   ├── units/
│   │   │   ├── all-units.json
│   │   │   ├── orc_warriors.json
│   │   │   └── ...
│   │   ├── assets/
│   │   │   ├── logo.svg
│   │   │   ├── units/
│   │   │   └── icons/
│   │   └── templates/
│   │       └── army-list.hbs
│   │
│   ├── grimdark-40k/
│   │   ├── system.json
│   │   ├── units/
│   │   ├── assets/
│   │   └── templates/
│   │
│   └── aos-fantasy/
│       ├── system.json
│       └── ...
│
├── src/
│   ├── core/
│   │   ├── SystemLoader.js
│   │   ├── ValidationEngine.js
│   │   └── ExportEngine.js
│   ├── components/
│   │   ├── UnitCard.jsx (renders dynamically)
│   │   ├── StatDisplay.jsx (reads system config)
│   │   └── ArmyBuilder.jsx (system-agnostic)
│   └── App.jsx
│
└── index.html
```

---

## Admin Panel for Multi-System

### System Selection

```
┌──────────────────────────────────────┐
│ Select Game System                   │
├──────────────────────────────────────┤
│                                      │
│ ┌────────────────┐ ┌──────────────┐ │
│ │  CFB           │ │  Grimdark 40K│ │
│ │  ⚔️            │ │  🔫          │ │
│ │  23 units      │ │  150 units   │ │
│ │  [Manage]      │ │  [Manage]    │ │
│ └────────────────┘ └──────────────┘ │
│                                      │
│ ┌────────────────┐ ┌──────────────┐ │
│ │  AoS Fantasy   │ │  + New System│ │
│ │  ⭐            │ │              │ │
│ │  87 units      │ │              │ │
│ │  [Manage]      │ │  [Create]    │ │
│ └────────────────┘ └──────────────┘ │
│                                      │
└──────────────────────────────────────┘
```

### Add New System Wizard

```
Step 1: Basic Info
  - System name
  - Author
  - Description
  
Step 2: Branding
  - Colors (primary, secondary, accent)
  - Logo upload
  - Font selection
  
Step 3: Define Stats
  - Add stat types (name, short name, type)
  - Set order and display
  - **Download CSV template** with defined stat columns
  
Step 4: Define Factions & Races
  - Add factions with colors
  - Add races/subfactions
  
Step 5: Army Rules
  - Point limit
  - Army composition rules
  - Validation rules
  
Step 6: Import Units
  - **Download generated CSV template** (auto-built from system config)
  - Fill in spreadsheet (Excel/Google Sheets)
  - Upload CSV → auto-converts to JSON
  - Review parsed units before import
  - Bulk save to system
```

---

## CSV Import System (Non-Dev Friendly)

### Auto-Generated CSV Template

When admin defines their system stats, the wizard generates a CSV template that matches:

**Example: CFB Template (`cfb-units-template.csv`)**

```csv
name,faction,race,types,points,baseSize,movement,melee,ranged,defence,morale,wounds,weapon1_name,weapon1_range,weapon1_attacks,weapon1_damage,weapon1_ap,weapon2_name,weapon2_range,weapon2_attacks,weapon2_damage,weapon2_ap,keywords,specialRules,flavorText
Orc Warriors,evil,orcs,infantry,73,40mm x 20mm,7,4,10,6,6,2,Orcish Swords,Melee,4,1,-,,,,,,"Evil,Orcs,Infantry","Brutal Charge",Savage warriors
Orc Archers,evil,orcs,"infantry,ranged",85,40mm x 20mm,7,4,4,5,5,2,Orcish Bow,24",2,1,-,Orcish Knife,Melee,2,1,-,"Evil,Orcs,Infantry,Ranged",,Skilled hunters
```

**Example: 40K Template (`40k-units-template.csv`)**

Auto-generated with different columns based on system stats:

```csv
name,faction,unitType,points,move,weaponSkill,ballisticSkill,strength,toughness,wounds,attacks,leadership,save,weapon1_name,weapon1_range,weapon1_type,weapon1_strength,weapon1_ap,weapon1_damage,keywords
Tactical Marines,space_marines,troops,90,6",3+,3+,4,4,2,2,7,3+,Bolter,24",Rapid Fire,4,0,1,"Imperium,Adeptus Astartes"
```

### CSV → JSON Conversion Engine

```javascript
class CSVImporter {
  constructor(systemManifest) {
    this.system = systemManifest;
  }
  
  generateTemplate() {
    const columns = ['name', 'faction', 'race', 'types', 'points'];
    
    // Add custom fields
    this.system.customFields.forEach(f => columns.push(f.id));
    
    // Add stat columns
    this.system.statDefinitions.forEach(s => columns.push(s.id));
    
    // Add weapon slots (5 weapon slots by default)
    for (let i = 1; i <= 5; i++) {
      this.system.weaponAttributes.forEach(attr => {
        columns.push(`weapon${i}_${attr.id}`);
      });
    }
    
    // Add metadata columns
    columns.push('keywords', 'specialRules', 'flavorText');
    
    return columns.join(',') + '\n';
  }
  
  parseCSV(csvText) {
    const rows = this.parseCSVRows(csvText);
    const headers = rows[0];
    const units = [];
    const errors = [];
    
    rows.slice(1).forEach((row, idx) => {
      try {
        const unit = this.rowToUnit(row, headers);
        const validation = this.validateUnit(unit);
        
        if (validation.errors.length > 0) {
          errors.push({ row: idx + 2, errors: validation.errors });
        } else {
          units.push(unit);
        }
      } catch (e) {
        errors.push({ row: idx + 2, errors: [e.message] });
      }
    });
    
    return { units, errors };
  }
  
  rowToUnit(row, headers) {
    const unit = {
      id: '',
      name: '',
      faction: '',
      race: '',
      types: [],
      points: 0,
      stats: {},
      weapons: [],
      customFields: {},
      keywords: [],
      specialRules: [],
      flavorText: ''
    };
    
    headers.forEach((header, idx) => {
      const value = row[idx];
      
      // Basic fields
      if (header === 'name') unit.name = value;
      else if (header === 'faction') unit.faction = value;
      else if (header === 'race') unit.race = value;
      else if (header === 'types') unit.types = value.split(',').map(s => s.trim());
      else if (header === 'points') unit.points = parseInt(value) || 0;
      else if (header === 'keywords') unit.keywords = value.split(',').map(s => s.trim());
      else if (header === 'specialRules') unit.specialRules = value.split(',').map(s => s.trim());
      else if (header === 'flavorText') unit.flavorText = value;
      
      // Stats
      else if (this.system.statDefinitions.find(s => s.id === header)) {
        unit.stats[header] = this.parseValue(value, header);
      }
      
      // Custom fields
      else if (this.system.customFields.find(f => f.id === header)) {
        unit.customFields[header] = value;
      }
      
      // Weapons (weapon1_name, weapon1_range, etc.)
      else if (header.startsWith('weapon')) {
        const match = header.match(/weapon(\d+)_(.+)/);
        if (match && value) {
          const weaponIdx = parseInt(match[1]) - 1;
          const attr = match[2];
          
          if (!unit.weapons[weaponIdx]) {
            unit.weapons[weaponIdx] = {};
          }
          unit.weapons[weaponIdx][attr] = this.parseValue(value, attr);
        }
      }
    });
    
    // Filter out empty weapons
    unit.weapons = unit.weapons.filter(w => w && w.name);
    
    // Generate ID
    unit.id = unit.name.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
    
    return unit;
  }
  
  validateUnit(unit) {
    const errors = [];
    const warnings = [];
    
    // Required fields
    if (!unit.name) errors.push('Missing unit name');
    if (!unit.faction) errors.push('Missing faction');
    if (!unit.points) warnings.push('No points cost set');
    
    // Validate faction exists
    if (unit.faction && !this.system.factions.find(f => f.id === unit.faction)) {
      errors.push(`Unknown faction: ${unit.faction}`);
    }
    
    // Validate race exists
    if (unit.race && !this.system.races.find(r => r.id === unit.race)) {
      errors.push(`Unknown race: ${unit.race}`);
    }
    
    // Validate required stats
    this.system.statDefinitions.forEach(statDef => {
      if (statDef.required && unit.stats[statDef.id] === undefined) {
        errors.push(`Missing required stat: ${statDef.name}`);
      }
    });
    
    return { errors, warnings };
  }
}
```

### Import Flow UI

```
┌────────────────────────────────────────────┐
│ Bulk Import Units                          │
├────────────────────────────────────────────┤
│                                            │
│ Step 1: Download Template                  │
│ ┌──────────────────────────────────────┐  │
│ │  📥 Download CSV Template            │  │
│ │  Tailored for "Classic Fantasy      │  │
│ │  Battles" (with all your stats)     │  │
│ └──────────────────────────────────────┘  │
│                                            │
│ Step 2: Fill in Excel/Google Sheets       │
│  • Each row = one unit                    │
│  • Use dropdowns for faction/race         │
│  • Multiple weapons in weapon1_*, weapon2_*│
│                                            │
│ Step 3: Upload Completed CSV              │
│ ┌──────────────────────────────────────┐  │
│ │  📁 Drag & drop CSV here             │  │
│ │     or click to browse               │  │
│ └──────────────────────────────────────┘  │
│                                            │
│ Step 4: Review & Confirm                  │
│ ┌──────────────────────────────────────┐  │
│ │ ✓ 45 units parsed successfully       │  │
│ │ ⚠ 2 warnings (missing flavor text)   │  │
│ │ ✗ 1 error: Row 12 unknown faction    │  │
│ │                                      │  │
│ │ [Preview Units] [Fix Errors]         │  │
│ │ [Import 45 Valid Units]              │  │
│ └──────────────────────────────────────┘  │
│                                            │
└────────────────────────────────────────────┘
```

### Excel Compatibility

The CSV format works seamlessly with:
- **Microsoft Excel** - Save As → CSV (Comma delimited)
- **Google Sheets** - File → Download → CSV
- **Apple Numbers** - File → Export → CSV
- **LibreOffice Calc** - Save As → CSV

### Two-Way Sync (Advanced)

```
Admin edits Google Sheet
        ↓
   Export to CSV
        ↓
   Upload to Builder
        ↓
   Auto-validates against system rules
        ↓
   Import to database
        ↓
   Live in app for all users
```

### Bulk Operations

The CSV importer also supports:
- **Update existing units** (match by ID or name)
- **Delete units** (add `_action: delete` column)
- **Versioning** (track changes per import)
- **Rollback** (revert to previous version)

---

## Image Handling for Units

### Three Approaches (Recommended: Hybrid)

### Option A: Baked-In Storage (Simplest)
Images are uploaded directly to the app's storage (Firebase Storage / Supabase Storage / S3) through the admin UI.

**CSV Workflow:**
```csv
name,faction,points,...,image_filename,icon_filename
Orc Warriors,evil,73,...,orc_warriors.jpg,orc_warriors_icon.png
Orc Archers,evil,85,...,orc_archers.jpg,orc_archers_icon.png
```

Admin workflow:
1. Download CSV template
2. Reference image filenames in CSV (e.g., `orc_warriors.jpg`)
3. Upload CSV
4. **System prompts: "Upload 24 referenced images"**
5. Drag & drop image folder
6. App auto-matches filenames → uploads to storage → links to units

**Pros:**
- Self-contained, no external dependencies
- Single permission model (app handles auth)
- Images backed up with units
- Works offline once cached

**Cons:**
- Storage costs scale with usage
- Must upload images separately

---

### Option B: External URL (Most Flexible)
CSV references publicly-accessible URLs (Imgur, Cloudinary, your own CDN).

**CSV Workflow:**
```csv
name,faction,points,...,image_url,icon_url
Orc Warriors,evil,73,...,https://cdn.example.com/orc_warriors.jpg,https://cdn.example.com/orc_warriors_icon.png
```

**Pros:**
- No image upload step
- Use existing image hosting
- Easy to update images (just change URL)
- Zero storage costs for app

**Cons:**
- Requires external image hosting
- Broken links if external host changes
- Must ensure public access
- CORS issues possible

---

### Option C: Hybrid (Recommended)
Support **both** methods - admin chooses per unit.

**CSV Workflow:**
```csv
name,faction,points,...,image,icon
Orc Warriors,evil,73,...,orc_warriors.jpg,orc_warriors_icon.png
Goblin Scout,evil,30,...,https://example.com/goblin.jpg,
Spider Rider,evil,90,...,,
```

Logic:
- If value is URL (starts with `http://` or `https://`) → use as external link
- If value is filename → look in uploaded image batch
- If empty → show placeholder/silhouette

**Image Upload Flow:**
```
┌────────────────────────────────────────────┐
│ Step 4: Upload Unit Images                 │
├────────────────────────────────────────────┤
│ Your CSV references 18 local images        │
│                                            │
│ ┌──────────────────────────────────────┐  │
│ │  📁 Drag images here or browse       │  │
│ │     Supports: .jpg .png .webp .svg   │  │
│ └──────────────────────────────────────┘  │
│                                            │
│ Matched (15):                              │
│  ✓ orc_warriors.jpg → Orc Warriors        │
│  ✓ orc_archers.jpg → Orc Archers          │
│  ✓ ...                                     │
│                                            │
│ Missing (3):                               │
│  ⚠ goblin_scout.jpg                       │
│  ⚠ troll_chief.png                        │
│  ⚠ spider_queen.jpg                       │
│                                            │
│ Auto-resize: ☑ Card thumbnails (300x200)   │
│              ☑ Detail images (1200x800)    │
│              ☑ Generate WebP versions      │
│                                            │
│ [Skip Missing] [Cancel] [Upload All]       │
└────────────────────────────────────────────┘
```

---

## Image Storage Architecture

### Recommended: App-Hosted with CDN

```
User uploads images
        ↓
Admin Panel
        ↓
Firebase Storage / S3 Bucket
   ├── systems/cfb/units/orc_warriors.jpg
   ├── systems/cfb/units/orc_warriors_thumb.webp
   └── systems/cfb/units/orc_warriors_full.webp
        ↓
Cloudflare CDN (caching layer)
        ↓
Public URL served to users
```

### Storage Structure

```
storage/
├── systems/
│   ├── cfb/
│   │   ├── branding/
│   │   │   ├── logo.svg
│   │   │   └── favicon.ico
│   │   └── units/
│   │       ├── full/         (1200x800, original)
│   │       ├── card/         (300x200, for cards)
│   │       ├── thumb/        (80x80, for lists)
│   │       └── icon/         (32x32, for badges)
│   └── 40k/
│       └── ...
└── users/
    └── {userId}/
        └── armies/
            └── custom-list-images/
```

### Auto-Image Processing

When admin uploads an image, the system automatically:

1. **Validates** file type, size, dimensions
2. **Resizes** to 4 standard sizes (full, card, thumb, icon)
3. **Optimizes** with WebP conversion
4. **Uploads** to storage
5. **Returns** all URLs:

```json
{
  "image": {
    "full": "https://cdn.app/systems/cfb/units/full/orc_warriors.webp",
    "card": "https://cdn.app/systems/cfb/units/card/orc_warriors.webp",
    "thumb": "https://cdn.app/systems/cfb/units/thumb/orc_warriors.webp",
    "icon": "https://cdn.app/systems/cfb/units/icon/orc_warriors.webp"
  }
}
```

---

## Permissions & Security

### Public vs Private Images

```javascript
// Firestore Rules
match /storage/systems/{systemId}/units/{imageId} {
  // Anyone can read unit images
  allow read: if true;
  
  // Only system admins can write
  allow write: if request.auth != null && 
    isSystemAdmin(request.auth.uid, systemId);
}

match /storage/users/{userId}/{file} {
  // Only owner can read/write personal images
  allow read, write: if request.auth.uid == userId;
}
```

### CDN Configuration

- **Public assets** (system images): Cached aggressively (30 days)
- **User assets** (custom uploads): Signed URLs with short expiry
- **Bandwidth**: Use Cloudflare/Bunny CDN for cost optimization

---

## Cost Estimates

### Firebase Storage Pricing (example)
- Storage: $0.026/GB/month
- Downloads: $0.12/GB
- Uploads: Free

**Example: 1,000 units with 4 image sizes**
- Avg 200KB per unit = 200MB total = **~$0.005/month**
- 10,000 monthly views @ 1MB per view = **$1.20/month**

**Verdict:** Image hosting is cheap; user-friendliness is the priority.

---

## CSV Image Reference Examples

### Simple (filename only):
```csv
name,points,image
Orc Warriors,73,orc_warriors.jpg
```

### Multiple sizes:
```csv
name,points,image_full,image_card,image_thumb
Orc Warriors,73,orc_full.jpg,orc_card.jpg,orc_thumb.jpg
```

### External URLs:
```csv
name,points,image
Orc Warriors,73,https://miniaturewargaming.com/orcs/warriors.jpg
```

### Multiple images per unit (gallery):
```csv
name,points,images
Orc Warriors,73,"front.jpg,side.jpg,rear.jpg,group.jpg"
```

---

## Recommendation Summary

**For your use case, I recommend:**

✅ **Hybrid approach** - support both filenames (uploaded) and URLs (external)
✅ **App-hosted primary** - use Firebase Storage or Supabase Storage
✅ **CDN layer** - Cloudflare for fast global delivery
✅ **Auto-resize** - generate 4 sizes on upload
✅ **Bulk image upload** - drag entire folder, auto-match to CSV
✅ **Placeholder system** - silhouettes when no image provided

This gives admins:
- **Easy mode**: Drop images + CSV, app handles everything
- **Power mode**: Reference external CDN URLs for faster bulk loading
- **No fuss**: Missing images don't block import (placeholder shown)

---

## Database Schema (Multi-System)

### Firestore Collections

```javascript
// systems collection
{
  id: "cfb",
  manifest: { /* full system.json */ },
  isPublic: true,
  createdBy: "admin_uid",
  createdAt: timestamp
}

// units collection (per system)
{
  id: "cfb_orc_warriors",
  systemId: "cfb",
  unitData: { /* full unit data */ },
  createdAt: timestamp,
  updatedAt: timestamp
}

// armies collection
{
  id: "user_army_123",
  systemId: "cfb",  // <-- Links to which system
  userId: "user_uid",
  name: "My Orc Horde",
  units: [ /* ... */ ],
  totalPoints: 1200,
  createdAt: timestamp
}
```

---

## URL Routing

```
https://armybuilder.app/
  → System selection page

https://armybuilder.app/cfb
  → Classic Fantasy Battles builder

https://armybuilder.app/grimdark-40k
  → Grimdark 40K builder

https://armybuilder.app/admin/systems/cfb
  → Admin panel for CFB system
```

---

## Benefits

✅ **One Platform, Multiple Games**
- Host CFB, 40K, AoS, Legion, custom systems

✅ **Community Systems**
- Users can create and share custom game systems
- Public marketplace of systems

✅ **Future-Proof**
- New games = just add config file
- No code changes needed

✅ **Consistent UX**
- Players learn once, use everywhere
- Same army management across all systems

✅ **Monetization Options**
- Premium system hosting
- Official vs community systems
- Per-system subscriptions

---

## Implementation Phases

### Phase 1: Extract CFB to Config
- Move all CFB-specific data to system.json
- Make UI components read from config
- Test with CFB system only

### Phase 2: Add Second System
- Implement full system loader
- Add a second reference system (e.g., simplified 40K)
- Verify dynamic rendering works

### Phase 3: Admin System Builder
- UI for creating new systems
- Wizard for defining stats/factions
- Bulk unit import

### Phase 4: Community Features
- Public system directory
- System sharing/cloning
- User-created systems

---

## Technical Challenges

### Dynamic Validation
- Each system has different rules
- Need generic validation engine that reads system config

### Dynamic UI Layouts
- Some systems need different layouts (e.g., 40K datasheets)
- Solution: Template system or layout components per system

### Performance
- Loading multiple systems' unit data
- Solution: Lazy load, cache aggressively

### Backwards Compatibility
- System updates shouldn't break old armies
- Solution: Version system configs, migrate armies on load

---

## Conclusion

By abstracting game rules into configuration files, this platform becomes a **universal army builder** that can support any tabletop wargaming system. Non-developers can create entire game systems through the admin interface without touching code.

This positions the platform as:
- **Multi-game solution** (not just CFB)
- **Platform for publishers** to host their systems
- **Community hub** for homebrew systems

---

*Example systems ready to implement:*
- Warhammer 40K
- Age of Sigmar
- Star Wars Legion
- Flames of War
- Bolt Action
- Kings of War
- Warmachine
- *...and any custom systems*
