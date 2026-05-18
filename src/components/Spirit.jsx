import { useState, useEffect, useRef } from 'react'
import { supabase } from '../supabase'
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
const ImageIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>
  </svg>
)
const CloseIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
)
const ChevronIcon = ({ dir }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round">
    {dir === 'left' ? <polyline points="15 18 9 12 15 6"/> : <polyline points="9 18 15 12 9 6"/>}
  </svg>
)

const moods = [
  { label: 'Low', value: 1, icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="8" y1="15" x2="16" y2="15"/><circle cx="9" cy="9" r="1" fill="currentColor"/><circle cx="15" cy="9" r="1" fill="currentColor"/></svg> },
  { label: 'Okay', value: 2, icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="8" y1="13" x2="16" y2="13"/><circle cx="9" cy="9" r="1" fill="currentColor"/><circle cx="15" cy="9" r="1" fill="currentColor"/></svg> },
  { label: 'Good', value: 3, icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><path d="M8 13s1 2 4 2 4-2 4-2"/><circle cx="9" cy="9" r="1" fill="currentColor"/><circle cx="15" cy="9" r="1" fill="currentColor"/></svg> },
  { label: 'Great', value: 4, icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><path d="M8 12s1 3 4 3 4-3 4-3"/><circle cx="9" cy="9" r="1" fill="currentColor"/><circle cx="15" cy="9" r="1" fill="currentColor"/></svg> },
  { label: 'Amazing', value: 5, icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><path d="M7 12s2 4 5 4 5-4 5-4"/><circle cx="9" cy="9" r="1" fill="currentColor"/><circle cx="15" cy="9" r="1" fill="currentColor"/></svg> },
]

const weekDays = ['M', 'T', 'W', 'T', 'F', 'S', 'S']
const moodMessages = ['', 'Take it easy today.', "You're doing okay.", 'Good energy today.', 'Channel that energy.', 'Keep it up.']
const gratitudePrompts = ['What made you smile today?', 'Who are you grateful for?', 'What strength did you show?', 'What simple pleasure did you enjoy?']

const fmtDate = (dateStr) => {
  const d = new Date(dateStr + 'T00:00:00')
  const today = new Date()
  const yesterday = new Date(); yesterday.setDate(today.getDate() - 1)
  if (dateStr === today.toISOString().split('T')[0]) return 'Today'
  if (dateStr === yesterday.toISOString().split('T')[0]) return 'Yesterday'
  return d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
}

const fmtTime = (ts) => new Date(ts).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })

