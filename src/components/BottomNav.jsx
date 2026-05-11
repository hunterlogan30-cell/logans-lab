export default function BottomNav({ tab, setTab }) {
  const tabs = [
    { id: 'home', label: 'Home', icon: (active) => (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={active ? '#fff' : 'rgba(255,255,255,0.5)'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
      </svg>
    )},
    { id: 'schedule', label: 'Schedule', icon: (active) => (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={active ? '#fff' : 'rgba(255,255,255,0.5)'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
      </svg>
    )},
    { id: 'workout', label: 'Workout', icon: (active) => (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={active ? '#fff' : 'rgba(255,255,255,0.5)'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 4v16M18 4v16M3 8h3M18 8h3M3 16h3M18 16h3M6 12h12"/>
      </svg>
    )},
    { id: 'recovery', label: 'Recovery', icon: (active) => (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={active ? '#fff' : 'rgba(255,255,255,0.5)'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
      </svg>
    )},
    { id: 'spirit', label: 'Spirit', icon: (active) => (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={active ? '#fff' : 'rgba(255,255,255,0.5)'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22c0 0-8-4.5-8-11a8 8 0 0 1 16 0c0 6.5-8 11-8 11z"/>
        <circle cx="12" cy="11" r="2" fill={active ? '#fff' : 'rgba(255,255,255,0.5)'} stroke="none"/>
      </svg>
    )},
  ]

  return (
    <nav style={{
  position: 'fixed', bottom: '16px',
  left: '50%', transform: 'translateX(-50%)',
  width: 'calc(100% - 32px)', maxWidth: '430px',
  background: 'rgba(255,255,255,0.1)',
  border: '1px solid rgba(255,255,255,0.2)',
  borderRadius: '24px',
  padding: '9px',
  display: 'flex', gap: '4px',
  zIndex: 100,
  backdropFilter: 'blur(20px)',
  WebkitBackdropFilter: 'blur(20px)',
  boxShadow: '0px 25px 50px -12px rgba(0,0,0,0.25)',
}}>
      {tabs.map(t => (
        <button key={t.id} onClick={() => setTab(t.id)} style={{
          flex: 1,
          background: tab === t.id ? 'rgba(255,255,255,0.24)' : 'transparent',
          border: 'none', cursor: 'pointer',
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          gap: '4px', padding: '8px 4px',
          borderRadius: '16px',
          color: tab === t.id ? '#fff' : 'rgba(255,255,255,0.5)',
          fontSize: '10px', fontWeight: '500',
          letterSpacing: '0.12px',
          boxShadow: tab === t.id ? '0px 10px 15px -3px rgba(0,0,0,0.1)' : 'none',
          transition: 'all 0.2s',
          fontFamily: 'Inter, sans-serif',
        }}>
          {t.icon(tab === t.id)}
          {t.label}
        </button>
      ))}
    </nav>
  )
}