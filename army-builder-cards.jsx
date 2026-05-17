const { useState, useEffect } = React;

// Load unit data
let UNITS_DATA = [];
fetch('data/all-units.json')
  .then(r => r.json())
  .then(data => { UNITS_DATA = data; });

function ArmyBuilderCards() {
  const [selectedFaction, setSelectedFaction] = useState('Evil');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRace, setSelectedRace] = useState('All');
  const [army, setArmy] = useState([]);
  const [draggedUnit, setDraggedUnit] = useState(null);
  const [view, setView] = useState('builder'); // 'builder' or 'army'
  
  const cardStyles = {
    container: {
      width: '100%',
      height: '100%',
      background: '#1a1a1a',
      display: 'flex',
      flexDirection: 'column',
    },
    topBar: {
      padding: '16px 24px',
      background: '#2a2a2a',
      borderBottom: '1px solid #3a3a3a',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    logo: {
      fontSize: '20px',
      fontWeight: '700',
      color: '#f5f5f0',
    },
    navTabs: {
      display: 'flex',
      gap: '8px',
    },
    navTab: {
      padding: '8px 20px',
      background: 'transparent',
      border: 'none',
      color: '#999',
      fontSize: '14px',
      fontWeight: '600',
      cursor: 'pointer',
      borderBottom: '2px solid transparent',
      transition: 'all 0.15s',
    },
    navTabActive: {
      color: '#f5f5f0',
      borderBottomColor: '#8b2635',
    },
    pointsDisplay: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
    },
    pointsLabel: {
      fontSize: '13px',
      color: '#999',
    },
    pointsValue: {
      fontSize: '18px',
      fontWeight: '700',
      color: '#f5f5f0',
    },
    mainContent: {
      flex: 1,
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
    },
    toolbar: {
      padding: '16px 24px',
      background: '#1a1a1a',
      borderBottom: '1px solid #3a3a3a',
      display: 'flex',
      gap: '12px',
      alignItems: 'center',
    },
    factionTabs: {
      display: 'flex',
      gap: '8px',
    },
    factionTab: {
      padding: '8px 16px',
      background: '#2a2a2a',
      border: '1px solid #3a3a3a',
      borderRadius: '6px',
      color: '#999',
      fontSize: '13px',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.15s',
    },
    factionTabActive: {
      background: '#8b2635',
      borderColor: '#8b2635',
      color: '#f5f5f0',
    },
    searchBox: {
      flex: 1,
      padding: '8px 14px',
      fontSize: '14px',
      background: '#2a2a2a',
      border: '1px solid #3a3a3a',
      borderRadius: '6px',
      color: '#f5f5f0',
      outline: 'none',
    },
    select: {
      padding: '8px 12px',
      fontSize: '13px',
      background: '#2a2a2a',
      border: '1px solid #3a3a3a',
      borderRadius: '6px',
      color: '#f5f5f0',
      outline: 'none',
      cursor: 'pointer',
    },
    cardGrid: {
      flex: 1,
      overflow: 'auto',
      padding: '24px',
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
      gap: '16px',
      alignContent: 'start',
    },
    card: {
      background: '#2a2a2a',
      border: '1px solid #3a3a3a',
      borderRadius: '8px',
      padding: '16px',
      cursor: 'grab',
      transition: 'all 0.2s',
      height: 'fit-content',
    },
    cardHover: {
      transform: 'translateY(-2px)',
      borderColor: '#8b2635',
      boxShadow: '0 8px 16px rgba(0,0,0,0.3)',
    },
    cardHeader: {
      marginBottom: '12px',
    },
    cardTitle: {
      fontSize: '16px',
      fontWeight: '700',
      color: '#f5f5f0',
      marginBottom: '4px',
    },
    cardSubtitle: {
      fontSize: '12px',
      color: '#999',
    },
    statsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(6, 1fr)',
      gap: '8px',
      marginBottom: '12px',
      padding: '12px',
      background: '#1a1a1a',
      borderRadius: '6px',
    },
    stat: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '4px',
    },
    statLabel: {
      color: '#999',
      fontSize: '9px',
      textTransform: 'uppercase',
      letterSpacing: '0.5px',
    },
    statValue: {
      color: '#f5f5f0',
      fontWeight: '700',
      fontSize: '14px',
    },
    weaponList: {
      marginBottom: '12px',
    },
    weaponItem: {
      padding: '6px 0',
      fontSize: '12px',
      color: '#ccc',
      borderTop: '1px solid #3a3a3a',
    },
    cardFooter: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    pointsBadge: {
      padding: '6px 12px',
      background: '#8b2635',
      color: '#f5f5f0',
      borderRadius: '6px',
      fontSize: '14px',
      fontWeight: '700',
    },
    addButton: {
      padding: '6px 16px',
      background: '#3a3a3a',
      border: '1px solid #4a4a4a',
      borderRadius: '6px',
      color: '#f5f5f0',
      fontSize: '12px',
      fontWeight: '600',
      cursor: 'pointer',
    },
    armyList: {
      flex: 1,
      overflow: 'auto',
      padding: '24px',
    },
    armyCard: {
      background: '#2a2a2a',
      border: '1px solid #3a3a3a',
      borderRadius: '8px',
      padding: '16px',
      marginBottom: '12px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    removeBtn: {
      padding: '6px 14px',
      background: 'transparent',
      border: '1px solid #555',
      borderRadius: '6px',
      color: '#999',
      fontSize: '12px',
      fontWeight: '600',
      cursor: 'pointer',
    },
    emptyState: {
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#666',
      padding: '60px',
    },
    emptyIcon: {
      fontSize: '64px',
      marginBottom: '16px',
    },
    emptyText: {
      fontSize: '16px',
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
    
    return matchesFaction && matchesSearch && matchesRace;
  });
  
  const races = ['All', ...new Set(UNITS_DATA.filter(u => u.faction === selectedFaction || u.faction === 'Mercenary').map(u => u.race))];
  
  const handleAddUnit = (unit) => {
    setArmy([...army, { ...unit, instanceId: Date.now() }]);
  };
  
  const handleRemoveUnit = (instanceId) => {
    setArmy(army.filter(u => u.instanceId !== instanceId));
  };
  
  return (
    <div style={cardStyles.container}>
      {/* Top Navigation Bar */}
      <div style={cardStyles.topBar}>
        <div style={cardStyles.logo}>⚔️ Classic Fantasy Battles</div>
        <div style={cardStyles.navTabs}>
          <button 
            style={{...cardStyles.navTab, ...(view === 'builder' ? cardStyles.navTabActive : {})}}
            onClick={() => setView('builder')}
          >
            Unit Browser
          </button>
          <button 
            style={{...cardStyles.navTab, ...(view === 'army' ? cardStyles.navTabActive : {})}}
            onClick={() => setView('army')}
          >
            My Army ({army.length})
          </button>
        </div>
        <div style={cardStyles.pointsDisplay}>
          <span style={cardStyles.pointsLabel}>Total:</span>
          <span style={{...cardStyles.pointsValue, color: isOverLimit ? '#d32f2f' : '#f5f5f0'}}>
            {totalPoints} / {pointLimit}
          </span>
        </div>
      </div>
      
      {view === 'builder' ? (
        <div style={cardStyles.mainContent}>
          {/* Toolbar */}
          <div style={cardStyles.toolbar}>
            <div style={cardStyles.factionTabs}>
              <div 
                style={{...cardStyles.factionTab, ...(selectedFaction === 'Good' ? cardStyles.factionTabActive : {})}}
                onClick={() => setSelectedFaction('Good')}
              >
                Good
              </div>
              <div 
                style={{...cardStyles.factionTab, ...(selectedFaction === 'Evil' ? cardStyles.factionTabActive : {})}}
                onClick={() => setSelectedFaction('Evil')}
              >
                Evil
              </div>
            </div>
            
            <input 
              type="text"
              style={cardStyles.searchBox}
              placeholder="Search units, keywords..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            
            <select 
              style={cardStyles.select}
              value={selectedRace}
              onChange={(e) => setSelectedRace(e.target.value)}
            >
              {races.map(race => <option key={race} value={race}>{race}</option>)}
            </select>
          </div>
          
          {/* Card Grid */}
          <div style={cardStyles.cardGrid}>
            {filteredUnits.map(unit => (
              <div key={unit.id} style={cardStyles.card}>
                <div style={cardStyles.cardHeader}>
                  <div style={cardStyles.cardTitle}>{unit.name}</div>
                  <div style={cardStyles.cardSubtitle}>{unit.race} • {unit.type}</div>
                </div>
                
                <div style={cardStyles.statsGrid}>
                  <div style={cardStyles.stat}>
                    <span style={cardStyles.statLabel}>M</span>
                    <span style={cardStyles.statValue}>{unit.stats.movement}</span>
                  </div>
                  <div style={cardStyles.stat}>
                    <span style={cardStyles.statLabel}>Me</span>
                    <span style={cardStyles.statValue}>{unit.stats.melee}</span>
                  </div>
                  <div style={cardStyles.stat}>
                    <span style={cardStyles.statLabel}>Ra</span>
                    <span style={cardStyles.statValue}>{unit.stats.ranged}</span>
                  </div>
                  <div style={cardStyles.stat}>
                    <span style={cardStyles.statLabel}>D</span>
                    <span style={cardStyles.statValue}>{unit.stats.defence}</span>
                  </div>
                  <div style={cardStyles.stat}>
                    <span style={cardStyles.statLabel}>Mo</span>
                    <span style={cardStyles.statValue}>{unit.stats.morale}</span>
                  </div>
                  <div style={cardStyles.stat}>
                    <span style={cardStyles.statLabel}>W</span>
                    <span style={cardStyles.statValue}>{unit.stats.wounds}</span>
                  </div>
                </div>
                
                {unit.weapons && unit.weapons.length > 0 && (
                  <div style={cardStyles.weaponList}>
                    {unit.weapons.slice(0, 2).map((weapon, idx) => (
                      <div key={idx} style={cardStyles.weaponItem}>
                        {weapon.name} • {weapon.range}
                      </div>
                    ))}
                  </div>
                )}
                
                <div style={cardStyles.cardFooter}>
                  <div style={cardStyles.pointsBadge}>{unit.points} pts</div>
                  <button 
                    style={cardStyles.addButton}
                    onClick={() => handleAddUnit(unit)}
                  >
                    + Add to Army
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div style={cardStyles.mainContent}>
          {army.length === 0 ? (
            <div style={cardStyles.emptyState}>
              <div style={cardStyles.emptyIcon}>⚔️</div>
              <div style={cardStyles.emptyText}>Your army is empty</div>
              <div style={{fontSize: '13px', color: '#666', marginTop: '8px'}}>
                Switch to Unit Browser to add units
              </div>
            </div>
          ) : (
            <div style={cardStyles.armyList}>
              {army.map(unit => (
                <div key={unit.instanceId} style={cardStyles.armyCard}>
                  <div>
                    <div style={{fontSize: '16px', fontWeight: '600', color: '#f5f5f0', marginBottom: '4px'}}>
                      {unit.name}
                    </div>
                    <div style={{fontSize: '12px', color: '#999'}}>
                      {unit.race} {unit.type} • {unit.points} pts
                    </div>
                  </div>
                  <button 
                    style={cardStyles.removeBtn}
                    onClick={() => handleRemoveUnit(unit.instanceId)}
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

Object.assign(window, { ArmyBuilderCards });
