import { useState, useEffect } from 'react'
import { supabase } from '../supabase'
import Modal from './Modal'
import { inputStyle, labelStyle, btnPrimary, btnSecondary } from './Input'

// ── Liquid Glass Design System ─────────────────────────────────────────────
const liquidGlass = {
  background: 'linear-gradient(135deg, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0.06) 100%)',
  backdropFilter: 'blur(24px) saturate(180%)',
  WebkitBackdropFilter: 'blur(24px) saturate(180%)',
  border: '1px solid rgba(255,255,255,0.25)',
  borderTop: '1px solid rgba(255,255,255,0.45)',
  borderRadius: '24px',
  boxShadow: '0 8px 32px rgba(0,0,0,0.18), inset 0 1px 0 rgba(255,255,255,0.35), inset 0 -1px 0 rgba(0,0,0,0.08)',
}

const liquidGlassCard = {
  ...liquidGlass,
  position: 'relative',
  overflow: 'hidden',
}

const frostButton = {
  background: 'linear-gradient(135deg, rgba(255,255,255,0.22) 0%, rgba(255,255,255,0.08) 100%)',
  backdropFilter: 'blur(16px) saturate(160%)',
  WebkitBackdropFilter: 'blur(16px) saturate(160%)',
  border: '1px solid rgba(255,255,255,0.3)',
  borderTop: '1px solid rgba(255,255,255,0.5)',
  borderRadius: '14px',
  boxShadow: '0 4px 16px rgba(0,0,0,0.12), inset 0 1px 0 rgba(255,255,255,0.4)',
  color: '#fff',
  fontFamily: 'Inter, sans-serif',
  cursor: 'pointer',
  transition: 'all 0.2s ease',
}

const indigoFrostButton = {
  ...frostButton,
  background: 'linear-gradient(135deg, rgba(99,102,241,0.55) 0%, rgba(79,70,229,0.35) 100%)',
  border: '1px solid rgba(99,102,241,0.5)',
  borderTop: '1px solid rgba(149,152,255,0.6)',
  boxShadow: '0 4px 16px rgba(99,102,241,0.25), inset 0 1px 0 rgba(149,152,255,0.5)',
}

const greenFrostButton = {
  ...frostButton,
  background: 'linear-gradient(135deg, rgba(16,185,129,0.45) 0%, rgba(5,150,105,0.25) 100%)',
  border: '1px solid rgba(16,185,129,0.4)',
  borderTop: '1px solid rgba(52,211,153,0.6)',
  boxShadow: '0 4px 16px rgba(16,185,129,0.2), inset 0 1px 0 rgba(52,211,153,0.4)',
  color: '#6EF0C4',
}

const iconBg = {
  background: 'linear-gradient(135deg, rgba(99,102,241,0.7) 0%, rgba(79,70,229,0.5) 100%)',
  backdropFilter: 'blur(8px)',
  WebkitBackdropFilter: 'blur(8px)',
  borderRadius: '14px',
  width: '40px', height: '40px', flexShrink: 0,
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  border: '1px solid rgba(149,152,255,0.4)',
  borderTop: '1px solid rgba(149,152,255,0.6)',
  boxShadow: '0 4px 12px rgba(99,102,241,0.3), inset 0 1px 0 rgba(255,255,255,0.3)',
}

// Shimmer overlay for glass cards
const ShimmerOverlay = () => (
  <div style={{
    position: 'absolute', inset: 0, pointerEvents: 'none', borderRadius: 'inherit',
    background: 'linear-gradient(105deg, transparent 30%, rgba(255,255,255,0.08) 50%, transparent 70%)',
    zIndex: 1,
  }} />
)

const TAGS = ['Energy', 'Spirit', 'Focus', 'Recovery', 'Fitness', 'Mind', 'Other']
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

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

const fmt = (t) => {
  const [h, m] = t.split(':')
  const hr = parseInt(h)
  return `${hr % 12 || 12}:${m} ${hr < 12 ? 'AM' : 'PM'}`
}

const fmtDur = (min) => {
  const m = parseInt(min)
  if (m >= 60) return `${Math.floor(m / 60)}h${m % 60 ? ` ${m % 60}m` : ''}`
  return `${m}m`
}

