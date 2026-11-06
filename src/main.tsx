import { StrictMode, Suspense, lazy, useEffect, useRef } from 'react'
import type { ComponentType } from 'react'
import { createRoot } from 'react-dom/client'
import { usePath } from './router.tsx'
import Hub from './pages/Hub.tsx'
import './styles.css'

const loadQuiz = () => import('./pages/Quiz.tsx')
const loadPrechytrac = () => import('./pages/Prechytrac.tsx')
const loadNeuronka = () => import('./pages/Neuronka.tsx')
const loadTablet = () => import('./pages/Tablet.tsx')

interface Route {
  title: string
  Page: ComponentType
}

const NeuronMan = lazy(loadNeuronka)
const neuronMan: Route = { title: 'Neuron-Man – prg.ai Hřiště', Page: NeuronMan }

const routes: Record<string, Route> = {
  '/': { title: 'prg.ai Hřiště', Page: Hub },
  '/kviz': { title: 'AI kvíz – prg.ai Hřiště', Page: lazy(loadQuiz) },
  '/prechytrac': { title: 'Přechytrač AI – prg.ai Hřiště', Page: lazy(loadPrechytrac) },
  '/neuron-man': neuronMan,
  '/neuronka': neuronMan, // původní adresa ze zadání
  '/tablet': { title: 'prg.ai Hřiště', Page: lazy(loadTablet) },
}

function App() {
  const path = usePath()
  const route = routes[path] ?? routes['/']
  const first = useRef(true)

  useEffect(() => {
    document.title = route.title
    if (first.current) {
      first.current = false
      return
    }
    window.scrollTo(0, 0)
    document.querySelector<HTMLElement>('main h1')?.focus({ preventScroll: true })
  }, [path, route.title])

  // Hry si stáhneme dopředu, ať se po klepnutí otevřou hned
  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadQuiz()
      void loadPrechytrac()
      void loadNeuronka()
    }, 1200)
    return () => window.clearTimeout(timer)
  }, [])

  const { Page } = route
  return (
    <Suspense fallback={<div className="loading" aria-live="polite">Načítám…</div>}>
      <Page key={path} />
    </Suspense>
  )
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
