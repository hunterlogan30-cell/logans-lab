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
  const intervalRef = useRef(null)

  useEffect(() => {
    if (workoutRunning) {
      intervalRef.current = setInterval(() => setWorkoutElapsed(e => e + 1), 1000)
    } else {
      clearInterval(intervalRef.current)
    }
    return () => clearInterval(intervalRef.current)
  }, [workoutRunning])

  const startWorkout = () => { setWorkoutActive(true); setWorkoutElapsed(0); setWorkoutRunning(false) }
  const stopWorkout = () => { setWorkoutActive(false); setWorkoutElapsed(0); setWorkoutRunning(false) }
  const toggleWorkoutTimer = () => setWorkoutRunning(r => !r)

  return (
    <div
      style={{ minHeight: '100dvh', paddingBottom: '90px' }}
      onTouchStart={e => { if (e.touches.length > 1) e.preventDefault() }}
      onTouchMove={e => { if (e.touches.length > 1) e.preventDefault() }}
    >
      {tab === 'home' && <Home setTab={setTab} />}
      {tab === 'schedule' && <Schedule />}
      {tab === 'workout' && (
        <Workout
          workoutActive={workoutActive}
          workoutElapsed={workoutElapsed}
          workoutRunning={workoutRunning}
          onStartWorkout={startWorkout}
          onStopWorkout={stopWorkout}
          onToggleTimer={toggleWorkoutTimer}
        />
      )}
      {tab === 'recovery' && <Recovery />}
      {tab === 'spirit' && <Spirit />}
      <BottomNav tab={tab} setTab={setTab} />
    </div>
  )
}