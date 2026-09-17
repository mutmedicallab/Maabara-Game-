import { supabase } from './supabaseClient'

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

// Pass only the field relevant to the question's type:
//   { selectedIndexes: [1] }        multiple_choice / true_false / poll (single)
//   { selectedIndexes: [0, 2] }     multiple_choice / poll with allow_multiple
//   { textAnswer: 'EDTA' }          open_ended / word_cloud
//   { scaleValue: 4 }               scale
//   { orderAnswer: [2, 0, 1, 3] }   order (puzzle)
export const submitAnswer = async (
  gameId,
  playerId,
  questionId,
  { selectedIndexes, textAnswer, scaleValue, orderAnswer } = {},
) => {
  const rows = await call('submit_answer', {
    p_game_id: gameId,
    p_player_id: playerId,
    p_question_id: questionId,
    p_selected_indexes: selectedIndexes ?? null,
    p_text_answer: textAnswer ?? null,
    p_scale_value: scaleValue ?? null,
    p_order_answer: orderAnswer ?? null,
  })
  return rows?.[0] ?? null
}

export const getAnswerCounts = (gameId, questionId) =>
  call('reveal_answer_counts', { p_game_id: gameId, p_question_id: questionId })

export const getOpenEndedAnswers = (gameId, questionId) =>
  call('get_open_ended_answers', { p_game_id: gameId, p_question_id: questionId })

export const getScaleStats = async (gameId, questionId) => {
  const rows = await call('get_scale_stats', { p_game_id: gameId, p_question_id: questionId })
  return rows?.[0] ?? null
}

export const getScaleDistribution = (gameId, questionId) =>
  call('get_scale_distribution', { p_game_id: gameId, p_question_id: questionId })

export const getWordCloud = (gameId, questionId) =>
  call('get_word_cloud', { p_game_id: gameId, p_question_id: questionId })

export const getOrderResults = (gameId, questionId) =>
  call('get_order_results', { p_game_id: gameId, p_question_id: questionId })

export const getAnswerProgress = async (gameId, questionId) => {
  const rows = await call('get_answer_progress', { p_game_id: gameId, p_question_id: questionId })
  return rows?.[0] ?? null
}