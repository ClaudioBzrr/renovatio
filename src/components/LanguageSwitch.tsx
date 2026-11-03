import { Languages } from 'lucide-react'
import { useI18n } from '../i18n/I18nProvider'

interface LanguageSwitchProps {
  compact?: boolean
  className?: string
}

export function LanguageSwitch({
  compact = false,
  className = '',
}: LanguageSwitchProps) {
  const { locale, setLocale, t } = useI18n()

  return (
    <div
      className={`language-switch ${compact ? 'language-switch--compact' : ''} ${className}`}
      role="group"
      aria-label={t('language.switchAria')}
    >
      {!compact ? <Languages size={15} strokeWidth={1.8} aria-hidden="true" /> : null}
      <button
        type="button"
        className={`language-switch__option ${locale === 'pt-BR' ? 'is-active' : ''}`}
        aria-pressed={locale === 'pt-BR'}
        onClick={() => setLocale('pt-BR')}
      >
        {compact ? t('language.shortPt') : t('language.pt')}
      </button>
      <span className="language-switch__divider" aria-hidden="true" />
      <button
        type="button"
        className={`language-switch__option ${locale === 'en-US' ? 'is-active' : ''}`}
        aria-pressed={locale === 'en-US'}
        onClick={() => setLocale('en-US')}
      >
        {compact ? t('language.shortEn') : t('language.en')}
      </button>
    </div>
  )
}
