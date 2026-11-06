import type { ReactNode, Ref } from 'react'
import { Link } from '../router.tsx'
import { PRG_AI } from '../links.ts'
import type { ExternalLink } from '../links.ts'
import type { GameInfo } from '../gameInfo.ts'
import { nbsp } from '../typo.ts'

/** Hlavička všech stránek: logo prg.ai a pod ním tenká šedá linka.
 *  Ve hře je nižší (`compact`) a logo není odkaz, ať člověk z bludiště neodejde náhodným klepnutím. */
export function Header({ compact = false }: { compact?: boolean }) {
  const logo = <img src="/logo-prg-ai.svg" alt="prg.ai" width={483} height={122} />
  return (
    <header className={'header header--divided' + (compact ? ' header--compact' : '')}>
      {compact ? (
        <span className="header__logo">{logo}</span>
      ) : (
        <Link href="/" className="header__logo" aria-label="prg.ai – rozcestník">
          {logo}
        </Link>
      )}
    </header>
  )
}

/** Patička se sídlem prg.ai. Je jen na rozcestníku, na podstránkách je úplně dole tlačítko na rozcestník. */
export function Footer() {
  return (
    <footer className="footer">
      <div className="footer__inner">
        <a className="footer__logo" href={PRG_AI.url} target="_blank" rel="noopener">
          <img src="/logo-prg-ai.svg" alt="prg.ai" width={483} height={122} loading="lazy" />
        </a>
        <address className="footer__address">
          prg.ai, z.{'\u00a0'}s.
          <br />
          Staroměstské náměstí 1/4
          <br />
          Praha, 110{'\u00a0'}00
        </address>
        <div className="footer__legal">
          <p>IČO 08345091</p>
          <p>© prg.ai, 2026</p>
        </div>
      </div>
    </footer>
  )
}

/** Stránka s hlavičkou. Na podstránkách je tlačítko na rozcestník vždy úplně dole. */
export function Page({
  children,
  home = true,
  footer = false,
  className = '',
}: {
  children: ReactNode
  home?: boolean
  footer?: boolean
  className?: string
}) {
  return (
    <div className="page">
      <Header />
      <main className={'main ' + className}>
        {children}
        {home && (
          <div className="page-home">
            <HomeLink />
          </div>
        )}
      </main>
      {footer && <Footer />}
    </div>
  )
}

/** Úvodní obrazovka hry – stejná kostra pro všechny hry: ikona, nadpis, popisek, spuštění */
export function GameIntro({
  game,
  onStart,
  headingRef,
  children,
  note,
}: {
  game: GameInfo
  onStart: () => void
  headingRef?: Ref<HTMLHeadingElement>
  children?: ReactNode
  note?: ReactNode
}) {
  return (
    <div className="game-intro">
      <h1 ref={headingRef} tabIndex={-1}>
        {game.title}
      </h1>
      <p className="game-intro__text">{nbsp(game.intro)}</p>
      {children}
      <button type="button" className="btn btn--primary btn--block game-intro__start" onClick={onStart}>
        {game.cta}
      </button>
      {note && <p className="note">{note}</p>}
    </div>
  )
}

/** Skóre na konci kvízu a Přechytrače – bez rámečku, ať se neplete s odkazem pod ním */
export function ScoreLine({ score, total, label }: { score: number; total: number; label: string }) {
  return (
    <p className="score-line">
      <span className="score-line__value">
        {score}
        {'\u00a0'}z{'\u00a0'}
        {total}
      </span>
      <span className="score-line__label">{label}</span>
    </p>
  )
}

/** Odkaz na konci hry – jasná výzva s šipkou */
export function ExternalLinkRow({ link }: { link: ExternalLink }) {
  return (
    <a className="ext-link" href={link.url} target="_blank" rel="noopener">
      <span className="ext-link__text">
        <span className="ext-link__title">{link.title}</span>
        <span className="ext-link__desc">{nbsp(link.description)}</span>
      </span>
      <span className="ext-link__icon" aria-hidden="true">
        ↗
      </span>
    </a>
  )
}

export function HomeLink() {
  return (
    <Link href="/" className="back-link">
      <svg className="back-link__arrow" viewBox="0 0 16 16" aria-hidden="true">
        <path d="M13 8H3M7.5 3.5L3 8l4.5 4.5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      Zpátky na Hřiště
    </Link>
  )
}

export function Progress({ current, total, label }: { current: number; total: number; label: string }) {
  return (
    <div className="progress" aria-label={`${label} ${current} z ${total}`}>
      <span className="progress__text" aria-hidden="true">
        {current} / {total}
      </span>
      <span className="progress__bar" aria-hidden="true">
        <span style={{ width: `${(current / total) * 100}%` }} />
      </span>
    </div>
  )
}
