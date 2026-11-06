// Herní logika hry Neuron-Man – bez kreslení a bez DOM, ať jde testovat v Node.
import type { MazeDef } from './mazes.ts'

export type Dir = 'up' | 'down' | 'left' | 'right'
export const DIR_VECTORS: Record<Dir, { x: number; y: number }> = {
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 },
}
const ALL_DIRS: Dir[] = ['up', 'left', 'down', 'right']
const OPPOSITE: Record<Dir, Dir> = { up: 'down', down: 'up', left: 'right', right: 'left' }

export const CELL_EMPTY = 0
export const CELL_WALL = 1
export const CELL_DOT = 2
export const CELL_POWER = 3

export const POINTS_DOT = 10
export const POINTS_POWER = 50
export const POINTS_CATCH = 200
export const POWER_SECONDS = 6
export const START_LIVES = 3

/** Náročnost levelů: rychlost v políčkách za sekundu a za kolik sekund se která příšerka rozběhne */
export interface LevelConfig {
  playerSpeed: number
  ghostSpeed: number
  release: number[]
}

export const LEVELS: LevelConfig[] = [
  { playerSpeed: 5.2, ghostSpeed: 3.8, release: [0.5, 3, 6, 9] },
  { playerSpeed: 5.4, ghostSpeed: 4.6, release: [0.5, 2, 4, 6] },
  { playerSpeed: 5.6, ghostSpeed: 5.3, release: [0.3, 1.2, 2.4, 3.6] },
]
const FRIGHTENED_FACTOR = 0.55
const READY_SECONDS = 1.6
const DYING_SECONDS = 1.3
const LEVEL_DONE_SECONDS = 1.8
const GHOST_RESPAWN_SECONDS = 2
const HIT_DISTANCE = 0.62
const STEP = 1 / 120

// chase jde za hráčem, ambush mu nadbíhá, wander bloudí, shy honí z dálky a zblízka se plete
export type GhostKind = 'chase' | 'ambush' | 'wander' | 'shy'
const GHOST_KINDS: GhostKind[] = ['chase', 'ambush', 'wander', 'shy']
const SHY_DISTANCE = 6
/** Jak daleko za křižovatkou ještě jde zahnout – tah prstem přijde často o chvilku později */
const TURN_GRACE = 0.4
/** Srdíčko se objeví aspoň takhle daleko od neuronu (v políčkách, bez úhlopříček) */
const HEART_MIN_DISTANCE = 5

export interface Actor {
  x: number
  y: number
  dir: Dir | null
}

export interface Ghost extends Actor {
  kind: GhostKind
  startX: number
  startY: number
  wait: number
  frightened: boolean
}

export interface Player extends Actor {
  want: Dir | null
  startX: number
  startY: number
}

export type Phase = 'ready' | 'playing' | 'dying' | 'levelDone' | 'over' | 'won'

export interface ParsedMaze {
  name: string
  width: number
  height: number
  cells: Uint8Array
  player: { x: number; y: number }
  ghosts: { x: number; y: number }[]
  dots: number
}

export function parseMaze(def: MazeDef): ParsedMaze {
  const height = def.rows.length
  const width = def.rows[0].length
  const cells = new Uint8Array(width * height)
  let player = { x: 0, y: 0 }
  const ghosts: { x: number; y: number }[] = []
  let dots = 0
  def.rows.forEach((row, y) => {
    if (row.length !== width) throw new Error(`${def.name}: řádek ${y} má jinou délku`)
    for (let x = 0; x < width; x++) {
      const ch = row[x]
      const i = y * width + x
      if (ch === '#') cells[i] = CELL_WALL
      else if (ch === '.') {
        cells[i] = CELL_DOT
        dots++
      } else if (ch === 'o') cells[i] = CELL_POWER
      else if (ch === 'P') player = { x, y }
      else if (ch === 'G') ghosts.push({ x, y })
    }
  })
  return { name: def.name, width, height, cells, player, ghosts, dots }
}

export interface GameOptions {
  rng?: () => number
  /** Jen pro testy: halucinace se nehýbou */
  noGhosts?: boolean
}

