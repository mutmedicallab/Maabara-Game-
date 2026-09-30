import { useCallback, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  listQuizzes,
  createGame,
  startGame,
  endQuestion,
  nextQuestion,
  getPlayers,
  getTeamLeaderboard,
  getAnswerCounts,
  getOpenEndedAnswers,
  getScaleStats,
  getScaleDistribution,
  getWordCloud,
  getOrderResults,
  getAnswerProgress,
  getRecentReactions,
  removePlayer
} from '../lib/game'
import { useGameState } from '../hooks/useGameState'
import { useInterval } from '../hooks/useInterval'
import { useQuestionPhases } from '../hooks/useQuestionPhases'
import CodeDisplay from '../components/CodeDisplay.jsx'
import Timer from '../components/Timer.jsx'
import OptionGrid from '../components/OptionGrid.jsx'
import Leaderboard from '../components/Leaderboard.jsx'
import TeamLeaderboard from '../components/TeamLeaderboard.jsx'
import PlayerListEditable from '../components/PlayerListEditable.jsx'
import WordCloud from '../components/WordCloud.jsx'
import QuestionIntro from '../components/QuestionIntro.jsx'
import Countdown321 from '../components/Countdown321.jsx'
import Podium from '../components/Podium.jsx'
import LiveReactions from '../components/LiveReactions.jsx'
import SceneArt from '../components/SceneArt.jsx'
import { ILLUSTRATIONS, PAGE_GRADIENTS } from '../lib/illustrations'

const STORAGE_KEY = 'synapse:host-session'
const CHOICE_TYPES = ['multiple_choice', 'true_false', 'poll']

