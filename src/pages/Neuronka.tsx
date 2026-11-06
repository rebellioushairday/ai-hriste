import { useCallback, useEffect, useRef, useState } from 'react'
import type { PointerEvent as ReactPointerEvent } from 'react'
import { Game, POINTS_CATCH, POINTS_DOT, POWER_SECONDS, START_LIVES } from '../neuronka/engine.ts'
import type { Dir, Phase } from '../neuronka/engine.ts'
import { MAZES } from '../neuronka/mazes.ts'
import { COLORS, Renderer, TILE } from '../neuronka/render.ts'
import { BADGE, MONSTERS } from '../neuronka/sprites.ts'
import type { Sprite } from '../neuronka/sprites.ts'
import { GameIntro, Header, Page } from '../components/ui.tsx'
import { NEURON_MAN_INFO } from '../gameInfo.ts'
import { Link } from '../router.tsx'

const BEST_KEY = 'prgai-neuronka-best'

function readBest(): number {
  try {
    return Number(window.localStorage.getItem(BEST_KEY)) || 0
  } catch {
    return 0
  }
}

function writeBest(score: number) {
  try {
    window.localStorage.setItem(BEST_KEY, String(score))
  } catch {
    // Úložiště není dostupné, například v anonymním okně – nevadí
  }
}

type Screen = 'intro' | 'play' | 'end'

interface EndState {
  score: number
  best: number
  isRecord: boolean
  won: boolean
}

export default function Neuronka() {
  const [screen, setScreen] = useState<Screen>('intro')
  const [best, setBest] = useState(readBest)
  const [end, setEnd] = useState<EndState | null>(null)
  const [round, setRound] = useState(0)

  const start = () => {
    setRound((r) => r + 1)
    setScreen('play')
  }

  const finish = useCallback((score: number, won: boolean) => {
    const previous = readBest()
    const isRecord = score > previous
    if (isRecord) writeBest(score)
    const newBest = Math.max(previous, score)
    setBest(newBest)
    setEnd({ score, best: newBest, isRecord, won })
    setScreen('end')
  }, [])

  if (screen === 'play') return <Play key={round} onFinish={finish} />

  if (screen === 'end' && end) {
    return (
      <Page className="game">
        <p className="eyebrow">Neuron-Man</p>
        <h1 tabIndex={-1}>{end.won ? 'Prošli jste všechny levely' : 'Konec hry'}</h1>
        <p className="big-score">
          <span className="big-score__value">{end.score.toLocaleString('cs-CZ')}</span>
          <span className="big-score__label">{end.isRecord && end.score > 0 ? 'bodů – váš nový rekord' : 'bodů'}</span>
        </p>
        <p className="lead">Nejlepší skóre na tomto zařízení: {end.best.toLocaleString('cs-CZ')}</p>
        <div className="stack">
          <button type="button" className="btn btn--primary btn--block" onClick={start}>
            Hrát znovu
          </button>
        </div>
      </Page>
    )
  }

  return (
    <Page className="game">
      <GameIntro
        game={NEURON_MAN_INFO}
        onStart={start}
        note={best > 0 ? `Nejlepší skóre na tomto zařízení: ${best.toLocaleString('cs-CZ')}` : undefined}
      >
        <ul className="legend">
          <li>
            <LegendIcon kind="dot" />
            <span>Soubor dat, každý za {POINTS_DOT} bodů. Posbírejte všechny a postoupíte do dalšího levelu.</span>
          </li>
          <li>
            <LegendIcon kind="ghost" />
            <span>Příšerky jsou halucinace. Když vás chytí, přijdete o život. Máte tři.</span>
          </li>
          <li>
            <LegendIcon kind="power" />
            <span>
              Ověřený zdroj vám dá {POWER_SECONDS} sekund, kdy můžete halucinace chytat. Každá je za {POINTS_CATCH} bodů.
            </span>
          </li>
          <li>
            <LegendIcon kind="swipe" />
            <span>Ovládání: táhněte prstem kamkoli po hrací ploše, nebo použijte šipky na klávesnici.</span>
          </li>
        </ul>
      </GameIntro>
    </Page>
  )
}

/** Ovládání – čtyři pixelové šipky kolem prstu uprostřed */
const ARROWS: Sprite = [
  '......XX......',
  '.....XXXX.....',
  '....XXXXXX....',
  '..............',
  '..X........X..',
  '.XX........XX.',
  'XXX...XX...XXX',
  'XXX...XX...XXX',
  '.XX........XX.',
  '..X........X..',
  '..............',
  '....XXXXXX....',
  '.....XXXX.....',
  '......XX......',
]

