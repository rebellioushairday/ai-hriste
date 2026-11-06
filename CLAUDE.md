# Rozcestník prg.ai pro Festival AI pro každého

Mobilní web na `festivalai.prg.ai` pro lidi, kteří čekají u stánku prg.ai. Festival se koná v sobotu 7. 11. 2026 od 10:00 do 17:00 na Ministerstvu průmyslu a obchodu.
Návštěvník naskenuje QR kód z tabletu, otevře rozcestník a zahraje si jednu ze tří her.

Obsah her je v `kviz.json` a `prechytrac.json`. Neměň ho bez výslovné žádosti.

## Technické zadání

- Statický web, nasazení na Vercel. Doporučení: Vite + React + TypeScript.
- Samostatný web na vlastní subdoméně a samostatný projekt na Vercelu, bez vazby na jiný web.
- Žádný backend, přihlašování, databáze, analytika ani živá AI.
- Do `localStorage` ukládej jen nejlepší skóre v Neuron-Manovi. Čtení i zápis obal do `try/catch`.
- Web navrhuj nejdřív pro mobil na výšku, od šířky 360 px. Musí fungovat i na tabletu a počítači.
- Testuj v Safari na iPhonu a v Chrome na Androidu.
- Web musí zůstat rychlý i na slabším mobilním připojení.

## Stránka `/`

1. Logo prg.ai, nadpis „Vítejte na prg.ai Hřišti“ a pod ním menším písmem „Zkraťte si čekání jednou ze tří her, zjistěte víc o umělé inteligenci a projděte si odkazy na zajímavé zdroje“. Pod logem tenká šedá linka.
2. Tři dlaždice vedle sebe, mezi kterými se přejíždí prstem. Vybraná dlaždice je uprostřed a po stranách je vidět kus sousedních. Ploché pixelové ikony 16 × 16 v modré na bílém (žárovka, tři překrývající se bubliny s prostřední jen jako obrysem, Neuron-Man):
   - AI kvíz: „Fakta, mýty i historie umělé inteligence. Jak dobře je znáte?“
   - Přechytrač AI: „AI umí znít sebejistě, a to i když si vymýšlí. Poznáte, kdy lže?“
   - Neuron-Man: „Sbírejte data a vyhýbejte se halucinacím v retro hře“
3. Pod dlaždicemi sekce „Chcete se o AI dozvědět víc?“ s kartami, které lidem dají důvod kliknout. Texty stav jen na faktech z webu prg.ai:
   - Newsletter prg.ai jako první karta, stejně velká jako ostatní, jen modrá: `https://prg.ai/#newsletter`
   - Dny AI, největší AI festival v Česku, s nadpisem „Až do 15. listopadu“: `https://dny.ai/program`
   - Elements of AI, bezplatný online kurz v češtině, vše v jednom odstavci bez štítků: `https://prg.ai/elements-of-ai/`
   - Karty jsou bez ikon a tlačítka bez šipek. Žádné stíny, flat styl s tenkým okrajem.
4. Sekce „Zajímavé odkazy“: jedna karta se seznamem odkazů s krátkým popiskem – Mapa české AI, Jak si stojíte v používání umělé inteligence? (dotazník Dnů AI), AI dětem, AI mediamonitor a Kalendář pražských AI akcí.
5. Sekce „O nás“ s kartou prg.ai. Místo tlačítka jsou v kartě malé šedé ikony v kroužcích LinkedIn, Instagram a Facebook převzaté z webu prg.ai, ať vedeme lidi rovnou na sítě. Samostatná sekce „Sledujte nás“ není.
6. Všechny odkazy měj v jednom souboru `src/links.ts`, Jan je ještě upraví.
7. Patička jen na rozcestníku: malé logo prg.ai s odkazem na web, adresa sídla bez nadpisu (prg.ai, z. s., Staroměstské náměstí 1/4, Praha, 110 00), IČO 08345091 a „© prg.ai, 2026“.

## Společné pro všechny hry

- Každá hra má úvodní obrazovku se stejnou kostrou: logo prg.ai s tenkou linkou, pixelová ikona hry, nadpis, popisek a tlačítko pro spuštění se stejným nápisem jako na rozcestníku. Texty jsou v `src/gameInfo.ts`.
- Textový odkaz „Zpátky na Hřiště“ se šipkou doleva je vždy úplně dole vlevo pod vším, nikdy nahoře, a nad ním není žádná linka.

## AI kvíz, stránka `/kviz`

- Pravidla a texty ber z `kviz.json`.
- Hra má 20 otázek (`questionsPerGame`) ze sady 50. Otázky se berou jako z balíčku karet: v náhodném pořadí a žádná se nezopakuje, dokud se neprojde celá sada. Pořadí odpovědí se míchá.
- Po odpovědi hned ukaž správnou možnost a `explanation`, pak tlačítko „Další otázka“.
- Nahoře ukazuj postup, například „3 / 15“.
- Na konci ukaž skóre „X z Y“ bez rámečku s popiskem „správných odpovědí“, text z `results`, hned pod ním malý řádek s odkazem na Elements of AI a šipkou, pak tlačítko „Hrát znovu“ a návrat na rozcestník.

## Přechytrač AI, stránka `/prechytrac`

