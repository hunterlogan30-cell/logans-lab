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

export default function Schedule() {
  const [view, setView] = useState('today') // 'today' | 'templates' | 'pattern'
  const [blocks, setBlocks] = useState([])
  const [templates, setTemplates] = useState([])
  const [pattern, setPattern] = useState({})
  const [filter, setFilter] = useState('All')
  const [loading, setLoading] = useState(true)
  const [showAdd, setShowAdd] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({ time: '', name: '', tag: 'Focus', duration: '' })

  // Template editing state
  const [selectedTemplate, setSelectedTemplate] = useState(null)
  const [templateBlocks, setTemplateBlocks] = useState([])
  const [showTemplateModal, setShowTemplateModal] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState(null)
  const [templateForm, setTemplateForm] = useState({ name: '' })
  const [showTemplateBlockModal, setShowTemplateBlockModal] = useState(false)
  const [editingTemplateBlock, setEditingTemplateBlock] = useState(null)
  const [templateBlockForm, setTemplateBlockForm] = useState({ time: '', name: '', tag: 'Focus', duration: '' })

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
    setTemplateBlocks(data || [])
  }

  // Load today from a template
  const loadTemplate = async (templateId) => {
    const { data: tblocks } = await supabase.from('schedule_template_blocks').select('*').eq('template_id', templateId).order('time')
    if (!tblocks?.length) return
    // Delete existing today blocks and insert fresh ones
    await supabase.from('schedule_blocks').delete().eq('date', today)
    const toInsert = tblocks.map(b => ({ date: today, time: b.time, name: b.name, tag: b.tag, duration: b.duration, done: false }))
    await supabase.from('schedule_blocks').insert(toInsert)
    await loadAll()
    setView('today')
  }

  // Toggle block done
  const toggle = async (id) => {
    const block = blocks.find(b => b.id === id)
    if (!block) return
    const newDone = !block.done
    setBlocks(prev => prev.map(b => b.id === id ? { ...b, done: newDone } : b))
    await supabase.from('schedule_blocks').update({ done: newDone }).eq('id', id)
  }

  // Add/edit today's block
  const openAdd = () => { setEditing(null); setForm({ time: '', name: '', tag: 'Focus', duration: '' }); setShowAdd(true) }
  const openEdit = (e, b) => { e.stopPropagation(); setEditing(b); setForm({ time: b.time, name: b.name, tag: b.tag, duration: b.duration }); setShowAdd(true) }

  const save = async () => {
    if (!form.name.trim() || !form.time) return
    if (editing) {
      await supabase.from('schedule_blocks').update({ time: form.time, name: form.name, tag: form.tag, duration: form.duration }).eq('id', editing.id)
    } else {
      await supabase.from('schedule_blocks').insert({ date: today, ...form, done: false })
    }
    setShowAdd(false)
    loadAll()
  }

  const remove = async () => {
    await supabase.from('schedule_blocks').delete().eq('id', editing.id)
    setShowAdd(false)
    loadAll()
  }

  const resetDay = async () => {
    await supabase.from('schedule_blocks').update({ done: false }).eq('date', today)
    loadAll()
  }

  // Weekly pattern
  const setPatternDay = async (dow, templateId) => {
    setPattern(p => ({ ...p, [dow]: templateId }))
    await supabase.from('schedule_weekly_pattern').upsert({ day_of_week: dow, template_id: templateId || null })
  }

  // Template CRUD
  const openAddTemplate = () => { setEditingTemplate(null); setTemplateForm({ name: '' }); setShowTemplateModal(true) }
  const openEditTemplate = (t) => { setEditingTemplate(t); setTemplateForm({ name: t.name }); setShowTemplateModal(true) }

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
    setSelectedTemplate(null)
    setShowTemplateModal(false)
    loadAll()
  }

  // Template block CRUD
  const openAddTemplateBlock = () => { setEditingTemplateBlock(null); setTemplateBlockForm({ time: '', name: '', tag: 'Focus', duration: '' }); setShowTemplateBlockModal(true) }
  const openEditTemplateBlock = (b) => { setEditingTemplateBlock(b); setTemplateBlockForm({ time: b.time, name: b.name, tag: b.tag, duration: b.duration }); setShowTemplateBlockModal(true) }

  const saveTemplateBlock = async () => {
    if (!templateBlockForm.name.trim() || !templateBlockForm.time) return
    if (editingTemplateBlock) {
      await supabase.from('schedule_template_blocks').update(templateBlockForm).eq('id', editingTemplateBlock.id)
    } else {
      await supabase.from('schedule_template_blocks').insert({ ...templateBlockForm, template_id: selectedTemplate.id })
    }
    setShowTemplateBlockModal(false)
    loadTemplateBlocks(selectedTemplate.id)
  }

  const deleteTemplateBlock = async () => {
    await supabase.from('schedule_template_blocks').delete().eq('id', editingTemplateBlock.id)
    setShowTemplateBlockModal(false)
    loadTemplateBlocks(selectedTemplate.id)
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

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: '700' }}>Schedule</h1>
          <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.7)', marginTop: '4px' }}>
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>
        </div>
        {view === 'today' && (
          <button onClick={openAdd} style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'linear-gradient(135deg, #6366F1, #4F46E5)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          </button>
        )}
        {view === 'templates' && (
          <button onClick={openAddTemplate} style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'linear-gradient(135deg, #6366F1, #4F46E5)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
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

      {/* ── TODAY VIEW ── */}
      {view === 'today' && (
        <>
          {/* Load template button */}
          {templates.length > 0 && (
            <div style={{ ...glass, padding: '16px 20px' }}>
              <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', marginBottom: '10px' }}>Load a template for today</p>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {templates.map(t => (
                  <button key={t.id} onClick={() => loadTemplate(t.id)} style={{ padding: '8px 16px', borderRadius: '12px', cursor: 'pointer', background: 'rgba(99,102,241,0.2)', border: '1px solid rgba(99,102,241,0.4)', color: '#fff', fontSize: '13px', fontWeight: '500', fontFamily: 'Inter, sans-serif' }}>{t.name}</button>
                ))}
              </div>
            </div>
          )}

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
              <button key={t} onClick={() => setFilter(t)} style={{ flexShrink: 0, padding: '6px 14px', borderRadius: '20px', border: filter === t ? 'none' : '1px solid rgba(255,255,255,0.2)', background: filter === t ? '#fff' : 'rgba(255,255,255,0.08)', color: filter === t ? '#1a1a2e' : 'rgba(255,255,255,0.7)', fontSize: '12px', fontWeight: '500', cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>{t}</button>
            ))}
          </div>

          {/* Blocks */}
          {blocks.length === 0 ? (
            <div style={{ ...glass, padding: '32px', textAlign: 'center' }}>
              <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '14px' }}>No blocks for today.</p>
              <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '12px', marginTop: '6px' }}>Load a template or add blocks manually.</p>
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
                    <div style={{ display: 'flex', gap: '6px', marginTop: '4px', alignItems: 'center', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}>{fmt(b.time)}</span>
                      <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.25)' }}>·</span>
                      <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}>{fmtDur(b.duration)}</span>
                      <span style={{ fontSize: '10px', padding: '2px 8px', borderRadius: '20px', background: 'rgba(99,102,241,0.25)', color: 'rgba(199,200,255,0.9)', fontWeight: '500' }}>{b.tag}</span>
                    </div>
                  </div>
                  <button onClick={(e) => openEdit(e, b)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', color: 'rgba(255,255,255,0.3)', flexShrink: 0 }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                  </button>
                  <div onClick={() => toggle(b.id)} style={{ width: '24px', height: '24px', borderRadius: '50%', flexShrink: 0, cursor: 'pointer', background: b.done ? '#10B981' : 'rgba(255,255,255,0.1)', border: `2px solid ${b.done ? '#10B981' : 'rgba(255,255,255,0.2)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}>
                    {b.done && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* ── TEMPLATES VIEW ── */}
      {view === 'templates' && (
        <>
          {templates.length === 0 ? (
            <div style={{ ...glass, padding: '32px', textAlign: 'center' }}>
              <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '14px' }}>No templates yet.</p>
              <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '12px', marginTop: '6px' }}>Tap + to create your first template.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {templates.map(t => (
                <div key={t.id} style={{ ...glass, padding: '16px 20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: selectedTemplate?.id === t.id ? '14px' : '0' }}>
                    <button onClick={() => { setSelectedTemplate(t); loadTemplateBlocks(t.id) }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#fff', fontSize: '15px', fontWeight: '600', fontFamily: 'Inter, sans-serif', padding: 0, textAlign: 'left' }}>{t.name}</button>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button onClick={() => loadTemplate(t.id)} style={{ padding: '6px 14px', borderRadius: '10px', cursor: 'pointer', background: 'rgba(16,185,129,0.2)', border: '1px solid rgba(16,185,129,0.3)', color: '#10B981', fontSize: '12px', fontFamily: 'Inter, sans-serif', fontWeight: '500' }}>Use today</button>
                      <button onClick={() => openEditTemplate(t)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.3)', padding: '4px' }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                      </button>
                    </div>
                  </div>

                  {selectedTemplate?.id === t.id && (
                    <>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '10px' }}>
                        {templateBlocks.length === 0 ? (
                          <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.3)', textAlign: 'center', padding: '12px 0' }}>No blocks yet — add some below.</p>
                        ) : templateBlocks.map(b => (
                          <div key={b.id} onClick={() => openEditTemplateBlock(b)} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', borderRadius: '12px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer' }}>
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
                      <button onClick={openAddTemplateBlock} style={{ width: '100%', padding: '10px', borderRadius: '12px', cursor: 'pointer', background: 'rgba(255,255,255,0.04)', border: '1px dashed rgba(255,255,255,0.2)', color: 'rgba(255,255,255,0.4)', fontSize: '13px', fontFamily: 'Inter, sans-serif', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                        Add block to template
                      </button>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* ── WEEKLY PATTERN VIEW ── */}
      {view === 'pattern' && (
        <div style={{ ...glass, padding: '20px' }}>
          <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.6)', marginBottom: '16px' }}>Set which template runs on each day of the week.</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
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
          <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)', marginTop: '14px', textAlign: 'center' }}>The weekly pattern auto-loads your template each morning.</p>
        </div>
      )}

      {/* Today block modal */}
      {showAdd && (
        <Modal title={editing ? 'Edit block' : 'Add block'} onClose={() => setShowAdd(false)}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div><label style={labelStyle}>Name</label><input style={inputStyle} placeholder="e.g. Morning run" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} /></div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
  <div><label style={labelStyle}>Time</label><input style={inputStyle} type="time" value={form.time} onChange={e => setForm(f => ({ ...f, time: e.target.value }))} /></div>
  <div><label style={labelStyle}>Duration (min)</label><input style={inputStyle} type="number" placeholder="30" value={form.duration} onChange={e => setForm(f => ({ ...f, duration: e.target.value }))} /></div>
</div>
            <div>
              <label style={labelStyle}>Category</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {TAGS.map(t => (
                  <button key={t} onClick={() => setForm(f => ({ ...f, tag: t }))} style={{ padding: '6px 14px', borderRadius: '20px', cursor: 'pointer', background: form.tag === t ? 'rgba(99,102,241,0.4)' : 'rgba(255,255,255,0.08)', border: `1px solid ${form.tag === t ? 'rgba(99,102,241,0.6)' : 'rgba(255,255,255,0.15)'}`, color: form.tag === t ? '#fff' : 'rgba(255,255,255,0.6)', fontSize: '12px', fontFamily: 'Inter, sans-serif' }}>{t}</button>
                ))}
              </div>
            </div>
            <button onClick={save} style={{ ...btnPrimary, marginTop: '4px' }}>{editing ? 'Save changes' : 'Add block'}</button>
            {editing && <button onClick={remove} style={{ ...btnSecondary, color: 'rgba(255,100,100,0.8)', border: '1px solid rgba(255,100,100,0.2)' }}>Delete block</button>}
          </div>
        </Modal>
      )}

      {/* Template modal */}
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
      {showTemplateBlockModal && (
        <Modal title={editingTemplateBlock ? 'Edit block' : 'Add block'} onClose={() => setShowTemplateBlockModal(false)}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div><label style={labelStyle}>Name</label><input style={inputStyle} placeholder="e.g. Morning run" value={templateBlockForm.name} onChange={e => setTemplateBlockForm(f => ({ ...f, name: e.target.value }))} /></div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
  <div><label style={labelStyle}>Time</label><input style={inputStyle} type="time" value={form.time} onChange={e => setForm(f => ({ ...f, time: e.target.value }))} /></div>
  <div><label style={labelStyle}>Duration (min)</label><input style={inputStyle} type="number" placeholder="30" value={form.duration} onChange={e => setForm(f => ({ ...f, duration: e.target.value }))} /></div>
</div>
            <div>
              <label style={labelStyle}>Category</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {TAGS.map(t => (
                  <button key={t} onClick={() => setTemplateBlockForm(f => ({ ...f, tag: t }))} style={{ padding: '6px 14px', borderRadius: '20px', cursor: 'pointer', background: templateBlockForm.tag === t ? 'rgba(99,102,241,0.4)' : 'rgba(255,255,255,0.08)', border: `1px solid ${templateBlockForm.tag === t ? 'rgba(99,102,241,0.6)' : 'rgba(255,255,255,0.15)'}`, color: templateBlockForm.tag === t ? '#fff' : 'rgba(255,255,255,0.6)', fontSize: '12px', fontFamily: 'Inter, sans-serif' }}>{t}</button>
                ))}
              </div>
            </div>
            <button onClick={saveTemplateBlock} style={{ ...btnPrimary }}>{editingTemplateBlock ? 'Save changes' : 'Add block'}</button>
            {editingTemplateBlock && <button onClick={deleteTemplateBlock} style={{ ...btnSecondary, color: 'rgba(255,100,100,0.8)', border: '1px solid rgba(255,100,100,0.2)' }}>Delete block</button>}
          </div>
        </Modal>
      )}

    </div>
  )
}