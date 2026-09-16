import { useEffect, useState } from 'react'

const COLORS = ['#006437', '#00a859', '#ffffff', '#c8102e', '#e8f5ee', '#ffd700']

/**
 * Explosão breve de confete (vitória FT verificada).
 * Mount → anima → some.
 */
export default function ConfettiBurst({ active = false, onDone }) {
  const [pieces, setPieces] = useState([])

  useEffect(() => {
    if (!active) {
      setPieces([])
      return undefined
    }
    const next = Array.from({ length: 42 }, (_, i) => ({
      id: i,
      left: 8 + Math.random() * 84,
      delay: Math.random() * 0.35,
      duration: 1.4 + Math.random() * 1.1,
      color: COLORS[i % COLORS.length],
      rot: Math.random() * 360,
      size: 6 + Math.random() * 8,
      drift: (Math.random() - 0.5) * 80,
    }))
    setPieces(next)
    const t = setTimeout(() => {
      setPieces([])
      onDone?.()
    }, 2800)
    return () => clearTimeout(t)
  }, [active, onDone])

  if (!pieces.length) return null

  return (
    <div className="confetti-layer" aria-hidden="true">
      {pieces.map((p) => (
        <span
          key={p.id}
          className="confetti-piece"
          style={{
            left: `${p.left}%`,
            background: p.color,
            width: p.size,
            height: p.size * 1.4,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
            '--confetti-rot': `${p.rot}deg`,
            '--confetti-drift': `${p.drift}px`,
          }}
        />
      ))}
    </div>
  )
}
