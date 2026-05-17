import { useState, useMemo } from 'react'
import AppShell from '../components/shell/AppShell'
import TopBar from '../components/shell/TopBar'
import UnitBrowser from '../components/builder/UnitBrowser'
import UnitDetail, { EmptyDetail } from '../components/builder/UnitDetail'
import ArmyList from '../components/builder/ArmyList'
import { useUnits } from '../hooks/useUnits'
import { useDebounce } from '../hooks/useDebounce'

const POINT_LIMIT = 6000

export default function BuilderPage() {
  const { units, loading, error } = useUnits()

  const [faction, setFaction]           = useState('Evil')
  const [search, setSearch]             = useState('')
  const [selectedRace, setSelectedRace] = useState('All')
  const [selectedType, setSelectedType] = useState('All')
  const [army, setArmy]                 = useState([])
  const [selectedUnit, setSelectedUnit] = useState(null)

  const debouncedSearch = useDebounce(search, 300)

  const races = useMemo(() => {
    const r = [...new Set(units.map(u => u.race).filter(Boolean))].sort()
    return ['All', ...r]
  }, [units])

  const types = useMemo(() => {
    const t = [...new Set(units.flatMap(u => u.types ?? (u.type ? [u.type] : [])).filter(Boolean))].sort()
    return ['All', ...t]
  }, [units])

  const filteredUnits = useMemo(() =>
    units.filter(u => {
      if (u.faction !== faction && u.faction !== 'Mercenary') return false
      if (selectedRace !== 'All' && u.race !== selectedRace) return false
      if (selectedType !== 'All') {
        const uTypes = u.types ?? (u.type ? [u.type] : [])
        if (!uTypes.includes(selectedType)) return false
      }
      if (debouncedSearch && !u.name.toLowerCase().includes(debouncedSearch.toLowerCase())) return false
      return true
    }),
    [units, faction, debouncedSearch, selectedRace, selectedType]
  )

  const totalPoints = army.reduce((sum, e) => sum + (e.unit.points || 0), 0)

  function addUnit(unit) {
    setArmy(prev => [...prev, { instanceId: crypto.randomUUID(), unit }])
    setSelectedUnit(unit)
  }

  function removeUnit(instanceId) {
    setArmy(prev => prev.filter(e => e.instanceId !== instanceId))
  }

  return (
    <AppShell>
      <TopBar />
      {error && (
        <div style={{
          padding: 'var(--space-2) var(--space-4)',
          background: '#2a1f00',
          borderBottom: '1px solid #5a4000',
          fontSize: 'var(--font-size-sm)',
          color: '#c8a040',
        }}>
          {error}
        </div>
      )}
      <div
        style={{
          flex: 1,
          display: 'grid',
          gridTemplateColumns: '360px 1fr 340px',
          gap: '1px',
          overflow: 'hidden',
          background: 'var(--color-border)',
        }}
      >
        {/* Left: unit browser */}
        <UnitBrowser
          units={filteredUnits}
          loading={loading}
          faction={faction}
          onFactionChange={setFaction}
          search={search}
          onSearchChange={setSearch}
          selectedRace={selectedRace}
          onRaceChange={setSelectedRace}
          races={races}
          selectedType={selectedType}
          onTypeChange={setSelectedType}
          types={types}
          onAddUnit={addUnit}
          onSelectUnit={setSelectedUnit}
        />

        {/* Centre: unit detail */}
        <div style={{ background: 'var(--color-bg-base)', display: 'flex', flexDirection: 'column', overflow: 'auto' }}>
          {selectedUnit ? (
            <UnitDetail unit={selectedUnit} />
          ) : (
            <EmptyDetail />
          )}
        </div>

        {/* Right: army list */}
        <ArmyList
          army={army}
          onRemoveUnit={removeUnit}
          totalPoints={totalPoints}
          pointLimit={POINT_LIMIT}
        />
      </div>
    </AppShell>
  )
}
