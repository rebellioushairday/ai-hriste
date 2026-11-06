const SINGLE_LETTER = /(^|[\s(„ ])([aiouvkszAIOUVKSZ]) /g

/** Pevná mezera za jednopísmennými předložkami a spojkami, ať nezůstanou na konci řádku. Jen pro zobrazení. */
export function nbsp(text: string): string {
  // Dvakrát kvůli dvěma jednopísmenným slovům za sebou, třeba „a u každé“
  return text.replace(SINGLE_LETTER, '$1$2 ').replace(SINGLE_LETTER, '$1$2 ')
}
