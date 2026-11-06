import { useEffect, useRef, useState } from 'react'
import { Link } from '../router.tsx'
import { DNY_AI, ELEMENTS_OF_AI, INTERESTING_LINKS, NEWSLETTER, SOCIAL_LINKS } from '../links.ts'
import { Page } from '../components/ui.tsx'
import { PixelIcon } from '../components/PixelIcon.tsx'
import { SocialIcon } from '../components/SocialIcon.tsx'
import { nbsp } from '../typo.ts'
import { GAMES } from '../gameInfo.ts'

export default function Hub() {
  const trackRef = useRef<HTMLUListElement>(null)
  const [active, setActive] = useState(0)

  // Která dlaždice je právě uprostřed
  useEffect(() => {
    const track = trackRef.current
    if (!track) return
    const update = () => {
      const center = track.scrollLeft + track.clientWidth / 2
      let best = 0
      let bestDist = Infinity
      Array.from(track.children).forEach((el, i) => {
        const item = el as HTMLElement
        const dist = Math.abs(item.offsetLeft + item.offsetWidth / 2 - center)
        if (dist < bestDist) {
          best = i
          bestDist = dist
        }
      })
      setActive(best)
    }
    update()
    track.addEventListener('scroll', update, { passive: true })
    window.addEventListener('resize', update)
    return () => {
      track.removeEventListener('scroll', update)
      window.removeEventListener('resize', update)
    }
  }, [])

  const goTo = (i: number) => {
    const item = trackRef.current?.children[i] as HTMLElement | undefined
    item?.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' })
  }

  return (
    <Page home={false} footer className="hub">
      <div className="hero">
        <h1 tabIndex={-1}>Vítejte na prg.ai Hřišti</h1>
        <p className="hero__sub">{nbsp('Zkraťte si čekání jednou ze tří her, zjistěte víc o umělé inteligenci a projděte si odkazy na zajímavé zdroje')}</p>
      </div>

      <ul className="tiles" ref={trackRef} aria-label="Hry">
        {GAMES.map((game, i) => (
          <li key={game.href} className={'tiles__item' + (i === active ? ' is-active' : '')}>
            <Link href={game.href} className="tile" onFocus={() => goTo(i)}>
              <span className="tile__art">
                <PixelIcon shape={game.icon} className="tile__icon" />
              </span>
              <span className="tile__body">
                <span className="tile__title">{game.title}</span>
                <span className="tile__text">{nbsp(game.text)}</span>
              </span>
              <span className="tile__cta">{nbsp(game.cta)}</span>
            </Link>
          </li>
        ))}
      </ul>

      <div className="tiles-dots">
        {GAMES.map((game, i) => (
          <button
            key={game.href}
            type="button"
            className={'tiles-dots__dot' + (i === active ? ' is-active' : '')}
            aria-label={`Ukázat ${game.title}`}
            aria-current={i === active}
            onClick={() => goTo(i)}
          />
        ))}
      </div>

      <section className="learn" aria-labelledby="learn-title">
        <h2 id="learn-title" className="section-title">
          Chcete se o AI dozvědět víc?
        </h2>

        <div className="cards2">
          <a className="info-card info-card--blue" href={NEWSLETTER.url} target="_blank" rel="noopener">
            <span className="info-card__eyebrow">Jednou měsíčně do mailu</span>
            <span className="info-card__title">Newsletter prg.ai</span>
            <span className="info-card__text">
              {nbsp(
                'Novinky z pražské AI scény, úspěchy českých výzkumníků a firem, tipy na zajímavé akce, komunitní výzvy i pracovní nabídky – to vše jednou měsíčně do vaší schránky.',
              )}
            </span>
            <span className="info-card__cta">Odebírat newsletter</span>
          </a>
          <a className="info-card" href={DNY_AI.url} target="_blank" rel="noopener">
            <span className="info-card__eyebrow">Až do 15. listopadu</span>
            <span className="info-card__title">Dny AI</span>
            <span className="info-card__text">
              {nbsp(
                'Největší AI festival v Česku pokračuje. Ve všech 14 krajích vás čeká spousta konferencí a workshopů a většina z nich je zdarma. Vyberte si z programu a přijďte.',
              )}
            </span>
            <span className="info-card__cta">Prohlédnout program</span>
          </a>
          <a className="info-card" href={ELEMENTS_OF_AI.url} target="_blank" rel="noopener">
            <span className="info-card__eyebrow">Bezplatný online kurz v češtině</span>
            <span className="info-card__title">Elements of AI</span>
            <span className="info-card__text">
              {nbsp(
                'Co je a není AI? Co umí a neumí? Přihlaste se do kurzu vyvinutého ve spolupráci s Univerzitou v Helsinkách. Je v češtině, zdarma a zapsalo si ho už přes 37 tisíc lidí v Česku.',
              )}
            </span>
            <span className="info-card__cta">Začít kurz zdarma</span>
          </a>
        </div>
      </section>

      <section className="links" aria-labelledby="links-title">
        <h2 id="links-title" className="section-title">
          Zajímavé odkazy
        </h2>
        <ul className="link-list">
          {INTERESTING_LINKS.map((link) => (
            <li key={link.url}>
              <a className="link-list__item" href={link.url} target="_blank" rel="noopener">
                <span className="link-list__title">
                  {link.title}
                  {'\u00a0'}
                  <svg className="link-list__arrow" viewBox="0 0 16 16" aria-hidden="true">
                    <path d="M5 11L11 5M6 5h5v5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
                <span className="link-list__text">{nbsp(link.description)}</span>
              </a>
            </li>
          ))}
        </ul>
      </section>

      <section className="about" aria-labelledby="about-title">
        <h2 id="about-title" className="section-title">
          O nás
        </h2>
        <div className="info-card">
          <span className="info-card__eyebrow">Kdo za tímhle vším stojí?</span>
          <span className="info-card__title">prg.ai</span>
          <span className="info-card__text">
            {nbsp(
              'Jsme nezisková organizace zaměřená na umělou inteligenci, která od roku 2019 propojuje výzkum, byznys a veřejnou správu.',
            )}
          </span>
          <ul className="socials">
            {SOCIAL_LINKS.map((social) => (
              <li key={social.network}>
                <a className="social" href={social.url} target="_blank" rel="noopener" aria-label={`prg.ai na síti ${social.title}`}>
                  <SocialIcon network={social.network} className="social__icon" />
                </a>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </Page>
  )
}
