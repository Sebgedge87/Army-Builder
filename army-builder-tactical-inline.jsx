const { useState, useEffect } = React;

// Load unit data
let UNITS_DATA = [];
fetch('data/all-units.json')
  .then(r => r.json())
  .then(data => { UNITS_DATA = data; });

function ArmyBuilderTactical() {
  const [selectedFaction, setSelectedFaction] = useState('Evil');
  const [searchTerm, setSearchTerm] = useState('');
  const [army, setArmy] = useState([]);
  const [hoveredUnit, setHoveredUnit] = useState(null);
  
  const tacticalStyles = {
    container: {
      width: '100%',
      height: '100%',
      background: '#1a1a1a',
      display: 'flex',
    },
    sidebar: {
      width: '320px',
      background: '#2a2a2a',
      borderRight: '1px solid #3a3a3a',
      display: 'flex',
      flexDirection: 'column',
    },
    sidebarHeader: {
      padding: '20px',
      borderBottom: '1px solid #3a3a3a',
    },
    title: {
      fontSize: '16px',
      fontWeight: '700',
      color: '#f5f5f0',
      marginBottom: '16px',
    },
    searchBox: {
      width: '100%',
      padding: '10px 12px',
      fontSize: '14px',
      background: '#1a1a1a',
      border: '1px solid #3a3a3a',
      borderRadius: '6px',
      color: '#f5f5f0',
      outline: 'none',
      marginBottom: '12px',
    },
    factionTabs: {
      display: 'flex',
      gap: '8px',
    },
    factionTab: {
      flex: 1,
      padding: '8px',
      background: '#1a1a1a',
      border: '1px solid #3a3a3a',
      borderRadius: '6px',
      color: '#999',
      fontSize: '12px',
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
    unitList: {
      flex: 1,
      overflow: 'auto',
      padding: '12px',
    },
    unitItem: {
      padding: '10px 12px',
      background: '#1a1a1a',
      border: '1px solid #3a3a3a',
      borderRadius: '6px',
      marginBottom: '8px',
      cursor: 'pointer',
      transition: 'all 0.15s',
    },
    unitItemHover: {
      borderColor: '#8b2635',
      background: '#252525',
    },
    unitName: {
      fontSize: '13px',
      fontWeight: '600',
      color: '#f5f5f0',
      marginBottom: '4px',
    },
    unitMeta: {
      fontSize: '11px',
      color: '#999',
    },
    mainArea: {
      flex: 1,
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
    armyName: {
      fontSize: '18px',
      fontWeight: '700',
      color: '#f5f5f0',
    },
    pointsBar: {
      display: 'flex',
      alignItems: 'center',
      gap: '16px',
    },
    pointsLabel: {
      fontSize: '13px',
      color: '#999',
    },
    pointsValue: {
      fontSize: '20px',
      fontWeight: '700',
      color: '#f5f5f0',
    },
    progressContainer: {
      width: '200px',
    },
    progressBar: {
      width: '100%',
      height: '6px',
      background: '#1a1a1a',
      borderRadius: '3px',
      overflow: 'hidden',
    },
    progressFill: {
      height: '100%',
      background: '#8b2635',
      transition: 'width 0.3s',
    },
    gridArea: {
      flex: 1,
      overflow: 'auto',
      padding: '24px',
    },
    tableContainer: {
      background: '#2a2a2a',
      borderRadius: '8px',
      border: '1px solid #3a3a3a',
      overflow: 'hidden',
    },
    table: {
      width: '100%',
      borderCollapse: 'collapse',
    },
    th: {
      padding: '12px 16px',
      textAlign: 'left',
      fontSize: '11px',
      fontWeight: '700',
      color: '#999',
      textTransform: 'uppercase',
      letterSpacing: '0.5px',
      background: '#1a1a1a',
      borderBottom: '1px solid #3a3a3a',
    },
    td: {
      padding: '14px 16px',
      fontSize: '13px',
      color: '#ccc',
      borderBottom: '1px solid #3a3a3a',
    },
    tdName: {
      fontSize: '14px',
      fontWeight: '600',
      color: '#f5f5f0',
    },
    statCell: {
      textAlign: 'center',
      fontWeight: '600',
      fontFamily: 'monospace',
    },
    actionCell: {
      textAlign: 'right',
    },
    removeBtn: {
      padding: '4px 10px',
      background: 'transparent',
      border: '1px solid #4a4a4a',
      borderRadius: '4px',
      color: '#999',
      fontSize: '11px',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.15s',
    },
    emptyState: {
      padding: '80px 40px',
      textAlign: 'center',
      color: '#666',
    },
    emptyIcon: {
      fontSize: '56px',
      marginBottom: '16px',
    },
    emptyText: {
      fontSize: '16px',
      color: '#999',
    },
    detailPanel: {
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      background: '#2a2a2a',
      border: '1px solid #3a3a3a',
      borderRadius: '8px',
      padding: '20px',
      width: '400px',
      boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
    },
    statsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(6, 1fr)',
      gap: '12px',
      padding: '16px',
      background: '#1a1a1a',
      borderRadius: '6px',
      marginTop: '12px',
    },
    stat: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '4px',
    },
    statLabel: {
      color: '#999',
      fontSize: '10px',
      textTransform: 'uppercase',
      letterSpacing: '0.5px',
    },
    statValue: {
      color: '#f5f5f0',
      fontWeight: '700',
      fontSize: '16px',
    },
  };
  
  const totalPoints = army.reduce((sum, unit) => sum + unit.points, 0);
  const pointLimit = 6000;
  const isOverLimit = totalPoints > pointLimit;
  
  const filteredUnits = UNITS_DATA.filter(unit => {
    const matchesFaction = unit.faction === selectedFaction || unit.faction === 'Mercenary';
    const matchesSearch = unit.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         unit.keywords.some(k => k.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesFaction && matchesSearch;
  });
  
  const handleAddUnit = (unit) => {
    setArmy([...army, { ...unit, instanceId: Date.now() }]);
  };
  
  const handleRemoveUnit = (instanceId) => {
    setArmy(army.filter(u => u.instanceId !== instanceId));
  };
  
  return (
    <div style={tacticalStyles.container}>
      {/* Left Sidebar */}
      <div style={tacticalStyles.sidebar}>
        <div style={tacticalStyles.sidebarHeader}>
          <div style={tacticalStyles.title}>Available Units</div>
          <input 
            type="text"
            style={tacticalStyles.searchBox}
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <div style={tacticalStyles.factionTabs}>
            <div 
              style={{...tacticalStyles.factionTab, ...(selectedFaction === 'Good' ? tacticalStyles.factionTabActive : {})}}
              onClick={() => setSelectedFaction('Good')}
            >
              Good
            </div>
            <div 
              style={{...tacticalStyles.factionTab, ...(selectedFaction === 'Evil' ? tacticalStyles.factionTabActive : {})}}
              onClick={() => setSelectedFaction('Evil')}
            >
              Evil
            </div>
          </div>
        </div>
        
        <div style={tacticalStyles.unitList}>
          {filteredUnits.map(unit => (
            <div 
              key={unit.id}
              style={tacticalStyles.unitItem}
              onClick={() => handleAddUnit(unit)}
              onMouseEnter={() => setHoveredUnit(unit)}
              onMouseLeave={() => setHoveredUnit(null)}
            >
              <div style={tacticalStyles.unitName}>{unit.name}</div>
              <div style={tacticalStyles.unitMeta}>
                {unit.race} {unit.type} • {unit.points} pts
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Main Area */}
      <div style={tacticalStyles.mainArea}>
        <div style={tacticalStyles.topBar}>
          <div>
            <div style={tacticalStyles.armyName}>⚔️ My Army</div>
            <div style={{fontSize: '12px', color: '#999', marginTop: '4px'}}>
              {army.length} units deployed
            </div>
          </div>
          
          <div style={tacticalStyles.pointsBar}>
            <div>
              <div style={tacticalStyles.pointsLabel}>Total Points</div>
              <div style={{...tacticalStyles.pointsValue, color: isOverLimit ? '#d32f2f' : '#f5f5f0'}}>
                {totalPoints} / {pointLimit}
              </div>
            </div>
            <div style={tacticalStyles.progressContainer}>
              <div style={tacticalStyles.progressBar}>
                <div 
                  style={{
                    ...tacticalStyles.progressFill,
                    width: `${Math.min((totalPoints / pointLimit) * 100, 100)}%`,
                    background: isOverLimit ? '#d32f2f' : '#8b2635',
                  }}
                />
              </div>
              <div style={{fontSize: '11px', color: '#999', marginTop: '4px', textAlign: 'right'}}>
                {pointLimit - totalPoints} pts remaining
              </div>
            </div>
          </div>
        </div>
        
        <div style={tacticalStyles.gridArea}>
          {army.length === 0 ? (
            <div style={tacticalStyles.emptyState}>
              <div style={tacticalStyles.emptyIcon}>⚔️</div>
              <div style={tacticalStyles.emptyText}>Click units from the sidebar to add them</div>
            </div>
          ) : (
            <div style={tacticalStyles.tableContainer}>
              <table style={tacticalStyles.table}>
                <thead>
                  <tr>
                    <th style={tacticalStyles.th}>Unit</th>
                    <th style={{...tacticalStyles.th, textAlign: 'center'}}>M</th>
                    <th style={{...tacticalStyles.th, textAlign: 'center'}}>Me</th>
                    <th style={{...tacticalStyles.th, textAlign: 'center'}}>Ra</th>
                    <th style={{...tacticalStyles.th, textAlign: 'center'}}>D</th>
                    <th style={{...tacticalStyles.th, textAlign: 'center'}}>Mo</th>
                    <th style={{...tacticalStyles.th, textAlign: 'center'}}>W</th>
                    <th style={{...tacticalStyles.th, textAlign: 'center'}}>Points</th>
                    <th style={{...tacticalStyles.th, textAlign: 'right'}}></th>
                  </tr>
                </thead>
                <tbody>
                  {army.map(unit => (
                    <tr key={unit.instanceId}>
                      <td style={tacticalStyles.td}>
                        <div style={tacticalStyles.tdName}>{unit.name}</div>
                        <div style={{fontSize: '11px', color: '#666', marginTop: '2px'}}>
                          {unit.race} {unit.type}
                        </div>
                      </td>
                      <td style={{...tacticalStyles.td, ...tacticalStyles.statCell}}>{unit.stats.movement}</td>
                      <td style={{...tacticalStyles.td, ...tacticalStyles.statCell}}>{unit.stats.melee}</td>
                      <td style={{...tacticalStyles.td, ...tacticalStyles.statCell}}>{unit.stats.ranged}</td>
                      <td style={{...tacticalStyles.td, ...tacticalStyles.statCell}}>{unit.stats.defence}</td>
                      <td style={{...tacticalStyles.td, ...tacticalStyles.statCell}}>{unit.stats.morale}</td>
                      <td style={{...tacticalStyles.td, ...tacticalStyles.statCell}}>{unit.stats.wounds}</td>
                      <td style={{...tacticalStyles.td, ...tacticalStyles.statCell, color: '#8b2635', fontWeight: '700'}}>
                        {unit.points}
                      </td>
                      <td style={{...tacticalStyles.td, ...tacticalStyles.actionCell}}>
                        <button 
                          style={tacticalStyles.removeBtn}
                          onClick={() => handleRemoveUnit(unit.instanceId)}
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { ArmyBuilderTactical });
