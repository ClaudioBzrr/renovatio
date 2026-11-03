import type { ReactNode } from 'react'
import {
  Bell,
  BookOpen,
  Compass,
  Download,
  HeartHandshake,
  ListChecks,
  Settings,
  Sun,
  WifiOff,
} from 'lucide-react'
import { Brand } from './Brand'
import { pathFor, type Route } from '../lib/navigation'
import { useI18n } from '../i18n/I18nProvider'
import type { TranslationKey } from '../i18n/translations'

export type SettingsTab = 'perfil' | 'lembretes' | 'dados'

const NAV_ITEMS: {
  route: Route
  labelKey: TranslationKey
  icon: typeof Sun
}[] = [
  { route: 'hoje', labelKey: 'nav.today', icon: Sun },
  { route: 'rotina', labelKey: 'nav.routine', icon: ListChecks },
  { route: 'gestos', labelKey: 'nav.gestures', icon: HeartHandshake },
  { route: 'historia', labelKey: 'nav.history', icon: BookOpen },
  { route: 'metodo', labelKey: 'nav.method', icon: Compass },
]

interface LayoutProps {
  route: Route
  navigate: (path: string) => void
  children: ReactNode
  onOpenSettings: (tab?: SettingsTab) => void
  onInstall: () => void
  canInstall: boolean
  notificationsOn: boolean
  online: boolean
}

export function Layout({
  route,
  navigate,
  children,
  onOpenSettings,
  onInstall,
  canInstall,
  notificationsOn,
  online,
}: LayoutProps) {
  const { t } = useI18n()

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <button
          type="button"
          className="sidebar__brand"
          onClick={() => navigate(pathFor('hoje'))}
          aria-label={t('nav.goToday')}
        >
          <Brand light />
        </button>

        <nav className="sidebar__nav" aria-label={t('nav.main')}>
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon
            const active = route === item.route
            return (
              <button
                key={item.route}
                type="button"
                className={`nav-item ${active ? 'nav-item--active' : ''}`}
                aria-current={active ? 'page' : undefined}
                onClick={() => navigate(pathFor(item.route))}
              >
                <Icon size={19} strokeWidth={1.8} />
                <span>{t(item.labelKey)}</span>
                {active ? <span className="nav-item__spark" aria-hidden="true" /> : null}
              </button>
            )
          })}
        </nav>

        <div className="sidebar__spacer" />

        <div className="sidebar__note">
          <span className="sidebar__note-mark" aria-hidden="true" />
          <p>{t('sidebar.quote')}</p>
        </div>

        {canInstall ? (
          <button type="button" className="sidebar__install" onClick={onInstall}>
            <Download size={17} strokeWidth={1.8} />
            {t('sidebar.install')}
          </button>
        ) : null}

        <button
          type="button"
          className="sidebar__settings"
          onClick={() => onOpenSettings('perfil')}
        >
          <Settings size={18} strokeWidth={1.8} />
          {t('nav.settings')}
          <span
            className={`status-dot ${notificationsOn ? 'status-dot--on' : ''}`}
            aria-label={
              notificationsOn
                ? t('nav.notificationsOn')
                : t('nav.notificationsOff')
            }
          />
        </button>
      </aside>

      <div className="main">
        <header className="mobile-topbar">
          <button
            type="button"
            className="mobile-topbar__brand"
            onClick={() => navigate(pathFor('hoje'))}
            aria-label={t('nav.goToday')}
          >
            <Brand compact />
          </button>
          <div className="mobile-topbar__actions">
            <button
              type="button"
              className="icon-button"
              onClick={() => onOpenSettings('lembretes')}
              aria-label={t('nav.reminderSettings')}
            >
              <Bell size={19} strokeWidth={1.8} />
              {!notificationsOn ? <span className="icon-button__dot" /> : null}
            </button>
            <button
              type="button"
              className="icon-button"
              onClick={() => onOpenSettings('perfil')}
              aria-label={t('nav.openSettings')}
            >
              <Settings size={19} strokeWidth={1.8} />
            </button>
          </div>
        </header>

        {!online ? (
          <div className="offline-banner" role="status">
            <WifiOff size={16} strokeWidth={1.8} />
            {t('offline.banner')}
          </div>
        ) : null}

        <div className="page-shell">{children}</div>
      </div>

      <nav className="bottom-nav" aria-label={t('nav.main')}>
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon
          const active = route === item.route
          return (
            <button
              key={item.route}
              type="button"
              className={`bottom-nav__item ${active ? 'bottom-nav__item--active' : ''}`}
              aria-current={active ? 'page' : undefined}
              onClick={() => navigate(pathFor(item.route))}
            >
              <span className="bottom-nav__icon">
                <Icon size={20} strokeWidth={active ? 2.1 : 1.7} />
              </span>
              <span>{t(item.labelKey)}</span>
            </button>
          )
        })}
      </nav>
    </div>
  )
}
