const LETTERS = ['A', 'B', 'C', 'D', 'E', 'F']
const COLORS = ['bg-violet', 'bg-safranin', 'bg-culture', 'bg-amber']

// selectedIndexes / correctIndexes are arrays so this works for both
// single-select (array of 0-1 items) and multi-select questions.
// onToggle(index) fires on every click; the caller decides whether that
// means "submit immediately" (single-select) or "update a pending
// selection" (multi-select, submitted via a separate button).
export default function OptionGrid({
  options,
  selectedIndexes = [],
  correctIndexes,
  counts,
  disabled,
  onToggle,
}) {
  const revealed = Array.isArray(correctIndexes)

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {options.map((opt, i) => {
        const isCorrect = revealed && correctIndexes.includes(i)
        const isSelected = selectedIndexes.includes(i)
        const rawCount = counts?.find((c) => c.option_index === i)?.count
        const count = rawCount === undefined || rawCount === null ? null : Number(rawCount)

        let stateClasses = `${COLORS[i % COLORS.length]} text-white`
        if (revealed && !isCorrect) stateClasses = 'bg-ink/10 text-ink/50'
        if (revealed && isCorrect) stateClasses = 'bg-culture text-white ring-4 ring-culture/30'

        return (
          <button
            key={i}
            type="button"
            disabled={disabled}
            onClick={() => onToggle?.(i)}
            className={`text-left px-5 py-4 flex items-center gap-4 transition-colors ${stateClasses} ${
              disabled ? '' : 'cursor-pointer hover:brightness-110'
            } ${isSelected && !revealed ? 'ring-4 ring-ink/40' : ''}`}
          >
            <span className="font-mono font-semibold text-sm bg-white/20 rounded-none px-2 py-1">
              {LETTERS[i]}
            </span>
            <span className="font-medium flex-1">{opt}</span>
            {count !== null && <span className="font-mono text-sm tabular opacity-80">{count}</span>}
            {isSelected && !revealed && <span className="text-xs font-mono">selected</span>}
          </button>
        )
      })}
    </div>
  )
}