export default function WordCloud({ words }) {
  if (!words || words.length === 0) {
    return <p className="text-ink/50 text-sm">No responses yet.</p>
  }
  const max = Math.max(...words.map((w) => Number(w.count)))
  const min = Math.min(...words.map((w) => Number(w.count)))

  function sizeFor(count) {
    if (max === min) return 20
    const t = (Number(count) - min) / (max - min)
    return Math.round(14 + t * 26) // 14px .. 40px
  }

  const colors = ['text-violet', 'text-safranin', 'text-culture', 'text-amber', 'text-ink']

  return (
    <div className="flex flex-wrap gap-x-4 gap-y-2 items-baseline justify-center py-4">
      {words.map((w, i) => (
        <span
          key={w.word}
          className={`font-display font-semibold ${colors[i % colors.length]}`}
          style={{ fontSize: `${sizeFor(w.count)}px` }}
          title={`${w.count} response${w.count === 1 ? '' : 's'}`}
        >
          {w.word}
        </span>
      ))}
    </div>
  )
}