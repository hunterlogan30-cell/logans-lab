import { useState, useEffect } from 'react'
import { supabase } from '../supabase'
import WeeklyChart from './WeeklyChart'

const glass = {
  background: 'rgba(255,255,255,0.1)',
  border: '1px solid rgba(255,255,255,0.2)',
  boxShadow: '0px 25px 50px -12px rgba(0,0,0,0.25)',
  borderRadius: '24px',
}

const Icons = {
  check: (color = 'white', size = 20) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
    </svg>
  ),
  dumbbell: (color = 'white', size = 20) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 4v16M18 4v16M3 8h3M18 8h3M3 16h3M18 16h3M6 12h12"/>
    </svg>
  ),
  lotus: (color = 'white', size = 20) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22c0 0-8-4.5-8-11a8 8 0 0 1 16 0c0 6.5-8 11-8 11z"/>
      <path d="M12 22c0 0 4-6 4-11"/><path d="M12 22c0 0-4-6-4-11"/>
    </svg>
  ),
  moon: (color = 'white', size = 20) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
    </svg>
  ),
  trending: (color = '#10B981', size = 16) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/>
    </svg>
  ),
  trendingDown: (color = '#EF4444', size = 16) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="23 18 13.5 8.5 8.5 13.5 1 6"/><polyline points="17 18 23 18 23 12"/>
    </svg>
  ),
  send: (color = 'rgba(255,255,255,0.4)', size = 20) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
    </svg>
  ),
  activity: (color = 'white', size = 20) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
    </svg>
  ),
}

const metricIconBg = {
  background: 'linear-gradient(135deg, #6366F1 0%, #4F46E5 100%)',
  borderRadius: '14px',
  width: '40px', height: '40px',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  boxShadow: '0px 10px 15px -3px rgba(0,0,0,0.1)',
  flexShrink: 0,
}

// Weights: sleep 40, workout 25, schedule 20, spirit 15
const WEIGHTS = { sleep: 40, workout: 25, schedule: 20, spirit: 15 }

const calcOverall = ({ sleep, workout, schedule, spirit }) => {
  const pillars = [
    { score: sleep, weight: WEIGHTS.sleep },
    { score: workout, weight: WEIGHTS.workout },
    { score: schedule, weight: WEIGHTS.schedule },
    { score: spirit, weight: WEIGHTS.spirit },
  ].filter(p => p.score !== null)

  if (!pillars.length) return null
  const totalWeight = pillars.reduce((a, p) => a + p.weight, 0)
  const weighted = pillars.reduce((a, p) => a + p.score * p.weight, 0)
  return Math.round(weighted / totalWeight)
}

const scoreColor = (s) => {
  if (s === null) return 'rgba(255,255,255,0.4)'
  if (s >= 80) return '#10B981'
  if (s >= 60) return '#F59E0B'
  return '#EF4444'
}

