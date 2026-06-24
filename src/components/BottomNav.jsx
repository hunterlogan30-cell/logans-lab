import { useEffect, useState } from 'react'

const HomeIcon = ({ active }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? '#fff' : '#555'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
  </svg>
)
const CalIcon = ({ active }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? '#fff' : '#555'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
  </svg>
)
const DumbIcon = ({ active }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? '#fff' : '#555'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 4v16M18 4v16M3 8h3M18 8h3M3 16h3M18 16h3M6 12h12"/>
  </svg>
)
const PulseIcon = ({ active }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? '#fff' : '#555'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
  </svg>
)
const LeafIcon = ({ active }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? '#fff' : '#555'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22c0 0-8-4.5-8-11a8 8 0 0 1 16 0c0 6.5-8 11-8 11z"/>
    <circle cx="12" cy="11" r="2" fill={active ? '#fff' : '#555'} stroke="none"/>
  </svg>
)

export default function BottomNav({ tab, setTab }) {
  const [wide, setWide] = useState(window.innerWidth >= 768)
  useEffect(() => {
    const h = () => setWide(window.innerWidth >= 768)
    window.addEventListener('resize', h)
    return () => window.removeEventListener('resize', h)
  }, [])

  const tabs = [
    { id: 'home', Icon: HomeIcon },
    { id: 'schedule', Icon: CalIcon },
    { id: 'workout', Icon: DumbIcon },
    { id: 'recovery', Icon: PulseIcon },
    { id: 'spirit', Icon: LeafIcon },
  ]

  if (wide) {
    return (
      <nav style={{
        position: 'fixed', left: 0, top: 0, bottom: 0, width: '72px',
        background: '#111', borderRight: '1px solid #1e1e1e',
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        paddingTop: '48px', paddingBottom: '32px', gap: '8px', zIndex: 100,
      }}>
        {tabs.map(({ id, Icon }) => (
          <button key={id} onClick={() => setTab(id)} style={{
            width: '48px', height: '48px', borderRadius: '14px', cursor: 'pointer',
            background: tab === id ? '#1e1e1e' : 'transparent',
            border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'background 0.2s',
          }}>
            <Icon active={tab === id} />
          </button>
        ))}
      </nav>
    )
  }

  return (
    <nav style={{
      position: 'fixed', bottom: 0, left: 0, right: 0,
      background: '#111', borderTop: '1px solid #1e1e1e',
      display: 'flex', alignItems: 'center',
      padding: '10px 0 calc(10px + env(safe-area-inset-bottom))',
      zIndex: 100,
    }}>
      {tabs.map(({ id, Icon }) => (
        <button key={id} onClick={() => setTab(id)} style={{
          flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
          justifyContent: 'center', background: 'none', border: 'none',
          cursor: 'pointer', padding: '4px 0', position: 'relative',
        }}>
          <Icon active={tab === id} />
          {tab === id && (
            <div style={{
              position: 'absolute', bottom: '-6px',
              width: '4px', height: '4px', borderRadius: '50%', background: '#fff',
            }} />
          )}
        </button>
      ))}
    </nav>
  )
}