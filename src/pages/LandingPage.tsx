import {
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  CalendarDays,
  Check,
  HeartHandshake,
  LockKeyhole,
  Quote,
  ShieldCheck,
  Sparkles,
} from 'lucide-react'
import { Brand, BrandMark } from '../components/Brand'
import { LanguageSwitch } from '../components/LanguageSwitch'
import { ProgressRing } from '../components/ProgressRing'
import { CategoryIcon } from '../components/CategoryIcon'
import { useI18n } from '../i18n/I18nProvider'

interface LandingPageProps {
  isReturning: boolean
  onStart: () => void
  onOpenApp: () => void
}

const FEATURES = [
  {
    icon: CalendarDays,
    titleKey: 'landing.feature1Title',
    descKey: 'landing.feature1Desc',
  },
  {
    icon: Quote,
    titleKey: 'landing.feature2Title',
    descKey: 'landing.feature2Desc',
  },
  {
    icon: HeartHandshake,
    titleKey: 'landing.feature3Title',
    descKey: 'landing.feature3Desc',
  },
  {
    icon: LockKeyhole,
    titleKey: 'landing.feature4Title',
    descKey: 'landing.feature4Desc',
  },
] as const

const METHOD = [
  {
    number: '1',
    titleKey: 'landing.method1Title',
    descKey: 'landing.method1Desc',
  },
  {
    number: '2',
    titleKey: 'landing.method2Title',
    descKey: 'landing.method2Desc',
  },
  {
    number: '3',
    titleKey: 'landing.method3Title',
    descKey: 'landing.method3Desc',
  },
] as const

