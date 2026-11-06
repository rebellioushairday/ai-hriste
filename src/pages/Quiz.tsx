import { useEffect, useRef, useState } from 'react'
import data from '../../kviz.json'
import { newQuizGame } from '../games.ts'
import type { QuizData, QuizRound } from '../games.ts'
import { Deck, resultFor } from '../random.ts'
import { ELEMENTS_OF_AI } from '../links.ts'
import { ExternalLinkRow, GameIntro, Page, Progress, ScoreLine } from '../components/ui.tsx'
import { QUIZ_INFO } from '../gameInfo.ts'
import { nbsp } from '../typo.ts'

const quiz = data as QuizData
// Otázky z minulé hry – další hra dá přednost ostatním
// Balíček otázek pro celou návštěvu stránky – otázky se neopakují, dokud se neprojde celá sada
const deck = new Deck(quiz.questions)

function startGame(): QuizRound[] {
  return newQuizGame(quiz, deck)
}

export default function Quiz() {
  const [started, setStarted] = useState(false)
  const [rounds, setRounds] = useState<QuizRound[]>([])
  const [index, setIndex] = useState(0)
  const [selected, setSelected] = useState<number | null>(null)
  const [score, setScore] = useState(0)
  const [finished, setFinished] = useState(false)
  const feedbackRef = useRef<HTMLDivElement>(null)
  const nextRef = useRef<HTMLButtonElement>(null)
  const headingRef = useRef<HTMLHeadingElement>(null)

  const answered = selected !== null

  useEffect(() => {
    if (!answered) return
    feedbackRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    nextRef.current?.focus({ preventScroll: true })
  }, [answered])

  const focusTop = () => {
    window.scrollTo(0, 0)
    requestAnimationFrame(() => headingRef.current?.focus({ preventScroll: true }))
  }

  const next = () => {
    if (index + 1 >= rounds.length) {
      setFinished(true)
    } else {
      setIndex(index + 1)
      setSelected(null)
    }
    window.scrollTo(0, 0)
    requestAnimationFrame(() => headingRef.current?.focus({ preventScroll: true }))
  }

  const restart = () => {
    setRounds(startGame())
    setIndex(0)
    setSelected(null)
    setScore(0)
    setFinished(false)
    setStarted(true)
    focusTop()
  }

  if (!started) {
    return (
      <Page className="game">
        <GameIntro game={QUIZ_INFO} onStart={restart} headingRef={headingRef} />
      </Page>
    )
  }

  const round = rounds[index]

  const answer = (i: number) => {
    if (answered) return
    setSelected(i)
    if (i === round.correct) setScore((s) => s + 1)
  }


  if (finished) {
    const result = resultFor(quiz.results, score, rounds.length)
    return (
      <Page className="game">
        <p className="eyebrow">AI kvíz</p>
        <h1 ref={headingRef} tabIndex={-1}>
          {result.title}
        </h1>
        <ScoreLine score={score} total={rounds.length} label="správných odpovědí" />
        <p className="lead">{nbsp(result.text)}</p>
        {/* Elements of AI hned pod textem výsledku, na který navazuje */}
        <div className="result-link">
          <ExternalLinkRow link={ELEMENTS_OF_AI} />
        </div>
        <div className="stack">
          <button type="button" className="btn btn--primary btn--block" onClick={restart}>
            Hrát znovu
          </button>
        </div>
      </Page>
    )
  }

  return (
    <Page className="game">
      <div className="game__top">
        <p className="eyebrow">{quiz.title}</p>
        <Progress current={index + 1} total={rounds.length} label="Otázka" />
      </div>
      <h1 ref={headingRef} tabIndex={-1} className="question">
        {nbsp(round.question)}
      </h1>

      <ul className="answers">
        {round.answers.map((text, i) => {
          const isCorrect = i === round.correct
          const state = !answered ? '' : isCorrect ? ' is-correct' : i === selected ? ' is-wrong' : ' is-dimmed'
          return (
            <li key={i}>
              <button
                type="button"
                className={'answer' + state}
                onClick={() => answer(i)}
                aria-disabled={answered}
                aria-pressed={i === selected}
              >
                <span className="answer__text">{nbsp(text)}</span>
                {answered && (isCorrect || i === selected) && (
                  <span className="answer__mark">{isCorrect ? 'Správně' : 'Vaše odpověď'}</span>
                )}
              </button>
            </li>
          )
        })}
      </ul>

      {answered && (
        <div className="feedback" ref={feedbackRef} role="status">
          <p className={'feedback__verdict' + (selected === round.correct ? ' is-correct' : ' is-wrong')}>
            {selected === round.correct ? 'Správně' : 'To bohužel není správná odpověď'}
          </p>
          <p className="feedback__text">{nbsp(round.explanation)}</p>
          <button ref={nextRef} type="button" className="btn btn--primary btn--block" onClick={next}>
            {index + 1 >= rounds.length ? 'Zobrazit výsledek' : 'Další otázka'}
          </button>
        </div>
      )}
    </Page>
  )
}
