import { useMemo, useState } from 'react'
import {
  ArrowRight,
  CalendarDays,
  Check,
  Clock3,
  Lightbulb,
  Pencil,
  Plus,
  RefreshCw,
  Sparkles,
  Trash2,
} from 'lucide-react'
import { PageHeader } from '../components/PageHeader'
import { EmptyState } from '../components/EmptyState'
import { ConfirmDialog } from '../components/ConfirmDialog'
import { CategoryIcon } from '../components/CategoryIcon'
import { useApp } from '../store/AppStore'
import { useToast } from '../components/Toast'
import type { CategoryKey, MicroTask } from '../types'
import {
  CATEGORY_KEYS,
  SUGGESTIONS,
  type Suggestion,
} from '../data/suggestions'
import { dateKey, daysLabel, isScheduledOn, minutesFromTime } from '../lib/date'
import { useI18n } from '../i18n/I18nProvider'
import { useCategoryMeta } from '../i18n/useMeta'

interface RoutinePageProps {
  onOpenTaskForm: (options?: {
    task?: MicroTask
    title?: string
    category?: CategoryKey
    time?: string
  }) => void
  onNavigateMethod: () => void
}

type Filter = 'todos' | CategoryKey

export function RoutinePage({ onOpenTaskForm, onNavigateMethod }: RoutinePageProps) {
  const { data, maxTasks, deleteTask } = useApp()
  const { pushToast } = useToast()
  const { t } = useI18n()
  const categories = useCategoryMeta()
  const [filter, setFilter] = useState<Filter>('todos')
  const [taskToDelete, setTaskToDelete] = useState<MicroTask | null>(null)

  const tasks = useMemo(
    () =>
      [...data.tasks].sort(
        (a, b) => minutesFromTime(a.time) - minutesFromTime(b.time),
      ),
    [data.tasks],
  )
  const today = dateKey()
  const completedToday = useMemo(
    () => new Set(data.completions.filter((item) => item.date === today).map((item) => item.taskId)),
    [data.completions, today],
  )
  const atLimit = tasks.length >= maxTasks

  const suggestions = useMemo(() => {
    const source =
      filter === 'todos'
        ? SUGGESTIONS
        : SUGGESTIONS.filter((item) => item.category === filter)
    return source.slice(0, filter === 'todos' ? 8 : 6)
  }, [filter])

  const surprise = () => {
    const pool = SUGGESTIONS.filter(
      (item) => !data.tasks.some((task) => task.title === t(item.titleKey)),
    )
    const choice = pool[Math.floor(Math.random() * pool.length)] ?? SUGGESTIONS[0]
    onOpenTaskForm({
      title: t(choice.titleKey),
      category: choice.category,
      time: choice.time,
    })
  }

  const addSuggestion = (suggestion: Suggestion) => {
    onOpenTaskForm({
      title: t(suggestion.titleKey),
      category: suggestion.category,
      time: suggestion.time,
    })
  }

  return (
    <div className="page page--routine">
      <PageHeader
        eyebrow={t('routine.eyebrow')}
        title={
          <>
            {t('routine.titleLead')} <em>{t('routine.titleEm')}</em>
          </>
        }
        description={<p>{t('routine.description')}</p>}
        actions={
          <button
            type="button"
            className="button button--primary"
            onClick={() => onOpenTaskForm()}
            disabled={atLimit}
          >
            <Plus size={17} /> {t('routine.newTask')}
          </button>
        }
      />

      <section className="routine-intro">
        <div className="routine-intro__number">
          <span>1–3</span>
          <small>{t('routine.introPerDay')}</small>
        </div>
        <div className="routine-intro__copy">
          <h2>{t('routine.introTitle')}</h2>
          <p>{t('routine.introText')}</p>
        </div>
        <button type="button" className="text-button" onClick={onNavigateMethod}>
          {t('routine.why')} <ArrowRight size={15} />
        </button>
      </section>

      <div className="routine-layout">
        <section className="panel routine-tasks">
          <header className="panel__header">
            <div>
              <p className="eyebrow">{t('routine.commitments')}</p>
              <h2>
                {tasks.length === 0
                  ? t('routine.noTasks')
                  : t(
                      tasks.length === 1
                        ? 'routine.taskOne'
                        : 'routine.taskMany',
                      { n: tasks.length },
                    )}
              </h2>
            </div>
            <span className={`limit-badge ${atLimit ? 'is-full' : ''}`}>
              {tasks.length}/{maxTasks}
            </span>
          </header>

          {tasks.length === 0 ? (
            <EmptyState
              title={t('routine.emptyTitle')}
              description={t('routine.emptyDesc')}
              action={
                <button
                  type="button"
                  className="button button--primary"
                  onClick={() => onOpenTaskForm()}
                >
                  <Plus size={16} /> {t('routine.createFirst')}
                </button>
              }
            />
          ) : (
            <div className="routine-list">
              {tasks.map((task) => {
                const scheduledToday = isScheduledOn(task, new Date())
                const done = completedToday.has(task.id)
                return (
                  <article
                    key={task.id}
                    className={`routine-task ${done ? 'is-done' : ''} ${scheduledToday ? 'is-today' : ''}`}
                  >
                    <div className="routine-task__time">
                      <Clock3 size={14} strokeWidth={1.8} />
                      {task.time}
                    </div>
                    <span className={`routine-task__icon routine-task__icon--${task.category}`}>
                      <CategoryIcon category={task.category} size={19} />
                    </span>
                    <div className="routine-task__body">
                      <div className="routine-task__title-row">
                        <h3>{task.title}</h3>
                        {done ? (
                          <span className="routine-task__done">
                            <Check size={13} /> {t('routine.doneToday')}
                          </span>
                        ) : scheduledToday ? (
                          <span className="routine-task__today">{t('routine.today')}</span>
                        ) : null}
                      </div>
                      <p>
                        {categories[task.category].label}
                        <span className="dot-separator" />
                        <CalendarDays size={13} /> {daysLabel(task.days)}
                      </p>
                    </div>
                    <div className="routine-task__actions">
                      <button
                        type="button"
                        className="icon-button icon-button--small"
                        aria-label={t('routine.editAria', { title: task.title })}
                        onClick={() => onOpenTaskForm({ task })}
                      >
                        <Pencil size={15} />
                      </button>
                      <button
                        type="button"
                        className="icon-button icon-button--small icon-button--danger"
                        aria-label={t('routine.removeAria', { title: task.title })}
                        onClick={() => setTaskToDelete(task)}
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </article>
                )
              })}
            </div>
          )}

          {atLimit ? (
            <div className="inline-note">
              <Sparkles size={16} />
              <span>{t('routine.limitNote')}</span>
            </div>
          ) : null}

          <p className="panel__foot">{t('routine.foot')}</p>
        </section>

        <aside className="routine-side">
          <section className="panel routine-tip">
            <span className="routine-tip__icon">
              <Lightbulb size={20} strokeWidth={1.8} />
            </span>
            <h3>{t('routine.tipTitle')}</h3>
            <p>{t('routine.tipText')}</p>
          </section>

          <section className="panel routine-quote">
            <span aria-hidden="true">“</span>
            <p>{t('routine.quoteTitle')}</p>
            <small>{t('routine.quoteSmall')}</small>
          </section>
        </aside>
      </div>

      <section className="suggestions-section">
        <header className="suggestions-section__head">
          <div>
            <p className="eyebrow">{t('routine.suggestionsEyebrow')}</p>
            <h2>{t('routine.suggestionsTitle')}</h2>
          </div>
          <button
            type="button"
            className="button button--ghost button--small"
            onClick={surprise}
            disabled={atLimit}
          >
            <RefreshCw size={15} /> {t('routine.surprise')}
          </button>
        </header>

        <div
          className="filter-tabs"
          role="group"
          aria-label={t('routine.filterAria')}
        >
          <button
            type="button"
            className={`filter-tab ${filter === 'todos' ? 'is-active' : ''}`}
            aria-pressed={filter === 'todos'}
            onClick={() => setFilter('todos')}
          >
            {t('routine.all')}
          </button>
          {CATEGORY_KEYS.map((key) => (
            <button
              key={key}
              type="button"
              className={`filter-tab ${filter === key ? 'is-active' : ''}`}
              aria-pressed={filter === key}
              onClick={() => setFilter(key)}
            >
              {categories[key].label}
            </button>
          ))}
        </div>

        <div className="suggestion-grid">
          {suggestions.map((suggestion) => {
            const suggestionTitle = t(suggestion.titleKey)
            return (
              <article
                key={suggestion.titleKey}
                className={`suggestion-card suggestion-card--${suggestion.category}`}
              >
                <span
                  className={`suggestion-card__icon suggestion-card__icon--${suggestion.category}`}
                >
                  <CategoryIcon category={suggestion.category} size={18} />
                </span>
                <div className="suggestion-card__body">
                  <small>{categories[suggestion.category].label}</small>
                  <h3>{suggestionTitle}</h3>
                  {suggestion.time ? (
                    <span className="suggestion-card__time">
                      <Clock3 size={12} /> {suggestion.time}
                    </span>
                  ) : null}
                </div>
                <button
                  type="button"
                  className="suggestion-card__add"
                  aria-label={t('routine.addAria', { title: suggestionTitle })}
                  onClick={() => addSuggestion(suggestion)}
                  disabled={atLimit}
                >
                  <Plus size={16} />
                </button>
              </article>
            )
          })}
        </div>
      </section>

      <ConfirmDialog
        open={taskToDelete !== null}
        title={t('routine.deleteTitle')}
        description={
          taskToDelete
            ? t('routine.deleteDesc', { title: taskToDelete.title })
            : ''
        }
        confirmLabel={t('common.remove')}
        danger
        onClose={() => setTaskToDelete(null)}
        onConfirm={() => {
          if (!taskToDelete) return
          deleteTask(taskToDelete.id)
          pushToast({
            title: t('routine.removedTitle'),
            description: t('routine.removedDesc'),
          })
          setTaskToDelete(null)
        }}
      />
    </div>
  )
}
