import { useState, useEffect, useRef } from 'react'
import Home from './components/Home'
import Schedule from './components/Schedule'
import Workout from './components/Workout'
import Recovery from './components/Recovery'
import Spirit from './components/Spirit'
import BottomNav from './components/BottomNav'

export default function App() {
  const [tab, setTab] = useState('home')
  const [workoutActive, setWorkoutActive] = useState(false)
  const [workoutElapsed, setWorkoutElapsed] = useState(0)
  const [workoutRunning, setWorkoutRunning] = useState(false)
  const [whoopData, setWhoopData] = useState(null)
  const intervalRef = useRef(null)

  // Fetch Whoop data once at app level
  useEffect(() => {
    fetch(`/api/whoop/data?t=${Date.now()}`)
      .then(r => r.json())
      .then(d => setWhoopData(d))
      .catch(() => null)
  }, [])

  // Derive recovery score from Whoop data
  const sleepPerf = whoopData?.sleep?.records?.[0]?.score?.sleep_performance_percentage || null
  const recoveryScore = sleepPerf // will update when cycle recovery is available

  useEffect(() => {
    if (workoutRunning) {
      intervalRef.current = setInterval(() => setWorkoutElapsed(e => e + 1), 1000)
    } else {
      clearInterval(intervalRef.current)
    }
    return () => clearInterval(intervalRef.current)
  }, [workoutRunning])

  const startWorkout = () => {
    setWorkoutActive(true)
    setWorkoutElapsed(0)
    setWorkoutRunning(false)
  }

  const stopWorkout = () => {
    setWorkoutActive(false)
    setWorkoutElapsed(0)
    setWorkoutRunning(false)
  }

  const toggleWorkoutTimer = () => setWorkoutRunning(r => !r)

  return (
    <div
      onTouchStart={e => { if (e.touches.length > 1) e.preventDefault() }}
      onTouchMove={e => { if (e.touches.length > 1) e.preventDefault() }}
    >
      <div style={{ display: tab === 'home' ? 'block' : 'none', minHeight: '100dvh', paddingBottom: '90px' }}>
        <Home setTab={setTab} />
      </div>
      <div style={{ display: tab === 'schedule' ? 'block' : 'none', minHeight: '100dvh', paddingBottom: '90px' }}>
        <Schedule />
      </div>
      <div style={{ display: tab === 'workout' ? 'block' : 'none', minHeight: '100dvh', paddingBottom: '90px' }}>
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
      <div style={{ display: tab === 'recovery' ? 'block' : 'none', minHeight: '100dvh', paddingBottom: '90px' }}>
        <Recovery whoopData={whoopData} />
      </div>
      <div style={{ display: tab === 'spirit' ? 'block' : 'none', minHeight: '100dvh', paddingBottom: '90px' }}>
        <Spirit />
      </div>
      <BottomNav tab={tab} setTab={setTab} />
    </div>
  )
}