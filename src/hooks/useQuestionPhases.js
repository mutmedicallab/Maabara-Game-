import { useEffect, useState } from 'react'

// Sequences a question's opening moment through three phases:
//   'announce'  -- type card ("True or False", double points badge etc.)
//   'countdown' -- literal 3-2-1
//   'live'      -- the actual question/options are shown
// All purely local/cosmetic -- the real answer timer (question_started_at)
// keeps running the whole time underneath, same as before.
export function useQuestionPhases(questionId, { announceMs = 1500, countdownMs = 3000 } = {}) {
  const [phase, setPhase] = useState(questionId ? 'announce' : 'live')

  useEffect(() => {
    if (!questionId) return
    setPhase('announce')
    const t1 = setTimeout(() => setPhase('countdown'), announceMs)
    const t2 = setTimeout(() => setPhase('live'), announceMs + countdownMs)
    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
    }
  }, [questionId, announceMs, countdownMs])

  return phase
}