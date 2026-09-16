export default function Leaderboard({ players, highlightPlayerId, title = 'Leaderboard' }) {
  const sorted = [...players].sort((a, b) => b.score - a.score)

  return (
    <div className="lab-panel">
      <div className="px-5 py-3 lab-rule flex items-baseline justify-between">
        <h2 className="font-display font-semibold text-lg">{title}</h2>
        <span className="font-mono text-xs text-ink/50">N={sorted.length}</span>
      </div>
      <ol>
        {sorted.map((p, i) => (
          <li
            key={p.id}
            className={`flex items-center justify-between px-5 py-3 lab-rule first:border-t-0 ${
              p.id === highlightPlayerId ? 'bg-violet/5' : ''
            }`}
          >
            <div className="flex items-center gap-4">
              <span className="font-mono text-sm text-ink/50 w-5 tabular">{i + 1}</span>
              <span className="font-medium">{p.nickname}</span>
            </div>
            <span className="font-mono tabular">{p.score}</span>
          </li>
        ))}
        {sorted.length === 0 && (
          <li className="px-5 py-6 text-ink/50 text-sm">No players yet.</li>
        )}
      </ol>
    </div>
  )
}