export default function Home() {
  const [wide, setWide] = useState(window.innerWidth >= 1024)
  const [loading, setLoading] = useState(true)
  const [scores, setScores] = useState({ sleep: null, workout: null, schedule: null, spirit: null, overall: null })
  const [yesterday, setYesterday] = useState(null)
  const [glanceData, setGlanceData] = useState([])

  const today = new Date().toISOString().split('T')[0]
  const yesterdayStr = new Date(Date.now() - 86400000).toISOString().split('T')[0]

  useEffect(() => {
    const handler = () => setWide(window.innerWidth >= 1024)
    window.addEventListener('resize', handler)
    return () => window.removeEventListener('resize', handler)
  }, [])

  useEffect(() => { loadAll() }, [])

  const loadAll = async () => {
  setLoading(true)
  try {
    const [
      whoopRes,
      { data: scheduleBlocks },
      { data: workoutLogs },
      { data: spiritDaily },
      { data: spiritEntries },
      { data: spiritIntentionLogs },
      { data: yesterdayScore },
    ] = await Promise.all([
      fetch('/api/whoop/data?limit=1').then(r => r.json()).catch(() => null),
      supabase.from('schedule_blocks').select('done').eq('date', today),
      supabase.from('workout_logs').select('id').eq('logged_date', today).limit(1),
      supabase.from('spirit_daily_logs').select('mood').eq('date', today).maybeSingle(),
      supabase.from('spirit_journal_entries').select('id').eq('date', today).limit(1),
      supabase.from('spirit_intention_logs').select('done').eq('date', today),
      supabase.from('daily_scores').select('overall_score').eq('date', yesterdayStr).maybeSingle(),
    ])

    // ── Sleep score (Whoop) ──
    const sleepRecord = whoopRes?.sleep?.records?.find(r => r?.score !== null)
    const sleepScore = sleepRecord?.score?.sleep_performance_percentage ?? null
    const sleepHrs = sleepRecord?.score?.stage_summary?.total_in_bed_time_milli
      ? (sleepRecord.score.stage_summary.total_in_bed_time_milli / 3600000).toFixed(1)
      : null

    // ── Workout score ──
    const workoutScore = workoutLogs && workoutLogs.length > 0 ? 100 : 0

    // ── Schedule score ──
    let scheduleScore = null
    if (scheduleBlocks && scheduleBlocks.length > 0) {
      const done = scheduleBlocks.filter(b => b.done).length
      scheduleScore = Math.round((done / scheduleBlocks.length) * 100)
    }

    // ── Spirit score ──
    const didMeditate = !!spiritDaily?.mood
    const didMood = !!spiritDaily?.mood
    const didJournal = !!(spiritEntries && spiritEntries.length > 0)
    const spiritScore = Math.min(100, Math.round(
      (didMeditate ? 34 : 0) +
      (didMood ? 33 : 0) +
      (didJournal ? 33 : 0)
    ))

    // ── Overall ──
    const overall = calcOverall({ sleep: sleepScore, workout: workoutScore, schedule: scheduleScore, spirit: spiritScore })

    setScores({ sleep: sleepScore, workout: workoutScore, schedule: scheduleScore, spirit: spiritScore, overall })
    setYesterday(yesterdayScore?.overall_score ?? null)

    // ── Upsert today's score ──
    if (overall !== null) {
      await supabase.from('daily_scores').upsert({
        date: today,
        overall_score: overall,
        sleep_score: sleepScore,
        workout_score: workoutScore,
        schedule_score: scheduleScore,
        spirit_score: spiritScore,
      }, { onConflict: 'date' })
    }

    // ── Today at a Glance ──
    const doneBlocks = scheduleBlocks?.filter(b => b.done).length ?? 0
    const totalBlocks = scheduleBlocks?.length ?? 0

    setGlanceData([
      { label: 'Tasks', value: totalBlocks > 0 ? `${doneBlocks}/${totalBlocks}` : '—', icon: Icons.check('rgba(255,255,255,0.7)') },
      { label: 'Workout', value: workoutLogs?.length > 0 ? 'Done ✓' : 'Not logged', icon: Icons.dumbbell('rgba(255,255,255,0.7)') },
      { label: 'Spirit', value: `${Math.round(((didMeditate ? 1 : 0) + (didMood ? 1 : 0) + (didJournal ? 1 : 0)) / 3 * 100)}%`, icon: Icons.lotus('rgba(255,255,255,0.7)') },
      { label: 'Sleep', value: sleepHrs ? `${sleepHrs} hrs` : '—', icon: Icons.moon('rgba(255,255,255,0.7)') },
    ])

  } catch (e) { console.error(e) }
  setLoading(false)
}
  const greeting = () => {
    const h = new Date().getHours()
    if (h < 12) return 'Good morning'
    if (h < 17) return 'Good afternoon'
    return 'Good evening'
  }

  const diff = scores.overall !== null && yesterday !== null ? scores.overall - yesterday : null
  const trendUp = diff !== null && diff >= 0

  const metricCards = [
    { label: 'Sleep', value: scores.sleep !== null ? `${Math.round(scores.sleep)}` : '—', icon: Icons.moon('white', 18) },
    { label: 'Schedule', value: scores.schedule !== null ? `${scores.schedule}` : '—', icon: Icons.check('white', 18) },
    { label: 'Spirit', value: scores.spirit !== null ? `${scores.spirit}` : '—', icon: Icons.lotus('white', 18) },
  ]

  const pad = wide ? '40px 40px 24px 40px' : '48px 16px 16px'

  const OverallCard = ({ big = false }) => (
    <div style={{ ...glass, padding: big ? '28px' : '25px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', overflow: 'hidden' }}>
      <div>
        <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.6)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: '500' }}>Overall Score</p>
        {loading ? (
          <div style={{ width: '80px', height: big ? '64px' : '48px', background: 'rgba(255,255,255,0.1)', borderRadius: '12px', animation: 'pulse 1.5s infinite' }} />
        ) : (
          <p style={{ fontSize: big ? '64px' : '48px', fontWeight: '700', lineHeight: 1, letterSpacing: '-2px', color: scoreColor(scores.overall) }}>
            {scores.overall ?? '—'}
          </p>
        )}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '10px' }}>
          {diff !== null ? (
            <>
              {trendUp ? Icons.trending() : Icons.trendingDown()}
              <span style={{ fontSize: '13px', color: trendUp ? '#10B981' : '#EF4444' }}>
                {trendUp ? '+' : ''}{diff}% from yesterday
              </span>
            </>
          ) : (
            <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)' }}>No yesterday data yet</span>
          )}
        </div>
      </div>
      <div style={{ background: `linear-gradient(135deg, ${scoreColor(scores.overall)}, ${scoreColor(scores.overall)}99)`, borderRadius: '50%', width: big ? '96px' : '80px', height: big ? '96px' : '80px', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 20px 40px ${scoreColor(scores.overall)}44` }}>
        {Icons.activity('white', big ? 44 : 36)}
      </div>
    </div>
  )

  return (
    <div style={{ padding: pad, display: 'flex', flexDirection: 'column', gap: '24px', boxSizing: 'border-box', width: '100%' }}>

      {/* Header */}
      <div>
        <h1 style={{ fontSize: wide ? '32px' : '24px', fontWeight: '700', letterSpacing: '-0.5px' }}>Logan's Lab</h1>
        <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.6)', marginTop: '4px' }}>{greeting()} — holistic well-being tracker.</p>
      </div>

      {wide ? (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', alignItems: 'start', width: '100%' }}>

          {/* Left column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', minWidth: 0 }}>
            <OverallCard big />

            {/* Pillar scores */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
              {metricCards.map(m => (
                <div key={m.label} style={{ ...glass, padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: '130px' }}>
                  <div style={metricIconBg}>{m.icon}</div>
                  <div>
                    {loading
                      ? <div style={{ width: '48px', height: '28px', background: 'rgba(255,255,255,0.1)', borderRadius: '8px', animation: 'pulse 1.5s infinite' }} />
                      : <p style={{ fontSize: '28px', fontWeight: '700', color: scoreColor(typeof m.value === 'string' && m.value !== '—' ? parseInt(m.value) : null) }}>{m.value}</p>
                    }
                    <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)', marginTop: '2px' }}>{m.label}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Ask Agent */}
            <div style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', padding: '14px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}>
              <span style={{ fontSize: '14px', color: 'rgba(255,255,255,0.5)' }}>Ask Agent...</span>
              {Icons.send()}
            </div>
          </div>

          {/* Right column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', minWidth: 0 }}>
            <div style={{ ...glass, padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: '600' }}>7-Day Trend</h3>
              <WeeklyChart />
            </div>

            <div style={{ ...glass, padding: '24px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: '600' }}>Today at a Glance</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                {glanceData.map(s => (
                  <div key={s.label} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {s.icon}
                      <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.6)' }}>{s.label}</span>
                    </div>
                    <span style={{ fontSize: '20px', fontWeight: '700' }}>{loading ? '—' : s.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <>
          <OverallCard />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
            {metricCards.map(m => (
              <div key={m.label} style={{ ...glass, padding: '17px', height: '138px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div style={metricIconBg}>{m.icon}</div>
                <div>
                  {loading
                    ? <div style={{ width: '40px', height: '24px', background: 'rgba(255,255,255,0.1)', borderRadius: '8px', animation: 'pulse 1.5s infinite' }} />
                    : <p style={{ fontSize: '24px', fontWeight: '700', color: scoreColor(typeof m.value === 'string' && m.value !== '—' ? parseInt(m.value) : null) }}>{m.value}</p>
                  }
                  <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.7)', marginTop: '2px' }}>{m.label}</p>
                </div>
              </div>
            ))}
          </div>

          <div style={{ ...glass, padding: '21px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '600' }}>7-Day Trend</h3>
            <WeeklyChart />
          </div>

          <div style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}>
            <span style={{ fontSize: '14px', color: 'rgba(255,255,255,0.9)' }}>Ask Agent...</span>
            {Icons.send()}
          </div>

          <div style={{ ...glass, padding: '21px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '600' }}>Today at a Glance</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {glanceData.map(s => (
                <div key={s.label} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    {s.icon}
                    <span style={{ fontSize: '14px', color: 'rgba(255,255,255,0.9)' }}>{s.label}</span>
                  </div>
                  <span style={{ fontSize: '16px', fontWeight: '600' }}>{loading ? '—' : s.value}</span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      <style>{`
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }
      `}</style>
    </div>
  )
}