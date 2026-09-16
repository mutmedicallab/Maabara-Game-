export default function ScalePicker({ min = 1, max = 5, step = 1, selectedValue, disabled, onSelect }) {
  const values = []
  for (let v = min; v <= max; v += step) values.push(v)

  return (
    <div className="flex flex-wrap gap-3 justify-center">
      {values.map((v) => (
        <button
          key={v}
          type="button"
          disabled={disabled}
          onClick={() => onSelect?.(v)}
          className={`w-14 h-14 font-display font-semibold text-lg border transition-colors ${
            selectedValue === v
              ? 'bg-violet text-white border-violet'
              : 'bg-white text-ink border-ink/20 hover:border-violet'
          } ${disabled ? 'cursor-not-allowed opacity-70' : 'cursor-pointer'}`}
        >
          {v}
        </button>
      ))}
    </div>
  )
}