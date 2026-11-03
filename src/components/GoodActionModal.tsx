import { useEffect, useMemo, useState } from 'react'
import { ArrowRight, Lightbulb } from 'lucide-react'
import { Modal } from './Modal'
import { GoodActionIcon } from './CategoryIcon'
import { useApp } from '../store/AppStore'
import { useToast } from './Toast'
import {
  GOOD_ACTION_IDEAS,
  GOOD_ACTION_KEYS,
} from '../data/suggestions'
import type { GoodAction, GoodActionType } from '../types'
import { dateKey } from '../lib/date'
import { useI18n } from '../i18n/I18nProvider'
import { useGoodActionMeta } from '../i18n/useMeta'
import { storeErrorKey } from '../i18n/errors'

interface GoodActionModalProps {
  open: boolean
  onClose: () => void
  action?: GoodAction | null
  initialType?: GoodActionType
  initialDescription?: string
}

export function GoodActionModal({
  open,
  onClose,
  action = null,
  initialType = 'gentileza',
  initialDescription = '',
}: GoodActionModalProps) {
  const { addGoodAction, updateGoodAction, data } = useApp()
  const { pushToast } = useToast()
  const { t } = useI18n()
  const actions = useGoodActionMeta()
  const [type, setType] = useState<GoodActionType>('gentileza')
  const [description, setDescription] = useState('')
  const [feeling, setFeeling] = useState('')
  const [error, setError] = useState('')

  const isEditing = action !== null
  const todayCount = data.goodActions.filter((item) => item.date === dateKey()).length
  const slotNumber = isEditing ? null : todayCount + 1

  useEffect(() => {
    if (!open) return
    setType(action?.type ?? initialType)
    setDescription(action?.description ?? initialDescription)
    setFeeling(action?.feeling ?? '')
    setError('')
  }, [action, initialDescription, initialType, open])

  const ideas = useMemo(() => GOOD_ACTION_IDEAS[type], [type])
  const meta = actions[type]

  const submit = () => {
    const input = { type, description, feeling }
    const result = isEditing
      ? updateGoodAction(action.id, input)
      : addGoodAction(input)
    if (!result.ok) {
      setError(t(storeErrorKey(result.error)))
      return
    }
    const completed = !isEditing && todayCount + 1 >= 3
    pushToast({
      title: t(
        completed ? 'goodAction.completedTitle' : 'goodAction.savedTitle',
      ),
      description: completed
        ? t('goodAction.completedDesc')
        : isEditing
          ? t('goodAction.editedDesc')
          : t('goodAction.savedDesc'),
      tone: 'success',
    })
    onClose()
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      eyebrow={t(isEditing ? 'goodAction.eyebrowEdit' : 'goodAction.eyebrowNew')}
      title={t(isEditing ? 'goodAction.titleEdit' : 'goodAction.titleNew')}
      size="md"
      footer={
        <div className="modal-actions modal-actions--split">
          <span className="modal-actions__hint">
            {isEditing
              ? t('goodAction.footerEdit')
              : t('goodAction.footerNew', { n: slotNumber ?? todayCount + 1 })}
          </span>
          <div className="modal-actions__buttons">
            <button type="button" className="button button--ghost" onClick={onClose}>
              {t('common.cancel')}
            </button>
            <button
              type="submit"
              form="good-action-form"
              className="button button--primary"
              disabled={description.trim().length < 6}
            >
              {t(isEditing ? 'goodAction.submitEdit' : 'goodAction.submitNew')}{' '}
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      }
    >
      <p className="modal-lede">{t('goodAction.lede')}</p>

      <form
        id="good-action-form"
        className="good-action-form"
        onSubmit={(event) => {
          event.preventDefault()
          submit()
        }}
      >
        <div className="field">
          <span className="field__label">{t('goodAction.typeQuestion')}</span>
          <div
            className="action-type-grid"
            role="group"
            aria-label={t('goodAction.typeAria')}
          >
            {GOOD_ACTION_KEYS.map((key) => {
              const item = actions[key]
              const selected = type === key
              return (
                <button
                  key={key}
                  type="button"
                  className={`action-type action-type--${key} ${selected ? 'is-selected' : ''}`}
                  aria-pressed={selected}
                  onClick={() => setType(key)}
                >
                  <span className="action-type__icon">
                    <GoodActionIcon type={key} size={19} />
                  </span>
                  <strong>{item.label}</strong>
                  <small>{item.description}</small>
                </button>
              )
            })}
          </div>
        </div>

        <div className="field">
          <label className="field__label" htmlFor="good-action-description">
            {meta.prompt}
          </label>
          <textarea
            id="good-action-description"
            data-autofocus
            className="textarea"
            rows={3}
            maxLength={600}
            value={description}
            onChange={(event) => {
              setDescription(event.target.value)
              setError('')
            }}
            placeholder={t('goodAction.placeholder')}
          />
          <div className="field__label-row field__label-row--bottom">
            <span className="field__help">{t('goodAction.help')}</span>
            <span className="field__hint">{description.length}/600</span>
          </div>
        </div>

        <div className="idea-box idea-box--compact">
          <div className="idea-box__heading">
            <span>
              <Lightbulb size={16} strokeWidth={1.8} />{' '}
              {t('goodAction.ideasFor', { type: meta.label.toLowerCase() })}
            </span>
          </div>
          <div className="idea-chips">
            {ideas.slice(0, 4).map((ideaKey) => {
              const idea = t(ideaKey)
              return (
                <button
                  key={ideaKey}
                  type="button"
                  className="idea-chip"
                  onClick={() => {
                    setDescription(idea)
                    setError('')
                  }}
                >
                  {idea}
                </button>
              )
            })}
          </div>
        </div>

        <div className="field">
          <label className="field__label" htmlFor="good-action-feeling">
            {t('goodAction.feelingLabel')}{' '}
            <span className="field__optional">({t('common.optional')})</span>
          </label>
          <input
            id="good-action-feeling"
            className="input"
            maxLength={600}
            value={feeling}
            onChange={(event) => setFeeling(event.target.value)}
            placeholder={t('goodAction.feelingPlaceholder')}
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
