import { useEffect, useMemo, useRef, useState } from 'react'
import { Clock3, Lightbulb, Sparkles } from 'lucide-react'
import { Modal } from './Modal'
import { CategoryIcon } from './CategoryIcon'
import { useApp } from '../store/AppStore'
import { useToast } from './Toast'
import { CATEGORY_KEYS, SUGGESTIONS } from '../data/suggestions'
import type { CategoryKey, MicroTask, TaskInput, Weekday } from '../types'
import { ALL_DAYS, daysLabel, getWeekdays } from '../lib/date'
import { useI18n } from '../i18n/I18nProvider'
import { useCategoryMeta } from '../i18n/useMeta'
import { storeErrorKey } from '../i18n/errors'

interface TaskFormModalProps {
  open: boolean
  onClose: () => void
  task?: MicroTask | null
  initialTitle?: string
  initialCategory?: CategoryKey
  initialTime?: string
  onSaved?: (id: string) => void
}

function suggestedTime(): string {
  const now = new Date()
  now.setMinutes(now.getMinutes() + 45)
  now.setMinutes(Math.ceil(now.getMinutes() / 15) * 15, 0, 0)
  if (now.getHours() >= 22) return '09:00'
  return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
}

export function TaskFormModal({
  open,
  onClose,
  task = null,
  initialTitle = '',
  initialCategory = 'corpo',
  initialTime,
  onSaved,
}: TaskFormModalProps) {
  const { addTask, updateTask, data, maxTasks } = useApp()
  const { pushToast } = useToast()
  const { t } = useI18n()
  const categories = useCategoryMeta()
  const weekdays = getWeekdays()
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState<CategoryKey>('corpo')
  const [time, setTime] = useState('09:00')
  const [days, setDays] = useState<Weekday[]>(ALL_DAYS)
  const [error, setError] = useState('')
  const [errorField, setErrorField] = useState<
    'title' | 'time' | 'days' | null
  >(null)
  const [ideaIndex, setIdeaIndex] = useState(0)
  const errorRef = useRef<HTMLParagraphElement>(null)

  useEffect(() => {
    if (error) errorRef.current?.focus()
  }, [error])

  const isEditing = task !== null
  const atLimit = !isEditing && data.tasks.length >= maxTasks

  useEffect(() => {
    if (!open) return
    setTitle(task?.title ?? initialTitle)
    setCategory(task?.category ?? initialCategory)
    setTime(task?.time ?? initialTime ?? suggestedTime())
    setDays(task?.days ?? ALL_DAYS)
    setError('')
    setErrorField(null)
    setIdeaIndex(0)
  }, [initialCategory, initialTime, initialTitle, open, task])

  const ideas = useMemo(
    () => SUGGESTIONS.filter((suggestion) => suggestion.category === category).slice(0, 4),
    [category],
  )

  const cycleIdea = () => {
    if (ideas.length === 0) return
    const next = ideas[ideaIndex % ideas.length]
    setTitle(t(next.titleKey))
    setTime(next.time ?? time)
    setIdeaIndex((current) => current + 1)
  }

  const toggleDay = (day: Weekday) => {
    setDays((current) =>
      current.includes(day)
        ? current.filter((item) => item !== day)
        : [...current, day].sort((a, b) => a - b),
    )
    setError('')
    setErrorField(null)
  }

  const submit = () => {
    const input: TaskInput = { title, category, time, days }
    const result = isEditing ? updateTask(task.id, input) : addTask(input)
    if (!result.ok) {
      const field =
        result.error === 'taskTitleShort'
          ? 'title'
          : result.error === 'timeRequired'
            ? 'time'
            : result.error === 'daysRequired'
              ? 'days'
              : null
      setErrorField(field)
      setError(t(storeErrorKey(result.error)))
      return
    }
    pushToast({
      title: t(isEditing ? 'taskForm.updatedTitle' : 'taskForm.createdTitle'),
      description: t(
        isEditing ? 'taskForm.updatedDesc' : 'taskForm.createdDesc',
      ),
      tone: 'success',
    })
    onClose()
    if (result.id) onSaved?.(result.id)
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      eyebrow={t(isEditing ? 'taskForm.eyebrowEdit' : 'taskForm.eyebrowNew')}
      title={t(isEditing ? 'taskForm.titleEdit' : 'taskForm.titleNew')}
      size="md"
      footer={
        <div className="modal-actions">
          <button type="button" className="button button--ghost" onClick={onClose}>
            {t('common.cancel')}
          </button>
          <button
            type="submit"
            form="task-form"
            className="button button--primary"
            disabled={atLimit}
          >
            {t(isEditing ? 'taskForm.submitEdit' : 'taskForm.submitNew')}
          </button>
        </div>
      }
    >
      {atLimit ? (
        <div className="inline-note inline-note--warning">
          {t('taskForm.limitNote', { max: maxTasks })}
        </div>
      ) : null}

      <form
        id="task-form"
        className="task-form"
        onSubmit={(event) => {
          event.preventDefault()
          submit()
        }}
      >
        <div className="field">
          <div className="field__label-row">
            <label htmlFor="task-title">{t('taskForm.question')}</label>
            <span className="field__hint">{title.length}/80</span>
          </div>
          <input
            id="task-title"
            data-autofocus
            className="input input--title"
            value={title}
            onChange={(event) => {
              setTitle(event.target.value)
              setError('')
              setErrorField(null)
            }}
            placeholder={t('taskForm.placeholder')}
            maxLength={80}
            autoComplete="off"
            aria-required="true"
            aria-invalid={errorField === 'title' || undefined}
            aria-describedby={errorField === 'title' ? 'task-form-error' : undefined}
          />
          <p className="field__help">{t('taskForm.help')}</p>
        </div>

        <div className="field">
          <span className="field__label">{t('taskForm.categoryQuestion')}</span>
          <div
            className="category-grid"
            role="group"
            aria-label={t('taskForm.categoryAria')}
          >
            {CATEGORY_KEYS.map((key) => {
              const meta = categories[key]
              const selected = category === key
              return (
                <button
                  key={key}
                  type="button"
                  className={`category-option category-option--${key} ${selected ? 'is-selected' : ''}`}
                  aria-pressed={selected}
                  onClick={() => setCategory(key)}
                >
                  <span className="category-option__icon">
                    <CategoryIcon category={key} size={18} />
                  </span>
                  <span>
                    <strong>{meta.label}</strong>
                    <small>{meta.description}</small>
                  </span>
                </button>
              )
            })}
          </div>
        </div>

        <div className="form-row">
          <div className="field">
            <label className="field__label" htmlFor="task-time">
              {t('taskForm.time')}
            </label>
            <div className="input-with-icon">
              <Clock3 size={17} strokeWidth={1.8} aria-hidden="true" />
              <input
                id="task-time"
                type="time"
                className="input"
                value={time}
                step={300}
                onChange={(event) => {
                  setTime(event.target.value)
                  setError('')
                  setErrorField(null)
                }}
                required
                aria-invalid={errorField === 'time' || undefined}
                aria-describedby={errorField === 'time' ? 'task-form-error' : undefined}
              />
            </div>
            <p className="field__help">{t('taskForm.timeHelp')}</p>
          </div>

          <div className="field">
            <span className="field__label">{t('taskForm.when')}</span>
            <div
              className="days-row"
              role="group"
              aria-label={t('taskForm.daysAria')}
              aria-invalid={errorField === 'days' || undefined}
              aria-describedby={errorField === 'days' ? 'task-form-error' : undefined}
            >
              {weekdays.map((weekday) => {
                const selected = days.includes(weekday.value)
                return (
                  <button
                    key={weekday.value}
                    type="button"
                    className={`day-chip ${selected ? 'is-selected' : ''}`}
                    aria-pressed={selected}
                    aria-label={weekday.long}
                    onClick={() => toggleDay(weekday.value)}
                  >
                    {weekday.short}
                  </button>
                )
              })}
            </div>
            <div className="days-actions">
              <button
                type="button"
                className="text-button"
                onClick={() => setDays(ALL_DAYS)}
              >
                {t('taskForm.everyDay')}
              </button>
              <span className="field__hint">{daysLabel(days)}</span>
            </div>
          </div>
        </div>

        <div className="idea-box">
          <div className="idea-box__heading">
            <span>
              <Lightbulb size={16} strokeWidth={1.8} />{' '}
              {t('taskForm.ideasFor', {
                category: categories[category].label.toLowerCase(),
              })}
            </span>
            <button type="button" className="text-button" onClick={cycleIdea}>
              <Sparkles size={14} /> {t('taskForm.useIdea')}
            </button>
          </div>
          <div className="idea-chips">
            {ideas.slice(0, 3).map((idea) => {
              const ideaTitle = t(idea.titleKey)
              return (
                <button
                  key={idea.titleKey}
                  type="button"
                  className="idea-chip"
                  onClick={() => {
                    setTitle(ideaTitle)
                    if (idea.time) setTime(idea.time)
                    setError('')
                  }}
                >
                  {ideaTitle}
                </button>
              )
            })}
          </div>
        </div>

        {error ? (
          <p
            ref={errorRef}
            id="task-form-error"
            className="form-error"
            role="alert"
            tabIndex={-1}
          >
            {error}
          </p>
        ) : null}
      </form>
    </Modal>
  )
}
