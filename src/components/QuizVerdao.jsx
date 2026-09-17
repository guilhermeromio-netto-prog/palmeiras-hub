import { useMemo, useState } from 'react'
import { QUIZ_QUESTIONS, QUIZ_TOTAL } from '../utils/quizVerdao'
import { getQuizBest, saveQuizBest, softHaptic } from '../utils/torcidaStorage'
import { quizShareText } from '../utils/share'
import ShareButton from './ShareButton'
import { db, id } from '../sync/instant'
import { getDisplayName, setDisplayName } from '../sync/identity'
import { useRoomCodeState } from '../hooks/useRoomCode'

export default function QuizVerdao({ embedded = false }) {
  const room = useRoomCodeState()
  const { data } = db.useQuery({
    quizScores: {
      $: { where: { roomCode: room } },
    },
  })
  const [step, setStep] = useState(0)
  const [score, setScore] = useState(0)
  const [picked, setPicked] = useState(null)
  const [done, setDone] = useState(false)
  const [best, setBest] = useState(() => getQuizBest())
  const [started, setStarted] = useState(false)
  const [playerName, setPlayerName] = useState(() => getDisplayName() || 'Torcedor')

  const q = QUIZ_QUESTIONS[step]

  const leaderboard = useMemo(() => {
    const list = [...(data?.quizScores || [])]
    list.sort((a, b) => (b.score || 0) - (a.score || 0) || (b.at || 0) - (a.at || 0))
    const byName = new Map()
    for (const row of list) {
      const key = String(row.name || 'Torcedor').toLowerCase()
      if (!byName.has(key)) byName.set(key, row)
    }
    return [...byName.values()].slice(0, 8)
  }, [data?.quizScores])

  function start() {
    setStarted(true)
    setStep(0)
    setScore(0)
    setPicked(null)
    setDone(false)
  }

  function choose(idx) {
    if (picked != null || !q) return
    setPicked(idx)
    if (idx === q.correct) {
      softHaptic([10, 40, 10])
      setScore((s) => s + 1)
    } else {
      softHaptic(30)
    }
  }

  function publishScore(finalScore) {
    const name = String(playerName || getDisplayName() || 'Torcedor').trim().slice(0, 20) || 'Torcedor'
    setDisplayName(name)
    setBest(saveQuizBest(finalScore))
    db.transact(
      db.tx.quizScores[id()].update({
        roomCode: room,
        name,
        score: finalScore,
        at: Date.now(),
      })
    )
  }

  function next() {
    if (picked == null) return
    if (step + 1 >= QUIZ_TOTAL) {
      publishScore(score)
      setDone(true)
      return
    }
    setStep((s) => s + 1)
    setPicked(null)
  }

  const board = (
    <ul className="quiz-verdao__board">
      <li className="muted tiny">Ranking da sala {room}</li>
      {leaderboard.length === 0 && <li className="muted tiny">Ninguém jogou ainda nesta sala.</li>}
      {leaderboard.map((row) => (
        <li key={row.id}>
          <strong>{row.name}</strong> — {row.score}/{QUIZ_TOTAL}
        </li>
      ))}
    </ul>
  )

  if (!started) {
    return (
      <section className={`quiz-verdao card${embedded ? ' quiz-verdao--embed' : ''}`}>
        <h3 className="quiz-verdao__title">Quiz do Verdão</h3>
        <p className="muted">
          {QUIZ_TOTAL} perguntas rápidas sobre o Palmeiras. Só fatos bem conhecidos.
        </p>
        <label className="quiz-verdao__name">
          <span>Nome no ranking</span>
          <input
            type="text"
            maxLength={20}
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            placeholder="Torcedor"
          />
        </label>
        {best != null && (
          <p className="muted tiny">Melhor neste aparelho: {best}/{QUIZ_TOTAL}</p>
        )}
        {board}
        <button type="button" className="btn primary touch" onClick={start}>
          Começar quiz
        </button>
      </section>
    )
  }

  if (done) {
    return (
      <section className={`quiz-verdao card${embedded ? ' quiz-verdao--embed' : ''}`}>
        <h3 className="quiz-verdao__title">Resultado</h3>
        <p className="quiz-verdao__score">
          Você acertou <strong>{score}</strong> de {QUIZ_TOTAL}
        </p>
        {best != null && (
          <p className="muted tiny">Recorde local: {best}/{QUIZ_TOTAL}</p>
        )}
        {board}
        <div className="quiz-verdao__actions">
          <ShareButton
            text={quizShareText(score, QUIZ_TOTAL)}
            label="WhatsApp · resultado"
            className="share-btn--compact"
          />
          <button type="button" className="btn ghost touch" onClick={start}>
            Jogar de novo
          </button>
        </div>
      </section>
    )
  }

  return (
    <section className={`quiz-verdao card${embedded ? ' quiz-verdao--embed' : ''}`}>
      <header className="quiz-verdao__head">
        <h3 className="quiz-verdao__title">Quiz do Verdão</h3>
        <span className="pill tiny">
          {step + 1}/{QUIZ_TOTAL}
        </span>
      </header>
      <p className="quiz-verdao__q">{q.q}</p>
      <div className="quiz-verdao__options" role="group" aria-label="Alternativas">
        {q.options.map((opt, idx) => {
          let cls = 'quiz-verdao__opt touch'
          if (picked != null) {
            if (idx === q.correct) cls += ' is-correct'
            else if (idx === picked) cls += ' is-wrong'
          }
          return (
            <button
              key={opt}
              type="button"
              className={cls}
              onClick={() => choose(idx)}
              disabled={picked != null}
            >
              {opt}
            </button>
          )
        })}
      </div>
      {picked != null && (
        <button type="button" className="btn primary touch" onClick={next}>
          {step + 1 >= QUIZ_TOTAL ? 'Ver resultado' : 'Próxima'}
        </button>
      )}
    </section>
  )
}
