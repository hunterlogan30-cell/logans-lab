import { useState, useEffect, useRef } from 'react'
import { supabase } from '../supabase'

// ─── Design tokens ────────────────────────────────────────────────────────────
const BG       = '#141414'
const CARD     = '#1e1e1e'
const CARD2    = '#252525'
const BORDER   = '#2a2a2a'
const WHITE    = '#ffffff'
const GRAY     = '#888'
const GRAY2    = '#555'
const PILL_BTN = { background: WHITE, color: '#111', border: 'none', borderRadius: '100px', padding: '14px 28px', fontSize: '15px', fontWeight: '600', fontFamily: 'Inter, sans-serif', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }
const GHOST_BTN = { background: CARD2, color: WHITE, border: `1px solid ${BORDER}`, borderRadius: '100px', padding: '12px 24px', fontSize: '14px', fontWeight: '500', fontFamily: 'Inter, sans-serif', cursor: 'pointer' }

// ─── Utilities ────────────────────────────────────────────────────────────────
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
const ChevronRight = ({ color = GRAY }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
)
const CheckIcon = ({ size = 14, color = '#111' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
)
const PlusIcon = ({ size = 18, color = WHITE }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
)
const CloseIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={GRAY} strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
)
const EditIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={GRAY} strokeWidth="2" strokeLinecap="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
)
const DumbbellIcon = ({ color = GRAY, size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 4v16M18 4v16M3 8h3M18 8h3M3 16h3M18 16h3M6 12h12"/></svg>
)
const TimerIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={GRAY} strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
)
const ArrowIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#111" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
)

// ─── Progress Border Card ─────────────────────────────────────────────────────
function ProgressBorderCard({ pct, children, style = {} }) {
  const strokeW = 3
  const radius = 20

  return (
    <div style={{ position: 'relative', borderRadius: `${radius}px`, background: CARD, ...style }}>
      <svg
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 2, overflow: 'visible' }}
        preserveAspectRatio="none"
        viewBox="0 0 100 100"
      >
        {/* Background border */}
        <rect x="1.5" y="1.5" width="97" height="97" rx={radius} ry={radius}
          fill="none" stroke={BORDER} strokeWidth="3" vectorEffect="non-scaling-stroke"/>
        {/* Progress border */}
        <rect x="1.5" y="1.5" width="97" height="97" rx={radius} ry={radius}
          fill="none" stroke={WHITE} strokeWidth="3" vectorEffect="non-scaling-stroke"
          strokeDasharray={`${pct * 3.88} 388`}
          strokeLinecap="round"
          transform="rotate(-90, 50, 50)"
          style={{ transition: 'stroke-dasharray 0.6s ease' }}
        />
      </svg>
      <div style={{ position: 'relative', zIndex: 1 }}>
        {children}
      </div>
    </div>
  )
}

// ─── Week Strip ───────────────────────────────────────────────────────────────
function WeekStrip({ programs }) {
  const days = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']
  const now = new Date()
  const todayIdx = now.getDay()

  const week = Array.from({ length: 7 }, (_, i) => {
    return { label: days[i], isToday: i === todayIdx }
  })

  const prog = programs[0]
  const exCount = prog?.exercises?.length || 0

  return (
    <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '4px' }}>
      {week.map((d) => (
        <div key={d.label} style={{
          minWidth: '140px', borderRadius: '16px', padding: '16px',
          background: d.isToday ? WHITE : CARD,
          border: `1px solid ${d.isToday ? 'transparent' : BORDER}`,
          flexShrink: 0,
        }}>
          <p style={{ fontSize: '12px', color: d.isToday ? '#888' : GRAY2, marginBottom: '6px' }}>{d.label}</p>
          <p style={{ fontSize: '18px', fontWeight: '700', color: d.isToday ? '#111' : WHITE, marginBottom: '10px' }}>
            {prog?.name || 'Rest'}
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '4px' }}>
            <DumbbellIcon color={d.isToday ? '#888' : GRAY2} size={12}/>
            <span style={{ fontSize: '12px', color: d.isToday ? '#888' : GRAY2 }}>{exCount} Exercises</span>
          </div>
        </div>
      ))}
    </div>
  )
}

