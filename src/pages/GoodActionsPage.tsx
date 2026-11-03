import { useMemo, useState } from 'react'
import {
  ArrowRight,
  Check,
  CheckCircle2,
  ChevronRight,
  Pencil,
  Plus,
  Quote,
  Sparkles,
  Trash2,
} from 'lucide-react'
import { PageHeader } from '../components/PageHeader'
import { ConfirmDialog } from '../components/ConfirmDialog'
import { GoodActionIcon } from '../components/CategoryIcon'
import { BrandMark } from '../components/Brand'
import { useApp } from '../store/AppStore'
import { useToast } from '../components/Toast'
import type { GoodAction, GoodActionType } from '../types'
import {
  GOOD_ACTION_IDEAS,
  GOOD_ACTION_KEYS,
} from '../data/suggestions'
import {
  formatWeekday,
  lastNDays,
  parseDateKey,
} from '../lib/date'
import { useI18n } from '../i18n/I18nProvider'
import { useGoodActionMeta } from '../i18n/useMeta'
import type { TranslationKey } from '../i18n/translations'

interface GoodActionsPageProps {
  onOpenGoodAction: (options?: {
    action?: GoodAction
    type?: GoodActionType
    description?: string
  }) => void
  onNavigateHistory: () => void
}

const SLOT_HINTS: {
  titleKey: TranslationKey
  descriptionKey: TranslationKey
  type: GoodActionType
}[] = [
  {
    titleKey: 'gestures.slot1Title',
    descriptionKey: 'gestures.slot1Desc',
    type: 'gentileza',
  },
  {
    titleKey: 'gestures.slot2Title',
    descriptionKey: 'gestures.slot2Desc',
    type: 'conexao',
  },
  {
    titleKey: 'gestures.slot3Title',
    descriptionKey: 'gestures.slot3Desc',
    type: 'realizacao',
  },
]

