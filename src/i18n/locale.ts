import type { Locale } from './types'

export const LOCALE_STORAGE_KEY = 'renovatio.locale'

export function isLocale(value: unknown): value is Locale {
  return value === 'pt-BR' || value === 'en-US'
}

function localeFromQuery(): Locale | null {
  if (typeof window === 'undefined') return null
  const value = new URLSearchParams(window.location.search).get('lang')?.toLowerCase()
  if (value?.startsWith('en')) return 'en-US'
  if (value?.startsWith('pt')) return 'pt-BR'
  return null
}

export function detectLocale(): Locale {
  if (typeof window === 'undefined') return 'pt-BR'
  const fromQuery = localeFromQuery()
  if (fromQuery) return fromQuery
  try {
    const stored = localStorage.getItem(LOCALE_STORAGE_KEY)
    if (isLocale(stored)) return stored
  } catch {
    // Sem armazenamento: usa o idioma do navegador.
  }
  const browserLanguage = navigator.language?.toLowerCase() ?? ''
  return browserLanguage.startsWith('en') ? 'en-US' : 'pt-BR'
}

let runtimeLocale: Locale = detectLocale()

export function getRuntimeLocale(): Locale {
  return runtimeLocale
}

export function setRuntimeLocale(locale: Locale): void {
  runtimeLocale = locale
}

export function persistLocale(locale: Locale): void {
  setRuntimeLocale(locale)
  try {
    localStorage.setItem(LOCALE_STORAGE_KEY, locale)
  } catch {
    // O app continua no idioma escolhido nesta sessão.
  }
}

export function localeName(locale: Locale): string {
  return locale === 'pt-BR' ? 'Português (Brasil)' : 'English (US)'
}
