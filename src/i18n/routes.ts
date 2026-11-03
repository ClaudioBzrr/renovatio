import type { Route } from '../lib/navigation'
import type { TranslationKey } from './translations'

/**
 * Human-readable, localized names for each route. Used for the document
 * title, the main landmark label and the route-change announcement.
 */
export const PAGE_TITLE_KEYS: Record<Route, TranslationKey> = {
  inicio: 'page.inicio',
  comecar: 'page.comecar',
  hoje: 'page.hoje',
  rotina: 'page.rotina',
  gestos: 'page.gestos',
  historia: 'page.historia',
  metodo: 'page.metodo',
}
