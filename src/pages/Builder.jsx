import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  listQuizzesForBuilder,
  saveNewQuiz,
  getQuizForEdit,
  replaceQuizQuestions,
  deleteQuiz,
} from '../lib/builder'

const PASSCODE_KEY = 'titer-up:builder-passcode'

const TYPE_LABELS = {
  multiple_choice: 'Multiple choice',
  true_false: 'True / False',
  open_ended: 'Type an answer',
  scale: 'Scale (poll)',
}

function blankQuestion(type = 'multiple_choice') {
  return {
    question_type: type,
    question_text: '',
    time_limit: 20,
    options: ['', '', '', ''],
    correct_index: 0,
    correct_answers_text: '',
    scale_min: 1,
    scale_max: 5,
    scale_step: 1,
  }
}

function fromServerQuestion(sq) {
  return {
    question_type: sq.question_type,
    question_text: sq.question_text || '',
    time_limit: sq.time_limit ?? 20,
    options: sq.question_type === 'multiple_choice' && sq.options?.length ? sq.options : ['', '', '', ''],
    correct_index: sq.correct_index ?? 0,
    correct_answers_text: (sq.correct_answers || []).join(', '),
    scale_min: sq.scale_min ?? 1,
    scale_max: sq.scale_max ?? 5,
    scale_step: sq.scale_step ?? 1,
  }
}

function toPayload(q) {
  const base = {
    question_type: q.question_type,
    question_text: q.question_text.trim(),
    time_limit: Number(q.time_limit) || 20,
  }
  if (q.question_type === 'multiple_choice') {
    return {
      ...base,
      options: q.options.map((o) => o.trim()).filter(Boolean),
      correct_index: q.correct_index,
    }
  }
  if (q.question_type === 'true_false') {
    return { ...base, options: ['True', 'False'], correct_index: q.correct_index }
  }
  if (q.question_type === 'open_ended') {
    return {
      ...base,
      correct_answers: q.correct_answers_text
        .split(',')
        .map((a) => a.trim())
        .filter(Boolean),
    }
  }
  if (q.question_type === 'scale') {
    return {
      ...base,
      scale_min: Number(q.scale_min),
      scale_max: Number(q.scale_max),
      scale_step: Number(q.scale_step) || 1,
    }
  }
  return base
}

function validate(title, questions) {
  if (!title.trim()) return 'Give the quiz a title.'
  if (questions.length === 0) return 'Add at least one question.'
  for (const [i, q] of questions.entries()) {
    if (!q.question_text.trim()) return `Question ${i + 1} needs text.`
    if (q.question_type === 'multiple_choice') {
      const filled = q.options.filter((o) => o.trim())
      if (filled.length < 2) return `Question ${i + 1} needs at least 2 options.`
      if (q.correct_index >= q.options.length || !q.options[q.correct_index]?.trim()) {
        return `Question ${i + 1}: pick a correct option that has text.`
      }
    }
    if (q.question_type === 'open_ended' && !q.correct_answers_text.trim()) {
      return `Question ${i + 1} needs at least one accepted answer.`
    }
    if (q.question_type === 'scale' && Number(q.scale_min) >= Number(q.scale_max)) {
      return `Question ${i + 1}: scale max must be greater than min.`
    }
  }
  return null
}

