import { useEffect, useState } from 'react'

// Shows a brief "announcement" window whenever questionId changes. Purely
// cosmetic/local -- the answer timer (driven by question_started_at on the
// server) keeps running underneath, same as everyone seeing a couple of
// seconds of intro before they start answering.
export function useQuestionIntro(questionId, durationMs = 2200) {
  const [visible, setVisible] = useState(Boolean(questionId))

  useEffect(() => {
    if (!questionId) return
    setVisible(true)
    const id = setTimeout(() => setVisible(false), durationMs)
    return () => clearTimeout(id)
  }, [questionId, durationMs])

  return visible
}