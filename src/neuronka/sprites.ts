// Pixelové postavy hry Neuron-Man, 16 × 16 pixelů na jedno políčko bludiště.
// Znaky: . průhledné, X tělo (barva postavy), W bílá, K tmavá (zorničky, pusa)
// Příšerky jsou vlastní návrh – schválně se nepodobají postavám z žádné existující hry.

export type Sprite = readonly string[]

/** Neuron-Man – stejný jako na rozcestníku. Druhý snímek je zrcadlový, takže střídavě mrká. */
const NEURON_A: Sprite = [
  'XX.....XX.....XX',
  'XX.....XX.....XX',
  '..XX...XX...XX..',
  '...XX..XX..XX...',
  '....XXXXXXXX....',
  '...XXXXXXXXXX...',
  '..XXX..XXXXXXX..',
  '..XXX..XX...XX..',
  '..XXXXXXXXXXXX..',
  '..XXX.XXXX.XXX..',
  '...XXX....XXX...',
  '....XXXXXXXX....',
  '...XX..XX..XX...',
  '..XX...XX...XX..',
  'XX.....XX.....XX',
  'XX.....XX.....XX',
]
const mirror = (s: Sprite): Sprite => s.map((row) => [...row].reverse().join(''))
export const NEURON: Sprite[] = [NEURON_A, mirror(NEURON_A)]

/** Příšerka 1 – rohatá, jedno velké oko, zuby, cupitá nožkama */
const HORNED_TOP: Sprite = [
  '..X..........X..',
  '..XX........XX..',
  '...XX......XX...',
  '....XXXXXXXX....',
  '...XXXXXXXXXX...',
  '..XXXXWWWWXXXX..',
  '..XXXWWWWWWXXX..',
  '.XXXXWWKKWWXXXX.',
  '.XXXXWWKKWWXXXX.',
  '.XXXXXWWWWXXXXX.',
  '.XXXXXXXXXXXXXX.',
  '.XXXWXWXWXWXXXX.',
  '.XXXXXXXXXXXXXX.',
  '..XXXXXXXXXXXX..',
]
export const HORNED: Sprite[] = [
  [...HORNED_TOP, '...XX......XX...', '..XXX......XXX..'],
  [...HORNED_TOP, '....XX....XX....', '...XXX....XXX...'],
]

/** Příšerka 2 – hranatý pavouk s anténou, rozpaženýma rukama a pusou do cik-cak */
const SPIDER_TOP: Sprite = [
  '.......X........',
  '......XXX.......',
  '.......X........',
  '...XXXXXXXXXX...',
  '..XXXXXXXXXXXX..',
  '..XXWWXXXXWWXX..',
  '..XXWKXXXXWKXX..',
  '..XXXXXXXXXXXX..',
  'XXXXXXXXXXXXXXXX',
  '..XXWXWXWXWXXX..',
  '..XXXWXWXWXWXX..',
  '..XXXXXXXXXXXX..',
  '...XXXXXXXXXX...',
]
export const SPIDER: Sprite[] = [
  [...SPIDER_TOP, '...X..X..X..X...', '..X...X..X...X..', '..X...X..X...X..'],
  [...SPIDER_TOP, '...X..X..X..X...', '...X..X..X..X...', '..X..X....X..X..'],
]

/** Příšerka 3 – sliz s okem na stopce, kape */
const SLIME_TOP: Sprite = [
  '.....XXXXXX.....',
  '....XWWWWWWX....',
  '....XWWKKWWX....',
  '....XWWKKWWX....',
  '.....XXXXXX.....',
  '.......XX.......',
  '....XXXXXXXX....',
  '..XXXXXXXXXXXX..',
  '.XXXXXXXXXXXXXX.',
  '.XXXKXXXXXXKXXX.',
  'XXXXXKKKKKKXXXXX',
  'XXXXXXXXXXXXXXXX',
  'XXXXXXXXXXXXXXXX',
  '.XXXXXXXXXXXXXX.',
]
export const SLIME: Sprite[] = [
  [...SLIME_TOP, '.X...X....X...X.', '.X........X.....'],
  [...SLIME_TOP, '...X....X....X..', '........X.......'],
]

/** Příšerka 4 – netopýrek s tesáky, mává křídly */
export const BAT: Sprite[] = [
  [
    '................',
    '................',
    'X..............X',
    'XX............XX',
    'XXX...XXXX...XXX',
    'XXXX.XXXXXX.XXXX',
    'XXXXXXXXXXXXXXXX',
    '.XXXXWWXXWWXXXX.',
    '..XXXWKXXKWXXX..',
    '...XXXXXXXXXX...',
    '....XWXXXXWX....',
    '.....XXXXXX.....',
    '......X..X......',
    '................',
    '................',
    '................',
  ],
  [
    '................',
    '................',
    '................',
    '................',
    '......XXXX......',
    '.....XXXXXX.....',
    'XXXXXXXXXXXXXXXX',
    'XXXXXWWXXWWXXXXX',
    'XXXXXWKXXKWXXXXX',
    'XX.XXXXXXXXXX.XX',
    'X...XWXXXXWX...X',
    '.....XXXXXX.....',
    '......X..X......',
    '................',
    '................',
    '................',
  ],
]

export const MONSTERS: Sprite[][] = [HORNED, SPIDER, SLIME, BAT]

/** Ověřený zdroj – odznak s fajfkou */
export const BADGE: Sprite = [
  '....XXXX....',
  '..XXXXXXXX..',
  '.XXXXXXXXXX.',
  '.XXXXXXXXWX.',
  'XXXXXXXXWWXX',
  'XXWXXXXWWXXX',
  'XXWWXXWWXXXX',
  'XXXWWWWXXXXX',
  '.XXXWWXXXXX.',
  '.XXXXXXXXXX.',
  '..XXXXXXXX..',
  '....XXXX....',
]

/** Srdíčko – život navíc, objeví se na posledním životě */
export const HEART: Sprite = [
  '.XXX....XXX.',
  'XXXXX..XXXXX',
  'XXXXXXXXXXXX',
  'XWWXXXXXXXXX',
  'XWXXXXXXXXXX',
  'XXXXXXXXXXXX',
  '.XXXXXXXXXX.',
  '..XXXXXXXX..',
  '...XXXXXX...',
  '....XXXX....',
  '.....XX.....',
]

export interface Palette {
  X: string
  W: string
  K: string
}

/** Vykreslí sprite do 2D kontextu, levý horní roh na (x, y), jeden znak = jeden pixel. */
export function drawSprite(ctx: CanvasRenderingContext2D, sprite: Sprite, x: number, y: number, palette: Palette) {
  for (let r = 0; r < sprite.length; r++) {
    const row = sprite[r]
    for (let c = 0; c < row.length; c++) {
      const ch = row[c] as keyof Palette | '.'
      if (ch === '.') continue
      ctx.fillStyle = palette[ch]
      ctx.fillRect(x + c, y + r, 1, 1)
    }
  }
}
