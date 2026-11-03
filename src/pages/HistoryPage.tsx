import { useMemo, useState } from 'react'
import {
  BookOpen,
  CalendarDays,
  CheckCircle2,
  Flame,
  HeartHandshake,
  Quote,
  Sparkles,
} from 'lucide-react'
import { PageHeader } from '../components/PageHeader'
import { EmptyState } from '../components/EmptyState'
import { CategoryIcon, GoodActionIcon } from '../components/CategoryIcon'
import { useApp } from '../store/AppStore'
import type { GoodAction, TaskCompletion } from '../types'
import {
  addDays,
  dateKey,
  formatShortDate,
  formatTime,
  formatWeekday,
  getWeekdayNarrow,
  humanDay,
  startOfDay,
} from '../lib/date'
import { useI18n } from '../i18n/I18nProvider'
import { useCategoryMeta, useGoodActionMeta } from '../i18n/useMeta'
import type { TranslationKey } from '../i18n/translations'

interface HistoryPageProps {
  onNavigateToday: () => void
}

type Filter = 'tudo' | 'micro' | 'gestos'

type Entry =
  | {
      kind: 'micro'
      id: string
      date: string
      createdAt: string
      completion: TaskCompletion
    }
  | {
      kind: 'good'
      id: string
      date: string
      createdAt: string
      action: GoodAction
    }

const FILTERS: { key: Filter; labelKey: TranslationKey }[] = [
  { key: 'tudo', labelKey: 'history.filterAll' },
  { key: 'micro', labelKey: 'history.filterMicro' },
  { key: 'gestos', labelKey: 'history.filterGestures' },
]

