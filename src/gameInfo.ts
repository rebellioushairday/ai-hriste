// Názvy, popisky a tlačítka her na jednom místě – používá je rozcestník i úvodní obrazovky her.
import quizData from '../kviz.json'
import prechytracData from '../prechytrac.json'
import type { PixelShape } from './components/PixelIcon.tsx'

export interface GameInfo {
  href: string
  title: string
  /** Krátký popisek na dlaždici rozcestníku – vejde se na dva až tři řádky */
  text: string
  /** Delší popisek na úvodní obrazovce hry */
  intro: string
  /** Nápis na tlačítku, které hru spouští */
  cta: string
  icon: PixelShape
}

export const QUIZ_INFO: GameInfo = {
  href: '/kviz',
  title: 'AI kvíz',
  text: 'Fakta, mýty i historie umělé inteligence. Jak dobře je znáte?',
  intro: `Fakta, mýty i historie umělé inteligence. Čeká vás ${quizData.questionsPerGame} otázek a u každé čtyři možnosti. Po odpovědi hned uvidíte, která je správná.`,
  cta: 'Udělejte si test',
  icon: 'quiz',
}

export const PRECHYTRAC_INFO: GameInfo = {
  href: '/prechytrac',
  title: 'Přechytrač AI',
  text: 'AI umí znít sebejistě, a to i když si vymýšlí. Poznáte, kdy lže?',
  intro: `${prechytracData.intro}. Čeká vás ${prechytracData.roundsPerGame} kol. Poznáte, kdy lže?`,
  cta: 'Odhalte lež',
  icon: 'prechytrac',
}

export const NEURON_MAN_INFO: GameInfo = {
  href: '/neuron-man',
  title: 'Neuron-Man',
  text: 'Sbírejte data a vyhýbejte se halucinacím v retro hře',
  intro: 'Sbírejte data a vyhýbejte se halucinacím v retro hře. Projděte tři levely, každý je těžší než ten předchozí.',
  cta: 'Vyrazte do bludiště',
  icon: 'neuron',
}

export const GAMES: GameInfo[] = [QUIZ_INFO, PRECHYTRAC_INFO, NEURON_MAN_INFO]
