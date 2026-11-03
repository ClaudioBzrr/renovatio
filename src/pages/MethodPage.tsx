import {
  ArrowRight,
  ArrowUpRight,
  CheckCircle2,
  Clock3,
  ExternalLink,
  Eye,
  Flame,
  HeartHandshake,
  ShieldCheck,
  Sparkles,
} from 'lucide-react'
import { PageHeader } from '../components/PageHeader'
import { BrandMark } from '../components/Brand'
import { useI18n } from '../i18n/I18nProvider'
import type { TranslationKey } from '../i18n/translations'

interface MethodPageProps {
  onNavigateToday: () => void
  onNavigateRoutine: () => void
}

const SECTIONS: { id: string; labelKey: TranslationKey }[] = [
  { id: 'contexto', labelKey: 'method.tocContext' },
  { id: 'acoes', labelKey: 'method.tocActions' },
  { id: 'renovatio', labelKey: 'method.tocHelp' },
  { id: 'terceira-semana', labelKey: 'method.tocThird' },
  { id: 'seguranca', labelKey: 'method.tocSafety' },
]

export function MethodPage({ onNavigateToday, onNavigateRoutine }: MethodPageProps) {
  const { t } = useI18n()

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <div className="page page--method">
      <PageHeader
        eyebrow={t('method.eyebrow')}
        title={
          <>
            {t('method.titleLead')} <em>{t('method.titleEm')}</em>
          </>
        }
        description={<p>{t('method.description')}</p>}
        actions={
          <button type="button" className="button button--primary" onClick={onNavigateToday}>
            {t('method.backToday')} <ArrowRight size={16} />
          </button>
        }
      />

      <section className="method-warning">
        <span className="method-warning__icon">
          <ShieldCheck size={20} strokeWidth={1.8} />
        </span>
        <div>
          <strong>{t('method.warningTitle')}</strong>
          <p>{t('method.warningText')}</p>
        </div>
      </section>

      <div className="method-layout">
        <aside className="method-toc">
          <p className="eyebrow">{t('method.tocLabel')}</p>
          <nav aria-label={t('method.tocAria')}>
            {SECTIONS.map((section, index) => (
              <button
                key={section.id}
                type="button"
                onClick={() => scrollTo(section.id)}
              >
                <span>{String(index + 1).padStart(2, '0')}</span>
                {t(section.labelKey)}
              </button>
            ))}
          </nav>
          <div className="method-toc__quote">
            <Flame size={16} />
            <p>{t('method.quote')}</p>
          </div>
        </aside>

        <article className="method-article">
          <section id="contexto" className="method-section">
            <p className="eyebrow">{t('method.contextEyebrow')}</p>
            <h2>{t('method.contextTitle')}</h2>
            <p>{t('method.contextP1')}</p>
            <p>{t('method.contextP2')}</p>
            <blockquote className="method-pullquote">
              <p>{t('method.pullquote')}</p>
            </blockquote>
            <p>{t('method.contextP3')}</p>
          </section>

          <section id="acoes" className="method-section">
            <p className="eyebrow">{t('method.actionsEyebrow')}</p>
            <h2>{t('method.actionsTitle')}</h2>

            <div className="action-list">
              <article className="action-card">
                <span className="action-card__number">01</span>
                <div className="action-card__icon">
                  <Clock3 size={20} strokeWidth={1.8} />
                </div>
                <div>
                  <h3>{t('method.action1Title')}</h3>
                  <p>{t('method.action1Desc')}</p>
                  <span className="action-card__tag">{t('method.action1Tag')}</span>
                </div>
              </article>

              <article className="action-card">
                <span className="action-card__number">02</span>
                <div className="action-card__icon">
                  <Sparkles size={20} strokeWidth={1.8} />
                </div>
                <div>
                  <h3>{t('method.action2Title')}</h3>
                  <p>{t('method.action2Desc')}</p>
                  <span className="action-card__tag">{t('method.action2Tag')}</span>
                </div>
              </article>

              <article className="action-card">
                <span className="action-card__number">03</span>
                <div className="action-card__icon">
                  <Eye size={20} strokeWidth={1.8} />
                </div>
                <div>
                  <h3>{t('method.action3Title')}</h3>
                  <p>{t('method.action3Desc')}</p>
                  <span className="action-card__tag">{t('method.action3Tag')}</span>
                </div>
              </article>

              <article className="action-card">
                <span className="action-card__number">04</span>
                <div className="action-card__icon">
                  <HeartHandshake size={20} strokeWidth={1.8} />
                </div>
                <div>
                  <h3>{t('method.action4Title')}</h3>
                  <p>{t('method.action4Desc')}</p>
                  <span className="action-card__tag">{t('method.action4Tag')}</span>
                </div>
              </article>
            </div>
          </section>

          <section id="renovatio" className="method-section">
            <p className="eyebrow">{t('method.helpEyebrow')}</p>
            <h2>{t('method.helpTitle')}</h2>
            <p>{t('method.helpP1')}</p>
            <div className="method-map">
              <div>
                <span>{t('method.mapRoutine')}</span>
                <p>{t('method.mapRoutineDesc')}</p>
              </div>
              <div>
                <span>{t('method.mapPresence')}</span>
                <p>{t('method.mapPresenceDesc')}</p>
              </div>
              <div>
                <span>{t('method.mapSpark')}</span>
                <p>{t('method.mapSparkDesc')}</p>
              </div>
              <div>
                <span>{t('method.mapGestures')}</span>
                <p>{t('method.mapGesturesDesc')}</p>
              </div>
              <div>
                <span>{t('method.mapReminders')}</span>
                <p>{t('method.mapRemindersDesc')}</p>
              </div>
              <div>
                <span>{t('method.mapHistory')}</span>
                <p>{t('method.mapHistoryDesc')}</p>
              </div>
            </div>
            <p>{t('method.helpP2')}</p>
          </section>

          <section id="terceira-semana" className="method-section">
            <div className="third-week">
              <span className="third-week__mark" aria-hidden="true">
                <BrandMark size={44} />
              </span>
              <div>
                <p className="eyebrow">{t('method.thirdEyebrow')}</p>
                <h2>{t('method.thirdTitle')}</h2>
                <p>{t('method.thirdP1')}</p>
                <p>{t('method.thirdP2')}</p>
              </div>
            </div>
          </section>

          <section id="seguranca" className="method-section">
            <p className="eyebrow">{t('method.safetyEyebrow')}</p>
            <h2>{t('method.safetyTitle')}</h2>
            <p>{t('method.safetyP1')}</p>
            <div className="safety-grid">
              <div>
                <CheckCircle2 size={18} />
                <p>
                  <strong>{t('method.safetyHelpTitle')}</strong>{' '}
                  {t('method.safetyHelpText')}
                </p>
              </div>
              <div>
                <HeartHandshake size={18} />
                <p>
                  <strong>{t('method.safetyLimitTitle')}</strong>{' '}
                  {t('method.safetyLimitText')}
                </p>
              </div>
            </div>
            <div className="safety-callout">
              <p>
                <strong>{t('method.safetyCalloutLead')}</strong>{' '}
                {t('method.safetyCalloutRest')}
              </p>
              <div className="safety-links">
                <a href="https://www.cvv.org.br/" target="_blank" rel="noreferrer">
                  <HeartHandshake size={16} /> {t('settings.cvv')}{' '}
                  <ExternalLink size={13} />
                </a>
                <span>{t('method.cvvNote')}</span>
              </div>
            </div>
            <p className="method-source">
              {t('method.sourcePrefix')}{' '}
              <a
                href="https://www.youtube.com/watch?v=aw3ksUsDVEE"
                target="_blank"
                rel="noreferrer"
              >
                {t('method.sourceVideo')}
                <ArrowUpRight size={14} />
              </a>
              {t('method.sourceSuffix')}
            </p>
          </section>

          <div className="method-cta">
            <div>
              <p className="eyebrow">{t('method.ctaEyebrow')}</p>
              <h2>{t('method.ctaTitle')}</h2>
              <p>{t('method.ctaText')}</p>
            </div>
            <div className="method-cta__actions">
              <button
                type="button"
                className="button button--primary"
                onClick={onNavigateRoutine}
              >
                {t('method.buildRoutine')} <ArrowRight size={16} />
              </button>
              <button
                type="button"
                className="button button--ghost"
                onClick={onNavigateToday}
              >
                {t('method.goToday')}
              </button>
            </div>
          </div>
        </article>
      </div>
    </div>
  )
}
