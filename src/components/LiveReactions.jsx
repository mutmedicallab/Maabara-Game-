// Purely visual: each reaction rises and fades over ~3s, then removes
// itself. Sits above everything (z-50) but never blocks clicks.
export default function LiveReactions({ reactions }) {
  return (
    <div className="fixed inset-0 z-50 pointer-events-none overflow-hidden" aria-hidden="true">
      {reactions.map((r) => (
        <span
          key={r.id}
          className="absolute text-4xl animate-reaction-float"
          style={{ left: `${r.left}%`, bottom: '4%' }}
        >
          {r.emoji}
        </span>
      ))}
    </div>
  )
}