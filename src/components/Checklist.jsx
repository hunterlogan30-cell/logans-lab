import { useState } from 'react'

const defaultItems = [
  { id: 1, label: 'Drink 1L water before noon', checked: false },
  { id: 2, label: 'Journal — 3 things grateful for', checked: false },
  { id: 3, label: 'No phone first 30 min of day', checked: false },
  { id: 4, label: 'Read 20 pages', checked: false },
  { id: 5, label: 'Log HRV in Whoop', checked: false },
  { id: 6, label: 'Take supplements', checked: false },
]

export default function Checklist() {
  const [items, setItems] = useState(defaultItems)

  const toggle = (id) => setItems(items.map(i => i.id === id ? { ...i, checked: !i.checked } : i))
  const done = items.filter(i => i.checked).length
  const pct = Math.round((done / items.length) * 100)

  return (
    <div style={{ padding: '56px 20px 20px' }}>
      <h1 style={{ fontSize: '26px', fontWeight: '600', marginBottom: '4px' }}>Daily checklist</h1>
      <p style={{ color: '#888', fontSize: '13px', marginBottom: '24px' }}>{done} of {items.length} complete</p>

      <div style={{ height: '3px', background: '#222', borderRadius: '2px', marginBottom: '24px' }}>
        <div style={{ height: '100%', width: `${pct}%`, background: '#10B981', borderRadius: '2px', transition: 'width 0.3s' }} />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {items.map(item => (
          <div key={item.id} onClick={() => toggle(item.id)} style={{
            display: 'flex', alignItems: 'center', gap: '14px',
            padding: '16px', borderRadius: '14px',
            background: item.checked ? '#111' : '#1a1a1a',
            border: `1px solid ${item.checked ? '#1a1a1a' : '#2a2a2a'}`,
            cursor: 'pointer', opacity: item.checked ? 0.5 : 1, transition: 'all 0.2s'
          }}>
            <div style={{
              width: '22px', height: '22px', borderRadius: '6px', flexShrink: 0,
              background: item.checked ? '#10B981' : 'transparent',
              border: `2px solid ${item.checked ? '#10B981' : '#444'}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '13px', transition: 'all 0.2s'
            }}>
              {item.checked && '✓'}
            </div>
            <span style={{
              fontSize: '15px', fontWeight: '400',
              textDecoration: item.checked ? 'line-through' : 'none',
              color: item.checked ? '#555' : '#f0f0f0'
            }}>{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}