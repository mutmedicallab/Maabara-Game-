import { useEffect, useState } from 'react'

// A real numeric countdown, purely decorative/local -- ticks down every
// second and calls onDone when it hits zero. Using key={n} on the number
// forces React to remount the span each tick, which cleanly re-triggers
// the pop animation without any extra JS.
export default function Countdown321({ seconds = 3, onDone }) {
  const [n, setN] = useState(seconds)

  useEffect(() => {
    setN(seconds)
    const id = setInterval(() => {
      setN((prev) => {
        if (prev <= 1) {
          clearInterval(id)
          onDone?.()
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seconds])

  return (
    <div className="lab-panel p-10 flex items-center justify-center min-h-[280px]">
      <span key={n} className="font-display font-bold text-8xl text-violet animate-countdown-pop">
        {n > 0 ? n : 'Go!'}
      </span>
    </div>
  )
}