const LETTERS = ['A', 'B', 'C', 'D', 'E', 'F']
const COLORS = ['bg-violet', 'bg-safranin', 'bg-culture', 'bg-amber']

function Shape({ index }) {
  // Kahoot-style shape-per-position, so options are recognizable at a glance
  // even before reading the text. Pure inline SVG, no image assets.
  const common = { width: 16, height: 16, fill: 'currentColor' }
  switch (index % 4) {
    case 0: // triangle
      return (
        <svg viewBox="0 0 16 16" {...common}>
          <polygon points="8,1 15,15 1,15" />
        </svg>
      )
    case 1: // diamond
      return (
        <svg viewBox="0 0 16 16" {...common}>
          <polygon points="8,1 15,8 8,15 1,8" />
        </svg>
      )
    case 2: // circle
      return (
        <svg viewBox="0 0 16 16" {...common}>
          <circle cx="8" cy="8" r="7" />
        </svg>
      )
    default: // square
      return (
        <svg viewBox="0 0 16 16" {...common}>
          <rect x="1.5" y="1.5" width="13" height="13" />
        </svg>
      )
  }
}

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
            <span className="flex items-center gap-2 bg-white/20 px-2 py-1">
              <Shape index={i} />
              <span className="font-mono font-semibold text-sm">{LETTERS[i]}</span>
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