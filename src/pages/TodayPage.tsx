import { useEffect, useMemo, useState } from 'react'
import {
  ArrowRight,
  Bell,
  BellOff,
  Check,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Flame,
  Plus,
  Quote,
  Sparkles,
} from 'lucide-react'
import { PageHeader } from '../components/PageHeader'
import { ProgressRing } from '../components/ProgressRing'
import { EmptyState } from '../components/EmptyState'
import { CategoryIcon, GoodActionIcon } from '../components/CategoryIcon'
import { useApp } from '../store/AppStore'
import type { GoodAction, MicroTask, TaskCompletion } from '../types'
import { DAILY_QUOTES } from '../data/suggestions'
import {
  dateAtTime,
  daysLabel,
  formatLongDate,
  formatShortDate,
  formatTime,
  formatWeekday,
  greeting,
  lastNDays,
  parseDateKey,
  relativeTime,
  tasksForDate,
} from '../lib/date'
import {
  notificationPermission,
  notificationsSupported,
} from '../lib/notifications'
import type { SettingsTab } from '../components/Layout'
import { useI18n } from '../i18n/I18nProvider'
import { useCategoryMeta, useGoodActionMeta } from '../i18n/useMeta'

interface TodayPageProps {
  onOpenReflection: (task: MicroTask, completion?: TaskCompletion | null) => void
  onOpenPresence: (task: MicroTask) => void
  onOpenGoodAction: (action?: GoodAction | null) => void
  onOpenTaskForm: () => void
  onOpenSettings: (tab?: SettingsTab) => void
  onNavigate: (route: 'rotina' | 'gestos' | 'historia' | 'metodo') => void
}

