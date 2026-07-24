import { useState, useEffect, useRef } from 'react'
import { supabase } from '../supabase'

const BG    = '#141414'
const CARD  = '#1e1e1e'
const CARD2 = '#252525'
const WHITE = '#ffffff'
const GRAY  = '#888'
const GRAY2 = '#555'

const PILL_BTN  = { background: WHITE, color: '#111', border: 'none', borderRadius: '100px', padding: '14px 28px', fontSize: '15px', fontWeight: '600', fontFamily: 'Inter, sans-serif', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }
const GHOST_BTN = { background: CARD2, color: WHITE, border: 'none', borderRadius: '100px', padding: '12px 24px', fontSize: '14px', fontWeight: '500', fontFamily: 'Inter, sans-serif', cursor: 'pointer' }

const fmtTime = (s) => {
  const h = Math.floor(s/3600), m = Math.floor((s%3600)/60), sec = s%60
  if (h > 0) return `${h}:${String(m).padStart(2,'0')}:${String(sec).padStart(2,'0')}`
  return `${String(m).padStart(2,'0')}:${String(sec).padStart(2,'0')}`
}

const playBeep = () => {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)()
    const osc = ctx.createOscillator(), gain = ctx.createGain()
    osc.connect(gain); gain.connect(ctx.destination)
    osc.frequency.value = 880; osc.type = 'sine'
    gain.gain.setValueAtTime(0.5, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6)
    osc.start(ctx.currentTime); osc.stop(ctx.currentTime + 0.6)
  } catch(e) {}
}

const vibrate = (p = [200,100,200]) => { try { if (navigator.vibrate) navigator.vibrate(p) } catch(e) {} }

const getRecommendedRest = (base, recovery) => {
  if (!recovery) return base
  if (recovery >= 67) return Math.round(base * 0.85)
  if (recovery >= 34) return base
  return Math.round(base * 1.3)
}

