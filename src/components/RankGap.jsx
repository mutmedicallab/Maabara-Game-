export default function RankGap({ players, playerId }) {
  const sorted = [...players].sort((a, b) => b.score - a.score)
  const rank = sorted.findIndex((p) => p.id === playerId)
  if (rank === -1 || sorted.length === 0) return null

  const me = sorted[rank]

  if (rank === 0) {
    const second = sorted[1]
    if (!second) {
      return <p className="text-center font-mono text-sm text-culture">You're in the lead!</p>
    }
    const lead = me.score - second.score
    return (
      <p className="text-center font-mono text-sm text-culture">
        {lead === 0 ? `Tied for the lead with ${second.nickname}` : `In the lead · ${lead} pts clear of ${second.nickname}`}
      </p>
    )
  }

  const ahead = sorted[rank - 1]
  const gap = ahead.score - me.score

  return (
    <p className="text-center font-mono text-sm text-ink/60">
      {gap === 0 ? `Tied with ${ahead.nickname} for #${rank}` : `#${rank + 1} · ${gap} pts behind ${ahead.nickname}`}
    </p>
  )
}