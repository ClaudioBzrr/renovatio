import { useEffect, useRef } from 'react'
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
import { NewTabHint } from '../components/NewTabHint'
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
  const rootRef = useRef<HTMLDivElement>(null)
  const primaryAction = isReturning ? onOpenApp : onStart
  const primaryLabel = isReturning ? t('landing.openApp') : t('landing.start')
  const tickerWords = [
    t('common.want'),
    t('common.like'),
    t('common.learn'),
    t('landing.feature1Title'),
    t('landing.feature3Title'),
  ]
  const docsUrl =
    locale === 'pt-BR'
      ? 'https://github.com/ClaudioBzrr/renovatio/blob/main/docs/README.pt-BR.md'
      : 'https://github.com/ClaudioBzrr/renovatio/blob/main/docs/README.md'

  useEffect(() => {
    const root = rootRef.current
    if (!root) return
    const reducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches
    let frame = 0
    const updateScroll = () => {
      frame = 0
      const maxScroll =
        document.documentElement.scrollHeight - window.innerHeight
      const progress =
        maxScroll > 0 ? Math.min(1, Math.max(0, window.scrollY / maxScroll)) : 0
      root.style.setProperty('--scroll-progress', String(progress))
      if (reducedMotion) return
      const factor = window.innerWidth <= 720 ? 0.035 : 0.06
      root.style.setProperty(
        '--hero-parallax',
        `${Math.min(window.scrollY * factor, 36)}px`,
      )
      root.style.setProperty(
        '--copy-parallax',
        `${Math.min(window.scrollY * factor * 0.35, 14)}px`,
      )
    }
    const onScroll = () => {
      if (frame) return
      frame = window.requestAnimationFrame(updateScroll)
    }
    updateScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      if (frame) window.cancelAnimationFrame(frame)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [])

  useEffect(() => {
    const root = rootRef.current
    if (!root) return
    const nodes = Array.from(root.querySelectorAll<HTMLElement>('[data-reveal]'))
    const reducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches
    if (reducedMotion || !('IntersectionObserver' in window)) {
      nodes.forEach((node) => node.classList.add('is-visible'))
      return
    }
    root.classList.add('reveal-ready')
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return
          entry.target.classList.add('is-visible')
          observer.unobserve(entry.target)
        })
      },
      { threshold: 0.12, rootMargin: '0px 0px -7% 0px' },
    )
    nodes.forEach((node) => observer.observe(node))
    return () => observer.disconnect()
  }, [])

  const scrollTo = (id: string) => {
    const target = document.getElementById(id)
    if (!target) return
    const reducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches
    target.scrollIntoView({
      behavior: reducedMotion ? 'auto' : 'smooth',
      block: 'start',
    })
    const heading = target.querySelector<HTMLElement>('h2')
    if (heading) {
      heading.tabIndex = -1
      heading.focus({ preventScroll: true })
    }
  }

  return (
    <div className="landing" ref={rootRef}>
      <div className="landing__progress" aria-hidden="true">
        <span />
      </div>
      <header className="landing__nav">
        <Brand />
        <nav className="landing__nav-links" aria-label={t('nav.main')}>
          <button
            type="button"
            aria-controls="como-funciona"
            onClick={() => scrollTo('como-funciona')}
          >
            {t('landing.navHow')}
          </button>
          <button
            type="button"
            aria-controls="seguranca"
            onClick={() => scrollTo('seguranca')}
          >
            {t('landing.navSafety')}
          </button>
          <a href={docsUrl} target="_blank" rel="noreferrer">
            {t('landing.navDocs')} <ArrowUpRight size={13} aria-hidden="true" />
            <NewTabHint />
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

      <main id="main-content" tabIndex={-1} aria-label={t('a11y.mainContent')}>
        <section className="landing__hero">
          <div className="landing__hero-copy">
            <p className="eyebrow">{t('landing.eyebrow')}</p>
            <h1 className="landing__title" data-page-heading tabIndex={-1}>
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
                aria-controls="metodo"
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
            <span className="landing__ember landing__ember--1" />
            <span className="landing__ember landing__ember--2" />
            <span className="landing__ember landing__ember--3" />
            <span className="landing__ember landing__ember--4" />
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
              <ProgressRing value={2 / 6} size={84} stroke={5} animate>
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

        <div className="landing__ticker" aria-hidden="true">
          <div className="landing__ticker-track">
            {[0, 1].map((group) => (
              <span key={group} className="landing__ticker-group">
                {tickerWords.map((word) => (
                  <span key={`${group}-${word}`} className="landing__ticker-item">
                    {word}
                    <i>·</i>
                  </span>
                ))}
              </span>
            ))}
          </div>
        </div>

        <section id="como-funciona" className="landing__section">
          <header className="landing__section-head" data-reveal>
            <p className="eyebrow">{t('landing.featuresEyebrow')}</p>
            <h2>{t('landing.featuresTitle')}</h2>
          </header>
          <div className="landing__features">
            {FEATURES.map((feature, index) => {
              const Icon = feature.icon
              return (
                <article
                  key={feature.titleKey}
                  className="landing__feature"
                  data-reveal
                  style={{ animationDelay: `${index * 70}ms` }}
                >
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

        <section id="metodo" className="landing__method" data-reveal="scale">
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
          <div className="landing__source-copy" data-reveal="left">
            <p className="eyebrow">{t('landing.videoEyebrow')}</p>
            <h2>{t('landing.videoTitle')}</h2>
            <p>{t('landing.videoDesc')}</p>
            <a
              href="https://www.youtube.com/watch?v=aw3ksUsDVEE"
              target="_blank"
              rel="noreferrer"
            >
              {t('landing.videoLink')}{' '}
              <ArrowUpRight size={15} aria-hidden="true" />
              <NewTabHint />
            </a>
          </div>
          <div
            className="landing__quote-card"
            data-reveal="right"
            style={{ animationDelay: '90ms' }}
          >
            <Quote size={22} strokeWidth={1.6} />
            <p>{t('method.pullquote')}</p>
            <small>Renovatio · {t('landing.methodEyebrow')}</small>
          </div>
        </section>

        <section id="seguranca" className="landing__safety-section" data-reveal="left">
          <div>
            <p className="eyebrow">{t('landing.safetyTitle')}</p>
            <h2>{t('landing.safetyText')}</h2>
          </div>
          <div className="landing__safety-actions">
            <a href="https://www.cvv.org.br/" target="_blank" rel="noreferrer">
              <HeartHandshake size={16} aria-hidden="true" /> {t('settings.cvv')}
              <NewTabHint />
            </a>
            <a href={docsUrl} target="_blank" rel="noreferrer">
              <BookOpen size={16} aria-hidden="true" /> {t('landing.docsLink')}
              <NewTabHint />
            </a>
          </div>
        </section>

        <section className="landing__final" data-reveal="scale">
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
            <NewTabHint />
          </a>
          <a
            href="https://github.com/ClaudioBzrr/renovatio"
            target="_blank"
            rel="noreferrer"
          >
            GitHub
            <NewTabHint />
          </a>
          <a href="https://www.cvv.org.br/" target="_blank" rel="noreferrer">
            CVV · 188
            <NewTabHint />
          </a>
        </div>
      </footer>
    </div>
  )
}
