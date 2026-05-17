const { useState, useEffect } = React;

// Load unit data
let UNITS_DATA = [];
fetch('data/all-units.json')
  .then(r => r.json())
  .then(data => { UNITS_DATA = data; });

function ArmyBuilderCompact() {
  const [selectedFaction, setSelectedFaction] = useState('Evil');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRace, setSelectedRace] = useState('All');
  const [selectedType, setSelectedType] = useState('All');
  const [army, setArmy] = useState([]);
  const [draggedUnit, setDraggedUnit] = useState(null);
  
  const compactStyles = {
    container: {
      width: '100%',
      height: '100%',
      background: '#2a2a2a',
      display: 'grid',
      gridTemplateColumns: '360px 1fr 340px',
      gap: '1px',
      overflow: 'hidden',
    },
    panel: {
      background: '#1a1a1a',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
    },
    header: {
      padding: '20px',
      borderBottom: '1px solid #3a3a3a',
    },
    title: {
      fontSize: '18px',
      fontWeight: '700',
      color: '#f5f5f0',
      marginBottom: '4px',
    },
    subtitle: {
      fontSize: '13px',
      color: '#999',
    },
    content: {
      flex: 1,
      overflow: 'auto',
      padding: '12px',
    },
    searchBox: {
      width: '100%',
      padding: '10px 12px',
      fontSize: '14px',
      background: '#2a2a2a',
      border: '1px solid #3a3a3a',
      borderRadius: '6px',
      color: '#f5f5f0',
      outline: 'none',
      marginBottom: '12px',
    },
    filterRow: {
      display: 'flex',
      gap: '8px',
      marginBottom: '12px',
    },
    select: {
      flex: 1,
      padding: '8px 10px',
      fontSize: '13px',
      background: '#2a2a2a',
      border: '1px solid #3a3a3a',
      borderRadius: '6px',
      color: '#f5f5f0',
      outline: 'none',
      cursor: 'pointer',
    },
    unitRow: {
      padding: '12px',
      background: '#2a2a2a',
      border: '1px solid #3a3a3a',
      borderRadius: '6px',
      marginBottom: '8px',
      cursor: 'grab',
      transition: 'all 0.15s',
    },
    unitRowHover: {
      background: '#333',
      borderColor: '#8b2635',
    },
    unitName: {
      fontSize: '14px',
      fontWeight: '600',
      color: '#f5f5f0',
      marginBottom: '6px',
    },
    unitMeta: {
      fontSize: '12px',
      color: '#999',
      marginBottom: '8px',
    },
    statRow: {
      display: 'flex',
      gap: '12px',
      fontSize: '11px',
      color: '#ccc',
    },
    stat: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '2px',
    },
    statLabel: {
      color: '#999',
      fontSize: '9px',
      textTransform: 'uppercase',
      letterSpacing: '0.5px',
    },
    statValue: {
      color: '#f5f5f0',
      fontWeight: '600',
      fontSize: '13px',
    },
    pointsBadge: {
      display: 'inline-block',
      padding: '4px 10px',
      background: '#8b2635',
      color: '#f5f5f0',
      borderRadius: '4px',
      fontSize: '12px',
      fontWeight: '600',
      marginTop: '6px',
    },
    armyItem: {
      padding: '10px 12px',
      background: '#2a2a2a',
      border: '1px solid #3a3a3a',
      borderRadius: '6px',
      marginBottom: '6px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    removeBtn: {
      padding: '4px 8px',
      background: 'transparent',
      border: '1px solid #555',
      borderRadius: '4px',
      color: '#999',
      fontSize: '11px',
      cursor: 'pointer',
    },
    totalBar: {
      padding: '16px 20px',
      background: '#1a1a1a',
      borderTop: '1px solid #3a3a3a',
    },
    totalRow: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '8px',
    },
    totalLabel: {
      fontSize: '14px',
      color: '#999',
    },
    totalValue: {
      fontSize: '24px',
      fontWeight: '700',
      color: '#f5f5f0',
    },
    progressBar: {
      width: '100%',
      height: '8px',
      background: '#2a2a2a',
      borderRadius: '4px',
      overflow: 'hidden',
    },
    progressFill: {
      height: '100%',
      background: '#8b2635',
      transition: 'width 0.3s',
    },
    warningBadge: {
      padding: '8px 12px',
      background: '#8b2635',
      color: '#f5f5f0',
      borderRadius: '6px',
      fontSize: '12px',
      marginTop: '8px',
      textAlign: 'center',
    },
    factionTabs: {
      display: 'flex',
      gap: '8px',
      marginBottom: '16px',
    },
    factionTab: {
      flex: 1,
      padding: '10px',
      background: '#2a2a2a',
      border: '1px solid #3a3a3a',
      borderRadius: '6px',
      color: '#999',
      fontSize: '13px',
      fontWeight: '600',
      cursor: 'pointer',
      textAlign: 'center',
      transition: 'all 0.15s',
    },
    factionTabActive: {
      background: '#8b2635',
      borderColor: '#8b2635',
      color: '#f5f5f0',
    },
    centerPanel: {
      background: '#1a1a1a',
      display: 'flex',
      flexDirection: 'column',
      padding: '24px',
      overflow: 'auto',
    },
    centerPanelEmpty: {
      background: '#1a1a1a',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px',
    },
    emptyState: {
      textAlign: 'center',
      color: '#666',
    },
    emptyIcon: {
      fontSize: '48px',
      marginBottom: '16px',
    },
    emptyText: {
      fontSize: '16px',
      color: '#999',
    },
    unitTile: {
      background: '#2a2a2a',
      border: '1px solid #3a3a3a',
      borderRadius: '8px',
      padding: '20px',
      marginBottom: '16px',
      transition: 'all 0.2s',
    },
    tileHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: '16px',
      paddingBottom: '12px',
      borderBottom: '1px solid #3a3a3a',
    },
    tileTitle: {
      fontSize: '18px',
      fontWeight: '700',
      color: '#f5f5f0',
      marginBottom: '4px',
    },
    tileMeta: {
      fontSize: '13px',
      color: '#999',
    },
    tileStatsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(6, 1fr)',
      gap: '16px',
      padding: '16px',
      background: '#1a1a1a',
      borderRadius: '6px',
      marginBottom: '16px',
    },
    tileWeaponsSection: {
      marginBottom: '16px',
    },
    sectionTitle: {
      fontSize: '12px',
      fontWeight: '700',
      color: '#999',
      textTransform: 'uppercase',
      letterSpacing: '0.5px',
      marginBottom: '8px',
    },
    weaponRow: {
      display: 'grid',
      gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr',
      gap: '12px',
      padding: '8px 12px',
      background: '#1a1a1a',
      borderRadius: '4px',
      fontSize: '12px',
      marginBottom: '4px',
    },
    weaponHeader: {
      fontWeight: '600',
      color: '#999',
      fontSize: '11px',
      textTransform: 'uppercase',
    },
    weaponData: {
      color: '#ccc',
    },
    keywordTags: {
      display: 'flex',
      gap: '6px',
      flexWrap: 'wrap',
    },
    keywordTag: {
      padding: '4px 8px',
      background: '#1a1a1a',
      border: '1px solid #3a3a3a',
      borderRadius: '4px',
      fontSize: '11px',
      color: '#999',
    },
  };
  
  const totalPoints = army.reduce((sum, unit) => sum + unit.points, 0);
  const pointLimit = 6000;
  const isOverLimit = totalPoints > pointLimit;
  
  const filteredUnits = UNITS_DATA.filter(unit => {
    const matchesFaction = unit.faction === selectedFaction || unit.faction === 'Mercenary';
    const matchesSearch = unit.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         unit.keywords.some(k => k.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesRace = selectedRace === 'All' || unit.race === selectedRace;
    const matchesType = selectedType === 'All' || unit.type.includes(selectedType);
    
    return matchesFaction && matchesSearch && matchesRace && matchesType;
  });
  
  const races = ['All', ...new Set(UNITS_DATA.filter(u => u.faction === selectedFaction || u.faction === 'Mercenary').map(u => u.race))];
  const types = ['All', 'Infantry', 'Cavalry', 'Ranged', 'Artillery', 'Monster', 'Hero'];
  
  const handleDragStart = (unit) => {
    setDraggedUnit(unit);
  };
  
  const handleDrop = () => {
    if (draggedUnit) {
      setArmy([...army, { ...draggedUnit, instanceId: Date.now() }]);
      setDraggedUnit(null);
    }
  };
  
  const handleDragOver = (e) => {
    e.preventDefault();
  };
  
  const handleRemove = (instanceId) => {
    setArmy(army.filter(u => u.instanceId !== instanceId));
  };
  
  return (
    <div style={compactStyles.container}>
      {/* Left Panel - Unit Browser */}
      <div style={compactStyles.panel}>
        <div style={compactStyles.header}>
          <div style={compactStyles.title}>Unit Browser</div>
          <div style={compactStyles.subtitle}>Drag units to add</div>
        </div>
        <div style={compactStyles.content}>
          <div style={compactStyles.factionTabs}>
            <div 
              style={{...compactStyles.factionTab, ...(selectedFaction === 'Good' ? compactStyles.factionTabActive : {})}}
              onClick={() => setSelectedFaction('Good')}
            >
              Good
            </div>
            <div 
              style={{...compactStyles.factionTab, ...(selectedFaction === 'Evil' ? compactStyles.factionTabActive : {})}}
              onClick={() => setSelectedFaction('Evil')}
            >
              Evil
            </div>
          </div>
          
          <input 
            type="text"
            style={compactStyles.searchBox}
            placeholder="Search units..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          
          <div style={compactStyles.filterRow}>
            <select 
              style={compactStyles.select}
              value={selectedRace}
              onChange={(e) => setSelectedRace(e.target.value)}
            >
              {races.map(race => <option key={race} value={race}>{race}</option>)}
            </select>
            <select 
              style={compactStyles.select}
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
            >
              {types.map(type => <option key={type} value={type}>{type}</option>)}
            </select>
          </div>
          
          {filteredUnits.map(unit => (
            <div 
              key={unit.id}
              style={compactStyles.unitRow}
              draggable
              onDragStart={() => handleDragStart(unit)}
            >
              <div style={compactStyles.unitName}>{unit.name}</div>
              <div style={compactStyles.unitMeta}>{unit.race} {unit.type}</div>
              <div style={compactStyles.statRow}>
                <div style={compactStyles.stat}>
                  <span style={compactStyles.statLabel}>M</span>
                  <span style={compactStyles.statValue}>{unit.stats.movement}</span>
                </div>
                <div style={compactStyles.stat}>
                  <span style={compactStyles.statLabel}>Me</span>
                  <span style={compactStyles.statValue}>{unit.stats.melee}</span>
                </div>
                <div style={compactStyles.stat}>
                  <span style={compactStyles.statLabel}>Ra</span>
                  <span style={compactStyles.statValue}>{unit.stats.ranged}</span>
                </div>
                <div style={compactStyles.stat}>
                  <span style={compactStyles.statLabel}>D</span>
                  <span style={compactStyles.statValue}>{unit.stats.defence}</span>
                </div>
                <div style={compactStyles.stat}>
                  <span style={compactStyles.statLabel}>Mo</span>
                  <span style={compactStyles.statValue}>{unit.stats.morale}</span>
                </div>
                <div style={compactStyles.stat}>
                  <span style={compactStyles.statLabel}>W</span>
                  <span style={compactStyles.statValue}>{unit.stats.wounds}</span>
                </div>
              </div>
              <div style={compactStyles.pointsBadge}>{unit.points} pts</div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Center Panel - Unit Tiles */}
      <div 
        style={army.length === 0 ? compactStyles.centerPanelEmpty : compactStyles.centerPanel}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        {army.length === 0 ? (
          <div style={compactStyles.emptyState}>
            <div style={compactStyles.emptyIcon}>⚔️</div>
            <div style={compactStyles.emptyText}>
              Drag units here to build your army
            </div>
          </div>
        ) : (
          army.map(unit => (
            <div key={unit.instanceId} style={compactStyles.unitTile}>
              <div style={compactStyles.tileHeader}>
                <div>
                  <div style={compactStyles.tileTitle}>{unit.name}</div>
                  <div style={compactStyles.tileMeta}>{unit.race} {unit.type} • Base: {unit.baseSize}</div>
                </div>
                <div style={compactStyles.pointsBadge}>{unit.points} pts</div>
              </div>
              
              <div style={compactStyles.tileStatsGrid}>
                <div style={compactStyles.stat}>
                  <span style={compactStyles.statLabel}>Movement</span>
                  <span style={compactStyles.statValue}>{unit.stats.movement}"</span>
                </div>
                <div style={compactStyles.stat}>
                  <span style={compactStyles.statLabel}>Melee</span>
                  <span style={compactStyles.statValue}>{unit.stats.melee}+</span>
                </div>
                <div style={compactStyles.stat}>
                  <span style={compactStyles.statLabel}>Ranged</span>
                  <span style={compactStyles.statValue}>{unit.stats.ranged}+</span>
                </div>
                <div style={compactStyles.stat}>
                  <span style={compactStyles.statLabel}>Defence</span>
                  <span style={compactStyles.statValue}>{unit.stats.defence}+</span>
                </div>
                <div style={compactStyles.stat}>
                  <span style={compactStyles.statLabel}>Morale</span>
                  <span style={compactStyles.statValue}>{unit.stats.morale}+</span>
                </div>
                <div style={compactStyles.stat}>
                  <span style={compactStyles.statLabel}>Wounds</span>
                  <span style={compactStyles.statValue}>{unit.stats.wounds}</span>
                </div>
              </div>
              
              {unit.weapons && unit.weapons.length > 0 && (
                <div style={compactStyles.tileWeaponsSection}>
                  <div style={compactStyles.sectionTitle}>Weapons</div>
                  <div style={compactStyles.weaponRow}>
                    <span style={compactStyles.weaponHeader}>Name</span>
                    <span style={compactStyles.weaponHeader}>Range</span>
                    <span style={compactStyles.weaponHeader}>Attacks</span>
                    <span style={compactStyles.weaponHeader}>Damage</span>
                    <span style={compactStyles.weaponHeader}>AP</span>
                  </div>
                  {unit.weapons.map((weapon, idx) => (
                    <div key={idx} style={compactStyles.weaponRow}>
                      <span style={compactStyles.weaponData}>{weapon.name}</span>
                      <span style={compactStyles.weaponData}>{weapon.range}</span>
                      <span style={compactStyles.weaponData}>{weapon.attacks}</span>
                      <span style={compactStyles.weaponData}>{weapon.damage}</span>
                      <span style={compactStyles.weaponData}>{weapon.armourPiercing}</span>
                    </div>
                  ))}
                </div>
              )}
              
              {unit.keywords && unit.keywords.length > 0 && (
                <div style={compactStyles.tileWeaponsSection}>
                  <div style={compactStyles.sectionTitle}>Keywords</div>
                  <div style={compactStyles.keywordTags}>
                    {unit.keywords.map((keyword, idx) => (
                      <span key={idx} style={compactStyles.keywordTag}>{keyword}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
      
      {/* Right Panel - Army List */}
      <div style={compactStyles.panel}>
        <div style={compactStyles.header}>
          <div style={compactStyles.title}>My Army</div>
          <div style={compactStyles.subtitle}>{army.length} units</div>
        </div>
        <div style={compactStyles.content}>
          {army.map(unit => (
            <div key={unit.instanceId} style={compactStyles.armyItem}>
              <div>
                <div style={{fontSize: '13px', fontWeight: '600', color: '#f5f5f0'}}>{unit.name}</div>
                <div style={{fontSize: '11px', color: '#999', marginTop: '2px'}}>{unit.points} pts</div>
              </div>
              <button 
                style={compactStyles.removeBtn}
                onClick={() => handleRemove(unit.instanceId)}
              >
                Remove
              </button>
            </div>
          ))}
        </div>
        <div style={compactStyles.totalBar}>
          <div style={compactStyles.totalRow}>
            <span style={compactStyles.totalLabel}>Total Points</span>
            <span style={compactStyles.totalValue}>{totalPoints}</span>
          </div>
          <div style={compactStyles.progressBar}>
            <div 
              style={{
                ...compactStyles.progressFill,
                width: `${Math.min((totalPoints / pointLimit) * 100, 100)}%`,
                background: isOverLimit ? '#d32f2f' : '#8b2635',
              }}
            />
          </div>
          <div style={{fontSize: '11px', color: '#999', marginTop: '6px', textAlign: 'right'}}>
            {pointLimit - totalPoints} pts remaining
          </div>
          {isOverLimit && (
            <div style={compactStyles.warningBadge}>
              ⚠️ Army exceeds {pointLimit} point limit
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { ArmyBuilderCompact });