- Pravidla a texty ber z `prechytrac.json`.
- Hra má 10 kol ze sady 40. Kola se berou jako z balíčku karet stejně jako v kvízu a v každém se zamíchá pořadí tvrzení.
- Každé kolo začíná větou „AI tvrdí tři věci. Jedna z nich je vymyšlená.“ Pod ní jsou tři karty s tvrzeními.
- Po kliknutí označ vybranou kartu, ukaž vymyšlené tvrzení a `explanation`.
- Správná odpověď znamená „Odhalili jste AI“, špatná „Tady AI vyhrála“.
- Na konci ukaž skóre „X z Y“ bez rámečku s popiskem „kol, ve kterých jste odhalili AI“, text z `results`, hned pod ním malý řádek s odkazem na newsletter a šipkou, pak tlačítko „Hrát znovu“ a návrat na rozcestník.
- Na úvodní stránce hry i na konci ukaž `note` malým písmem.

## Neuron-Man, stránka `/neuron-man`

Původní hra s pohledem shora, kreslená v `canvas`. Název i svět jsou vlastní. Nepřebírej grafiku, postavy, zvuky, názvy ani rozložení bludišť z žádné existující hry a v kódu ani textech žádnou takovou hru nejmenuj.

- Retro styl jako na automatu: nízké rozlišení 16 px na políčko, zvětšení bez vyhlazování, pixelové postavy se dvěma snímky animace, obrysové stěny bludiště. Postavy jsou v `src/neuronka/sprites.ts`.
- Hráč ovládá pixelového Neuron-Mana z rozcestníku, který při pohybu střídavě mrká.
- Cílem je posbírat všechny soubory dat v bludišti.
- Čtyři halucinace jsou vlastní pixelové příšerky: rohatá, pavouk s anténou, sliz s okem na stopce a netopýrek. První jde za hráčem, druhá mu nadbíhá, třetí bloudí, čtvrtá z dálky honí a zblízka se plete.
- Ověřený zdroj je pixelový odznak s fajfkou, který bliká. Po sebrání má hráč 6 sekund, během kterých může halucinace chytat za 200 bodů. Chycená halucinace se vrátí na start.
- Soubor dat je za 10 bodů. Hráč má 3 životy.
- Na posledním životě se v bludišti objeví červené pixelové srdíčko, nejvýš jednou za level, kus od hráče. Po sebrání vrátí jeden život. V pravidlech na úvodní obrazovce o něm nic není, je to překvapení.
- Tři levely, každý s vlastním nesymetrickým bludištěm. Každý level je těžší: příšerky jsou rychlejší a z ohrádky vyrazí dřív. V každém bludišti jsou čtyři příšerky. Navrhni je na mřížce vhodné pro mobil na výšku a ověř, že jsou všechny body dosažitelné.
- Po posledním levelu hra skončí.
- Ovládání: tažení prstem kdekoli na hrací ploše a šipky na klávesnici. Během hry se stránka nesmí posouvat ani přibližovat.
- Nahoře je i během hry logo prg.ai s tenkou linkou. Ve hře není odkazem, ať člověk z bludiště neodejde náhodným klepnutím.
- Hra má tlačítko pauzy a sama se pozastaví, když uživatel přepne kartu.
- Na konci ukaž skóre, nejlepší skóre na tomto zařízení, tlačítko „Hrát znovu“ a návrat na rozcestník.

## Stránka `/tablet`

Obrazovka pro tablet u stánku, bez odkazu z hlavní stránky.

- Celá obrazovka, logo prg.ai, velký QR kód na `https://festivalai.prg.ai`.
- Text: „Zkraťte si čekání“ a pod ním „Naskenujte kód a zahrajte si“.
- Pod kódem adresa `festivalai.prg.ai`.
- QR kód generuj v prohlížeči knihovnou `qrcode`.

## Design

Web musí působit jako prg.ai. Než začneš kódovat, podívej se na https://prg.ai a na podklady v této složce.

- Písmo: Sofia Pro. Soubory patří do `public/fonts/`, webová licence je potvrzená. Všechny řezy jsou v `brand/fonts/`.
- Barvy: `DOPLNIT z brand manuálu prg.ai`. Definuj je jako CSS proměnné, ať jdou změnit na jednom místě.
- Logo: `public/logo-prg-ai.svg`, dodá Jan.
- V nadpisech a grafice používej jednu tloušťku písma, bez zvýrazňování tučným nebo tenkým řezem.
- Velké cíle pro palec, krátké texty a silný kontrast, ať se web dobře ovládá vestoje jednou rukou.

## Texty

- Čeština, vykání, genderově neutrální formulace.
- Pomlčka vždy jako ` – `, nikdy `—`.
- Žádné středníky.
- Typografické uvozovky a apostrofy.
- Nadpisy a texty v grafice bez tečky na konci.
- Celé věty v odstavcích končí tečkou: výsledky her, poznámky (disclaimery), pravidla Neuron-Mana, texty karet v sekcích „Chcete se o AI dozvědět víc?“ a „O nás“.
- Texty výsledků jsou podle skóre různé, ale končí vždy stejně a vedou na odkaz pod nimi: v kvízu „Víc se naučíte v bezplatném kurzu Elements of AI.“, v Přechytrači „– my to děláme za vás v našem newsletteru.“
- Žádné prázdné nadšení ani fráze typu „revoluční“ nebo „kouzlo AI“.

## Hotovo znamená

- Kvíz i Přechytrač jde několikrát za sebou dohrát a pokaždé se vyberou jiné otázky nebo kola.
- Neuron-Man jde dohrát na mobilu i klávesnicí a všechna bludiště jsou průchozí.
- Na šířce 360 px nic nepřetéká a stránka se neposouvá do strany.
- QR kód na `/tablet` jde načíst telefonem a vede na správnou adresu.
- Odkazy jsou na jednom místě v `src/links.ts`.
