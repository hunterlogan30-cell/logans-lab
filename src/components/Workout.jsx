import { useState, useEffect, useRef } from 'react'
import { useStorage } from '../hooks/useStorage'
import Modal from './Modal'
import { inputStyle, labelStyle, btnPrimary, btnSecondary } from './Input'

const glass = { background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '24px' }
const iconBg = { background: 'linear-gradient(135deg, #6366F1 0%, #4F46E5 100%)', borderRadius: '14px', width: '40px', height: '40px', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }

const DumbbellIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 4v16M18 4v16M3 8h3M18 8h3M3 16h3M18 16h3M6 12h12"/>
  </svg>
)
const HeartIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
  </svg>
)
const ChevronDown = ({ color = 'rgba(255,255,255,0.4)' }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 12 15 18 9"/>
  </svg>
)
const ChevronUp = ({ color = 'rgba(255,255,255,0.4)' }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="18 15 12 9 6 15"/>
  </svg>
)
const EditIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
  </svg>
)
const CheckIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
)
const PlusIcon = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
)

const defaultPrograms = [
  { id: 1, name: 'Push Day', tag: 'Strength', exercises: [
    { id: 1, name: 'Bench Press', sets: 4, reps: '8–10', weight: '185', variants: [
      { id: 11, name: 'Paused Bench Press', sets: 3, reps: '6–8', weight: '165' },
    ]},
    { id: 2, name: 'Incline Dumbbell Press', sets: 3, reps: '10–12', weight: '65', variants: [
      { id: 21, name: 'Iso Lateral Press', sets: 3, reps: '10–12', weight: '55' },
    ]},
    { id: 3, name: 'Shoulder Press', sets: 3, reps: '10–12', weight: '115', variants: [] },
    { id: 4, name: 'Lateral Raises', sets: 3, reps: '15', weight: '20', variants: [] },
    { id: 5, name: 'Tricep Pushdown', sets: 3, reps: '12–15', weight: '50', variants: [] },
  ]},
  { id: 2, name: 'Pull Day', tag: 'Strength', exercises: [
    { id: 6, name: 'Deadlift', sets: 4, reps: '5', weight: '275', variants: [] },
    { id: 7, name: 'Pull-ups', sets: 3, reps: '8–10', weight: '0', variants: [
      { id: 71, name: 'Assisted Pull-ups', sets: 3, reps: '10–12', weight: '0' },
    ]},
    { id: 8, name: 'Barbell Row', sets: 3, reps: '8–10', weight: '155', variants: [] },
    { id: 9, name: 'Face Pulls', sets: 3, reps: '15', weight: '40', variants: [] },
    { id: 10, name: 'Bicep Curls', sets: 3, reps: '12', weight: '35', variants: [
      { id: 101, name: 'Hammer Curls', sets: 3, reps: '12', weight: '30' },
    ]},
  ]},
  { id: 3, name: 'Leg Day', tag: 'Strength', exercises: [
    { id: 12, name: 'Squat', sets: 4, reps: '6–8', weight: '225', variants: [
      { id: 121, name: 'Pause Squat', sets: 3, reps: '5', weight: '185' },
    ]},
    { id: 13, name: 'Romanian Deadlift', sets: 3, reps: '10', weight: '185', variants: [] },
    { id: 14, name: 'Leg Press', sets: 3, reps: '12', weight: '360', variants: [] },
    { id: 15, name: 'Leg Curl', sets: 3, reps: '12', weight: '100', variants: [] },
    { id: 16, name: 'Calf Raises', sets: 4, reps: '15–20', weight: '135', variants: [] },
  ]},
  { id: 4, name: 'Zone 2 Cardio', tag: 'Cardio', exercises: [
    { id: 17, name: 'Incline walk / jog', sets: 1, reps: '45 min', weight: '0', variants: [] },
  ]},
]

