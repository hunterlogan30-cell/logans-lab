import { useState, useRef } from 'react'
import { useStorage } from '../hooks/useStorage'
import Modal from './Modal'
import { inputStyle, labelStyle, btnPrimary, btnSecondary } from './Input'

const glass = { background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '24px' }
const iconBg = { background: 'linear-gradient(135deg, #6366F1 0%, #4F46E5 100%)', borderRadius: '14px', width: '36px', height: '36px', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }

const LotusIcon = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22c0 0-8-4.5-8-11a8 8 0 0 1 16 0c0 6.5-8 11-8 11z"/>
    <circle cx="12" cy="11" r="2" fill="white" stroke="none"/>
  </svg>
)
const PenIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
  </svg>
)
const PlayIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="5 3 19 12 5 21 5 3"/>
  </svg>
)
const BoltIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
  </svg>
)
const CheckIcon = ({ size = 10 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
)

const moods = [
  { label: 'Low', value: 1, icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="8" y1="15" x2="16" y2="15"/><circle cx="9" cy="9" r="1" fill="currentColor"/><circle cx="15" cy="9" r="1" fill="currentColor"/></svg> },
  { label: 'Okay', value: 2, icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="8" y1="13" x2="16" y2="13"/><circle cx="9" cy="9" r="1" fill="currentColor"/><circle cx="15" cy="9" r="1" fill="currentColor"/></svg> },
  { label: 'Good', value: 3, icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><path d="M8 13s1 2 4 2 4-2 4-2"/><circle cx="9" cy="9" r="1" fill="currentColor"/><circle cx="15" cy="9" r="1" fill="currentColor"/></svg> },
  { label: 'Great', value: 4, icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><path d="M8 12s1 3 4 3 4-3 4-3"/><circle cx="9" cy="9" r="1" fill="currentColor"/><circle cx="15" cy="9" r="1" fill="currentColor"/></svg> },
  { label: 'Amazing', value: 5, icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><path d="M7 12s2 4 5 4 5-4 5-4"/><circle cx="9" cy="9" r="1" fill="currentColor"/><circle cx="15" cy="9" r="1" fill="currentColor"/></svg> },
]

const defaultSessions = [
  { id: 1, name: 'Morning Calm', duration: '10', type: 'Breathwork' },
  { id: 2, name: 'Body Scan', duration: '15', type: 'Mindfulness' },
  { id: 3, name: 'Visualization', duration: '12', type: 'Manifestation' },
  { id: 4, name: 'Box Breathing', duration: '5', type: 'Breathwork' },
  { id: 5, name: 'Evening Wind-down', duration: '20', type: 'Mindfulness' },
]

const defaultIntentions = [
  { id: 1, text: 'Be present in every conversation', done: false },
  { id: 2, text: 'Move my body with intention', done: false },
  { id: 3, text: 'Limit social media to 30 min', done: false },
  { id: 4, text: 'Drink water before coffee', done: false },
]

const weekDays = ['M', 'T', 'W', 'T', 'F', 'S', 'S']
const moodMessages = ['', 'Take it easy today.', 'You\'re doing okay.', 'Good energy today.', 'Channel that energy.', 'Keep it up.']
const gratitudePrompts = ['What made you smile today?', 'Who are you grateful for?', 'What strength did you show?', 'What simple pleasure did you enjoy?']

export default function Spirit() {
  const todayKey = new Date().toISOString().split('T')[0]

  const [mood, setMood] = useStorage(`spirit_mood_${todayKey}`, null)
  const [gratitude, setGratitude] = useStorage(`spirit_gratitude_${todayKey}`, ['', '', ''])
  const [journalEntry, setJournalEntry] = useStorage(`spirit_journal_${todayKey}`, '')
  const [sessions, setSessions] = useStorage('spirit_sessions', defaultSessions)
  const [intentions, setIntentions] = useStorage(`spirit_intentions_${todayKey}`, defaultIntentions)
  const [streakDays] = useStorage('spirit_streak', [true, true, true, false, true, true, false])

  const [saved, setSaved] = useState(false)
  const [activeSession, setActiveSession] = useState(null)
  const [timerSecs, setTimerSecs] = useState(0)
  const [timerRunning, setTimerRunning] = useState(false)
  const intervalRef = useRef(null)

  const [showAddSession, setShowAddSession] = useState(false)
  const [showAddIntention, setShowAddIntention] = useState(false)
  const [editingSession, setEditingSession] = useState(null)
  const [editingIntention, setEditingIntention] = useState(null)
  const [sessionForm, setSessionForm] = useState({ name: '', duration: '', type: 'Mindfulness' })
  const [intentionForm, setIntentionForm] = useState({ text: '' })

  const promptIdx = useRef(Math.floor(Math.random() * gratitudePrompts.length)).current

  const toggleTimer = () => {
    if (timerRunning) { clearInterval(intervalRef.current); setTimerRunning(false) }
    else { intervalRef.current = setInterval(() => setTimerSecs(s => s + 1), 1000); setTimerRunning(true) }
  }

  const stopSession = () => {
    clearInterval(intervalRef.current)
    setTimerRunning(false); setActiveSession(null); setTimerSecs(0)
  }

  const fmtTime = (s) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`

  const saveJournal = () => { setSaved(true); setTimeout(() => setSaved(false), 2000) }

  const toggleIntention = (id) => setIntentions(prev => prev.map(i => i.id === id ? { ...i, done: !i.done } : i))

  const openAddSession = () => { setEditingSession(null); setSessionForm({ name: '', duration: '', type: 'Mindfulness' }); setShowAddSession(true) }
  const openEditSession = (e, s) => { e.stopPropagation(); setEditingSession(s.id); setSessionForm({ name: s.name, duration: s.duration, type: s.type }); setShowAddSession(true) }

  const saveSession = () => {
    if (!sessionForm.name.trim()) return
    if (editingSession) {
      setSessions(ss => ss.map(s => s.id === editingSession ? { ...s, ...sessionForm } : s))
    } else {
      setSessions(ss => [...ss, { id: Date.now(), ...sessionForm }])
    }
    setShowAddSession(false)
  }

  const deleteSession = () => { setSessions(ss => ss.filter(s => s.id !== editingSession)); setShowAddSession(false) }

  const openAddIntention = () => { setEditingIntention(null); setIntentionForm({ text: '' }); setShowAddIntention(true) }
  const openEditIntention = (e, item) => { e.stopPropagation(); setEditingIntention(item.id); setIntentionForm({ text: item.text }); setShowAddIntention(true) }

  const saveIntention = () => {
    if (!intentionForm.text.trim()) return
    if (editingIntention) {
      setIntentions(is => is.map(i => i.id === editingIntention ? { ...i, ...intentionForm } : i))
    } else {
      setIntentions(is => [...is, { id: Date.now(), text: intentionForm.text, done: false }])
    }
    setShowAddIntention(false)
  }

  const deleteIntention = () => { setIntentions(is => is.filter(i => i.id !== editingIntention)); setShowAddIntention(false) }

  const streakCount = streakDays.filter(Boolean).length

  return (
    <div style={{ padding: '48px 16px 16px', display: 'flex', flexDirection: 'column', gap: '20px' }}>

      <div>
        <h1 style={{ fontSize: '24px', fontWeight: '700' }}>Spirit</h1>
        <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.7)', marginTop: '4px' }}>Mindfulness & inner work</p>
      </div>

      {/* Streak */}
      <div style={{ ...glass, padding: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: '600' }}>Meditation Streak</h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <BoltIcon />
            <span style={{ fontSize: '16px', fontWeight: '700', color: '#10B981' }}>{streakCount} days</span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '6px' }}>
          {streakDays.map((done, i) => (
            <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
              <div style={{ width: '100%', aspectRatio: '1', borderRadius: '10px', background: done ? 'linear-gradient(135deg, #6366F1, #4F46E5)' : 'rgba(255,255,255,0.08)', border: `1px solid ${done ? 'rgba(99,102,241,0.5)' : 'rgba(255,255,255,0.12)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {done && <CheckIcon />}
              </div>
              <span style={{ fontSize: '10px', color: done ? 'rgba(199,200,255,0.8)' : 'rgba(255,255,255,0.35)' }}>{weekDays[i]}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Mood */}
      <div style={{ ...glass, padding: '20px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '4px' }}>How are you feeling?</h3>
        <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.45)', marginBottom: '16px' }}>Check in with yourself</p>
        <div style={{ display: 'flex', gap: '6px' }}>
          {moods.map(m => (
            <button key={m.value} onClick={() => setMood(m.value)} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', padding: '10px 4px', borderRadius: '14px', cursor: 'pointer', background: mood === m.value ? 'rgba(99,102,241,0.25)' : 'rgba(255,255,255,0.05)', border: `1px solid ${mood === m.value ? 'rgba(99,102,241,0.5)' : 'rgba(255,255,255,0.1)'}`, fontFamily: 'Inter, sans-serif', transition: 'all 0.2s', color: mood === m.value ? 'rgba(199,200,255,0.9)' : 'rgba(255,255,255,0.4)' }}>
              {m.icon}
              <span style={{ fontSize: '10px', fontWeight: '500' }}>{m.label}</span>
            </button>
          ))}
        </div>
        {mood && <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', marginTop: '12px', textAlign: 'center' }}>Logged — {moodMessages[mood]}</p>}
      </div>

      {/* Meditate */}
      <div style={{ ...glass, padding: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: '600' }}>Meditate</h3>
          {!activeSession && (
            <button onClick={openAddSession} style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'linear-gradient(135deg, #6366F1, #4F46E5)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            </button>
          )}
        </div>

        {activeSession ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', padding: '8px 0' }}>
            <p style={{ fontSize: '15px', fontWeight: '600', color: 'rgba(199,200,255,0.9)' }}>{activeSession.name}</p>
            <div style={{ position: 'relative', width: '120px', height: '120px' }}>
              <svg width="120" height="120" viewBox="0 0 120 120">
                <circle cx="60" cy="60" r="50" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="8"/>
                <circle cx="60" cy="60" r="50" fill="none" stroke="url(#spiritGrad)" strokeWidth="8"
                  strokeDasharray={`${(timerSecs % 60) / 60 * 314} 314`}
                  strokeLinecap="round" transform="rotate(-90 60 60)" />
                <defs>
                  <linearGradient id="spiritGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#6366F1"/><stop offset="100%" stopColor="#10B981"/>
                  </linearGradient>
                </defs>
              </svg>
              <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: '26px', fontWeight: '700', fontVariantNumeric: 'tabular-nums' }}>{fmtTime(timerSecs)}</span>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={toggleTimer} style={{ padding: '12px 28px', borderRadius: '14px', cursor: 'pointer', background: 'linear-gradient(135deg, #6366F1, #4F46E5)', border: 'none', color: '#fff', fontSize: '14px', fontWeight: '600', fontFamily: 'Inter, sans-serif' }}>{timerRunning ? 'Pause' : 'Start'}</button>
              <button onClick={stopSession} style={{ padding: '12px 20px', borderRadius: '14px', cursor: 'pointer', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.7)', fontSize: '14px', fontFamily: 'Inter, sans-serif' }}>Done</button>
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {sessions.map(s => (
              <button key={s.id} onClick={() => setActiveSession(s)} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 14px', borderRadius: '14px', cursor: 'pointer', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', fontFamily: 'Inter, sans-serif', textAlign: 'left' }}>
                <div style={iconBg}><LotusIcon size={16} /></div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: '14px', fontWeight: '500', color: '#fff' }}>{s.name}</p>
                  <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', marginTop: '2px' }}>{s.type}</p>
                </div>
                <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}>{s.duration} min</span>
                <button onClick={e => openEditSession(e, s)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.3)', padding: '4px' }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                </button>
                <PlayIcon />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Gratitude journal */}
      <div style={{ ...glass, padding: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '4px' }}>
          <div style={iconBg}><PenIcon /></div>
          <h3 style={{ fontSize: '16px', fontWeight: '600' }}>Gratitude Journal</h3>
        </div>
        <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)', marginBottom: '14px', marginTop: '4px' }}>{gratitudePrompts[promptIdx]}</p>
        {gratitude.map((g, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.25)', minWidth: '14px', fontWeight: '600' }}>{i + 1}</span>
            <input value={g} onChange={e => { const next = [...gratitude]; next[i] = e.target.value; setGratitude(next) }}
              placeholder="I'm grateful for..."
              style={{ ...inputStyle, padding: '10px 12px', fontSize: '13px' }} />
          </div>
        ))}
        <h3 style={{ fontSize: '15px', fontWeight: '600', margin: '16px 0 8px' }}>Today's reflection</h3>
        <textarea value={journalEntry} onChange={e => setJournalEntry(e.target.value)}
          placeholder="Write freely about your day, feelings, or intentions..."
          rows={4}
          style={{ ...inputStyle, resize: 'none', lineHeight: '1.6', padding: '12px' }} />
        <button onClick={saveJournal} style={{ width: '100%', marginTop: '12px', padding: '12px', borderRadius: '14px', cursor: 'pointer', background: saved ? 'rgba(16,185,129,0.2)' : 'rgba(99,102,241,0.2)', border: `1px solid ${saved ? 'rgba(16,185,129,0.4)' : 'rgba(99,102,241,0.4)'}`, color: saved ? '#10B981' : 'rgba(199,200,255,0.9)', fontSize: '14px', fontWeight: '600', fontFamily: 'Inter, sans-serif', transition: 'all 0.3s' }}>
          {saved ? 'Saved' : 'Save Entry'}
        </button>
      </div>

      {/* Intentions */}
      <div style={{ ...glass, padding: '20px', marginBottom: '8px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: '600' }}>Daily Intentions</h3>
          <button onClick={openAddIntention} style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'linear-gradient(135deg, #6366F1, #4F46E5)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          </button>
        </div>
        {intentions.map((item, i) => (
          <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 0', borderBottom: i < intentions.length - 1 ? '1px solid rgba(255,255,255,0.06)' : 'none' }}>
            <div onClick={() => toggleIntention(item.id)} style={{ width: '20px', height: '20px', borderRadius: '50%', flexShrink: 0, cursor: 'pointer', background: item.done ? 'linear-gradient(135deg, #6366F1, #4F46E5)' : 'rgba(255,255,255,0.08)', border: `2px solid ${item.done ? 'rgba(99,102,241,0.6)' : 'rgba(255,255,255,0.15)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {item.done && <CheckIcon size={9} />}
            </div>
            <span onClick={() => toggleIntention(item.id)} style={{ fontSize: '14px', flex: 1, cursor: 'pointer', color: item.done ? 'rgba(255,255,255,0.35)' : 'rgba(255,255,255,0.85)', textDecoration: item.done ? 'line-through' : 'none' }}>{item.text}</span>
            <button onClick={e => openEditIntention(e, item)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.3)', padding: '4px' }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
            </button>
          </div>
        ))}
      </div>

      {/* Session modal */}
      {showAddSession && (
        <Modal title={editingSession ? 'Edit session' : 'New session'} onClose={() => setShowAddSession(false)}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div><label style={labelStyle}>Session name</label><input style={inputStyle} placeholder="e.g. Morning Calm" value={sessionForm.name} onChange={e => setSessionForm(f => ({ ...f, name: e.target.value }))} /></div>
            <div><label style={labelStyle}>Duration (min)</label><input style={inputStyle} type="number" placeholder="10" value={sessionForm.duration} onChange={e => setSessionForm(f => ({ ...f, duration: e.target.value }))} /></div>
            <div>
              <label style={labelStyle}>Type</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {['Mindfulness', 'Breathwork', 'Manifestation', 'Body Scan', 'Other'].map(t => (
                  <button key={t} onClick={() => setSessionForm(f => ({ ...f, type: t }))} style={{ padding: '6px 14px', borderRadius: '20px', cursor: 'pointer', background: sessionForm.type === t ? 'rgba(99,102,241,0.4)' : 'rgba(255,255,255,0.08)', border: `1px solid ${sessionForm.type === t ? 'rgba(99,102,241,0.6)' : 'rgba(255,255,255,0.15)'}`, color: sessionForm.type === t ? '#fff' : 'rgba(255,255,255,0.6)', fontSize: '12px', fontFamily: 'Inter, sans-serif' }}>{t}</button>
                ))}
              </div>
            </div>
            <button onClick={saveSession} style={{ ...btnPrimary, marginTop: '4px' }}>{editingSession ? 'Save changes' : 'Add session'}</button>
            {editingSession && <button onClick={deleteSession} style={{ ...btnSecondary, color: 'rgba(255,100,100,0.8)', border: '1px solid rgba(255,100,100,0.2)' }}>Delete session</button>}
          </div>
        </Modal>
      )}

      {/* Intention modal */}
      {showAddIntention && (
        <Modal title={editingIntention ? 'Edit intention' : 'New intention'} onClose={() => setShowAddIntention(false)}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div><label style={labelStyle}>Intention</label><input style={inputStyle} placeholder="e.g. Be present in every moment" value={intentionForm.text} onChange={e => setIntentionForm({ text: e.target.value })} /></div>
            <button onClick={saveIntention} style={{ ...btnPrimary, marginTop: '4px' }}>{editingIntention ? 'Save changes' : 'Add intention'}</button>
            {editingIntention && <button onClick={deleteIntention} style={{ ...btnSecondary, color: 'rgba(255,100,100,0.8)', border: '1px solid rgba(255,100,100,0.2)' }}>Delete intention</button>}
          </div>
        </Modal>
      )}
    </div>
  )
}