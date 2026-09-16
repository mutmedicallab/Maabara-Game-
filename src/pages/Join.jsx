import { useCallback, useEffect, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { joinGame, submitAnswer, getPlayers } from '../lib/game'
import { useGameState } from '../hooks/useGameState'
import { useInterval } from '../hooks/useInterval'
import Timer from '../components/Timer.jsx'
import OptionGrid from '../components/OptionGrid.jsx'
import Leaderboard from '../components/Leaderboard.jsx'

const STORAGE_KEY = 'titer-up:player-session'

export default function Join() {
  const [params] = useSearchParams()
  const [session, setSession] = useState(() => {
    const raw = sessionStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : null // { player_id, game_id, code, nickname }
  })
  const [players, setPlayers] = useState([])
  const [answered, setAnswered] = useState({}) // question_id -> { selectedIndex, result }
  const answeringRef = useRef(false)

  const { state, refresh } = useGameState(session?.code)

  const refreshPlayers = useCallback(() => {
    if (session?.game_id) getPlayers(session.game_id).then(setPlayers).catch(() => {})
  }, [session?.game_id])

  useEffect(() => {
    refreshPlayers()
  }, [refreshPlayers])

  useInterval(refreshPlayers, session?.game_id ? 1500 : null)

  async function handleAnswer(questionId, index) {
    if (answeringRef.current || answered[questionId]) return
    answeringRef.current = true
    try {
      const result = await submitAnswer(session.game_id, session.player_id, questionId, index)
      setAnswered((prev) => ({ ...prev, [questionId]: { selectedIndex: index, result } }))
      refreshPlayers()
    } catch (e) {
      // If it failed, allow another attempt
      console.error(e)
    } finally {
      answeringRef.current = false
    }
  }

  function handleLeave() {
    sessionStorage.removeItem(STORAGE_KEY)
    setSession(null)
    setAnswered({})
  }

  if (!session) {
    return <JoinForm defaultCode={params.get('code') || ''} onJoined={setSession} />
  }

  const currentAnswer = state?.question_id ? answered[state.question_id] : null
  const me = players.find((p) => p.id === session.player_id)

  return (
    <div className="min-h-screen px-4 py-10">
      <div className="max-w-lg mx-auto">
        <header className="flex items-center justify-between mb-8">
          <Link to="/" className="font-display font-bold text-2xl">
            Titer<span className="text-violet"> Up</span>
          </Link>
          <span className="font-mono text-xs text-ink/50">{session.nickname}</span>
        </header>

        {!state && <p className="text-ink/50 text-sm">Connecting…</p>}

        {state?.status === 'lobby' && (
          <div className="lab-panel p-6 text-center">
            <p className="font-display font-semibold text-xl mb-2">You're in, {session.nickname}</p>
            <p className="text-ink/60">Waiting for the host to start the quiz…</p>
          </div>
        )}

        {state?.status === 'question' && !currentAnswer && state.question_id && (
          <div className="flex flex-col gap-6">
            <Timer startedAt={state.question_started_at} limitSeconds={state.time_limit} />
            <p className="font-display font-semibold text-xl">{state.question_text}</p>
            <OptionGrid options={state.options} onSelect={(i) => handleAnswer(state.question_id, i)} />
          </div>
        )}

        {state?.status === 'question' && currentAnswer && (
          <div className="lab-panel p-8 text-center">
            <p className="font-display font-semibold text-xl mb-2">Answer locked in</p>
            <p className="text-ink/60">Waiting for the timer to run out…</p>
          </div>
        )}

        {state?.status === 'question_end' && (
          <div className="flex flex-col gap-6">
            <p className="font-display font-semibold text-xl">{state.question_text}</p>
            <OptionGrid
              options={state.options}
              correctIndex={state.correct_index}
              selectedIndex={currentAnswer?.selectedIndex}
              disabled
              onSelect={() => {}}
            />
            <ResultBanner answer={currentAnswer} />
            <p className="text-center font-mono text-sm text-ink/50">
              Score so far: <span className="text-ink tabular">{me?.score ?? 0}</span>
            </p>
          </div>
        )}

        {state?.status === 'finished' && (
          <div className="flex flex-col gap-6">
            <div className="text-center py-4">
              <p className="font-mono text-xs uppercase tracking-wide text-ink/50 mb-1">Final results</p>
              <h2 className="font-display font-bold text-3xl">{state.quiz_title}</h2>
            </div>
            <Leaderboard players={players} highlightPlayerId={session.player_id} title="Final standings" />
            <button
              onClick={handleLeave}
              className="lab-panel px-6 py-4 font-display font-semibold hover:bg-ink hover:text-paper transition-colors"
            >
              Leave game
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

function ResultBanner({ answer }) {
  if (!answer) {
    return (
      <div className="px-5 py-4 bg-ink/5 text-ink/60 text-center font-medium">
        No answer submitted in time
      </div>
    )
  }
  const { result } = answer
  if (result?.is_correct) {
    return (
      <div className="px-5 py-4 bg-culture/10 border border-culture/30 text-culture text-center font-semibold">
        Correct · +{result.points_awarded} points
      </div>
    )
  }
  return (
    <div className="px-5 py-4 bg-safranin/10 border border-safranin/30 text-safranin text-center font-semibold">
      Not quite · +0 points
    </div>
  )
}

function JoinForm({ defaultCode, onJoined }) {
  const [code, setCode] = useState(defaultCode)
  const [nickname, setNickname] = useState('')
  const [error, setError] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      const result = await joinGame(code, nickname)
      const session = {
        player_id: result.player_id,
        game_id: result.game_id,
        code: code.trim().toUpperCase(),
        nickname: nickname.trim(),
      }
      sessionStorage.setItem('titer-up:player-session', JSON.stringify(session))
      onJoined(session)
    } catch (e2) {
      setError(friendlyError(e2.message))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <Link to="/" className="font-display font-bold text-2xl block text-center mb-8">
          Titer<span className="text-violet"> Up</span>
        </Link>

        <form onSubmit={handleSubmit} className="lab-panel p-6 flex flex-col gap-4">
          <div>
            <label className="font-mono text-xs uppercase tracking-wide text-ink/50 block mb-1">
              Room code
            </label>
            <input
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              maxLength={6}
              required
              placeholder="ABCXYZ"
              className="w-full font-mono text-2xl tracking-widest text-center px-4 py-3 border border-ink/20 focus:border-violet focus:outline-none"
            />
          </div>
          <div>
            <label className="font-mono text-xs uppercase tracking-wide text-ink/50 block mb-1">
              Nickname
            </label>
            <input
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              required
              maxLength={24}
              placeholder="e.g. Hema Fan"
              className="w-full px-4 py-3 border border-ink/20 focus:border-violet focus:outline-none"
            />
          </div>

          {error && <p className="text-safranin text-sm">{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="bg-culture text-white font-display font-semibold text-lg px-6 py-4 hover:brightness-95 transition disabled:opacity-50"
          >
            {submitting ? 'Joining…' : 'Join game'}
          </button>
        </form>
      </div>
    </div>
  )
}

function friendlyError(message) {
  if (message?.includes('GAME_NOT_FOUND')) return "That code doesn't match a game right now."
  if (message?.includes('GAME_ALREADY_STARTED')) return 'That game has already started.'
  if (message?.includes('NICKNAME_TAKEN')) return 'Someone already used that nickname — try another.'
  return message || 'Could not join the game.'
}