export function HistoryPage({ onNavigateToday }: HistoryPageProps) {
  const { data } = useApp()
  const { t } = useI18n()
  const categories = useCategoryMeta()
  const actions = useGoodActionMeta()
  const [filter, setFilter] = useState<Filter>('tudo')
  const [limit, setLimit] = useState(30)

  const allEntries = useMemo<Entry[]>(() => {
    const micro: Entry[] = data.completions.map((completion) => ({
      kind: 'micro',
      id: completion.id,
      date: completion.date,
      createdAt: completion.completedAt,
      completion,
    }))
    const good: Entry[] = data.goodActions.map((action) => ({
      kind: 'good',
      id: action.id,
      date: action.date,
      createdAt: action.createdAt,
      action,
    }))
    return [...micro, ...good].sort(
      (a, b) =>
        b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt),
    )
  }, [data.completions, data.goodActions])

  const entries = useMemo(
    () =>
      allEntries.filter((entry) =>
        filter === 'tudo'
          ? true
          : filter === 'micro'
            ? entry.kind === 'micro'
            : entry.kind === 'good',
      ),
    [allEntries, filter],
  )

  const grouped = useMemo(() => {
    const map = new Map<string, Entry[]>()
    entries.slice(0, limit).forEach((entry) => {
      const list = map.get(entry.date) ?? []
      list.push(entry)
      map.set(entry.date, list)
    })
    return [...map.entries()]
  }, [entries, limit])

  const activeDays = useMemo(() => {
    const days = new Set<string>()
    data.completions.forEach((item) => days.add(item.date))
    data.goodActions.forEach((item) => days.add(item.date))
    return days.size
  }, [data.completions, data.goodActions])

  const activityByDay = useMemo(() => {
    const map = new Map<string, number>()
    data.completions.forEach((item) =>
      map.set(item.date, (map.get(item.date) ?? 0) + 1),
    )
    data.goodActions.forEach((item) =>
      map.set(item.date, (map.get(item.date) ?? 0) + 1),
    )
    return map
  }, [data.completions, data.goodActions])

  const heatmap = useMemo(() => {
    const end = startOfDay(new Date())
    const start = addDays(end, -83)
    const aligned = addDays(start, -start.getDay())
    const days: Date[] = []
    for (let cursor = aligned; cursor.getTime() <= end.getTime(); cursor = addDays(cursor, 1)) {
      days.push(cursor)
    }
    const weeks: Date[][] = []
    for (let index = 0; index < days.length; index += 7) {
      weeks.push(days.slice(index, index + 7))
    }
    return weeks
  }, [])

  const total = data.completions.length + data.goodActions.length

  return (
    <div className="page page--history">
      <PageHeader
        eyebrow={t('history.eyebrow')}
        title={
          <>
            {t('history.titleLead')} <em>{t('history.titleEm')}</em>
          </>
        }
        description={<p>{t('history.description')}</p>}
      />

      <section className="history-stats">
        <div className="history-stat">
          <span className="history-stat__icon history-stat__icon--ember">
            <Flame size={20} strokeWidth={1.8} />
          </span>
          <strong>{data.completions.length}</strong>
          <span>
            {t(
              data.completions.length === 1
                ? 'history.sparkOne'
                : 'history.sparkMany',
            )}
          </span>
        </div>
        <div className="history-stat">
          <span className="history-stat__icon history-stat__icon--moss">
            <HeartHandshake size={20} strokeWidth={1.8} />
          </span>
          <strong>{data.goodActions.length}</strong>
          <span>
            {t(
              data.goodActions.length === 1
                ? 'history.goodOne'
                : 'history.goodMany',
            )}
          </span>
        </div>
        <div className="history-stat">
          <span className="history-stat__icon history-stat__icon--gold">
            <CalendarDays size={20} strokeWidth={1.8} />
          </span>
          <strong>{activeDays}</strong>
          <span>
            {t(activeDays === 1 ? 'history.dayOne' : 'history.dayMany')}
          </span>
        </div>
        <div className="history-stat">
          <span className="history-stat__icon history-stat__icon--ink">
            <BookOpen size={20} strokeWidth={1.8} />
          </span>
          <strong>{total}</strong>
          <span>{t('history.totalEntries')}</span>
        </div>
      </section>

      <section className="panel heatmap-panel">
        <header className="panel__header">
          <div>
            <p className="eyebrow">{t('history.heatmapEyebrow')}</p>
            <h2>{t('history.heatmapTitle')}</h2>
          </div>
          <div className="heatmap-legend" aria-hidden="true">
            <span>{t('history.less')}</span>
            <i className="heatmap-cell heatmap-cell--0" />
            <i className="heatmap-cell heatmap-cell--1" />
            <i className="heatmap-cell heatmap-cell--2" />
            <i className="heatmap-cell heatmap-cell--3" />
            <span>{t('history.more')}</span>
          </div>
        </header>

        <div
          className="heatmap"
          role="group"
          aria-label={t('a11y.heatmapLabel')}
        >
          <div className="heatmap__weekdays" aria-hidden="true">
            {[0, 1, 2, 3, 4, 5, 6].map((day) => (
              <span key={day}>{getWeekdayNarrow(day as 0 | 1 | 2 | 3 | 4 | 5 | 6)}</span>
            ))}
          </div>
          <div className="heatmap__weeks">
            {heatmap.map((week) => (
              <div className="heatmap__week" key={dateKey(week[0])}>
                {week.map((day) => {
                  const key = dateKey(day)
                  const count = activityByDay.get(key) ?? 0
                  const level = count === 0 ? 0 : count <= 1 ? 1 : count <= 3 ? 2 : 3
                  const isFuture = day.getTime() > Date.now()
                  const label = isFuture
                    ? undefined
                    : t('history.heatmapTooltip', {
                        weekday: formatWeekday(day),
                        date: formatShortDate(day),
                        n: count,
                      })
                  return (
                    <span
                      key={key}
                      className={`heatmap-cell heatmap-cell--${isFuture ? 'future' : level} ${key === dateKey() ? 'is-today' : ''}`}
                      role={label ? 'img' : undefined}
                      aria-label={label}
                      aria-hidden={isFuture || undefined}
                      title={label}
                    />
                  )
                })}
              </div>
            ))}
          </div>
        </div>

        <p className="heatmap-panel__foot">{t('history.heatmapFoot')}</p>
      </section>

      <section className="history-log">
        <header className="history-log__head">
          <div>
            <p className="eyebrow">{t('history.logEyebrow')}</p>
            <h2>{t('history.logTitle')}</h2>
          </div>
          <div
            className="filter-tabs"
            role="group"
            aria-label={t('history.filterAria')}
          >
            {FILTERS.map((option) => (
              <button
                key={option.key}
                type="button"
                className={`filter-tab ${filter === option.key ? 'is-active' : ''}`}
                aria-pressed={filter === option.key}
                onClick={() => {
                  setFilter(option.key)
                  setLimit(30)
                }}
              >
                {t(option.labelKey)}
              </button>
            ))}
          </div>
        </header>

        {entries.length === 0 ? (
          <EmptyState
            title={t(
              allEntries.length === 0
                ? 'history.emptyAllTitle'
                : 'history.emptyFilterTitle',
            )}
            description={t(
              allEntries.length === 0
                ? 'history.emptyAllDesc'
                : 'history.emptyFilterDesc',
            )}
            action={
              <button
                type="button"
                className="button button--primary button--small"
                onClick={onNavigateToday}
              >
                <Sparkles size={15} /> {t('history.goToday')}
              </button>
            }
          />
        ) : (
          <div className="history-groups">
            {grouped.map(([day, dayEntries]) => (
              <section key={day} className="history-day">
                <header className="history-day__head">
                  <h3>{humanDay(day)}</h3>
                  <span>{formatShortDate(day)}</span>
                </header>
                <div className="history-day__entries">
                  {dayEntries.map((entry) =>
                    entry.kind === 'micro' ? (
                      <article key={entry.id} className="history-entry history-entry--micro">
                        <div className="history-entry__rail">
                          <span
                            className={`history-entry__icon history-entry__icon--${entry.completion.category}`}
                          >
                            <CategoryIcon category={entry.completion.category} size={18} />
                          </span>
                          <span className="history-entry__line" aria-hidden="true" />
                        </div>
                        <div className="history-entry__body">
                          <div className="history-entry__top">
                            <span className="history-entry__label">
                              {categories[entry.completion.category].label} ·{' '}
                              {t('history.microLabel')}
                            </span>
                            <span className="history-entry__time">
                              {formatTime(new Date(entry.completion.completedAt))}
                            </span>
                          </div>
                          <h4>
                            {entry.completion.taskTitle || t('history.microLabel')}
                          </h4>
                          <blockquote>
                            <Quote size={14} strokeWidth={1.8} aria-hidden="true" />
                            <p>{entry.completion.reflection}</p>
                          </blockquote>
                          {entry.completion.sensoryNote ? (
                            <p className="history-entry__sensory">
                              <EyeIcon /> {entry.completion.sensoryNote}
                            </p>
                          ) : null}
                        </div>
                      </article>
                    ) : (
                      <article key={entry.id} className="history-entry history-entry--good">
                        <div className="history-entry__rail">
                          <span
                            className={`history-entry__icon history-entry__icon--${entry.action.type}`}
                          >
                            <GoodActionIcon type={entry.action.type} size={18} />
                          </span>
                          <span className="history-entry__line" aria-hidden="true" />
                        </div>
                        <div className="history-entry__body">
                          <div className="history-entry__top">
                            <span className="history-entry__label">
                              {actions[entry.action.type].label} ·{' '}
                              {t('history.goodLabel')}
                            </span>
                            <span className="history-entry__time">
                              {formatTime(new Date(entry.action.createdAt))}
                            </span>
                          </div>
                          <h4>{entry.action.description}</h4>
                          {entry.action.feeling ? (
                            <p className="history-entry__feeling">
                              <Quote size={14} strokeWidth={1.8} /> {entry.action.feeling}
                            </p>
                          ) : (
                            <p className="history-entry__feeling history-entry__feeling--muted">
                              <CheckCircle2 size={14} /> {t('history.registered')}
                            </p>
                          )}
                        </div>
                      </article>
                    ),
                  )}
                </div>
              </section>
            ))}
          </div>
        )}

        {entries.length > limit ? (
          <button
            type="button"
            className="button button--ghost history-more"
            onClick={() => setLimit((current) => current + 30)}
          >
            {t('history.showMore')}
          </button>
        ) : null}
      </section>
    </div>
  )
}

function EyeIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  )
}