// Retina-sharp progress chart
function ProgressChart({ data }) {
  const canvasRef = useRef(null)
  const containerRef = useRef(null)
  const dprRef = useRef(1)
  const [tooltip, setTooltip] = useState(null)
  const PAD = { L: 40, R: 12, T: 16, B: 36 }

  const getPoints = (W, H) => {
    if (!data || data.length < 2) return []
    const chartW = W - PAD.L - PAD.R
    const chartH = H - PAD.T - PAD.B
    const vals = data.map(d => parseFloat(d.value) || 0)
    const min = Math.max(0, Math.min(...vals) * 0.9)
    const max = Math.max(...vals) * 1.1 || 100
    return data.map((d, i) => ({
      x: PAD.L + (i / Math.max(data.length - 1, 1)) * chartW,
      y: PAD.T + chartH - ((vals[i] - min) / (max - min || 1)) * chartH,
      ...d, idx: i, min, max,
    }))
  }

  const setup = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const dpr = window.devicePixelRatio || 1
    dprRef.current = dpr
    const cssW = canvas.offsetWidth || 340
    const cssH = 140
    canvas.width = cssW * dpr
    canvas.height = cssH * dpr
    canvas.style.width = cssW + 'px'
    canvas.style.height = cssH + 'px'
    canvas.getContext('2d').scale(dpr, dpr)
  }

  const draw = (hiIdx = null) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const dpr = dprRef.current
    const ctx = canvas.getContext('2d')
    const W = canvas.width / dpr
    const H = canvas.height / dpr
    const chartH = H - PAD.T - PAD.B
    const pts = getPoints(W, H)
    ctx.clearRect(0, 0, W, H)
    if (pts.length < 2) return

    const vals = data.map(d => parseFloat(d.value) || 0)
    const minV = Math.max(0, Math.min(...vals) * 0.9)
    const maxV = Math.max(...vals) * 1.1 || 100

    ctx.font = '10px Inter, sans-serif'
    ctx.textAlign = 'right'
    ;[0, 0.5, 1].forEach(pct => {
      const v = Math.round(minV + pct * (maxV - minV))
      const y = PAD.T + chartH - pct * chartH
      ctx.fillStyle = 'rgba(255,255,255,0.35)'
      ctx.fillText(v, PAD.L - 5, y + 4)
      ctx.strokeStyle = 'rgba(255,255,255,0.06)'
      ctx.lineWidth = 1; ctx.setLineDash([3, 3])
      ctx.beginPath(); ctx.moveTo(PAD.L, y); ctx.lineTo(W - PAD.R, y); ctx.stroke()
      ctx.setLineDash([])
    })

    const grad = ctx.createLinearGradient(0, PAD.T, 0, PAD.T + chartH)
    grad.addColorStop(0, 'rgba(99,102,241,0.35)')
    grad.addColorStop(1, 'rgba(99,102,241,0)')
    ctx.beginPath()
    ctx.moveTo(pts[0].x, PAD.T + chartH)
    pts.forEach(p => ctx.lineTo(p.x, p.y))
    ctx.lineTo(pts[pts.length - 1].x, PAD.T + chartH)
    ctx.closePath(); ctx.fillStyle = grad; ctx.fill()

    ctx.beginPath(); ctx.strokeStyle = '#fff'; ctx.lineWidth = 2
    ctx.lineJoin = 'round'; ctx.lineCap = 'round'
    pts.forEach((p, i) => i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y))
    ctx.stroke()

    ctx.textAlign = 'center'; ctx.font = '10px Inter, sans-serif'
    pts.forEach(p => {
      ctx.fillStyle = p.idx === hiIdx ? '#fff' : 'rgba(255,255,255,0.4)'
      ctx.fillText(p.label, p.x, PAD.T + chartH + 18)
    })

    pts.forEach(p => {
      const hi = p.idx === hiIdx
      if (hi) { ctx.beginPath(); ctx.arc(p.x, p.y, 10, 0, Math.PI * 2); ctx.fillStyle = 'rgba(255,255,255,0.12)'; ctx.fill() }
      ctx.beginPath(); ctx.arc(p.x, p.y, hi ? 5 : 3, 0, Math.PI * 2)
      ctx.fillStyle = hi ? '#fff' : 'rgba(255,255,255,0.6)'; ctx.fill()
    })

    if (hiIdx !== null && pts[hiIdx]) {
      const p = pts[hiIdx]
      ctx.strokeStyle = 'rgba(255,255,255,0.25)'; ctx.lineWidth = 1; ctx.setLineDash([3, 3])
      ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(p.x, PAD.T + chartH); ctx.stroke()
      ctx.setLineDash([])
    }
  }

  useEffect(() => { setup(); draw() }, [data])

  const handleInteraction = (clientX) => {
    const canvas = canvasRef.current
    const container = containerRef.current
    if (!canvas || !container) return
    const dpr = dprRef.current
    const rect = canvas.getBoundingClientRect()
    const x = ((clientX - rect.left) / rect.width) * (canvas.width / dpr)
    const pts = getPoints(canvas.width / dpr, canvas.height / dpr)
    let closest = null, minDist = Infinity
    pts.forEach(p => { const d = Math.abs(p.x - x); if (d < minDist) { minDist = d; closest = p } })
    if (closest && minDist < 50) {
      draw(closest.idx)
      const pct = closest.x / (canvas.width / dpr)
      const containerRect = container.getBoundingClientRect()
      setTooltip({ x: (rect.left - containerRect.left) + pct * rect.width, value: closest.value, label: closest.label })
    }
  }

  return (
    <div ref={containerRef} style={{ position: 'relative', width: '100%' }}>
      {tooltip && (
        <div style={{ position: 'absolute', top: '-8px', left: tooltip.x, transform: 'translateX(-50%)', background: 'rgba(255,255,255,0.95)', color: '#1a1a2e', borderRadius: '8px', padding: '5px 10px', fontSize: '12px', fontWeight: '600', fontFamily: 'Inter, sans-serif', pointerEvents: 'none', whiteSpace: 'nowrap', zIndex: 10 }}>
          {tooltip.label}: {tooltip.value} lbs
          <div style={{ position: 'absolute', bottom: '-4px', left: '50%', transform: 'translateX(-50%)', width: 0, height: 0, borderLeft: '4px solid transparent', borderRight: '4px solid transparent', borderTop: '4px solid rgba(255,255,255,0.95)' }} />
        </div>
      )}
      <canvas ref={canvasRef} style={{ width: '100%', cursor: 'crosshair', display: 'block' }}
        onMouseMove={e => handleInteraction(e.clientX)}
        onMouseLeave={() => { draw(); setTooltip(null) }}
        onTouchStart={e => { e.preventDefault(); handleInteraction(e.touches[0].clientX) }}
        onTouchMove={e => { e.preventDefault(); handleInteraction(e.touches[0].clientX) }}
        onTouchEnd={() => { draw(); setTooltip(null) }}
      />
    </div>
  )
}

