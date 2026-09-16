import { useState } from 'react'

export default function TextAnswerInput({ disabled, onSubmit }) {
  const [value, setValue] = useState('')

  function handleSubmit(e) {
    e.preventDefault()
    if (!value.trim() || disabled) return
    onSubmit?.(value.trim())
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        disabled={disabled}
        placeholder="Type your answer…"
        maxLength={120}
        autoFocus
        className="w-full px-4 py-4 border border-ink/20 focus:border-violet focus:outline-none text-lg disabled:opacity-60"
      />
      <button
        type="submit"
        disabled={disabled || !value.trim()}
        className="bg-violet text-white font-display font-semibold text-lg px-6 py-4 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-violet-dim transition-colors"
      >
        Submit answer
      </button>
    </form>
  )
}