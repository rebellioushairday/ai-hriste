export type Rng = () => number

/** Zamíchá kopii pole (Fisher–Yates). */
export function shuffle<T>(items: readonly T[], rng: Rng = Math.random): T[] {
  const out = items.slice()
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1))
    ;[out[i], out[j]] = [out[j], out[i]]
  }
  return out
}

/**
 * Balíček karet: položky se berou v zamíchaném pořadí a žádná se nezopakuje,
 * dokud se neprojde celá sada. Pak se balíček znovu zamíchá.
 */
export class Deck<T extends { id: string }> {
  private queue: T[] = []
  private readonly items: readonly T[]
  private readonly rng: Rng

  constructor(items: readonly T[], rng: Rng = Math.random) {
    this.items = items
    this.rng = rng
  }

  draw(count: number): T[] {
    const n = Math.min(count, this.items.length)
    const hand: T[] = []
    while (hand.length < n) {
      if (this.queue.length === 0) {
        // Nové zamíchání – bez karet, které už jsou v téhle hře
        const inHand = new Set(hand.map((h) => h.id))
        this.queue = shuffle(
          this.items.filter((i) => !inHand.has(i.id)),
          this.rng,
        )
      }
      hand.push(this.queue.shift()!)
    }
    return hand
  }
}

export interface ResultBand {
  minShare: number
  title: string
  text: string
}

/** Vrátí hodnocení s nejvyšším `minShare`, kterého hráč dosáhl. */
export function resultFor<T extends ResultBand>(bands: readonly T[], score: number, total: number): T {
  const share = total > 0 ? score / total : 0
  const sorted = bands.slice().sort((a, b) => a.minShare - b.minShare)
  let best = sorted[0]
  for (const band of sorted) if (share >= band.minShare - 1e-9) best = band
  return best
}
