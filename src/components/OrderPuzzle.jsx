import { useEffect, useState } from 'react'

function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

// items = the option texts, already in the CORRECT order as authored.
// This component shuffles them for display and lets the player rebuild
// the sequence by tapping, submitting an array of original indexes.
export default function OrderPuzzle({ questionId, items, disabled, onSubmit }) {
  const [pool, setPool] = useState([])
  const [sequence, setSequence] = useState([])

  useEffect(() => {
    setPool(shuffle(items.map((text, originalIndex) => ({ originalIndex, text }))))
    setSequence([])
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [questionId])

  function pick(item) {
    if (disabled) return
    setPool((p) => p.filter((x) => x.originalIndex !== item.originalIndex))
    setSequence((s) => [...s, item])
  }

  function undo() {
    if (disabled || sequence.length === 0) return
    const last = sequence[sequence.length - 1]
    setSequence((s) => s.slice(0, -1))
    setPool((p) => [...p, last])
  }

  function handleSubmit() {
    if (disabled || sequence.length !== items.length) return
    onSubmit(sequence.map((x) => x.originalIndex))
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <p className="font-mono text-xs uppercase tracking-wide text-ink/50 mb-2">Your order</p>
        <ol className="flex flex-col gap-2">
          {sequence.map((item, i) => (
            <li key={item.originalIndex} className="lab-panel px-4 py-3 flex items-center gap-3">
              <span className="font-mono text-sm text-ink/50 w-5">{i + 1}</span>
              <span className="flex-1">{item.text}</span>
            </li>
          ))}
          {sequence.length === 0 && <li className="text-ink/40 text-sm">Tap items below in order.</li>}
        </ol>
      </div>

      {pool.length > 0 && (
        <div>
          <p className="font-mono text-xs uppercase tracking-wide text-ink/50 mb-2">Remaining</p>
          <div className="flex flex-col gap-2">
            {pool.map((item) => (
              <button
                key={item.originalIndex}
                type="button"
                disabled={disabled}
                onClick={() => pick(item)}
                className="text-left px-4 py-3 bg-white border border-ink/20 hover:border-violet transition-colors disabled:opacity-50"
              >
                {item.text}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="flex gap-3">
        <button
          type="button"
          onClick={undo}
          disabled={disabled || sequence.length === 0}
          className="lab-panel px-4 py-2 font-mono text-xs uppercase disabled:opacity-40"
        >
          Undo
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={disabled || sequence.length !== items.length}
          className="flex-1 bg-violet text-white font-display font-semibold px-6 py-3 disabled:opacity-40 hover:bg-violet-dim transition-colors"
        >
          Submit order
        </button>
      </div>
    </div>
  )
}