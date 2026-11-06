import { useEffect, useRef, useState } from 'react'
import data from '../../prechytrac.json'
import { newPrechytracGame } from '../games.ts'
import type { PrechytracData, PrechytracRound } from '../games.ts'
import { Deck, resultFor } from '../random.ts'
import { NEWSLETTER } from '../links.ts'
import { ExternalLinkRow, GameIntro, Page, Progress, ScoreLine } from '../components/ui.tsx'
import { PRECHYTRAC_INFO } from '../gameInfo.ts'
import { nbsp } from '../typo.ts'

const game = data as PrechytracData
// Balíček otázek pro celou návštěvu stránky – otázky se neopakují, dokud se neprojde celá sada
const deck = new Deck(game.rounds)

function startGame(): PrechytracRound[] {
  return newPrechytracGame(game, deck)
}

type Stage = 'intro' | 'play' | 'end'

export default function Prechytrac() {
  const [stage, setStage] = useState<Stage>('intro')
  const [rounds, setRounds] = useState<PrechytracRound[]>([])
  const [index, setIndex] = useState(0)
  const [selected, setSelected] = useState<number | null>(null)
  const [score, setScore] = useState(0)
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

  const start = () => {
    setRounds(startGame())
    setIndex(0)
    setSelected(null)
    setScore(0)
    setStage('play')
    focusTop()
  }

  if (stage === 'intro') {
    return (
      <Page className="game">
        <GameIntro game={PRECHYTRAC_INFO} onStart={start} headingRef={headingRef} note={nbsp(game.note)} />
      </Page>
    )
  }

  if (stage === 'end') {
    const result = resultFor(game.results, score, rounds.length)
    return (
      <Page className="game">
        <p className="eyebrow">{game.title}</p>
        <h1 ref={headingRef} tabIndex={-1}>
          {result.title}
        </h1>
        <ScoreLine score={score} total={rounds.length} label="kol, ve kterých jste odhalili AI" />
        <p className="lead">{nbsp(result.text)}</p>
        {/* Newsletter hned pod textem výsledku, na který navazuje */}
        <div className="result-link">
          <ExternalLinkRow link={NEWSLETTER} />
        </div>
        <div className="stack">
          <button type="button" className="btn btn--primary btn--block" onClick={start}>
            Hrát znovu
          </button>
        </div>
        <p className="note">{nbsp(game.note)}</p>
      </Page>
    )
  }

  const round = rounds[index]
  const fakeIndex = round.claims.findIndex((c) => c.fake)
  const won = selected === fakeIndex

  const pick = (i: number) => {
    if (answered) return
    setSelected(i)
    if (i === fakeIndex) setScore((s) => s + 1)
  }

  const next = () => {
    if (index + 1 >= rounds.length) setStage('end')
    else {
      setIndex(index + 1)
      setSelected(null)
    }
    focusTop()
  }

  return (
    <Page className="game">
      <div className="game__top">
        <p className="eyebrow">{nbsp(round.topic)}</p>
        <Progress current={index + 1} total={rounds.length} label="Kolo" />
      </div>
      <h1 ref={headingRef} tabIndex={-1} className="question">
        AI tvrdí tři věci. Jedna z nich je vymyšlená.
      </h1>

      <ul className="claims">
        {round.claims.map((claim, i) => {
          const state = !answered
            ? ''
            : (claim.fake ? ' is-fake' : ' is-true') + (i === selected ? ' is-selected' : '')
          return (
            <li key={i}>
              <button
                type="button"
                className={'claim' + state}
                onClick={() => pick(i)}
                aria-disabled={answered}
                aria-pressed={i === selected}
              >
                <span className="claim__text">{nbsp(claim.text)}</span>
                {answered && (
                  <span className="claim__tags">
                    <span className="claim__tag">{claim.fake ? 'Vymyšlené' : 'Pravda'}</span>
                    {i === selected && <span className="claim__tag claim__tag--choice">Vaše volba</span>}
                  </span>
                )}
              </button>
            </li>
          )
        })}
      </ul>

      {answered && (
        <div className="feedback" ref={feedbackRef} role="status">
          <p className={'feedback__verdict' + (won ? ' is-correct' : ' is-wrong')}>
            {won ? 'Odhalili jste AI' : 'Tady AI vyhrála'}
          </p>
          <p className="feedback__text">{nbsp(round.explanation)}</p>
          <button ref={nextRef} type="button" className="btn btn--primary btn--block" onClick={next}>
            {index + 1 >= rounds.length ? 'Zobrazit výsledek' : 'Další kolo'}
          </button>
        </div>
      )}
    </Page>
  )
}
