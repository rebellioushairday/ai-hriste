import { shuffle } from './random.ts'
import type { Deck } from './random.ts'
import type { ResultBand, Rng } from './random.ts'

// AI kvíz

export interface QuizQuestion {
  id: string
  question: string
  answers: string[]
  correct: number
  explanation: string
}

export interface QuizData {
  title: string
  questionsPerGame: number
  results: ResultBand[]
  questions: QuizQuestion[]
}

/** Otázka připravená pro hru – odpovědi jsou zamíchané a `correct` ukazuje do nového pořadí. */
export type QuizRound = QuizQuestion

export function newQuizGame(data: QuizData, deck: Deck<QuizQuestion>, rng: Rng = Math.random): QuizRound[] {
  return deck.draw(data.questionsPerGame).map((q) => {
    const order = shuffle(
      q.answers.map((_, i) => i),
      rng,
    )
    return {
      ...q,
      answers: order.map((i) => q.answers[i]),
      correct: order.indexOf(q.correct),
    }
  })
}

// Přechytrač AI

export interface Claim {
  text: string
  fake: boolean
}

export interface PrechytracRound {
  id: string
  topic: string
  claims: Claim[]
  explanation: string
}

export interface PrechytracData {
  title: string
  intro: string
  note: string
  roundsPerGame: number
  results: ResultBand[]
  rounds: PrechytracRound[]
}

export function newPrechytracGame(
  data: PrechytracData,
  deck: Deck<PrechytracRound>,
  rng: Rng = Math.random,
): PrechytracRound[] {
  return deck.draw(data.roundsPerGame).map((r) => ({
    ...r,
    claims: shuffle(r.claims, rng),
  }))
}
