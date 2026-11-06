// Všechny odkazy webu na jednom místě. Měňte je jen tady.

/** Adresa tohoto webu – vede na ni QR kód na stránce /tablet */
export const SITE_URL = 'https://festivalai.prg.ai'

export interface ExternalLink {
  title: string
  description: string
  url: string
}

export const ELEMENTS_OF_AI: ExternalLink = {
  title: 'Elements of AI',
  description: 'Bezplatný online kurz v češtině',
  url: 'https://prg.ai/elements-of-ai/',
}

export const NEWSLETTER: ExternalLink = {
  title: 'Newsletter prg.ai',
  description: 'Přihlaste se k odběru novinek',
  // #newsletter je přihláška k newsletteru na hlavní stránce prg.ai
  url: 'https://prg.ai/#newsletter',
}

export const DNY_AI: ExternalLink = {
  title: 'Dny AI',
  description: 'Největší AI festival v Česku, 2.–15. 11. 2026',
  url: 'https://dny.ai/program',
}

export const PRG_AI: ExternalLink = {
  title: 'Web prg.ai',
  description: 'Více o prg.ai',
  url: 'https://prg.ai',
}

/** Sekce „Zajímavé odkazy“ na rozcestníku, v tomto pořadí */
export const INTERESTING_LINKS: ExternalLink[] = [
  {
    title: 'Mapa české AI',
    description: 'Celý český AI ekosystém na jedné mapě, od firem a startupů po výzkumné skupiny a investory',
    url: 'https://www.cnaip.cz/cs/ceska-ai',
  },
  {
    title: 'Jak si stojíte v používání umělé inteligence?',
    description: 'Krátký dotazník Dnů AI o tom, jak používáte umělou inteligenci. Na konci uvidíte, jak odpovídali ostatní',
    url: 'https://otestujtese.dny.ai/',
  },
  {
    title: 'AI dětem',
    description: 'Nezisková organizace, která tvoří výukové materiály, akce a workshopy pro děti o umělé inteligenci',
    url: 'https://aidetem.cz/',
  },
  {
    title: 'AI mediamonitor',
    description: 'Přihlaste se k týdennímu newsletteru, který shrnuje dění na české AI scéně očima českých médií',
    // #newsletter je přihláška k mediamonitoru České národní AI platformy
    url: 'https://www.cnaip.cz/cs#newsletter',
  },
  {
    title: 'Kalendář pražských AI akcí',
    description: 'Google Calendar, díky kterému vám nikdy neunikne žádná zajímavá AI akce v Praze',
    url: 'https://calendar.google.com/calendar/embed?src=prg.ai_4qhqlsn9aumu1d2bev6o2o02e4%40group.calendar.google.com&ctz=Europe%2FPrague',
  },
]

export interface SocialLink {
  network: 'linkedin' | 'facebook' | 'instagram'
  title: string
  url: string
}

/** Sekce „Sledujte nás“ na rozcestníku, v tomto pořadí */
export const SOCIAL_LINKS: SocialLink[] = [
  { network: 'linkedin', title: 'LinkedIn', url: 'https://www.linkedin.com/company/prgai/' },
  { network: 'instagram', title: 'Instagram', url: 'https://www.instagram.com/prg_ai/' },
  { network: 'facebook', title: 'Facebook', url: 'https://www.facebook.com/prgai' },
]
