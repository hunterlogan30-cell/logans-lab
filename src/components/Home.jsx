import { useState, useEffect } from 'react'
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
      <path d="M12 11c0-3 1.5-6 4-8-1 3-1 6 0 8"/><path d="M12 11c0-3-1.5-6-4-8 1 3 1 6 0 8"/>
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
  send: (color = 'rgba(255,255,255,0.4)', size = 20) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
    </svg>
  ),
  star: (color = 'white', size = 20) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
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

export default function Home() {
const [wide, setWide] = useState(window.innerWidth >= 768)

  useEffect(() => {
   const handler = () => setWide(window.innerWidth >= 768)
    window.addEventListener('resize', handler)
    return () => window.removeEventListener('resize', handler)
  }, [])

  const greeting = () => {
    const h = new Date().getHours()
    if (h < 12) return 'Good morning'
    if (h < 17) return 'Good afternoon'
    return 'Good evening'
  }

  const quickStats = [
    { label: 'Tasks', value: '8/12', icon: Icons.check('rgba(255,255,255,0.7)') },
    { label: 'Workout', value: '45 min', icon: Icons.dumbbell('rgba(255,255,255,0.7)') },
    { label: 'Meditation', value: '20 min', icon: Icons.lotus('rgba(255,255,255,0.7)') },
    { label: 'Sleep', value: '8.0 hrs', icon: Icons.moon('rgba(255,255,255,0.7)') },
  ]

  const metricCards = [
    { label: 'Focus', value: '78', icon: Icons.star('white', 18) },
    { label: 'Fitness', value: '92', icon: Icons.dumbbell('white', 18) },
    { label: 'Rest', value: '87', icon: Icons.moon('white', 18) },
  ]

  const pad = wide ? '40px 40px 24px 40px' : '48px 16px 16px'

  return (
    <div style={{ padding: pad, display: 'flex', flexDirection: 'column', gap: '24px', boxSizing: 'border-box', width: '100%' }}>

      {/* Header */}
      <div>
        <h1 style={{ fontSize: wide ? '32px' : '24px', fontWeight: '700', letterSpacing: '-0.5px' }}>Logan's Lab</h1>
        <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.6)', marginTop: '4px' }}>
          {greeting()} — holistic well-being tracker.
        </p>
      </div>

      {wide ? (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', alignItems: 'start', width: '100%' }}>

          {/* Left column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', minWidth: 0 }}>

            {/* Overall Score */}
            <div style={{ ...glass, padding: '28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', overflow: 'hidden' }}>
              <div>
                <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.6)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: '500' }}>Overall Score</p>
                <p style={{ fontSize: '64px', fontWeight: '700', lineHeight: 1, letterSpacing: '-2px' }}>85</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '10px' }}>
                  {Icons.trending()}
                  <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.7)' }}>+5% from yesterday</span>
                </div>
              </div>
              <div style={{ background: 'linear-gradient(135deg, #10B981, #059669)', borderRadius: '50%', width: '96px', height: '96px', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 20px 40px rgba(16,185,129,0.3)' }}>
                {Icons.activity('white', 44)}
              </div>
            </div>

            {/* Metric Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
              {metricCards.map(m => (
                <div key={m.label} style={{ ...glass, padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: '130px' }}>
                  <div style={metricIconBg}>{m.icon}</div>
                  <div>
                    <p style={{ fontSize: '28px', fontWeight: '700' }}>{m.value}</p>
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

            {/* Weekly Trend */}
            <div style={{ ...glass, padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: '600' }}>Weekly Trend</h3>
              <WeeklyChart />
            </div>

            {/* Today at a Glance */}
            <div style={{ ...glass, padding: '24px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: '600' }}>Today at a Glance</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                {quickStats.map(s => (
                  <div key={s.label} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {s.icon}
                      <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.6)' }}>{s.label}</span>
                    </div>
                    <span style={{ fontSize: '20px', fontWeight: '700' }}>{s.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <>
          <div style={{ ...glass, padding: '25px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.7)', marginBottom: '4px' }}>Overall Score</p>
                <p style={{ fontSize: '48px', fontWeight: '700', lineHeight: 1 }}>85</p>
              </div>
              <div style={{ background: 'linear-gradient(135deg, #10B981, #059669)', borderRadius: '50%', width: '80px', height: '80px', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 20px 25px rgba(0,0,0,0.1)' }}>
                {Icons.activity('white', 36)}
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {Icons.trending()}
              <span style={{ fontSize: '14px', color: 'rgba(255,255,255,0.8)' }}>+5% from yesterday</span>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
            {metricCards.map(m => (
              <div key={m.label} style={{ ...glass, padding: '17px', height: '138px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div style={metricIconBg}>{m.icon}</div>
                <div>
                  <p style={{ fontSize: '24px', fontWeight: '700' }}>{m.value}</p>
                  <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.7)', marginTop: '2px' }}>{m.label}</p>
                </div>
              </div>
            ))}
          </div>

          <div style={{ ...glass, padding: '21px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '600' }}>Weekly Trend</h3>
            <WeeklyChart />
          </div>

          <div style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}>
            <span style={{ fontSize: '14px', color: 'rgba(255,255,255,0.9)' }}>Ask Agent...</span>
            {Icons.send()}
          </div>

          <div style={{ ...glass, padding: '21px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '600' }}>Today at a Glance</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {quickStats.map(s => (
                <div key={s.label} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    {s.icon}
                    <span style={{ fontSize: '14px', color: 'rgba(255,255,255,0.9)' }}>{s.label}</span>
                  </div>
                  <span style={{ fontSize: '16px', fontWeight: '600' }}>{s.value}</span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}