const TODAY = (() => {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`
})()

const calc1RM = (weight, reps) => {
  const w = parseFloat(weight) || 0
  const r = parseFloat(String(reps || '').split('-')[0]) || 1
  if (!w || r <= 0) return 0
  return Math.round(w * (1 + r / 30))
}

const STANDARD_EXERCISES = [
  'Bench Press','Incline Bench Press','Decline Bench Press','Dumbbell Fly','Cable Fly',
  'Push Up','Dip','Chest Press Machine',
  'Pull Up','Chin Up','Lat Pulldown','Seated Row','Bent Over Row','Single Arm Row',
  'T-Bar Row','Face Pull','Rear Delt Fly',
  'Overhead Press','Arnold Press','Lateral Raise','Front Raise','Shrug',
  'Bicep Curl','Hammer Curl','Preacher Curl','Concentration Curl','Cable Curl',
  'Tricep Pushdown','Skull Crusher','Overhead Tricep Extension','Close Grip Bench',
  'Squat','Front Squat','Hack Squat','Leg Press','Leg Extension','Leg Curl',
  'Romanian Deadlift','Stiff Leg Deadlift','Hip Thrust','Glute Bridge',
  'Calf Raise','Seated Calf Raise','Deadlift','Sumo Deadlift','Rack Pull',
  'Plank','Crunch','Cable Crunch','Hanging Leg Raise','Ab Rollout',
  'Barbell Row','Pendlay Row','Meadows Row','Lunges','Bulgarian Split Squat',
  'Step Up','Box Jump','Dumbbell Shoulder Press','Upright Row','Cable Lateral Raise',
]

// ─── Icons ────────────────────────────────────────────────────────────────────
const CheckIcon = ({ size = 14, color = '#111' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
)
const PlusIcon = ({ size = 18, color = WHITE }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
)
const CloseIcon = ({ color = GRAY }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
)
const ChevronRight = ({ color = GRAY }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
)
const BackIcon = ({ color = WHITE }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
)
const DumbbellIcon = ({ color = GRAY, size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 4v16M18 4v16M3 8h3M18 8h3M3 16h3M18 16h3M6 12h12"/></svg>
)
const TimerIcon = ({ color = GRAY }) => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
)
const ArrowIcon = ({ color = '#111' }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
)
const SearchIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={GRAY} strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
)
const TrashIcon = ({ color = '#EF4444', size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg>
)
const GearIcon = ({ color = GRAY, size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/>
  </svg>
)
const FireIcon = ({ color = '#6366F1', size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M8.5 14.5A2.5 2.5 0 0011 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 11-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 002.5 3z"/>
  </svg>
)
const MustacheIcon = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 100 50" fill="white" stroke="none">
    <path d="M5,25 C5,10 20,5 30,15 C35,20 40,22 50,22 C60,22 65,20 70,15 C80,5 95,10 95,25 C95,35 85,40 75,35 C68,31 62,28 50,28 C38,28 32,31 25,35 C15,40 5,35 5,25 Z"/>
  </svg>
)

// ─── Analytics Chart ──────────────────────────────────────────────────────────
function AnalyticsChart({ logs }) {
  const containerRef = useRef(null)
  const canvasRef    = useRef(null)
  const validLogs    = logs.filter(l => l.weight_used && !isNaN(parseFloat(l.weight_used)))

  useEffect(() => {
    const draw = () => {
      const canvas = canvasRef.current
      const container = containerRef.current
      if (!canvas || !container || validLogs.length < 2) return
      const dpr = window.devicePixelRatio || 1
      const W = container.offsetWidth, H = 88
      canvas.width = W * dpr; canvas.height = H * dpr
      canvas.style.width = W + 'px'; canvas.style.height = H + 'px'
      const ctx = canvas.getContext('2d')
      ctx.scale(dpr, dpr); ctx.clearRect(0, 0, W, H)
      const weights = validLogs.map(l => parseFloat(l.weight_used))
      const minW = Math.min(...weights) * 0.92
      const maxW = Math.max(...weights) * 1.05
      const range = maxW - minW || 1
      const pad = { top: 10, bottom: 10, left: 2, right: 2 }
      const cW = W - pad.left - pad.right, cH = H - pad.top - pad.bottom
      const toX = i => pad.left + (validLogs.length > 1 ? (i / (validLogs.length - 1)) * cW : cW / 2)
      const toY = w => pad.top + cH - ((w - minW) / range) * cH
      ctx.beginPath()
      ctx.moveTo(toX(0), toY(weights[0]))
      weights.slice(1).forEach((w, i) => ctx.lineTo(toX(i + 1), toY(w)))
      ctx.lineTo(toX(validLogs.length - 1), H)
      ctx.lineTo(toX(0), H)
      ctx.closePath()
      const grad = ctx.createLinearGradient(0, 0, 0, H)
      grad.addColorStop(0, 'rgba(255,255,255,0.1)')
      grad.addColorStop(1, 'rgba(255,255,255,0)')
      ctx.fillStyle = grad; ctx.fill()
      ctx.beginPath()
      ctx.moveTo(toX(0), toY(weights[0]))
      weights.slice(1).forEach((w, i) => ctx.lineTo(toX(i + 1), toY(w)))
      ctx.strokeStyle = WHITE; ctx.lineWidth = 2; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.stroke()
      const last = validLogs.length - 1
      ctx.beginPath(); ctx.arc(toX(last), toY(weights[last]), 4, 0, Math.PI * 2)
      ctx.fillStyle = WHITE; ctx.fill()
    }
    draw()
    const ro = new ResizeObserver(draw)
    if (containerRef.current) ro.observe(containerRef.current)
    return () => ro.disconnect()
  }, [validLogs.length])

  if (validLogs.length < 2) return (
    <p style={{ fontSize: '13px', color: GRAY2, textAlign: 'center', padding: '8px 0' }}>Log 2+ sessions to see progression</p>
  )
  return <div ref={containerRef} style={{ width: '100%' }}><canvas ref={canvasRef} style={{ display: 'block' }}/></div>
}

// ─── Confirm Delete Modal ─────────────────────────────────────────────────────
function ConfirmDeleteModal({ title, subtitle, onConfirm, onCancel }) {
  return (
    <>
      <div onClick={onCancel} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.72)', zIndex: 700, backdropFilter: 'blur(6px)' }}/>
      <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 701, background: '#1c1c1c', borderRadius: '24px 24px 0 0', padding: '32px 20px calc(44px + env(safe-area-inset-bottom))' }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
          <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'rgba(239,68,68,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <TrashIcon size={24} color="#EF4444"/>
          </div>
        </div>
        <p style={{ fontSize: '20px', fontWeight: '700', color: WHITE, textAlign: 'center', marginBottom: '8px' }}>{title}</p>
        <p style={{ fontSize: '14px', color: GRAY, textAlign: 'center', marginBottom: '32px', lineHeight: 1.6 }}>{subtitle}</p>
        <button onClick={onConfirm} style={{ width: '100%', padding: '16px', borderRadius: '14px', background: '#EF4444', border: 'none', color: WHITE, fontSize: '16px', fontWeight: '700', fontFamily: 'Inter, sans-serif', cursor: 'pointer', marginBottom: '10px' }}>Delete</button>
        <button onClick={onCancel} style={{ ...GHOST_BTN, width: '100%', padding: '14px', fontSize: '15px', textAlign: 'center' }}>Cancel</button>
      </div>
    </>
  )
}

// ─── Swipeable Exercise Row ───────────────────────────────────────────────────
function SwipeableExerciseRow({ ex, isDone, onTap, onToggleDone, onDeleteIntent }) {
  const [offsetX, setOffsetX]   = useState(0)
  const [dragging, setDragging] = useState(false)
  const startX      = useRef(0), startY = useRef(0)
  const liveOffset  = useRef(0), maxSwipe = useRef(0)
  const isScrolling = useRef(null), vibratedAt = useRef(0)
  const MORPH_START = 18, COMMIT = 110
  const morphPct   = Math.min(Math.max((offsetX - MORPH_START) / (COMMIT - MORPH_START), 0), 1)
  const showTrash  = offsetX >= MORPH_START
  const pastCommit = offsetX >= COMMIT

  const onTouchStart = (e) => { startX.current = e.touches[0].clientX; startY.current = e.touches[0].clientY; isScrolling.current = null; maxSwipe.current = 0; setDragging(true) }
  const onTouchMove  = (e) => {
    const dx = e.touches[0].clientX - startX.current, dy = Math.abs(e.touches[0].clientY - startY.current)
    if (isScrolling.current === null) { if (Math.abs(dx) < 5 && dy < 5) return; isScrolling.current = dy > Math.abs(dx) }
    if (isScrolling.current) return
    maxSwipe.current = Math.max(maxSwipe.current, Math.abs(dx))
    if (dx <= 0) { liveOffset.current = 0; setOffsetX(0); return }
    const clamped = dx < COMMIT ? dx : COMMIT + (dx - COMMIT) * 0.18
    liveOffset.current = clamped; setOffsetX(clamped)
    if (dx >= COMMIT) { const now = Date.now(); if (now - vibratedAt.current > 400) { vibrate([20]); vibratedAt.current = now } }
  }
  const onTouchEnd = () => {
    setDragging(false)
    const didCommit = liveOffset.current >= COMMIT
    setOffsetX(0); liveOffset.current = 0
    if (didCommit) { vibrate([50, 30, 80]); onDeleteIntent() }
  }
  const circleBg     = showTrash ? `rgba(239,68,68,${0.08 + morphPct * 0.12})` : (isDone ? WHITE : 'transparent')
  const circleBorder = showTrash ? `2px solid rgba(239,68,68,${0.4 + morphPct * 0.6})` : `2px solid ${isDone ? WHITE : '#333'}`

  return (
    <>
      <style>{`@keyframes trashShake{0%,100%{transform:rotate(0deg)}25%{transform:rotate(-15deg)}75%{transform:rotate(15deg)}}`}</style>
      <div onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd}
        onClick={() => { if (maxSwipe.current > 10) return; onTap() }}
        style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '14px 0', cursor: 'pointer', userSelect: 'none', WebkitUserSelect: 'none' }}>
        <div onClick={e => { e.stopPropagation(); if (maxSwipe.current > 10) return; onToggleDone() }}
          style={{ width: '44px', height: '44px', borderRadius: '50%', flexShrink: 0, background: circleBg, border: circleBorder, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: dragging ? 'none' : 'all 0.25s', animation: pastCommit ? 'trashShake 0.25s ease infinite' : 'none' }}>
          {showTrash ? <TrashIcon size={18} color={`rgba(239,68,68,${0.5 + morphPct * 0.5})`}/> : isDone ? <CheckIcon size={18} color="#111"/> : null}
        </div>
        <div style={{ flex: 1, pointerEvents: 'none' }}>
          <p style={{ fontSize: '17px', fontWeight: '600', color: isDone ? GRAY : WHITE, textDecoration: isDone ? 'line-through' : 'none' }}>{ex.name}</p>
          <p style={{ fontSize: '13px', color: GRAY2, marginTop: '3px' }}>
            {isDone ? <span style={{ color: GRAY }}>Completed{ex._log?.weight_used ? ` · ${ex._log.weight_used} lbs` : ''}</span> : `${ex.sets} sets · ${ex.reps} reps`}
          </p>
        </div>
        <ChevronRight color={GRAY2}/>
      </div>
    </>
  )
}

// ─── Swipeable Set Row ────────────────────────────────────────────────────────
function SwipeableSetRow({ setData, idx, onToggleDone, onOpenPicker, onDeleteIntent }) {
  const [offsetX, setOffsetX]   = useState(0)
  const [dragging, setDragging] = useState(false)
  const startX      = useRef(0), startY = useRef(0)
  const liveOffset  = useRef(0), maxSwipe = useRef(0)
  const isScrolling = useRef(null), vibratedAt = useRef(0)
  const MORPH_START = 18, COMMIT = 110
  const morphPct   = Math.min(Math.max((offsetX - MORPH_START) / (COMMIT - MORPH_START), 0), 1)
  const showTrash  = offsetX >= MORPH_START
  const pastCommit = offsetX >= COMMIT

  const onTouchStart = (e) => { startX.current = e.touches[0].clientX; startY.current = e.touches[0].clientY; isScrolling.current = null; maxSwipe.current = 0; setDragging(true) }
  const onTouchMove  = (e) => {
    const dx = e.touches[0].clientX - startX.current, dy = Math.abs(e.touches[0].clientY - startY.current)
    if (isScrolling.current === null) { if (Math.abs(dx) < 5 && dy < 5) return; isScrolling.current = dy > Math.abs(dx) }
    if (isScrolling.current) return
    maxSwipe.current = Math.max(maxSwipe.current, Math.abs(dx))
    if (dx <= 0) { liveOffset.current = 0; setOffsetX(0); return }
    const clamped = dx < COMMIT ? dx : COMMIT + (dx - COMMIT) * 0.18
    liveOffset.current = clamped; setOffsetX(clamped)
    if (dx >= COMMIT) { const now = Date.now(); if (now - vibratedAt.current > 400) { vibrate([20]); vibratedAt.current = now } }
  }
  const onTouchEnd = () => {
    setDragging(false)
    const didCommit = liveOffset.current >= COMMIT
    setOffsetX(0); liveOffset.current = 0
    if (didCommit) { vibrate([50, 30, 80]); onDeleteIntent(idx) }
  }
  const circleBg     = showTrash ? `rgba(239,68,68,${0.08 + morphPct * 0.12})` : (setData.done ? WHITE : CARD2)
  const circleBorder = showTrash ? `2px solid rgba(239,68,68,${0.4 + morphPct * 0.6})` : (setData.done ? `2px solid ${WHITE}` : 'none')

  return (
    <div onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd}
      style={{ display: 'flex', alignItems: 'center', gap: '12px', paddingBottom: '14px', userSelect: 'none', WebkitUserSelect: 'none' }}>
      <div onClick={() => { if (maxSwipe.current > 10) return; onToggleDone(idx) }}
        style={{ width: '44px', height: '44px', borderRadius: '12px', flexShrink: 0, background: circleBg, border: circleBorder, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: dragging ? 'none' : 'all 0.25s', animation: pastCommit ? 'trashShake 0.25s ease infinite' : 'none' }}>
        {showTrash ? <TrashIcon size={18} color={`rgba(239,68,68,${0.5 + morphPct * 0.5})`}/> : setData.done ? <CheckIcon size={20} color="#111"/> : null}
      </div>
      <div onClick={() => { if (maxSwipe.current <= 10) onOpenPicker(idx, 'weight') }} style={{ background: CARD2, borderRadius: '100px', padding: '10px 18px', cursor: 'pointer' }}>
        <span style={{ fontSize: '15px', fontWeight: '600', color: WHITE }}>{setData.weight || '—'} lbs</span>
      </div>
      <div onClick={() => { if (maxSwipe.current <= 10) onOpenPicker(idx, 'reps') }} style={{ background: CARD2, borderRadius: '100px', padding: '10px 18px', cursor: 'pointer' }}>
        <span style={{ fontSize: '15px', fontWeight: '600', color: WHITE }}>{setData.reps || '—'} reps</span>
      </div>
    </div>
  )
}

// ─── Progress Border Card ─────────────────────────────────────────────────────
function ProgressBorderCard({ pct, children }) {
  const canvasRef = useRef(null)
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const dpr = window.devicePixelRatio || 1
    const W = canvas.offsetWidth, H = canvas.offsetHeight
    if (!W || !H) return
    canvas.width = W * dpr; canvas.height = H * dpr
    const ctx = canvas.getContext('2d')
    ctx.scale(dpr, dpr); ctx.clearRect(0, 0, W, H)
    const r = 20, lw = 3, half = lw / 2
    const drawRect = () => {
      ctx.beginPath()
      ctx.moveTo(r+half, half); ctx.lineTo(W-r-half, half)
      ctx.arcTo(W-half, half, W-half, r+half, r); ctx.lineTo(W-half, H-r-half)
      ctx.arcTo(W-half, H-half, W-r-half, H-half, r); ctx.lineTo(r+half, H-half)
      ctx.arcTo(half, H-half, half, H-r-half, r); ctx.lineTo(half, r+half)
      ctx.arcTo(half, half, r+half, half, r); ctx.closePath()
    }
    drawRect(); ctx.strokeStyle = '#2a2a2a'; ctx.lineWidth = lw; ctx.stroke()
    if (pct > 0) {
      const perim = 2*(W-2*r)+2*(H-2*r)+2*Math.PI*r
      drawRect(); ctx.strokeStyle = WHITE; ctx.lineWidth = lw; ctx.lineCap = 'round'
      ctx.setLineDash([perim*pct/100, perim]); ctx.stroke(); ctx.setLineDash([])
    }
  }, [pct])
  return (
    <div style={{ position: 'relative', borderRadius: '20px', background: CARD, marginBottom: '28px' }}>
      <canvas ref={canvasRef} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', borderRadius: '20px', pointerEvents: 'none', zIndex: 2 }}/>
      <div style={{ position: 'relative', zIndex: 1 }}>{children}</div>
    </div>
  )
}

// ─── Week Strip ───────────────────────────────────────────────────────────────
function WeekStrip({ programs, selectedDayOfWeek, onSelect, onAddProgram, onDeleteProgram }) {
  const LABELS   = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']
  const todayDow = new Date().getDay()
  const [deletingDow, setDeletingDow] = useState(null)
  const [swipeY, setSwipeY]           = useState(0)
  const pressTimer  = useRef(null)
  const touchStartY = useRef(0)
  const liveY       = useRef(0)
  const COMMIT_Y    = 65

  const days = Array.from({ length: 7 }, (_, i) => {
    const dow = (todayDow + i) % 7
    return { dow, label: i === 0 ? 'Today' : LABELS[dow], prog: programs.length ? programs[i % programs.length] : null }
  })

  const startPress  = (dow) => { pressTimer.current = setTimeout(() => { vibrate([30]); setDeletingDow(dow) }, 500) }
  const cancelPress = () => clearTimeout(pressTimer.current)

  const onCardTouchStart = (e, dow) => {
    touchStartY.current = e.touches[0].clientY
    liveY.current = 0; setSwipeY(0)
    startPress(dow)
  }
  const onCardTouchMove = (e, dow) => {
    const dy = e.touches[0].clientY - touchStartY.current
    if (Math.abs(dy) > 8) cancelPress()
    if (deletingDow === dow) { liveY.current = Math.max(0, dy); setSwipeY(Math.max(0, dy)) }
  }
  const onCardTouchEnd = (dow) => {
    cancelPress()
    if (deletingDow === dow) {
      if (liveY.current >= COMMIT_Y) { vibrate([40, 20, 60]); onDeleteProgram(dow) }
      setDeletingDow(null); setSwipeY(0); liveY.current = 0
    }
  }

  return (
    <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '16px', scrollbarWidth: 'none', alignItems: 'flex-start' }}>

      {/* New program card */}
      <div onClick={onAddProgram}
        style={{ minWidth: '148px', borderRadius: '18px', padding: '18px', background: CARD, flexShrink: 0, cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '10px', minHeight: '152px' }}>
        <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: CARD2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <PlusIcon size={18} color={GRAY}/>
        </div>
        <p style={{ fontSize: '13px', color: GRAY, fontWeight: '500', textAlign: 'center' }}>New program</p>
      </div>

      {days.map(({ dow, label, prog }) => {
        const isSelected = dow === selectedDayOfWeek
        const isDeleting = dow === deletingDow
        const swipePct   = Math.min(swipeY / COMMIT_Y, 1)
        const pastCommit = swipeY >= COMMIT_Y

        return (
          <div key={dow} style={{ minWidth: '148px', flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>

            {/* Card — full size normally, shrinks when held */}
            <div
              onTouchStart={e => prog && onCardTouchStart(e, dow)}
              onTouchMove={e => onCardTouchMove(e, dow)}
              onTouchEnd={() => onCardTouchEnd(dow)}
              onClick={() => { if (!isDeleting && prog) onSelect(prog, dow) }}
              style={{
                width: '100%',
                borderRadius: '18px',
                padding: '18px',
                background: isSelected ? WHITE : CARD,
                cursor: prog ? 'pointer' : 'default',
                opacity: !prog ? 0.4 : 1,
                transform: isDeleting
                  ? `scale(0.9) translateY(${Math.min(swipeY * 0.55, 48)}px)`
                  : 'scale(1) translateY(0px)',
                transition: isDeleting && swipeY > 0 ? 'none' : 'transform 0.25s cubic-bezier(0.32,0.72,0,1)',
                boxShadow: isDeleting ? `0 0 0 2px rgba(239,68,68,${swipePct * 0.7})` : 'none',
              }}>
              <p style={{ fontSize: '13px', color: isSelected ? '#777' : GRAY2, marginBottom: '8px', fontWeight: '500' }}>{label}</p>
              <p style={{ fontSize: '20px', fontWeight: '700', color: isSelected ? '#111' : WHITE, marginBottom: '12px', letterSpacing: '-0.3px' }}>{prog?.name || 'Rest'}</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '5px' }}>
                <DumbbellIcon color={isSelected ? '#777' : GRAY2} size={12}/>
                <span style={{ fontSize: '12px', color: isSelected ? '#777' : GRAY2 }}>{prog?.exercises?.length || 0} Exercises</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <TimerIcon color={isSelected ? '#777' : GRAY2}/>
                <span style={{ fontSize: '12px', color: isSelected ? '#777' : GRAY2 }}>~52 min avg.</span>
              </div>
            </div>

            {/* Trash circle — slides in below card on long press, swipe card into it */}
            <div style={{
              maxHeight: isDeleting ? '72px' : '0px',
              overflow: 'hidden',
              transition: isDeleting && swipeY > 0 ? 'none' : 'max-height 0.25s ease',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              paddingTop: isDeleting ? '10px' : '0',
            }}>
              <div style={{
                width: '56px', height: '56px', borderRadius: '50%', flexShrink: 0,
                background: `rgba(239,68,68,${0.06 + swipePct * 0.16})`,
                border: `2px solid rgba(239,68,68,${0.2 + swipePct * 0.8})`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <TrashIcon size={20} color={pastCommit ? '#EF4444' : `rgba(239,68,68,${0.4 + swipePct * 0.6})`}/>
              </div>
            </div>

          </div>
        )
      })}
    </div>
  )
}


// ─── This Week Section ────────────────────────────────────────────────────────
function ThisWeekSection({ weeklyWorkoutDays, workoutStreak, todayLogs }) {
  const volume   = Object.values(todayLogs).reduce((s,l) => s+(parseFloat(l.weight_used)||0)*(parseFloat(l.reps_done)||0), 0)
  const LABELS   = ['S','M','T','W','T','F','S']
  const todayDow = new Date().getDay()
  const getDowDate = (dow) => {
    const d = new Date(); d.setDate(d.getDate() - todayDow + dow)
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`
  }
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      <div style={{ background: CARD, borderRadius: '16px', padding: '18px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <p style={{ fontSize: '12px', color: GRAY, marginBottom: '6px' }}>Volume · Today</p>
          <p style={{ fontSize: '28px', fontWeight: '700', color: WHITE }}>{volume > 0 ? volume.toLocaleString() : '—'}</p>
          <p style={{ fontSize: '12px', color: GRAY, marginTop: '2px' }}>lbs</p>
        </div>
        {workoutStreak > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(99,102,241,0.12)', borderRadius: '100px', padding: '8px 14px' }}>
            <FireIcon size={14} color="#6366F1"/>
            <span style={{ fontSize: '13px', fontWeight: '700', color: '#6366F1' }}>{workoutStreak} week{workoutStreak !== 1 ? 's' : ''}</span>
          </div>
        )}
      </div>
      <div style={{ background: CARD, borderRadius: '16px', padding: '18px 20px' }}>
        <div style={{ marginBottom: '18px' }}>
          <p style={{ fontSize: '12px', color: GRAY, marginBottom: '6px' }}>Workouts · This Week</p>
          <p style={{ fontSize: '28px', fontWeight: '700', color: WHITE }}>{weeklyWorkoutDays.size}</p>
          <p style={{ fontSize: '12px', color: GRAY, marginTop: '2px' }}>of 7 days</p>
        </div>
        <div style={{ display: 'flex', gap: '6px' }}>
          {LABELS.map((label, dow) => {
            const dateStr  = getDowDate(dow)
            const isToday  = dow === todayDow
            const isFuture = dow > todayDow
            const hasWork  = weeklyWorkoutDays.has(dateStr)
            return (
              <div key={dow} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: hasWork ? WHITE : (isFuture ? '#1a1a1a' : CARD2), border: isToday && !hasWork ? `2px solid ${GRAY2}` : 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {hasWork && <CheckIcon size={13} color="#111"/>}
                </div>
                <p style={{ fontSize: '10px', color: isToday ? WHITE : GRAY2, fontWeight: isToday ? '700' : '400' }}>{label}</p>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

// ─── Number Picker ────────────────────────────────────────────────────────────
function NumberPicker({ label, value, isReps, onSave, onClose }) {
  const isRange = isReps && String(value).includes('-')
  const [rangeMode, setRangeMode] = useState(isRange)
  const [single, setSingle]       = useState(isRange ? String(value).split('-')[0] : String(value || ''))
  const [rangeLow, setRangeLow]   = useState(isRange ? String(value).split('-')[0] : String(value || ''))
  const [rangeHigh, setRangeHigh] = useState(isRange ? String(value).split('-')[1] : String(parseFloat(value||0)+2))
  const step = isReps ? 1 : 2.5
  const inc = (s, v) => s(String(Math.max(0, parseFloat(v||0) + step)))
  const dec = (s, v) => s(String(Math.max(0, parseFloat(v||0) - step)))
  const handleSave = () => { onSave(rangeMode ? `${rangeLow}-${rangeHigh}` : single); onClose() }
  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 500 }}/>
      <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 501, background: '#1a1a1a', borderRadius: '24px 24px 0 0', padding: '20px 24px calc(40px + env(safe-area-inset-bottom))' }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}><div style={{ width: '36px', height: '4px', borderRadius: '2px', background: CARD2 }}/></div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
          <p style={{ fontSize: '16px', fontWeight: '600', color: WHITE }}>{label}</p>
          {isReps && <button onClick={() => setRangeMode(r => !r)} style={{ background: rangeMode ? WHITE : CARD2, border: 'none', borderRadius: '100px', padding: '8px 16px', color: rangeMode ? '#111' : GRAY, fontSize: '13px', fontWeight: '600', fontFamily: 'Inter, sans-serif', cursor: 'pointer' }}>Range {rangeMode ? 'on' : 'off'}</button>}
        </div>
        {!rangeMode ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '28px' }}>
            <button onClick={() => dec(setSingle, single)} style={{ width: '56px', height: '56px', borderRadius: '50%', background: CARD2, border: 'none', color: WHITE, fontSize: '28px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>−</button>
            <input type="number" value={single} onChange={e => setSingle(e.target.value)} autoFocus style={{ background: 'transparent', border: 'none', color: WHITE, fontSize: '72px', fontWeight: '800', fontFamily: 'Inter, sans-serif', outline: 'none', textAlign: 'center', width: '200px', letterSpacing: '-2px' }}/>
            <button onClick={() => inc(setSingle, single)} style={{ width: '56px', height: '56px', borderRadius: '50%', background: CARD2, border: 'none', color: WHITE, fontSize: '28px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>+</button>
          </div>
        ) : (
          <div style={{ marginBottom: '28px' }}>
            <p style={{ fontSize: '12px', color: GRAY, marginBottom: '12px', textAlign: 'center' }}>LOW — HIGH</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <button onClick={() => dec(setRangeLow, rangeLow)} style={{ width: '44px', height: '44px', borderRadius: '50%', background: CARD2, border: 'none', color: WHITE, fontSize: '24px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>−</button>
                <input type="number" value={rangeLow} onChange={e => setRangeLow(e.target.value)} style={{ background: 'transparent', border: 'none', color: WHITE, fontSize: '56px', fontWeight: '800', fontFamily: 'Inter, sans-serif', outline: 'none', textAlign: 'center', width: '100px' }}/>
                <button onClick={() => inc(setRangeLow, rangeLow)} style={{ width: '44px', height: '44px', borderRadius: '50%', background: CARD2, border: 'none', color: WHITE, fontSize: '24px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>+</button>
              </div>
              <span style={{ fontSize: '32px', color: GRAY, fontWeight: '300' }}>—</span>
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <button onClick={() => dec(setRangeHigh, rangeHigh)} style={{ width: '44px', height: '44px', borderRadius: '50%', background: CARD2, border: 'none', color: WHITE, fontSize: '24px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>−</button>
                <input type="number" value={rangeHigh} onChange={e => setRangeHigh(e.target.value)} style={{ background: 'transparent', border: 'none', color: WHITE, fontSize: '56px', fontWeight: '800', fontFamily: 'Inter, sans-serif', outline: 'none', textAlign: 'center', width: '100px' }}/>
                <button onClick={() => inc(setRangeHigh, rangeHigh)} style={{ width: '44px', height: '44px', borderRadius: '50%', background: CARD2, border: 'none', color: WHITE, fontSize: '24px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>+</button>
              </div>
            </div>
            </div>
          </div>
        )}
        <button onClick={handleSave} style={{ ...PILL_BTN, width: '100%', padding: '16px', fontSize: '16px' }}>Done <ArrowIcon /></button>
      </div>
    </>
  )
}

// ─── Exercise Detail Screen ───────────────────────────────────────────────────
function ExerciseDetailScreen({ ex, log, lastLog, onBack, onLogSet, onStartRest, onDelete }) {
  const [sets, setSets]             = useState(() => {
    if (log?.weight_used && log?.reps_done) return [{ weight: String(log.weight_used), reps: String(log.reps_done), done: !!log.done }]
    return [{ weight: String(lastLog?.weight_used || ex.weight || ''), reps: String(ex.reps || ''), done: false }]
  })
  const [notes, setNotes]           = useState(log?.notes || '')
  const [picker, setPicker]         = useState(null)
  const [confirmSet, setConfirmSet] = useState(null)
  const [historicalLogs, setHistoricalLogs] = useState([])
  const [showRestSheet, setShowRestSheet]   = useState(false)
  const [restSecs, setRestSecs]     = useState(ex.rest_seconds || 90)
  const [savingRest, setSavingRest] = useState(false)

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase.from('workout_logs').select('*').eq('exercise_id', ex.id).not('weight_used', 'is', null).order('logged_date', { ascending: true }).limit(30)
      setHistoricalLogs(data || [])
    }
    fetch()
  }, [ex.id])

  const saveRestTime = async () => {
    setSavingRest(true)
    await supabase.from('exercises').update({ rest_seconds: restSecs }).eq('id', ex.id)
    setSavingRest(false); setShowRestSheet(false)
  }

  const openPicker    = (setIdx, field) => setPicker({ setIdx, field })
  const savePicker    = (val) => { if (!picker) return; setSets(prev => prev.map((s,i) => i === picker.setIdx ? { ...s, [picker.field]: val } : s)); setPicker(null) }
  const toggleSetDone = (idx) => {
    const updated = sets.map((s,i) => i === idx ? { ...s, done: !s.done } : s); setSets(updated)
    const s = updated[idx]
    if (updated[idx].done && s.weight && s.reps) { onLogSet(ex.id, s.weight, s.reps, notes); onStartRest(ex.rest_seconds || 90) }
  }
  const deleteSet = () => { setSets(prev => prev.filter((_,i) => i !== confirmSet)); setConfirmSet(null) }
  const addSet    = () => { const last = sets[sets.length-1]; setSets(prev => [...prev, { weight: last?.weight || '', reps: last?.reps || ex.reps || '', done: false }]) }
  const allDone   = sets.length > 0 && sets.every(s => s.done)

  const validHistorical = historicalLogs.filter(l => l.weight_used)
  const best1RM  = validHistorical.length > 0 ? Math.max(...validHistorical.map(l => calc1RM(l.weight_used, l.reps_done))) : 0
  const today1RM = calc1RM(log?.weight_used, log?.reps_done)
  const isNewPR  = today1RM > 0 && today1RM >= best1RM && validHistorical.length > 1

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 200, background: BG, overflowY: 'auto', animation: 'slideInRight 0.25s cubic-bezier(0.32,0.72,0,1)' }}>
      <style>{`@keyframes slideInRight{from{transform:translateX(100%)}to{transform:translateX(0)}}`}</style>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '56px 20px 20px' }}>
        <button onClick={onBack} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}><BackIcon /></button>
        <button onClick={() => setShowRestSheet(true)} style={{ width: '40px', height: '40px', borderRadius: '50%', background: CARD2, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><GearIcon color={GRAY} size={18}/></button>
      </div>
      <div style={{ padding: '0 20px 28px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: '800', color: allDone ? GRAY : WHITE, letterSpacing: '-0.5px', lineHeight: 1.1 }}>{ex.name}</h1>
        <p style={{ fontSize: '14px', color: GRAY, marginTop: '6px' }}>{allDone ? 'All sets completed' : `${ex.sets} sets · ${ex.reps} reps target`}</p>
      </div>
      {(lastLog?.weight_used || lastLog?.reps_done) && (
        <div style={{ margin: '0 20px 20px', background: CARD2, borderRadius: '12px', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <TimerIcon />
          <span style={{ fontSize: '13px', color: GRAY }}>Last: <strong style={{ color: WHITE }}>{lastLog.weight_used ? `${lastLog.weight_used} lbs` : ''}{lastLog.weight_used && lastLog.reps_done ? ' · ' : ''}{lastLog.reps_done ? `${lastLog.reps_done} reps` : ''}</strong></span>
        </div>
      )}
      <div style={{ padding: '0 20px' }}>
        {sets.map((s, idx) => <SwipeableSetRow key={idx} setData={s} idx={idx} onToggleDone={toggleSetDone} onOpenPicker={openPicker} onDeleteIntent={setConfirmSet}/>)}
        <div onClick={addSet} style={{ display: 'flex', alignItems: 'center', gap: '12px', paddingBottom: '28px', cursor: 'pointer' }}>
          <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: CARD2, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><PlusIcon size={18} color={GRAY}/></div>
          <span style={{ fontSize: '17px', fontWeight: '500', color: GRAY }}>Add set</span>
        </div>
      </div>
      <div style={{ height: '1px', background: CARD2 }}/>
      <div style={{ padding: '20px' }}>
        <textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Type anything..." rows={4}
          style={{ width: '100%', background: 'transparent', border: 'none', color: WHITE, fontSize: '16px', fontFamily: 'Inter, sans-serif', outline: 'none', resize: 'none', lineHeight: '1.6', boxSizing: 'border-box' }}/>
      </div>
      <div style={{ height: '1px', background: CARD2 }}/>
      <div style={{ padding: '20px 20px calc(100px + env(safe-area-inset-bottom))' }}>
        <p style={{ fontSize: '20px', fontWeight: '700', color: WHITE, marginBottom: '14px', letterSpacing: '-0.3px' }}>Analytics</p>
        <div style={{ background: CARD2, borderRadius: '16px', padding: '16px 18px', marginBottom: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <p style={{ fontSize: '12px', color: GRAY, marginBottom: '4px' }}>Est. 1 Rep Max</p>
            <p style={{ fontSize: '32px', fontWeight: '800', color: WHITE, letterSpacing: '-0.5px' }}>{best1RM > 0 ? best1RM : '—'} <span style={{ fontSize: '14px', color: GRAY, fontWeight: '400' }}>{best1RM > 0 ? 'lbs' : ''}</span></p>
          </div>
          {isNewPR && <div style={{ background: 'rgba(16,185,129,0.15)', borderRadius: '100px', padding: '8px 14px' }}><p style={{ fontSize: '13px', fontWeight: '700', color: '#10B981' }}>NEW PR</p></div>}
        </div>
        <div style={{ background: CARD2, borderRadius: '16px', padding: '16px 18px' }}>
          <p style={{ fontSize: '12px', color: GRAY, marginBottom: '12px' }}>Weight Progression</p>
          <AnalyticsChart logs={validHistorical}/>
          {validHistorical.length >= 2 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px' }}>
              <p style={{ fontSize: '11px', color: GRAY2 }}>{new Date(validHistorical[0].logged_date + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>
              <p style={{ fontSize: '11px', color: GRAY2 }}>Today</p>
            </div>
          )}
        </div>
      </div>
      {confirmSet !== null && <ConfirmDeleteModal title="Delete this set?" subtitle="All data for this set will be lost." onConfirm={deleteSet} onCancel={() => setConfirmSet(null)}/>}
      {showRestSheet && (
        <>
          <div onClick={() => setShowRestSheet(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 600, backdropFilter: 'blur(4px)' }}/>
          <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 601, background: '#1a1a1a', borderRadius: '24px 24px 0 0', padding: '20px 24px calc(44px + env(safe-area-inset-bottom))' }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}><div style={{ width: '36px', height: '4px', borderRadius: '2px', background: CARD2 }}/></div>
            <p style={{ fontSize: '20px', fontWeight: '700', color: WHITE, marginBottom: '4px' }}>Rest Time</p>
            <p style={{ fontSize: '13px', color: GRAY, marginBottom: '24px' }}>How long to rest between sets for {ex.name}</p>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
              {[60, 90, 120, 180].map(s => (
                <button key={s} onClick={() => setRestSecs(s)} style={{ flex: 1, padding: '12px 0', borderRadius: '12px', background: restSecs === s ? WHITE : CARD2, border: 'none', color: restSecs === s ? '#111' : GRAY, fontSize: '13px', fontWeight: restSecs === s ? '700' : '400', fontFamily: 'Inter, sans-serif', cursor: 'pointer' }}>
                  {s < 60 ? `${s}s` : `${s/60}m`}
                </button>
              ))}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '28px', marginBottom: '28px' }}>
              <button onClick={() => setRestSecs(s => Math.max(15, s - 15))} style={{ width: '52px', height: '52px', borderRadius: '50%', background: CARD2, border: 'none', color: WHITE, fontSize: '28px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>−</button>
              <p style={{ fontSize: '52px', fontWeight: '800', color: WHITE, letterSpacing: '-1px', minWidth: '110px', textAlign: 'center' }}>{fmtTime(restSecs)}</p>
              <button onClick={() => setRestSecs(s => s + 15)} style={{ width: '52px', height: '52px', borderRadius: '50%', background: CARD2, border: 'none', color: WHITE, fontSize: '28px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>+</button>
            </div>
            <button onClick={saveRestTime} disabled={savingRest} style={{ ...PILL_BTN, width: '100%', opacity: savingRest ? 0.7 : 1 }}>{savingRest ? 'Saving...' : 'Save'} {!savingRest && <ArrowIcon />}</button>
          </div>
        </>
      )}
      {picker && <NumberPicker label={picker.field === 'weight' ? 'Weight (lbs)' : 'Reps'} value={sets[picker.setIdx][picker.field]} isReps={picker.field === 'reps'} onSave={savePicker} onClose={() => setPicker(null)}/>}
    </div>
  )
}

// ─── Exercise Library ─────────────────────────────────────────────────────────
function ExerciseLibrary({ myExercises, onClose, onAdded, programId }) {
  const [search, setSearch]       = useState('')
  const [adding, setAdding]       = useState(false)
  const [newName, setNewName]     = useState('')
  const [newSets, setNewSets]     = useState('4')
  const [newReps, setNewReps]     = useState('8-10')
  const [newWeight, setNewWeight] = useState('')
  const [saving, setSaving]       = useState(false)

  const myNames = myExercises.map(e => e.name.toLowerCase())
  const combined = [
    ...myExercises.map(e => ({ ...e, isMine: true })),
    ...STANDARD_EXERCISES.filter(n => !myNames.includes(n.toLowerCase())).map(n => ({ id: n, name: n, isMine: false }))
  ]
  const filtered = search.trim() ? combined.filter(e => e.name.toLowerCase().includes(search.toLowerCase())) : combined

  const handleSelectExercise = async (ex) => {
    if (ex.isMine) { onClose(); return }
    setSaving(true)
    await supabase.from('exercises').insert({ name: ex.name, sets: 4, reps: '8-10', weight: '', rest_seconds: 90, program_id: programId })
    setSaving(false); onAdded(); onClose()
  }
  const handleCreateNew = async () => {
    if (!newName.trim()) return
    setSaving(true)
    await supabase.from('exercises').insert({ name: newName, sets: parseInt(newSets)||4, reps: newReps, weight: newWeight, rest_seconds: 90, program_id: programId })
    setSaving(false); onAdded(); onClose()
  }

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 200, background: BG, display: 'flex', flexDirection: 'column', animation: 'slideUp 0.3s cubic-bezier(0.32,0.72,0,1)' }}>
      <style>{`@keyframes slideUp{from{transform:translateY(100%)}to{transform:translateY(0)}}`}</style>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '56px 20px 16px', flexShrink: 0 }}>
        <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}><BackIcon /></button>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={() => setAdding(a => !a)} style={{ width: '40px', height: '40px', borderRadius: '50%', background: CARD2, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><PlusIcon size={18} color={WHITE}/></button>
          <button onClick={onClose} style={{ ...GHOST_BTN, padding: '10px 20px' }}>Done</button>
        </div>
      </div>
      <div style={{ padding: '0 20px 16px', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: CARD2, borderRadius: '100px', padding: '12px 18px' }}>
          <SearchIcon />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search..."
            style={{ background: 'transparent', border: 'none', color: WHITE, fontSize: '16px', fontFamily: 'Inter, sans-serif', outline: 'none', flex: 1 }}/>
          {search && <button onClick={() => setSearch('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: GRAY, fontSize: '20px', lineHeight: 1 }}>×</button>}
        </div>
      </div>
      {adding && (
        <div style={{ padding: '12px 20px 16px', flexShrink: 0, background: CARD2, marginBottom: '2px' }}>
          <p style={{ fontSize: '12px', color: GRAY, marginBottom: '10px', fontWeight: '500' }}>NEW EXERCISE</p>
          <input value={newName} onChange={e => setNewName(e.target.value)} placeholder="Exercise name"
            style={{ width: '100%', background: CARD, borderRadius: '12px', border: 'none', padding: '12px 14px', color: WHITE, fontSize: '16px', fontFamily: 'Inter, sans-serif', outline: 'none', boxSizing: 'border-box', marginBottom: '8px' }}/>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', marginBottom: '10px' }}>
            {[['Sets', newSets, setNewSets, 'number'], ['Reps', newReps, setNewReps, 'text'], ['Weight', newWeight, setNewWeight, 'number']].map(([l, v, s, t]) => (
              <div key={l}>
                <p style={{ fontSize: '11px', color: GRAY2, marginBottom: '4px' }}>{l}</p>
                <input type={t} value={v} onChange={e => s(e.target.value)} placeholder={l}
                  style={{ width: '100%', background: CARD, borderRadius: '10px', border: 'none', padding: '10px', color: WHITE, fontSize: '14px', fontFamily: 'Inter, sans-serif', outline: 'none', boxSizing: 'border-box' }}/>
              </div>
            ))}
          </div>
          <button onClick={handleCreateNew} disabled={saving} style={{ ...PILL_BTN, width: '100%', padding: '14px', opacity: saving ? 0.6 : 1 }}>{saving ? 'Adding...' : 'Add exercise'} <ArrowIcon /></button>
        </div>
      )}
      <div style={{ padding: '16px 20px 8px', flexShrink: 0 }}>
        <h2 style={{ fontSize: '28px', fontWeight: '800', color: WHITE, letterSpacing: '-0.5px' }}>Library</h2>
        <p style={{ fontSize: '13px', color: GRAY, marginTop: '4px' }}>{filtered.length} exercises{search ? ` matching "${search}"` : ''}</p>
      </div>
      <div style={{ flex: 1, overflowY: 'auto', padding: '0 20px' }}>
        {filtered.map((ex, i) => (
          <div key={ex.id || ex.name} onClick={() => handleSelectExercise(ex)}
            style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '16px 0', borderBottom: i < filtered.length-1 ? `1px solid ${CARD2}` : 'none', cursor: 'pointer' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: ex.isMine ? CARD2 : CARD, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              {ex.isMine ? <CheckIcon size={18} color={WHITE}/> : <DumbbellIcon color={GRAY} size={16}/>}
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: '16px', fontWeight: '500', color: WHITE }}>{ex.name}</p>
              {ex.isMine && <p style={{ fontSize: '12px', color: GRAY, marginTop: '2px' }}>{ex.sets} sets · {ex.reps} reps</p>}
            </div>
            <ChevronRight />
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Active Workout Screen ────────────────────────────────────────────────────
function ActiveWorkoutScreen({ prog, elapsed, running, todayLogs, lastWeekLogs, onToggle, onBack, onFinish, onLogSet, onToggleDone, onStartRest, onRefresh }) {
  const [activeEx,    setActiveEx]    = useState(null)
  const [showLibrary, setShowLibrary] = useState(false)
  const [confirmEx,   setConfirmEx]   = useState(null)
  const allExercises = prog.exercises
  const doneCnt = allExercises.filter(e => todayLogs[e.id]?.done).length

  const handleDeleteExercise = async () => {
    if (!confirmEx) return
    await supabase.from('exercises').delete().eq('id', confirmEx.id)
    setConfirmEx(null); onRefresh()
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: BG, zIndex: 150, display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '56px 20px 20px', flexShrink: 0 }}>
        <button onClick={onBack} style={{ background: CARD2, border: 'none', borderRadius: '50%', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><BackIcon /></button>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <button onClick={onToggle} style={{ background: CARD2, border: 'none', borderRadius: '50%', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            {running ? <svg width="14" height="14" viewBox="0 0 24 24" fill={WHITE}><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg> : <svg width="14" height="14" viewBox="0 0 24 24" fill={WHITE}><polygon points="5 3 19 12 5 21 5 3"/></svg>}
          </button>
          <button onClick={onFinish} style={{ ...PILL_BTN, padding: '10px 24px', fontSize: '15px' }}>Finish</button>
        </div>
      </div>
      <div style={{ padding: '0 20px 32px', flexShrink: 0 }}>
        <p style={{ fontSize: '56px', fontWeight: '800', color: WHITE, letterSpacing: '-2px', lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>{fmtTime(elapsed)}</p>
        <p style={{ fontSize: '15px', color: GRAY, marginTop: '8px' }}>{prog.name} · <span style={{ color: doneCnt === allExercises.length ? '#10B981' : GRAY }}>In progress</span></p>
      </div>
      <div style={{ padding: '0 20px calc(80px + env(safe-area-inset-bottom))', flex: 1 }}>
        {allExercises.map((ex, idx) => {
          const log = todayLogs[ex.id] || {}
          return (
            <div key={ex.id}>
              <SwipeableExerciseRow ex={{ ...ex, _log: log }} isDone={!!log.done} onTap={() => setActiveEx(ex)} onToggleDone={() => onToggleDone(ex)} onDeleteIntent={() => setConfirmEx(ex)}/>
              {idx < allExercises.length - 1 && <div style={{ marginLeft: '22px', width: '2px', height: '16px', background: '#222', borderRadius: '1px' }}/>}
            </div>
          )
        })}
        <div onClick={() => setShowLibrary(true)} style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '14px 0', cursor: 'pointer', opacity: 0.6 }}>
          <div style={{ width: '44px', height: '44px', borderRadius: '50%', border: '2px solid #333', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><PlusIcon size={18} color={GRAY}/></div>
          <p style={{ fontSize: '17px', fontWeight: '500', color: GRAY }}>Add exercises</p>
        </div>
      </div>
      {activeEx && <ExerciseDetailScreen ex={activeEx} log={todayLogs[activeEx.id]} lastLog={lastWeekLogs[activeEx.id]} onBack={() => setActiveEx(null)} onLogSet={(exId, w, r, n) => onLogSet(exId, w, r, n)} onStartRest={onStartRest} onDelete={() => { setActiveEx(null); setConfirmEx(activeEx) }}/>}
      {showLibrary && <ExerciseLibrary myExercises={prog.exercises} programId={prog.id} onAdded={onRefresh} onClose={() => setShowLibrary(false)}/>}
      {confirmEx && <ConfirmDeleteModal title={`Delete "${confirmEx.name}"?`} subtitle="This will remove the exercise from your program. All logged data will be lost." onConfirm={handleDeleteExercise} onCancel={() => setConfirmEx(null)}/>}
    </div>
  )
}

// ─── Rest Timer ───────────────────────────────────────────────────────────────
function RestTimer({ restSeconds, onDismiss }) {
  const endRef = useRef(Date.now() + restSeconds * 1000)
  const [remaining, setRemaining] = useState(restSeconds)
  const intervalRef = useRef(null), alerted = useRef(false)
  const tick = () => {
    const r = Math.max(0, Math.round((endRef.current - Date.now()) / 1000)); setRemaining(r)
    if (r <= 0 && !alerted.current) { alerted.current = true; clearInterval(intervalRef.current); playBeep(); vibrate([300,100,300]) }
  }
  useEffect(() => { intervalRef.current = setInterval(tick, 500); return () => clearInterval(intervalRef.current) }, [])
  const addTime = (s) => { endRef.current = Math.max(Date.now(), endRef.current)+s*1000; alerted.current=false; tick() }
  const pct = remaining/restSeconds, circ = 2*Math.PI*36, isDone = remaining===0
  return (
    <div style={{ position: 'fixed', bottom: '90px', left: '50%', transform: 'translateX(-50%)', width: 'calc(100% - 32px)', maxWidth: '390px', zIndex: 500, background: isDone ? '#0d2a1a' : '#1a1a1a', borderRadius: '20px', padding: '16px 20px', boxShadow: '0 24px 48px rgba(0,0,0,0.6)' }}>
      {isDone ? (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div><p style={{ fontSize: '16px', fontWeight: '700', color: WHITE }}>Rest complete!</p><p style={{ fontSize: '13px', color: GRAY, marginTop: '2px' }}>Ready for your next set</p></div>
          <button onClick={onDismiss} style={{ ...GHOST_BTN, padding: '10px 18px' }}>Done</button>
        </div>
      ) : (
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ position: 'relative', width: '88px', height: '88px', flexShrink: 0 }}>
            <svg width="88" height="88" viewBox="0 0 88 88">
              <circle cx="44" cy="44" r="36" fill="none" stroke="#222" strokeWidth="4"/>
              <circle cx="44" cy="44" r="36" fill="none" stroke={remaining < 10 ? '#EF4444' : WHITE} strokeWidth="4" strokeDasharray={`${circ*pct} ${circ}`} strokeLinecap="round" transform="rotate(-90 44 44)" style={{ transition: 'stroke-dasharray 0.4s linear' }}/>
            </svg>
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: '18px', fontWeight: '700', color: remaining < 10 ? '#EF4444' : WHITE }}>{fmtTime(remaining)}</span>
            </div>
          </div>
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: '13px', color: GRAY, marginBottom: '10px' }}>Rest timer</p>
            <div style={{ display: 'flex', gap: '6px', marginBottom: '8px' }}>
              {[-30,-15,+15,+30].map(s => (
                <button key={s} onClick={() => addTime(s)} style={{ flex: 1, padding: '8px 0', borderRadius: '10px', cursor: 'pointer', background: CARD2, border: 'none', color: WHITE, fontSize: '12px', fontFamily: 'Inter, sans-serif', fontWeight: '500' }}>{s > 0 ? `+${s}s` : `${s}s`}</button>
              ))}
            </div>
            <button onClick={onDismiss} style={{ width: '100%', padding: '8px', borderRadius: '10px', background: 'none', border: 'none', color: GRAY, fontSize: '12px', fontFamily: 'Inter, sans-serif', cursor: 'pointer' }}>Skip rest</button>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Sheet ────────────────────────────────────────────────────────────────────
function Sheet({ title, onClose, children }) {
  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 200, backdropFilter: 'blur(4px)' }}/>
      <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 201, background: '#1a1a1a', borderRadius: '24px 24px 0 0', padding: '0 20px calc(40px + env(safe-area-inset-bottom))', maxHeight: '90vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'center', padding: '12px 0 8px' }}><div style={{ width: '36px', height: '4px', borderRadius: '2px', background: CARD2 }}/></div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', paddingTop: '8px' }}>
          <p style={{ fontSize: '20px', fontWeight: '700', color: WHITE }}>{title}</p>
          <button onClick={onClose} style={{ background: CARD2, border: 'none', borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><CloseIcon /></button>
        </div>
        {children}
      </div>
    </>
  )
}

// ─── Body Weight ──────────────────────────────────────────────────────────────
function BodyWeightSection() {
  const [logs, setLogs]         = useState([])
  const [weight, setWeight]     = useState('')
  const [saving, setSaving]     = useState(false)
  const [todayLog, setTodayLog] = useState(null)
  useEffect(() => { load() }, [])
  const load = async () => {
    const { data } = await supabase.from('body_weight_logs').select('*').order('logged_date')
    setLogs(data || [])
    const td = data?.find(l => l.logged_date === TODAY)
    if (td) { setTodayLog(td); setWeight(String(td.weight_lbs)) }
  }
  const save = async () => {
    if (!weight) return; setSaving(true)
    if (todayLog) await supabase.from('body_weight_logs').update({ weight_lbs: parseFloat(weight) }).eq('id', todayLog.id)
    else await supabase.from('body_weight_logs').insert({ logged_date: TODAY, weight_lbs: parseFloat(weight) })
    await load(); setSaving(false)
  }
  const latest = logs[logs.length-1], prev = logs[logs.length-2]
  const diff = latest && prev ? (parseFloat(latest.weight_lbs)-parseFloat(prev.weight_lbs)).toFixed(1) : null
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div style={{ background: CARD, borderRadius: '20px', padding: '24px' }}>
        <div style={{ marginBottom: '20px' }}>
          <p style={{ fontSize: '13px', color: GRAY, marginBottom: '4px' }}>Current weight</p>
          <p style={{ fontSize: '36px', fontWeight: '700', color: WHITE }}>{latest?.weight_lbs || '—'} <span style={{ fontSize: '16px', color: GRAY, fontWeight: '400' }}>lbs</span></p>
          {diff !== null && <p style={{ fontSize: '13px', color: parseFloat(diff) <= 0 ? '#10B981' : GRAY, marginTop: '4px' }}>{parseFloat(diff) > 0 ? '+' : ''}{diff} lbs since last</p>}
        </div>
        <label style={{ fontSize: '12px', color: GRAY, display: 'block', marginBottom: '8px', fontWeight: '500' }}>TODAY'S WEIGHT (LBS)</label>
        <input type="number" value={weight} onChange={e => setWeight(e.target.value)} placeholder="185"
          style={{ width: '100%', background: CARD2, border: 'none', borderRadius: '14px', padding: '16px', color: WHITE, fontSize: '20px', fontWeight: '600', fontFamily: 'Inter, sans-serif', outline: 'none', boxSizing: 'border-box', marginBottom: '14px' }}/>
        <button onClick={save} style={{ ...PILL_BTN, width: '100%', opacity: saving ? 0.7 : 1 }}>{saving ? 'Saving...' : todayLog ? 'Update weight' : 'Log weight'} {!saving && <ArrowIcon />}</button>
      </div>
      {logs.length > 0 && (
        <div style={{ background: CARD, borderRadius: '20px', padding: '24px' }}>
          <p style={{ fontSize: '18px', fontWeight: '700', color: WHITE, marginBottom: '16px' }}>History</p>
          <div style={{ display: 'flex', flexDirection: 'column', maxHeight: '280px', overflowY: 'auto' }}>
            {[...logs].reverse().map(l => (
              <div key={l.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 0', borderBottom: `1px solid ${CARD2}` }}>
                <p style={{ fontSize: '14px', color: l.logged_date === TODAY ? WHITE : GRAY }}>{new Date(l.logged_date + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</p>
                <p style={{ fontSize: '16px', fontWeight: '600', color: WHITE }}>{l.weight_lbs} <span style={{ fontSize: '12px', color: GRAY, fontWeight: '400' }}>lbs</span></p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

const inputStyle = { width: '100%', background: CARD2, border: 'none', borderRadius: '12px', padding: '14px 16px', color: WHITE, fontSize: '16px', fontFamily: 'Inter, sans-serif', outline: 'none', boxSizing: 'border-box', marginBottom: '12px' }
const labelStyle = { fontSize: '12px', color: GRAY, display: 'block', marginBottom: '6px', fontWeight: '500' }

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function Workout({ workoutActive, workoutElapsed, workoutRunning, onStartWorkout, onStopWorkout, onToggleTimer, recoveryScore }) {
  const [programs, setPrograms]                   = useState([])
  const [todayLogs, setTodayLogs]                 = useState({})
  const [lastWeekLogs, setLastWeekLogs]           = useState({})
  const [selected, setSelected]                   = useState(null)
  const [selectedDayOfWeek, setSelectedDayOfWeek] = useState(null)
  const [loading, setLoading]                     = useState(true)
  const [restTimer, setRestTimer]                 = useState(null)
  const [activeSheet, setActiveSheet]             = useState(null)
  const [activeView, setActiveView]               = useState('training')
  const [showWorkout, setShowWorkout]             = useState(false)
  const [showCoach, setShowCoach]                 = useState(false)
  const [editingProg, setEditingProg]             = useState(null)
  const [progForm, setProgForm]                   = useState({ name: '', tag: 'Strength' })
  const [weeklyWorkoutDays, setWeeklyWorkoutDays] = useState(new Set())
  const [workoutStreak, setWorkoutStreak]         = useState(0)
  const [confirmDeleteProg, setConfirmDeleteProg] = useState(null)

  useEffect(() => { loadAll() }, [])

  const loadAll = async () => {
    setLoading(true)
    try {
      const [{ data: progs }, { data: exs }, { data: tLogs }, { data: lwLogs }] = await Promise.all([
        supabase.from('programs').select('*').order('id'),
        supabase.from('exercises').select('*').order('sort_order'),
        supabase.from('workout_logs').select('*').eq('logged_date', TODAY),
        supabase.from('workout_logs').select('*').lt('logged_date', TODAY).order('logged_date', { ascending: false }).limit(200),
      ])
      const exMap = {}; const topLevel = []
      exs?.forEach(e => { exMap[e.id] = { ...e, variants: [] } })
      exs?.forEach(e => { if (e.parent_id) { if (exMap[e.parent_id]) exMap[e.parent_id].variants.push(exMap[e.id]) } else topLevel.push(exMap[e.id]) })
      setPrograms(progs?.map(p => ({ ...p, exercises: topLevel.filter(e => e.program_id === p.id) })) || [])
      const tMap = {}; tLogs?.forEach(l => { tMap[l.exercise_id] = l }); setTodayLogs(tMap)
      const lwMap = {}; lwLogs?.forEach(l => { if (!lwMap[l.exercise_id]) lwMap[l.exercise_id] = l }); setLastWeekLogs(lwMap)

      // Weekly workout days
      const d = new Date(), sunOffset = d.getDate() - d.getDay(), sunday = new Date(d)
      sunday.setDate(sunOffset)
      const startOfWeek = `${sunday.getFullYear()}-${String(sunday.getMonth()+1).padStart(2,'0')}-${String(sunday.getDate()).padStart(2,'0')}`
      const { data: weekData } = await supabase.from('workout_logs').select('logged_date').gte('logged_date', startOfWeek)
      setWeeklyWorkoutDays(new Set(weekData?.map(l => l.logged_date) || []))

      // Streak
      const { data: streakData } = await supabase.from('workout_logs').select('logged_date').order('logged_date', { ascending: false }).limit(500)
      const getWeekSunday = (dateStr) => {
        const dt = new Date(dateStr + 'T12:00:00'); dt.setDate(dt.getDate() - dt.getDay())
        return `${dt.getFullYear()}-${String(dt.getMonth()+1).padStart(2,'0')}-${String(dt.getDate()).padStart(2,'0')}`
      }
      const weeksWithLogs = new Set(streakData?.map(l => getWeekSunday(l.logged_date)) || [])
      let streak = 0
      const checkDt = new Date(); checkDt.setDate(checkDt.getDate() - checkDt.getDay())
      while (true) {
        const key = `${checkDt.getFullYear()}-${String(checkDt.getMonth()+1).padStart(2,'0')}-${String(checkDt.getDate()).padStart(2,'0')}`
        if (weeksWithLogs.has(key)) { streak++; checkDt.setDate(checkDt.getDate() - 7) } else break
      }
      setWorkoutStreak(streak)
    } catch(e) { console.error(e) }
    setLoading(false)
  }

  const prog = programs.find(p => p.id === selected)
  const donePct = (() => {
    if (!prog) return 0
    const ids = prog.exercises.flatMap(e => [e.id, ...(e.variants||[]).map(v => v.id)])
    return Math.round(ids.filter(id => todayLogs[id]?.done).length / Math.max(ids.length,1) * 100)
  })()

  const handleLogChange = async (exId, field, value) => {
    setTodayLogs(prev => ({ ...prev, [exId]: { ...(prev[exId]||{}), [field]: value, exercise_id: exId } }))
    const existing = todayLogs[exId]
    if (existing?.id) { await supabase.from('workout_logs').update({ [field]: value }).eq('id', existing.id) }
    else { const { data } = await supabase.from('workout_logs').insert({ exercise_id: exId, logged_date: TODAY, [field]: value }).select().single(); if (data) setTodayLogs(prev => ({ ...prev, [exId]: data })) }
  }

  const handleLogSet = async (exId, weight, reps, notes = '') => {
    setTodayLogs(prev => ({ ...prev, [exId]: { ...(prev[exId]||{}), weight_used: weight, reps_done: reps, notes, done: true, exercise_id: exId } }))
    const existing = todayLogs[exId]
    if (existing?.id) { await supabase.from('workout_logs').update({ weight_used: weight, reps_done: reps, notes, done: true }).eq('id', existing.id) }
    else { const { data } = await supabase.from('workout_logs').insert({ exercise_id: exId, logged_date: TODAY, weight_used: weight, reps_done: reps, notes, done: true }).select().single(); if (data) setTodayLogs(prev => ({ ...prev, [exId]: data })) }
  }

  const startRest       = (secs) => setRestTimer({ secs: getRecommendedRest(secs, recoveryScore), key: Date.now() })
  const handleToggleDone = (ex) => { const newDone = !todayLogs[ex.id]?.done; handleLogChange(ex.id, 'done', newDone); if (newDone) startRest(ex.rest_seconds || 90) }
  const handleSelectProgram = (p, dow) => {
    if (selected === p.id && selectedDayOfWeek === dow) { setSelected(null); setSelectedDayOfWeek(null) }
    else { setSelected(p.id); setSelectedDayOfWeek(dow) }
  }
  const handleStartWorkout  = () => { onStartWorkout(); setShowWorkout(true) }
  const handleFinishWorkout = () => { onStopWorkout(); setSelected(null); setSelectedDayOfWeek(null); setShowWorkout(false) }
  const saveProg = async () => {
    if (!progForm.name.trim()) return
    if (editingProg) await supabase.from('programs').update(progForm).eq('id', editingProg.id)
    else await supabase.from('programs').insert(progForm)
    setActiveSheet(null); loadAll()
  }
  const deleteProg = async () => {
    await supabase.from('programs').delete().eq('id', editingProg.id)
    setSelected(null); setSelectedDayOfWeek(null); setActiveSheet(null); loadAll()
  }

  const dateStr = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', flexDirection: 'column', gap: '16px' }}>
      <div style={{ width: '36px', height: '36px', borderRadius: '50%', border: `3px solid ${CARD2}`, borderTop: `3px solid ${WHITE}`, animation: 'spin 1s linear infinite' }}/>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )

  return (
    <div style={{ padding: '56px 20px calc(100px + env(safe-area-inset-bottom))', background: BG, minHeight: '100dvh', boxSizing: 'border-box' }}>

      {workoutActive && showWorkout && prog && (
        <ActiveWorkoutScreen prog={prog} elapsed={workoutElapsed} running={workoutRunning} todayLogs={todayLogs} lastWeekLogs={lastWeekLogs}
          onToggle={onToggleTimer} onBack={() => setShowWorkout(false)} onFinish={handleFinishWorkout}
          onLogSet={handleLogSet} onToggleDone={handleToggleDone} onStartRest={startRest} onRefresh={loadAll}/>
      )}

      {restTimer && <RestTimer key={restTimer.key} restSeconds={restTimer.secs} onDismiss={() => setRestTimer(null)} />}

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '34px', fontWeight: '800', color: WHITE, letterSpacing: '-1px', lineHeight: 1 }}>Training</h1>
          <p style={{ fontSize: '14px', color: GRAY, marginTop: '6px' }}>{dateStr}</p>
          {workoutStreak > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '8px' }}>
              <FireIcon size={13} color="#6366F1"/>
              <span style={{ fontSize: '13px', color: '#6366F1', fontWeight: '600' }}>{workoutStreak} week streak</span>
            </div>
          )}
        </div>
        <button onClick={() => setShowCoach(true)}
          style={{ width: '40px', height: '40px', borderRadius: '12px', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', background: CARD, boxShadow: '0 0 16px rgba(99,102,241,0.5), 0 0 32px rgba(59,130,246,0.25)' }}>
          <MustacheIcon size={26} />
        </button>
      </div>

      {/* View toggle */}
      <div style={{ display: 'flex', background: CARD, borderRadius: '14px', padding: '4px', marginBottom: '28px' }}>
        {[{ id: 'training', label: 'Training' }, { id: 'weight', label: 'Body Weight' }].map(v => (
          <button key={v.id} onClick={() => setActiveView(v.id)} style={{ flex: 1, padding: '10px', borderRadius: '10px', cursor: 'pointer', background: activeView === v.id ? WHITE : 'transparent', border: 'none', color: activeView === v.id ? '#111' : GRAY, fontSize: '14px', fontWeight: activeView === v.id ? '600' : '400', fontFamily: 'Inter, sans-serif', transition: 'all 0.2s' }}>{v.label}</button>
        ))}
      </div>

      {activeView === 'weight' && <BodyWeightSection />}

      {activeView === 'training' && (
        <>
          {prog ? (
            <ProgressBorderCard pct={donePct}>
              <div style={{ padding: '20px' }}>
                <p style={{ fontSize: '13px', color: GRAY, marginBottom: '6px' }}>Today's Workout</p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
                  <p style={{ fontSize: '28px', fontWeight: '800', color: WHITE, letterSpacing: '-0.5px' }}>{prog.name}</p>
                  <p style={{ fontSize: '38px', fontWeight: '800', color: WHITE, letterSpacing: '-1px' }}>{donePct}%</p>
                </div>
                <div style={{ display: 'flex', gap: '16px', marginBottom: '18px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <DumbbellIcon color={GRAY} size={13}/>
                    <span style={{ fontSize: '13px', color: GRAY }}>{prog.exercises.length} Exercises</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <TimerIcon color={GRAY}/>
                    <span style={{ fontSize: '13px', color: GRAY }}>~52 min avg.</span>
                  </div>
                </div>
                {workoutActive && !showWorkout ? (
                  <button onClick={() => setShowWorkout(true)} style={{ ...PILL_BTN, width: '100%', padding: '16px', fontSize: '16px', background: CARD2, color: WHITE }}>
                    {fmtTime(workoutElapsed)} · Resume <ArrowIcon color={WHITE}/>
                  </button>
                ) : (
                  <button onClick={handleStartWorkout} style={{ ...PILL_BTN, width: '100%', padding: '16px', fontSize: '16px' }}>
                    Start Workout <ArrowIcon color="#111"/>
                  </button>
                )}
              </div>
            </ProgressBorderCard>
          ) : (
            <div style={{ background: CARD, borderRadius: '20px', padding: '28px', marginBottom: '28px', textAlign: 'center' }}>
              <p style={{ fontSize: '17px', fontWeight: '600', color: WHITE, marginBottom: '6px' }}>No workout selected</p>
              <p style={{ fontSize: '14px', color: GRAY2 }}>Tap a day below to get started</p>
            </div>
          )}

          <div style={{ marginBottom: '28px' }}>
            <p style={{ fontSize: '22px', fontWeight: '700', color: WHITE, marginBottom: '16px' }}>This Week</p>
            <WeekStrip
              programs={programs}
              selectedDayOfWeek={selectedDayOfWeek}
              onSelect={handleSelectProgram}
              onAddProgram={() => { setEditingProg(null); setProgForm({ name: '', tag: 'Strength' }); setActiveSheet('prog') }}
              onDeleteProgram={(dow) => { const p = programs[dow % programs.length]; if (p) setConfirmDeleteProg(p) }}
            />
          </div>

          {programs.length > 0 && (
            <div>
              <p style={{ fontSize: '22px', fontWeight: '700', color: WHITE, marginBottom: '16px' }}>Focus Areas</p>
              <ThisWeekSection weeklyWorkoutDays={weeklyWorkoutDays} workoutStreak={workoutStreak} todayLogs={todayLogs}/>
            </div>
          )}
        </>
      )}

      {confirmDeleteProg && (
        <ConfirmDeleteModal
          title={`Delete "${confirmDeleteProg.name}"?`}
          subtitle="This will permanently delete the program and all its exercises. This cannot be undone."
          onConfirm={async () => { await supabase.from('programs').delete().eq('id', confirmDeleteProg.id); setConfirmDeleteProg(null); setSelected(null); setSelectedDayOfWeek(null); loadAll() }}
          onCancel={() => setConfirmDeleteProg(null)}
        />
      )}

      {showCoach && (
        <Sheet title="AI Coach" onClose={() => setShowCoach(false)}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '20px 0 8px', gap: '16px' }}>
            <div style={{ width: '72px', height: '72px', borderRadius: '50%', background: 'linear-gradient(135deg, #3B82F6, #6366F1)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 28px rgba(99,102,241,0.5)' }}>
              <MustacheIcon size={36} />
            </div>
            <p style={{ fontSize: '16px', color: GRAY, textAlign: 'center', lineHeight: 1.6 }}>Your AI coach is coming soon. Once wired up it'll analyze your training history and give personalized recommendations on progressive overload, recovery, and what to train next.</p>
          </div>
        </Sheet>
      )}

      {activeSheet === 'prog' && (
        <Sheet title={editingProg ? 'Edit program' : 'New program'} onClose={() => setActiveSheet(null)}>
          <label style={labelStyle}>PROGRAM NAME</label>
          <input style={inputStyle} placeholder="e.g. Push" value={progForm.name} onChange={e => setProgForm(f => ({ ...f, name: e.target.value }))}/>
          <label style={labelStyle}>TYPE</label>
          <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
            {['Strength','Cardio','Mobility','Sport'].map(t => (
              <button key={t} onClick={() => setProgForm(f => ({ ...f, tag: t }))} style={{ flex: 1, padding: '10px', borderRadius: '12px', cursor: 'pointer', background: progForm.tag === t ? WHITE : CARD2, border: 'none', color: progForm.tag === t ? '#111' : GRAY, fontSize: '13px', fontFamily: 'Inter, sans-serif', fontWeight: progForm.tag === t ? '600' : '400' }}>{t}</button>
            ))}
          </div>
          <button onClick={saveProg} style={{ ...PILL_BTN, width: '100%', marginBottom: '10px' }}>{editingProg ? 'Save changes' : 'Create program'} <ArrowIcon /></button>
          {editingProg && <button onClick={deleteProg} style={{ ...GHOST_BTN, width: '100%', color: '#EF4444' }}>Delete program</button>}
        </Sheet>
      )}
    </div>
  )
}