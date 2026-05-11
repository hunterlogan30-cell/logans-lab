import { useEffect, useRef, useState } from 'react'

const data = [
  { day: 'Mon', score: 72 },
  { day: 'Tue', score: 68 },
  { day: 'Wed', score: 85 },
  { day: 'Thu', score: 78 },
  { day: 'Fri', score: 91 },
  { day: 'Sat', score: 85 },
  { day: 'Sun', score: 0 },
]

const PAD = { L: 36, R: 12, T: 16, B: 40 }
const todayIdx = 5

export default function WeeklyChart() {
  const canvasRef = useRef(null)
  const containerRef = useRef(null)
  const dprRef = useRef(1)
  const [tooltip, setTooltip] = useState(null)

  const getPoints = (W, H) => {
    const chartW = W - PAD.L - PAD.R
    const chartH = H - PAD.T - PAD.B
    return data.map((d, i) => ({
      x: PAD.L + (i / (data.length - 1)) * chartW,
      y: d.score > 0 ? PAD.T + chartH - (d.score / 100) * chartH : null,
      ...d,
      idx: i,
    }))
  }

  const setupCanvas = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const dpr = window.devicePixelRatio || 1
    dprRef.current = dpr
    const cssW = canvas.offsetWidth || 374
    const cssH = Math.round(cssW * (180 / 374))
    canvas.width = cssW * dpr
    canvas.height = cssH * dpr
    canvas.style.width = cssW + 'px'
    canvas.style.height = cssH + 'px'
    const ctx = canvas.getContext('2d')
    ctx.scale(dpr, dpr)
    return { W: cssW, H: cssH }
  }

  const draw = (highlightIdx = null) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const dpr = dprRef.current
    const ctx = canvas.getContext('2d')
    const W = canvas.width / dpr
    const H = canvas.height / dpr
    const chartH = H - PAD.T - PAD.B
    const pts = getPoints(W, H)

    ctx.clearRect(0, 0, W, H)

    // Y grid + labels
    ctx.font = '11px Inter, sans-serif'
    ctx.textAlign = 'right'
    ;[0, 25, 50, 75, 100].forEach(v => {
      const y = PAD.T + chartH - (v / 100) * chartH
      ctx.fillStyle = 'rgba(255,255,255,0.35)'
      ctx.fillText(v, PAD.L - 6, y + 4)
      ctx.strokeStyle = 'rgba(255,255,255,0.08)'
      ctx.lineWidth = 1
      ctx.setLineDash([4, 4])
      ctx.beginPath()
      ctx.moveTo(PAD.L, y)
      ctx.lineTo(W - PAD.R, y)
      ctx.stroke()
      ctx.setLineDash([])
    })

    const activePts = pts.filter(p => p.y !== null)

    // Area fill
    const grad = ctx.createLinearGradient(0, PAD.T, 0, PAD.T + chartH)
    grad.addColorStop(0, 'rgba(255,255,255,0.25)')
    grad.addColorStop(1, 'rgba(255,255,255,0)')
    ctx.beginPath()
    ctx.moveTo(activePts[0].x, PAD.T + chartH)
    activePts.forEach(p => ctx.lineTo(p.x, p.y))
    ctx.lineTo(activePts[activePts.length - 1].x, PAD.T + chartH)
    ctx.closePath()
    ctx.fillStyle = grad
    ctx.fill()

    // Line
    ctx.beginPath()
    ctx.strokeStyle = '#fff'
    ctx.lineWidth = 2.5
    ctx.lineJoin = 'round'
    ctx.lineCap = 'round'
    activePts.forEach((p, i) => i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y))
    ctx.stroke()

    // X labels + ticks
    ctx.textAlign = 'center'
    pts.forEach(p => {
      ctx.fillStyle = p.idx === highlightIdx ? '#fff' : 'rgba(255,255,255,0.45)'
      ctx.font = p.idx === highlightIdx ? '600 11px Inter, sans-serif' : '11px Inter, sans-serif'
      ctx.fillText(p.day, p.x, PAD.T + chartH + 20)
      ctx.strokeStyle = 'rgba(255,255,255,0.2)'
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.moveTo(p.x, PAD.T + chartH)
      ctx.lineTo(p.x, PAD.T + chartH + 5)
      ctx.stroke()
    })

    // Vertical dashed line on highlight
    if (highlightIdx !== null && pts[highlightIdx]?.y !== null) {
      const p = pts[highlightIdx]
      ctx.strokeStyle = 'rgba(255,255,255,0.3)'
      ctx.lineWidth = 1
      ctx.setLineDash([3, 3])
      ctx.beginPath()
      ctx.moveTo(p.x, p.y)
      ctx.lineTo(p.x, PAD.T + chartH)
      ctx.stroke()
      ctx.setLineDash([])
    }

    // Dots
    activePts.forEach(p => {
      const isHighlight = p.idx === highlightIdx
      if (isHighlight) {
        ctx.beginPath()
        ctx.arc(p.x, p.y, 10, 0, Math.PI * 2)
        ctx.fillStyle = 'rgba(255,255,255,0.15)'
        ctx.fill()
      }
      ctx.beginPath()
      ctx.arc(p.x, p.y, isHighlight ? 6 : 3.5, 0, Math.PI * 2)
      ctx.fillStyle = isHighlight ? '#fff' : 'rgba(255,255,255,0.6)'
      ctx.fill()
    })
  }

  useEffect(() => {
    setupCanvas()
    draw(todayIdx)

    const handleResize = () => {
      setupCanvas()
      draw(todayIdx)
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const handleInteraction = (clientX) => {
    const canvas = canvasRef.current
    const container = containerRef.current
    if (!canvas || !container) return

    const dpr = dprRef.current
    const rect = canvas.getBoundingClientRect()
    const xPct = (clientX - rect.left) / rect.width
    const W = canvas.width / dpr
    const H = canvas.height / dpr
    const x = xPct * W

    const pts = getPoints(W, H)
    const activePts = pts.filter(p => p.y !== null)

    let closest = null
    let minDist = Infinity
    activePts.forEach(p => {
      const dist = Math.abs(p.x - x)
      if (dist < minDist) { minDist = dist; closest = p }
    })

    if (closest && minDist < 60) {
      draw(closest.idx)
      const dotXPct = closest.x / W
      const containerRect = container.getBoundingClientRect()
      const dotLeft = (rect.left - containerRect.left) + dotXPct * rect.width
      setTooltip({ idx: closest.idx, score: closest.score, day: closest.day, x: dotLeft })
    }
  }

  const handleMouseMove = (e) => handleInteraction(e.clientX)
  const handleTouch = (e) => {
    e.preventDefault()
    handleInteraction(e.touches[0].clientX)
  }
  const handleLeave = () => {
    draw(todayIdx)
    setTooltip(null)
  }

  return (
    <div ref={containerRef} style={{ position: 'relative', width: '100%' }}>
      {tooltip && (
        <div style={{
          position: 'absolute',
          top: '-8px',
          left: `${tooltip.x}px`,
          transform: 'translateX(-50%)',
          background: 'rgba(255,255,255,0.95)',
          color: '#1a1a2e',
          borderRadius: '10px',
          padding: '6px 12px',
          fontSize: '13px',
          fontWeight: '600',
          fontFamily: 'Inter, sans-serif',
          pointerEvents: 'none',
          whiteSpace: 'nowrap',
          boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
          zIndex: 10,
        }}>
          {tooltip.day}: {tooltip.score}%
          <div style={{
            position: 'absolute', bottom: '-5px', left: '50%',
            transform: 'translateX(-50%)',
            width: 0, height: 0,
            borderLeft: '5px solid transparent',
            borderRight: '5px solid transparent',
            borderTop: '5px solid rgba(255,255,255,0.95)',
          }} />
        </div>
      )}
      <canvas
        ref={canvasRef}
        style={{ width: '100%', cursor: 'crosshair', display: 'block' }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleLeave}
        onTouchStart={handleTouch}
        onTouchMove={handleTouch}
        onTouchEnd={handleLeave}
      />
    </div>
  )
}