// Single exercise row — works for both top-level and variants
function ExerciseRow({ ex, isVariant = false, progId, logs, setLogs, today, lastWeek, onEdit, onAddVariant, allCharts, setAllCharts }) {
  const [expanded, setExpanded] = useState(false)
  const [variantsOpen, setVariantsOpen] = useState(false)

  const exLog = logs?.[progId]?.[today]?.[ex.id] || {}
  const lwLog = logs?.[progId]?.[lastWeek]?.[ex.id] || {}

  const setExLog = (field, value) => {
    setLogs(l => ({
      ...l,
      [progId]: {
        ...(l[progId] || {}),
        [today]: {
          ...(l[progId]?.[today] || {}),
          [ex.id]: { ...(l[progId]?.[today]?.[ex.id] || {}), [field]: value }
        }
      }
    }))
  }

  const toggleDone = () => setExLog('done', !exLog.done)

  const getChartData = () => {
    const progLogs = logs[progId] || {}
    return Object.entries(progLogs)
      .filter(([, dayLog]) => dayLog[ex.id]?.weight && parseFloat(dayLog[ex.id].weight) > 0)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-8)
      .map(([date, dayLog]) => ({
        label: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        value: dayLog[ex.id].weight,
      }))
  }

  const chartKey = `${progId}-${ex.id}`
  const isChartOpen = allCharts === chartKey

  const hasVariants = !isVariant && ex.variants && ex.variants.length > 0

  return (
    <div style={{ borderRadius: isVariant ? '14px' : '18px', background: exLog.done ? 'rgba(16,185,129,0.08)' : isVariant ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.08)', border: `1px solid ${exLog.done ? 'rgba(16,185,129,0.25)' : isVariant ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.15)'}`, overflow: 'hidden', transition: 'all 0.2s' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: isVariant ? '11px 14px' : '14px 16px', cursor: 'pointer' }} onClick={() => setExpanded(!expanded)}>
        {isVariant && <div style={{ width: '2px', height: '28px', background: 'rgba(99,102,241,0.4)', borderRadius: '1px', flexShrink: 0 }} />}
        <div onClick={e => { e.stopPropagation(); toggleDone() }} style={{ width: '22px', height: '22px', borderRadius: '50%', flexShrink: 0, cursor: 'pointer', background: exLog.done ? '#10B981' : 'rgba(255,255,255,0.1)', border: `2px solid ${exLog.done ? '#10B981' : 'rgba(255,255,255,0.2)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {exLog.done && <CheckIcon />}
        </div>
        <p style={{ fontSize: isVariant ? '13px' : '14px', fontWeight: '500', flex: 1, color: exLog.done ? 'rgba(255,255,255,0.4)' : '#fff', textDecoration: exLog.done ? 'line-through' : 'none' }}>{ex.name}</p>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          {!isVariant && ex.variants?.length > 0 && (
            <div onClick={e => { e.stopPropagation(); setVariantsOpen(!variantsOpen) }} style={{ fontSize: '10px', fontWeight: '500', color: 'rgba(199,200,255,0.7)', background: 'rgba(99,102,241,0.2)', border: '1px solid rgba(99,102,241,0.3)', borderRadius: '10px', padding: '2px 8px', cursor: 'pointer' }}>
              {ex.variants.length} similar
            </div>
          )}
          <button onClick={e => { e.stopPropagation(); onEdit(e, ex) }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.3)', padding: '4px' }}>
            <EditIcon />
          </button>
          {expanded ? <ChevronUp /> : <ChevronDown />}
        </div>
      </div>

      {/* Expanded detail */}
      {expanded && (
        <div style={{ padding: '0 16px 14px', paddingLeft: isVariant ? '32px' : '16px' }}>

          {/* Targets */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
            {[{ label: 'Sets', value: ex.sets }, { label: 'Reps', value: ex.reps }, { label: 'Target', value: ex.weight > 0 ? `${ex.weight} lbs` : '—' }].map(s => (
              <div key={s.label} style={{ flex: 1, background: 'rgba(255,255,255,0.05)', borderRadius: '10px', padding: '8px 10px' }}>
                <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.35)', marginBottom: '3px' }}>{s.label}</p>
                <p style={{ fontSize: '13px', fontWeight: '600', color: 'rgba(255,255,255,0.8)' }}>{s.value}</p>
              </div>
            ))}
          </div>

          {/* Last week */}
          {(lwLog.weight || lwLog.reps) && (
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '10px', padding: '8px 12px', borderRadius: '10px', background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.2)' }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="rgba(199,200,255,0.7)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              <span style={{ fontSize: '12px', color: 'rgba(199,200,255,0.7)' }}>
                Last week: <strong style={{ color: '#fff' }}>{lwLog.weight ? `${lwLog.weight} lbs` : ''}{lwLog.weight && lwLog.reps ? ' · ' : ''}{lwLog.reps ? `${lwLog.reps} reps` : ''}</strong>
              </span>
            </div>
          )}

          {/* Log inputs */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '10px' }}>
            <div>
              <label style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', display: 'block', marginBottom: '5px' }}>Weight (lbs)</label>
              <input type="number" placeholder={ex.weight || '0'} value={exLog.weight || ''} onChange={e => setExLog('weight', e.target.value)}
                style={{ width: '100%', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '10px', padding: '10px 12px', color: '#fff', fontSize: '16px', fontFamily: 'Inter, sans-serif', outline: 'none', boxSizing: 'border-box' }} />
            </div>
            <div>
              <label style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', display: 'block', marginBottom: '5px' }}>Reps done</label>
              <input type="text" placeholder={ex.reps} value={exLog.reps || ''} onChange={e => setExLog('reps', e.target.value)}
                style={{ width: '100%', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '10px', padding: '10px 12px', color: '#fff', fontSize: '16px', fontFamily: 'Inter, sans-serif', outline: 'none', boxSizing: 'border-box' }} />
            </div>
          </div>

          {/* Progress chart */}
          <button onClick={() => setAllCharts(isChartOpen ? null : chartKey)} style={{ width: '100%', padding: '8px', borderRadius: '10px', cursor: 'pointer', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.6)', fontSize: '12px', fontFamily: 'Inter, sans-serif', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
            {isChartOpen ? 'Hide progress' : 'View progress'}
          </button>

          {isChartOpen && (
            <div style={{ marginTop: '10px', padding: '14px', background: 'rgba(255,255,255,0.04)', borderRadius: '12px' }}>
              <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', marginBottom: '10px' }}>Weight over time (lbs)</p>
              {getChartData().length >= 2
                ? <ProgressChart data={getChartData()} />
                : <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.3)', textAlign: 'center', padding: '16px 0' }}>Log 2+ sessions to see your chart.</p>
              }
            </div>
          )}
        </div>
      )}

      {/* Variants */}
      {!isVariant && variantsOpen && ex.variants?.length > 0 && (
        <div style={{ padding: '0 12px 12px 36px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <div style={{ height: '1px', flex: 1, background: 'rgba(255,255,255,0.08)' }} />
            <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)', fontWeight: '500' }}>similar exercises</span>
            <div style={{ height: '1px', flex: 1, background: 'rgba(255,255,255,0.08)' }} />
          </div>
          {ex.variants.map(v => (
            <ExerciseRow key={v.id} ex={v} isVariant progId={progId} logs={logs} setLogs={setLogs} today={today} lastWeek={lastWeek}
              onEdit={onEdit} onAddVariant={onAddVariant} allCharts={allCharts} setAllCharts={setAllCharts} />
          ))}
        </div>
      )}

      {/* Add similar button — only on top-level when variants open */}
      {!isVariant && variantsOpen && (
        <div style={{ padding: '0 12px 12px 36px' }}>
          <button onClick={() => onAddVariant(ex.id)} style={{ width: '100%', padding: '9px', borderRadius: '12px', cursor: 'pointer', background: 'transparent', border: '1px dashed rgba(99,102,241,0.35)', color: 'rgba(199,200,255,0.6)', fontSize: '12px', fontFamily: 'Inter, sans-serif', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
            <PlusIcon size={12} />
            Add similar exercise
          </button>
        </div>
      )}
    </div>
  )
}

export default function Workout() {
  const [programs, setPrograms] = useStorage('workout_programs_v2', defaultPrograms)
  const [logs, setLogs] = useStorage('workout_logs_v2', {})
  const [selected, setSelected] = useState(null)
  const [allCharts, setAllCharts] = useState(null)

  const [showAddProg, setShowAddProg] = useState(false)
  const [showExModal, setShowExModal] = useState(false)
  const [editingProg, setEditingProg] = useState(null)
  const [editingEx, setEditingEx] = useState(null)       // { exId, parentId } parentId = null if top-level
  const [addingVariantFor, setAddingVariantFor] = useState(null) // parentExId

  const [progForm, setProgForm] = useState({ name: '', tag: 'Strength' })
  const [exForm, setExForm] = useState({ name: '', sets: '', reps: '', weight: '' })

  const today = new Date().toISOString().split('T')[0]
  const lastWeek = new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0]

  const prog = programs.find(p => p.id === selected)

  const donePct = (() => {
    if (!prog) return 0
    const todayLog = logs?.[selected]?.[today] || {}
    const allExIds = prog.exercises.flatMap(e => [e.id, ...(e.variants || []).map(v => v.id)])
    const doneCount = allExIds.filter(id => todayLog[id]?.done).length
    return Math.round(doneCount / Math.max(allExIds.length, 1) * 100)
  })()

  // Program CRUD
  const openAddProg = () => { setEditingProg(null); setProgForm({ name: '', tag: 'Strength' }); setShowAddProg(true) }
  const openEditProg = (e, p) => { e.stopPropagation(); setEditingProg(p.id); setProgForm({ name: p.name, tag: p.tag }); setShowAddProg(true) }
  const saveProg = () => {
    if (!progForm.name.trim()) return
    if (editingProg) { setPrograms(ps => ps.map(p => p.id === editingProg ? { ...p, ...progForm } : p)) }
    else { setPrograms(ps => [...ps, { id: Date.now(), ...progForm, exercises: [] }]) }
    setShowAddProg(false)
  }
  const deleteProg = () => { setPrograms(ps => ps.filter(p => p.id !== editingProg)); setSelected(null); setShowAddProg(false) }

  // Exercise CRUD
  const openAddEx = () => { setEditingEx(null); setAddingVariantFor(null); setExForm({ name: '', sets: '', reps: '', weight: '' }); setShowExModal(true) }

  const openEditEx = (e, ex) => {
    e.stopPropagation()
    // figure out if it's a variant
    let parentId = null
    prog?.exercises.forEach(parent => {
      if (parent.variants?.find(v => v.id === ex.id)) parentId = parent.id
    })
    setEditingEx({ exId: ex.id, parentId })
    setAddingVariantFor(null)
    setExForm({ name: ex.name, sets: String(ex.sets), reps: ex.reps, weight: String(ex.weight) })
    setShowExModal(true)
  }

  const openAddVariant = (parentExId) => {
    setEditingEx(null)
    setAddingVariantFor(parentExId)
    setExForm({ name: '', sets: '', reps: '', weight: '' })
    setShowExModal(true)
  }

  const saveEx = () => {
    if (!exForm.name.trim()) return
    const built = { ...exForm, sets: parseInt(exForm.sets) || 1 }

    setPrograms(ps => ps.map(p => {
      if (p.id !== selected) return p

      // Editing existing
      if (editingEx) {
        const { exId, parentId } = editingEx
        if (parentId) {
          // editing a variant
          return { ...p, exercises: p.exercises.map(ex => ex.id === parentId
            ? { ...ex, variants: ex.variants.map(v => v.id === exId ? { ...v, ...built } : v) }
            : ex) }
        } else {
          // editing top-level
          return { ...p, exercises: p.exercises.map(ex => ex.id === exId ? { ...ex, ...built } : ex) }
        }
      }

      // Adding variant
      if (addingVariantFor) {
        return { ...p, exercises: p.exercises.map(ex => ex.id === addingVariantFor
          ? { ...ex, variants: [...(ex.variants || []), { id: Date.now(), ...built }] }
          : ex) }
      }

      // Adding top-level
      return { ...p, exercises: [...p.exercises, { id: Date.now(), ...built, variants: [] }] }
    }))
    setShowExModal(false)
  }

  const deleteEx = () => {
    if (!editingEx) return
    const { exId, parentId } = editingEx
    setPrograms(ps => ps.map(p => {
      if (p.id !== selected) return p
      if (parentId) {
        return { ...p, exercises: p.exercises.map(ex => ex.id === parentId
          ? { ...ex, variants: ex.variants.filter(v => v.id !== exId) }
          : ex) }
      }
      return { ...p, exercises: p.exercises.filter(ex => ex.id !== exId) }
    }))
    setShowExModal(false)
  }

  const modalTitle = editingEx
    ? (editingEx.parentId ? 'Edit similar exercise' : 'Edit exercise')
    : addingVariantFor ? 'Add similar exercise' : 'Add exercise'

  return (
    <div style={{ padding: '48px 16px 16px', display: 'flex', flexDirection: 'column', gap: '20px' }}>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: '700' }}>Workout</h1>
          <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.7)', marginTop: '4px' }}>Select today's program</p>
        </div>
        <button onClick={openAddProg} style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'linear-gradient(135deg, #6366F1, #4F46E5)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <PlusIcon />
        </button>
      </div>

      {/* Program list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {programs.map(p => (
          <button key={p.id} onClick={() => setSelected(p.id === selected ? null : p.id)} style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '14px 16px', borderRadius: '20px', cursor: 'pointer', background: selected === p.id ? 'rgba(99,102,241,0.2)' : 'rgba(255,255,255,0.08)', border: `1px solid ${selected === p.id ? 'rgba(99,102,241,0.5)' : 'rgba(255,255,255,0.15)'}`, fontFamily: 'Inter, sans-serif', textAlign: 'left', transition: 'all 0.2s' }}>
            <div style={iconBg}>{p.tag === 'Cardio' ? <HeartIcon /> : <DumbbellIcon />}</div>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: '15px', fontWeight: '600', color: '#fff' }}>{p.name}</p>
              <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', marginTop: '2px' }}>{p.exercises.length} exercises · {p.tag}</p>
            </div>
            <button onClick={e => openEditProg(e, p)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.3)', padding: '4px' }}>
              <EditIcon />
            </button>
          </button>
        ))}
      </div>

      {/* Active workout */}
      {selected && prog && (
        <>
          <div style={{ ...glass, padding: '18px 20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
              <span style={{ fontSize: '14px', fontWeight: '600' }}>{prog.name}</span>
              <span style={{ fontSize: '14px', color: '#10B981', fontWeight: '600' }}>{donePct}%</span>
            </div>
            <div style={{ height: '5px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${donePct}%`, background: 'linear-gradient(90deg, #6366F1, #10B981)', borderRadius: '3px', transition: 'width 0.3s' }} />
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {prog.exercises.map(ex => (
              <ExerciseRow key={ex.id} ex={ex} progId={selected} logs={logs} setLogs={setLogs}
                today={today} lastWeek={lastWeek} onEdit={openEditEx} onAddVariant={openAddVariant}
                allCharts={allCharts} setAllCharts={setAllCharts} />
            ))}

            <button onClick={openAddEx} style={{ padding: '14px', borderRadius: '18px', cursor: 'pointer', background: 'rgba(255,255,255,0.04)', border: '1px dashed rgba(255,255,255,0.2)', color: 'rgba(255,255,255,0.4)', fontSize: '14px', fontFamily: 'Inter, sans-serif', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
              <PlusIcon />
              Add exercise
            </button>
          </div>

          {donePct === 100 && (
            <div style={{ ...glass, padding: '20px', textAlign: 'center', background: 'rgba(16,185,129,0.1)', borderColor: 'rgba(16,185,129,0.3)' }}>
              <div style={{ ...iconBg, margin: '0 auto 12px', background: 'linear-gradient(135deg, #10B981, #059669)' }}>
                <CheckIcon />
              </div>
              <p style={{ fontSize: '16px', fontWeight: '600', color: '#10B981' }}>Workout complete!</p>
              <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', marginTop: '4px' }}>Great work today, Logan.</p>
            </div>
          )}
        </>
      )}

      {/* Program modal */}
      {showAddProg && (
        <Modal title={editingProg ? 'Edit program' : 'New program'} onClose={() => setShowAddProg(false)}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div><label style={labelStyle}>Program name</label><input style={inputStyle} placeholder="e.g. Upper Body" value={progForm.name} onChange={e => setProgForm(f => ({ ...f, name: e.target.value }))} /></div>
            <div>
              <label style={labelStyle}>Type</label>
              <div style={{ display: 'flex', gap: '8px' }}>
                {['Strength', 'Cardio', 'Mobility', 'Sport'].map(t => (
                  <button key={t} onClick={() => setProgForm(f => ({ ...f, tag: t }))} style={{ flex: 1, padding: '8px', borderRadius: '12px', cursor: 'pointer', background: progForm.tag === t ? 'rgba(99,102,241,0.4)' : 'rgba(255,255,255,0.08)', border: `1px solid ${progForm.tag === t ? 'rgba(99,102,241,0.6)' : 'rgba(255,255,255,0.15)'}`, color: progForm.tag === t ? '#fff' : 'rgba(255,255,255,0.6)', fontSize: '12px', fontFamily: 'Inter, sans-serif' }}>{t}</button>
                ))}
              </div>
            </div>
            <button onClick={saveProg} style={{ ...btnPrimary, marginTop: '4px' }}>{editingProg ? 'Save changes' : 'Create program'}</button>
            {editingProg && <button onClick={deleteProg} style={{ ...btnSecondary, color: 'rgba(255,100,100,0.8)', border: '1px solid rgba(255,100,100,0.2)' }}>Delete program</button>}
          </div>
        </Modal>
      )}

      {/* Exercise modal */}
      {showExModal && (
        <Modal title={modalTitle} onClose={() => setShowExModal(false)}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div><label style={labelStyle}>Exercise name</label><input style={inputStyle} placeholder="e.g. Bench Press" value={exForm.name} onChange={e => setExForm(f => ({ ...f, name: e.target.value }))} /></div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
              <div><label style={labelStyle}>Sets</label><input style={inputStyle} type="number" placeholder="4" value={exForm.sets} onChange={e => setExForm(f => ({ ...f, sets: e.target.value }))} /></div>
              <div><label style={labelStyle}>Reps</label><input style={inputStyle} placeholder="8–10" value={exForm.reps} onChange={e => setExForm(f => ({ ...f, reps: e.target.value }))} /></div>
              <div><label style={labelStyle}>Weight (lbs)</label><input style={inputStyle} type="number" placeholder="135" value={exForm.weight} onChange={e => setExForm(f => ({ ...f, weight: e.target.value }))} /></div>
            </div>
            <button onClick={saveEx} style={{ ...btnPrimary, marginTop: '4px' }}>{editingEx ? 'Save changes' : 'Add exercise'}</button>
            {editingEx && <button onClick={deleteEx} style={{ ...btnSecondary, color: 'rgba(255,100,100,0.8)', border: '1px solid rgba(255,100,100,0.2)' }}>Delete exercise</button>}
          </div>
        </Modal>
      )}
    </div>
  )
}