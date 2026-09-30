export default function PlayerListEditable({ players, onRemove, title = 'Players in the room' }) {
  const sorted = [...players].sort((a, b) => a.nickname.localeCompare(b.nickname))

  return (
    <div className="lab-panel">
      <div className="px-5 py-3 lab-rule flex items-baseline justify-between">
        <h2 className="font-display font-semibold text-lg">{title}</h2>
        <span className="font-mono text-xs text-ink/50">N={sorted.length}</span>
      </div>
      <ol>
        {sorted.map((p) => (
          <li key={p.id} className="flex items-center justify-between px-5 py-3 lab-rule first:border-t-0">
            <span className="font-medium">{p.nickname}</span>
            <button
              type="button"
              onClick={() => onRemove(p.id, p.nickname)}
              className="font-mono text-xs uppercase text-safranin hover:underline px-2 py-1"
              title={`Remove ${p.nickname}`}
            >
              Remove
            </button>
          </li>
        ))}
        {sorted.length === 0 && <li className="px-5 py-6 text-ink/50 text-sm">No players yet.</li>}
      </ol>
    </div>
  )
}