import { useCallback, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  listQuizzes,
  createGame,
  startGame,
  endQuestion,
  nextQuestion,
  getPlayers,
  getAnswerCounts,
  getOpenEndedAnswers,
  getScaleStats,
  getScaleDistribution,
} from '../lib/game'
import { useGameState } from '../hooks/useGameState'
import { useInterval } from '../hooks/useInterval'
import CodeDisplay from '../components/CodeDisplay.jsx'
import Timer from '../components/Timer.jsx'
import OptionGrid from '../components/OptionGrid.jsx'
import Leaderboard from '../components/Leaderboard.jsx'

const STORAGE_KEY = 'titer-up:host-session'

export default function Host() {
  const [session, setSession] = useState(() => {
    const raw = sessionStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : null // { id, code, host_token }
  })

  const [quizzes, setQuizzes] = useState([])
  const [quizError, setQuizError] = useState(null)
  const [creating, setCreating] = useState(false)
  const [actionError, setActionError] = useState(null)
  const [players, setPlayers] = useState([])

  const [mcCounts, setMcCounts] = useState([])
  const [openAnswers, setOpenAnswers] = useState([])
  const [scaleStats, setScaleStats] = useState(null)
  const [scaleDist, setScaleDist] = useState([])

  const endedRef = useRef(false) // guards against double-firing end_question on timer expiry

  const { state, refresh } = useGameState(session?.code)

  useEffect(() => {
    if (!session) {
      listQuizzes().then(setQuizzes).catch((e) => setQuizError(e.message))
    }
  }, [session])

  const refreshPlayers = useCallback(() => {
    if (session?.id) getPlayers(session.id).then(setPlayers).catch(() => {})
  }, [session?.id])

  useEffect(() => {
    refreshPlayers()
  }, [refreshPlayers])

  useInterval(refreshPlayers, session?.id ? 1500 : null)

  useEffect(() => {
    endedRef.current = false
  }, [state?.current_question_index])

  useEffect(() => {
    if (state?.status !== 'question_end' || !session?.id || !state?.question_id) return
    if (state.question_type === 'multiple_choice' || state.question_type === 'true_false') {
      getAnswerCounts(session.id, state.question_id).then(setMcCounts).catch(() => {})
    } else if (state.question_type === 'open_ended') {
      getOpenEndedAnswers(session.id, state.question_id).then(setOpenAnswers).catch(() => {})
    } else if (state.question_type === 'scale') {
      getScaleStats(session.id, state.question_id).then(setScaleStats).catch(() => {})
      getScaleDistribution(session.id, state.question_id).then(setScaleDist).catch(() => {})
    }
  }, [state?.status, state?.question_id, state?.question_type, session?.id])

  async function handleCreateGame(quizId) {
    setCreating(true)
    setActionError(null)
    try {
      const game = await createGame(quizId)
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(game))
      setSession(game)
    } catch (e) {
      setActionError(e.message)
    } finally {
      setCreating(false)
    }
  }

  async function handleStart() {
    try {
      await startGame(session.id, session.host_token)
      refresh()
    } catch (e) {
      setActionError(e.message)
    }
  }

  const handleTimerExpire = useCallback(() => {
    if (endedRef.current || !session) return
    endedRef.current = true
    endQuestion(session.id, session.host_token).then(refresh).catch(() => {})
  }, [session, refresh])

  async function handleEndNow() {
    if (endedRef.current) return
    endedRef.current = true
    try {
      await endQuestion(session.id, session.host_token)
      refresh()
    } catch (e) {
      setActionError(e.message)
    }
  }

  async function handleNext() {
    try {
      setMcCounts([])
      setOpenAnswers([])
      setScaleStats(null)
      setScaleDist([])
      await nextQuestion(session.id, session.host_token)
      refresh()
      refreshPlayers()
    } catch (e) {
      setActionError(e.message)
    }
  }

  function handleNewGame() {
    sessionStorage.removeItem(STORAGE_KEY)
    setSession(null)
    setPlayers([])
    setMcCounts([])
    setOpenAnswers([])
    setScaleStats(null)
    setScaleDist([])
  }

  return (
    <div className="min-h-screen px-4 py-10">
      <div className="max-w-3xl mx-auto">
        <header className="flex items-center justify-between mb-8">
          <Link to="/" className="font-display font-bold text-2xl">
            Titer<span className="text-violet"> Up</span>
          </Link>
          <span className="font-mono text-xs uppercase tracking-wide text-ink/50">Host console</span>
        </header>

        {actionError && (
          <div className="mb-6 px-4 py-3 bg-safranin/10 border border-safranin/30 text-safranin text-sm">
            {actionError}
          </div>
        )}

        {!session && (
          <QuizPicker
            quizzes={quizzes}
            error={quizError}
            creating={creating}
            onPick={handleCreateGame}
          />
        )}

        {session && state?.status === 'lobby' && (
          <div className="flex flex-col gap-6">
            <CodeDisplay code={session.code} />
            <Leaderboard players={players} title="Players in the room" />
            <button
              onClick={handleStart}
              disabled={players.length === 0}
              className="bg-violet text-white font-display font-semibold text-lg px-6 py-4 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-violet-dim transition-colors"
            >
              {players.length === 0 ? 'Waiting for players to join…' : `Start game · ${players.length} joined`}
            </button>
          </div>
        )}

        {session && state?.status === 'question' && (
          <div className="flex flex-col gap-6">
            <QuestionHeader state={state} />
            <div className="lab-panel p-6">
              <Timer
                startedAt={state.question_started_at}
                limitSeconds={state.time_limit}
                onExpire={handleTimerExpire}
              />
              <p className="font-display font-semibold text-2xl mt-6 mb-5">{state.question_text}</p>
              {renderLiveBody(state)}
            </div>
            <button
              onClick={handleEndNow}
              className="lab-panel px-6 py-3 font-mono text-sm uppercase tracking-wide hover:bg-ink hover:text-paper transition-colors"
            >
              End question now
            </button>
          </div>
        )}

        {session && state?.status === 'question_end' && (
          <div className="flex flex-col gap-6">
            <QuestionHeader state={state} />
            <div className="lab-panel p-6">
              <p className="font-display font-semibold text-2xl mb-5">{state.question_text}</p>

              {(state.question_type === 'multiple_choice' || state.question_type === 'true_false') && (
                <OptionGrid
                  options={state.options}
                  correctIndex={state.correct_index}
                  counts={mcCounts}
                  disabled
                  onSelect={() => {}}
                />
              )}

              {state.question_type === 'open_ended' && (
                <div>
                  <p className="font-mono text-xs uppercase tracking-wide text-ink/50 mb-3">
                    Accepted: {(state.correct_answers || []).join(', ') || '—'}
                  </p>
                  <ul className="flex flex-col gap-2">
                    {openAnswers.map((a, i) => (
                      <li
                        key={i}
                        className={`px-4 py-2 flex justify-between ${
                          a.is_correct ? 'bg-culture/10 text-culture' : 'bg-ink/5 text-ink/70'
                        }`}
                      >
                        <span className="font-medium">{a.nickname}</span>
                        <span>{a.text_answer}</span>
                      </li>
                    ))}
                    {openAnswers.length === 0 && <li className="text-ink/50 text-sm">No answers submitted.</li>}
                  </ul>
                </div>
              )}

              {state.question_type === 'scale' && (
                <div>
                  <p className="font-mono text-xs uppercase tracking-wide text-ink/50 mb-3">
                    Average: {scaleStats?.average ? Number(scaleStats.average).toFixed(1) : '—'} ·{' '}
                    {scaleStats?.responses ?? 0} responses
                  </p>
                  <div className="flex flex-col gap-2">
                    {scaleDist.map((d) => {
                      const max = Math.max(1, ...scaleDist.map((x) => Number(x.count)))
                      return (
                        <div key={d.value} className="flex items-center gap-3">
                          <span className="font-mono text-sm w-8 tabular">{d.value}</span>
                          <div className="flex-1 h-4 bg-paper-dim">
                            <div
                              className="h-full bg-culture"
                              style={{ width: `${(Number(d.count) / max) * 100}%` }}
                            />
                          </div>
                          <span className="font-mono text-xs tabular text-ink/50">{d.count}</span>
                        </div>
                      )
                    })}
                    {scaleDist.length === 0 && <p className="text-ink/50 text-sm">No responses submitted.</p>}
                  </div>
                </div>
              )}
            </div>
            <Leaderboard players={players} title="Standings" />
            <button
              onClick={handleNext}
              className="bg-violet text-white font-display font-semibold text-lg px-6 py-4 hover:bg-violet-dim transition-colors"
            >
              {state.current_question_index + 1 >= state.total_questions
                ? 'Show final results'
                : 'Next question'}
            </button>
          </div>
        )}

        {session && state?.status === 'finished' && (
          <div className="flex flex-col gap-6">
            <div className="text-center py-4">
              <p className="font-mono text-xs uppercase tracking-wide text-ink/50 mb-1">Final results</p>
              <h2 className="font-display font-bold text-3xl">{state.quiz_title}</h2>
            </div>
            <Leaderboard players={players} title="Final standings" />
            <button
              onClick={handleNewGame}
              className="lab-panel px-6 py-4 font-display font-semibold hover:bg-ink hover:text-paper transition-colors"
            >
              Start a new game
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

function renderLiveBody(state) {
  if (state.question_type === 'multiple_choice' || state.question_type === 'true_false') {
    return <OptionGrid options={state.options} disabled onSelect={() => {}} />
  }
  if (state.question_type === 'open_ended') {
    return <p className="text-ink/60">Players are typing their answers…</p>
  }
  if (state.question_type === 'scale') {
    return (
      <p className="text-ink/60">
        Players are choosing a value from {state.scale_min} to {state.scale_max}…
      </p>
    )
  }
  return null
}

function QuestionHeader({ state }) {
  return (
    <div className="flex items-baseline justify-between">
      <p className="font-mono text-xs uppercase tracking-wide text-ink/50">{state.quiz_title}</p>
      <p className="font-mono text-xs tabular text-ink/50">
        Question {state.current_question_index + 1} / {state.total_questions}
      </p>
    </div>
  )
}

function QuizPicker({ quizzes, error, creating, onPick }) {
  return (
    <div>
      <h1 className="font-display font-semibold text-2xl mb-1">Pick a deck</h1>
      <p className="text-ink/60 mb-6">You'll get a room code on the next screen.</p>

      {error && (
        <p className="text-safranin text-sm mb-4">
          Couldn't load quizzes: {error}. Check your .env values and that schema.sql has been run.
        </p>
      )}

      <div className="flex flex-col gap-3">
        {quizzes.map((q) => (
          <button
            key={q.id}
            disabled={creating}
            onClick={() => onPick(q.id)}
            className="lab-panel px-5 py-4 flex items-center justify-between text-left hover:bg-violet hover:text-white hover:border-violet transition-colors disabled:opacity-50"
          >
            <span className="font-display font-medium">{q.title}</span>
            <span className="font-mono text-xs tabular opacity-70">{q.question_count} Q</span>
          </button>
        ))}
        {quizzes.length === 0 && !error && (
          <p className="text-ink/50 text-sm">Loading decks…</p>
        )}
      </div>
    </div>
  )
}