export function TodayPage({
  onOpenReflection,
  onOpenPresence,
  onOpenGoodAction,
  onOpenTaskForm,
  onOpenSettings,
  onNavigate,
}: TodayPageProps) {
  const { data, today } = useApp()
  const { t } = useI18n()
  const categories = useCategoryMeta()
  const actions = useGoodActionMeta()
  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
    const interval = window.setInterval(() => setNow(new Date()), 30_000)
    return () => window.clearInterval(interval)
  }, [])

  const todayTasks = useMemo(() => tasksForDate(data.tasks, now), [data.tasks, now])
  const todayCompletions = useMemo(
    () => data.completions.filter((item) => item.date === today),
    [data.completions, today],
  )
  const completionByTask = useMemo(() => {
    const map = new Map<string, TaskCompletion>()
    todayCompletions.forEach((item) => map.set(item.taskId, item))
    return map
  }, [todayCompletions])
  const todayGoodActions = useMemo(
    () => data.goodActions.filter((item) => item.date === today),
    [data.goodActions, today],
  )

  const incompleteTasks = todayTasks.filter((task) => !completionByTask.has(task.id))
  const currentTask =
    incompleteTasks.find((task) => {
      const at = dateAtTime(now, task.time).getTime()
      return now.getTime() >= at && now.getTime() - at < 30 * 60_000
    }) ?? null
  const nextTask =
    currentTask ??
    incompleteTasks.find(
      (task) => dateAtTime(now, task.time).getTime() >= now.getTime() - 60_000,
    ) ??
    incompleteTasks[incompleteTasks.length - 1] ??
    null
  const completedCount = todayTasks.filter((task) => completionByTask.has(task.id)).length
  const goodActionsLeft = Math.max(0, 3 - todayGoodActions.length)
  const totalGestures = todayTasks.length + 3
  const doneGestures = completedCount + todayGoodActions.length
  const progress = totalGestures > 0 ? doneGestures / totalGestures : 0
  const activeDays = useMemo(() => {
    const days = new Set<string>()
    data.completions.forEach((item) => days.add(item.date))
    data.goodActions.forEach((item) => days.add(item.date))
    return days.size
  }, [data.completions, data.goodActions])

  const permission = notificationPermission()
  const notificationsOn =
    data.settings.notificationsEnabled &&
    permission === 'granted' &&
    notificationsSupported()

  const week = useMemo(() => {
    const days = lastNDays(7, now)
    return days.map((key) => {
      const micro = data.completions.filter((item) => item.date === key).length
      const good = data.goodActions.filter((item) => item.date === key).length
      return {
        key,
        date: parseDateKey(key),
        count: micro + good,
        micro,
        good,
      }
    })
  }, [data.completions, data.goodActions, now])

  const quote = t(DAILY_QUOTES[parseDateKey(today).getDate() % DAILY_QUOTES.length])
  const nextTime = nextTask ? dateAtTime(now, nextTask.time) : null
  const nextIsCurrent = currentTask !== null && nextTask?.id === currentTask.id
  const nextIsPast =
    nextTime !== null && nextTime.getTime() < now.getTime() - 60_000
  const nextBadge = nextIsCurrent
    ? t('today.badgeNow')
    : nextIsPast
      ? t('today.badgePending')
      : nextTime
        ? relativeTime(nextTime, now)
        : ''
  const name = data.profile.name.trim()
  const sparkWord = t(completedCount === 1 ? 'today.sparkOne' : 'today.sparkMany')
  const leftWord = t(goodActionsLeft === 1 ? 'today.leftOne' : 'today.leftMany', {
    n: goodActionsLeft,
  })

  return (
    <div className="page page--today">
      <PageHeader
        eyebrow={formatLongDate(now)}
        title={
          <>
            {greeting(now)}
            {name ? `, ${name}.` : '.'}
          </>
        }
        description={
          <p>
            {t('today.descriptionLead')} <em>{t('today.descriptionEm')}</em>
          </p>
        }
        actions={
          <div className="today-header-actions">
            <button
              type="button"
              className={`status-pill ${notificationsOn ? 'status-pill--on' : ''}`}
              onClick={() => onOpenSettings('lembretes')}
            >
              {notificationsOn ? <Bell size={15} /> : <BellOff size={15} />}
              <span>
                {t(
                  notificationsOn
                    ? 'nav.notificationsOn'
                    : 'today.enableReminders',
                )}
              </span>
            </button>
            {data.tasks.length < 3 ? (
              <button
                type="button"
                className="button button--primary button--small"
                onClick={onOpenTaskForm}
              >
                <Plus size={15} /> {t('today.microTask')}
              </button>
            ) : (
              <button
                type="button"
                className="button button--ghost button--small"
                onClick={() => onNavigate('rotina')}
              >
                {t('today.seeRoutine')}
              </button>
            )}
          </div>
        }
      />

      <section className="today-hero">
        <article className={`next-card ${nextTask ? '' : 'next-card--quiet'}`}>
          <div className="next-card__glow" aria-hidden="true" />
          <div className="next-card__flame" aria-hidden="true">
            <Flame size={230} strokeWidth={0.7} />
          </div>
          <div className="next-card__top">
            <p className="eyebrow eyebrow--light">
              {!nextTask && todayTasks.length === 0
                ? t('today.nextFirst')
                : !nextTask
                  ? t('today.nextDay')
                  : nextIsCurrent
                    ? t('today.nextNow')
                    : nextIsPast
                      ? t('today.nextPending')
                      : t('today.nextEyebrow')}
            </p>
            {nextTask ? (
              <span className="next-card__badge">
                <Clock3 size={13} /> {nextBadge}
              </span>
            ) : todayTasks.length > 0 ? (
              <span className="next-card__badge">
                <CheckCircle2 size={13} /> {t('today.badgeInDay')}
              </span>
            ) : (
              <span className="next-card__badge">
                <Sparkles size={13} /> {t('today.badgeStart')}
              </span>
            )}
          </div>

          {nextTask ? (
            <>
              <div className="next-card__time">{nextTask.time}</div>
              <h2>{nextTask.title}</h2>
              <p className="next-card__meta">
                <CategoryIcon category={nextTask.category} size={15} />
                {categories[nextTask.category].label}
                <span className="dot-separator" />
                {daysLabel(nextTask.days)}
              </p>
              <div className="next-card__actions">
                <button
                  type="button"
                  className="button button--ember"
                  onClick={() => onOpenReflection(nextTask)}
                >
                  <Check size={17} /> {t('today.alreadyDid')}
                </button>
                <button
                  type="button"
                  className="button button--light-ghost"
                  onClick={() => onOpenPresence(nextTask)}
                >
                  <Sparkles size={16} /> {t('today.prepare')}
                </button>
              </div>
              <p className="next-card__foot">{t('today.nextQuote')}</p>
            </>
          ) : todayTasks.length > 0 ? (
            <div className="next-card__empty">
              <span className="next-card__check">
                <Check size={26} />
              </span>
              <h2>{t('today.dayDoneTitle')}</h2>
              <p>
                {goodActionsLeft > 0
                  ? t('today.dayDoneWithGood', {
                      sparks: completedCount,
                      sparkWord,
                      leftWord,
                    })
                  : t('today.dayDoneComplete', {
                      sparks: completedCount,
                      sparkWord,
                    })}
              </p>
              <div className="next-card__actions">
                {goodActionsLeft > 0 ? (
                  <button
                    type="button"
                    className="button button--ember"
                    onClick={() => onOpenGoodAction(null)}
                  >
                    <Plus size={16} /> {t('today.registerGood')}
                  </button>
                ) : null}
                <button
                  type="button"
                  className="button button--light-ghost"
                  onClick={() => onNavigate('historia')}
                >
                  {t('today.seeRekindlings')} <ArrowRight size={16} />
                </button>
              </div>
            </div>
          ) : (
            <div className="next-card__empty">
              <span className="next-card__check">
                <Sparkles size={24} />
              </span>
              <h2>{t('today.emptyTitle')}</h2>
              <p>{t('today.emptyText')}</p>
              <div className="next-card__actions">
                <button
                  type="button"
                  className="button button--ember"
                  onClick={onOpenTaskForm}
                >
                  <Plus size={16} /> {t('today.createMicro')}
                </button>
                <button
                  type="button"
                  className="button button--light-ghost"
                  onClick={() => onNavigate('rotina')}
                >
                  {t('today.seeIdeas')}
                </button>
              </div>
            </div>
          )}
        </article>

        <article className="rhythm-card">
          <div className="rhythm-card__head">
            <div>
              <p className="eyebrow">{t('today.rhythmEyebrow')}</p>
              <h2>
                {t('today.rhythmCount', {
                  done: doneGestures,
                  total: totalGestures,
                })}
              </h2>
            </div>
            <span className="rhythm-card__flame" aria-hidden="true">
              <Flame size={20} strokeWidth={1.8} />
            </span>
          </div>

          <div className="rhythm-card__ring">
            <ProgressRing value={progress} size={132} stroke={7}>
              <strong>{Math.round(progress * 100)}%</strong>
              <span>{t('today.ofDay')}</span>
            </ProgressRing>
          </div>

          <div className="rhythm-card__rows">
            <div>
              <span className="rhythm-card__label">
                <span className="rhythm-card__dot rhythm-card__dot--ember" />
                {t('today.microTasks')}
              </span>
              <strong>
                {completedCount}/{todayTasks.length || 0}
              </strong>
            </div>
            <div>
              <span className="rhythm-card__label">
                <span className="rhythm-card__dot rhythm-card__dot--moss" />
                {t('today.goodGestures')}
              </span>
              <strong>
                <span className="visually-hidden">
                  {t('a11y.goodGoal', { n: todayGoodActions.length })}
                </span>
                <span aria-hidden="true">{todayGoodActions.length}/3</span>
              </strong>
            </div>
          </div>

          <p className="rhythm-card__quote">
            <Quote size={14} strokeWidth={1.7} aria-hidden="true" />
            {quote}
          </p>
        </article>
      </section>

      <section className="today-grid">
        <article className="panel day-panel">
          <header className="panel__header">
            <div>
              <p className="eyebrow">{t('today.dayPanelEyebrow')}</p>
              <h2>{t('today.dayPanelTitle')}</h2>
            </div>
            <button
              type="button"
              className="text-button"
              onClick={() => onNavigate('rotina')}
            >
              {t('today.editRoutine')} <ChevronRight size={15} />
            </button>
          </header>

          {todayTasks.length === 0 ? (
            <EmptyState
              compact
              title={t('today.emptyDayTitle')}
              description={t('today.emptyDayDesc')}
              action={
                <button
                  type="button"
                  className="button button--primary button--small"
                  onClick={onOpenTaskForm}
                >
                  <Plus size={15} /> {t('today.createFirst')}
                </button>
              }
            />
          ) : (
            <ol className="timeline">
              {todayTasks.map((task) => {
                const completion = completionByTask.get(task.id)
                const taskAt = dateAtTime(now, task.time)
                const isNow =
                  !completion &&
                  now.getTime() >= taskAt.getTime() &&
                  now.getTime() - taskAt.getTime() < 30 * 60 * 1000
                return (
                  <li
                    key={task.id}
                    className={`timeline__item ${completion ? 'is-done' : ''} ${isNow ? 'is-now' : ''}`}
                  >
                    <div className="timeline__time">
                      <span>{task.time}</span>
                      {isNow ? <em>{t('today.nowLabel')}</em> : null}
                    </div>
                    <span className="timeline__node" aria-hidden="true">
                      {completion ? <Check size={13} /> : null}
                    </span>
                    <div className="timeline__content">
                      <div className="timeline__title-row">
                        <h3>{task.title}</h3>
                        <span className={`mini-category mini-category--${task.category}`}>
                          <CategoryIcon category={task.category} size={13} />
                          {categories[task.category].label}
                        </span>
                      </div>
                      {completion ? (
                        <div className="timeline__reflection">
                          <Quote size={13} strokeWidth={1.8} aria-hidden="true" />
                          <p>{completion.reflection}</p>
                          <button
                            type="button"
                            className="text-button"
                            onClick={() => onOpenReflection(task, completion)}
                          >
                            {t('today.review')}
                          </button>
                        </div>
                      ) : (
                        <div className="timeline__actions">
                          <button
                            type="button"
                            className="text-button"
                            onClick={() => onOpenPresence(task)}
                          >
                            <Sparkles size={14} /> {t('today.prepare')}
                          </button>
                          <button
                            type="button"
                            className="button button--soft button--tiny"
                            onClick={() => onOpenReflection(task)}
                          >
                            <Check size={14} /> {t('today.complete')}
                          </button>
                        </div>
                      )}
                    </div>
                  </li>
                )
              })}
            </ol>
          )}

          <p className="panel__foot">{t('today.dayFoot')}</p>
        </article>

        <article className="panel good-panel">
          <header className="panel__header">
            <div>
              <p className="eyebrow">{t('today.goodPanelEyebrow')}</p>
              <h2>{t('today.goodPanelTitle')}</h2>
            </div>
            <span
              className={`good-panel__count ${todayGoodActions.length === 3 ? 'is-complete' : ''}`}
            >
              <span className="visually-hidden">
                {t('a11y.goodGoal', { n: todayGoodActions.length })}
              </span>
              <span aria-hidden="true">{todayGoodActions.length}/3</span>
            </span>
          </header>

          <p className="good-panel__lede">{t('today.goodPanelLede')}</p>

          <div className="good-slots">
            {[0, 1, 2].map((index) => {
              const action = todayGoodActions[index]
              if (action) {
                const meta = actions[action.type]
                return (
                  <button
                    key={action.id}
                    type="button"
                    className={`good-slot good-slot--filled good-slot--${action.type}`}
                    onClick={() => onOpenGoodAction(action)}
                  >
                    <span className="good-slot__icon">
                      <GoodActionIcon type={action.type} size={17} />
                    </span>
                    <span className="good-slot__body">
                      <small>{meta.label}</small>
                      <strong>{action.description}</strong>
                    </span>
                    <Check className="good-slot__check" size={16} />
                  </button>
                )
              }
              return (
                <button
                  key={`empty-${index}`}
                  type="button"
                  className="good-slot good-slot--empty"
                  onClick={() => onOpenGoodAction(null)}
                >
                  <span className="good-slot__number">{index + 1}</span>
                  <span className="good-slot__body">
                    <strong>{t('today.registerGesture')}</strong>
                    <small>
                      {t(
                        index === 0
                          ? 'today.goodSlot1'
                          : index === 1
                            ? 'today.goodSlot2'
                            : 'today.goodSlot3',
                      )}
                    </small>
                  </span>
                  <Plus size={17} className="good-slot__plus" />
                </button>
              )
            })}
          </div>

          {todayGoodActions.length === 3 ? (
            <div className="good-panel__complete">
              <span>
                <CheckCircle2 size={18} /> {t('today.goodCompleteTitle')}
              </span>
              <p>{t('today.goodCompleteDesc')}</p>
            </div>
          ) : (
            <button
              type="button"
              className="text-button good-panel__link"
              onClick={() => onNavigate('gestos')}
            >
              {t('today.seeIdeasHistory')} <ChevronRight size={15} />
            </button>
          )}
        </article>
      </section>

      <section className="today-bottom">
        <article className="panel week-panel">
          <header className="panel__header">
            <div>
              <p className="eyebrow">{t('today.weekEyebrow')}</p>
              <h2>{t('today.weekTitle')}</h2>
            </div>
            <span className="week-panel__total">
              {t('today.weekGestures', {
                n: week.reduce((sum, day) => sum + day.count, 0),
              })}
            </span>
          </header>
          <div
            className="week-strip"
            role="group"
            aria-label={t('a11y.weekLabel')}
          >
            {week.map((day) => {
              const level = day.count === 0 ? 0 : day.count === 1 ? 1 : day.count <= 3 ? 2 : 3
              const label = t('today.weekTooltip', {
                date: formatShortDate(day.date),
                micro: day.micro,
                good: day.good,
              })
              return (
                <div
                  key={day.key}
                  className={`week-day week-day--level-${level} ${day.key === today ? 'is-today' : ''}`}
                  role="img"
                  aria-label={label}
                  title={label}
                >
                  <span className="week-day__bar">
                    <span />
                  </span>
                  <strong>{day.date.getDate()}</strong>
                  <small>{formatWeekday(day.date).slice(0, 3)}</small>
                </div>
              )
            })}
          </div>
          <div className="week-panel__foot">
            <span>{t('today.daysWithGesture', { n: activeDays })}</span>
            <span>
              {t('today.sparksSaved', { n: data.completions.length })}
            </span>
          </div>
        </article>

        <article className="panel method-mini">
          <p className="eyebrow">{t('today.methodEyebrow')}</p>
          <h2>{t('today.methodTitle')}</h2>
          <div className="method-mini__steps">
            <div>
              <span>1</span>
              <p>
                <strong>{t('today.methodBefore')}</strong>
                {t('today.methodBeforeDesc')}
              </p>
            </div>
            <div>
              <span>2</span>
              <p>
                <strong>{t('today.methodDuring')}</strong>
                {t('today.methodDuringDesc')}
              </p>
            </div>
            <div>
              <span>3</span>
              <p>
                <strong>{t('today.methodAfter')}</strong>
                {t('today.methodAfterDesc')}
              </p>
            </div>
          </div>
          <button
            type="button"
            className="text-button"
            onClick={() => onNavigate('metodo')}
          >
            {t('today.understandMethod')} <ArrowRight size={15} />
          </button>
        </article>
      </section>

      <p className="today-signoff">
        <Flame size={15} /> {t('today.signoff', { time: formatTime(now) })}
      </p>
    </div>
  )
}