// ─── Focus Areas ──────────────────────────────────────────────────────────────
function FocusAreas({ todayLogs, programs }) {
  const allExercises = programs.flatMap(p => p.exercises || [])
  const allExIds = allExercises.flatMap(e => [e.id, ...(e.variants || []).map(v => v.id)])
  const doneCnt = allExIds.filter(id => todayLogs[id]?.done).length
  const total = Math.max(allExIds.length, 1)

  const volume = Object.values(todayLogs).reduce((sum, l) => {
    const w = parseFloat(l.weight_used) || 0
    const r = parseFloat(l.reps_done) || 0
    return sum + (w * r)
  }, 0)

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
        <div style={{ display: 'flex', gap: '5px', alignItems: 'center', paddingTop: '8px', flexWrap: 'wrap', maxWidth: '120px', justifyContent: 'flex-end' }}>
          {Array.from({ length: Math.min(total, 10) }, (_, i) => (
            <div key={i} style={{ width: '8px', height: '8px', borderRadius: '50%', background: i < doneCnt ? WHITE : GRAY2 }}/>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Log Set Bottom Sheet ─────────────────────────────────────────────────────
function LogSetSheet({ ex, log, lastLog, onClose, onLog, onStartRest }) {
  const [weight, setWeight] = useState(String(log?.weight_used || lastLog?.weight_used || ex.weight || ''))
  const [reps, setReps] = useState(String(log?.reps_done || ex.reps || ''))
  const [logged, setLogged] = useState(false)

  const handleLog = () => {
    if (!weight || !reps) return
    onLog(ex.id, weight, reps)
    setLogged(true)
    setTimeout(() => { onStartRest(ex.rest_seconds || 90); onClose() }, 800)
  }

  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 200, backdropFilter: 'blur(4px)' }}/>
      <div style={{
        position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 201,
        background: '#1a1a1a', borderRadius: '24px 24px 0 0',
        padding: '0 20px calc(40px + env(safe-area-inset-bottom))',
        animation: 'slideUp 0.3s cubic-bezier(0.32, 0.72, 0, 1)',
      }}>
        <style>{`@keyframes slideUp { from { transform: translateY(100%) } to { transform: translateY(0) } }`}</style>
        <div style={{ display: 'flex', justifyContent: 'center', padding: '12px 0 20px' }}>
          <div style={{ width: '36px', height: '4px', borderRadius: '2px', background: BORDER }}/>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
          <div>
            <p style={{ fontSize: '22px', fontWeight: '700', color: WHITE }}>{ex.name}</p>
            <p style={{ fontSize: '13px', color: GRAY, marginTop: '4px' }}>{ex.sets} sets · {ex.reps} reps target</p>
          </div>
          <button onClick={onClose} style={{ background: CARD2, border: `1px solid ${BORDER}`, borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            <CloseIcon />
          </button>
        </div>

        {(lastLog?.weight_used || lastLog?.reps_done) && (
          <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: '12px', padding: '12px 16px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <TimerIcon />
            <span style={{ fontSize: '13px', color: GRAY }}>Last workout: <strong style={{ color: WHITE }}>{lastLog.weight_used ? `${lastLog.weight_used} lbs` : ''}{lastLog.weight_used && lastLog.reps_done ? ' · ' : ''}{lastLog.reps_done ? `${lastLog.reps_done} reps` : ''}</strong></span>
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '24px' }}>
          <div>
            <label style={{ fontSize: '12px', color: GRAY, display: 'block', marginBottom: '8px', fontWeight: '500' }}>WEIGHT (LBS)</label>
            <input type="number" value={weight} onChange={e => setWeight(e.target.value)} placeholder={String(ex.weight || '0')}
              style={{ width: '100%', background: CARD2, border: `1px solid ${BORDER}`, borderRadius: '14px', padding: '16px', color: WHITE, fontSize: '24px', fontWeight: '600', fontFamily: 'Inter, sans-serif', outline: 'none', boxSizing: 'border-box', textAlign: 'center' }}
            />
          </div>
          <div>
            <label style={{ fontSize: '12px', color: GRAY, display: 'block', marginBottom: '8px', fontWeight: '500' }}>REPS DONE</label>
            <input type="text" value={reps} onChange={e => setReps(e.target.value)} placeholder={String(ex.reps || '0')}
              style={{ width: '100%', background: CARD2, border: `1px solid ${BORDER}`, borderRadius: '14px', padding: '16px', color: WHITE, fontSize: '24px', fontWeight: '600', fontFamily: 'Inter, sans-serif', outline: 'none', boxSizing: 'border-box', textAlign: 'center' }}
            />
          </div>
        </div>

        <button onClick={handleLog} disabled={!weight || !reps}
          style={{
            ...PILL_BTN, width: '100%', padding: '18px', fontSize: '16px',
            background: logged ? '#1a3a2a' : (!weight || !reps) ? CARD2 : WHITE,
            color: logged ? '#10B981' : (!weight || !reps) ? GRAY : '#111',
            border: logged ? '1px solid #10B981' : 'none',
            opacity: (!weight || !reps) ? 0.5 : 1,
            transition: 'all 0.3s',
          }}>
          {logged ? <><CheckIcon size={18} color="#10B981"/> Set Logged</> : <>Log Set <ArrowIcon /></>}
        </button>
      </div>
    </>
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

  useEffect(() => {
    intervalRef.current = setInterval(tick, 500)
    return () => clearInterval(intervalRef.current)
  }, [])

  const addTime = (s) => { endRef.current = Math.max(Date.now(), endRef.current) + s * 1000; alerted.current = false; tick() }
  const pct = remaining / restSeconds
  const circ = 2 * Math.PI * 36
  const isDone = remaining === 0

  return (
    <div style={{
      position: 'fixed', bottom: '90px', left: '50%', transform: 'translateX(-50%)',
      width: 'calc(100% - 32px)', maxWidth: '390px', zIndex: 150,
      background: isDone ? '#0d2a1a' : '#1a1a1a',
      border: `1px solid ${isDone ? '#10B981' : BORDER}`,
      borderRadius: '20px', padding: '16px 20px',
      boxShadow: '0 24px 48px rgba(0,0,0,0.6)',
    }}>
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
                strokeDasharray={`${circ * pct} ${circ}`} strokeLinecap="round" transform="rotate(-90 44 44)"
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

// ─── Exercise Row ─────────────────────────────────────────────────────────────
function ExerciseRow({ ex, todayLogs, onTap, onToggleDone }) {
  const log = todayLogs[ex.id] || {}
  const isDone = !!log.done

  return (
    <div style={{ borderBottom: `1px solid ${BORDER}` }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '16px 0' }}>
        <div onClick={() => onToggleDone(ex)} style={{
          width: '26px', height: '26px', borderRadius: '8px', flexShrink: 0, cursor: 'pointer',
          background: isDone ? WHITE : CARD2,
          border: `1.5px solid ${isDone ? WHITE : BORDER}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'all 0.2s',
        }}>
          {isDone && <CheckIcon size={13} color="#111"/>}
        </div>
        <div style={{ flex: 1 }} onClick={() => onTap(ex)}>
          <p style={{ fontSize: '16px', fontWeight: '500', color: isDone ? GRAY : WHITE, textDecoration: isDone ? 'line-through' : 'none', transition: 'all 0.2s' }}>{ex.name}</p>
          <p style={{ fontSize: '13px', color: GRAY2, marginTop: '3px' }}>
            {ex.sets} sets · {ex.reps} reps
            {log.weight_used ? <span style={{ color: GRAY }}> · {log.weight_used} lbs</span> : ''}
          </p>
        </div>
        <button onClick={() => onTap(ex)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}>
          <ChevronRight color={isDone ? GRAY2 : GRAY}/>
        </button>
      </div>

      {ex.variants?.length > 0 && (
        <div style={{ paddingLeft: '40px', paddingBottom: '10px' }}>
          {ex.variants.map(v => {
            const vLog = todayLogs[v.id] || {}
            return (
              <div key={v.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 0', borderTop: `1px solid ${BORDER}` }}
                onClick={() => onTap(v)}>
                <div style={{ width: '2px', height: '20px', background: BORDER, borderRadius: '1px', flexShrink: 0 }}/>
                <p style={{ fontSize: '14px', color: vLog.done ? GRAY2 : GRAY, flex: 1 }}>{v.name}</p>
                <ChevronRight color={GRAY2}/>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ─── Workout Timer Bar ────────────────────────────────────────────────────────
function WorkoutTimerBar({ elapsed, running, onToggle, onStop }) {
  return (
    <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: '14px', padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: running ? '#10B981' : GRAY, boxShadow: running ? '0 0 8px #10B981' : 'none' }}/>
        <span style={{ fontSize: '13px', color: GRAY }}>In progress</span>
      </div>
      <span style={{ fontSize: '22px', fontWeight: '700', color: WHITE, fontVariantNumeric: 'tabular-nums' }}>{fmtTime(elapsed)}</span>
      <div style={{ display: 'flex', gap: '6px' }}>
        <button onClick={onToggle} style={{ ...GHOST_BTN, padding: '8px 14px', fontSize: '13px' }}>{running ? 'Pause' : 'Resume'}</button>
        <button onClick={onStop} style={{ background: 'none', border: `1px solid ${BORDER}`, borderRadius: '100px', padding: '8px 12px', color: GRAY, fontSize: '13px', fontFamily: 'Inter, sans-serif', cursor: 'pointer' }}>End</button>
      </div>
    </div>
  )
}

// ─── Body Weight Section ──────────────────────────────────────────────────────
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
        <label style={{ fontSize: '12px', color: GRAY, display: 'block', marginBottom: '8px', fontWeight: '500' }}>TODAY'S WEIGHT (LBS)</label>
        <input type="number" value={weight} onChange={e => setWeight(e.target.value)} placeholder="185"
          style={{ width: '100%', background: CARD2, border: `1px solid ${BORDER}`, borderRadius: '14px', padding: '16px', color: WHITE, fontSize: '20px', fontWeight: '600', fontFamily: 'Inter, sans-serif', outline: 'none', boxSizing: 'border-box', marginBottom: '14px' }}/>
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

// ─── Sheet (modal bottom sheet) ───────────────────────────────────────────────
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

// ─── Main Workout Component ───────────────────────────────────────────────────
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
  const [addingVariantFor, setAddingVariantFor] = useState(null)
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

      const exMap = {}
      const topLevel = []
      exs?.forEach(e => { exMap[e.id] = { ...e, variants: [] } })
      exs?.forEach(e => {
        if (e.parent_id) { if (exMap[e.parent_id]) exMap[e.parent_id].variants.push(exMap[e.id]) }
        else topLevel.push(exMap[e.id])
      })
      setPrograms(progs?.map(p => ({ ...p, exercises: topLevel.filter(e => e.program_id === p.id) })) || [])

      const tMap = {}; tLogs?.forEach(l => { tMap[l.exercise_id] = l }); setTodayLogs(tMap)
      const lwMap = {}; lwLogs?.forEach(l => { if (!lwMap[l.exercise_id]) lwMap[l.exercise_id] = l }); setLastWeekLogs(lwMap)
    } catch(e) { console.error(e) }
    setLoading(false)
  }

  const prog = programs.find(p => p.id === selected)

  const donePct = (() => {
    if (!prog) return 0
    const ids = prog.exercises.flatMap(e => [e.id, ...(e.variants || []).map(v => v.id)])
    return Math.round(ids.filter(id => todayLogs[id]?.done).length / Math.max(ids.length, 1) * 100)
  })()

  const handleLogChange = async (exId, field, value) => {
    setTodayLogs(prev => ({ ...prev, [exId]: { ...(prev[exId] || {}), [field]: value, exercise_id: exId } }))
    const existing = todayLogs[exId]
    if (existing?.id) {
      await supabase.from('workout_logs').update({ [field]: value }).eq('id', existing.id)
    } else {
      const { data } = await supabase.from('workout_logs').insert({ exercise_id: exId, logged_date: TODAY, [field]: value }).select().single()
      if (data) setTodayLogs(prev => ({ ...prev, [exId]: data }))
    }
  }

  const handleLogSet = async (exId, weight, reps) => {
    setTodayLogs(prev => ({ ...prev, [exId]: { ...(prev[exId] || {}), weight_used: weight, reps_done: reps, done: true, exercise_id: exId } }))
    const existing = todayLogs[exId]
    if (existing?.id) {
      await supabase.from('workout_logs').update({ weight_used: weight, reps_done: reps, done: true }).eq('id', existing.id)
    } else {
      const { data } = await supabase.from('workout_logs').insert({ exercise_id: exId, logged_date: TODAY, weight_used: weight, reps_done: reps, done: true }).select().single()
      if (data) setTodayLogs(prev => ({ ...prev, [exId]: data }))
    }
  }

  const startRest = (secs) => setRestTimer({ secs: getRecommendedRest(secs, recoveryScore), key: Date.now() })

  const selectProgram = (id) => {
    if (id === selected) { setSelected(null); onStopWorkout() }
    else { setSelected(id); onStartWorkout() }
  }

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
    const built = { name: exForm.name, sets: parseInt(exForm.sets) || 1, reps: exForm.reps, weight: exForm.weight, notes: exForm.notes, rest_seconds: parseInt(exForm.rest_seconds) || 90 }
    if (editingEx) await supabase.from('exercises').update(built).eq('id', editingEx.id)
    else if (addingVariantFor) await supabase.from('exercises').insert({ ...built, program_id: selected, parent_id: addingVariantFor })
    else await supabase.from('exercises').insert({ ...built, program_id: selected })
    setActiveSheet(null); loadAll()
  }
  const deleteEx = async () => {
    await supabase.from('exercises').delete().eq('id', editingEx.id)
    setActiveSheet(null); loadAll()
  }

  const handleToggleDone = (ex) => {
    const newDone = !todayLogs[ex.id]?.done
    handleLogChange(ex.id, 'done', newDone)
    if (newDone) startRest(ex.rest_seconds || 90)
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
          <button key={v.id} onClick={() => setActiveView(v.id)} style={{
            flex: 1, padding: '10px', borderRadius: '10px', cursor: 'pointer',
            background: activeView === v.id ? WHITE : 'transparent',
            border: 'none', color: activeView === v.id ? '#111' : GRAY,
            fontSize: '14px', fontWeight: activeView === v.id ? '600' : '400',
            fontFamily: 'Inter, sans-serif', transition: 'all 0.2s',
          }}>{v.label}</button>
        ))}
      </div>

      {activeView === 'weight' && <BodyWeightSection />}

      {activeView === 'training' && (
        <>
          {/* Today's Workout Card with progress border */}
          {prog ? (
            <ProgressBorderCard pct={donePct} style={{ marginBottom: '28px' }}>
              <div style={{ padding: '20px' }}>
                <p style={{ fontSize: '13px', color: GRAY, marginBottom: '6px' }}>Today's Workout</p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
                  <p style={{ fontSize: '26px', fontWeight: '800', color: WHITE, letterSpacing: '-0.5px' }}>{prog.name}</p>
                  <p style={{ fontSize: '36px', fontWeight: '800', color: WHITE }}>{donePct}%</p>
                </div>
                <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <DumbbellIcon color={GRAY} size={13}/>
                    <span style={{ fontSize: '13px', color: GRAY }}>{prog.exercises.length} Exercises</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <TimerIcon />
                    <span style={{ fontSize: '13px', color: GRAY }}>~52 min avg.</span>
                  </div>
                </div>
                <button
                  onClick={() => { if (!workoutActive) onStartWorkout() }}
                  style={{ ...PILL_BTN, width: '100%', padding: '16px', fontSize: '16px' }}>
                  {workoutActive ? `${fmtTime(workoutElapsed)} · In progress` : 'Start Workout'}
                  {!workoutActive && <ArrowIcon />}
                </button>
              </div>
            </ProgressBorderCard>
          ) : (
            <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: '20px', padding: '24px', marginBottom: '28px', textAlign: 'center' }}>
              <p style={{ fontSize: '16px', color: GRAY, marginBottom: '8px' }}>No program selected</p>
              <p style={{ fontSize: '13px', color: GRAY2 }}>Pick a program below to get started</p>
            </div>
          )}

          {/* Workout timer */}
          {workoutActive && (
            <WorkoutTimerBar elapsed={workoutElapsed} running={workoutRunning} onToggle={onToggleTimer} onStop={() => { onStopWorkout(); setSelected(null) }} />
          )}

          {/* Programs list */}
          <div style={{ marginBottom: '28px' }}>
            <p style={{ fontSize: '22px', fontWeight: '700', color: WHITE, marginBottom: '4px' }}>Programs</p>
            <div>
              {programs.map(p => (
                <div key={p.id} onClick={() => selectProgram(p.id)}
                  style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '16px 0', borderBottom: `1px solid ${BORDER}`, cursor: 'pointer' }}>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: '18px', fontWeight: selected === p.id ? '700' : '500', color: selected === p.id ? WHITE : GRAY }}>{p.name}</p>
                    <p style={{ fontSize: '13px', color: GRAY2, marginTop: '3px' }}>{p.exercises?.length || 0} exercises · {p.tag}</p>
                  </div>
                  {selected === p.id ? (
                    <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: WHITE, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <CheckIcon size={13} color="#111"/>
                    </div>
                  ) : (
                    <ChevronRight />
                  )}
                  <button onClick={e => { e.stopPropagation(); setEditingProg(p); setProgForm({ name: p.name, tag: p.tag }); setActiveSheet('prog') }}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', flexShrink: 0 }}>
                    <EditIcon />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* This Week */}
          {programs.length > 0 && (
            <div style={{ marginBottom: '28px' }}>
              <p style={{ fontSize: '22px', fontWeight: '700', color: WHITE, marginBottom: '16px' }}>This Week</p>
              <WeekStrip programs={programs} />
            </div>
          )}

          {/* Exercise list */}
          {selected && prog && (
            <div style={{ marginBottom: '28px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                <p style={{ fontSize: '22px', fontWeight: '700', color: WHITE }}>{prog.name}</p>
                <button onClick={() => { setEditingEx(null); setAddingVariantFor(null); setExForm({ name: '', sets: '', reps: '', weight: '', notes: '', rest_seconds: '90' }); setActiveSheet('ex') }}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: GRAY, fontSize: '14px', fontFamily: 'Inter, sans-serif' }}>
                  + Add
                </button>
              </div>
              <div>
                {prog.exercises.map(ex => (
                  <ExerciseRow key={ex.id} ex={ex} todayLogs={todayLogs}
                    onTap={(e) => setActiveSheet({ type: 'log', ex: e })}
                    onToggleDone={handleToggleDone}
                  />
                ))}
              </div>
              {donePct === 100 && (
                <div style={{ background: '#0d2a1a', border: '1px solid #10B981', borderRadius: '20px', padding: '24px', textAlign: 'center', marginTop: '20px' }}>
                  <p style={{ fontSize: '22px', fontWeight: '700', color: '#10B981' }}>Workout complete</p>
                  <p style={{ fontSize: '14px', color: GRAY, marginTop: '6px' }}>Great work today, Logan.</p>
                </div>
              )}
            </div>
          )}

          {/* Focus Areas */}
          {programs.length > 0 && (
            <div>
              <p style={{ fontSize: '22px', fontWeight: '700', color: WHITE, marginBottom: '16px' }}>Focus Areas</p>
              <FocusAreas todayLogs={todayLogs} programs={programs} />
            </div>
          )}
        </>
      )}

      {/* Rest timer */}
      {restTimer && <RestTimer key={restTimer.key} restSeconds={restTimer.secs} onDismiss={() => setRestTimer(null)} />}

      {/* Log Set Sheet */}
      {activeSheet?.type === 'log' && (
        <LogSetSheet
          ex={activeSheet.ex}
          log={todayLogs[activeSheet.ex.id]}
          lastLog={lastWeekLogs[activeSheet.ex.id]}
          onClose={() => setActiveSheet(null)}
          onLog={handleLogSet}
          onStartRest={startRest}
        />
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
          <textarea placeholder="e.g. Drop set on last set" value={exForm.notes} onChange={e => setExForm(f => ({ ...f, notes: e.target.value }))} rows={3}
            style={{ ...inputStyle, resize: 'none', lineHeight: '1.6' }}/>
          <button onClick={saveEx} style={{ ...PILL_BTN, width: '100%', marginBottom: '10px', marginTop: '12px' }}>{editingEx ? 'Save changes' : 'Add exercise'} <ArrowIcon /></button>
          {editingEx && <button onClick={deleteEx} style={{ ...GHOST_BTN, width: '100%', color: '#EF4444', border: '1px solid rgba(239,68,68,0.3)' }}>Delete exercise</button>}
        </Sheet>
      )}
    </div>
  )
}