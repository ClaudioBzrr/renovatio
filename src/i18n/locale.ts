import type { Locale } from './types'

export const LOCALE_STORAGE_KEY = 'renovatio.locale'

export function isLocale(value: unknown): value is Locale {
  return value === 'pt-BR' || value === 'en-US'
}

export function detectLocale(): Locale {
  if (typeof window === 'undefined') return 'pt-BR'
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
