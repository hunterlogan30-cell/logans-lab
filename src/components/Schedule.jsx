import { useState } from 'react'
import { useStorage } from '../hooks/useStorage'
import Modal from './Modal'
import { inputStyle, labelStyle, btnPrimary, btnSecondary } from './Input'

const glass = {
  background: 'rgba(255,255,255,0.1)',
  border: '1px solid rgba(255,255,255,0.2)',
  borderRadius: '24px',
}

const iconBg = {
  background: 'linear-gradient(135deg, #6366F1 0%, #4F46E5 100%)',
  borderRadius: '14px', width: '40px', height: '40px', flexShrink: 0,
  display: 'flex', alignItems: 'center', justifyContent: 'center',
}

const TAGS = ['Energy', 'Spirit', 'Focus', 'Recovery', 'Fitness', 'Mind', 'Other']

const TagIcon = ({ tag }) => {
  const icons = {
    Energy: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>,
    Spirit: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22c0 0-8-4.5-8-11a8 8 0 0 1 16 0c0 6.5-8 11-8 11z"/><circle cx="12" cy="11" r="2" fill="white" stroke="none"/></svg>,
    Focus: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>,
    Recovery: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>,
    Fitness: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 4v16M18 4v16M3 8h3M18 8h3M3 16h3M18 16h3M6 12h12"/></svg>,
    Mind: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>,
    Other: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>,
  }
  return icons[tag] || icons.Other
}

const defaultBlocks = [
  { id: 1, time: '06:00', name: 'Morning sunlight + walk', tag: 'Energy', duration: '20', done: false },
  { id: 2, time: '07:00', name: 'Meditation', tag: 'Spirit', duration: '15', done: false },
  { id: 3, time: '08:00', name: 'Deep work block #1', tag: 'Focus', duration: '90', done: false },
  { id: 4, time: '10:00', name: 'Cold plunge / shower', tag: 'Recovery', duration: '10', done: false },
  { id: 5, time: '12:00', name: 'Workout', tag: 'Fitness', duration: '60', done: false },
  { id: 6, time: '14:00', name: 'Deep work block #2', tag: 'Focus', duration: '90', done: false },
  { id: 7, time: '17:00', name: 'Read / learn', tag: 'Mind', duration: '30', done: false },
  { id: 8, time: '20:00', name: 'Journal', tag: 'Spirit', duration: '15', done: false },
  { id: 9, time: '21:00', name: 'Wind-down / no screens', tag: 'Recovery', duration: '60', done: false },
  { id: 10, time: '22:00', name: 'Sleep', tag: 'Recovery', duration: '480', done: false },
]

const fmt = (t) => {
  const [h, m] = t.split(':')
  const hr = parseInt(h)
  return `${hr % 12 || 12}:${m} ${hr < 12 ? 'AM' : 'PM'}`
}

const fmtDur = (min) => {
  const m = parseInt(min)
  if (m >= 60) return `${Math.floor(m / 60)}h${m % 60 ? ` ${m % 60}m` : ''}`
  return `${m} min`
}

