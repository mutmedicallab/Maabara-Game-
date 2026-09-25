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
    <div className="lab-panel p-10 flex flex-col items-center justify-center text-center gap-5 min-h-[280px] overflow-hidden">
      <p className="font-mono text-xs uppercase tracking-wide text-ink/50">
        Question {questionNumber} / {totalQuestions}
      </p>
      <p className="font-display font-bold text-4xl sm:text-5xl text-violet animate-intro-pop">{meta.label}</p>
      {allowMultiple && (
        <p className="font-mono text-xs uppercase tracking-wide text-ink/50">Select all that apply</p>
      )}
      {pointsMultiplier === 2 && (
        <div className="relative flex items-center justify-center py-2">
          <span className="absolute w-28 h-28 rounded-full bg-amber/50 animate-bomb-burst" />
          <span
            className="absolute w-28 h-28 rounded-full bg-safranin/40 animate-bomb-burst"
            style={{ animationDelay: '0.25s' }}
          />
          <span
            className="absolute w-28 h-28 rounded-full bg-amber/30 animate-bomb-burst"
            style={{ animationDelay: '0.5s' }}
          />
          <span className="relative font-display font-bold text-lg bg-amber text-white px-5 py-2 shadow-lg animate-bomb-shake">
            💣 Double Points!
          </span>
        </div>
      )}
    </div>
  )
}