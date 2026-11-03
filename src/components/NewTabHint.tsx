import { useI18n } from '../i18n/I18nProvider'

/** Screen-reader-only hint for links that open in a new tab. */
export function NewTabHint() {
  const { t } = useI18n()
  return <span className="visually-hidden"> ({t('a11y.opensInNewTab')})</span>
}
