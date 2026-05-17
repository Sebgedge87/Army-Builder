import { useState } from 'react'
import AppShell from '../components/shell/AppShell'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import Select from '../components/ui/Select'
import Tag from '../components/ui/Tag'
import Stat from '../components/ui/Stat'
import Card from '../components/ui/Card'
import Modal from '../components/ui/Modal'
import Toast from '../components/ui/Toast'

const COLORS = [
  { name: '--color-bg-base',    label: 'BG Base'     },
  { name: '--color-bg-surface', label: 'BG Surface'  },
  { name: '--color-bg-hover',   label: 'BG Hover'    },
  { name: '--color-border',     label: 'Border'      },
  { name: '--color-accent',     label: 'Accent'      },
]

export default function StylePage() {
  const [modalOpen, setModalOpen]   = useState(false)
  const [toast, setToast]           = useState(null)
  const [inputVal, setInputVal]     = useState('')
  const [selectVal, setSelectVal]   = useState('cavalry')

  return (
    <AppShell>
      <div style={{ flex: 1, overflowY: 'auto', padding: 'var(--space-6)' }}>
        <h1 style={{ fontSize: 'var(--font-size-xl)', fontWeight: 700, marginBottom: 'var(--space-1)' }}>
          Style Guide
        </h1>
        <p style={{ color: 'var(--color-text-secondary)', marginBottom: 'var(--space-6)' }}>
          Every UI primitive in one place — Phase 1 design system.
        </p>

        {/* Colors */}
        <Section title="Colors">
          <div style={{ display: 'flex', gap: 'var(--space-3)', flexWrap: 'wrap' }}>
            {COLORS.map(c => (
              <div key={c.name} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--space-1)' }}>
                <div style={{ width: 64, height: 64, background: `var(${c.name})`, border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)' }} />
                <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>{c.label}</span>
              </div>
            ))}
          </div>
        </Section>

        {/* Typography */}
        <Section title="Typography">
          {[
            { label: 'XL — 24px bold',  style: { fontSize: 'var(--font-size-xl)', fontWeight: 700 } },
            { label: 'LG — 18px bold',  style: { fontSize: 'var(--font-size-lg)', fontWeight: 700 } },
            { label: 'MD — 14px',       style: { fontSize: 'var(--font-size-md)' } },
            { label: 'Base — 13px',     style: { fontSize: 'var(--font-size-base)' } },
            { label: 'SM — 11px',       style: { fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' } },
            { label: 'XS — 9px caps',   style: { fontSize: 'var(--font-size-xs)', textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--color-text-secondary)' } },
          ].map(t => (
            <div key={t.label} style={t.style}>{t.label}</div>
          ))}
        </Section>

        {/* Buttons */}
        <Section title="Buttons">
          <div style={{ display: 'flex', gap: 'var(--space-3)', flexWrap: 'wrap', alignItems: 'center', marginBottom: 'var(--space-3)' }}>
            {['primary', 'secondary', 'ghost', 'danger'].map(v => (
              <Button key={v} variant={v}>{v.charAt(0).toUpperCase() + v.slice(1)}</Button>
            ))}
            <Button disabled>Disabled</Button>
          </div>
          <div style={{ display: 'flex', gap: 'var(--space-3)', flexWrap: 'wrap', alignItems: 'center' }}>
            {['sm', 'md', 'lg'].map(s => (
              <Button key={s} size={s}>Size {s}</Button>
            ))}
          </div>
        </Section>

        {/* Form controls */}
        <Section title="Form Controls">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)', maxWidth: 400 }}>
            <Input
              label="Unit name"
              placeholder="Search…"
              value={inputVal}
              onChange={e => setInputVal(e.target.value)}
            />
            <Select
              label="Unit type"
              value={selectVal}
              onChange={setSelectVal}
              options={[
                { value: 'cavalry', label: 'Cavalry' },
                { value: 'infantry', label: 'Infantry' },
                { value: 'hero', label: 'Hero' },
              ]}
            />
          </div>
        </Section>

        {/* Tags */}
        <Section title="Tags">
          <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
            <Tag>Infantry</Tag>
            <Tag>Cavalry</Tag>
            <Tag>Orcs</Tag>
            <Tag accent>Evil</Tag>
            <Tag accent>Good</Tag>
            <Tag>Mercenary</Tag>
          </div>
        </Section>

        {/* Stats */}
        <Section title="Stats">
          <div style={{ display: 'flex', gap: 'var(--space-4)', flexWrap: 'wrap', padding: 'var(--space-4)', background: 'var(--color-bg-surface)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
            {[['MOV', 7], ['MEL', 4], ['RNG', 10], ['DEF', 6], ['MOR', 6], ['WND', 2]].map(([l, v]) => (
              <Stat key={l} label={l} value={v} size="lg" />
            ))}
          </div>
          <div style={{ display: 'flex', gap: 'var(--space-4)', flexWrap: 'wrap', marginTop: 'var(--space-3)' }}>
            {[['MOV', 7], ['MEL', 4], ['RNG', 10], ['DEF', 6], ['MOR', 6], ['WND', 2]].map(([l, v]) => (
              <Stat key={l} label={l} value={v} />
            ))}
          </div>
        </Section>

        {/* Cards */}
        <Section title="Cards">
          <div style={{ display: 'flex', gap: 'var(--space-3)', flexWrap: 'wrap' }}>
            <Card style={{ padding: 'var(--space-4)', width: 200 }}>
              <div style={{ fontWeight: 600, marginBottom: 'var(--space-1)' }}>Basic Card</div>
              <div style={{ fontSize: 'var(--font-size-base)', color: 'var(--color-text-secondary)' }}>Card content goes here</div>
            </Card>
            <Card style={{ padding: 'var(--space-4)', width: 200, borderColor: 'var(--color-accent)' }}>
              <div style={{ fontWeight: 600, marginBottom: 'var(--space-1)' }}>Accent Border</div>
              <div style={{ fontSize: 'var(--font-size-base)', color: 'var(--color-text-secondary)' }}>Selected state</div>
            </Card>
          </div>
        </Section>

        {/* Modal */}
        <Section title="Modal">
          <Button onClick={() => setModalOpen(true)}>Open Modal</Button>
          <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Example Modal">
            <p style={{ color: 'var(--color-text-secondary)', marginBottom: 'var(--space-4)' }}>
              This is a modal dialog. Click outside or the ✕ button to close.
            </p>
            <Button onClick={() => setModalOpen(false)}>Close</Button>
          </Modal>
        </Section>

        {/* Toast */}
        <Section title="Toast">
          <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
            {['info', 'success', 'error', 'warning'].map(t => (
              <Button key={t} variant="secondary" size="sm" onClick={() => setToast({ message: `${t.charAt(0).toUpperCase() + t.slice(1)} toast message`, type: t })}>
                {t}
              </Button>
            ))}
          </div>
          {toast && (
            <Toast
              message={toast.message}
              type={toast.type}
              onClose={() => setToast(null)}
            />
          )}
        </Section>
      </div>
    </AppShell>
  )
}

function Section({ title, children }) {
  return (
    <div style={{ marginBottom: 'var(--space-6)' }}>
      <h2
        style={{
          fontSize: 'var(--font-size-base)',
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '1px',
          color: 'var(--color-text-secondary)',
          marginBottom: 'var(--space-4)',
          paddingBottom: 'var(--space-2)',
          borderBottom: '1px solid var(--color-border)',
        }}
      >
        {title}
      </h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
        {children}
      </div>
    </div>
  )
}
