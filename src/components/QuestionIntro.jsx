const TYPE_META = {
  multiple_choice: { label: 'Multiple Choice' },
  true_false: { label: 'True or False' },
  open_ended: { label: 'Type an Answer' },
  scale: { label: 'Scale' },
  poll: { label: 'Poll' },
  word_cloud: { label: 'Word Cloud' },
  order: { label: 'Puzzle' },
}

export default function QuestionIntro({ questionType, pointsMultiplier, questionNumber, totalQuestions, allowMultiple }) {
  const meta = TYPE_META[questionType] || { label: 'Question' }

  return (
    <div className="lab-panel p-10 flex flex-col items-center justify-center text-center gap-4 min-h-[280px]">
      <p className="font-mono text-xs uppercase tracking-wide text-ink/50">
        Question {questionNumber} / {totalQuestions}
      </p>
      <p className="font-display font-bold text-4xl sm:text-5xl text-violet animate-intro-pop">{meta.label}</p>
      {allowMultiple && (
        <p className="font-mono text-xs uppercase tracking-wide text-ink/50">Select all that apply</p>
      )}
      {pointsMultiplier === 2 && (
        <span className="font-display font-bold text-lg bg-amber text-white px-4 py-1 animate-intro-pop" style={{ animationDelay: '150ms' }}>
          Double Points!
        </span>
      )}
    </div>
  )
}