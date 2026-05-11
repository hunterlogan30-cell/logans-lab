import { useState } from 'react'
import Home from './components/Home'
import Schedule from './components/Schedule'
import Workout from './components/Workout'
import Recovery from './components/Recovery'
import Spirit from './components/Spirit'
import BottomNav from './components/BottomNav'

export default function App() {
  const [tab, setTab] = useState('home')

  return (
    <div
      style={{ minHeight: '100dvh', paddingBottom: '90px' }}
      onTouchStart={e => { if (e.touches.length > 1) e.preventDefault() }}
      onTouchMove={e => { if (e.touches.length > 1) e.preventDefault() }}
    >
      {tab === 'home' && <Home setTab={setTab} />}
      {tab === 'schedule' && <Schedule />}
      {tab === 'workout' && <Workout />}
      {tab === 'recovery' && <Recovery />}
      {tab === 'spirit' && <Spirit />}
      <BottomNav tab={tab} setTab={setTab} />
    </div>
  )
}