export default function Schedule() {
  const [blocks, setBlocks] = useStorage('schedule_blocks', defaultBlocks)
  const [filter, setFilter] = useState('All')
  const [showAdd, setShowAdd] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({ time: '', name: '', tag: 'Focus', duration: '' })

  const toggle = (id) => setBlocks(b => b.map(x => x.id === id ? { ...x, done: !x.done } : x))
  const done = blocks.filter(b => b.done).length
  const pct = Math.round((done / blocks.length) * 100)
  const sorted = [...blocks].sort((a, b) => a.time.localeCompare(b.time))
  const filtered = filter === 'All' ? sorted : sorted.filter(b => b.tag === filter)

  const openAdd = () => {
    setEditing(null)
    setForm({ time: '', name: '', tag: 'Focus', duration: '' })
    setShowAdd(true)
  }

  const openEdit = (e, b) => {
    e.stopPropagation()
    setEditing(b.id)
    setForm({ time: b.time, name: b.name, tag: b.tag, duration: b.duration })
    setShowAdd(true)
  }

  const save = () => {
    if (!form.name.trim() || !form.time) return
    if (editing) {
      setBlocks(b => b.map(x => x.id === editing ? { ...x, ...form } : x))
    } else {
      setBlocks(b => [...b, { ...form, id: Date.now(), done: false }])
    }
    setShowAdd(false)
  }

  const remove = () => {
    setBlocks(b => b.filter(x => x.id !== editing))
    setShowAdd(false)
  }

  const resetDay = () => setBlocks(b => b.map(x => ({ ...x, done: false })))

  return (
    <div style={{ padding: '48px 16px 16px', display: 'flex', flexDirection: 'column', gap: '20px' }}>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: '700' }}>Schedule</h1>
          <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.7)', marginTop: '4px' }}>
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <button onClick={openAdd} style={{
          width: '36px', height: '36px', borderRadius: '50%',
          background: 'linear-gradient(135deg, #6366F1, #4F46E5)',
          border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
        </button>
      </div>

      {/* Progress */}
      <div style={{ ...glass, padding: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
          <span style={{ fontSize: '14px', color: 'rgba(255,255,255,0.7)' }}>Daily progress</span>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <button onClick={resetDay} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '11px', color: 'rgba(255,255,255,0.35)', fontFamily: 'Inter, sans-serif' }}>Reset</button>
            <span style={{ fontSize: '14px', fontWeight: '600' }}>{done}/{blocks.length}</span>
          </div>
        </div>
        <div style={{ height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${pct}%`, background: 'linear-gradient(90deg, #6366F1, #10B981)', borderRadius: '3px', transition: 'width 0.4s' }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px' }}>
          <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}>
            {pct === 100 ? 'All done — great work.' : pct > 50 ? 'More than halfway.' : 'Keep going.'}
          </span>
          <span style={{ fontSize: '12px', fontWeight: '600', color: '#10B981' }}>{pct}%</span>
        </div>
      </div>

      {/* Filter */}
      <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
        {['All', ...TAGS].map(t => (
          <button key={t} onClick={() => setFilter(t)} style={{
            flexShrink: 0, padding: '6px 14px', borderRadius: '20px',
            border: filter === t ? 'none' : '1px solid rgba(255,255,255,0.2)',
            background: filter === t ? '#fff' : 'rgba(255,255,255,0.08)',
            color: filter === t ? '#1a1a2e' : 'rgba(255,255,255,0.7)',
            fontSize: '12px', fontWeight: '500', cursor: 'pointer', fontFamily: 'Inter, sans-serif',
          }}>{t}</button>
        ))}
      </div>

      {/* Blocks */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {filtered.map(b => (
          <div key={b.id} style={{
            display: 'flex', alignItems: 'center', gap: '14px',
            padding: '14px 16px', borderRadius: '20px', cursor: 'pointer',
            background: b.done ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.1)',
            border: `1px solid ${b.done ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.2)'}`,
            opacity: b.done ? 0.5 : 1, transition: 'all 0.2s',
          }}>
            <div onClick={() => toggle(b.id)} style={{ ...iconBg }}>
              <TagIcon tag={b.tag} />
            </div>
            <div onClick={() => toggle(b.id)} style={{ flex: 1, minWidth: 0 }}>
              <p style={{
                fontSize: '14px', fontWeight: '500',
                textDecoration: b.done ? 'line-through' : 'none',
                color: b.done ? 'rgba(255,255,255,0.4)' : '#fff',
                whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
              }}>{b.name}</p>
              <div style={{ display: 'flex', gap: '8px', marginTop: '3px', alignItems: 'center' }}>
                <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}>{fmt(b.time)}</span>
                <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.25)' }}>·</span>
                <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}>{fmtDur(b.duration)}</span>
                <span style={{ fontSize: '10px', padding: '2px 8px', borderRadius: '20px', background: 'rgba(99,102,241,0.25)', color: 'rgba(199,200,255,0.9)', fontWeight: '500' }}>{b.tag}</span>
              </div>
            </div>
            <button onClick={(e) => openEdit(e, b)} style={{
              background: 'none', border: 'none', cursor: 'pointer', padding: '4px',
              color: 'rgba(255,255,255,0.3)', display: 'flex', alignItems: 'center',
            }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
              </svg>
            </button>
            <div onClick={() => toggle(b.id)} style={{
              width: '24px', height: '24px', borderRadius: '50%', flexShrink: 0,
              background: b.done ? '#10B981' : 'rgba(255,255,255,0.1)',
              border: `2px solid ${b.done ? '#10B981' : 'rgba(255,255,255,0.2)'}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s',
            }}>
              {b.done && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>}
            </div>
          </div>
        ))}

        
      </div>

      {/* Modal */}
      {showAdd && (
        <Modal title={editing ? 'Edit block' : 'Add block'} onClose={() => setShowAdd(false)}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <label style={labelStyle}>Name</label>
              <input style={inputStyle} placeholder="e.g. Morning run" value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={labelStyle}>Time</label>
                <input style={inputStyle} type="time" value={form.time}
                  onChange={e => setForm(f => ({ ...f, time: e.target.value }))} />
              </div>
              <div>
                <label style={labelStyle}>Duration (min)</label>
                <input style={inputStyle} type="number" placeholder="30" value={form.duration}
                  onChange={e => setForm(f => ({ ...f, duration: e.target.value }))} />
              </div>
            </div>
            <div>
              <label style={labelStyle}>Category</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {TAGS.map(t => (
                  <button key={t} onClick={() => setForm(f => ({ ...f, tag: t }))} style={{
                    padding: '6px 14px', borderRadius: '20px', cursor: 'pointer',
                    background: form.tag === t ? 'rgba(99,102,241,0.4)' : 'rgba(255,255,255,0.08)',
                    border: `1px solid ${form.tag === t ? 'rgba(99,102,241,0.6)' : 'rgba(255,255,255,0.15)'}`,
                    color: form.tag === t ? '#fff' : 'rgba(255,255,255,0.6)',
                    fontSize: '12px', fontFamily: 'Inter, sans-serif',
                  }}>{t}</button>
                ))}
              </div>
            </div>
            <button onClick={save} style={{ ...btnPrimary, marginTop: '4px' }}>
              {editing ? 'Save changes' : 'Add block'}
            </button>
            {editing && (
              <button onClick={remove} style={{
                ...btnSecondary, color: 'rgba(255,100,100,0.8)',
                border: '1px solid rgba(255,100,100,0.2)',
              }}>Delete block</button>
            )}
          </div>
        </Modal>
      )}
    </div>
  )
}