/** Pixelová ikona do legendy – stejné postavy jako ve hře. Všechny mají stejně velký pixel, uprostřed stejného místa. */
function SpriteIcon({ sprite, color }: { sprite: Sprite; color: string }) {
  const palette: Record<string, string> = { X: color, W: '#ffffff', K: COLORS.ink }
  const cols = sprite[0].length
  const rows = sprite.length
  return (
    <span className="legend__icon">
      <svg
        className="legend__sprite"
        style={{ width: `calc(${cols} * var(--legend-pixel))`, height: `calc(${rows} * var(--legend-pixel))` }}
        viewBox={`0 0 ${cols} ${rows}`}
        aria-hidden="true"
        shapeRendering="crispEdges"
      >
        {sprite.flatMap((row, y) =>
          [...row].map((ch, x) => (ch === '.' ? null : <rect key={`${x}-${y}`} x={x} y={y} width="1.02" height="1.02" fill={palette[ch]} />)),
        )}
      </svg>
    </span>
  )
}

function LegendIcon({ kind }: { kind: 'dot' | 'power' | 'ghost' | 'swipe' }) {
  if (kind === 'power') return <SpriteIcon sprite={BADGE} color={COLORS.badge} />
  // V pravidlech je příšerka modrá jako ostatní ikony – ve hře má svou barvu
  if (kind === 'ghost') return <SpriteIcon sprite={MONSTERS[0][0]} color={COLORS.badge} />
  if (kind === 'swipe') return <SpriteIcon sprite={ARROWS} color={COLORS.neuron} />
  return (
    <svg className="legend__icon" viewBox="0 0 40 40" aria-hidden="true" shapeRendering="crispEdges">
      <g fill="var(--color-brand)">
        <rect x="6" y="18" width="4" height="4" />
        <rect x="17" y="17" width="6" height="6" />
        <rect x="29" y="18" width="5" height="5" />
      </g>
    </svg>
  )
}

const KEY_DIRS: Record<string, Dir> = {
  ArrowUp: 'up',
  ArrowDown: 'down',
  ArrowLeft: 'left',
  ArrowRight: 'right',
  w: 'up',
  s: 'down',
  a: 'left',
  d: 'right',
  W: 'up',
  S: 'down',
  A: 'left',
  D: 'right',
}

interface Hud {
  score: number
  lives: number
  level: string
  levelNumber: number
  phase: Phase
  paused: boolean
}

function hudOf(game: Game): Hud {
  return {
    score: game.score,
    lives: game.lives,
    level: game.levelName,
    levelNumber: game.levelIndex + 1,
    phase: game.phase,
    paused: game.paused,
  }
}

