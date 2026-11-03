import { useEffect, useRef, useState } from 'react'
import { ArrowRight, Eye, Pause, Play, RotateCcw, Sparkles, TimerReset } from 'lucide-react'
import { Modal } from './Modal'
import { ProgressRing } from './ProgressRing'
import { BrandMark } from './Brand'
import { CategoryIcon } from './CategoryIcon'
import type { MicroTask } from '../types'
import { formatTime } from '../lib/date'
import { useI18n } from '../i18n/I18nProvider'
import { useCategoryMeta } from '../i18n/useMeta'
import type { TranslationKey } from '../i18n/translations'

type PresenceMode = 'anticipate' | 'notice'
type Screen = 'choose' | 'running' | 'done'

const DURATIONS: Record<PresenceMode, number> = {
  anticipate: 120,
  notice: 60,
}

const PROMPTS: Record<PresenceMode, TranslationKey[]> = {
  anticipate: [
    'presence.promptAnticipate0',
    'presence.promptAnticipate1',
    'presence.promptAnticipate2',
    'presence.promptAnticipate3',
  ],
  notice: [
    'presence.promptNotice0',
    'presence.promptNotice1',
    'presence.promptNotice2',
  ],
}

function formatCountdown(seconds: number): string {
  return `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`
}

interface PresenceModalProps {
  open: boolean
  task: MicroTask | null
  onClose: () => void
  onRegister: (task: MicroTask) => void
}

export function PresenceModal({ open, task, onClose, onRegister }: PresenceModalProps) {
  const { t } = useI18n()
  const categories = useCategoryMeta()
  const [screen, setScreen] = useState<Screen>('choose')
  const [mode, setMode] = useState<PresenceMode>('anticipate')
  const [remaining, setRemaining] = useState(DURATIONS.anticipate)
  const [running, setRunning] = useState(false)
  const endAtRef = useRef<number | null>(null)

  useEffect(() => {
    if (!open) return
    setScreen('choose')
    setMode('anticipate')
    setRemaining(DURATIONS.anticipate)
    setRunning(false)
    endAtRef.current = null
  }, [open, task?.id])

  useEffect(() => {
    if (screen !== 'running' || !running) return
    const tick = () => {
      if (endAtRef.current === null) return
      const next = Math.max(0, Math.ceil((endAtRef.current - Date.now()) / 1000))
      setRemaining(next)
      if (next <= 0) {
        setRunning(false)
        setScreen('done')
      }
    }
    tick()
    const interval = window.setInterval(tick, 250)
    return () => window.clearInterval(interval)
  }, [running, screen])

  if (!task) return null

  const total = DURATIONS[mode]
  const progress = 1 - remaining / total
  const elapsed = total - remaining
  const promptList = PROMPTS[mode]
  const promptIndex =
    mode === 'anticipate'
      ? Math.min(promptList.length - 1, Math.floor(elapsed / 30))
      : Math.min(promptList.length - 1, Math.floor(elapsed / 20))
  const category = categories[task.category]

  const start = (nextMode: PresenceMode) => {
    setMode(nextMode)
    setRemaining(DURATIONS[nextMode])
    setScreen('running')
    setRunning(true)
    endAtRef.current = Date.now() + DURATIONS[nextMode] * 1000
  }

  const pause = () => {
    if (endAtRef.current !== null) {
      setRemaining(Math.max(0, Math.ceil((endAtRef.current - Date.now()) / 1000)))
    }
    setRunning(false)
  }

  const resume = () => {
    endAtRef.current = Date.now() + remaining * 1000
    setRunning(true)
  }

  const goToRegister = () => {
    onClose()
    onRegister(task)
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      eyebrow={t('presence.eyebrow')}
      title={t('presence.title')}
      size="md"
      className="presence-modal"
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

      {screen === 'choose' ? (
        <div className="presence-choose">
          <p className="presence-lede">{t('presence.lede')}</p>

          <div className="presence-options">
            <button
              type="button"
              className="presence-option presence-option--anticipate"
              onClick={() => start('anticipate')}
            >
              <span className="presence-option__icon">
                <Sparkles size={20} strokeWidth={1.8} />
              </span>
              <span className="presence-option__time">{t('common.minuteTwo')}</span>
              <strong>{t('presence.optionAnticipateTitle')}</strong>
              <small>{t('presence.optionAnticipateDesc')}</small>
              <span className="presence-option__cta">
                {t('common.want')} <ArrowRight size={15} />
              </span>
            </button>

            <button
              type="button"
              className="presence-option presence-option--notice"
              onClick={() => start('notice')}
            >
              <span className="presence-option__icon">
                <Eye size={20} strokeWidth={1.8} />
              </span>
              <span className="presence-option__time">{t('common.minuteOne')}</span>
              <strong>{t('presence.optionNoticeTitle')}</strong>
              <small>{t('presence.optionNoticeDesc')}</small>
              <span className="presence-option__cta">
                {t('common.like')} <ArrowRight size={15} />
              </span>
            </button>
          </div>

          <div className="presence-actions">
            <button type="button" className="button button--ghost" onClick={goToRegister}>
              {t('presence.alreadyDid')}
            </button>
          </div>

          <p className="presence-note">
            <TimerReset size={15} strokeWidth={1.8} /> {t('presence.note')}
          </p>
        </div>
      ) : null}

      {screen === 'running' ? (
        <div className="presence-timer">
          <div className="presence-timer__ring">
            <ProgressRing value={progress} size={188} stroke={6}>
              <span className="presence-timer__time">{formatCountdown(remaining)}</span>
              <span className="presence-timer__mode">
                {t(mode === 'anticipate' ? 'presence.modeBefore' : 'presence.modeDuring')}
              </span>
            </ProgressRing>
          </div>
          <p className="presence-timer__prompt" aria-live="polite">
            {t(promptList[promptIndex])}
          </p>
          <div className="presence-timer__controls">
            {running ? (
              <button type="button" className="button button--dark" onClick={pause}>
                <Pause size={16} /> {t('presence.pause')}
              </button>
            ) : (
              <button type="button" className="button button--dark" onClick={resume}>
                <Play size={16} /> {t('presence.resume')}
              </button>
            )}
            <button
              type="button"
              className="button button--ghost"
              onClick={() => setScreen('choose')}
            >
              {t('presence.back')}
            </button>
          </div>
          <button type="button" className="text-button presence-skip" onClick={goToRegister}>
            {t('presence.skipToRegister')}
          </button>
        </div>
      ) : null}

      {screen === 'done' ? (
        <div className="presence-done">
          <span className="presence-done__mark">
            <BrandMark size={56} />
          </span>
          <p className="eyebrow">{t('presence.doneEyebrow')}</p>
          <h3>{t('presence.doneTitle')}</h3>
          <p>
            {t(
              mode === 'anticipate'
                ? 'presence.doneAnticipateText'
                : 'presence.doneNoticeText',
            )}
          </p>
          <div className="presence-done__actions">
            <button type="button" className="button button--primary" onClick={goToRegister}>
              {t('presence.register')} <ArrowRight size={17} />
            </button>
            <button
              type="button"
              className="button button--ghost"
              onClick={() => setScreen('choose')}
            >
              <RotateCcw size={16} /> {t('presence.doAgain')}
            </button>
          </div>
          <p className="presence-note">
            {formatTime(new Date())} · {t('presence.doneNote')}
          </p>
        </div>
      ) : null}
    </Modal>
  )
}
