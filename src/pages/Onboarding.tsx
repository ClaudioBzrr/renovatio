import { useEffect, useMemo, useState } from 'react'
import {
  ArrowLeft,
  ArrowRight,
  Bell,
  Check,
  Download,
  HeartHandshake,
  LockKeyhole,
  Smartphone,
  Sparkles,
} from 'lucide-react'
import { Brand, BrandMark } from '../components/Brand'
import { CategoryIcon, GoodActionIcon } from '../components/CategoryIcon'
import { LanguageSwitch } from '../components/LanguageSwitch'
import { useApp } from '../store/AppStore'
import { useToast } from '../components/Toast'
import {
  notificationPermission,
  notificationsSupported,
  requestNotificationPermission,
  type PermissionState,
} from '../lib/notifications'
import { GOOD_ACTION_KEYS } from '../data/suggestions'
import { ALL_DAYS } from '../lib/date'
import type { CategoryKey } from '../types'
import { useI18n } from '../i18n/I18nProvider'
import { useCategoryMeta, useGoodActionMeta } from '../i18n/useMeta'
import { storeErrorKey } from '../i18n/errors'
import type { TranslationKey } from '../i18n/translations'

interface OnboardingProps {
  onFinish: () => void
  onBackToLanding: () => void
  onInstall: () => void
  canInstall: boolean
  isStandalone: boolean
  isIos: boolean
}

const STARTERS: {
  titleKey: TranslationKey
  category: CategoryKey
  time: string
}[] = [
  { titleKey: 'suggestions.walk', category: 'corpo', time: '08:00' },
  { titleKey: 'suggestions.music', category: 'sentidos', time: '10:00' },
  { titleKey: 'suggestions.message', category: 'conexao', time: '12:00' },
]

