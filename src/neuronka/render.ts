// Kreslení hry Neuron-Man ve stylu starých automatů: nízké rozlišení (16 px na políčko),
// pixelové postavy se dvěma snímky animace a zvětšení bez vyhlazování.
import { CELL_DOT, CELL_POWER, CELL_WALL } from './engine.ts'
import type { Game, Ghost } from './engine.ts'
import { BADGE, HEART, MONSTERS, NEURON, drawSprite } from './sprites.ts'
import type { Palette, Sprite } from './sprites.ts'

export const TILE = 16

// Barvy hry – měňte jen tady
export const COLORS = {
  background: '#ffffff',
  wallFill: '#eef0fc',
  wallEdge: '#3a50dd',
  dot: '#3a50dd',
  badge: '#3a50dd',
  heart: '#e94444',
  neuron: '#3a50dd',
  ink: '#121526',
  monsters: ['#e94444', '#222849', '#7c829f', '#f0a030'],
  debunked: '#9aa6f2',
}

const ANIM_FPS = 6

export class Renderer {
  private ctx: CanvasRenderingContext2D
  private wallLayer: HTMLCanvasElement | null = null
  private wallKey = ''
  private spriteCache = new Map<string, HTMLCanvasElement>()
  private canvas: HTMLCanvasElement

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas
    const ctx = canvas.getContext('2d')
    if (!ctx) throw new Error('Canvas není k dispozici')
    this.ctx = ctx
  }

  /** Plátno má vnitřní rozlišení bludiště, na obrazovce se zvětší na zadanou velikost. */
  resize(game: Game, cssWidth: number, cssHeight: number) {
    this.ensureSize(game)
    this.canvas.style.width = `${cssWidth}px`
    this.canvas.style.height = `${cssHeight}px`
  }

  private ensureSize(game: Game) {
    const w = game.maze.width * TILE
    const h = game.maze.height * TILE
    if (this.canvas.width !== w) this.canvas.width = w
    if (this.canvas.height !== h) this.canvas.height = h
    this.ctx.imageSmoothingEnabled = false
  }

  draw(game: Game, time: number) {
    const { ctx } = this
    const { width, height } = game.maze
    this.ensureSize(game)
    ctx.fillStyle = COLORS.background
    ctx.fillRect(0, 0, width * TILE, height * TILE)
    ctx.drawImage(this.walls(game), 0, 0)

    const blinkOn = Math.floor(time * 4) % 2 === 0
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const v = game.cells[y * width + x]
        if (game.heart && game.heart.x === x && game.heart.y === y) continue
        if (v === CELL_DOT) this.dot(x, y)
        else if (v === CELL_POWER && (blinkOn || game.phase !== 'playing')) this.badge(x, y)
      }
    }
    if (game.heart) this.heart(game.heart.x, game.heart.y, time)

    const frame = Math.floor(time * ANIM_FPS) % 2
    game.ghosts.forEach((g, i) => this.monster(g, i, game, frame, time))
    this.neuron(game, frame, time)
  }

  /** Stěny jako na automatu: světlá výplň a dvoupixelový obrys podél chodeb. Kreslí se jednou za bludiště. */
  private walls(game: Game): HTMLCanvasElement {
    const key = String(game.levelIndex)
    if (this.wallLayer && this.wallKey === key) return this.wallLayer
    const { width, height, cells } = game.maze
    const layer = this.wallLayer ?? document.createElement('canvas')
    layer.width = width * TILE
    layer.height = height * TILE
    const ctx = layer.getContext('2d')!
    ctx.clearRect(0, 0, layer.width, layer.height)
    const isWall = (x: number, y: number) => x < 0 || y < 0 || x >= width || y >= height || cells[y * width + x] === CELL_WALL
    const E = 2 // tloušťka obrysu v pixelech
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        if (!isWall(x, y)) continue
        const px = x * TILE
        const py = y * TILE
        ctx.fillStyle = COLORS.wallFill
        ctx.fillRect(px, py, TILE, TILE)
        ctx.fillStyle = COLORS.wallEdge
        const up = !isWall(x, y - 1)
        const down = !isWall(x, y + 1)
        const left = !isWall(x - 1, y)
        const right = !isWall(x + 1, y)
        if (up) ctx.fillRect(px, py, TILE, E)
        if (down) ctx.fillRect(px, py + TILE - E, TILE, E)
        if (left) ctx.fillRect(px, py, E, TILE)
        if (right) ctx.fillRect(px + TILE - E, py, E, TILE)
        // vnitřní rohy – chodba je jen šikmo
        if (!up && !left && !isWall(x - 1, y - 1)) ctx.fillRect(px, py, E, E)
        if (!up && !right && !isWall(x + 1, y - 1)) ctx.fillRect(px + TILE - E, py, E, E)
        if (!down && !left && !isWall(x - 1, y + 1)) ctx.fillRect(px, py + TILE - E, E, E)
        if (!down && !right && !isWall(x + 1, y + 1)) ctx.fillRect(px + TILE - E, py + TILE - E, E, E)
      }
    }
    this.wallLayer = layer
    this.wallKey = key
    return layer
  }

  private dot(x: number, y: number) {
    // Různě velké tečky jako v logu prg.ai: 2, 3 nebo 4 pixely
    const size = 2 + ((x * 7 + y * 13) % 3)
    const offset = Math.floor((TILE - size) / 2)
    this.ctx.fillStyle = COLORS.dot
    this.ctx.fillRect(x * TILE + offset, y * TILE + offset, size, size)
  }

  private badge(x: number, y: number) {
    const sprite = this.sprite(BADGE, { X: COLORS.badge, W: '#ffffff', K: COLORS.ink })
    this.ctx.drawImage(sprite, x * TILE + 2, y * TILE + 2)
  }

  /** Srdíčko jemně poskakuje, ať je v bludišti hned vidět */
  private heart(x: number, y: number, time: number) {
    const sprite = this.sprite(HEART, { X: COLORS.heart, W: '#ffffff', K: COLORS.ink })
    const bob = Math.floor(time * 3) % 2
    this.ctx.drawImage(sprite, x * TILE + 2, y * TILE + 3 - bob)
  }

  private neuron(game: Game, frame: number, time: number) {
    const p = game.player
    if (game.phase === 'dying') {
      // Při ztrátě života neuron bliká a pak zmizí
      if (game.phaseTime > 0.9 || Math.floor(time * 10) % 2 === 0) return
    }
    // Postava mrká jen v pohybu, stojící neuron se nemění
    const f = p.dir ? frame : 0
    const sprite = this.sprite(NEURON[f], { X: COLORS.neuron, W: '#ffffff', K: COLORS.ink })
    this.ctx.drawImage(sprite, Math.round(p.x * TILE), Math.round(p.y * TILE))
  }

  private monster(g: Ghost, index: number, game: Game, frame: number, time: number) {
    const frames = MONSTERS[index % MONSTERS.length]
    const ending = game.powerLeft > 0 && game.powerLeft < 2 && Math.floor(time * 6) % 2 === 0
    const debunked = g.frightened && !ending
    const body = debunked ? COLORS.debunked : COLORS.monsters[index % COLORS.monsters.length]
    const f = g.wait > 0 ? 0 : frame
    const sprite = this.sprite(frames[f], { X: body, W: '#ffffff', K: COLORS.ink })
    this.ctx.drawImage(sprite, Math.round(g.x * TILE), Math.round(g.y * TILE))
  }

  /** Sprite se vykreslí jednou do vlastního malého plátna a pak se jen kopíruje. */
  private sprite(sprite: Sprite, palette: Palette): HTMLCanvasElement {
    const key = sprite.join('|') + palette.X + palette.W + palette.K
    let c = this.spriteCache.get(key)
    if (!c) {
      c = document.createElement('canvas')
      c.width = sprite[0].length
      c.height = sprite.length
      drawSprite(c.getContext('2d')!, sprite, 0, 0, palette)
      this.spriteCache.set(key, c)
    }
    return c
  }
}
