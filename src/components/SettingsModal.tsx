import { useEffect, useState } from 'react'
import {
  Bell,
  Database,
  Download,
  ExternalLink,
  HeartHandshake,
  Info,
  RotateCcw,
  ShieldCheck,
  Smartphone,
  Trash2,
  UserRound,
} from 'lucide-react'
import { Modal } from './Modal'
import { LanguageSwitch } from './LanguageSwitch'
import { useApp } from '../store/AppStore'
import { useToast } from './Toast'
import type { SettingsTab } from './Layout'
import {
  clearReminders,
  closeAllNotifications,
  notificationPermission,
  notificationsSupported,
  registerPeriodicSync,
  requestNotificationPermission,
  sendTestNotification,
  syncReminders,
  type PermissionState,
} from '../lib/notifications'
import { exportData } from '../lib/storage'
import { formatFullDate } from '../lib/date'
import { useI18n } from '../i18n/I18nProvider'
import type { TranslationKey } from '../i18n/translations'

interface SettingsModalProps {
  open: boolean
  onClose: () => void
  initialTab?: SettingsTab
  onInstall: () => void
  canInstall: boolean
  isStandalone: boolean
  isIos: boolean
  onOpenMethod: () => void
}

const TABS: { key: SettingsTab; labelKey: TranslationKey; icon: typeof UserRound }[] = [
  { key: 'perfil', labelKey: 'settings.tabProfile', icon: UserRound },
  { key: 'lembretes', labelKey: 'settings.tabReminders', icon: Bell },
  { key: 'dados', labelKey: 'settings.tabData', icon: Database },
]

