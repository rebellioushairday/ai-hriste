# prg.ai Hřiště

Mobilní web pro lidi, kteří čekají u stánku prg.ai na Festivalu AI pro každého. Zadání a pravidla jsou v `CLAUDE.md`.

- `/` – rozcestník se třemi hrami a odkazy na prg.ai
- `/kviz` – AI kvíz, obsah v `kviz.json`
- `/prechytrac` – Přechytrač AI, obsah v `prechytrac.json`
- `/neuron-man` – hra Neuron-Man, bludiště v `src/neuronka/mazes.ts`. Stará adresa `/neuronka` funguje taky
- `/tablet` – obrazovka s QR kódem pro tablet u stánku

## Spuštění na počítači

```
npm install
npm run dev
```

Pak otevřete adresu, kterou vypíše terminál, obvykle http://localhost:5173. Na mobilu ve stejné Wi-Fi otevřete adresu z řádku „Network“. Server zastavíte klávesami Ctrl + C.

`npm test` ověří obsah her, výběr otázek a bludiště, včetně toho, že jdou všechna dohrát. `npm run build` připraví web do složky `dist`.

## Co kde změnit

- Odkazy a adresa webu pro QR kód: `src/links.ts`
- Barvy webu: začátek `src/styles.css`
- Barvy ve hře Neuron-Man: začátek `src/neuronka/render.ts`
- Rychlost a body v Neuron-Manovi: začátek `src/neuronka/engine.ts`

## Nasazení na Vercel

Projekt je samostatný a na názvu složky nezávisí. Nastavení buildu je v `vercel.json`.

**Přes GitHub:** nahrajte složku do repozitáře, ve Vercelu zvolte Add New → Project a repozitář importujte. Pokud je složka v repozitáři o úroveň níž, nastavte v projektu Root Directory na její název.

**Z terminálu:** ve složce spusťte `npx vercel` a pro produkci `npx vercel --prod`.

Vlastní doménu přidáte ve Vercelu v Settings → Domains. Když se změní, upravte `SITE_URL` v `src/links.ts`, jinak QR kód na tabletu povede na starou adresu.

## Složky

- `src/` – kód webu
- `public/` – soubory, které jdou na web: logo, písmo, ikona
- `brand/` – zdrojová loga a všechny řezy Sofia Pro. Na web se nenahrávají.
- `tests/` – testy
