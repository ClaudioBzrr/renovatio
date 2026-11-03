import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type { Locale } from './types'
import {
  LOCALE_STORAGE_KEY,
  detectLocale,
  isLocale,
  persistLocale,
  setRuntimeLocale,
} from './locale'
import { translate, type TranslationKey } from './translations'

export type TranslateFunction = (
  key: TranslationKey,
  params?: Record<string, string | number>,
) => string

interface I18nContextValue {
  locale: Locale
  setLocale: (locale: Locale) => void
  t: TranslateFunction
}

const I18nContext = createContext<I18nContextValue | null>(null)

function syncDocument(locale: Locale): void {
  if (typeof document === 'undefined') return
  document.documentElement.lang = locale
  document.title = translate(locale, 'meta.title')
  const description = document.querySelector<HTMLMetaElement>(
    'meta[name="description"]',
  )
  description?.setAttribute('content', translate(locale, 'meta.description'))
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(() => {
    const detected = detectLocale()
    setRuntimeLocale(detected)
    return detected
  })

  useEffect(() => {
    setRuntimeLocale(locale)
    syncDocument(locale)
  }, [locale])

  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key !== LOCALE_STORAGE_KEY) return
      if (!isLocale(event.newValue)) return
      setRuntimeLocale(event.newValue)
      setLocaleState(event.newValue)
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  const setLocale = useCallback((nextLocale: Locale) => {
    persistLocale(nextLocale)
    setLocaleState(nextLocale)
    syncDocument(nextLocale)
  }, [])

  const t = useCallback<TranslateFunction>(
    (key, params) => translate(locale, key, params),
    [locale],
  )

  const value = useMemo(
    () => ({ locale, setLocale, t }),
    [locale, setLocale, t],
  )

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

export function useI18n(): I18nContextValue {
  const context = useContext(I18nContext)
  if (!context) throw new Error('useI18n must be used inside I18nProvider')
  return context
}
