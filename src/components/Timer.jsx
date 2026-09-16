import { useEffect, useState } from 'react'

// Remaining time is always derived from the server-recorded question_started_at,
// never from a locally-started clock -- so a slow device or a late tab doesn't
// drift out of sync with everyone else in the room.
export default function Timer({ startedAt, limitSeconds, onExpire }) {
  const [remaining, setRemaining] = useState(limitSeconds)
  const [expired, setExpired] = useState(false)

  useEffect(() => {
    setExpired(false)
    if (!startedAt) {
      setRemaining(limitSeconds)
      return
    }
    const startMs = new Date(startedAt).getTime()

    const tick = () => {
      const elapsed = (Date.now() - startMs) / 1000
      const left = Math.max(0, limitSeconds - elapsed)
      setRemaining(left)
      if (left <= 0 && !expired) {
        setExpired(true)
        onExpire?.()
      }
    }

    tick()
    const id = setInterval(tick, 200)
    return () => clearInterval(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startedAt, limitSeconds])

  const pct = Math.max(0, Math.min(100, (remaining / limitSeconds) * 100))
  const low = remaining <= 5

  return (
    <div>
      <div className="flex items-baseline justify-between mb-2">
        <span className="font-mono text-sm uppercase tracking-wide text-ink/60">Time left</span>
        <span
          className={`font-mono text-2xl tabular ${low ? 'text-safranin' : 'text-ink'}`}
        >
          {Math.ceil(remaining)}s
        </span>
      </div>
      <div className="h-2 w-full bg-paper-dim overflow-hidden">
        <div
          className={`h-full ${low ? 'bg-safranin' : 'bg-violet'}`}
          style={{ width: `${pct}%`, transition: 'width 200ms linear' }}
        />
      </div>
    </div>
  )
}