export default function Host() {
  const [session, setSession] = useState(() => {
    const raw = sessionStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  })

  const [quizzes, setQuizzes] = useState([])
  const [quizError, setQuizError] = useState(null)
  const [creating, setCreating] = useState(false)
  const [actionError, setActionError] = useState(null)
  const [players, setPlayers] = useState([])
  const [teamBoard, setTeamBoard] = useState([])
  const [reactions, setReactions] = useState([])

  const [mcCounts, setMcCounts] = useState([])
  const [openAnswers, setOpenAnswers] = useState([])
  const [scaleStats, setScaleStats] = useState(null)
  const [scaleDist, setScaleDist] = useState([])
  const [words, setWords] = useState([])
  const [orderResults, setOrderResults] = useState([])
  const [progress, setProgress] = useState(null)

  const endedRef = useRef(false)
  const lastReactionAtRef = useRef(null)

  const { state, refresh } = useGameState(session?.code)
  const phase = useQuestionPhases(state?.question_id)

  useEffect(() => {
    if (!session) {
      listQuizzes().then(setQuizzes).catch((e) => setQuizError(e.message))
    }
  }, [session])

  useEffect(() => {
    if (session?.id) {
      lastReactionAtRef.current = new Date().toISOString()
    }
  }, [session?.id])

  const refreshPlayers = useCallback(() => {
    if (session?.id) {
      getPlayers(session.id).then(setPlayers).catch(() => {})
      getTeamLeaderboard(session.id).then(setTeamBoard).catch(() => {})
    }
  }, [session?.id])

  useEffect(() => {
    refreshPlayers()
  }, [refreshPlayers])

  useInterval(refreshPlayers, session?.id ? 1500 : null)

  const pollReactions = useCallback(() => {
    if (!session?.id || !lastReactionAtRef.current) return
    getRecentReactions(session.id, lastReactionAtRef.current)
      .then((rows) => {
        if (!rows?.length) return
        lastReactionAtRef.current = rows[rows.length - 1].created_at
        const withPositions = rows.map((r) => ({ ...r, left: 10 + Math.random() * 80 }))
        setReactions((prev) => [...prev, ...withPositions])
        withPositions.forEach((r) => {
          setTimeout(() => {
            setReactions((prev) => prev.filter((x) => x.id !== r.id))
          }, 3300)
        })
      })
      .catch(() => {})
  }, [session?.id])

  useInterval(pollReactions, session?.id ? 1000 : null)

  const refreshProgress = useCallback(() => {
    if (session?.id && state?.question_id && state?.status === 'question') {
      getAnswerProgress(session.id, state.question_id).then(setProgress).catch(() => {})
    }
  }, [session?.id, state?.question_id, state?.status])

  useInterval(refreshProgress, state?.status === 'question' ? 1200 : null)

  useEffect(() => {
    endedRef.current = false
    setProgress(null)
  }, [state?.current_question_index])

  useEffect(() => {
    if (state?.status !== 'question_end' || !session?.id || !state?.question_id) return
    if (CHOICE_TYPES.includes(state.question_type)) {
      getAnswerCounts(session.id, state.question_id).then(setMcCounts).catch(() => {})
    } else if (state.question_type === 'open_ended') {
      getOpenEndedAnswers(session.id, state.question_id).then(setOpenAnswers).catch(() => {})
    } else if (state.question_type === 'scale') {
      getScaleStats(session.id, state.question_id).then(setScaleStats).catch(() => {})
      getScaleDistribution(session.id, state.question_id).then(setScaleDist).catch(() => {})
    } else if (state.question_type === 'word_cloud') {
      getWordCloud(session.id, state.question_id).then(setWords).catch(() => {})
    } else if (state.question_type === 'order') {
      getOrderResults(session.id, state.question_id).then(setOrderResults).catch(() => {})
    }
  }, [state?.status, state?.question_id, state?.question_type, session?.id])

  async function handleCreateGame(quizId, scoringMode, teamMode) {
    setCreating(true)
    setActionError(null)
    try {
      const game = await createGame(quizId, scoringMode, teamMode)
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

  async function handleRemovePlayer(playerId, nickname) {
    if (!confirm(`Remove ${nickname} from the game?`)) return
    try {
      await removePlayer(session.id, playerId, session.host_token)
      refreshPlayers()
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
      setWords([])
      setOrderResults([])
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
    setTeamBoard([])
    setMcCounts([])
    setOpenAnswers([])
    setScaleStats(null)
    setScaleDist([])
    setWords([])
    setOrderResults([])
  }

    const bgKey = !session
    ? null
    : state?.status === 'question' || state?.status === 'question_end'
      ? 'question'
      : state?.status === 'finished'
        ? 'results'
        : 'lobby'

      return (
    <div
      data-theme={state?.theme || 'lab'}
      className={`min-h-screen relative overflow-hidden px-4 py-10 ${bgKey ? PAGE_GRADIENTS[bgKey] || 'bg-paper' : 'bg-ink'}`}
    >
      <SceneArt items={ILLUSTRATIONS[bgKey] || []} />
      <LiveReactions reactions={reactions} />
      <div className="max-w-3xl mx-auto relative z-10">
        <header className="flex items-center justify-between mb-8">
          <Link to="/" className="font-display font-bold text-2xl">
            Syn<span className="text-violet">apse</span>
          </Link>
          <span className="font-mono text-xs uppercase tracking-wide text-white/70">Host console</span>
        </header>

        {actionError && (
          <div className="mb-6 px-4 py-3 bg-safranin/10 border border-safranin/30 text-safranin text-sm">
            {actionError}
          </div>
        )}

        {!session && (
          <QuizPicker quizzes={quizzes} error={quizError} creating={creating} onPick={handleCreateGame} />
        )}

        {session && state?.status === 'lobby' && (
          <div className="flex flex-col gap-6">
                        <ModeBadges state={state} />
            <CodeDisplay code={session.code} />
            <PlayerListEditable players={players} onRemove={handleRemovePlayer} />
            <button
              onClick={handleStart}
              disabled={players.length === 0}
              className="bg-violet text-white font-display font-semibold text-lg px-6 py-4 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-violet-dim transition-colors"
            >
              {players.length === 0 ? 'Waiting for players to join…' : `Start game · ${players.length} joined`}
            </button>
          </div>
        )}

        {session && state?.status === 'question' && phase === 'announce' && (
          <div className="flex flex-col gap-6">
            <QuestionHeader state={state} />
            <QuestionIntro
              questionType={state.question_type}
              pointsMultiplier={state.points_multiplier}
              allowMultiple={state.allow_multiple}
              questionNumber={state.current_question_index + 1}
              totalQuestions={state.total_questions}
            />
          </div>
        )}

        {session && state?.status === 'question' && phase === 'countdown' && (
          <div className="flex flex-col gap-6">
            <QuestionHeader state={state} />
            <Countdown321 seconds={3} />
          </div>
        )}

        {session && state?.status === 'question' && phase === 'live' && (
          <div className="flex flex-col gap-6">
            <QuestionHeader state={state} />
            <div className="lab-panel p-6">
              <div className="flex items-center justify-between mb-2">
                <Timer startedAt={state.question_started_at} limitSeconds={state.time_limit} onExpire={handleTimerExpire} />
              </div>
              {progress && (
                <p className="font-mono text-xs text-ink/50 mb-4 text-right">
                  {progress.answered_count} / {progress.total_players} answered
                </p>
              )}
              <p className="font-display font-semibold text-2xl mb-5">{state.question_text}</p>
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

              {CHOICE_TYPES.includes(state.question_type) && (
                <OptionGrid
                  options={state.options}
                  correctIndexes={state.question_type === 'poll' ? undefined : (state.correct_answers || []).map(Number)}
                  counts={mcCounts}
                  disabled
                  onToggle={() => {}}
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

              {state.question_type === 'word_cloud' && <WordCloud words={words} />}

              {state.question_type === 'order' && (
                <div>
                  <p className="font-mono text-xs uppercase tracking-wide text-ink/50 mb-3">
                    Correct order: {state.options?.join(' → ')}
                  </p>
                  <ul className="flex flex-col gap-2">
                    {orderResults.map((r, i) => (
                      <li
                        key={i}
                        className={`px-4 py-2 flex justify-between gap-3 ${
                          r.is_correct ? 'bg-culture/10 text-culture' : 'bg-ink/5 text-ink/70'
                        }`}
                      >
                        <span className="font-medium shrink-0">{r.nickname}</span>
                        <span className="text-right text-sm">
                          {(r.submitted_order || []).map((idx) => state.options[idx]).join(' → ')}
                        </span>
                      </li>
                    ))}
                    {orderResults.length === 0 && <li className="text-ink/50 text-sm">No answers submitted.</li>}
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
                            <div className="h-full bg-culture" style={{ width: `${(Number(d.count) / max) * 100}%` }} />
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
            {state.team_mode ? (
              <TeamLeaderboard teams={teamBoard} title="Team standings" />
            ) : (
              <Leaderboard players={players} title="Standings" />
            )}
            <button
              onClick={handleNext}
              className="bg-violet text-white font-display font-semibold text-lg px-6 py-4 hover:bg-violet-dim transition-colors"
            >
              {state.current_question_index + 1 >= state.total_questions ? 'Show final results' : 'Next question'}
            </button>
          </div>
        )}

        {session && state?.status === 'finished' && (
          <div className="flex flex-col gap-6">
                        <div className="text-center py-4">
              <p className="font-mono text-xs uppercase tracking-wide text-white/70 mb-1">Final results</p>
              <h2 className="font-display font-bold text-3xl text-white">{state.quiz_title}</h2>
            </div>
            <Podium players={players} />
            {state.team_mode ? (
              <TeamLeaderboard teams={teamBoard} title="Final team standings" />
            ) : (
              <Leaderboard players={players} title="Final standings" />
            )}
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

function ModeBadges({ state }) {
  if (state.scoring_mode !== 'accuracy' && !state.team_mode) return null
  return (
    <div className="flex gap-2 justify-center flex-wrap">
            {state.scoring_mode === 'accuracy' && (
        <span className="font-mono text-xs uppercase tracking-wide bg-white/15 text-white border border-white/30 px-3 py-1">
          Accuracy Mode
        </span>
      )}
      {state.team_mode && (
        <span className="font-mono text-xs uppercase tracking-wide bg-white/15 text-white border border-white/30 px-3 py-1">
          Team Mode
        </span>
      )}
    </div>
  )
}

function renderLiveBody(state) {
  if (CHOICE_TYPES.includes(state.question_type)) {
    return <OptionGrid options={state.options} disabled onToggle={() => {}} />
  }
  if (state.question_type === 'open_ended') return <p className="text-ink/60">Players are typing their answers…</p>
  if (state.question_type === 'word_cloud') return <p className="text-ink/60">Players are submitting words…</p>
  if (state.question_type === 'order') return <p className="text-ink/60">Players are arranging the steps…</p>
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
      <p className="font-mono text-xs uppercase tracking-wide text-white/70">{state.quiz_title}</p>
      <p className="font-mono text-xs tabular text-white/70">
        Question {state.current_question_index + 1} / {state.total_questions}
      </p>
    </div>
  )
}

function QuizPicker({ quizzes, error, creating, onPick }) {
  const [scoringMode, setScoringMode] = useState('speed')
  const [teamMode, setTeamMode] = useState(false)

  return (
    <div>
      <h1 className="font-display font-semibold text-2xl mb-1">Pick a deck</h1>
            <p className="text-white/60 mb-6">You'll get a room code on the next screen.</p>

      <div className="lab-panel p-5 mb-6 flex flex-col gap-4">
        <div>
          <p className="font-mono text-xs uppercase tracking-wide text-ink/50 mb-2">Scoring</p>
          <div className="flex border border-ink/20 w-fit">
            <button
              type="button"
              onClick={() => setScoringMode('speed')}
              className={`px-4 py-2 text-sm font-medium ${scoringMode === 'speed' ? 'bg-violet text-white' : 'hover:bg-ink/5'}`}
            >
              Speed
            </button>
            <button
              type="button"
              onClick={() => setScoringMode('accuracy')}
              className={`px-4 py-2 text-sm font-medium ${scoringMode === 'accuracy' ? 'bg-violet text-white' : 'hover:bg-ink/5'}`}
            >
              Accuracy
            </button>
          </div>
          <p className="text-xs text-ink/40 mt-1">
            {scoringMode === 'speed'
              ? 'Faster correct answers earn more points.'
              : 'Every correct answer earns the same points, regardless of timing.'}
          </p>
        </div>

        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={teamMode} onChange={(e) => setTeamMode(e.target.checked)} />
          Team mode — players join under a team name and compete as groups
        </label>
      </div>

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
            onClick={() => onPick(q.id, scoringMode, teamMode)}
            className="lab-panel px-5 py-4 flex items-center justify-between text-left hover:bg-violet hover:text-white hover:border-violet transition-colors disabled:opacity-50"
          >
            <span className="font-display font-medium">{q.title}</span>
            <span className="font-mono text-xs tabular opacity-70">{q.question_count} Q</span>
          </button>
        ))}
          {quizzes.length === 0 && !error && <p className="text-white/50 text-sm">Loading decks…</p>}
      </div>
    </div>
  )
}