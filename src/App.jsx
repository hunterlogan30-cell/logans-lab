import { useState, useEffect, useRef } from 'react'
import Home from './components/Home'
import Schedule from './components/Schedule'
import Workout from './components/Workout'
import Recovery from './components/Recovery'
import Spirit from './components/Spirit'
import BottomNav from './components/BottomNav'

export default function App() {
  const [tab, setTab] = useState('home')
  const [wide, setWide] = useState(window.innerWidth >= 768)
  const [workoutActive, setWorkoutActive] = useState(false)
  const [workoutStartTime, setWorkoutStartTime] = useState(null)
  const [workoutPausedAt, setWorkoutPausedAt] = useState(null)
  const [workoutElapsed, setWorkoutElapsed] = useState(0)
  const [workoutRunning, setWorkoutRunning] = useState(false)
  const [whoopData, setWhoopData] = useState(null)
  const intervalRef = useRef(null)

  useEffect(() => {
    const handler = () => setWide(window.innerWidth >= 768)
    window.addEventListener('resize', handler)
    return () => window.removeEventListener('resize', handler)
  }, [])

  useEffect(() => {
    fetch(`/api/whoop/data?t=${Date.now()}`)
      .then(r => r.json())
      .then(d => setWhoopData(d))
      .catch(() => null)
  }, [])

  const recoveryScore = whoopData?.sleep?.records?.[0]?.score?.sleep_performance_percentage || null

  useEffect(() => {
    if (workoutRunning && workoutStartTime) {
      intervalRef.current = setInterval(() => {
        setWorkoutElapsed(Math.floor((Date.now() - workoutStartTime) / 1000))
      }, 500)
    } else {
      clearInterval(intervalRef.current)
    }
    return () => clearInterval(intervalRef.current)
  }, [workoutRunning, workoutStartTime])

  useEffect(() => {
    const handleVisibility = () => {
      if (!document.hidden && workoutRunning && workoutStartTime) {
        setWorkoutElapsed(Math.floor((Date.now() - workoutStartTime) / 1000))
      }
    }
    document.addEventListener('visibilitychange', handleVisibility)
    return () => document.removeEventListener('visibilitychange', handleVisibility)
  }, [workoutRunning, workoutStartTime])

  const startWorkout = () => {
    const now = Date.now()
    setWorkoutActive(true)
    setWorkoutStartTime(now)
    setWorkoutElapsed(0)
    setWorkoutRunning(true)
  }

  const stopWorkout = async () => {
    setWorkoutActive(false)
    setWorkoutStartTime(null)
    setWorkoutElapsed(0)
    setWorkoutRunning(false)
    clearInterval(intervalRef.current)
    const { supabase } = await import('./supabase')
    const tod = new Date().toISOString().split('T')[0]
    const { data: fitnessBlocks } = await supabase
      .from('schedule_blocks')
      .select('*')
      .eq('date', tod)
      .eq('tag', 'Fitness')
      .eq('done', false)
    if (fitnessBlocks?.length) {
      await supabase.from('schedule_blocks').update({ done: true }).eq('id', fitnessBlocks[0].id)
    }
  }

  const toggleWorkoutTimer = () => {
    if (workoutRunning) {
      setWorkoutPausedAt(Date.now())
      setWorkoutRunning(false)
    } else {
      if (workoutPausedAt && workoutStartTime) {
        const pausedDuration = Date.now() - workoutPausedAt
        setWorkoutStartTime(t => t + pausedDuration)
      }
      setWorkoutRunning(true)
    }
  }

  const tabContent = (
    <>
      <div style={{ display: tab === 'home' ? 'block' : 'none', minHeight: '100dvh', paddingBottom: wide ? '24px' : '90px' }}>
        <Home setTab={setTab} />
      </div>
      <div style={{ display: tab === 'schedule' ? 'block' : 'none', minHeight: '100dvh', paddingBottom: wide ? '24px' : '90px' }}>
        <Schedule />
      </div>
      <div style={{ display: tab === 'workout' ? 'block' : 'none', minHeight: '100dvh', paddingBottom: wide ? '24px' : '90px' }}>
        <Workout
          workoutActive={workoutActive}
          workoutElapsed={workoutElapsed}
          workoutRunning={workoutRunning}
          onStartWorkout={startWorkout}
          onStopWorkout={stopWorkout}
          onToggleTimer={toggleWorkoutTimer}
          recoveryScore={recoveryScore}
        />
      </div>
      <div style={{ display: tab === 'recovery' ? 'block' : 'none', minHeight: '100dvh', paddingBottom: wide ? '24px' : '90px' }}>
        <Recovery whoopData={whoopData} />
      </div>
      <div style={{ display: tab === 'spirit' ? 'block' : 'none', minHeight: '100dvh', paddingBottom: wide ? '24px' : '90px' }}>
        <Spirit />
      </div>
    </>
  )

  return (
    <div
      onTouchStart={e => { if (e.touches.length > 1) e.preventDefault() }}
      onTouchMove={e => { if (e.touches.length > 1) e.preventDefault() }}
      style={{ minHeight: '100dvh' }}
    >
      {wide ? (
  <div style={{ display: 'flex', minHeight: '100dvh' }}>
    <BottomNav tab={tab} setTab={setTab} />
    <div style={{
  position: 'fixed',
  left: '220px',
  top: 0,
  right: 0,
  bottom: 0,
  overflowY: 'auto',
  overflowX: 'hidden',
}}>
      {tabContent}
    </div>
  </div>
      ) : (
        <>
          {tabContent}
          <BottomNav tab={tab} setTab={setTab} />
        </>
      )}
    </div>
  )
}