export class Game {
  readonly mazes: MazeDef[]
  readonly rng: () => number
  readonly noGhosts: boolean

  levelIndex = 0
  maze!: ParsedMaze
  cells!: Uint8Array
  dotsLeft = 0
  score = 0
  lives = START_LIVES
  phase: Phase = 'ready'
  phaseTime = 0
  powerTime = 0
  paused = false
  /** Pro animace: celkový herní čas */
  clock = 0
  player!: Player
  ghosts: Ghost[] = []
  /** Srdíčko k sebrání – objeví se na posledním životě, nejvýš jednou za level */
  heart: { x: number; y: number } | null = null
  private heartSpawned = false
  /** Zvyšuje se při každé změně skóre, životů nebo fáze – podle toho se překresluje horní lišta */
  version = 0

  constructor(mazes: MazeDef[], options: GameOptions = {}) {
    this.mazes = mazes
    this.rng = options.rng ?? Math.random
    this.noGhosts = options.noGhosts ?? false
    this.loadLevel(0)
  }

  get level(): LevelConfig {
    return LEVELS[Math.min(this.levelIndex, LEVELS.length - 1)]
  }

  get levelName(): string {
    return this.maze.name
  }

  get isLastLevel(): boolean {
    return this.levelIndex === this.mazes.length - 1
  }

  /** Zbývající sekundy ověřeného zdroje, 0 = neaktivní */
  get powerLeft(): number {
    return this.powerTime
  }

  private bump() {
    this.version++
  }

  loadLevel(index: number) {
    this.levelIndex = index
    this.maze = parseMaze(this.mazes[index])
    this.cells = this.maze.cells.slice()
    this.dotsLeft = this.maze.dots
    this.heart = null
    this.heartSpawned = false
    this.resetActors()
    this.setPhase('ready')
  }

  private resetActors() {
    const p = this.maze.player
    this.player = { x: p.x, y: p.y, dir: null, want: null, startX: p.x, startY: p.y }
    this.ghosts = this.maze.ghosts.map((g, i) => ({
      x: g.x,
      y: g.y,
      dir: null,
      kind: GHOST_KINDS[i % GHOST_KINDS.length],
      startX: g.x,
      startY: g.y,
      wait: this.level.release[i] ?? 0,
      frightened: false,
    }))
    this.powerTime = 0
  }

  private setPhase(phase: Phase) {
    this.phase = phase
    this.phaseTime = 0
    this.bump()
  }

  isWall(x: number, y: number): boolean {
    if (x < 0 || y < 0 || x >= this.maze.width || y >= this.maze.height) return true
    return this.cells[y * this.maze.width + x] === CELL_WALL
  }

  canGo(x: number, y: number, dir: Dir): boolean {
    const v = DIR_VECTORS[dir]
    return !this.isWall(x + v.x, y + v.y)
  }

  setWant(dir: Dir) {
    this.player.want = dir
  }

  setPaused(paused: boolean) {
    if (this.paused === paused) return
    if (this.phase === 'over' || this.phase === 'won') return
    this.paused = paused
    this.bump()
  }

  get finished(): boolean {
    return this.phase === 'over' || this.phase === 'won'
  }

  update(dt: number) {
    if (this.paused || this.finished) return
    let left = Math.min(dt, 0.1)
    while (left > 1e-9) {
      const step = Math.min(STEP, left)
      this.tick(step)
      left -= step
      if (this.finished) break
    }
  }

  private tick(dt: number) {
    this.clock += dt
    this.phaseTime += dt
    switch (this.phase) {
      case 'ready':
        if (this.phaseTime >= READY_SECONDS) this.setPhase('playing')
        return
      case 'dying':
        if (this.phaseTime >= DYING_SECONDS) {
          if (this.lives <= 0) this.setPhase('over')
          else {
            this.resetActors()
            this.setPhase('ready')
          }
        }
        return
      case 'levelDone':
        if (this.phaseTime >= LEVEL_DONE_SECONDS) {
          if (this.isLastLevel) this.setPhase('won')
          else this.loadLevel(this.levelIndex + 1)
        }
        return
      case 'playing':
        this.tickPlaying(dt)
    }
  }