export function Onboarding({
  onFinish,
  onBackToLanding,
  onInstall,
  canInstall,
  isStandalone,
  isIos,
}: OnboardingProps) {
  const {
    data,
    addTask,
    updateProfile,
    updateSettings,
    completeOnboarding,
  } = useApp()
  const { pushToast } = useToast()
  const { t } = useI18n()
  const categories = useCategoryMeta()
  const actions = useGoodActionMeta()
  const [step, setStep] = useState(0)
  const [name, setName] = useState(data.profile.name)
  const [selectedStarter, setSelectedStarter] = useState(0)
  const [customTitle, setCustomTitle] = useState('')
  const [time, setTime] = useState(STARTERS[0].time)
  const [permission, setPermission] = useState<PermissionState>(() =>
    notificationPermission(),
  )
  const [notificationsWanted, setNotificationsWanted] = useState(
    notificationPermission() === 'granted',
  )
  const [requesting, setRequesting] = useState(false)

  const hasTasks = data.tasks.length > 0
  const supported = notificationsSupported()
  const chosenTitle =
    customTitle.trim() || t(STARTERS[selectedStarter].titleKey)
  const chosenCategory = STARTERS[selectedStarter].category
  const category = useMemo(
    () => categories[chosenCategory],
    [categories, chosenCategory],
  )

  useEffect(() => {
    setPermission(notificationPermission())
  }, [])

  const saveName = () => {
    if (name.trim() !== data.profile.name) {
      updateProfile({ name: name.trim().slice(0, 40) })
    }
  }

  const finish = (skipTask = false) => {
    saveName()
    if (!skipTask && !hasTasks && chosenTitle) {
      const result = addTask({
        title: chosenTitle,
        category: chosenCategory,
        time,
        days: ALL_DAYS,
      })
      if (!result.ok) {
        pushToast({
          title: t('onboarding.createErrorTitle'),
          description: t(storeErrorKey(result.error)),
          tone: 'warning',
        })
      }
    }
    if (permission === 'granted' && notificationsWanted) {
      updateSettings({ notificationsEnabled: true })
    } else if (!notificationsWanted) {
      updateSettings({ notificationsEnabled: false })
    }
    completeOnboarding()
    onFinish()
  }

  const askNotifications = async () => {
    if (!supported) {
      pushToast({
        title: t('onboarding.unsupportedTitle'),
        description: t('onboarding.unsupportedDesc'),
        tone: 'warning',
      })
      return
    }
    setRequesting(true)
    const next = await requestNotificationPermission()
    setPermission(next)
    setNotificationsWanted(next === 'granted')
    setRequesting(false)
  }

  return (
    <div className="onboarding">
      <aside className="onboarding__aside">
        <Brand light />
        <div className="onboarding__aside-copy">
          <p className="eyebrow">{t('onboarding.asideEyebrow')}</p>
          <h1>
            {t('onboarding.asideTitle')}
            <br />
            <em>{t('onboarding.asideTitleEm')}</em>
          </h1>
          <p>{t('onboarding.asideText')}</p>
          <div className="onboarding__steps">
            <span>
              <strong>1</strong> {t('common.want')}
            </span>
            <span className="onboarding__steps-line" aria-hidden="true" />
            <span>
              <strong>2</strong> {t('common.like')}
            </span>
            <span className="onboarding__steps-line" aria-hidden="true" />
            <span>
              <strong>3</strong> {t('common.learn')}
            </span>
          </div>
        </div>
        <p className="onboarding__aside-foot">
          <LockKeyhole size={14} /> {t('onboarding.asideFoot')}
        </p>
      </aside>

      <main className="onboarding__main">
        <div className="onboarding__top">
          {step > 0 ? (
            <button
              type="button"
              className="onboarding__back"
              onClick={() => setStep((current) => current - 1)}
            >
              <ArrowLeft size={16} /> {t('common.back')}
            </button>
          ) : (
            <button
              type="button"
              className="onboarding__back"
              onClick={onBackToLanding}
            >
              <ArrowLeft size={16} /> {t('onboarding.backToLanding')}
            </button>
          )}
          <div className="onboarding__top-actions">
            <LanguageSwitch compact />
            <button type="button" className="text-button" onClick={() => finish(true)}>
              {t('common.skip')}
            </button>
          </div>
        </div>

        <div className="onboarding__progress" aria-hidden="true">
          {[0, 1, 2, 3].map((index) => (
            <span key={index} className={index <= step ? 'is-active' : ''} />
          ))}
        </div>

        <div className="onboarding__panel">
          {step === 0 ? (
            <div className="onboarding__step">
              <p className="eyebrow">{t('onboarding.step0Eyebrow')}</p>
              <h2>{t('onboarding.step0Title')}</h2>
              <p className="onboarding__lede">{t('onboarding.step0Lede')}</p>
              <div className="field">
                <label className="field__label" htmlFor="onboarding-name">
                  {t('onboarding.nameLabel')}{' '}
                  <span className="field__optional">({t('common.optional')})</span>
                </label>
                <input
                  id="onboarding-name"
                  data-autofocus
                  className="input"
                  value={name}
                  onChange={(event) => setName(event.target.value.slice(0, 40))}
                  placeholder={t('onboarding.namePlaceholder')}
                  autoComplete="given-name"
                  maxLength={40}
                />
              </div>
              <button
                type="button"
                className="button button--primary button--wide"
                onClick={() => {
                  saveName()
                  setStep(1)
                }}
              >
                {t('common.start')} <ArrowRight size={17} />
              </button>
              <p className="onboarding__fine">
                <HeartHandshake size={14} /> {t('onboarding.fineSupport')}
              </p>
            </div>
          ) : null}

          {step === 1 ? (
            <div className="onboarding__step">
              <p className="eyebrow">{t('onboarding.step1Eyebrow')}</p>
              <h2>{t('onboarding.step1Title')}</h2>
              <p className="onboarding__lede">{t('onboarding.step1Lede')}</p>

              {hasTasks ? (
                <div className="onboarding__existing">
                  <Check size={18} />
                  <div>
                    <strong>
                      {t('onboarding.existingTitle', { n: data.tasks.length })}
                    </strong>
                    <p>{t('onboarding.existingDesc')}</p>
                  </div>
                </div>
              ) : (
                <>
                  <div className="starter-list">
                    {STARTERS.map((starter, index) => {
                      const selected =
                        selectedStarter === index && !customTitle.trim()
                      const starterTitle = t(starter.titleKey)
                      return (
                        <button
                          key={starter.titleKey}
                          type="button"
                          className={`starter-card ${selected ? 'is-selected' : ''}`}
                          aria-pressed={selected}
                          onClick={() => {
                            setSelectedStarter(index)
                            setTime(starter.time)
                            setCustomTitle('')
                          }}
                        >
                          <span
                            className={`starter-card__icon starter-card__icon--${starter.category}`}
                          >
                            <CategoryIcon category={starter.category} size={19} />
                          </span>
                          <span>
                            <strong>{starterTitle}</strong>
                            <small>
                              {categories[starter.category].label} · {starter.time}
                            </small>
                          </span>
                          <span className="starter-card__check" aria-hidden="true">
                            {selected ? <Check size={15} /> : null}
                          </span>
                        </button>
                      )
                    })}
                  </div>

                  <div className="onboarding__custom">
                    <div className="field">
                      <label className="field__label" htmlFor="onboarding-task">
                        {t('onboarding.customLabel')}
                      </label>
                      <input
                        id="onboarding-task"
                        className="input"
                        value={customTitle}
                        onChange={(event) => setCustomTitle(event.target.value)}
                        placeholder={t('onboarding.customPlaceholder')}
                        maxLength={80}
                      />
                    </div>
                    <div className="field field--time">
                      <label className="field__label" htmlFor="onboarding-time">
                        {t('onboarding.timeLabel')}
                      </label>
                      <input
                        id="onboarding-time"
                        type="time"
                        className="input"
                        value={time}
                        onChange={(event) => setTime(event.target.value)}
                        step={300}
                      />
                    </div>
                  </div>
                </>
              )}

              <button
                type="button"
                className="button button--primary button--wide"
                onClick={() => setStep(2)}
              >
                {t(
                  hasTasks
                    ? 'common.continue'
                    : 'onboarding.continueWith',
                )}{' '}
                <ArrowRight size={17} />
              </button>
              <p className="onboarding__fine">
                {hasTasks ? (
                  <>
                    <Sparkles size={14} /> {t('onboarding.fineExisting')}
                  </>
                ) : (
                  <>
                    <CategoryIcon category={chosenCategory} size={14} />{' '}
                    {t('onboarding.fineCategory', {
                      category: category.label,
                      time,
                    })}
                  </>
                )}
              </p>
            </div>
          ) : null}

          {step === 2 ? (
            <div className="onboarding__step">
              <p className="eyebrow">{t('onboarding.step2Eyebrow')}</p>
              <h2>{t('onboarding.step2Title')}</h2>
              <p className="onboarding__lede">{t('onboarding.step2Lede')}</p>
              <div className="onboarding__actions-grid">
                {GOOD_ACTION_KEYS.map((key) => {
                  const meta = actions[key]
                  return (
                    <div key={key} className={`onboarding-action onboarding-action--${key}`}>
                      <span className="onboarding-action__icon">
                        <GoodActionIcon type={key} size={20} />
                      </span>
                      <strong>{meta.label}</strong>
                      <small>{meta.description}</small>
                    </div>
                  )
                })}
              </div>
              <div className="onboarding__callout">
                <strong>{t('onboarding.calloutTitle')}</strong>
                <p>{t('onboarding.calloutText')}</p>
              </div>
              <button
                type="button"
                className="button button--primary button--wide"
                onClick={() => setStep(3)}
              >
                {t('onboarding.understood')} <ArrowRight size={17} />
              </button>
            </div>
          ) : null}

          {step === 3 ? (
            <div className="onboarding__step">
              <p className="eyebrow">{t('onboarding.step3Eyebrow')}</p>
              <h2>{t('onboarding.step3Title')}</h2>
              <p className="onboarding__lede">{t('onboarding.step3Lede')}</p>

              <div className="notification-setup">
                <span
                  className={`notification-setup__icon ${permission === 'granted' ? 'is-on' : ''}`}
                >
                  <Bell size={22} strokeWidth={1.8} />
                </span>
                <div>
                  <strong>
                    {permission === 'granted'
                      ? t('onboarding.notifGrantedTitle')
                      : permission === 'denied'
                        ? t('onboarding.notifDeniedTitle')
                        : t('onboarding.notifDefaultTitle')}
                  </strong>
                  <p>
                    {permission === 'granted'
                      ? t('onboarding.notifGrantedDesc')
                      : permission === 'denied'
                        ? t('onboarding.notifDeniedDesc')
                        : t('onboarding.notifDefaultDesc')}
                  </p>
                </div>
                {permission === 'granted' ? (
                  <button
                    type="button"
                    role="switch"
                    aria-checked={notificationsWanted}
                    aria-label={t('onboarding.keepReminders')}
                    className={`switch ${notificationsWanted ? 'is-on' : ''}`}
                    onClick={() => setNotificationsWanted((current) => !current)}
                  >
                    <span className="switch__thumb" />
                  </button>
                ) : (
                  <button
                    type="button"
                    className="button button--ghost button--small"
                    onClick={() => void askNotifications()}
                    disabled={!supported || requesting}
                  >
                    {requesting ? t('onboarding.requesting') : t('onboarding.activate')}
                  </button>
                )}
              </div>

              <div className="onboarding__install">
                <div>
                  <strong>
                    {isStandalone
                      ? t('onboarding.installStandaloneTitle')
                      : t('onboarding.installTitle')}
                  </strong>
                  <p>
                    {isStandalone
                      ? t('onboarding.installStandaloneDesc')
                      : canInstall
                        ? t('onboarding.installAvailableDesc')
                        : isIos
                          ? t('onboarding.installIosDesc')
                          : t('onboarding.installOtherDesc')}
                  </p>
                </div>
                {canInstall && !isStandalone ? (
                  <button
                    type="button"
                    className="button button--ghost button--small"
                    onClick={onInstall}
                  >
                    <Download size={15} /> {t('common.install')}
                  </button>
                ) : (
                  <Smartphone
                    size={20}
                    strokeWidth={1.7}
                    className="onboarding__install-icon"
                  />
                )}
              </div>

              <button
                type="button"
                className="button button--primary button--wide"
                onClick={() => finish(false)}
              >
                {t('onboarding.enter')} <ArrowRight size={17} />
              </button>
              <p className="onboarding__fine">
                <LockKeyhole size={14} /> {t('onboarding.finePrivacy')}
              </p>
            </div>
          ) : null}
        </div>

        <div className="onboarding__footer">
          <span className="onboarding__footer-mark">
            <BrandMark size={20} />
          </span>
          <p>{t('onboarding.footer')}</p>
        </div>
      </main>
    </div>
  )
}
