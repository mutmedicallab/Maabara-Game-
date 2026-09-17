const PLACE_STYLE = [
  { order: 'order-2', height: 'h-40', color: 'bg-amber', label: '1st' },
  { order: 'order-1', height: 'h-28', color: 'bg-ink/30', label: '2nd' },
  { order: 'order-3', height: 'h-20', color: 'bg-safranin', label: '3rd' },
]

export default function Podium({ players, highlightPlayerId }) {
  const top3 = [...players].sort((a, b) => b.score - a.score).slice(0, 3)
  if (top3.length === 0) return null

  return (
    <div className="flex items-end justify-center gap-3 py-6">
      {top3.map((p, i) => {
        const style = PLACE_STYLE[i]
        return (
          <div key={p.id} className={`flex flex-col items-center gap-2 flex-1 max-w-[140px] ${style.order}`}>
            <p className={`font-display font-semibold text-center truncate w-full ${p.id === highlightPlayerId ? 'text-violet' : 'text-ink'}`}>
              {p.nickname}
            </p>
            <p className="font-mono text-xs tabular text-ink/50">{p.score} pts</p>
            <div className={`w-full ${style.height} ${style.color} flex items-start justify-center pt-2`}>
              <span className="font-display font-bold text-white text-lg">{style.label}</span>
            </div>
          </div>
        )
      })}
    </div>
  )
}