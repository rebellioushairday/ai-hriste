import { useEffect, useState } from 'react'
import type { AnchorHTMLAttributes, MouseEvent } from 'react'

const listeners = new Set<() => void>()

function normalize(path: string): string {
  const clean = path.replace(/\/+$/, '')
  return clean === '' ? '/' : clean
}

export function navigate(to: string) {
  if (normalize(to) === normalize(window.location.pathname)) return
  window.history.pushState(null, '', to)
  listeners.forEach((fn) => fn())
}

export function usePath(): string {
  const [path, setPath] = useState(() => normalize(window.location.pathname))
  useEffect(() => {
    const update = () => setPath(normalize(window.location.pathname))
    listeners.add(update)
    window.addEventListener('popstate', update)
    return () => {
      listeners.delete(update)
      window.removeEventListener('popstate', update)
    }
  }, [])
  return path
}

/** Interní odkaz bez načtení celé stránky znovu. */
export function Link({ href, onClick, ...rest }: AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }) {
  const handle = (e: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(e)
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
    e.preventDefault()
    navigate(href)
  }
  return <a href={href} onClick={handle} {...rest} />
}
