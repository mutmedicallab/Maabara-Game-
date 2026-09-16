import { useCallback, useEffect, useState } from 'react'
import { getGameState } from '../lib/game'
import { useInterval } from './useInterval'

// Polls get_game_state(code) roughly once a second. This is intentionally simple
// (no websockets/broadcast channels) so the whole sync model fits in one place and
// is easy to reason about for a casual, small-group quiz night.
export function useGameState(code, { intervalMs = 1000 } = {}) {
  const [state, setState] = useState(null)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    if (!code) return
    try {
      const next = await getGameState(code)
      setState(next)
      setError(null)
    } catch (err) {
      setError(err)
    } finally {
      setLoading(false)
    }
  }, [code])

  useEffect(() => {
    refresh()
  }, [refresh])

  useInterval(refresh, code ? intervalMs : null)

  return { state, error, loading, refresh }
}