function Play({ onFinish }: { onFinish: (score: number, won: boolean) => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const boardRef = useRef<HTMLDivElement>(null)
  const gameRef = useRef<Game | null>(null)
  if (!gameRef.current) gameRef.current = new Game(MAZES)
  const [hud, setHud] = useState<Hud>(() => hudOf(gameRef.current!))

  const setPaused = useCallback((paused: boolean) => {
    gameRef.current?.setPaused(paused)
  }, [])

  // Herní smyčka a kreslení
  useEffect(() => {
    const game = gameRef.current!
    const canvas = canvasRef.current!
    const board = boardRef.current!
    const renderer = new Renderer(canvas)
    let raf = 0
    let last = performance.now()
    let version = -1
    let done = false

    const fit = () => {
      const { width, height } = game.maze
      const rect = board.getBoundingClientRect()
      const scale = Math.min(rect.width / (width * TILE), rect.height / (height * TILE))
      renderer.resize(game, Math.floor(width * TILE * scale), Math.floor(height * TILE * scale))
    }
    fit()
    const observer = new ResizeObserver(fit)
    observer.observe(board)

    const frame = (now: number) => {
      const dt = (now - last) / 1000
      last = now
      game.update(dt)
      renderer.draw(game, now / 1000)
      if (game.version !== version) {
        version = game.version
        setHud(hudOf(game))
      }
      if (game.finished && !done) {
        done = true
        const won = game.phase === 'won'
        window.setTimeout(() => onFinish(game.score, won), won ? 300 : 600)
      }
      raf = requestAnimationFrame(frame)
    }
    raf = requestAnimationFrame(frame)

    return () => {
      cancelAnimationFrame(raf)
      observer.disconnect()
    }
  }, [onFinish])

  // Klávesnice
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const game = gameRef.current!
      const dir = KEY_DIRS[e.key]
      if (dir) {
        e.preventDefault()
        if (game.paused) return
        game.setWant(dir)
        return
      }
      if (e.key === 'p' || e.key === 'P' || e.key === 'Escape' || e.key === ' ') {
        if (e.key === ' ' && (e.target as HTMLElement)?.tagName === 'BUTTON') return
        e.preventDefault()
        game.setPaused(!game.paused)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  // Pauza při přepnutí karty nebo aplikace
  useEffect(() => {
    const pause = () => setPaused(true)
    const onVisibility = () => {
      if (document.visibilityState === 'hidden') pause()
    }
    document.addEventListener('visibilitychange', onVisibility)
    window.addEventListener('blur', pause)
    window.addEventListener('pagehide', pause)
    return () => {
      document.removeEventListener('visibilitychange', onVisibility)
      window.removeEventListener('blur', pause)
      window.removeEventListener('pagehide', pause)
    }
  }, [setPaused])

  // Během hry se stránka neposouvá ani nepřibližuje
  useEffect(() => {
    const root = document.documentElement
    root.classList.add('is-playing')
    const block = (e: Event) => e.preventDefault()
    const onTouchMove = (e: TouchEvent) => {
      if (e.cancelable) e.preventDefault()
    }
    document.addEventListener('touchmove', onTouchMove, { passive: false })
    document.addEventListener('gesturestart', block)
    document.addEventListener('dblclick', block)
    window.scrollTo(0, 0)
    return () => {
      root.classList.remove('is-playing')
      document.removeEventListener('touchmove', onTouchMove)
      document.removeEventListener('gesturestart', block)
      document.removeEventListener('dblclick', block)
    }
  }, [])

  // Tažení prstem kdekoli na hrací ploše
  const SWIPE_MIN = 10
  const SWIPE_DOMINANCE = 1.3
  const swipe = useRef<{ id: number; x: number; y: number } | null>(null)
  const onPointerDown = (e: ReactPointerEvent) => {
    if ((e.target as HTMLElement).closest('button, a')) return
    swipe.current = { id: e.pointerId, x: e.clientX, y: e.clientY }
    ;(e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId)
  }
  const onPointerMove = (e: ReactPointerEvent) => {
    const s = swipe.current
    const game = gameRef.current!
    if (!s || s.id !== e.pointerId || game.paused) return
    const dx = e.clientX - s.x
    const dy = e.clientY - s.y
    const major = Math.max(Math.abs(dx), Math.abs(dy))
    const minor = Math.min(Math.abs(dx), Math.abs(dy))
    // Stačí krátký tah, ať hra reaguje i na rychlé švihnutí
    if (major < SWIPE_MIN) return
    // Šikmý pohyb je nejednoznačný – počkáme, až jedna osa jasně převáží, jinak by stočení prstu přepsalo směr
    if (major < minor * SWIPE_DOMINANCE) {
      if (major > SWIPE_MIN * 3) swipe.current = { id: e.pointerId, x: e.clientX, y: e.clientY }
      return
    }
    const dir: Dir = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : dy > 0 ? 'down' : 'up'
    game.setWant(dir)
    // Další tažení se měří od aktuálního místa, takže jde zatáčet bez zvednutí prstu
    swipe.current = { id: e.pointerId, x: e.clientX, y: e.clientY }
  }
  const onPointerUp = (e: ReactPointerEvent) => {
    if (swipe.current?.id === e.pointerId) swipe.current = null
  }

  const overlay = hud.paused ? (
    <div className="nk-overlay" role="dialog" aria-modal="true" aria-labelledby="nk-paused">
      <p id="nk-paused" className="nk-overlay__title">
        Pauza
      </p>
      <button type="button" className="btn btn--primary btn--block" onClick={() => setPaused(false)} autoFocus>
        Pokračovat
      </button>
      <Link href="/" className="btn btn--ghost btn--block nk-overlay__ghost">
        Ukončit hru
      </Link>
    </div>
  ) : hud.phase === 'ready' ? (
    <div className="nk-overlay nk-overlay--soft" aria-live="polite">
      <p className="nk-overlay__eyebrow">
        Připravte se
      </p>
      <p className="nk-overlay__title">{hud.level}</p>
    </div>
  ) : hud.phase === 'levelDone' ? (
    <div className="nk-overlay nk-overlay--soft" aria-live="polite">
      <p className="nk-overlay__title">Všechna data posbíraná</p>
    </div>
  ) : null

  return (
    <div className="nk" onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={onPointerUp} onPointerCancel={onPointerUp}>
      <Header compact />
      <div className="nk-hud">
        <div className="nk-hud__item">
          <span className="nk-hud__label">Skóre</span>
          <span className="nk-hud__value" aria-live="off">
            {hud.score.toLocaleString('cs-CZ')}
          </span>
        </div>
        <div className="nk-hud__item">
          <span className="nk-hud__label">Životy</span>
          <span className="nk-hud__lives" aria-label={`${hud.lives} z ${START_LIVES}`}>
            {Array.from({ length: START_LIVES }, (_, i) => (
              <span key={i} className={'nk-life' + (i < hud.lives ? '' : ' is-lost')} />
            ))}
          </span>
        </div>
        <div className="nk-hud__item nk-hud__item--level">
          <span className="nk-hud__label">Level</span>
          <span className="nk-hud__value">
            {hud.levelNumber} / {MAZES.length}
          </span>
        </div>
        <button
          type="button"
          className="nk-pause"
          onClick={() => setPaused(!hud.paused)}
          aria-label={hud.paused ? 'Pokračovat' : 'Pauza'}
        >
          {hud.paused ? (
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M8 5l11 7-11 7z" fill="currentColor" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <rect x="6" y="5" width="4" height="14" rx="1.5" fill="currentColor" />
              <rect x="14" y="5" width="4" height="14" rx="1.5" fill="currentColor" />
            </svg>
          )}
        </button>
      </div>

      <div className="nk-board" ref={boardRef}>
        <canvas ref={canvasRef} className="nk-canvas" aria-label="Hrací plocha" role="img" />
        {overlay}
      </div>
      <p className="nk-hint">Táhněte prstem kamkoli po ploše · šipky na klávesnici</p>
    </div>
  )
}
