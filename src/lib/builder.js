import { supabase } from './supabaseClient'

async function call(fn, args = {}) {
  const { data, error } = await supabase.rpc(fn, args)
  if (error) {
    throw new Error(error.message || 'Something went wrong talking to the database.')
  }
  return data
}

export const listQuizzesForBuilder = () => call('list_quizzes')

export const saveNewQuiz = (title, questions, passcode) =>
  call('save_quiz', { p_title: title, p_questions: questions, p_passcode: passcode })

export const getQuizForEdit = (quizId, passcode) =>
  call('get_quiz_for_edit', { p_quiz_id: quizId, p_passcode: passcode })

export const replaceQuizQuestions = (quizId, title, questions, passcode) =>
  call('replace_quiz_questions', {
    p_quiz_id: quizId,
    p_title: title,
    p_questions: questions,
    p_passcode: passcode,
  })

export const deleteQuiz = (quizId, passcode) =>
  call('delete_quiz', { p_quiz_id: quizId, p_passcode: passcode })