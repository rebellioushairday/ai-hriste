import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { newPrechytracGame, newQuizGame } from '../src/games.ts'
import type { PrechytracData, QuizData } from '../src/games.ts'
import { Deck, resultFor } from '../src/random.ts'

const read = <T>(file: string): T => JSON.parse(readFileSync(new URL(`../${file}`, import.meta.url), 'utf8'))
const quiz = read<QuizData>('kviz.json')
const prechytrac = read<PrechytracData>('prechytrac.json')

test('kviz.json: data dávají smysl', () => {
  assert.ok(quiz.questions.length >= quiz.questionsPerGame)
  assert.equal(new Set(quiz.questions.map((q) => q.id)).size, quiz.questions.length)
  for (const q of quiz.questions) {
    assert.equal(q.answers.length, 4, q.id)
    assert.ok(q.correct >= 0 && q.correct < q.answers.length, q.id)
  }
})

test('kvíz: vybere správný počet otázek a správná odpověď po zamíchání sedí', () => {
  for (let run = 0; run < 50; run++) {
    const game = newQuizGame(quiz, new Deck(quiz.questions))
    assert.equal(game.length, quiz.questionsPerGame)
    assert.equal(new Set(game.map((q) => q.id)).size, game.length)
    for (const q of game) {
      const original = quiz.questions.find((o) => o.id === q.id)!
      assert.equal(q.answers[q.correct], original.answers[original.correct])
      assert.deepEqual(q.answers.slice().sort(), original.answers.slice().sort())
    }
  }
})

test('kvíz: 20 otázek na hru ze sady aspoň 40', () => {
  assert.equal(quiz.questionsPerGame, 20)
  assert.ok(quiz.questions.length >= 40)
})

test('kvíz: dvě hry po sobě nemají žádnou společnou otázku', () => {
  const deck = new Deck(quiz.questions)
  const first = newQuizGame(quiz, deck)
  const second = newQuizGame(quiz, deck)
  assert.equal(second.filter((q) => first.some((f) => f.id === q.id)).length, 0)
})

test('kvíz: během několika her se vystřídají všechny otázky a v jedné hře se nic neopakuje', () => {
  const deck = new Deck(quiz.questions)
  const seen = new Set<string>()
  const games = Math.ceil(quiz.questions.length / quiz.questionsPerGame)
  for (let g = 0; g < games + 3; g++) {
    const game = newQuizGame(quiz, deck)
    assert.equal(new Set(game.map((q) => q.id)).size, game.length)
    if (g < games) game.forEach((q) => seen.add(q.id))
  }
  assert.equal(seen.size, quiz.questions.length)
})

test('kvíz: pořadí odpovědí se mění', () => {
  const orders = new Set<number>()
  for (let run = 0; run < 40; run++) orders.add(newQuizGame(quiz, new Deck(quiz.questions))[0].correct)
  assert.ok(orders.size > 1)
})

test('prechytrac.json: každé kolo má tři tvrzení a právě jedno vymyšlené', () => {
  assert.ok(prechytrac.rounds.length >= prechytrac.roundsPerGame)
  for (const r of prechytrac.rounds) {
    assert.equal(r.claims.length, 3, r.id)
    assert.equal(r.claims.filter((c) => c.fake).length, 1, r.id)
  }
})

test('Přechytrač: správný počet kol, tvrzení se míchají, hry se střídají', () => {
  assert.ok(prechytrac.rounds.length >= 40)
  const deck = new Deck(prechytrac.rounds)
  const games = prechytrac.rounds.length / prechytrac.roundsPerGame
  const seen = new Set<string>()
  for (let g = 0; g < games; g++) {
    const game = newPrechytracGame(prechytrac, deck)
    assert.equal(game.length, prechytrac.roundsPerGame)
    for (const r of game) {
      assert.ok(!seen.has(r.id), `kolo ${r.id} se opakuje dřív, než se prošla celá sada`)
      seen.add(r.id)
    }
  }
  assert.equal(seen.size, prechytrac.rounds.length)
  const fakePositions = new Set<number>()
  for (let run = 0; run < 40; run++)
    fakePositions.add(newPrechytracGame(prechytrac, new Deck(prechytrac.rounds))[0].claims.findIndex((c) => c.fake))
  assert.ok(fakePositions.size > 1)
})

test('obsah: žádná otázka ani tvrzení se neopakuje', () => {
  const qs = quiz.questions.map((q) => q.question)
  assert.equal(new Set(qs).size, qs.length)
  const claims = prechytrac.rounds.flatMap((r) => r.claims.map((c) => c.text))
  assert.equal(new Set(claims).size, claims.length)
  assert.equal(new Set(prechytrac.rounds.map((r) => r.id)).size, prechytrac.rounds.length)
})

test('hodnocení podle podílu správných odpovědí', () => {
  assert.equal(resultFor(quiz.results, 0, 15).minShare, 0)
  assert.equal(resultFor(quiz.results, 7, 15).minShare, 0)
  assert.equal(resultFor(quiz.results, 8, 15).minShare, 0.5)
  assert.equal(resultFor(quiz.results, 12, 15).minShare, 0.8)
  assert.equal(resultFor(quiz.results, 15, 15).minShare, 0.8)
  assert.equal(resultFor(prechytrac.results, 5, 10).minShare, 0.5)
  assert.equal(resultFor(prechytrac.results, 8, 10).minShare, 0.8)
})