export function SettingsModal({
  open,
  onClose,
  initialTab = 'perfil',
  onInstall,
  canInstall,
  isStandalone,
  isIos,
  onOpenMethod,
}: SettingsModalProps) {
  const {
    data,
    updateProfile,
    updateSettings,
    resetData,
    replayOnboarding,
  } = useApp()
  const { pushToast } = useToast()
  const { t, locale } = useI18n()
  const [tab, setTab] = useState<SettingsTab>(initialTab)
  const [permission, setPermission] = useState<PermissionState>(() =>
    notificationPermission(),
  )
  const [resetConfirm, setResetConfirm] = useState(false)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (!open) return
    setTab(initialTab)
    setPermission(notificationPermission())
    setResetConfirm(false)
  }, [initialTab, open])

  const supported = notificationsSupported()
  const granted = permission === 'granted'
  const notificationsOn = data.settings.notificationsEnabled && granted

  const enableNotifications = async () => {
    if (!supported) {
      pushToast({
        title: t('settings.statusUnsupported'),
        description: t('onboarding.unsupportedDesc'),
        tone: 'warning',
      })
      return
    }
    setBusy(true)
    const nextPermission = await requestNotificationPermission()
    setPermission(nextPermission)
    if (nextPermission === 'granted') {
      updateSettings({ notificationsEnabled: true })
      await syncReminders(
        data.tasks,
        {
          ...data.settings,
          notificationsEnabled: true,
        },
        data.completions,
        locale,
      )
      await registerPeriodicSync()
      pushToast({
        title: t('settings.enabledTitle'),
        description: t('settings.enabledDesc'),
        tone: 'success',
      })
    } else {
      updateSettings({ notificationsEnabled: false })
      pushToast({
        title: t('settings.deniedTitle'),
        description: t('settings.deniedDesc'),
        tone: 'warning',
      })
    }
    setBusy(false)
  }

  const disableNotifications = async () => {
    updateSettings({ notificationsEnabled: false })
    await clearReminders()
    await closeAllNotifications()
    pushToast({
      title: t('settings.disabledTitle'),
      description: t('settings.disabledDesc'),
    })
  }

  const testNotification = async () => {
    if (!supported) return
    setBusy(true)
    let currentPermission = permission
    if (currentPermission !== 'granted') {
      currentPermission = await requestNotificationPermission()
      setPermission(currentPermission)
    }
    if (currentPermission !== 'granted') {
      pushToast({
        title: t('settings.permissionTitle'),
        description: t('settings.permissionDesc'),
        tone: 'warning',
      })
      setBusy(false)
      return
    }
    const sent = await sendTestNotification(locale)
    pushToast({
      title: t(sent ? 'settings.testSentTitle' : 'settings.testFailedTitle'),
      description: t(
        sent ? 'settings.testSentDesc' : 'settings.testFailedDesc',
      ),
      tone: sent ? 'success' : 'warning',
    })
    setBusy(false)
  }

  const changeLead = (lead: 0 | 5 | 10) => {
    updateSettings({ reminderLead: lead })
    if (data.settings.notificationsEnabled && granted) {
      void syncReminders(
        data.tasks,
        { ...data.settings, reminderLead: lead },
        data.completions,
        locale,
      )
    }
  }

  const doReset = () => {
    resetData()
    setResetConfirm(false)
    onClose()
    pushToast({
      title: t('settings.resetTitle'),
      description: t('settings.resetDesc'),
    })
  }

  const installDescription = isStandalone
    ? t('settings.installStandalone')
    : canInstall
      ? t('settings.installAvailable')
      : isIos
        ? t('settings.installIos')
        : t('settings.installOther')

  return (
    <Modal
      open={open}
      onClose={onClose}
      eyebrow={t('settings.eyebrow')}
      title={t('settings.title')}
      size="lg"
      className="settings-modal"
    >
      <div className="settings-tabs" role="tablist" aria-label={t('settings.tabsAria')}>
        {TABS.map((item) => {
          const Icon = item.icon
          const active = tab === item.key
          return (
            <button
              key={item.key}
              type="button"
              role="tab"
              aria-selected={active}
              className={`settings-tab ${active ? 'is-active' : ''}`}
              onClick={() => setTab(item.key)}
            >
              <Icon size={16} strokeWidth={1.8} /> {t(item.labelKey)}
            </button>
          )
        })}
      </div>

      {tab === 'perfil' ? (
        <div className="settings-panel" role="tabpanel">
          <section className="settings-section">
            <div className="settings-section__heading">
              <h3>{t('settings.nameQuestion')}</h3>
              <p>{t('settings.nameHelp')}</p>
            </div>
            <input
              className="input"
              value={data.profile.name}
              onChange={(event) =>
                updateProfile({ name: event.target.value.slice(0, 40) })
              }
              placeholder={t('settings.namePlaceholder')}
              maxLength={40}
              autoComplete="given-name"
              data-autofocus
            />
          </section>

          <section className="settings-section">
            <div className="settings-section__heading">
              <h3>{t('settings.languageTitle')}</h3>
              <p>{t('settings.languageHelp')}</p>
            </div>
            <LanguageSwitch />
          </section>

          <section className="settings-section">
            <div className="settings-section__heading">
              <h3>{t('settings.startTitle')}</h3>
              <p>
                {t('settings.startDesc', {
                  date: formatFullDate(new Date(data.profile.createdAt)),
                })}
              </p>
            </div>
            <button
              type="button"
              className="settings-row-button"
              onClick={() => {
                replayOnboarding()
                onClose()
              }}
            >
              <RotateCcw size={17} strokeWidth={1.8} />
              {t('settings.replay')}
            </button>
          </section>

          <section className="settings-section">
            <div className="settings-section__heading">
              <h3>{t('settings.aboutTitle')}</h3>
              <p>{t('settings.aboutDesc')}</p>
            </div>
            <button type="button" className="settings-row-button" onClick={onOpenMethod}>
              <Info size={17} strokeWidth={1.8} />
              {t('settings.methodLink')}
            </button>
          </section>
        </div>
      ) : null}

      {tab === 'lembretes' ? (
        <div className="settings-panel" role="tabpanel">
          <section className="settings-section">
            <div className="settings-toggle-row">
              <div>
                <h3>{t('settings.remindersTitle')}</h3>
                <p>{t('settings.remindersDesc')}</p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={notificationsOn}
                aria-label={t('settings.switchAria')}
                className={`switch ${notificationsOn ? 'is-on' : ''}`}
                disabled={busy || !supported}
                onClick={() => {
                  if (notificationsOn) void disableNotifications()
                  else void enableNotifications()
                }}
              >
                <span className="switch__thumb" />
              </button>
            </div>

            <div className={`permission-status permission-status--${permission}`}>
              <Bell size={16} strokeWidth={1.8} />
              <span>
                {!supported
                  ? t('settings.statusUnsupported')
                  : permission === 'granted'
                    ? notificationsOn
                      ? t('settings.statusOn')
                      : t('settings.statusGrantedOff')
                    : permission === 'denied'
                      ? t('settings.statusDenied')
                      : t('settings.statusDefault')}
              </span>
            </div>
          </section>

          <section className="settings-section">
            <div className="settings-section__heading">
              <h3>{t('settings.whenTitle')}</h3>
              <p>{t('settings.whenDesc')}</p>
            </div>
            <div className="segmented" role="group" aria-label={t('settings.leadAria')}>
              {[
                { value: 0 as const, labelKey: 'settings.leadNow' as const },
                { value: 5 as const, labelKey: 'settings.lead5' as const },
                { value: 10 as const, labelKey: 'settings.lead10' as const },
              ].map((option) => (
                <button
                  key={option.value}
                  type="button"
                  className={`segmented__item ${data.settings.reminderLead === option.value ? 'is-active' : ''}`}
                  aria-pressed={data.settings.reminderLead === option.value}
                  onClick={() => changeLead(option.value)}
                >
                  {t(option.labelKey)}
                </button>
              ))}
            </div>
            <button
              type="button"
              className="button button--ghost button--small"
              onClick={() => void testNotification()}
              disabled={busy || !supported || permission === 'denied'}
            >
              <Bell size={15} /> {t('settings.test')}
            </button>
          </section>

          <section className="settings-section settings-section--note">
            <div className="settings-section__heading">
              <h3>{t('settings.betterTitle')}</h3>
            </div>
            <ul className="settings-list">
              <li>{t('settings.better1')}</li>
              <li>{t('settings.better2')}</li>
              <li>{t('settings.better3')}</li>
            </ul>
          </section>
        </div>
      ) : null}

      {tab === 'dados' ? (
        <div className="settings-panel" role="tabpanel">
          <section className="settings-section">
            <div className="settings-section__heading">
              <h3>{t('settings.localTitle')}</h3>
              <p>{t('settings.localDesc')}</p>
            </div>
            <div className="data-stats">
              <div>
                <strong>{data.completions.length}</strong>
                <span>{t('settings.statsSparks')}</span>
              </div>
              <div>
                <strong>{data.goodActions.length}</strong>
                <span>{t('settings.statsGood')}</span>
              </div>
              <div>
                <strong>{data.tasks.length}</strong>
                <span>{t('settings.statsTasks')}</span>
              </div>
            </div>
            <button
              type="button"
              className="settings-row-button"
              onClick={() => {
                exportData(data)
                pushToast({
                  title: t('settings.exportTitle'),
                  description: t('settings.exportDesc'),
                  tone: 'success',
                })
              }}
            >
              <Download size={17} strokeWidth={1.8} />
              {t('settings.export')}
            </button>
          </section>

          <section className="settings-section">
            <div className="settings-section__heading">
              <h3>{t('settings.installTitle')}</h3>
              <p>{installDescription}</p>
            </div>
            {canInstall ? (
              <button type="button" className="settings-row-button" onClick={onInstall}>
                <Smartphone size={17} strokeWidth={1.8} />
                {t('settings.installNow')}
              </button>
            ) : null}
          </section>

          <section className="settings-section settings-section--danger">
            <div className="settings-section__heading">
              <h3>{t('settings.eraseTitle')}</h3>
              <p>{t('settings.eraseDesc')}</p>
            </div>
            {resetConfirm ? (
              <div className="reset-confirm">
                <p>{t('settings.resetConfirm')}</p>
                <div className="reset-confirm__actions">
                  <button
                    type="button"
                    className="button button--ghost button--small"
                    onClick={() => setResetConfirm(false)}
                  >
                    {t('settings.keepData')}
                  </button>
                  <button
                    type="button"
                    className="button button--danger button--small"
                    onClick={doReset}
                  >
                    {t('settings.eraseAll')}
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                className="settings-row-button settings-row-button--danger"
                onClick={() => setResetConfirm(true)}
              >
                <Trash2 size={17} strokeWidth={1.8} />
                {t('settings.eraseAll')}
              </button>
            )}
          </section>

          <section className="settings-section settings-section--note">
            <div className="settings-section__heading">
              <h3>{t('settings.careTitle')}</h3>
            </div>
            <p className="settings-disclaimer">{t('settings.disclaimer')}</p>
            <div className="settings-links">
              <a href="https://www.cvv.org.br/" target="_blank" rel="noreferrer">
                <HeartHandshake size={15} /> {t('settings.cvv')}{' '}
                <ExternalLink size={12} />
              </a>
              <a
                href="https://www.youtube.com/watch?v=aw3ksUsDVEE"
                target="_blank"
                rel="noreferrer"
              >
                {t('settings.video')} <ExternalLink size={12} />
              </a>
            </div>
            <p className="settings-version">
              <ShieldCheck size={14} /> {t('settings.version')}
            </p>
          </section>
        </div>
      ) : null}
    </Modal>
  )
}
