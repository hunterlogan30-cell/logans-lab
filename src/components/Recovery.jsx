import { useState, useEffect } from 'react'

const glass = {
  background: 'rgba(255,255,255,0.1)',
  border: '1px solid rgba(255,255,255,0.2)',
  boxShadow: '0px 25px 50px -12px rgba(0,0,0,0.25)',
  borderRadius: '24px',
}

const iconBg = {
  background: 'linear-gradient(135deg, #6366F1 0%, #4F46E5 100%)',
  borderRadius: '14px',
  width: '40px', height: '40px', flexShrink: 0,
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  boxShadow: '0px 10px 15px -3px rgba(0,0,0,0.1)',
}

const ActivityIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
  </svg>
)
const HeartIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
  </svg>
)
const MoonIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
  </svg>
)
const DumbbellIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 4v16M18 4v16M3 8h3M18 8h3M3 16h3M18 16h3M6 12h12"/>
  </svg>
)

function msToHrs(ms) {
  return (ms / 3600000).toFixed(1)
}

function getTips(score) {
  if (score >= 67) return [
    { text: 'Great recovery — push hard today', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg> },
    { text: 'Hydrate well — aim for 3L today', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/></svg> },
    { text: 'Target 10pm bedtime for optimal HRV', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg> },
  ]
  if (score >= 34) return [
    { text: 'Moderate effort only today', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg> },
    { text: 'Light stretching or yoga recommended', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22c0 0-8-4.5-8-11a8 8 0 0 1 16 0c0 6.5-8 11-8 11z"/></svg> },
    { text: 'Prioritize sleep tonight', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg> },
  ]
  return [
    { text: 'Rest day — let your body recover', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg> },
    { text: 'Hydrate and avoid alcohol', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/></svg> },
    { text: 'Get to bed early tonight', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg> },
  ]
}

export default function Recovery({ whoopData }) {
  const [data, setData] = useState(whoopData || null)
  const [loading, setLoading] = useState(!whoopData)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (whoopData) { setData(whoopData); setLoading(false); return }
    fetch(`/api/whoop/data?t=${Date.now()}`)
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false) })
      .catch(e => { setError(e.message); setLoading(false) })
  }, [whoopData])

  if (loading) return (
    <div style={{ padding: '48px 16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ color: 'rgba(255,255,255,0.5)' }}>Loading Whoop data...</p>
    </div>
  )

  if (error || !data) return (
    <div style={{ padding: '48px 16px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
      <p style={{ color: 'rgba(255,255,255,0.5)' }}>Not connected to Whoop</p>
      <a href="/api/whoop/auth" style={{ padding: '12px 24px', borderRadius: '14px', background: 'linear-gradient(135deg, #6366F1, #4F46E5)', color: 'white', fontWeight: '600', fontSize: '14px', textDecoration: 'none' }}>Connect Whoop</a>
    </div>
  )

  // Parse today's sleep
  const sleepRecords = data.sleep?.records || []
  const sleep = sleepRecords[0]
  const sleepScore = sleep?.score
  const stages = sleepScore?.stage_summary
  const totalSleepMs = stages ? stages.total_light_sleep_time_milli + stages.total_slow_wave_sleep_time_milli + stages.total_rem_sleep_time_milli : 0
  const totalInBedMs = stages?.total_in_bed_time_milli || 1
  const awakePct = stages ? Math.round(stages.total_awake_time_milli / totalInBedMs * 100) : 0
  const remPct = stages ? Math.round(stages.total_rem_sleep_time_milli / totalInBedMs * 100) : 0
  const lightPct = stages ? Math.round(stages.total_light_sleep_time_milli / totalInBedMs * 100) : 0
  const deepPct = stages ? Math.round(stages.total_slow_wave_sleep_time_milli / totalInBedMs * 100) : 0
  const sleepHrs = msToHrs(totalSleepMs)
  const sleepPerf = sleepScore?.sleep_performance_percentage || 0

  // Parse cycle data for HR
  const cycles = data.cycles?.records || []
  const todayCycle = cycles[0]
  const avgHR = todayCycle?.score?.average_heart_rate || 0

  // Sleep performance chart data — last 7 nights
  const sleepPerfData = [...sleepRecords]
    .filter(r => !r.nap && r.score?.sleep_performance_percentage)
    .reverse()
    .map(r => ({
      day: ['S','M','T','W','T','F','S'][new Date(r.start).getDay()],
      perf: r.score.sleep_performance_percentage,
      isToday: new Date(r.start).toDateString() === new Date().toDateString(),
    }))

  const maxPerf = Math.max(...sleepPerfData.map(d => d.perf), 1)

  const whoopScore = sleepPerf
  const scoreColor = whoopScore >= 67 ? '#10B981' : whoopScore >= 34 ? '#F59E0B' : '#EF4444'
  const scoreLabel = whoopScore >= 67 ? 'Green — Go for it' : whoopScore >= 34 ? 'Yellow — Be careful' : 'Red — Rest up'

  const metrics = [
    { key: 'sleep', label: 'Sleep', value: sleepHrs, unit: 'hrs', icon: <MoonIcon /> },
    { key: 'rhr', label: 'Avg HR', value: avgHR, unit: 'bpm', icon: <HeartIcon /> },
    { key: 'efficiency', label: 'Efficiency', value: sleepScore?.sleep_efficiency_percentage?.toFixed(0) || '--', unit: '%', icon: <ActivityIcon /> },
    { key: 'consistency', label: 'Consistency', value: sleepScore?.sleep_consistency_percentage?.toFixed(0) || '--', unit: '%', icon: <DumbbellIcon /> },
  ]

  const sleepStages = [
    { label: 'Awake', pct: awakePct, color: 'rgba(255,255,255,0.3)' },
    { label: 'REM', pct: remPct, color: 'rgba(99,102,241,0.8)' },
    { label: 'Light', pct: lightPct, color: 'rgba(99,102,241,0.45)' },
    { label: 'Deep', pct: deepPct, color: '#10B981' },
  ]

  const tips = getTips(whoopScore)

  return (
    <div style={{ padding: '48px 16px 16px', display: 'flex', flexDirection: 'column', gap: '20px' }}>

      <div>
        <h1 style={{ fontSize: '24px', fontWeight: '700' }}>Recovery</h1>
        <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.7)', marginTop: '4px' }}>Synced from Whoop</p>
      </div>

      {/* Recovery score ring */}
      <div style={{ ...glass, padding: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px' }}>
        <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: '500' }}>Sleep Performance</p>
        <div style={{ position: 'relative', width: '140px', height: '140px' }}>
          <svg width="140" height="140" viewBox="0 0 140 140">
            <circle cx="70" cy="70" r="58" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="10"/>
            <circle cx="70" cy="70" r="58" fill="none" stroke={scoreColor} strokeWidth="10"
              strokeDasharray={`${2 * Math.PI * 58 * whoopScore / 100} ${2 * Math.PI * 58}`}
              strokeLinecap="round" transform="rotate(-90 70 70)"
            />
          </svg>
          <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontSize: '36px', fontWeight: '700', color: scoreColor, lineHeight: 1 }}>{whoopScore}</span>
            <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', marginTop: '4px' }}>%</span>
          </div>
        </div>
        <div style={{ padding: '6px 18px', borderRadius: '20px', background: 'rgba(99,102,241,0.2)', border: '1px solid rgba(99,102,241,0.3)' }}>
          <span style={{ fontSize: '13px', fontWeight: '500', color: scoreColor }}>{scoreLabel}</span>
        </div>
      </div>

      {/* Metrics grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
        {metrics.map(m => (
          <div key={m.key} style={{ ...glass, padding: '16px', borderRadius: '20px' }}>
            <div style={{ ...iconBg, width: '36px', height: '36px', borderRadius: '12px' }}>{m.icon}</div>
            <p style={{ fontSize: '26px', fontWeight: '700', marginTop: '12px', lineHeight: 1 }}>
              {m.value}
              <span style={{ fontSize: '13px', fontWeight: '400', color: 'rgba(255,255,255,0.4)', marginLeft: '3px' }}>{m.unit}</span>
            </p>
            <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', marginTop: '4px' }}>{m.label}</p>
          </div>
        ))}
      </div>

      {/* Sleep stages */}
      <div style={{ ...glass, padding: '20px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '14px' }}>Sleep Stages</h3>
        <div style={{ display: 'flex', height: '8px', borderRadius: '4px', overflow: 'hidden', gap: '2px', marginBottom: '16px' }}>
          {sleepStages.map(s => (
            <div key={s.label} style={{ flex: s.pct, background: s.color }} />
          ))}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
          {sleepStages.map(s => (
            <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: s.color, flexShrink: 0 }} />
              <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.6)' }}>{s.label}</span>
              <span style={{ fontSize: '13px', fontWeight: '600', marginLeft: 'auto' }}>{s.pct}%</span>
            </div>
          ))}
        </div>
      </div>

      {/* Sleep performance chart */}
      {sleepPerfData.length > 0 && (
        <div style={{ ...glass, padding: '20px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px' }}>Sleep Performance This Week</h3>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '6px', height: '80px' }}>
            {sleepPerfData.map((d, i) => {
              const h = Math.round((d.perf / 100) * 80)
              const barColor = d.perf >= 67 ? '#10B981' : d.perf >= 34 ? '#F59E0B' : '#EF4444'
              return (
                <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontSize: '9px', fontWeight: '600', color: d.isToday ? '#fff' : 'rgba(255,255,255,0.4)' }}>{d.perf}%</span>
                  <div style={{
                    width: '100%', height: `${h}px`, borderRadius: '6px',
                    background: d.isToday ? barColor : `${barColor}66`,
                    boxShadow: d.isToday ? `0 0 12px ${barColor}66` : 'none',
                    transition: 'all 0.3s',
                  }} />
                  <span style={{ fontSize: '10px', color: d.isToday ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.35)', fontWeight: d.isToday ? '700' : '400' }}>{d.day}</span>
                </div>
              )
            })}
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', marginTop: '14px' }}>
            {[{ color: '#10B981', label: 'Good (67%+)' }, { color: '#F59E0B', label: 'Ok (34–66%)' }, { color: '#EF4444', label: 'Low (<34%)' }].map(l => (
              <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '2px', background: l.color }} />
                <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)' }}>{l.label}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tips */}
      <div style={{ ...glass, padding: '20px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '14px' }}>Today's Recommendations</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {tips.map((tip, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 14px', borderRadius: '14px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <div style={{ ...iconBg, width: '32px', height: '32px', borderRadius: '10px' }}>{tip.icon}</div>
              <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.8)', lineHeight: 1.5 }}>{tip.text}</span>
            </div>
          ))}
        </div>
      </div>

    </div>
  )
}