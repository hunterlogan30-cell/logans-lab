import { useState, useEffect, useRef } from 'react'
import { supabase } from '../supabase'

const BG     = '#141414'
const CARD   = '#1e1e1e'
const CARD2  = '#252525'
const BORDER = '#2a2a2a'
const WHITE  = '#ffffff'
const GRAY   = '#888'
const GRAY2  = '#555'

const PILL_BTN  = { background: WHITE, color: '#111', border: 'none', borderRadius: '100px', padding: '14px 28px', fontSize: '15px', fontWeight: '600', fontFamily: 'Inter, sans-serif', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }
const GHOST_BTN = { background: CARD2, color: WHITE, border: `1px solid ${BORDER}`, borderRadius: '100px', padding: '12px 24px', fontSize: '14px', fontWeight: '500', fontFamily: 'Inter, sans-serif', cursor: 'pointer' }

const fmtTime = (s) => {
  const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), sec = s % 60
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

const TODAY = new Date().toISOString().split('T')[0]

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
const EditIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={GRAY} strokeWidth="2" strokeLinecap="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
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
const ChevronRight = ({ color = GRAY }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
)

// ─── Progress Border Card ─────────────────────────────────────────────────────
function ProgressBorderCard({ pct, children }) {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const dpr = window.devicePixelRatio || 1
    const W = canvas.offsetWidth
    const H = canvas.offsetHeight
    if (!W || !H) return
    canvas.width = W * dpr
    canvas.height = H * dpr
    const ctx = canvas.getContext('2d')
    ctx.scale(dpr, dpr)
    ctx.clearRect(0, 0, W, H)
    const r = 20, lw = 3, half = lw / 2

    const drawRect = () => {
      ctx.beginPath()
      ctx.moveTo(r + half, half)
      ctx.lineTo(W - r - half, half)
      ctx.arcTo(W - half, half, W - half, r + half, r)
      ctx.lineTo(W - half, H - r - half)
      ctx.arcTo(W - half, H - half, W - r - half, H - half, r)
      ctx.lineTo(r + half, H - half)
      ctx.arcTo(half, H - half, half, H - r - half, r)
      ctx.lineTo(half, r + half)
      ctx.arcTo(half, half, r + half, half, r)
      ctx.closePath()
    }

    drawRect()
    ctx.strokeStyle = BORDER; ctx.lineWidth = lw; ctx.stroke()

    if (pct > 0) {
      const perim = 2*(W-2*r) + 2*(H-2*r) + 2*Math.PI*r
      drawRect()
      ctx.strokeStyle = WHITE; ctx.lineWidth = lw; ctx.lineCap = 'round'
      ctx.setLineDash([perim * pct/100, perim]); ctx.stroke(); ctx.setLineDash([])
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
function WeekStrip({ programs, selectedId, onSelect }) {
  const DAYS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']
  const todayIdx = new Date().getDay()
  const scrollRef = useRef(null)

  useEffect(() => {
    if (scrollRef.current) {
      const el = scrollRef.current.children[todayIdx]
      if (el) el.scrollIntoView({ inline: 'center', behavior: 'smooth' })
    }
  }, [])

  return (
    <div ref={scrollRef} style={{ display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '4px', scrollbarWidth: 'none' }}>
      {DAYS.map((day, i) => {
        const prog = programs.length ? programs[i % programs.length] : null
        const isToday = i === todayIdx
        return (
          <div key={day} onClick={() => prog && onSelect(prog)}
            style={{ minWidth: '148px', borderRadius: '18px', padding: '18px', background: isToday ? WHITE : CARD, border: `1px solid ${selectedId === prog?.id && isToday ? WHITE : isToday ? 'transparent' : BORDER}`, flexShrink: 0, cursor: prog ? 'pointer' : 'default', opacity: !prog ? 0.4 : 1 }}>
            <p style={{ fontSize: '13px', color: isToday ? '#777' : GRAY2, marginBottom: '8px', fontWeight: '500' }}>{day}</p>
            <p style={{ fontSize: '20px', fontWeight: '700', color: isToday ? '#111' : WHITE, marginBottom: '12px', letterSpacing: '-0.3px' }}>{prog?.name || 'Rest'}</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '5px' }}>
              <DumbbellIcon color={isToday ? '#777' : GRAY2} size={12}/>
              <span style={{ fontSize: '12px', color: isToday ? '#777' : GRAY2 }}>{prog?.exercises?.length || 0} Exercises</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <TimerIcon color={isToday ? '#777' : GRAY2}/>
              <span style={{ fontSize: '12px', color: isToday ? '#777' : GRAY2 }}>~52 min avg.</span>
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ─── Focus Areas ──────────────────────────────────────────────────────────────
function FocusAreas({ todayLogs, programs }) {
  const allExIds = programs.flatMap(p => (p.exercises||[]).flatMap(e => [e.id, ...(e.variants||[]).map(v => v.id)]))
  const doneCnt = allExIds.filter(id => todayLogs[id]?.done).length
  const total = Math.max(allExIds.length, 1)
  const volume = Object.values(todayLogs).reduce((s,l) => s + (parseFloat(l.weight_used)||0)*(parseFloat(l.reps_done)||0), 0)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: '16px', padding: '18px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <p style={{ fontSize: '12px', color: GRAY, marginBottom: '6px' }}>Volume · Today</p>
          <p style={{ fontSize: '28px', fontWeight: '700', color: WHITE }}>{volume > 0 ? volume.toLocaleString() : '—'}</p>
          <p style={{ fontSize: '12px', color: GRAY, marginTop: '2px' }}>lbs</p>
        </div>
        <svg width="80" height="36" viewBox="0 0 80 36" fill="none">
          <polyline points="0,28 20,20 40,24 60,10 80,16" stroke={GRAY2} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
      <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: '16px', padding: '18px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <p style={{ fontSize: '12px', color: GRAY, marginBottom: '6px' }}>Exercises · Today</p>
          <p style={{ fontSize: '28px', fontWeight: '700', color: WHITE }}>{doneCnt}</p>
          <p style={{ fontSize: '12px', color: GRAY, marginTop: '2px' }}>of {total}</p>
        </div>
        <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap', maxWidth: '120px', justifyContent: 'flex-end', paddingTop: '8px' }}>
          {Array.from({ length: Math.min(total,10) }, (_,i) => (
            <div key={i} style={{ width: '8px', height: '8px', borderRadius: '50%', background: i < doneCnt ? WHITE : GRAY2 }}/>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Exercise Detail Sheet ────────────────────────────────────────────────────
function ExerciseDetailSheet({ ex, log, lastLog, onClose, onLog, onStartRest }) {
  const [weight, setWeight] = useState(String(log?.weight_used || lastLog?.weight_used || ex.weight || ''))
  const [reps, setReps] = useState(String(log?.reps_done || ex.reps || ''))
  const [notes, setNotes] = useState(log?.notes || '')
  const [logged, setLogged] = useState(false)

  const handleLog = () => {
    if (!weight || !reps) return
    onLog(ex.id, weight, reps, notes)
    setLogged(true)
    setTimeout(() => { onStartRest(ex.rest_seconds || 90); onClose() }, 800)
  }

  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 300, backdropFilter: 'blur(4px)' }}/>
      <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 301, background: '#1a1a1a', borderRadius: '24px 24px 0 0', padding: '0 20px calc(40px + env(safe-area-inset-bottom))', animation: 'slideUp 0.3s cubic-bezier(0.32,0.72,0,1)', maxHeight: '90vh', overflowY: 'auto' }}>
        <style>{`@keyframes slideUp{from{transform:translateY(100%)}to{transform:translateY(0)}}`}</style>
        <div style={{ display: 'flex', justifyContent: 'center', padding: '12px 0 20px' }}>
          <div style={{ width: '36px', height: '4px', borderRadius: '2px', background: BORDER }}/>
        </div>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
          <p style={{ fontSize: '24px', fontWeight: '700', color: WHITE }}>{ex.name}</p>
          <button onClick={onClose} style={{ background: CARD2, border: `1px solid ${BORDER}`, borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}>
            <CloseIcon />
          </button>
        </div>

        {/* Stats row */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: '24px' }}>
          {[{ label: 'Sets', value: ex.sets }, { label: 'Reps', value: ex.reps }, { label: 'Target', value: ex.weight > 0 ? `${ex.weight} lbs` : '—' }, { label: 'Rest', value: `${ex.rest_seconds || 90}s` }].map(s => (
            <div key={s.label} style={{ flex: 1, background: CARD2, border: `1px solid ${BORDER}`, borderRadius: '12px', padding: '10px 8px', textAlign: 'center' }}>
              <p style={{ fontSize: '11px', color: GRAY2, marginBottom: '4px', fontWeight: '500' }}>{s.label}</p>
              <p style={{ fontSize: '15px', fontWeight: '700', color: WHITE }}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Last workout */}
        {(lastLog?.weight_used || lastLog?.reps_done) && (
          <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: '12px', padding: '12px 16px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <TimerIcon />
            <span style={{ fontSize: '13px', color: GRAY }}>Last: <strong style={{ color: WHITE }}>{lastLog.weight_used ? `${lastLog.weight_used} lbs` : ''}{lastLog.weight_used && lastLog.reps_done ? ' · ' : ''}{lastLog.reps_done ? `${lastLog.reps_done} reps` : ''}</strong></span>
          </div>
        )}

        {/* Weight + Reps inputs */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
          <div>
            <label style={{ fontSize: '12px', color: GRAY, display: 'block', marginBottom: '8px', fontWeight: '500' }}>WEIGHT (LBS)</label>
            <input type="number" value={weight} onChange={e => setWeight(e.target.value)} placeholder={String(ex.weight || '0')}
              style={{ width: '100%', background: CARD2, border: `1px solid ${BORDER}`, borderRadius: '14px', padding: '16px', color: WHITE, fontSize: '24px', fontWeight: '600', fontFamily: 'Inter, sans-serif', outline: 'none', boxSizing: 'border-box', textAlign: 'center' }}/>
          </div>
          <div>
            <label style={{ fontSize: '12px', color: GRAY, display: 'block', marginBottom: '8px', fontWeight: '500' }}>REPS DONE</label>
            <input type="text" value={reps} onChange={e => setReps(e.target.value)} placeholder={String(ex.reps || '0')}
              style={{ width: '100%', background: CARD2, border: `1px solid ${BORDER}`, borderRadius: '14px', padding: '16px', color: WHITE, fontSize: '24px', fontWeight: '600', fontFamily: 'Inter, sans-serif', outline: 'none', boxSizing: 'border-box', textAlign: 'center' }}/>
          </div>
        </div>

        {/* Notes */}
        <label style={{ fontSize: '12px', color: GRAY, display: 'block', marginBottom: '8px', fontWeight: '500' }}>NOTES</label>
        <textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="e.g. felt strong, drop set on last set..."
          rows={3} style={{ width: '100%', background: CARD2, border: `1px solid ${BORDER}`, borderRadius: '14px', padding: '14px 16px', color: WHITE, fontSize: '15px', fontFamily: 'Inter, sans-serif', outline: 'none', boxSizing: 'border-box', resize: 'none', lineHeight: '1.6', marginBottom: '20px' }}/>

        {/* Log button */}
        <button onClick={handleLog} disabled={!weight || !reps}
          style={{ ...PILL_BTN, width: '100%', padding: '18px', fontSize: '16px', background: logged ? '#1a3a2a' : (!weight||!reps) ? CARD2 : WHITE, color: logged ? '#10B981' : (!weight||!reps) ? GRAY : '#111', border: logged ? '1px solid #10B981' : 'none', opacity: (!weight||!reps) ? 0.5 : 1, transition: 'all 0.3s' }}>
          {logged ? <><CheckIcon size={18} color="#10B981"/> Set Logged</> : <>Log Set <ArrowIcon /></>}
        </button>
      </div>
    </>
  )
}

// ─── Active Workout Screen ────────────────────────────────────────────────────
function ActiveWorkoutScreen({ prog, elapsed, running, todayLogs, lastWeekLogs, onToggle, onFinish, onLogSet, onToggleDone, onStartRest, recoveryScore }) {
  const [activeEx, setActiveEx] = useState(null)

  const allExercises = prog.exercises
  const doneCnt = allExercises.filter(e => todayLogs[e.id]?.done).length

  return (
    <div style={{ position: 'fixed', inset: 0, background: BG, zIndex: 150, display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>

      {/* Top bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '56px 20px 20px', flexShrink: 0 }}>
        <button onClick={onToggle} style={{ background: CARD2, border: `1px solid ${BORDER}`, borderRadius: '50%', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
          {running
            ? <svg width="14" height="14" viewBox="0 0 24 24" fill={WHITE}><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>
            : <svg width="14" height="14" viewBox="0 0 24 24" fill={WHITE}><polygon points="5 3 19 12 5 21 5 3"/></svg>
          }
        </button>

        <button onClick={onFinish}
          style={{ ...PILL_BTN, padding: '10px 24px', fontSize: '15px' }}>
          Finish
        </button>
      </div>

      {/* Timer + title */}
      <div style={{ padding: '0 20px 32px', flexShrink: 0 }}>
        <p style={{ fontSize: '56px', fontWeight: '800', color: WHITE, letterSpacing: '-2px', lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>{fmtTime(elapsed)}</p>
        <p style={{ fontSize: '15px', color: GRAY, marginTop: '8px' }}>{prog.name} · <span style={{ color: doneCnt === allExercises.length ? '#10B981' : GRAY }}>In progress</span></p>
      </div>

      {/* Exercise list */}
      <div style={{ padding: '0 20px calc(60px + env(safe-area-inset-bottom))', display: 'flex', flexDirection: 'column', gap: '0' }}>
        {allExercises.map((ex, idx) => {
          const log = todayLogs[ex.id] || {}
          const isDone = !!log.done

          return (
            <div key={ex.id}>
              <div onClick={() => setActiveEx(ex)}
                style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '14px 0', cursor: 'pointer' }}>

                {/* Circle check */}
                <div onClick={e => { e.stopPropagation(); onToggleDone(ex) }}
                  style={{ width: '44px', height: '44px', borderRadius: '50%', flexShrink: 0, background: isDone ? WHITE : 'transparent', border: `2px solid ${isDone ? WHITE : BORDER}`, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}>
                  {isDone && <CheckIcon size={18} color="#111"/>}
                </div>

                {/* Name + status */}
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: '17px', fontWeight: '600', color: isDone ? GRAY : WHITE, textDecoration: isDone ? 'line-through' : 'none' }}>{ex.name}</p>
                  <p style={{ fontSize: '13px', color: GRAY2, marginTop: '3px' }}>
                    {isDone
                      ? <span style={{ color: GRAY }}>All sets completed{log.weight_used ? ` · ${log.weight_used} lbs` : ''}</span>
                      : `${ex.sets} sets · ${ex.reps} reps`
                    }
                  </p>
                </div>

                {/* Right actions */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={GRAY2} strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="5" r="1" fill={GRAY2}/><circle cx="12" cy="12" r="1" fill={GRAY2}/><circle cx="12" cy="19" r="1" fill={GRAY2}/></svg>
                  <ChevronRight color={GRAY2}/>
                </div>
              </div>

              {/* Connector line between exercises */}
              {idx < allExercises.length - 1 && (
                <div style={{ marginLeft: '22px', width: '2px', height: '16px', background: BORDER, borderRadius: '1px' }}/>
              )}
            </div>
          )
        })}

        {/* Add exercise row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '14px 0', cursor: 'pointer', opacity: 0.5 }}>
          <div style={{ width: '44px', height: '44px', borderRadius: '50%', border: `2px solid ${BORDER}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <PlusIcon size={18} color={GRAY}/>
          </div>
          <p style={{ fontSize: '17px', fontWeight: '500', color: GRAY }}>Add exercises</p>
        </div>
      </div>

      {/* Exercise detail sheet */}
      {activeEx && (
        <ExerciseDetailSheet
          ex={activeEx}
          log={todayLogs[activeEx.id]}
          lastLog={lastWeekLogs[activeEx.id]}
          onClose={() => setActiveEx(null)}
          onLog={(exId, w, r, n) => { onLogSet(exId, w, r, n); setActiveEx(null) }}
          onStartRest={onStartRest}
        />
      )}
    </div>
  )
}

// ─── Rest Timer ───────────────────────────────────────────────────────────────
function RestTimer({ restSeconds, onDismiss }) {
  const endRef = useRef(Date.now() + restSeconds * 1000)
  const [remaining, setRemaining] = useState(restSeconds)
  const intervalRef = useRef(null)
  const alerted = useRef(false)

  const tick = () => {
    const r = Math.max(0, Math.round((endRef.current - Date.now()) / 1000))
    setRemaining(r)
    if (r <= 0 && !alerted.current) { alerted.current = true; clearInterval(intervalRef.current); playBeep(); vibrate([300,100,300]) }
  }

  useEffect(() => { intervalRef.current = setInterval(tick, 500); return () => clearInterval(intervalRef.current) }, [])

  const addTime = (s) => { endRef.current = Math.max(Date.now(), endRef.current) + s*1000; alerted.current = false; tick() }
  const pct = remaining / restSeconds
  const circ = 2 * Math.PI * 36
  const isDone = remaining === 0

  return (
    <div style={{ position: 'fixed', bottom: '90px', left: '50%', transform: 'translateX(-50%)', width: 'calc(100% - 32px)', maxWidth: '390px', zIndex: 400, background: isDone ? '#0d2a1a' : '#1a1a1a', border: `1px solid ${isDone ? '#10B981' : BORDER}`, borderRadius: '20px', padding: '16px 20px', boxShadow: '0 24px 48px rgba(0,0,0,0.6)' }}>
      {isDone ? (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <p style={{ fontSize: '16px', fontWeight: '700', color: WHITE }}>Rest complete!</p>
            <p style={{ fontSize: '13px', color: GRAY, marginTop: '2px' }}>Ready for your next set</p>
          </div>
          <button onClick={onDismiss} style={{ ...GHOST_BTN, padding: '10px 18px' }}>Done</button>
        </div>
      ) : (
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ position: 'relative', width: '88px', height: '88px', flexShrink: 0 }}>
            <svg width="88" height="88" viewBox="0 0 88 88">
              <circle cx="44" cy="44" r="36" fill="none" stroke={BORDER} strokeWidth="4"/>
              <circle cx="44" cy="44" r="36" fill="none" stroke={remaining < 10 ? '#EF4444' : WHITE} strokeWidth="4"
                strokeDasharray={`${circ*pct} ${circ}`} strokeLinecap="round" transform="rotate(-90 44 44)"
                style={{ transition: 'stroke-dasharray 0.4s linear' }}/>
            </svg>
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: '18px', fontWeight: '700', color: remaining < 10 ? '#EF4444' : WHITE }}>{fmtTime(remaining)}</span>
            </div>
          </div>
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: '13px', color: GRAY, marginBottom: '10px' }}>Rest timer</p>
            <div style={{ display: 'flex', gap: '6px', marginBottom: '8px' }}>
              {[-30,-15,+15,+30].map(s => (
                <button key={s} onClick={() => addTime(s)} style={{ flex: 1, padding: '8px 0', borderRadius: '10px', cursor: 'pointer', background: CARD2, border: `1px solid ${BORDER}`, color: WHITE, fontSize: '12px', fontFamily: 'Inter, sans-serif', fontWeight: '500' }}>
                  {s > 0 ? `+${s}s` : `${s}s`}
                </button>
              ))}
            </div>
            <button onClick={onDismiss} style={{ width: '100%', padding: '8px', borderRadius: '10px', background: 'none', border: `1px solid ${BORDER}`, color: GRAY, fontSize: '12px', fontFamily: 'Inter, sans-serif', cursor: 'pointer' }}>Skip rest</button>
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
        <div style={{ display: 'flex', justifyContent: 'center', padding: '12px 0 8px' }}>
          <div style={{ width: '36px', height: '4px', borderRadius: '2px', background: BORDER }}/>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', paddingTop: '8px' }}>
          <p style={{ fontSize: '20px', fontWeight: '700', color: WHITE }}>{title}</p>
          <button onClick={onClose} style={{ background: CARD2, border: `1px solid ${BORDER}`, borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            <CloseIcon />
          </button>
        </div>
        {children}
      </div>
    </>
  )
}

const inputStyle = { width: '100%', background: CARD2, border: `1px solid ${BORDER}`, borderRadius: '12px', padding: '14px 16px', color: WHITE, fontSize: '16px', fontFamily: 'Inter, sans-serif', outline: 'none', boxSizing: 'border-box', marginBottom: '12px' }
const labelStyle = { fontSize: '12px', color: GRAY, display: 'block', marginBottom: '6px', fontWeight: '500' }

// ─── Body Weight ──────────────────────────────────────────────────────────────
function BodyWeightSection() {
  const [logs, setLogs] = useState([])
  const [weight, setWeight] = useState('')
  const [saving, setSaving] = useState(false)
  const [todayLog, setTodayLog] = useState(null)

  useEffect(() => { load() }, [])

  const load = async () => {
    const { data } = await supabase.from('body_weight_logs').select('*').order('logged_date')
    setLogs(data || [])
    const td = data?.find(l => l.logged_date === TODAY)
    if (td) { setTodayLog(td); setWeight(String(td.weight_lbs)) }
  }

  const save = async () => {
    if (!weight) return
    setSaving(true)
    if (todayLog) await supabase.from('body_weight_logs').update({ weight_lbs: parseFloat(weight) }).eq('id', todayLog.id)
    else await supabase.from('body_weight_logs').insert({ logged_date: TODAY, weight_lbs: parseFloat(weight) })
    await load(); setSaving(false)
  }

  const latest = logs[logs.length - 1]
  const prev = logs[logs.length - 2]
  const diff = latest && prev ? (parseFloat(latest.weight_lbs) - parseFloat(prev.weight_lbs)).toFixed(1) : null

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: '20px', padding: '24px' }}>
        <div style={{ marginBottom: '20px' }}>
          <p style={{ fontSize: '13px', color: GRAY, marginBottom: '4px' }}>Current weight</p>
          <p style={{ fontSize: '36px', fontWeight: '700', color: WHITE }}>{latest?.weight_lbs || '—'} <span style={{ fontSize: '16px', color: GRAY, fontWeight: '400' }}>lbs</span></p>
          {diff !== null && <p style={{ fontSize: '13px', color: parseFloat(diff) <= 0 ? '#10B981' : GRAY, marginTop: '4px' }}>{parseFloat(diff) > 0 ? '+' : ''}{diff} lbs since last</p>}
        </div>
        <label style={labelStyle}>TODAY'S WEIGHT (LBS)</label>
        <input type="number" value={weight} onChange={e => setWeight(e.target.value)} placeholder="185"
          style={{ ...inputStyle, fontSize: '20px', fontWeight: '600', marginBottom: '14px' }}/>
        <button onClick={save} style={{ ...PILL_BTN, width: '100%', opacity: saving ? 0.7 : 1 }}>
          {saving ? 'Saving...' : todayLog ? 'Update weight' : 'Log weight'} {!saving && <ArrowIcon />}
        </button>
      </div>
      {logs.length > 0 && (
        <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: '20px', padding: '24px' }}>
          <p style={{ fontSize: '18px', fontWeight: '700', color: WHITE, marginBottom: '16px' }}>History</p>
          <div style={{ display: 'flex', flexDirection: 'column', maxHeight: '280px', overflowY: 'auto' }}>
            {[...logs].reverse().map(l => (
              <div key={l.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 0', borderBottom: `1px solid ${BORDER}` }}>
                <p style={{ fontSize: '14px', color: l.logged_date === TODAY ? WHITE : GRAY }}>{new Date(l.logged_date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</p>
                <p style={{ fontSize: '16px', fontWeight: '600', color: WHITE }}>{l.weight_lbs} <span style={{ fontSize: '12px', color: GRAY, fontWeight: '400' }}>lbs</span></p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function Workout({ workoutActive, workoutElapsed, workoutRunning, onStartWorkout, onStopWorkout, onToggleTimer, recoveryScore }) {
  const [programs, setPrograms] = useState([])
  const [todayLogs, setTodayLogs] = useState({})
  const [lastWeekLogs, setLastWeekLogs] = useState({})
  const [selected, setSelected] = useState(null)
  const [loading, setLoading] = useState(true)
  const [restTimer, setRestTimer] = useState(null)
  const [activeSheet, setActiveSheet] = useState(null)
  const [activeView, setActiveView] = useState('training')
  const [editingProg, setEditingProg] = useState(null)
  const [editingEx, setEditingEx] = useState(null)
  const [progForm, setProgForm] = useState({ name: '', tag: 'Strength' })
  const [exForm, setExForm] = useState({ name: '', sets: '', reps: '', weight: '', notes: '', rest_seconds: '90' })

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
    } catch(e) { console.error(e) }
    setLoading(false)
  }

  const prog = programs.find(p => p.id === selected)

  const donePct = (() => {
    if (!prog) return 0
    const ids = prog.exercises.flatMap(e => [e.id, ...(e.variants||[]).map(v => v.id)])
    return Math.round(ids.filter(id => todayLogs[id]?.done).length / Math.max(ids.length, 1) * 100)
  })()

  const handleLogChange = async (exId, field, value) => {
    setTodayLogs(prev => ({ ...prev, [exId]: { ...(prev[exId]||{}), [field]: value, exercise_id: exId } }))
    const existing = todayLogs[exId]
    if (existing?.id) {
      await supabase.from('workout_logs').update({ [field]: value }).eq('id', existing.id)
    } else {
      const { data } = await supabase.from('workout_logs').insert({ exercise_id: exId, logged_date: TODAY, [field]: value }).select().single()
      if (data) setTodayLogs(prev => ({ ...prev, [exId]: data }))
    }
  }

  const handleLogSet = async (exId, weight, reps, notes = '') => {
    setTodayLogs(prev => ({ ...prev, [exId]: { ...(prev[exId]||{}), weight_used: weight, reps_done: reps, notes, done: true, exercise_id: exId } }))
    const existing = todayLogs[exId]
    if (existing?.id) {
      await supabase.from('workout_logs').update({ weight_used: weight, reps_done: reps, notes, done: true }).eq('id', existing.id)
    } else {
      const { data } = await supabase.from('workout_logs').insert({ exercise_id: exId, logged_date: TODAY, weight_used: weight, reps_done: reps, notes, done: true }).select().single()
      if (data) setTodayLogs(prev => ({ ...prev, [exId]: data }))
    }
  }

  const startRest = (secs) => setRestTimer({ secs: getRecommendedRest(secs, recoveryScore), key: Date.now() })

  const handleToggleDone = (ex) => {
    const newDone = !todayLogs[ex.id]?.done
    handleLogChange(ex.id, 'done', newDone)
    if (newDone) startRest(ex.rest_seconds || 90)
  }

  const handleSelectProgram = (p) => setSelected(prev => prev === p.id ? null : p.id)

  const handleStartWorkout = () => onStartWorkout()

  const handleFinishWorkout = () => { onStopWorkout(); setSelected(null) }

  const saveProg = async () => {
    if (!progForm.name.trim()) return
    if (editingProg) await supabase.from('programs').update(progForm).eq('id', editingProg.id)
    else await supabase.from('programs').insert(progForm)
    setActiveSheet(null); loadAll()
  }
  const deleteProg = async () => {
    await supabase.from('programs').delete().eq('id', editingProg.id)
    setSelected(null); setActiveSheet(null); loadAll()
  }
  const saveEx = async () => {
    if (!exForm.name.trim()) return
    const built = { name: exForm.name, sets: parseInt(exForm.sets)||1, reps: exForm.reps, weight: exForm.weight, notes: exForm.notes, rest_seconds: parseInt(exForm.rest_seconds)||90 }
    if (editingEx) await supabase.from('exercises').update(built).eq('id', editingEx.id)
    else await supabase.from('exercises').insert({ ...built, program_id: selected })
    setActiveSheet(null); loadAll()
  }
  const deleteEx = async () => {
    await supabase.from('exercises').delete().eq('id', editingEx.id)
    setActiveSheet(null); loadAll()
  }

  const dateStr = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', flexDirection: 'column', gap: '16px' }}>
      <div style={{ width: '36px', height: '36px', borderRadius: '50%', border: `3px solid ${BORDER}`, borderTop: `3px solid ${WHITE}`, animation: 'spin 1s linear infinite' }}/>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )

  return (
    <div style={{ padding: '56px 20px calc(100px + env(safe-area-inset-bottom))', background: BG, minHeight: '100dvh', boxSizing: 'border-box' }}>

      {/* Active workout full-screen overlay */}
      {workoutActive && prog && (
        <ActiveWorkoutScreen
          prog={prog}
          elapsed={workoutElapsed}
          running={workoutRunning}
          todayLogs={todayLogs}
          lastWeekLogs={lastWeekLogs}
          onToggle={onToggleTimer}
          onFinish={handleFinishWorkout}
          onLogSet={handleLogSet}
          onToggleDone={handleToggleDone}
          onStartRest={startRest}
          recoveryScore={recoveryScore}
        />
      )}

      {/* Rest timer — renders on top of active workout screen */}
      {restTimer && <RestTimer key={restTimer.key} restSeconds={restTimer.secs} onDismiss={() => setRestTimer(null)} />}

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '34px', fontWeight: '800', color: WHITE, letterSpacing: '-1px', lineHeight: 1 }}>Training</h1>
          <p style={{ fontSize: '14px', color: GRAY, marginTop: '6px' }}>{dateStr}</p>
        </div>
        <button onClick={() => { setEditingProg(null); setProgForm({ name: '', tag: 'Strength' }); setActiveSheet('prog') }}
          style={{ width: '40px', height: '40px', borderRadius: '12px', background: CARD, border: `1px solid ${BORDER}`, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <PlusIcon size={18} />
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
          {/* Today's Workout Card */}
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
                <button onClick={handleStartWorkout} style={{ ...PILL_BTN, width: '100%', padding: '16px', fontSize: '16px' }}>
                  Start Workout <ArrowIcon color="#111"/>
                </button>
              </div>
            </ProgressBorderCard>
          ) : (
            <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: '20px', padding: '28px', marginBottom: '28px', textAlign: 'center' }}>
              <p style={{ fontSize: '17px', fontWeight: '600', color: WHITE, marginBottom: '6px' }}>No workout selected</p>
              <p style={{ fontSize: '14px', color: GRAY2 }}>Tap a day below to get started</p>
            </div>
          )}

          {/* This Week */}
          <div style={{ marginBottom: '28px' }}>
            <p style={{ fontSize: '22px', fontWeight: '700', color: WHITE, marginBottom: '16px' }}>This Week</p>
            <WeekStrip programs={programs} selectedId={selected} onSelect={handleSelectProgram} />
          </div>

          {/* Focus Areas */}
          {programs.length > 0 && (
            <div>
              <p style={{ fontSize: '22px', fontWeight: '700', color: WHITE, marginBottom: '16px' }}>Focus Areas</p>
              <FocusAreas todayLogs={todayLogs} programs={programs} />
            </div>
          )}
        </>
      )}

      {/* Program Sheet */}
      {activeSheet === 'prog' && (
        <Sheet title={editingProg ? 'Edit program' : 'New program'} onClose={() => setActiveSheet(null)}>
          <label style={labelStyle}>PROGRAM NAME</label>
          <input style={inputStyle} placeholder="e.g. Push" value={progForm.name} onChange={e => setProgForm(f => ({ ...f, name: e.target.value }))}/>
          <label style={labelStyle}>TYPE</label>
          <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
            {['Strength','Cardio','Mobility','Sport'].map(t => (
              <button key={t} onClick={() => setProgForm(f => ({ ...f, tag: t }))} style={{ flex: 1, padding: '10px', borderRadius: '12px', cursor: 'pointer', background: progForm.tag === t ? WHITE : CARD2, border: `1px solid ${progForm.tag === t ? WHITE : BORDER}`, color: progForm.tag === t ? '#111' : GRAY, fontSize: '13px', fontFamily: 'Inter, sans-serif', fontWeight: progForm.tag === t ? '600' : '400' }}>{t}</button>
            ))}
          </div>
          <button onClick={saveProg} style={{ ...PILL_BTN, width: '100%', marginBottom: '10px' }}>{editingProg ? 'Save changes' : 'Create program'} <ArrowIcon /></button>
          {editingProg && <button onClick={deleteProg} style={{ ...GHOST_BTN, width: '100%', color: '#EF4444', border: '1px solid rgba(239,68,68,0.3)' }}>Delete program</button>}
        </Sheet>
      )}

      {/* Exercise Sheet */}
      {activeSheet === 'ex' && (
        <Sheet title={editingEx ? 'Edit exercise' : 'Add exercise'} onClose={() => setActiveSheet(null)}>
          <label style={labelStyle}>EXERCISE NAME</label>
          <input style={inputStyle} placeholder="e.g. Bench Press" value={exForm.name} onChange={e => setExForm(f => ({ ...f, name: e.target.value }))}/>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', marginBottom: '12px' }}>
            <div><label style={labelStyle}>SETS</label><input style={{ ...inputStyle, marginBottom: 0 }} type="number" placeholder="4" value={exForm.sets} onChange={e => setExForm(f => ({ ...f, sets: e.target.value }))}/></div>
            <div><label style={labelStyle}>REPS</label><input style={{ ...inputStyle, marginBottom: 0 }} placeholder="8-10" value={exForm.reps} onChange={e => setExForm(f => ({ ...f, reps: e.target.value }))}/></div>
            <div><label style={labelStyle}>WEIGHT</label><input style={{ ...inputStyle, marginBottom: 0 }} type="number" placeholder="135" value={exForm.weight} onChange={e => setExForm(f => ({ ...f, weight: e.target.value }))}/></div>
          </div>
          <label style={labelStyle}>REST TIME</label>
          <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
            {[60,90,120,180].map(s => (
              <button key={s} onClick={() => setExForm(f => ({ ...f, rest_seconds: String(s) }))} style={{ flex: 1, padding: '10px', borderRadius: '12px', cursor: 'pointer', background: exForm.rest_seconds === String(s) ? WHITE : CARD2, border: `1px solid ${exForm.rest_seconds === String(s) ? WHITE : BORDER}`, color: exForm.rest_seconds === String(s) ? '#111' : GRAY, fontSize: '13px', fontFamily: 'Inter, sans-serif' }}>{s}s</button>
            ))}
          </div>
          <label style={labelStyle}>NOTES</label>
          <textarea placeholder="e.g. Drop set on last set" value={exForm.notes} onChange={e => setExForm(f => ({ ...f, notes: e.target.value }))} rows={3} style={{ ...inputStyle, resize: 'none', lineHeight: '1.6' }}/>
          <button onClick={saveEx} style={{ ...PILL_BTN, width: '100%', marginBottom: '10px', marginTop: '12px' }}>{editingEx ? 'Save changes' : 'Add exercise'} <ArrowIcon /></button>
          {editingEx && <button onClick={deleteEx} style={{ ...GHOST_BTN, width: '100%', color: '#EF4444', border: '1px solid rgba(239,68,68,0.3)' }}>Delete exercise</button>}
        </Sheet>
      )}
    </div>
  )
}