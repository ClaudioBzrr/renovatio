import { useI18n } from '../i18n/I18nProvider'

/**
 * Keyboard-first way to bypass the navigation. It focuses the main landmark
 * without changing the URL hash, which is used by the app router.
 */
export function SkipLink() {
  const { t } = useI18n()

  return (
    <a
      className="skip-link"
      href="#main-content"
      onClick={(event) => {
        event.preventDefault()
        const main = document.getElementById('main-content')
        if (!main) return
        main.focus({ preventScroll: true })
        main.scrollIntoView({ block: 'start' })
      }}
    >
      {t('a11y.skipToContent')}
    </a>
  )
}