export function LandingPage({
  isReturning,
  onStart,
  onOpenApp,
}: LandingPageProps) {
  const { t, locale } = useI18n()
  const primaryAction = isReturning ? onOpenApp : onStart
  const primaryLabel = isReturning ? t('landing.openApp') : t('landing.start')
  const docsUrl =
    locale === 'pt-BR'
      ? 'https://github.com/ClaudioBzrr/renovatio/blob/main/docs/README.pt-BR.md'
      : 'https://github.com/ClaudioBzrr/renovatio/blob/main/docs/README.md'

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <div className="landing">
      <header className="landing__nav">
        <Brand />
        <nav className="landing__nav-links" aria-label={t('nav.main')}>
          <button type="button" onClick={() => scrollTo('como-funciona')}>
            {t('landing.navHow')}
          </button>
          <button type="button" onClick={() => scrollTo('seguranca')}>
            {t('landing.navSafety')}
          </button>
          <a href={docsUrl} target="_blank" rel="noreferrer">
            {t('landing.navDocs')} <ArrowUpRight size={13} />
          </a>
        </nav>
        <div className="landing__nav-actions">
          <LanguageSwitch compact />
          <button
            type="button"
            className="button button--primary button--small"
            onClick={primaryAction}
          >
            {primaryLabel}
          </button>
        </div>
      </header>

      <main>
        <section className="landing__hero">
          <div className="landing__hero-copy">
            <p className="eyebrow">{t('landing.eyebrow')}</p>
            <h1 className="landing__title">
              {t('landing.titleLead')}
              <br />
              <em>{t('landing.titleEm')}</em>
            </h1>
            <p className="landing__lede">{t('landing.description')}</p>
            <div className="landing__hero-actions">
              <button type="button" className="button button--primary" onClick={primaryAction}>
                {primaryLabel} <ArrowRight size={17} />
              </button>
              <button
                type="button"
                className="button button--ghost"
                onClick={() => scrollTo('metodo')}
              >
                {t('landing.viewMethod')}
              </button>
            </div>
            <p className="landing__safety">
              <ShieldCheck size={15} /> {t('landing.safety')}
            </p>
            <div className="landing__stats">
              <div>
                <strong>{t('landing.stat1')}</strong>
                <span>{t('landing.stat1Label')}</span>
              </div>
              <div>
                <strong>{t('landing.stat2')}</strong>
                <span>{t('landing.stat2Label')}</span>
              </div>
              <div>
                <strong>{t('landing.stat3')}</strong>
                <span>{t('landing.stat3Label')}</span>
              </div>
            </div>
          </div>

          <div className="landing__visual" aria-hidden="true">
            <div className="landing__visual-glow" />
            <div className="landing__mock-next">
              <div className="landing__mock-top">
                <span>{t('landing.previewEyebrow')}</span>
                <span className="landing__mock-dot" />
              </div>
              <div className="landing__mock-time">{t('landing.previewTime')}</div>
              <h2>{t('landing.previewTask')}</h2>
              <p className="landing__mock-meta">
                <CategoryIcon category="corpo" size={14} /> {t('landing.previewMeta')}
              </p>
              <div className="landing__mock-actions">
                <span>{t('landing.previewDone')}</span>
                <span className="landing__mock-secondary">{t('landing.previewPrepare')}</span>
              </div>
            </div>

            <div className="landing__mock-rhythm">
              <span>{t('landing.previewRhythm')}</span>
              <ProgressRing value={2 / 6} size={84} stroke={5}>
                <strong>33%</strong>
              </ProgressRing>
              <strong>{t('landing.previewProgress')}</strong>
            </div>

            <div className="landing__mock-good">
              <span>
                <HeartHandshake size={14} /> {t('landing.previewGood')}
              </span>
              <p>{t('landing.previewGoodDesc')}</p>
              <Check size={15} />
            </div>

            <span className="landing__badge">{t('landing.badge')}</span>
          </div>
        </section>

        <section id="como-funciona" className="landing__section">
          <header className="landing__section-head">
            <p className="eyebrow">{t('landing.featuresEyebrow')}</p>
            <h2>{t('landing.featuresTitle')}</h2>
          </header>
          <div className="landing__features">
            {FEATURES.map((feature) => {
              const Icon = feature.icon
              return (
                <article key={feature.titleKey} className="landing__feature">
                  <span className="landing__feature-icon">
                    <Icon size={21} strokeWidth={1.8} />
                  </span>
                  <h3>{t(feature.titleKey)}</h3>
                  <p>{t(feature.descKey)}</p>
                </article>
              )
            })}
          </div>
        </section>

        <section id="metodo" className="landing__method">
          <div className="landing__method-copy">
            <p className="eyebrow">{t('landing.methodEyebrow')}</p>
            <h2>{t('landing.methodTitle')}</h2>
            <p>{t('landing.description')}</p>
            <button type="button" className="button button--light-ghost" onClick={primaryAction}>
              {primaryLabel} <ArrowRight size={16} />
            </button>
          </div>
          <div className="landing__method-steps">
            {METHOD.map((step) => (
              <article key={step.number}>
                <span>{step.number}</span>
                <div>
                  <h3>{t(step.titleKey)}</h3>
                  <p>{t(step.descKey)}</p>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="landing__source">
          <div className="landing__source-copy">
            <p className="eyebrow">{t('landing.videoEyebrow')}</p>
            <h2>{t('landing.videoTitle')}</h2>
            <p>{t('landing.videoDesc')}</p>
            <a
              href="https://www.youtube.com/watch?v=aw3ksUsDVEE"
              target="_blank"
              rel="noreferrer"
            >
              {t('landing.videoLink')} <ArrowUpRight size={15} />
            </a>
          </div>
          <div className="landing__quote-card">
            <Quote size={22} strokeWidth={1.6} />
            <p>{t('method.pullquote')}</p>
            <small>Renovatio · {t('landing.methodEyebrow')}</small>
          </div>
        </section>

        <section id="seguranca" className="landing__safety-section">
          <div>
            <p className="eyebrow">{t('landing.safetyTitle')}</p>
            <h2>{t('landing.safetyText')}</h2>
          </div>
          <div className="landing__safety-actions">
            <a href="https://www.cvv.org.br/" target="_blank" rel="noreferrer">
              <HeartHandshake size={16} /> {t('settings.cvv')}
            </a>
            <a href={docsUrl} target="_blank" rel="noreferrer">
              <BookOpen size={16} /> {t('landing.docsLink')}
            </a>
          </div>
        </section>

        <section className="landing__final">
          <span className="landing__final-mark">
            <BrandMark size={50} />
          </span>
          <p className="eyebrow">{t('landing.finalEyebrow')}</p>
          <h2>{t('landing.finalTitle')}</h2>
          <p>{t('landing.finalText')}</p>
          {isReturning ? (
            <p className="landing__returning">
              {t('landing.returning')} {t('landing.returningDesc')}
            </p>
          ) : null}
          <button type="button" className="button button--ember" onClick={primaryAction}>
            {isReturning ? t('landing.openApp') : t('landing.finalStart')}{' '}
            <ArrowRight size={17} />
          </button>
          <span className="landing__final-note">
            <Sparkles size={14} /> {t('landing.languageNote')}
          </span>
        </section>
      </main>

      <footer className="landing__footer">
        <Brand compact />
        <p>{t('landing.footer')}</p>
        <div className="landing__footer-links">
          <a href={docsUrl} target="_blank" rel="noreferrer">
            {t('landing.navDocs')}
          </a>
          <a
            href="https://github.com/ClaudioBzrr/renovatio"
            target="_blank"
            rel="noreferrer"
          >
            GitHub
          </a>
          <a href="https://www.cvv.org.br/" target="_blank" rel="noreferrer">
            CVV · 188
          </a>
        </div>
      </footer>
    </div>
  )
}
