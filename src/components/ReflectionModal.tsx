import { useEffect, useState } from 'react'
import { ArrowRight, Check, Eye, Quote } from 'lucide-react'
import { Modal } from './Modal'
import { CategoryIcon } from './CategoryIcon'
import { BrandMark } from './Brand'
import { useApp } from '../store/AppStore'
import type { MicroTask, TaskCompletion } from '../types'
import { closeTaskNotifications } from '../lib/notifications'
import { useI18n } from '../i18n/I18nProvider'
import { useCategoryMeta } from '../i18n/useMeta'
import { storeErrorKey } from '../i18n/errors'
import type { TranslationKey } from '../i18n/translations'

const PROMPTS: TranslationKey[] = [
  'reflection.prompt0',
  'reflection.prompt1',
  'reflection.prompt2',
  'reflection.prompt3',
  'reflection.prompt4',
  'reflection.prompt5',
]

interface ReflectionModalProps {
  open: boolean
  task: MicroTask | null
  completion?: TaskCompletion | null
  onClose: () => void
  onOpenHistory?: () => void
}

export function ReflectionModal({
  open,
  task,
  completion = null,
  onClose,
  onOpenHistory,
}: ReflectionModalProps) {
  const { completeTask } = useApp()
  const { t } = useI18n()
  const categories = useCategoryMeta()
  const [reflection, setReflection] = useState('')
  const [sensory, setSensory] = useState('')
  const [error, setError] = useState('')
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (!open) return
    setReflection(completion?.reflection ?? '')
    setSensory(completion?.sensoryNote ?? '')
    setError('')
    setSaved(false)
  }, [completion, open, task?.id])

  if (!task) return null

  const category = categories[task.category]
  const isEditing = completion !== null
  const canSave = reflection.trim().length >= 8

  const addPrompt = (prompt: string) => {
    setReflection((current) => {
      if (current.includes(prompt)) return current
      const next = current.trim() ? `${current.trim()} ${prompt.toLowerCase()}` : prompt
      return next.slice(0, 1200)
    })
    setError('')
  }

  const submit = () => {
    const result = completeTask(task.id, reflection, sensory)
    if (!result.ok) {
      setError(t(storeErrorKey(result.error)))
      return
    }
    setSaved(true)
    void closeTaskNotifications(task.id)
  }

  if (saved) {
    return (
      <Modal
        open={open}
        onClose={onClose}
        size="md"
        className="reflection-success-modal"
        ariaLabel={t(
          isEditing
            ? 'reflection.ariaSuccessEdit'
            : 'reflection.ariaSuccessNew',
        )}
      >
        <div className="reflection-success" role="status" aria-live="polite">
          <div className="reflection-success__glow" aria-hidden="true" />
          <span className="reflection-success__mark">
            <BrandMark size={64} />
          </span>
          <p className="eyebrow">{t('reflection.successEyebrow')}</p>
          <h2>
            {t(
              isEditing
                ? 'reflection.successEditTitle'
                : 'reflection.successNewTitle',
            )}
          </h2>
          <p className="reflection-success__lede">
            {t(
              isEditing
                ? 'reflection.successEditLede'
                : 'reflection.successNewLede',
            )}
          </p>
          <blockquote className="reflection-success__quote">
            <Quote size={18} strokeWidth={1.7} aria-hidden="true" />
            <p>{reflection.trim()}</p>
          </blockquote>
          {sensory.trim() ? (
            <p className="reflection-success__sensory">
              <Eye size={15} strokeWidth={1.8} /> {sensory.trim()}
            </p>
          ) : null}
          <div className="reflection-success__actions">
            <button type="button" className="button button--primary" onClick={onClose}>
              {t('reflection.backToDay')} <ArrowRight size={17} />
            </button>
            {onOpenHistory ? (
              <button
                type="button"
                className="button button--ghost"
                onClick={() => {
                  onClose()
                  onOpenHistory()
                }}
              >
                {t('reflection.seeHistory')}
              </button>
            ) : null}
          </div>
          <p className="reflection-success__foot">
            <Check size={14} /> {t('reflection.successFoot')}
          </p>
        </div>
      </Modal>
    )
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      eyebrow={t(isEditing ? 'reflection.eyebrowEdit' : 'reflection.eyebrowNew')}
      title={t(isEditing ? 'reflection.titleEdit' : 'reflection.titleNew')}
      size="md"
      footer={
        <div className="modal-actions modal-actions--split">
          <button type="button" className="text-button" onClick={onClose}>
            {t('reflection.cancel')}
          </button>
          <button
            type="submit"
            form="reflection-form"
            className="button button--primary"
            disabled={!canSave}
          >
            {t(isEditing ? 'reflection.saveEdit' : 'reflection.saveNew')}
          </button>
        </div>
      }
    >
      <div className={`task-summary task-summary--${task.category}`}>
        <span className="task-summary__icon">
          <CategoryIcon category={task.category} size={19} />
        </span>
        <div>
          <p className="task-summary__meta">
            {task.time} · {category.label}
          </p>
          <p className="task-summary__title">{task.title}</p>
        </div>
      </div>

      <div className="method-steps" aria-label={t('reflection.stepsAria')}>
        <span>
          <strong>1</strong> {t('common.want')}
        </span>
        <span className="method-steps__arrow" aria-hidden="true">
          →
        </span>
        <span>
          <strong>2</strong> {t('common.like')}
        </span>
        <span className="method-steps__arrow" aria-hidden="true">
          →
        </span>
        <span className="is-current">
          <strong>3</strong> {t('common.learn')}
        </span>
      </div>

      <form
        id="reflection-form"
        onSubmit={(event) => {
          event.preventDefault()
          submit()
        }}
        className="reflection-form"
      >
        <div className="field">
          <label className="field__label" htmlFor="reflection-text">
            {t('reflection.question')}
          </label>
          <textarea
            id="reflection-text"
            data-autofocus
            className="textarea"
            rows={4}
            maxLength={1200}
            value={reflection}
            onChange={(event) => {
              setReflection(event.target.value)
              setError('')
            }}
            placeholder={t('reflection.placeholder')}
          />
          <div className="field__label-row field__label-row--bottom">
            <span className="field__help">{t('reflection.help')}</span>
            <span className="field__hint">{reflection.length}/1200</span>
          </div>
        </div>

        <div className="prompt-chips" aria-label={t('reflection.promptsAria')}>
          {PROMPTS.map((promptKey) => {
            const prompt = t(promptKey)
            return (
              <button
                key={promptKey}
                type="button"
                className="prompt-chip"
                onClick={() => addPrompt(prompt)}
              >
                + {prompt}
              </button>
            )
          })}
        </div>

        <div className="anti-damping">
          <span className="anti-damping__icon" aria-hidden="true">
            <Eye size={17} strokeWidth={1.8} />
          </span>
          <div>
            <strong>{t('reflection.antiTitle')}</strong>
            <p>{t('reflection.antiText')}</p>
          </div>
        </div>

        <div className="field">
          <label className="field__label" htmlFor="sensory-text">
            {t('reflection.sensoryLabel')}{' '}
            <span className="field__optional">({t('common.optional')})</span>
          </label>
          <input
            id="sensory-text"
            className="input"
            maxLength={500}
            value={sensory}
            onChange={(event) => setSensory(event.target.value)}
            placeholder={t('reflection.sensoryPlaceholder')}
          />
        </div>

        {error ? (
          <p className="form-error" role="alert">
            {error}
          </p>
        ) : null}
      </form>
    </Modal>
  )
}