// ── Photo Lightbox ──
function Lightbox({ photos, startIdx, onClose }) {
  const [idx, setIdx] = useState(startIdx)
  const photo = photos[idx]

  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowLeft') setIdx(i => Math.max(0, i - 1))
      if (e.key === 'ArrowRight') setIdx(i => Math.min(photos.length - 1, i + 1))
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [photos.length])

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 999, background: 'rgba(0,0,0,0.95)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}
      onClick={onClose}>
      {/* Close */}
      <button onClick={onClose} style={{ position: 'absolute', top: '20px', right: '20px', background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '50%', width: '40px', height: '40px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <CloseIcon />
      </button>
      {/* Counter */}
      <p style={{ position: 'absolute', top: '24px', left: '50%', transform: 'translateX(-50%)', fontSize: '13px', color: 'rgba(255,255,255,0.5)' }}>{idx + 1} / {photos.length}</p>
      {/* Prev */}
      {idx > 0 && (
        <button onClick={e => { e.stopPropagation(); setIdx(i => i - 1) }} style={{ position: 'absolute', left: '16px', background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '50%', width: '44px', height: '44px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <ChevronIcon dir="left" />
        </button>
      )}
      {/* Image */}
      <img src={photo.url} alt={photo.caption || ''} onClick={e => e.stopPropagation()}
        style={{ maxWidth: '92vw', maxHeight: '80vh', objectFit: 'contain', borderRadius: '12px' }} />
      {/* Caption */}
      {photo.caption && (
        <p style={{ marginTop: '16px', fontSize: '14px', color: 'rgba(255,255,255,0.7)', textAlign: 'center', maxWidth: '360px' }}>{photo.caption}</p>
      )}
      {/* Date */}
      <p style={{ marginTop: '8px', fontSize: '12px', color: 'rgba(255,255,255,0.35)' }}>
        {new Date(photo.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
      </p>
      {/* Next */}
      {idx < photos.length - 1 && (
        <button onClick={e => { e.stopPropagation(); setIdx(i => i + 1) }} style={{ position: 'absolute', right: '16px', background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '50%', width: '44px', height: '44px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <ChevronIcon dir="right" />
        </button>
      )}
    </div>
  )
}

export default function Spirit() {
  const today = new Date().toISOString().split('T')[0]
  const promptIdx = useRef(Math.floor(Math.random() * gratitudePrompts.length)).current
  const fileInputRef = useRef(null)

  // ── State ──
  const [loading, setLoading] = useState(true)
  const [mood, setMoodState] = useState(null)
  const [gratitude, setGratitudeState] = useState(['', '', ''])
  const [journalEntry, setJournalEntryState] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const [journalEntries, setJournalEntries] = useState([]) // all past entries grouped by date
  const [photos, setPhotos] = useState([])
  const [lightboxIdx, setLightboxIdx] = useState(null)
  const [uploadingPhoto, setUploadingPhoto] = useState(false)
  const [captionDraft, setCaptionDraft] = useState('')
  const [showPhotoGallery, setShowPhotoGallery] = useState(false)
  const [pendingPhotoFile, setPendingPhotoFile] = useState(null)
  const [showCaptionModal, setShowCaptionModal] = useState(false)

  const [sessions, setSessions] = useState([])
  const [intentions, setIntentions] = useState([])
  const [intentionLogs, setIntentionLogs] = useState({})
  const [streakDates, setStreakDates] = useState([])

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

  // ── Load all ──
  useEffect(() => { loadAll() }, [])

  const loadAll = async () => {
    setLoading(true)
    try {
      const [
        { data: dailyLog },
        { data: sessionsData },
        { data: intentionsData },
        { data: intentionLogsData },
        { data: recentLogs },
        { data: entriesData },
        { data: photosData },
      ] = await Promise.all([
        supabase.from('spirit_daily_logs').select('*').eq('date', today).maybeSingle(),
        supabase.from('spirit_sessions').select('*').order('sort_order'),
        supabase.from('spirit_intentions').select('*').order('sort_order'),
        supabase.from('spirit_intention_logs').select('*').eq('date', today),
        supabase.from('spirit_daily_logs').select('date').order('date', { ascending: false }).limit(30),
        supabase.from('spirit_journal_entries').select('*').order('created_at', { ascending: false }),
        supabase.from('spirit_journal_photos').select('*').order('created_at', { ascending: false }),
      ])

      if (dailyLog) setMoodState(dailyLog.mood)

      setSessions(sessionsData || [])
      setIntentions(intentionsData || [])

      const logMap = {}
      intentionLogsData?.forEach(l => { logMap[l.intention_id] = l })
      setIntentionLogs(logMap)

      const logDates = new Set(recentLogs?.map(l => l.date) || [])
      const streak = Array.from({ length: 7 }, (_, i) => {
        const d = new Date(); d.setDate(d.getDate() - (6 - i))
        return logDates.has(d.toISOString().split('T')[0])
      })
      setStreakDates(streak)
      setJournalEntries(entriesData || [])
      setPhotos(photosData || [])
    } catch (e) { console.error(e) }
    setLoading(false)
  }

  const upsertDailyLog = async (fields) => {
    await supabase.from('spirit_daily_logs').upsert({ date: today, ...fields }, { onConflict: 'date' })
  }

  // ── Mood ──
  const handleMood = async (val) => {
    setMoodState(val)
    await upsertDailyLog({ mood: val })
  }

  // ── Journal save (append new entry) ──
  const saveJournal = async () => {
    if (!gratitude[0] && !gratitude[1] && !gratitude[2] && !journalEntry.trim()) return
    setSaving(true)
    await supabase.from('spirit_journal_entries').insert({
      date: today,
      gratitude_1: gratitude[0] || null,
      gratitude_2: gratitude[1] || null,
      gratitude_3: gratitude[2] || null,
      journal: journalEntry.trim() || null,
    })
    // Clear form
    setGratitudeState(['', '', ''])
    setJournalEntryState('')
    setSaved(true)
    await loadAll()
    setSaving(false)
    setTimeout(() => setSaved(false), 2000)
  }

  // ── Photo upload ──
  const handleFileSelect = (e) => {
    const file = e.target.files[0]
    if (!file) return
    setPendingPhotoFile(file)
    setCaptionDraft('')
    setShowCaptionModal(true)
    e.target.value = ''
  }

  const uploadPhoto = async () => {
    if (!pendingPhotoFile) return
    setUploadingPhoto(true)
    setShowCaptionModal(false)
    const ext = pendingPhotoFile.name.split('.').pop()
    const path = `${Date.now()}.${ext}`
    const { error: upErr } = await supabase.storage.from('journal-photos').upload(path, pendingPhotoFile)
    if (upErr) { console.error(upErr); setUploadingPhoto(false); return }
    const { data: { publicUrl } } = supabase.storage.from('journal-photos').getPublicUrl(path)
    await supabase.from('spirit_journal_photos').insert({ storage_path: path, url: publicUrl, caption: captionDraft.trim() || null })
    setPendingPhotoFile(null)
    await loadAll()
    setUploadingPhoto(false)
    setShowPhotoGallery(true)
  }

  const deletePhoto = async (photo) => {
    await supabase.storage.from('journal-photos').remove([photo.storage_path])
    await supabase.from('spirit_journal_photos').delete().eq('id', photo.id)
    setLightboxIdx(null)
    loadAll()
  }

  // ── Intentions ──
  const toggleIntention = async (intention) => {
    const existing = intentionLogs[intention.id]
    const newDone = existing ? !existing.done : true
    setIntentionLogs(prev => ({ ...prev, [intention.id]: { ...(existing || { intention_id: intention.id, date: today }), done: newDone } }))
    if (existing) {
      await supabase.from('spirit_intention_logs').update({ done: newDone }).eq('id', existing.id)
    } else {
      const { data } = await supabase.from('spirit_intention_logs').insert({ date: today, intention_id: intention.id, done: true }).select().single()
      if (data) setIntentionLogs(prev => ({ ...prev, [intention.id]: data }))
    }
  }

  // ── Sessions ──
  const openAddSession = () => { setEditingSession(null); setSessionForm({ name: '', duration: '', type: 'Mindfulness' }); setShowAddSession(true) }
  const openEditSession = (e, s) => { e.stopPropagation(); setEditingSession(s); setSessionForm({ name: s.name, duration: String(s.duration), type: s.type }); setShowAddSession(true) }

  const saveSession = async () => {
    if (!sessionForm.name.trim()) return
    const payload = { name: sessionForm.name, duration: parseInt(sessionForm.duration) || 10, type: sessionForm.type }
    if (editingSession) await supabase.from('spirit_sessions').update(payload).eq('id', editingSession.id)
    else await supabase.from('spirit_sessions').insert({ ...payload, sort_order: sessions.length })
    setShowAddSession(false); loadAll()
  }

  const deleteSession = async () => {
    await supabase.from('spirit_sessions').delete().eq('id', editingSession.id)
    setShowAddSession(false); loadAll()
  }

  // ── Intentions CRUD ──
  const openAddIntention = () => { setEditingIntention(null); setIntentionForm({ text: '' }); setShowAddIntention(true) }
  const openEditIntention = (e, item) => { e.stopPropagation(); setEditingIntention(item); setIntentionForm({ text: item.text }); setShowAddIntention(true) }

  const saveIntention = async () => {
    if (!intentionForm.text.trim()) return
    if (editingIntention) await supabase.from('spirit_intentions').update({ text: intentionForm.text }).eq('id', editingIntention.id)
    else await supabase.from('spirit_intentions').insert({ text: intentionForm.text, sort_order: intentions.length })
    setShowAddIntention(false); loadAll()
  }

  const deleteIntention = async () => {
    await supabase.from('spirit_intentions').delete().eq('id', editingIntention.id)
    setShowAddIntention(false); loadAll()
  }

  // ── Timer ──
  const toggleTimer = () => {
    if (timerRunning) { clearInterval(intervalRef.current); setTimerRunning(false) }
    else { intervalRef.current = setInterval(() => setTimerSecs(s => s + 1), 1000); setTimerRunning(true) }
  }

  const stopSession = async () => {
    clearInterval(intervalRef.current)
    await upsertDailyLog({ mood: mood ?? null })
    setTimerRunning(false); setActiveSession(null); setTimerSecs(0)
    loadAll()
  }

  const fmtTimer = (s) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`

  // ── Group entries by date ──
  const groupedEntries = journalEntries.reduce((acc, entry) => {
    const key = entry.date
    if (!acc[key]) acc[key] = []
    acc[key].push(entry)
    return acc
  }, {})
  const sortedDates = Object.keys(groupedEntries).sort((a, b) => b.localeCompare(a))

  const streakCount = streakDates.filter(Boolean).length

  if (loading) return (
    <div style={{ padding: '48px 16px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: '16px' }}>
      <div style={{ width: '40px', height: '40px', borderRadius: '50%', border: '3px solid rgba(255,255,255,0.1)', borderTop: '3px solid #6366F1', animation: 'spin 1s linear infinite' }} />
      <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '14px' }}>Loading spirit...</p>
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  )

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
          {streakDates.map((done, i) => (
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
            <button key={m.value} onClick={() => handleMood(m.value)} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', padding: '10px 4px', borderRadius: '14px', cursor: 'pointer', background: mood === m.value ? 'rgba(99,102,241,0.25)' : 'rgba(255,255,255,0.05)', border: `1px solid ${mood === m.value ? 'rgba(99,102,241,0.5)' : 'rgba(255,255,255,0.1)'}`, fontFamily: 'Inter, sans-serif', transition: 'all 0.2s', color: mood === m.value ? 'rgba(199,200,255,0.9)' : 'rgba(255,255,255,0.4)' }}>
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
                <defs><linearGradient id="spiritGrad" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stopColor="#6366F1"/><stop offset="100%" stopColor="#10B981"/></linearGradient></defs>
              </svg>
              <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: '26px', fontWeight: '700', fontVariantNumeric: 'tabular-nums' }}>{fmtTimer(timerSecs)}</span>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={toggleTimer} style={{ padding: '12px 28px', borderRadius: '14px', cursor: 'pointer', background: 'linear-gradient(135deg, #6366F1, #4F46E5)', border: 'none', color: '#fff', fontSize: '14px', fontWeight: '600', fontFamily: 'Inter, sans-serif' }}>{timerRunning ? 'Pause' : 'Start'}</button>
              <button onClick={stopSession} style={{ padding: '12px 20px', borderRadius: '14px', cursor: 'pointer', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.7)', fontSize: '14px', fontFamily: 'Inter, sans-serif' }}>Done</button>
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {sessions.length === 0 && <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.3)', textAlign: 'center', padding: '16px 0' }}>No sessions yet — tap + to add one.</p>}
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

      {/* Gratitude + Journal (write new entry) */}
      <div style={{ ...glass, padding: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '4px' }}>
          <div style={iconBg}><PenIcon /></div>
          <h3 style={{ fontSize: '16px', fontWeight: '600' }}>Gratitude Journal</h3>
        </div>
        <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)', marginBottom: '14px', marginTop: '4px' }}>{gratitudePrompts[promptIdx]}</p>
        {gratitude.map((g, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.25)', minWidth: '14px', fontWeight: '600' }}>{i + 1}</span>
            <input value={g} onChange={e => { const next = [...gratitude]; next[i] = e.target.value; setGratitudeState(next) }}
              placeholder="I'm grateful for..."
              style={{ ...inputStyle, padding: '10px 12px', fontSize: '13px' }} />
          </div>
        ))}
        <h3 style={{ fontSize: '15px', fontWeight: '600', margin: '16px 0 8px' }}>Today's reflection</h3>
        <textarea value={journalEntry} onChange={e => setJournalEntryState(e.target.value)}
          placeholder="Write freely about your day, feelings, or intentions..."
          rows={4}
          style={{ ...inputStyle, resize: 'none', lineHeight: '1.6', padding: '12px' }} />
        <button onClick={saveJournal} disabled={saving} style={{ width: '100%', marginTop: '12px', padding: '12px', borderRadius: '14px', cursor: saving ? 'default' : 'pointer', background: saved ? 'rgba(16,185,129,0.2)' : 'rgba(99,102,241,0.2)', border: `1px solid ${saved ? 'rgba(16,185,129,0.4)' : 'rgba(99,102,241,0.4)'}`, color: saved ? '#10B981' : 'rgba(199,200,255,0.9)', fontSize: '14px', fontWeight: '600', fontFamily: 'Inter, sans-serif', transition: 'all 0.3s', opacity: saving ? 0.6 : 1 }}>
          {saving ? 'Saving...' : saved ? '✓ Entry saved' : 'Save Entry'}
        </button>
      </div>

      {/* Past journal entries */}
      {journalEntries.length > 0 && (
        <div style={{ ...glass, padding: '20px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px' }}>Past Entries</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {sortedDates.map(date => (
              <div key={date}>
                <p style={{ fontSize: '12px', fontWeight: '600', color: 'rgba(199,200,255,0.7)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '10px' }}>{fmtDate(date)}</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {groupedEntries[date].map((entry, i) => (
                    <div key={entry.id} style={{ padding: '14px 16px', borderRadius: '16px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.09)' }}>
                      <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)', marginBottom: '10px' }}>{fmtTime(entry.created_at)}</p>
                      {[entry.gratitude_1, entry.gratitude_2, entry.gratitude_3].filter(Boolean).length > 0 && (
                        <div style={{ marginBottom: entry.journal ? '10px' : '0' }}>
                          <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.35)', fontWeight: '600', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Grateful for</p>
                          {[entry.gratitude_1, entry.gratitude_2, entry.gratitude_3].filter(Boolean).map((g, gi) => (
                            <div key={gi} style={{ display: 'flex', gap: '8px', alignItems: 'flex-start', marginBottom: '4px' }}>
                              <span style={{ fontSize: '12px', color: 'rgba(99,102,241,0.8)', marginTop: '1px' }}>•</span>
                              <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.8)', lineHeight: '1.5' }}>{g}</p>
                            </div>
                          ))}
                        </div>
                      )}
                      {entry.journal && (
                        <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.75)', lineHeight: '1.7', borderTop: [entry.gratitude_1, entry.gratitude_2, entry.gratitude_3].filter(Boolean).length > 0 ? '1px solid rgba(255,255,255,0.07)' : 'none', paddingTop: [entry.gratitude_1, entry.gratitude_2, entry.gratitude_3].filter(Boolean).length > 0 ? '10px' : '0' }}>{entry.journal}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Photo Journal */}
      <div style={{ ...glass, padding: '20px', marginBottom: '8px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={iconBg}><ImageIcon /></div>
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: '600' }}>Photo Journal</h3>
              <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', marginTop: '2px' }}>{photos.length} {photos.length === 1 ? 'entry' : 'entries'}</p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            {photos.length > 0 && (
              <button onClick={() => setShowPhotoGallery(true)} style={{ padding: '8px 14px', borderRadius: '12px', cursor: 'pointer', background: 'rgba(99,102,241,0.2)', border: '1px solid rgba(99,102,241,0.35)', color: 'rgba(199,200,255,0.9)', fontSize: '12px', fontWeight: '500', fontFamily: 'Inter, sans-serif' }}>View all</button>
            )}
            <button onClick={() => fileInputRef.current?.click()} disabled={uploadingPhoto} style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'linear-gradient(135deg, #6366F1, #4F46E5)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: uploadingPhoto ? 0.6 : 1 }}>
              {uploadingPhoto
                ? <div style={{ width: '12px', height: '12px', border: '2px solid rgba(255,255,255,0.3)', borderTop: '2px solid white', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                : <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              }
            </button>
          </div>
        </div>

        <input ref={fileInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFileSelect} />

        {photos.length === 0 ? (
          <button onClick={() => fileInputRef.current?.click()} style={{ width: '100%', padding: '32px 16px', borderRadius: '16px', cursor: 'pointer', background: 'rgba(255,255,255,0.03)', border: '1px dashed rgba(255,255,255,0.15)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', fontFamily: 'Inter, sans-serif' }}>
            <div style={{ ...iconBg, width: '44px', height: '44px', borderRadius: '16px' }}><ImageIcon /></div>
            <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.5)', fontWeight: '500' }}>Upload a journal photo</p>
            <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.3)' }}>Photos of handwritten or typed journals</p>
          </button>
        ) : (
          // Preview grid — most recent 4
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
            {photos.slice(0, 3).map((photo, i) => (
              <div key={photo.id} onClick={() => { setShowPhotoGallery(true); setLightboxIdx(i) }} style={{ aspectRatio: '1', borderRadius: '12px', overflow: 'hidden', cursor: 'pointer', background: 'rgba(255,255,255,0.05)' }}>
                <img src={photo.url} alt={photo.caption || ''} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
            ))}
            {photos.length > 3 ? (
              <div onClick={() => setShowPhotoGallery(true)} style={{ aspectRatio: '1', borderRadius: '12px', overflow: 'hidden', cursor: 'pointer', background: 'rgba(99,102,241,0.2)', border: '1px solid rgba(99,102,241,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '4px' }}>
                <span style={{ fontSize: '18px', fontWeight: '700', color: 'rgba(199,200,255,0.9)' }}>+{photos.length - 3}</span>
                <span style={{ fontSize: '10px', color: 'rgba(199,200,255,0.6)' }}>more</span>
              </div>
            ) : (
              <div onClick={() => fileInputRef.current?.click()} style={{ aspectRatio: '1', borderRadius: '12px', border: '1px dashed rgba(255,255,255,0.15)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="2" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Intentions */}
      <div style={{ ...glass, padding: '20px', marginBottom: '8px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: '600' }}>Daily Intentions</h3>
          <button onClick={openAddIntention} style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'linear-gradient(135deg, #6366F1, #4F46E5)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          </button>
        </div>
        {intentions.length === 0 && <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.3)', textAlign: 'center', padding: '16px 0' }}>No intentions yet — tap + to add one.</p>}
        {intentions.map((item, i) => {
          const log = intentionLogs[item.id]
          const done = log?.done ?? false
          return (
            <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 0', borderBottom: i < intentions.length - 1 ? '1px solid rgba(255,255,255,0.06)' : 'none' }}>
              <div onClick={() => toggleIntention(item)} style={{ width: '20px', height: '20px', borderRadius: '50%', flexShrink: 0, cursor: 'pointer', background: done ? 'linear-gradient(135deg, #6366F1, #4F46E5)' : 'rgba(255,255,255,0.08)', border: `2px solid ${done ? 'rgba(99,102,241,0.6)' : 'rgba(255,255,255,0.15)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {done && <CheckIcon size={9} />}
              </div>
              <span onClick={() => toggleIntention(item)} style={{ fontSize: '14px', flex: 1, cursor: 'pointer', color: done ? 'rgba(255,255,255,0.35)' : 'rgba(255,255,255,0.85)', textDecoration: done ? 'line-through' : 'none' }}>{item.text}</span>
              <button onClick={e => openEditIntention(e, item)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.3)', padding: '4px' }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
              </button>
            </div>
          )
        })}
      </div>

      {/* Photo Gallery Modal */}
      {showPhotoGallery && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(10,12,28,0.98)', display: 'flex', flexDirection: 'column' }}>
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 20px 12px', borderBottom: '1px solid rgba(255,255,255,0.08)', flexShrink: 0 }}>
            <div>
              <h2 style={{ fontSize: '18px', fontWeight: '700' }}>Photo Journal</h2>
              <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', marginTop: '2px' }}>{photos.length} {photos.length === 1 ? 'entry' : 'entries'}</p>
            </div>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <button onClick={() => fileInputRef.current?.click()} style={{ padding: '8px 16px', borderRadius: '12px', cursor: 'pointer', background: 'linear-gradient(135deg, #6366F1, #4F46E5)', border: 'none', color: '#fff', fontSize: '13px', fontWeight: '600', fontFamily: 'Inter, sans-serif' }}>+ Upload</button>
              <button onClick={() => { setShowPhotoGallery(false); setLightboxIdx(null) }} style={{ background: 'rgba(255,255,255,0.08)', border: 'none', borderRadius: '50%', width: '36px', height: '36px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <CloseIcon />
              </button>
            </div>
          </div>
          {/* Grid */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>
            {photos.length === 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: '16px' }}>
                <div style={{ ...iconBg, width: '56px', height: '56px', borderRadius: '20px' }}><ImageIcon /></div>
                <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '15px' }}>No photos yet</p>
                <button onClick={() => fileInputRef.current?.click()} style={{ ...btnPrimary }}>Upload first photo</button>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                {photos.map((photo, i) => (
                  <div key={photo.id} onClick={() => setLightboxIdx(i)} style={{ aspectRatio: '1', borderRadius: '12px', overflow: 'hidden', cursor: 'pointer', background: 'rgba(255,255,255,0.05)', position: 'relative' }}>
                    <img src={photo.url} alt={photo.caption || ''} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    {photo.caption && (
                      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'linear-gradient(transparent, rgba(0,0,0,0.7))', padding: '16px 8px 8px' }}>
                        <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.8)', lineHeight: '1.3', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>{photo.caption}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Lightbox */}
      {lightboxIdx !== null && (
        <Lightbox
          photos={photos}
          startIdx={lightboxIdx}
          onClose={() => setLightboxIdx(null)}
        />
      )}

      {/* Caption modal (shown after file select, before upload) */}
      {showCaptionModal && (
        <Modal title="Add a caption" onClose={() => { setShowCaptionModal(false); setPendingPhotoFile(null) }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {pendingPhotoFile && (
              <img src={URL.createObjectURL(pendingPhotoFile)} alt="preview"
                style={{ width: '100%', maxHeight: '220px', objectFit: 'cover', borderRadius: '12px' }} />
            )}
            <div>
              <label style={labelStyle}>Caption (optional)</label>
              <input style={inputStyle} placeholder="e.g. Morning pages, May 18" value={captionDraft} onChange={e => setCaptionDraft(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') uploadPhoto() }} />
            </div>
            <button onClick={uploadPhoto} style={btnPrimary}>Upload photo</button>
          </div>
        </Modal>
      )}

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

      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  )
}