export function GoodActionsPage({
  onOpenGoodAction,
  onNavigateHistory,
}: GoodActionsPageProps) {
  const { data, today, deleteGoodAction } = useApp()
  const { pushToast } = useToast()
  const { t } = useI18n()
  const actions = useGoodActionMeta()
  const [actionToDelete, setActionToDelete] = useState<GoodAction | null>(null)

  const todayActions = useMemo(
    () => data.goodActions.filter((item) => item.date === today),
    [data.goodActions, today],
  )
  const complete = todayActions.length >= 3
  const week = useMemo(
    () =>
      lastNDays(7).map((key) => ({
        key,
        date: parseDateKey(key),
        count: data.goodActions.filter((item) => item.date === key).length,
      })),
    [data.goodActions],
  )
  const totalGood = data.goodActions.length
  const totalDays = new Set(data.goodActions.map((item) => item.date)).size

  return (
    <div className="page page--good-actions">
      <PageHeader
        eyebrow={t('gestures.eyebrow')}
        title={
          <>
            {t('gestures.titleLead')} <em>{t('gestures.titleEm')}</em>
          </>
        }
        description={<p>{t('gestures.description')}</p>}
        actions={
          <div className="goal-header">
            <span className={`goal-header__count ${complete ? 'is-complete' : ''}`}>
              {todayActions.length}/3
            </span>
            {!complete ? (
              <button
                type="button"
                className="button button--primary button--small"
                onClick={() => onOpenGoodAction()}
              >
                <Plus size={15} /> {t('gestures.register')}
              </button>
            ) : null}
          </div>
        }
      />

      <div className="goal-progress" aria-hidden="true">
        {[0, 1, 2].map((index) => (
          <span
            key={index}
            className={index < todayActions.length ? 'is-filled' : ''}
          />
        ))}
      </div>

      {complete ? (
        <section className="goal-complete">
          <div className="goal-complete__glow" aria-hidden="true" />
          <span className="goal-complete__mark">
            <BrandMark size={56} />
          </span>
          <div>
            <p className="eyebrow">{t('gestures.completeEyebrow')}</p>
            <h2>{t('gestures.completeTitle')}</h2>
            <p>{t('gestures.completeText')}</p>
          </div>
          <button
            type="button"
            className="button button--light-ghost button--small"
            onClick={onNavigateHistory}
          >
            {t('gestures.seeHistory')} <ArrowRight size={15} />
          </button>
        </section>
      ) : (
        <section className="goal-intro">
          <div className="goal-intro__mark">
            <Sparkles size={20} strokeWidth={1.8} />
          </div>
          <div>
            <h2>
              {t(
                todayActions.length === 2
                  ? 'gestures.remainingOne'
                  : 'gestures.remainingMany',
                { n: 3 - todayActions.length },
              )}
            </h2>
            <p>{t('gestures.introText')}</p>
          </div>
          <span className="goal-intro__reset">{t('gestures.resetLabel')}</span>
        </section>
      )}

      <section className="goal-slots">
        {[0, 1, 2].map((index) => {
          const action = todayActions[index]
          const hint = SLOT_HINTS[index]
          if (action) {
            const meta = actions[action.type]
            return (
              <article
                key={action.id}
                className={`goal-card goal-card--filled goal-card--${action.type}`}
              >
                <div className="goal-card__top">
                  <span className="goal-card__number">0{index + 1}</span>
                  <span className={`goal-card__type goal-card__type--${action.type}`}>
                    <GoodActionIcon type={action.type} size={14} /> {meta.label}
                  </span>
                  <span className="goal-card__done">
                    <Check size={14} /> {t('gestures.done')}
                  </span>
                </div>
                <div className="goal-card__icon">
                  <GoodActionIcon type={action.type} size={26} />
                </div>
                <h3>{action.description}</h3>
                {action.feeling ? (
                  <p className="goal-card__feeling">
                    <Quote size={14} /> {action.feeling}
                  </p>
                ) : (
                  <p className="goal-card__feeling goal-card__feeling--muted">
                    {t('gestures.registeredCare')}
                  </p>
                )}
                <div className="goal-card__actions">
                  <button
                    type="button"
                    className="text-button"
                    onClick={() =>
                      onOpenGoodAction({
                        action,
                        type: action.type,
                        description: action.description,
                      })
                    }
                  >
                    <Pencil size={14} /> {t('common.edit')}
                  </button>
                  <button
                    type="button"
                    className="text-button text-button--danger"
                    onClick={() => setActionToDelete(action)}
                  >
                    <Trash2 size={14} /> {t('common.remove')}
                  </button>
                </div>
              </article>
            )
          }
          return (
            <button
              key={`slot-${index}`}
              type="button"
              className={`goal-card goal-card--empty goal-card--${hint.type}`}
              onClick={() => onOpenGoodAction({ type: hint.type })}
            >
              <div className="goal-card__top">
                <span className="goal-card__number">0{index + 1}</span>
                <span className={`goal-card__type goal-card__type--${hint.type}`}>
                  <GoodActionIcon type={hint.type} size={14} />{' '}
                  {actions[hint.type].label}
                </span>
              </div>
              <span className="goal-card__empty-icon">
                <Plus size={24} strokeWidth={1.6} />
              </span>
              <h3>{t(hint.titleKey)}</h3>
              <p>{t(hint.descriptionKey)}</p>
              <span className="goal-card__cta">
                {t('gestures.registerThis')} <ArrowRight size={15} />
              </span>
            </button>
          )
        })}
      </section>

      <section className="ideas-panel">
        <header className="panel__header">
          <div>
            <p className="eyebrow">{t('gestures.ideasEyebrow')}</p>
            <h2>{t('gestures.ideasTitle')}</h2>
          </div>
          <span className="ideas-panel__hint">{t('gestures.tapToUse')}</span>
        </header>
        <div className="ideas-columns">
          {GOOD_ACTION_KEYS.map((type) => {
            const meta = actions[type]
            return (
              <div key={type} className={`ideas-column ideas-column--${type}`}>
                <div className="ideas-column__head">
                  <span className="ideas-column__icon">
                    <GoodActionIcon type={type} size={18} />
                  </span>
                  <div>
                    <h3>{meta.label}</h3>
                    <p>{meta.description}</p>
                  </div>
                </div>
                <ul>
                  {GOOD_ACTION_IDEAS[type].slice(0, 4).map((ideaKey) => {
                    const idea = t(ideaKey)
                    return (
                      <li key={ideaKey}>
                        <button
                          type="button"
                          onClick={() =>
                            onOpenGoodAction({ type, description: idea })
                          }
                        >
                          {idea} <Plus size={13} />
                        </button>
                      </li>
                    )
                  })}
                </ul>
              </div>
            )
          })}
        </div>
      </section>

      <section className="good-history-preview">
        <div className="good-history-preview__copy">
          <p className="eyebrow">{t('gestures.trailEyebrow')}</p>
          <h2>
            {t(
              totalGood === 1 ? 'gestures.trailOne' : 'gestures.trailMany',
              { n: totalGood, days: totalDays },
            )}
          </h2>
          <p>{t('gestures.trailText')}</p>
          <button type="button" className="text-button" onClick={onNavigateHistory}>
            {t('gestures.seeAll')} <ChevronRight size={15} />
          </button>
        </div>
        <div className="good-week">
          {week.map((day) => (
            <div
              key={day.key}
              className={`good-week__day ${day.count >= 3 ? 'is-complete' : day.count > 0 ? 'has-some' : ''}`}
              title={t('gestures.weekTooltip', {
                weekday: formatWeekday(day.date),
                n: day.count,
              })}
            >
              <span>{day.count > 0 ? day.count : '·'}</span>
              <small>{day.date.getDate()}</small>
            </div>
          ))}
        </div>
      </section>

      <p className="goal-footnote">
        <CheckCircle2 size={15} /> {t('gestures.footnote')}
      </p>

      <ConfirmDialog
        open={actionToDelete !== null}
        title={t('gestures.deleteTitle')}
        description={
          actionToDelete
            ? t('gestures.deleteDesc', {
                description: actionToDelete.description,
              })
            : ''
        }
        confirmLabel={t('common.remove')}
        danger
        onClose={() => setActionToDelete(null)}
        onConfirm={() => {
          if (!actionToDelete) return
          deleteGoodAction(actionToDelete.id)
          pushToast({
            title: t('gestures.removedTitle'),
            description: t('gestures.removedDesc'),
          })
          setActionToDelete(null)
        }}
      />
    </div>
  )
}
