export default function TeamLeaderboard({ teams, highlightTeamName, title = 'Team standings' }) {
  const sorted = [...teams].sort((a, b) => b.total_score - a.total_score)

  return (
    <div className="lab-panel">
      <div className="px-5 py-3 lab-rule flex items-baseline justify-between">
        <h2 className="font-display font-semibold text-lg">{title}</h2>
        <span className="font-mono text-xs text-ink/50">{sorted.length} teams</span>
      </div>
      <ol>
        {sorted.map((t, i) => (
          <li
            key={t.team_name}
            className={`flex items-center justify-between px-5 py-3 lab-rule first:border-t-0 ${
              t.team_name === highlightTeamName ? 'bg-violet/5' : ''
            }`}
          >
            <div className="flex items-center gap-4">
              <span className="font-mono text-sm text-ink/50 w-5 tabular">{i + 1}</span>
              <div>
                <span className="font-medium block">{t.team_name}</span>
                <span className="font-mono text-xs text-ink/40">
                  {t.member_count} player{Number(t.member_count) === 1 ? '' : 's'}
                </span>
              </div>
            </div>
            <span className="font-mono tabular">{t.total_score}</span>
          </li>
        ))}
        {sorted.length === 0 && <li className="px-5 py-6 text-ink/50 text-sm">No teams yet.</li>}
      </ol>
    </div>
  )
}