const today = new Date().toISOString().split('T')[0]
const todayDow = new Date().getDay()
const emptyBlockForm = { time: '', name: '', tag: 'Focus', duration: '' }

export default function Schedule() {
  const [view, setView] = useState('today')
  const [blocks, setBlocks] = useState([])
  const [templates, setTemplates] = useState([])
  const [pattern, setPattern] = useState({})
  const [filter, setFilter] = useState('All')
  const [loading, setLoading] = useState(true)
  const [selectedTodayTemplate, setSelectedTodayTemplate] = useState(null)

  const [showBlockModal, setShowBlockModal] = useState(false)
  const [editingBlock, setEditingBlock] = useState(null)
  const [blockForm, setBlockForm] = useState(emptyBlockForm)

  const [expandedTemplateId, setExpandedTemplateId] = useState(null)
  const [templateBlocks, setTemplateBlocks] = useState({})
  const [showTemplateModal, setShowTemplateModal] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState(null)
  const [templateForm, setTemplateForm] = useState({ name: '' })

  const [showTplBlockModal, setShowTplBlockModal] = useState(false)
  const [editingTplBlock, setEditingTplBlock] = useState(null)
  const [tplBlockTemplateId, setTplBlockTemplateId] = useState(null)
  const [tplBlockForm, setTplBlockForm] = useState(emptyBlockForm)

  useEffect(() => { loadAll() }, [])

  const loadAll = async () => {
    setLoading(true)
    const [{ data: tmpl }, { data: pat }, { data: tod }] = await Promise.all([
      supabase.from('schedule_templates').select('*').order('sort_order'),
      supabase.from('schedule_weekly_pattern').select('*'),
      supabase.from('schedule_blocks').select('*').eq('date', today).order('time'),
    ])
    setTemplates(tmpl || [])
    const patMap = {}
    pat?.forEach(p => { patMap[p.day_of_week] = p.template_id })
    setPattern(patMap)
    setBlocks(tod || [])
    setLoading(false)
  }

  const loadTemplateBlocks = async (templateId) => {
    const { data } = await supabase.from('schedule_template_blocks').select('*').eq('template_id', templateId).order('time')
    setTemplateBlocks(prev => ({ ...prev, [templateId]: data || [] }))
  }

  const toggleExpanded = (templateId) => {
    if (expandedTemplateId === templateId) {
      setExpandedTemplateId(null)
    } else {
      setExpandedTemplateId(templateId)
      loadTemplateBlocks(templateId)
    }
  }

  const loadTemplate = async (templateId) => {
    setSelectedTodayTemplate(templateId)
    const { data: tblocks } = await supabase.from('schedule_template_blocks').select('*').eq('template_id', templateId).order('time')
    await supabase.from('schedule_blocks').delete().eq('date', today)
    if (tblocks?.length) {
      await supabase.from('schedule_blocks').insert(tblocks.map(b => ({ date: today, time: b.time, name: b.name, tag: b.tag, duration: b.duration, done: false })))
    }
    await loadAll()
    setView('today')
  }

  const toggle = async (id) => {
    const block = blocks.find(b => b.id === id)
    if (!block) return
    const newDone = !block.done
    setBlocks(prev => prev.map(b => b.id === id ? { ...b, done: newDone } : b))
    await supabase.from('schedule_blocks').update({ done: newDone }).eq('id', id)
  }

  const openAddBlock = () => { setEditingBlock(null); setBlockForm(emptyBlockForm); setShowBlockModal(true) }
  const openEditBlock = (e, b) => { e.stopPropagation(); setEditingBlock(b); setBlockForm({ time: b.time, name: b.name, tag: b.tag, duration: b.duration }); setShowBlockModal(true) }

  const saveBlock = async () => {
    if (!blockForm.name.trim() || !blockForm.time) return
    if (editingBlock) {
      await supabase.from('schedule_blocks').update({ time: blockForm.time, name: blockForm.name, tag: blockForm.tag, duration: blockForm.duration }).eq('id', editingBlock.id)
    } else {
      await supabase.from('schedule_blocks').insert({ date: today, ...blockForm, done: false })
    }
    setShowBlockModal(false)
    loadAll()
  }

  const deleteBlock = async () => {
    await supabase.from('schedule_blocks').delete().eq('id', editingBlock.id)
    setShowBlockModal(false)
    loadAll()
  }

  const resetDay = async () => {
    await supabase.from('schedule_blocks').update({ done: false }).eq('date', today)
    loadAll()
  }

  const openAddTemplate = () => { setEditingTemplate(null); setTemplateForm({ name: '' }); setShowTemplateModal(true) }
  const openEditTemplate = (e, t) => { e.stopPropagation(); setEditingTemplate(t); setTemplateForm({ name: t.name }); setShowTemplateModal(true) }

  const saveTemplate = async () => {
    if (!templateForm.name.trim()) return
    if (editingTemplate) {
      await supabase.from('schedule_templates').update({ name: templateForm.name }).eq('id', editingTemplate.id)
    } else {
      await supabase.from('schedule_templates').insert({ name: templateForm.name })
    }
    setShowTemplateModal(false)
    loadAll()
  }

  const deleteTemplate = async () => {
    await supabase.from('schedule_templates').delete().eq('id', editingTemplate.id)
    setExpandedTemplateId(null)
    setShowTemplateModal(false)
    loadAll()
  }

  const openAddTplBlock = (templateId) => { setTplBlockTemplateId(templateId); setEditingTplBlock(null); setTplBlockForm(emptyBlockForm); setShowTplBlockModal(true) }
  const openEditTplBlock = (templateId, b) => { setTplBlockTemplateId(templateId); setEditingTplBlock(b); setTplBlockForm({ time: b.time, name: b.name, tag: b.tag, duration: b.duration }); setShowTplBlockModal(true) }

  const saveTplBlock = async () => {
    if (!tplBlockForm.name.trim() || !tplBlockForm.time) return
    if (editingTplBlock) {
      await supabase.from('schedule_template_blocks').update(tplBlockForm).eq('id', editingTplBlock.id)
    } else {
      await supabase.from('schedule_template_blocks').insert({ ...tplBlockForm, template_id: tplBlockTemplateId })
    }
    setShowTplBlockModal(false)
    loadTemplateBlocks(tplBlockTemplateId)
  }

  const deleteTplBlock = async () => {
    await supabase.from('schedule_template_blocks').delete().eq('id', editingTplBlock.id)
    setShowTplBlockModal(false)
    loadTemplateBlocks(tplBlockTemplateId)
  }

  const setPatternDay = async (dow, templateId) => {
    setPattern(p => ({ ...p, [dow]: templateId }))
    await supabase.from('schedule_weekly_pattern').upsert({ day_of_week: dow, template_id: templateId || null })
  }

  const sorted = [...blocks].sort((a, b) => a.time.localeCompare(b.time))
  const filtered = filter === 'All' ? sorted : sorted.filter(b => b.tag === filter)
  const done = blocks.filter(b => b.done).length
  const pct = blocks.length ? Math.round((done / blocks.length) * 100) : 0

  if (loading) return (
    <div style={{ padding: '48px 16px', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
      <p style={{ color: 'rgba(255,255,255,0.5)' }}>Loading schedule...</p>
    </div>
  )

  return (
    <div style={{ padding: '48px 16px 16px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <style>{`
        .frost-btn:active { transform: scale(0.97); opacity: 0.85; }
        .block-row:active { transform: scale(0.99); }
      `}</style>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: '700', letterSpacing: '-0.5px' }}>Schedule</h1>
          <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.6)', marginTop: '4px' }}>
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>
        </div>
        {(view === 'today' || view === 'templates') && (
          <button
            className="frost-btn"
            onClick={view === 'today' ? openAddBlock : openAddTemplate}
            style={{ ...indigoFrostButton, width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          </button>
        )}
      </div>

      {/* View switcher */}
      <div style={{ ...liquidGlass, padding: '4px', display: 'flex', gap: '4px' }}>
        {[{ id: 'today', label: 'Today' }, { id: 'templates', label: 'Templates' }, { id: 'pattern', label: 'Weekly' }].map(v => (
          <button key={v.id} onClick={() => setView(v.id)} className="frost-btn" style={{
            flex: 1, padding: '10px', borderRadius: '20px', cursor: 'pointer',
            fontFamily: 'Inter, sans-serif', fontSize: '13px', fontWeight: '500',
            transition: 'all 0.2s',
            ...(view === v.id ? indigoFrostButton : { background: 'transparent', border: '1px solid transparent', color: 'rgba(255,255,255,0.45)', boxShadow: 'none' }),
          }}>{v.label}</button>
        ))}
      </div>

      {/* ── TODAY ── */}
      {view === 'today' && (
        <>
          {templates.length > 0 && (
            <div style={{ ...liquidGlassCard, padding: '16px 20px' }}>
              <ShimmerOverlay />
              <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.45)', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: '600', position: 'relative', zIndex: 2 }}>Load template</p>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', position: 'relative', zIndex: 2 }}>
                {templates.map(t => (
                  <button key={t.id} onClick={() => loadTemplate(t.id)} className="frost-btn" style={{
                    padding: '8px 18px', borderRadius: '20px', fontSize: '13px', fontWeight: '500',
                    ...(selectedTodayTemplate === t.id
                      ? { ...indigoFrostButton, fontWeight: '600' }
                      : { ...frostButton, color: 'rgba(255,255,255,0.8)' }
                    ),
                  }}>{t.name}</button>
                ))}
              </div>
            </div>
          )}

          {/* Progress */}
          <div style={{ ...liquidGlassCard, padding: '20px' }}>
            <ShimmerOverlay />
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', position: 'relative', zIndex: 2 }}>
              <span style={{ fontSize: '14px', color: 'rgba(255,255,255,0.7)', fontWeight: '500' }}>Daily progress</span>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <button onClick={resetDay} className="frost-btn" style={{ background: 'none', border: 'none', boxShadow: 'none', backdropFilter: 'none', WebkitBackdropFilter: 'none', cursor: 'pointer', fontSize: '11px', color: 'rgba(255,255,255,0.35)', fontFamily: 'Inter, sans-serif' }}>Reset</button>
                <span style={{ fontSize: '14px', fontWeight: '700' }}>{done}/{blocks.length}</span>
              </div>
            </div>
            <div style={{ height: '7px', background: 'rgba(255,255,255,0.08)', borderRadius: '4px', overflow: 'hidden', position: 'relative', zIndex: 2, boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.2)' }}>
              <div style={{ height: '100%', width: `${pct}%`, background: 'linear-gradient(90deg, #6366F1, #10B981)', borderRadius: '4px', transition: 'width 0.5s cubic-bezier(0.4,0,0.2,1)', boxShadow: '0 0 10px rgba(99,102,241,0.5)' }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px', position: 'relative', zIndex: 2 }}>
              <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}>{pct === 100 ? 'All done — great work.' : pct > 50 ? 'More than halfway.' : 'Keep going.'}</span>
              <span style={{ fontSize: '12px', fontWeight: '700', color: '#10B981' }}>{pct}%</span>
            </div>
          </div>

          {/* Filter chips */}
          <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '4px' }}>
            {['All', ...TAGS].map(t => (
              <button key={t} onClick={() => setFilter(t)} className="frost-btn" style={{
                flexShrink: 0, padding: '6px 14px', borderRadius: '20px', fontSize: '12px', fontWeight: '500',
                ...(filter === t
                  ? { background: 'rgba(255,255,255,0.95)', border: '1px solid rgba(255,255,255,0.9)', color: '#1a1a2e', boxShadow: '0 2px 8px rgba(0,0,0,0.2)', backdropFilter: 'none', WebkitBackdropFilter: 'none' }
                  : { ...frostButton, color: 'rgba(255,255,255,0.65)', padding: '6px 14px', borderRadius: '20px' }
                ),
              }}>{t}</button>
            ))}
          </div>

          {/* Blocks */}
          {blocks.length === 0 ? (
            <div style={{ ...liquidGlassCard, padding: '40px 32px', textAlign: 'center' }}>
              <ShimmerOverlay />
              <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '15px', position: 'relative', zIndex: 2 }}>No blocks for today.</p>
              <p style={{ color: 'rgba(255,255,255,0.25)', fontSize: '13px', marginTop: '6px', position: 'relative', zIndex: 2 }}>Load a template above or tap + to add blocks.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {filtered.map(b => (
                <div key={b.id} className="block-row" style={{
                  ...liquidGlassCard,
                  display: 'flex', alignItems: 'center', gap: '12px',
                  padding: '14px 16px',
                  opacity: b.done ? 0.45 : 1,
                  transition: 'all 0.25s ease',
                  background: b.done
                    ? 'linear-gradient(135deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 100%)'
                    : 'linear-gradient(135deg, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0.06) 100%)',
                }}>
                  <ShimmerOverlay />
                  <div onClick={() => toggle(b.id)} style={{ ...iconBg, cursor: 'pointer', flexShrink: 0, position: 'relative', zIndex: 2 }}>
                    <TagIcon tag={b.tag} />
                  </div>
                  <div onClick={() => toggle(b.id)} style={{ flex: 1, minWidth: 0, cursor: 'pointer', position: 'relative', zIndex: 2 }}>
                    <p style={{ fontSize: '14px', fontWeight: '500', textDecoration: b.done ? 'line-through' : 'none', color: b.done ? 'rgba(255,255,255,0.4)' : '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{b.name}</p>
                    <div style={{ display: 'flex', gap: '6px', marginTop: '4px', alignItems: 'center', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.45)' }}>{fmt(b.time)}</span>
                      <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.2)' }}>·</span>
                      <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.45)' }}>{fmtDur(b.duration)}</span>
                      <span style={{
                        fontSize: '10px', padding: '2px 8px', borderRadius: '20px', fontWeight: '600',
                        background: 'rgba(99,102,241,0.2)', color: 'rgba(199,200,255,0.9)',
                        border: '1px solid rgba(99,102,241,0.3)',
                        backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)',
                      }}>{b.tag}</span>
                    </div>
                  </div>
                  <button onClick={(e) => openEditBlock(e, b)} className="frost-btn" style={{ ...frostButton, padding: '6px', borderRadius: '10px', color: 'rgba(255,255,255,0.4)', flexShrink: 0, position: 'relative', zIndex: 2 }}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                  </button>
                  <div onClick={() => toggle(b.id)} style={{
                    width: '26px', height: '26px', borderRadius: '50%', flexShrink: 0, cursor: 'pointer',
                    position: 'relative', zIndex: 2, transition: 'all 0.2s',
                    ...(b.done
                      ? { background: 'linear-gradient(135deg, #10B981, #059669)', border: '1px solid rgba(52,211,153,0.6)', boxShadow: '0 0 12px rgba(16,185,129,0.5), inset 0 1px 0 rgba(255,255,255,0.3)' }
                      : { ...frostButton, width: '26px', height: '26px', borderRadius: '50%', padding: 0 }
                    ),
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    {b.done && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* ── TEMPLATES ── */}
      {view === 'templates' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {templates.length === 0 ? (
            <div style={{ ...liquidGlassCard, padding: '40px 32px', textAlign: 'center' }}>
              <ShimmerOverlay />
              <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '15px', position: 'relative', zIndex: 2 }}>No templates yet — tap + to create one.</p>
            </div>
          ) : templates.map(t => (
            <div key={t.id} style={{ ...liquidGlassCard, padding: '16px 20px', border: `1px solid ${expandedTemplateId === t.id ? 'rgba(99,102,241,0.6)' : 'rgba(255,255,255,0.25)'}`, borderTop: `1px solid ${expandedTemplateId === t.id ? 'rgba(149,152,255,0.7)' : 'rgba(255,255,255,0.45)'}` }}>
              <ShimmerOverlay />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative', zIndex: 2 }}>
                <button onClick={() => toggleExpanded(t.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#fff', fontSize: '15px', fontWeight: '600', fontFamily: 'Inter, sans-serif', padding: 0, textAlign: 'left', flex: 1, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {t.name}
                  <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)' }}>{expandedTemplateId === t.id ? '▲' : '▼'}</span>
                </button>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <button onClick={() => loadTemplate(t.id)} className="frost-btn" style={{ ...greenFrostButton, padding: '6px 14px', borderRadius: '10px', fontSize: '12px', fontWeight: '600' }}>Use today</button>
                  <button onClick={(e) => openEditTemplate(e, t)} className="frost-btn" style={{ ...frostButton, padding: '6px', borderRadius: '10px', color: 'rgba(255,255,255,0.4)' }}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                  </button>
                </div>
              </div>

              {expandedTemplateId === t.id && (
                <div style={{ marginTop: '14px', position: 'relative', zIndex: 2 }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '10px' }}>
                    {!templateBlocks[t.id] ? (
                      <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.3)', textAlign: 'center', padding: '12px 0' }}>Loading...</p>
                    ) : templateBlocks[t.id].length === 0 ? (
                      <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.3)', textAlign: 'center', padding: '12px 0' }}>No blocks yet — add some below.</p>
                    ) : templateBlocks[t.id].map(b => (
                      <div key={b.id} onClick={() => openEditTplBlock(t.id, b)} style={{ ...liquidGlassCard, display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', cursor: 'pointer', borderRadius: '14px' }}>
                        <ShimmerOverlay />
                        <div style={{ ...iconBg, width: '32px', height: '32px', borderRadius: '10px', flexShrink: 0, position: 'relative', zIndex: 2 }}><TagIcon tag={b.tag} /></div>
                        <div style={{ flex: 1, minWidth: 0, position: 'relative', zIndex: 2 }}>
                          <p style={{ fontSize: '13px', fontWeight: '500', color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{b.name}</p>
                          <div style={{ display: 'flex', gap: '6px', marginTop: '2px', alignItems: 'center' }}>
                            <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.45)' }}>{fmt(b.time)}</span>
                            <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.2)' }}>·</span>
                            <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.45)' }}>{fmtDur(b.duration)}</span>
                            <span style={{ fontSize: '10px', padding: '2px 6px', borderRadius: '20px', background: 'rgba(99,102,241,0.2)', color: 'rgba(199,200,255,0.9)', border: '1px solid rgba(99,102,241,0.3)' }}>{b.tag}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <button onClick={() => openAddTplBlock(t.id)} className="frost-btn" style={{ ...frostButton, width: '100%', padding: '10px', borderRadius: '14px', fontSize: '13px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', color: 'rgba(255,255,255,0.6)', boxSizing: 'border-box', background: 'linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.03) 100%)', border: '1px dashed rgba(255,255,255,0.25)' }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                    Add block to {t.name}
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* ── WEEKLY PATTERN ── */}
      {view === 'pattern' && (
        <div style={{ ...liquidGlassCard, padding: '20px' }}>
          <ShimmerOverlay />
          <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.55)', marginBottom: '16px', position: 'relative', zIndex: 2 }}>Set which template runs on each day of the week.</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', position: 'relative', zIndex: 2 }}>
            {DAYS.map((day, dow) => (
              <div key={dow} style={{
                display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 14px', borderRadius: '16px',
                ...(dow === todayDow
                  ? { background: 'linear-gradient(135deg, rgba(99,102,241,0.25) 0%, rgba(79,70,229,0.12) 100%)', border: '1px solid rgba(99,102,241,0.4)', borderTop: '1px solid rgba(149,152,255,0.5)' }
                  : { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }
                ),
              }}>
                <span style={{ fontSize: '13px', fontWeight: dow === todayDow ? '700' : '500', color: dow === todayDow ? '#fff' : 'rgba(255,255,255,0.5)', width: '32px', flexShrink: 0 }}>{day}</span>
                <div style={{ flex: 1, display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  <button onClick={() => setPatternDay(dow, null)} className="frost-btn" style={{ ...(!pattern[dow] ? indigoFrostButton : frostButton), padding: '5px 12px', borderRadius: '10px', fontSize: '11px', color: !pattern[dow] ? '#fff' : 'rgba(255,255,255,0.4)' }}>None</button>
                  {templates.map(t => (
                    <button key={t.id} onClick={() => setPatternDay(dow, t.id)} className="frost-btn" style={{ ...(pattern[dow] === t.id ? indigoFrostButton : frostButton), padding: '5px 12px', borderRadius: '10px', fontSize: '11px', color: pattern[dow] === t.id ? '#fff' : 'rgba(255,255,255,0.4)' }}>{t.name}</button>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.25)', marginTop: '14px', textAlign: 'center', position: 'relative', zIndex: 2 }}>Weekly pattern auto-loads your template each morning.</p>
        </div>
      )}

      {/* Today block modal */}
      {showBlockModal && (
        <Modal title={editingBlock ? 'Edit block' : 'Add block'} onClose={() => setShowBlockModal(false)}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div><label style={labelStyle}>Name</label><input style={inputStyle} placeholder="e.g. Morning run" value={blockForm.name} onChange={e => setBlockForm(f => ({ ...f, name: e.target.value }))} /></div>
            <div><label style={labelStyle}>Time</label><input style={inputStyle} type="time" value={blockForm.time} onChange={e => setBlockForm(f => ({ ...f, time: e.target.value }))} /></div>
            <div><label style={labelStyle}>Duration (min)</label><input style={inputStyle} type="number" placeholder="30" value={blockForm.duration} onChange={e => setBlockForm(f => ({ ...f, duration: e.target.value }))} /></div>
            <div>
              <label style={labelStyle}>Category</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {TAGS.map(t => (
                  <button key={t} onClick={() => setBlockForm(f => ({ ...f, tag: t }))} className="frost-btn" style={{ ...(blockForm.tag === t ? indigoFrostButton : frostButton), padding: '6px 14px', borderRadius: '20px', fontSize: '12px', color: blockForm.tag === t ? '#fff' : 'rgba(255,255,255,0.6)' }}>{t}</button>
                ))}
              </div>
            </div>
            <button onClick={saveBlock} style={{ ...btnPrimary, marginTop: '4px' }}>{editingBlock ? 'Save changes' : 'Add block'}</button>
            {editingBlock && <button onClick={deleteBlock} style={{ ...btnSecondary, color: 'rgba(255,100,100,0.8)', border: '1px solid rgba(255,100,100,0.2)' }}>Delete block</button>}
          </div>
        </Modal>
      )}

      {/* Template name modal */}
      {showTemplateModal && (
        <Modal title={editingTemplate ? 'Edit template' : 'New template'} onClose={() => setShowTemplateModal(false)}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div><label style={labelStyle}>Template name</label><input style={inputStyle} placeholder="e.g. Training Day" value={templateForm.name} onChange={e => setTemplateForm(f => ({ ...f, name: e.target.value }))} /></div>
            <button onClick={saveTemplate} style={{ ...btnPrimary }}>{editingTemplate ? 'Save changes' : 'Create template'}</button>
            {editingTemplate && <button onClick={deleteTemplate} style={{ ...btnSecondary, color: 'rgba(255,100,100,0.8)', border: '1px solid rgba(255,100,100,0.2)' }}>Delete template</button>}
          </div>
        </Modal>
      )}

      {/* Template block modal */}
      {showTplBlockModal && (
        <Modal title={editingTplBlock ? 'Edit block' : 'Add block'} onClose={() => setShowTplBlockModal(false)}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div><label style={labelStyle}>Name</label><input style={inputStyle} placeholder="e.g. Morning run" value={tplBlockForm.name} onChange={e => setTplBlockForm(f => ({ ...f, name: e.target.value }))} /></div>
            <div><label style={labelStyle}>Time</label><input style={inputStyle} type="time" value={tplBlockForm.time} onChange={e => setTplBlockForm(f => ({ ...f, time: e.target.value }))} /></div>
            <div><label style={labelStyle}>Duration (min)</label><input style={inputStyle} type="number" placeholder="30" value={tplBlockForm.duration} onChange={e => setTplBlockForm(f => ({ ...f, duration: e.target.value }))} /></div>
            <div>
              <label style={labelStyle}>Category</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {TAGS.map(t => (
                  <button key={t} onClick={() => setTplBlockForm(f => ({ ...f, tag: t }))} className="frost-btn" style={{ ...(tplBlockForm.tag === t ? indigoFrostButton : frostButton), padding: '6px 14px', borderRadius: '20px', fontSize: '12px', color: tplBlockForm.tag === t ? '#fff' : 'rgba(255,255,255,0.6)' }}>{t}</button>
                ))}
              </div>
            </div>
            <button onClick={saveTplBlock} style={{ ...btnPrimary }}>{editingTplBlock ? 'Save changes' : 'Add block'}</button>
            {editingTplBlock && <button onClick={deleteTplBlock} style={{ ...btnSecondary, color: 'rgba(255,100,100,0.8)', border: '1px solid rgba(255,100,100,0.2)' }}>Delete block</button>}
          </div>
        </Modal>
      )}

    </div>
  )
}