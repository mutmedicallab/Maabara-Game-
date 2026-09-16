import { supabase } from './supabaseClient'

// Every database interaction goes through a Postgres function (see supabase/schema.sql).
// The frontend never selects from tables directly, so there's nothing here that can
// leak a correct answer early or let a random client rewrite game state.

async function call(fn, args = {}) {
  const { data, error } = await supabase.rpc(fn, args)
  if (error) {
    throw new Error(error.message || 'Something went wrong talking to the database.')
  }
  return data
}

export const listQuizzes = () => call('list_quizzes')

export const createGame = async (quizId) => {
  const rows = await call('create_game', { p_quiz_id: quizId })
  return rows?.[0] ?? null
}

export const joinGame = async (code, nickname) => {
  const rows = await call('join_game', { p_code: code.trim().toUpperCase(), p_nickname: nickname.trim() })
  return rows?.[0] ?? null
}

export const getGameState = async (code) => {
  const rows = await call('get_game_state', { p_code: code.trim().toUpperCase() })
  return rows?.[0] ?? null
}

export const getPlayers = (gameId) => call('get_players', { p_game_id: gameId })

export const startGame = (gameId, hostToken) =>
  call('start_game', { p_game_id: gameId, p_host_token: hostToken })

export const endQuestion = (gameId, hostToken) =>
  call('end_question', { p_game_id: gameId, p_host_token: hostToken })

export const nextQuestion = (gameId, hostToken) =>
  call('next_question', { p_game_id: gameId, p_host_token: hostToken })

export const submitAnswer = async (gameId, playerId, questionId, selectedIndex) => {
  const rows = await call('submit_answer', {
    p_game_id: gameId,
    p_player_id: playerId,
    p_question_id: questionId,
    p_selected_index: selectedIndex,
  })
  return rows?.[0] ?? null
}

export const getAnswerCounts = (gameId, questionId) =>
  call('reveal_answer_counts', { p_game_id: gameId, p_question_id: questionId })