export default function Builder() {
  const [passcode, setPasscode] = useState(() => sessionStorage.getItem(PASSCODE_KEY) || '')
  const [unlocked, setUnlocked] = useState(() => Boolean(sessionStorage.getItem(PASSCODE_KEY)))

  const [quizzes, setQuizzes] = useState([])
  const [loadingList, setLoadingList] = useState(true)
  const [error, setError] = useState(null)

  const [editingId, setEditingId] = useState(null) // null = not editing, 'new' = creating
  const [title, setTitle] = useState('')
  const [questions, setQuestions] = useState([])
  const [saving, setSaving] = useState(false)

  function refreshList() {
    setLoadingList(true)
    listQuizzesForBuilder()
      .then(setQuizzes)
      .catch((e) => setError(e.message))
      .finally(() => setLoadingList(false))
  }

  useEffect(() => {
    refreshList()
  }, [])

  function handleUnlock(e) {
    e.preventDefault()
    sessionStorage.setItem(PASSCODE_KEY, passcode)
    setUnlocked(true)
  }

  function startNewQuiz() {
    setEditingId('new')
    setTitle('')
    setQuestions([blankQuestion()])
    setError(null)
  }

  async function startEditQuiz(quiz) {
    setError(null)
    try {
      const data = await getQuizForEdit(quiz.id, passcode)
      setEditingId(quiz.id)
      setTitle(data.title)
      setQuestions((data.questions || []).map(fromServerQuestion))
    } catch (e) {
      setError(e.message.includes('INVALID_PASSCODE') ? 'Wrong passcode.' : e.message)
    }
  }

  function cancelEdit() {
    setEditingId(null)
    setTitle('')
    setQuestions([])
    setError(null)
  }

  function updateQuestion(index, patch) {
    setQuestions((prev) => prev.map((q, i) => (i === index ? { ...q, ...patch } : q)))
  }

  function updateOption(qIndex, optIndex, value) {
    setQuestions((prev) =>
      prev.map((q, i) => {
        if (i !== qIndex) return q
        const options = [...q.options]
        options[optIndex] = value
        return { ...q, options }
      }),
    )
  }

  function addOption(qIndex) {
    setQuestions((prev) =>
      prev.map((q, i) => (i === qIndex && q.options.length < 6 ? { ...q, options: [...q.options, ''] } : q)),
    )
  }

  function removeOption(qIndex, optIndex) {
    setQuestions((prev) =>
      prev.map((q, i) => {
        if (i !== qIndex || q.options.length <= 2) return q
        const options = q.options.filter((_, oi) => oi !== optIndex)
        const correct_index = q.correct_index >= options.length ? 0 : q.correct_index
        return { ...q, options, correct_index }
      }),
    )
  }

  function addQuestion() {
    setQuestions((prev) => [...prev, blankQuestion()])
  }

  function removeQuestion(index) {
    setQuestions((prev) => prev.filter((_, i) => i !== index))
  }

  function changeQuestionType(index, type) {
    setQuestions((prev) =>
      prev.map((q, i) =>
        i === index ? { ...blankQuestion(type), question_text: q.question_text, time_limit: q.time_limit } : q,
      ),
    )
  }

  async function handleSave() {
    const msg = validate(title, questions)
    if (msg) {
      setError(msg)
      return
    }
    setSaving(true)
    setError(null)
    try {
      const payload = questions.map(toPayload)
      if (editingId === 'new') {
        await saveNewQuiz(title, payload, passcode)
      } else {
        await replaceQuizQuestions(editingId, title, payload, passcode)
      }
      cancelEdit()
      refreshList()
    } catch (e) {
      setError(e.message.includes('INVALID_PASSCODE') ? 'Wrong passcode.' : e.message)
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(quiz) {
    if (!confirm(`Delete "${quiz.title}"? This can't be undone.`)) return
    setError(null)
    try {
      await deleteQuiz(quiz.id, passcode)
      refreshList()
    } catch (e) {
      setError(e.message.includes('INVALID_PASSCODE') ? 'Wrong passcode.' : e.message)
    }
  }

  if (!unlocked) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <form onSubmit={handleUnlock} className="w-full max-w-sm lab-panel p-6 flex flex-col gap-4">
          <p className="font-mono text-xs uppercase tracking-wide text-ink/50">Quiz builder</p>
          <input
            type="password"
            value={passcode}
            onChange={(e) => setPasscode(e.target.value)}
            placeholder="Passcode"
            required
            className="w-full px-4 py-3 border border-ink/20 focus:border-violet focus:outline-none"
          />
          <button type="submit" className="bg-violet text-white font-display font-semibold px-6 py-3 hover:bg-violet-dim transition-colors">
            Continue
          </button>
          <Link to="/" className="text-center text-sm text-ink/50 hover:text-ink">
            &larr; Back home
          </Link>
        </form>
      </div>
    )
  }

  return (
    <div className="min-h-screen px-4 py-10">
      <div className="max-w-2xl mx-auto">
        <header className="flex items-center justify-between mb-8">
          <Link to="/" className="font-display font-bold text-2xl">
            Titer<span className="text-violet"> Up</span>
          </Link>
          <span className="font-mono text-xs uppercase tracking-wide text-ink/50">Quiz builder</span>
        </header>

        {error && (
          <div className="mb-6 px-4 py-3 bg-safranin/10 border border-safranin/30 text-safranin text-sm">
            {error}
          </div>
        )}

        {editingId === null && (
          <div className="flex flex-col gap-6">
            <button
              onClick={startNewQuiz}
              className="lab-panel px-5 py-4 font-display font-semibold hover:bg-violet hover:text-white hover:border-violet transition-colors text-left"
            >
              + New quiz
            </button>

            <div className="flex flex-col gap-3">
              {quizzes.map((q) => (
                <div key={q.id} className="lab-panel px-5 py-4 flex items-center justify-between">
                  <div>
                    <p className="font-display font-medium">{q.title}</p>
                    <p className="font-mono text-xs text-ink/50">{q.question_count} questions</p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => startEditQuiz(q)} className="font-mono text-xs uppercase px-3 py-2 hover:bg-ink/5">
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(q)}
                      className="font-mono text-xs uppercase px-3 py-2 text-safranin hover:bg-safranin/10"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
              {!loadingList && quizzes.length === 0 && <p className="text-ink/50 text-sm">No quizzes yet.</p>}
            </div>
          </div>
        )}

        {editingId !== null && (
          <div className="flex flex-col gap-6">
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Quiz title"
              className="w-full px-4 py-3 border border-ink/20 focus:border-violet focus:outline-none font-display text-xl"
            />

            {questions.map((q, qi) => (
              <QuestionEditor
                key={qi}
                q={q}
                index={qi}
                onChangeType={(type) => changeQuestionType(qi, type)}
                onChangeField={(patch) => updateQuestion(qi, patch)}
                onChangeOption={(oi, value) => updateOption(qi, oi, value)}
                onAddOption={() => addOption(qi)}
                onRemoveOption={(oi) => removeOption(qi, oi)}
                onRemove={() => removeQuestion(qi)}
              />
            ))}

            <button onClick={addQuestion} className="lab-panel px-5 py-3 font-mono text-sm uppercase hover:bg-ink/5">
              + Add question
            </button>

            <div className="flex gap-3">
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 bg-violet text-white font-display font-semibold text-lg px-6 py-4 hover:bg-violet-dim transition-colors disabled:opacity-50"
              >
                {saving ? 'Saving…' : 'Save quiz'}
              </button>
              <button onClick={cancelEdit} className="lab-panel px-6 py-4 font-mono text-sm uppercase hover:bg-ink/5">
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function QuestionEditor({ q, index, onChangeType, onChangeField, onChangeOption, onAddOption, onRemoveOption, onRemove }) {
  return (
    <div className="lab-panel p-5 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <span className="font-mono text-xs uppercase tracking-wide text-ink/50">Question {index + 1}</span>
        <button onClick={onRemove} className="font-mono text-xs uppercase text-safranin hover:underline">
          Remove
        </button>
      </div>

      <select
        value={q.question_type}
        onChange={(e) => onChangeType(e.target.value)}
        className="px-3 py-2 border border-ink/20 focus:border-violet focus:outline-none font-mono text-sm"
      >
        {Object.entries(TYPE_LABELS).map(([value, label]) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </select>

      <textarea
        value={q.question_text}
        onChange={(e) => onChangeField({ question_text: e.target.value })}
        placeholder="Question text"
        rows={2}
        className="w-full px-4 py-3 border border-ink/20 focus:border-violet focus:outline-none resize-none"
      />

      <div className="flex items-center gap-2">
        <label className="font-mono text-xs uppercase text-ink/50">Time limit (s)</label>
        <input
          type="number"
          min={5}
          max={120}
          value={q.time_limit}
          onChange={(e) => onChangeField({ time_limit: e.target.value })}
          className="w-20 px-2 py-1 border border-ink/20 focus:border-violet focus:outline-none"
        />
      </div>

      {q.question_type === 'multiple_choice' && (
        <div className="flex flex-col gap-2">
          {q.options.map((opt, oi) => (
            <div key={oi} className="flex items-center gap-2">
              <input
                type="radio"
                name={`correct-${index}`}
                checked={q.correct_index === oi}
                onChange={() => onChangeField({ correct_index: oi })}
                title="Mark as correct answer"
              />
              <input
                value={opt}
                onChange={(e) => onChangeOption(oi, e.target.value)}
                placeholder={`Option ${oi + 1}`}
                className="flex-1 px-3 py-2 border border-ink/20 focus:border-violet focus:outline-none"
              />
              {q.options.length > 2 && (
                <button onClick={() => onRemoveOption(oi)} className="text-ink/40 hover:text-safranin px-1">
                  &times;
                </button>
              )}
            </div>
          ))}
          {q.options.length < 6 && (
            <button onClick={onAddOption} className="font-mono text-xs uppercase text-violet hover:underline self-start">
              + Add option
            </button>
          )}
          <p className="text-xs text-ink/40">Select the radio button next to the correct option.</p>
        </div>
      )}

      {q.question_type === 'true_false' && (
        <div className="flex gap-4">
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name={`tf-${index}`}
              checked={q.correct_index === 0}
              onChange={() => onChangeField({ correct_index: 0 })}
            />
            True
          </label>
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name={`tf-${index}`}
              checked={q.correct_index === 1}
              onChange={() => onChangeField({ correct_index: 1 })}
            />
            False
          </label>
        </div>
      )}

      {q.question_type === 'open_ended' && (
        <div>
          <input
            value={q.correct_answers_text}
            onChange={(e) => onChangeField({ correct_answers_text: e.target.value })}
            placeholder="Accepted answers, comma separated (e.g. EDTA, Ethylenediaminetetraacetic acid)"
            className="w-full px-3 py-2 border border-ink/20 focus:border-violet focus:outline-none"
          />
          <p className="text-xs text-ink/40 mt-1">Matching ignores case and extra spaces.</p>
        </div>
      )}

      {q.question_type === 'scale' && (
        <div className="flex items-center gap-3">
          <label className="font-mono text-xs uppercase text-ink/50">Min</label>
          <input
            type="number"
            value={q.scale_min}
            onChange={(e) => onChangeField({ scale_min: e.target.value })}
            className="w-16 px-2 py-1 border border-ink/20 focus:border-violet focus:outline-none"
          />
          <label className="font-mono text-xs uppercase text-ink/50">Max</label>
          <input
            type="number"
            value={q.scale_max}
            onChange={(e) => onChangeField({ scale_max: e.target.value })}
            className="w-16 px-2 py-1 border border-ink/20 focus:border-violet focus:outline-none"
          />
          <label className="font-mono text-xs uppercase text-ink/50">Step</label>
          <input
            type="number"
            min={1}
            value={q.scale_step}
            onChange={(e) => onChangeField({ scale_step: e.target.value })}
            className="w-16 px-2 py-1 border border-ink/20 focus:border-violet focus:outline-none"
          />
          <p className="text-xs text-ink/40">No correct answer — this is a poll.</p>
        </div>
      )}
    </div>
  )
}