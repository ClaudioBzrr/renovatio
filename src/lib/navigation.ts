import { useEffect, useMemo, useState } from 'react'

export type Route =
  | 'inicio'
  | 'comecar'
  | 'hoje'
  | 'rotina'
  | 'gestos'
  | 'historia'
  | 'metodo'

const ROUTES: Route[] = [
  'inicio',
  'comecar',
  'hoje',
  'rotina',
  'gestos',
  'historia',
  'metodo',
]

function parseHash(hash: string): { route: Route; query: URLSearchParams } {
  const raw = hash.replace(/^#\/?/, '')
  const [routePart, queryPart = ''] = raw.split('?')
  const route = ROUTES.includes(routePart as Route)
    ? (routePart as Route)
    : 'hoje'
  return { route, query: new URLSearchParams(queryPart) }
}

export function useHashRoute() {
  const [state, setState] = useState(() =>
    parseHash(typeof window === 'undefined' ? '' : window.location.hash),
  )

  useEffect(() => {
    const onChange = () => {
      setState(parseHash(window.location.hash))
      window.scrollTo({ top: 0, behavior: 'auto' })
    }
    window.addEventListener('hashchange', onChange)
    if (!window.location.hash) {
      window.history.replaceState(
        null,
        '',
        `${window.location.pathname}${window.location.search}#/hoje`,
      )
    }
    return () => window.removeEventListener('hashchange', onChange)
  }, [])

  const navigate = (path: string) => {
    const next = path.startsWith('#') ? path : `#${path.startsWith('/') ? '' : '/'}${path}`
    if (window.location.hash === next) {
      setState(parseHash(next))
      return
    }
    window.location.hash = next
  }

  const query = useMemo(() => state.query, [state])

  return {
    route: state.route,
    query,
    navigate,
  }
}

export function pathFor(route: Route, params?: Record<string, string>): string {
  const search = params ? `?${new URLSearchParams(params).toString()}` : ''
  return `/${route}${search}`
}
