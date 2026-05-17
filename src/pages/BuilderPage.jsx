import { useState, useMemo } from 'react'
import { useParams } from 'react-router-dom'
import AppShell from '../components/shell/AppShell'
import TopBar from '../components/shell/TopBar'
import UnitBrowser from '../components/builder/UnitBrowser'
import UnitDetail, { EmptyDetail } from '../components/builder/UnitDetail'
import ArmyList from '../components/builder/ArmyList'
import { useUnits } from '../hooks/useUnits'
import { useDebounce } from '../hooks/useDebounce'
import { useArmy } from '../hooks/useArmy'

const POINT_LIMIT = 6000

export default function BuilderPage() {
  const { armyId }                      = useParams()
  const { units, loading: unitsLoading, error: unitsError } = useUnits()

  const {
    name, setName,
    faction, setFaction,
    entries,
    loading: armyLoading,
    saving,
    addUnit, removeUnit, attachUnit, detachUnit, save,
    validation, totalPoints,
  } = useArmy(armyId, units)

  const [search, setSearch]             = useState('')
  const [selectedRace, setSelectedRace] = useState('All')
  const [selectedType, setSelectedType] = useState('All')
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

  if (armyLoading && armyId) {
    return (
      <AppShell>
        <TopBar />
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-secondary)' }}>
          Loading army…
        </div>
      </AppShell>
    )
  }

  return (
    <AppShell>
      <TopBar />
      {unitsError && (
        <div style={{
          padding: 'var(--space-2) var(--space-4)',
          background: '#2a1f00',
          borderBottom: '1px solid #5a4000',
          fontSize: 'var(--font-size-sm)',
          color: '#c8a040',
        }}>
          {unitsError}
        </div>
      )}
      <div style={{
        flex: 1,
        display: 'grid',
        gridTemplateColumns: '360px 1fr 340px',
        gap: '1px',
        overflow: 'hidden',
        background: 'var(--color-border)',
      }}>
        {/* Left: unit browser */}
        <UnitBrowser
          units={filteredUnits}
          loading={unitsLoading}
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
          onAddUnit={unit => { addUnit(unit); setSelectedUnit(unit) }}
          onSelectUnit={setSelectedUnit}
        />

        {/* Centre: unit detail */}
        <div style={{ background: 'var(--color-bg-base)', display: 'flex', flexDirection: 'column', overflow: 'auto' }}>
          {selectedUnit ? <UnitDetail unit={selectedUnit} /> : <EmptyDetail />}
        </div>

        {/* Right: army list */}
        <ArmyList
          name={name}
          onNameChange={setName}
          entries={entries}
          onRemoveUnit={removeUnit}
          onAttachUnit={attachUnit}
          onDetachUnit={detachUnit}
          totalPoints={totalPoints}
          pointLimit={POINT_LIMIT}
          validation={validation}
          saving={saving}
          onSave={save}
        />
      </div>
    </AppShell>
  )
}