  private tickPlaying(dt: number) {
    if (this.powerTime > 0) {
      this.powerTime = Math.max(0, this.powerTime - dt)
      if (this.powerTime === 0) for (const g of this.ghosts) g.frightened = false
    }

    if (this.lives === 1 && !this.heartSpawned) this.spawnHeart()

    this.movePlayer(this.level.playerSpeed * dt)
    this.eat()
    if (this.dotsLeft === 0) {
      this.setPhase('levelDone')
      return
    }

    if (!this.noGhosts) {
      for (const g of this.ghosts) {
        if (g.wait > 0) {
          g.wait = Math.max(0, g.wait - dt)
          continue
        }
        const speed = this.level.ghostSpeed * (g.frightened ? FRIGHTENED_FACTOR : 1)
        this.moveGhost(g, speed * dt)
      }
      this.checkCollisions()
    }
  }

  /** Srdíčko dáme přednostně na už vysbírané políčko kus od neuronu, mimo starty postav a ověřené zdroje. */
  private spawnHeart() {
    this.heartSpawned = true
    const { width, height } = this.maze
    const px = Math.round(this.player.x)
    const py = Math.round(this.player.y)
    const starts = new Set([this.maze.player, ...this.maze.ghosts].map((s) => s.y * width + s.x))
    const empty: number[] = []
    const dots: number[] = []
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const i = y * width + x
        if (starts.has(i) || Math.abs(x - px) + Math.abs(y - py) < HEART_MIN_DISTANCE) continue
        if (this.cells[i] === CELL_EMPTY) empty.push(i)
        else if (this.cells[i] === CELL_DOT) dots.push(i)
      }
    }
    const pool = empty.length ? empty : dots
    if (!pool.length) return
    const i = pool[Math.floor(this.rng() * pool.length)]
    this.heart = { x: i % width, y: Math.floor(i / width) }
    this.bump()
  }

  private eat() {
    const x = Math.round(this.player.x)
    const y = Math.round(this.player.y)
    if (this.heart && this.heart.x === x && this.heart.y === y) {
      this.heart = null
      this.lives = Math.min(START_LIVES, this.lives + 1)
      this.bump()
    }
    const i = y * this.maze.width + x
    const cell = this.cells[i]
    if (cell === CELL_DOT) {
      this.cells[i] = CELL_EMPTY
      this.dotsLeft--
      this.score += POINTS_DOT
      this.bump()
    } else if (cell === CELL_POWER) {
      this.cells[i] = CELL_EMPTY
      this.score += POINTS_POWER
      this.powerTime = POWER_SECONDS
      for (const g of this.ghosts) g.frightened = true
      this.bump()
    }
  }

  private checkCollisions() {
    for (const g of this.ghosts) {
      const dist = Math.hypot(g.x - this.player.x, g.y - this.player.y)
      if (dist > HIT_DISTANCE) continue
      if (g.frightened) {
        this.score += POINTS_CATCH
        g.x = g.startX
        g.y = g.startY
        g.dir = null
        g.frightened = false
        g.wait = GHOST_RESPAWN_SECONDS
        this.bump()
      } else {
        this.lives--
        this.setPhase('dying')
        return
      }
    }
  }

  /** Posune postavu o `dist` políček. Na středu políčka volá `choose` pro nový směr. */
  private moveActor(actor: Actor, dist: number, choose: (x: number, y: number) => Dir | null, canReverse: Dir | null) {
    let left = dist
    let guard = 0
    while (left > 1e-9 && guard++ < 8) {
      const atCenter = Math.abs(actor.x - Math.round(actor.x)) < 1e-6 && Math.abs(actor.y - Math.round(actor.y)) < 1e-6
      if (atCenter) {
        actor.x = Math.round(actor.x)
        actor.y = Math.round(actor.y)
        const next = choose(actor.x, actor.y)
        actor.dir = next
        if (!next) return
        const v = DIR_VECTORS[next]
        const move = Math.min(left, 1)
        actor.x += v.x * move
        actor.y += v.y * move
        left -= move
        this.snap(actor)
        continue
      }
      if (!actor.dir) {
        this.snap(actor, true)
        continue
      }
      if (canReverse && canReverse === OPPOSITE[actor.dir]) actor.dir = canReverse
      const v = DIR_VECTORS[actor.dir]
      // vzdálenost k nejbližšímu středu políčka ve směru pohybu
      const pos = v.x !== 0 ? actor.x : actor.y
      const dirSign = v.x !== 0 ? v.x : v.y
      const target = dirSign > 0 ? Math.floor(pos + 1e-9) + 1 : Math.ceil(pos - 1e-9) - 1
      const toCenter = Math.abs(target - pos)
      const move = Math.min(left, toCenter)
      actor.x += v.x * move
      actor.y += v.y * move
      left -= move
      this.snap(actor)
    }
  }

  private snap(actor: Actor, force = false) {
    const rx = Math.round(actor.x)
    const ry = Math.round(actor.y)
    if (force || (Math.abs(actor.x - rx) < 1e-6 && Math.abs(actor.y - ry) < 1e-6)) {
      actor.x = rx
      actor.y = ry
    }
  }

  private movePlayer(dist: number) {
    const p = this.player
    // Odbočka těsně za křižovatkou: neuron se vrátí na její střed a zbytek dráhy už jde novým směrem
    if (p.want && p.dir && p.want !== p.dir && p.want !== OPPOSITE[p.dir]) {
      const cx = Math.round(p.x)
      const cy = Math.round(p.y)
      const off = Math.abs(p.x - cx) + Math.abs(p.y - cy)
      const v = DIR_VECTORS[p.dir]
      const passed = (p.x - cx) * v.x + (p.y - cy) * v.y > 0
      if (off > 1e-6 && off <= TURN_GRACE && passed && this.canGo(cx, cy, p.want)) {
        const w = DIR_VECTORS[p.want]
        p.x = cx + w.x * off
        p.y = cy + w.y * off
        p.dir = p.want
      }
    }
    this.moveActor(
      p,
      dist,
      (x, y) => {
        if (p.want && this.canGo(x, y, p.want)) return p.want
        if (p.dir && this.canGo(x, y, p.dir)) return p.dir
        return null
      },
      p.want,
    )
  }

  private moveGhost(g: Ghost, dist: number) {
    this.moveActor(g, dist, (x, y) => this.chooseGhostDir(g, x, y), null)
  }

  private chooseGhostDir(g: Ghost, x: number, y: number): Dir | null {
    let options = ALL_DIRS.filter((d) => this.canGo(x, y, d))
    if (g.dir && options.length > 1) options = options.filter((d) => d !== OPPOSITE[g.dir!])
    if (options.length === 0) return null
    if (options.length === 1) return options[0]

    const far = Math.hypot(x - this.player.x, y - this.player.y) > SHY_DISTANCE
    if (g.frightened || g.kind === 'wander' || (g.kind === 'shy' && !far)) {
      if (g.frightened) {
        // Vystrašená halucinace utíká – vybírá směr, který ji vzdálí od neuronu
        return this.pickByTarget(options, x, y, this.player.x, this.player.y, true)
      }
      return options[Math.floor(this.rng() * options.length)]
    }

    let tx = this.player.x
    let ty = this.player.y
    if (g.kind === 'ambush' && this.player.dir) {
      const v = DIR_VECTORS[this.player.dir]
      tx += v.x * 4
      ty += v.y * 4
    }
    return this.pickByTarget(options, x, y, tx, ty, false)
  }

  private pickByTarget(options: Dir[], x: number, y: number, tx: number, ty: number, flee: boolean): Dir {
    let best = options[0]
    let bestScore = flee ? -Infinity : Infinity
    for (const d of options) {
      const v = DIR_VECTORS[d]
      const dx = x + v.x - tx
      const dy = y + v.y - ty
      const score = dx * dx + dy * dy
      if (flee ? score > bestScore : score < bestScore) {
        best = d
        bestScore = score
      }
    }
    return best
  }
}
