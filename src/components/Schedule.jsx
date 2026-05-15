import { useState, useEffect } from 'react'
import { supabase } from '../supabase'
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

  // Today block modal
  const [showBlockModal, setShowBlockModal] = useState(false)
  const [editingBlock, setEditingBlock] = useState(null)
  const [blockForm, setBlockForm] = useState(emptyBlockForm)

  // Template state
  const [expandedTemplateId, setExpandedTemplateId] = useState(null)
  const [templateBlocks, setTemplateBlocks] = useState({})
  const [showTemplateModal, setShowTemplateModal] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState(null)
  const [templateForm, setTemplateForm] = useState({ name: '' })

  // Template block modal
  const [showTplBlockModal, setShowTplBlockModal] = useState(false)
  const [editingTplBlock, setEditingTplBlock] = useState(null)
  const [tplBlockTemplateId, setTplBlockTemplateId] = useState(null)
  const [tplBlockForm, setTplBlockForm] = useState(emptyBlockForm)
 const [wide, setWide] = useState(window.innerWidth >= 1024)

useEffect(() => {
  const handler = () => setWide(window.innerWidth >= 1024)
  window.addEventListener('resize', handler)
  return () => window.removeEventListener('resize', handler)
}, [])

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
    const { data } = await supabase
      .from('schedule_template_blocks')
      .select('*')
      .eq('template_id', templateId)
      .order('time')
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
    const { data: tblocks } = await supabase
      .from('schedule_template_blocks')
      .select('*')
      .eq('template_id', templateId)
      .order('time')
    await supabase.from('schedule_blocks').delete().eq('date', today)
    if (tblocks?.length) {
      await supabase.from('schedule_blocks').insert(
        tblocks.map(b => ({ date: today, time: b.time, name: b.name, tag: b.tag, duration: b.duration, done: false }))
      )
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

  const openAddTplBlock = (templateId) => {
    setTplBlockTemplateId(templateId)
    setEditingTplBlock(null)
    setTplBlockForm(emptyBlockForm)
    setShowTplBlockModal(true)
  }

  const openEditTplBlock = (templateId, b) => {
    setTplBlockTemplateId(templateId)
    setEditingTplBlock(b)
    setTplBlockForm({ time: b.time, name: b.name, tag: b.tag, duration: b.duration })
    setShowTplBlockModal(true)
  }

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
  <div style={{ padding: wide ? '40px 40px 24px' : '48px 16px 16px', display: 'flex', flexDirection: 'column', gap: '20px', boxSizing: 'border-box' }}>
    <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>

    {/* Header */}
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
      <div>
        <h1 style={{ fontSize: wide ? '32px' : '24px', fontWeight: '700', letterSpacing: '-0.5px' }}>Schedule</h1>
        <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.6)', marginTop: '4px' }}>
          {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
        </p>
      </div>
      {(view === 'today' || view === 'templates') && (
        <button onClick={view === 'today' ? openAddBlock : openAddTemplate} style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'linear-gradient(135deg, #6366F1, #4F46E5)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        </button>
      )}
    </div>

    {/* View switcher */}
    <div style={{ display: 'flex', gap: '8px', background: 'rgba(255,255,255,0.06)', borderRadius: '16px', padding: '4px' }}>
      {[{ id: 'today', label: 'Today' }, { id: 'templates', label: 'Templates' }, { id: 'pattern', label: 'Weekly' }].map(v => (
        <button key={v.id} onClick={() => setView(v.id)} style={{ flex: 1, padding: '10px', borderRadius: '12px', cursor: 'pointer', background: view === v.id ? 'rgba(99,102,241,0.4)' : 'transparent', border: `1px solid ${view === v.id ? 'rgba(99,102,241,0.5)' : 'transparent'}`, color: view === v.id ? '#fff' : 'rgba(255,255,255,0.5)', fontSize: '13px', fontWeight: '500', fontFamily: 'Inter, sans-serif' }}>{v.label}</button>
      ))}
    </div>

    {/* ── TODAY ── */}
    {view === 'today' && (
     <div style={{ display: wide && window.innerWidth > 1024 ? 'grid' : 'flex', gridTemplateColumns: wide && window.innerWidth > 1024 ? '1fr 340px' : undefined, flexDirection: wide && window.innerWidth > 1024 ? undefined : 'column', gap: '20px', alignItems: 'start' }}>

        {/* Left — blocks */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', minWidth: 0 }}>
          {/* Filter */}
          <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '4px' }}>
            {['All', ...TAGS].map(t => (
              <button key={t} onClick={() => setFilter(t)} style={{ flexShrink: 0, padding: '6px 14px', borderRadius: '20px', border: filter === t ? 'none' : '1px solid rgba(255,255,255,0.2)', background: filter === t ? '#fff' : 'rgba(255,255,255,0.08)', color: filter === t ? '#1a1a2e' : 'rgba(255,255,255,0.7)', fontSize: '12px', fontWeight: '500', cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>{t}</button>
            ))}
          </div>

          {blocks.length === 0 ? (
            <div style={{ ...glass, padding: '40px 32px', textAlign: 'center' }}>
              <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '15px' }}>No blocks for today.</p>
              <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '13px', marginTop: '6px' }}>Load a template or tap + to add blocks.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {filtered.map(b => (
                <div key={b.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 16px', borderRadius: '20px', background: b.done ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.1)', border: `1px solid ${b.done ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.2)'}`, opacity: b.done ? 0.5 : 1, transition: 'all 0.2s' }}>
                  <div onClick={() => toggle(b.id)} style={{ ...iconBg, cursor: 'pointer', flexShrink: 0 }}>
                    <TagIcon tag={b.tag} />
                  </div>
                  <div onClick={() => toggle(b.id)} style={{ flex: 1, minWidth: 0, cursor: 'pointer' }}>
                    <p style={{ fontSize: '14px', fontWeight: '500', textDecoration: b.done ? 'line-through' : 'none', color: b.done ? 'rgba(255,255,255,0.4)' : '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{b.name}</p>
                    <div style={{ display: 'flex', gap: '6px', marginTop: '4px', alignItems: 'center' }}>
                      <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}>{fmt(b.time)}</span>
                      <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.25)' }}>·</span>
                      <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}>{fmtDur(b.duration)}</span>
                      <span style={{ fontSize: '10px', padding: '2px 8px', borderRadius: '20px', background: 'rgba(99,102,241,0.25)', color: 'rgba(199,200,255,0.9)', fontWeight: '500' }}>{b.tag}</span>
                    </div>
                  </div>
                  <button onClick={(e) => openEditBlock(e, b)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', color: 'rgba(255,255,255,0.3)', flexShrink: 0 }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                  </button>
                  <div onClick={() => toggle(b.id)} style={{ width: '24px', height: '24px', borderRadius: '50%', flexShrink: 0, cursor: 'pointer', background: b.done ? '#10B981' : 'rgba(255,255,255,0.1)', border: `2px solid ${b.done ? '#10B981' : 'rgba(255,255,255,0.2)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}>
                    {b.done && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right — progress + template */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {/* Progress */}
          <div style={{ ...glass, padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
              <span style={{ fontSize: '14px', color: 'rgba(255,255,255,0.7)', fontWeight: '500' }}>Daily progress</span>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <button onClick={resetDay} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '11px', color: 'rgba(255,255,255,0.35)', fontFamily: 'Inter, sans-serif' }}>Reset</button>
                <span style={{ fontSize: '14px', fontWeight: '700' }}>{done}/{blocks.length}</span>
              </div>
            </div>
            <div style={{ height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${pct}%`, background: 'linear-gradient(90deg, #6366F1, #10B981)', borderRadius: '3px', transition: 'width 0.4s' }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px' }}>
              <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}>{pct === 100 ? 'All done — great work.' : pct > 50 ? 'More than halfway.' : 'Keep going.'}</span>
              <span style={{ fontSize: '12px', fontWeight: '700', color: '#10B981' }}>{pct}%</span>
            </div>
          </div>

          {/* Load template */}
          {templates.length > 0 && (
            <div style={{ ...glass, padding: '16px 20px' }}>
              <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: '500' }}>Load template</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {templates.map(t => (
                  <button key={t.id} onClick={() => loadTemplate(t.id)} style={{
                    width: '100%', padding: '10px 14px', borderRadius: '12px', cursor: 'pointer', textAlign: 'left',
                    background: selectedTodayTemplate === t.id ? 'rgba(99,102,241,0.4)' : 'rgba(99,102,241,0.15)',
                    border: `1px solid ${selectedTodayTemplate === t.id ? 'rgba(99,102,241,0.7)' : 'rgba(99,102,241,0.3)'}`,
                    color: '#fff', fontSize: '13px', fontWeight: selectedTodayTemplate === t.id ? '600' : '500',
                    fontFamily: 'Inter, sans-serif',
                  }}>{t.name}</button>
                ))}
              </div>
            </div>
          )}

          {/* Today's date summary */}
          <div style={{ ...glass, padding: '16px 20px' }}>
            <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: '500' }}>Today</p>
            <p style={{ fontSize: '22px', fontWeight: '700' }}>{new Date().toLocaleDateString('en-US', { weekday: 'long' })}</p>
            <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', marginTop: '4px' }}>{new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
            <div style={{ marginTop: '12px', display: 'flex', gap: '8px' }}>
              <div style={{ flex: 1, background: 'rgba(255,255,255,0.05)', borderRadius: '10px', padding: '10px', textAlign: 'center' }}>
                <p style={{ fontSize: '20px', fontWeight: '700' }}>{blocks.length}</p>
                <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', marginTop: '2px' }}>Total</p>
              </div>
              <div style={{ flex: 1, background: 'rgba(16,185,129,0.1)', borderRadius: '10px', padding: '10px', textAlign: 'center', border: '1px solid rgba(16,185,129,0.2)' }}>
                <p style={{ fontSize: '20px', fontWeight: '700', color: '#10B981' }}>{done}</p>
                <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', marginTop: '2px' }}>Done</p>
              </div>
              <div style={{ flex: 1, background: 'rgba(255,255,255,0.05)', borderRadius: '10px', padding: '10px', textAlign: 'center' }}>
                <p style={{ fontSize: '20px', fontWeight: '700' }}>{blocks.length - done}</p>
                <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', marginTop: '2px' }}>Left</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    )}

    {/* ── TEMPLATES ── */}
    {view === 'templates' && (
      <div style={{ display: wide ? 'grid' : 'flex', gridTemplateColumns: wide ? '1fr 1fr' : undefined, flexDirection: wide ? undefined : 'column', gap: '16px', alignItems: 'start' }}>
        {templates.length === 0 ? (
          <div style={{ ...glass, padding: '40px 32px', textAlign: 'center', gridColumn: wide ? '1 / -1' : undefined }}>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '15px' }}>No templates yet — tap + to create one.</p>
          </div>
        ) : templates.map(t => (
          <div key={t.id} style={{ ...glass, padding: '16px 20px', border: `1px solid ${expandedTemplateId === t.id ? 'rgba(99,102,241,0.5)' : 'rgba(255,255,255,0.2)'}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <button onClick={() => toggleExpanded(t.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#fff', fontSize: '15px', fontWeight: '600', fontFamily: 'Inter, sans-serif', padding: 0, textAlign: 'left', flex: 1, display: 'flex', alignItems: 'center', gap: '8px' }}>
                {t.name}
                <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.35)' }}>{expandedTemplateId === t.id ? '▲' : '▼'}</span>
              </button>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <button onClick={() => loadTemplate(t.id)} style={{ padding: '6px 14px', borderRadius: '10px', cursor: 'pointer', background: 'rgba(16,185,129,0.2)', border: '1px solid rgba(16,185,129,0.3)', color: '#10B981', fontSize: '12px', fontFamily: 'Inter, sans-serif', fontWeight: '500' }}>Use today</button>
                <button onClick={(e) => openEditTemplate(e, t)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.3)', padding: '4px' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                </button>
              </div>
            </div>
            {expandedTemplateId === t.id && (
              <div style={{ marginTop: '14px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '10px' }}>
                  {!templateBlocks[t.id] ? (
                    <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.3)', textAlign: 'center', padding: '12px 0' }}>Loading...</p>
                  ) : templateBlocks[t.id].length === 0 ? (
                    <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.3)', textAlign: 'center', padding: '12px 0' }}>No blocks yet — add some below.</p>
                  ) : templateBlocks[t.id].map(b => (
                    <div key={b.id} onClick={() => openEditTplBlock(t.id, b)} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', borderRadius: '12px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer' }}>
                      <div style={{ ...iconBg, width: '32px', height: '32px', borderRadius: '10px', flexShrink: 0 }}><TagIcon tag={b.tag} /></div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: '13px', fontWeight: '500', color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{b.name}</p>
                        <div style={{ display: 'flex', gap: '6px', marginTop: '2px', alignItems: 'center' }}>
                          <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)' }}>{fmt(b.time)}</span>
                          <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.25)' }}>·</span>
                          <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)' }}>{fmtDur(b.duration)}</span>
                          <span style={{ fontSize: '10px', padding: '2px 6px', borderRadius: '20px', background: 'rgba(99,102,241,0.25)', color: 'rgba(199,200,255,0.9)' }}>{b.tag}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <button onClick={() => openAddTplBlock(t.id)} style={{ width: '100%', padding: '10px', borderRadius: '12px', cursor: 'pointer', background: 'rgba(255,255,255,0.04)', border: '1px dashed rgba(255,255,255,0.2)', color: 'rgba(255,255,255,0.5)', fontSize: '13px', fontFamily: 'Inter, sans-serif', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
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
      <div style={{ display: wide ? 'grid' : 'block', gridTemplateColumns: wide ? '1fr 1fr' : undefined, gap: '20px', alignItems: 'start' }}>
        <div style={{ ...glass, padding: '20px' }}>
          <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.6)', marginBottom: '16px' }}>Set which template runs on each day.</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {DAYS.map((day, dow) => (
              <div key={dow} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 14px', borderRadius: '14px', background: dow === todayDow ? 'rgba(99,102,241,0.15)' : 'rgba(255,255,255,0.04)', border: `1px solid ${dow === todayDow ? 'rgba(99,102,241,0.3)' : 'rgba(255,255,255,0.08)'}` }}>
                <span style={{ fontSize: '13px', fontWeight: dow === todayDow ? '700' : '500', color: dow === todayDow ? '#fff' : 'rgba(255,255,255,0.6)', width: '32px', flexShrink: 0 }}>{day}</span>
                <div style={{ flex: 1, display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  <button onClick={() => setPatternDay(dow, null)} style={{ padding: '5px 12px', borderRadius: '10px', cursor: 'pointer', background: !pattern[dow] ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.05)', border: `1px solid ${!pattern[dow] ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.1)'}`, color: !pattern[dow] ? '#fff' : 'rgba(255,255,255,0.4)', fontSize: '11px', fontFamily: 'Inter, sans-serif' }}>None</button>
                  {templates.map(t => (
                    <button key={t.id} onClick={() => setPatternDay(dow, t.id)} style={{ padding: '5px 12px', borderRadius: '10px', cursor: 'pointer', background: pattern[dow] === t.id ? 'rgba(99,102,241,0.4)' : 'rgba(255,255,255,0.05)', border: `1px solid ${pattern[dow] === t.id ? 'rgba(99,102,241,0.6)' : 'rgba(255,255,255,0.1)'}`, color: pattern[dow] === t.id ? '#fff' : 'rgba(255,255,255,0.4)', fontSize: '11px', fontFamily: 'Inter, sans-serif' }}>{t.name}</button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
        {wide && (
          <div style={{ ...glass, padding: '20px' }}>
            <p style={{ fontSize: '14px', fontWeight: '600', marginBottom: '16px' }}>This week</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {DAYS.map((day, dow) => {
                const tmpl = templates.find(t => t.id === pattern[dow])
                return (
                  <div key={dow} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', borderRadius: '12px', background: dow === todayDow ? 'rgba(99,102,241,0.15)' : 'rgba(255,255,255,0.04)', border: `1px solid ${dow === todayDow ? 'rgba(99,102,241,0.3)' : 'rgba(255,255,255,0.08)'}` }}>
                    <span style={{ fontSize: '13px', fontWeight: dow === todayDow ? '700' : '400', color: dow === todayDow ? '#fff' : 'rgba(255,255,255,0.6)' }}>{day}</span>
                    <span style={{ fontSize: '12px', color: tmpl ? 'rgba(199,200,255,0.9)' : 'rgba(255,255,255,0.25)', background: tmpl ? 'rgba(99,102,241,0.2)' : 'transparent', padding: tmpl ? '3px 10px' : '0', borderRadius: '20px' }}>{tmpl ? tmpl.name : 'No template'}</span>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    )}

    {/* Modals — unchanged */}
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
                <button key={t} onClick={() => setBlockForm(f => ({ ...f, tag: t }))} style={{ padding: '6px 14px', borderRadius: '20px', cursor: 'pointer', background: blockForm.tag === t ? 'rgba(99,102,241,0.4)' : 'rgba(255,255,255,0.08)', border: `1px solid ${blockForm.tag === t ? 'rgba(99,102,241,0.6)' : 'rgba(255,255,255,0.15)'}`, color: blockForm.tag === t ? '#fff' : 'rgba(255,255,255,0.6)', fontSize: '12px', fontFamily: 'Inter, sans-serif' }}>{t}</button>
              ))}
            </div>
          </div>
          <button onClick={saveBlock} style={{ ...btnPrimary, marginTop: '4px' }}>{editingBlock ? 'Save changes' : 'Add block'}</button>
          {editingBlock && <button onClick={deleteBlock} style={{ ...btnSecondary, color: 'rgba(255,100,100,0.8)', border: '1px solid rgba(255,100,100,0.2)' }}>Delete block</button>}
        </div>
      </Modal>
    )}

    {showTemplateModal && (
      <Modal title={editingTemplate ? 'Edit template' : 'New template'} onClose={() => setShowTemplateModal(false)}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div><label style={labelStyle}>Template name</label><input style={inputStyle} placeholder="e.g. Training Day" value={templateForm.name} onChange={e => setTemplateForm(f => ({ ...f, name: e.target.value }))} /></div>
          <button onClick={saveTemplate} style={{ ...btnPrimary }}>{editingTemplate ? 'Save changes' : 'Create template'}</button>
          {editingTemplate && <button onClick={deleteTemplate} style={{ ...btnSecondary, color: 'rgba(255,100,100,0.8)', border: '1px solid rgba(255,100,100,0.2)' }}>Delete template</button>}
        </div>
      </Modal>
    )}

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
                <button key={t} onClick={() => setTplBlockForm(f => ({ ...f, tag: t }))} style={{ padding: '6px 14px', borderRadius: '20px', cursor: 'pointer', background: tplBlockForm.tag === t ? 'rgba(99,102,241,0.4)' : 'rgba(255,255,255,0.08)', border: `1px solid ${tplBlockForm.tag === t ? 'rgba(99,102,241,0.6)' : 'rgba(255,255,255,0.15)'}`, color: tplBlockForm.tag === t ? '#fff' : 'rgba(255,255,255,0.6)', fontSize: '12px', fontFamily: 'Inter, sans-serif' }}>{t}</button>
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
