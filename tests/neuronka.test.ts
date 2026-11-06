import { test } from 'node:test'
import assert from 'node:assert/strict'
import { MAZES } from '../src/neuronka/mazes.ts'
import { CELL_DOT, CELL_WALL, DIR_VECTORS, Game, POINTS_CATCH, parseMaze } from '../src/neuronka/engine.ts'
import type { Dir } from '../src/neuronka/engine.ts'

const DIRS = Object.keys(DIR_VECTORS) as Dir[]

function advance(game: Game, seconds: number) {
  for (let t = 0; t < seconds; t += 1 / 60) game.update(1 / 60)
}

test('tři levely', () => {
  assert.deepEqual(
    MAZES.map((m) => m.name),
    ['Level 1', 'Level 2', 'Level 3'],
  )
})

for (const def of MAZES) {
  const maze = parseMaze(def)
  const open = (x: number, y: number) =>
    x >= 0 && y >= 0 && x < maze.width && y < maze.height && maze.cells[y * maze.width + x] !== CELL_WALL

  test(`${def.name}: velikost 15 × 19, jeden start a čtyři příšerky`, () => {
    assert.equal(maze.width, 15)
    assert.equal(maze.height, 19)
    assert.equal(def.rows.join('').split('P').length - 1, 1)
    assert.equal(maze.ghosts.length, 4)
    assert.ok(maze.dots > 100)
  })

  test(`${def.name}: okraj je celý ze stěn`, () => {
    for (let x = 0; x < maze.width; x++) assert.ok(!open(x, 0) && !open(x, maze.height - 1))
    for (let y = 0; y < maze.height; y++) assert.ok(!open(0, y) && !open(maze.width - 1, y))
  })

  test(`${def.name}: všechny body jsou dosažitelné ze startu`, () => {
    const seen = new Set([`${maze.player.x},${maze.player.y}`])
    const queue = [maze.player]
    while (queue.length) {
      const { x, y } = queue.shift()!
      for (const d of DIRS) {
        const v = DIR_VECTORS[d]
        const key = `${x + v.x},${y + v.y}`
        if (open(x + v.x, y + v.y) && !seen.has(key)) {
          seen.add(key)
          queue.push({ x: x + v.x, y: y + v.y })
        }
      }
    }
    for (let y = 0; y < maze.height; y++)
      for (let x = 0; x < maze.width; x++) if (open(x, y)) assert.ok(seen.has(`${x},${y}`), `${x},${y}`)
  })

  test(`${def.name}: žádné slepé uličky`, () => {
    for (let y = 0; y < maze.height; y++)
      for (let x = 0; x < maze.width; x++) {
        if (!open(x, y)) continue
        const n = DIRS.filter((d) => open(x + DIR_VECTORS[d].x, y + DIR_VECTORS[d].y)).length
        assert.ok(n >= 2, `slepá ulička ${x},${y}`)
      }
  })

  test(`${def.name}: není osově souměrné`, () => {
    const walls = def.rows.map((r) => r.replace(/[^#]/g, ' '))
    assert.notDeepEqual(
      walls.map((r) => [...r].reverse().join('')),
      walls,
    )
    assert.notDeepEqual(walls.slice().reverse(), walls)
  })
}

test('bludiště se navzájem liší', () => {
  const keys = MAZES.map((m) => m.rows.join(''))
  assert.equal(new Set(keys).size, MAZES.length)
})

/** Robot: vždy jde nejkratší cestou k nejbližšímu datovému bodu. */
function botWant(game: Game): Dir | null {
  const { width, height } = game.maze
  const sx = Math.round(game.player.x)
  const sy = Math.round(game.player.y)
  const prev = new Map<number, { from: number; dir: Dir }>()
  const start = sy * width + sx
  const queue = [start]
  const seen = new Set([start])
  while (queue.length) {
    const i = queue.shift()!
    const x = i % width
    const y = Math.floor(i / width)
    if (game.cells[i] === CELL_DOT && i !== start) {
      let cur = i
      while (prev.get(cur)!.from !== start) cur = prev.get(cur)!.from
      return prev.get(cur)!.dir
    }
    for (const d of DIRS) {
      const v = DIR_VECTORS[d]
      const nx = x + v.x
      const ny = y + v.y
      if (nx < 0 || ny < 0 || nx >= width || ny >= height || game.isWall(nx, ny)) continue
      const j = ny * width + nx
      if (seen.has(j)) continue
      seen.add(j)
      prev.set(j, { from: i, dir: d })
      queue.push(j)
    }
  }
  return null
}

test('všechna bludiště jde dohrát až do konce', () => {
  const game = new Game(MAZES, { noGhosts: true })
  const visited: string[] = []
  let frames = 0
  while (!game.finished && frames < 60 * 60 * 10) {
    if (!visited.includes(game.levelName)) visited.push(game.levelName)
    const want = botWant(game)
    if (want) game.setWant(want)
    game.update(1 / 60)
    frames++
  }
  assert.equal(game.phase, 'won')
  assert.deepEqual(visited, ['Level 1', 'Level 2', 'Level 3'])
  const totalDots = MAZES.reduce((sum, m) => sum + parseMaze(m).dots, 0)
  assert.ok(game.score >= totalDots * 10)
  assert.equal(game.lives, 3)
})

test('každý další level je těžší: rychlejší příšerky, které vyrazí dřív', () => {
  const game = new Game(MAZES)
  const levels = MAZES.map((_, i) => {
    game.loadLevel(i)
    return { ghost: game.level.ghostSpeed, lastRelease: Math.max(...game.ghosts.map((g) => g.wait)), count: game.ghosts.length }
  })
  for (let i = 1; i < levels.length; i++) {
    assert.ok(levels[i].ghost > levels[i - 1].ghost)
    assert.ok(levels[i].lastRelease < levels[i - 1].lastRelease)
  }
  // příšerky jsou vždy pomalejší než neuron, jinak by se jim nedalo utéct
  MAZES.forEach((_, i) => {
    game.loadLevel(i)
    assert.ok(game.level.ghostSpeed < game.level.playerSpeed)
  })
  assert.ok(levels.every((l) => l.count === 4))
})

test('nehybný neuron přijde o všechny životy a hra skončí', () => {
  const game = new Game(MAZES, { rng: () => 0.3 })
  let frames = 0
  while (!game.finished && frames < 60 * 300) {
    game.update(1 / 60)
    frames++
  }
  assert.equal(game.phase, 'over')
  assert.equal(game.lives, 0)
})

test('po ověřeném zdroji jde halucinaci chytit za 200 bodů a vrátí se na start', () => {
  const game = new Game(MAZES)
  advance(game, 2) // fáze ready
  assert.equal(game.phase, 'playing')
  const ghost = game.ghosts[0]
  ghost.frightened = true
  game.powerTime = 6
  ghost.x = game.player.x
  ghost.y = game.player.y
  ghost.wait = 0
  const before = game.score
  game.update(1 / 120)
  assert.equal(game.score - before >= POINTS_CATCH, true)
  assert.equal(ghost.x, ghost.startX)
  assert.equal(ghost.y, ghost.startY)
  assert.equal(game.lives, 3)
})

test('pauza zastaví hru', () => {
  const game = new Game(MAZES)
  advance(game, 2)
  game.setWant('left')
  game.setPaused(true)
  const { x, y } = game.player
  advance(game, 1)
  assert.deepEqual([game.player.x, game.player.y], [x, y])
  game.setPaused(false)
  advance(game, 0.3)
  assert.notDeepEqual([game.player.x, game.player.y], [x, y])
})

test('odbočka jde zadat i chvilku po projetí křižovatky', () => {
  const setup = (offset: number) => {
    const game = new Game(MAZES, { noGhosts: true })
    advance(game, 2)
    const { width, height } = game.maze
    let junction: { x: number; y: number } | null = null
    for (let y = 1; y < height - 1 && !junction; y++)
      for (let x = 1; x < width - 1 && !junction; x++)
        if (game.canGo(x - 1, y, 'right') && game.canGo(x, y, 'right') && game.canGo(x, y, 'up') && !game.canGo(x + 1, y, 'up'))
          junction = { x, y }
    assert.ok(junction)
    const p = game.player
    p.x = junction.x + offset
    p.y = junction.y
    p.dir = 'right'
    game.setWant('up')
    game.update(1 / 120)
    return { p, junction }
  }

  const late = setup(0.25)
  assert.ok(Math.abs(late.p.x - late.junction.x) < 1e-9, 'neuron se vrátí do sloupce křižovatky')
  assert.ok(late.p.y < late.junction.y, 'a jede nahoru')
  assert.equal(late.p.dir, 'up')

  const tooLate = setup(0.45)
  assert.equal(tooLate.p.dir, 'right', 'příliš pozdě – jede dál rovně')
})

test('na posledním životě se objeví srdíčko, vrátí život a v levelu je jen jednou', () => {
  const game = new Game(MAZES, { noGhosts: true })
  advance(game, 2)
  game.update(1 / 60)
  assert.equal(game.heart, null, 'se třemi životy srdíčko není')

  game.lives = 1
  game.update(1 / 60)
  // assert.equal výše zúžil typ na null, srdíčko ale mezitím vzniklo
  const heart = game.heart as Game['heart']
  assert.ok(heart, 'na posledním životě se objeví')
  assert.ok(!game.isWall(heart.x, heart.y))
  const p = game.player
  assert.ok(Math.abs(heart.x - Math.round(p.x)) + Math.abs(heart.y - Math.round(p.y)) >= 5, 'není hned u neuronu')

  p.x = heart.x
  p.y = heart.y
  p.dir = null
  game.update(1 / 120)
  assert.equal(game.lives, 2)
  assert.equal(game.heart, null)

  game.lives = 1
  advance(game, 1)
  assert.equal(game.heart, null, 'v jednom levelu jen jednou')
})
