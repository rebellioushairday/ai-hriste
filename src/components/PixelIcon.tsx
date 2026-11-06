import type { CSSProperties } from 'react'

// Ploché pixelové ikony v barvě prg.ai. Tvar se kreslí z mřížky, kde # je pixel.

const SHAPES = {
  // AI kvíz – žárovka: oblé sklo s odleskem, hrdlo a objímka se závitem
  quiz: [
    '.....######.....',
    '...##########...',
    '..############..',
    '..###..#######..',
    '..##.#########..',
    '..##.#########..',
    '..############..',
    '..############..',
    '...##########...',
    '....########....',
    '.....######.....',
    '.....######.....',
    '................',
    '.....######.....',
    '................',
    '......####......',
  ],
  // Přechytrač AI – tři překrývající se bubliny, prostřední je jen obrys
  prechytrac: [
    '.########.......',
    '##########......',
    '####............',
    '###.#########...',
    '.#.#.........#..',
    '...#.........#..',
    '...#.........#..',
    '...#............',
    '...#....#######.',
    '....##.#########',
    '.......#########',
    '.......#########',
    '.......#########',
    '........#######.',
    '.............##.',
    '..............#.',
  ],
  // Neuron-Man – kulaté tělo, jedno oko mrká, úsměv, výběžky nahoru, dolů a šikmo do rohů
  neuron: [
    '##.....##.....##',
    '##.....##.....##',
    '..##...##...##..',
    '...##..##..##...',
    '....########....',
    '...##########...',
    '..###..#######..',
    '..###..##...##..',
    '..############..',
    '..###.####.###..',
    '...###....###...',
    '....########....',
    '...##..##..##...',
    '..##...##...##..',
    '##.....##.....##',
    '##.....##.....##',
  ],
} as const

export type PixelShape = keyof typeof SHAPES

/** `trim` ořízne i prázdné řádky – pro ikony mimo dlaždice her, kde nemusí mít stejnou velikost pixelu. */
export function PixelIcon({ shape, className, trim = false }: { shape: PixelShape; className?: string; trim?: boolean }) {
  const rows = SHAPES[shape]
  const cells: { x: number; y: number }[] = []
  rows.forEach((row, y) => [...row].forEach((ch, x) => ch === '#' && cells.push({ x, y })))
  // Ořízneme prázdné sloupce na okrajích, ať je postavička opravdu na středu
  const minX = Math.min(...cells.map((c) => c.x))
  const maxX = Math.max(...cells.map((c) => c.x))
  const minY = trim ? Math.min(...cells.map((c) => c.y)) : 0
  const maxY = trim ? Math.max(...cells.map((c) => c.y)) : rows.length - 1
  return (
    <svg
      className={className}
      // Výška podle počtu řádků – všechny ikony tak mají stejně velký pixel
      style={{ '--rows': rows.length } as CSSProperties}
      viewBox={`${minX} ${minY} ${maxX - minX + 1} ${maxY - minY + 1}`}
      aria-hidden="true"
      shapeRendering="crispEdges"
      fill="currentColor"
    >
      {cells.map(({ x, y }) => (
        <rect key={`${x}-${y}`} x={x} y={y} width="1.02" height="1.02" />
      ))}
    </svg>
  )
}
