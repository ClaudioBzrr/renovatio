import { useCallback, useEffect, useRef, useState } from 'react'
import { useApp } from './store/AppStore'
import { useHashRoute, pathFor } from './lib/navigation'
import { useInstallPrompt } from './hooks/useInstallPrompt'
import { useOnline } from './hooks/useOnline'
import { useReminderEngine } from './hooks/useReminderEngine'
import { useToast } from './components/Toast'
import { Layout, type SettingsTab } from './components/Layout'
import { TaskFormModal } from './components/TaskFormModal'
import { ReflectionModal } from './components/ReflectionModal'
import { PresenceModal } from './components/PresenceModal'
import { GoodActionModal } from './components/GoodActionModal'
import { SettingsModal } from './components/SettingsModal'
import { BackupModal, type BackupMode } from './components/BackupModal'
import { Onboarding } from './pages/Onboarding'
import { TodayPage } from './pages/TodayPage'
import { RoutinePage } from './pages/RoutinePage'
import { GoodActionsPage } from './pages/GoodActionsPage'
import { HistoryPage } from './pages/HistoryPage'
import { MethodPage } from './pages/MethodPage'
import type {
  CategoryKey,
  GoodAction,
  GoodActionType,
  MicroTask,
  TaskCompletion,
} from './types'
import { notificationPermission } from './lib/notifications'
import { useI18n } from './i18n/I18nProvider'

interface TaskFormState {
  open: boolean
  taskId?: string
  title?: string
  category?: CategoryKey
  time?: string
}

interface GoodActionState {
  open: boolean
  actionId?: string
  type?: GoodActionType
  description?: string
}

interface ReflectionState {
  taskId: string
  completionId?: string
}

export function App() {
  const { data, today } = useApp()
  const { route, query, navigate } = useHashRoute()
  const { pushToast } = useToast()
  const { t } = useI18n()
  const { canInstall, isStandalone, isIos, install } = useInstallPrompt()
  const online = useOnline()

  const [settingsOpen, setSettingsOpen] = useState(false)
  const [settingsTab, setSettingsTab] = useState<SettingsTab>('perfil')
  const [backupMode, setBackupMode] = useState<BackupMode | null>(null)
  const [taskForm, setTaskForm] = useState<TaskFormState>({ open: false })
  const [goodAction, setGoodAction] = useState<GoodActionState>({ open: false })
  const [reflection, setReflection] = useState<ReflectionState | null>(null)
  const [presenceTaskId, setPresenceTaskId] = useState<string | null>(null)

  useEffect(() => {
    if (!navigator.storage?.persist) return
    void navigator.storage.persist().catch(() => {
      // O navegador pode negar; os registros continuam no armazenamento local.
    })
  }, [])

  const openPresenceById = useCallback(
    (taskId: string) => {
      const task = data.tasks.find((item) => item.id === taskId)
      if (task) setPresenceTaskId(task.id)
    },
    [data.tasks],
  )

  useReminderEngine({
    tasks: data.tasks,
    completions: data.completions,
    settings: data.settings,
    onOpenTask: openPresenceById,
  })

  const openReflection = useCallback(
    (task: MicroTask, completion?: TaskCompletion | null) => {
      const found =
        completion ??
        data.completions.find(
          (item) => item.taskId === task.id && item.date === today,
        ) ??
        null
      setReflection({ taskId: task.id, completionId: found?.id })
    },
    [data.completions, today],
  )

  const openGoodActionFromToday = useCallback((action?: GoodAction | null) => {
    setGoodAction({ open: true, actionId: action?.id })
  }, [])

  const openGoodActionFromPage = useCallback(
    (options?: {
      action?: GoodAction
      type?: GoodActionType
      description?: string
    }) => {
      setGoodAction({
        open: true,
        actionId: options?.action?.id,
        type: options?.type,
        description: options?.description,
      })
    },
    [],
  )

  const openTaskForm = useCallback(
    (options?: {
      task?: MicroTask
      title?: string
      category?: CategoryKey
      time?: string
    }) => {
      setTaskForm({
        open: true,
        taskId: options?.task?.id,
        title: options?.title,
        category: options?.category,
        time: options?.time,
      })
    },
    [],
  )

  const handleInstall = async () => {
    const result = await install()
    if (result === 'accepted') {
      pushToast({
        title: t('install.installedTitle'),
        description: t('install.installedDesc'),
        tone: 'success',
      })
      return
    }
    if (result === 'unavailable') {
      pushToast({
        title: t(isIos ? 'install.iosTitle' : 'install.otherTitle'),
        description: t(isIos ? 'install.iosDesc' : 'install.otherDesc'),
        duration: 8000,
      })
    }
  }

  const deepLinkHandled = useRef(false)
  useEffect(() => {
    if (deepLinkHandled.current) return
    deepLinkHandled.current = true
    const params = new URLSearchParams(window.location.search)
    const taskId = params.get('tarefa')
    if (!taskId) return
    openPresenceById(taskId)
    const url = new URL(window.location.href)
    url.searchParams.delete('tarefa')
    window.history.replaceState(null, '', `${url.pathname}${url.search}${url.hash}`)
  }, [openPresenceById])

  const shortcutHandled = useRef('')
  useEffect(() => {
    const key = `${route}:${query.toString()}`
    if (shortcutHandled.current === key) return
    if (route === 'rotina' && query.get('novo') === '1') {
      shortcutHandled.current = key
      setTaskForm({ open: true })
      navigate('/rotina')
    }
    if (route === 'gestos' && query.get('novo') === '1') {
      shortcutHandled.current = key
      setGoodAction({ open: true })
      navigate('/gestos')
    }
  }, [navigate, query, route])

  useEffect(() => {
    if (!('serviceWorker' in navigator)) return
    const onMessage = (event: MessageEvent) => {
      const payload = event.data as { type?: string; taskId?: string } | null
      if (payload?.type === 'OPEN_TASK' && typeof payload.taskId === 'string') {
        openPresenceById(payload.taskId)
      }
    }
    navigator.serviceWorker.addEventListener('message', onMessage)
    return () => navigator.serviceWorker.removeEventListener('message', onMessage)
  }, [openPresenceById])

  const notificationsOn =
    data.settings.notificationsEnabled &&
    notificationPermission() === 'granted'

  const taskToEdit = taskForm.taskId
    ? data.tasks.find((item) => item.id === taskForm.taskId) ?? null
    : null
  const reflectionTask = reflection
    ? data.tasks.find((item) => item.id === reflection.taskId) ?? null
    : null
  const reflectionCompletion = reflection?.completionId
    ? data.completions.find((item) => item.id === reflection.completionId) ?? null
    : null
  const presenceTask = presenceTaskId
    ? data.tasks.find((item) => item.id === presenceTaskId) ?? null
    : null
  const actionToEdit = goodAction.actionId
    ? data.goodActions.find((item) => item.id === goodAction.actionId) ?? null
    : null

  const finishOnboarding = () => {
    navigate(pathFor('hoje'))
    pushToast({
      title: t('onboarding.welcomeTitle'),
      description: t('onboarding.welcomeDesc'),
      tone: 'success',
    })
  }

  if (!data.profile.onboarded) {
    return (
      <Onboarding
        onFinish={finishOnboarding}
        onInstall={handleInstall}
        canInstall={canInstall}
        isStandalone={isStandalone}
        isIos={isIos}
      />
    )
  }

  return (
    <>
      <Layout
        route={route}
        navigate={navigate}
        onOpenSettings={(tab = 'perfil') => {
          setSettingsTab(tab)
          setSettingsOpen(true)
        }}
        onInstall={handleInstall}
        canInstall={canInstall}
        notificationsOn={notificationsOn}
        online={online}
      >
        <div className="page-transition" key={route}>
          {route === 'hoje' ? (
            <TodayPage
              onOpenReflection={openReflection}
              onOpenPresence={(task) => setPresenceTaskId(task.id)}
              onOpenGoodAction={openGoodActionFromToday}
              onOpenTaskForm={() => openTaskForm()}
              onOpenSettings={(tab) => {
                setSettingsTab(tab ?? 'perfil')
                setSettingsOpen(true)
              }}
              onNavigate={(next) => navigate(pathFor(next))}
            />
          ) : null}
          {route === 'rotina' ? (
            <RoutinePage
              onOpenTaskForm={openTaskForm}
              onNavigateMethod={() => navigate(pathFor('metodo'))}
            />
          ) : null}
          {route === 'gestos' ? (
            <GoodActionsPage
              onOpenGoodAction={openGoodActionFromPage}
              onNavigateHistory={() => navigate(pathFor('historia'))}
            />
          ) : null}
          {route === 'historia' ? (
            <HistoryPage onNavigateToday={() => navigate(pathFor('hoje'))} />
          ) : null}
          {route === 'metodo' ? (
            <MethodPage
              onNavigateToday={() => navigate(pathFor('hoje'))}
              onNavigateRoutine={() => navigate(pathFor('rotina'))}
            />
          ) : null}
        </div>
      </Layout>

      <TaskFormModal
        open={taskForm.open}
        onClose={() => setTaskForm({ open: false })}
        task={taskToEdit}
        initialTitle={taskForm.title}
        initialCategory={taskForm.category}
        initialTime={taskForm.time}
      />

      <ReflectionModal
        open={reflection !== null}
        task={reflectionTask}
        completion={reflectionCompletion}
        onClose={() => setReflection(null)}
        onOpenHistory={() => navigate(pathFor('historia'))}
      />

      <PresenceModal
        open={presenceTaskId !== null}
        task={presenceTask}
        onClose={() => setPresenceTaskId(null)}
        onRegister={(task) => {
          setPresenceTaskId(null)
          openReflection(task)
        }}
      />

      <GoodActionModal
        open={goodAction.open}
        onClose={() => setGoodAction({ open: false })}
        action={actionToEdit}
        initialType={goodAction.type}
        initialDescription={goodAction.description}
      />

      <SettingsModal
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        initialTab={settingsTab}
        onInstall={handleInstall}
        canInstall={canInstall}
        isStandalone={isStandalone}
        isIos={isIos}
        onOpenMethod={() => {
          setSettingsOpen(false)
          navigate(pathFor('metodo'))
        }}
        onOpenBackup={(mode) => {
          setSettingsOpen(false)
          setBackupMode(mode)
        }}
      />

      <BackupModal
        open={backupMode !== null}
        mode={backupMode ?? 'export'}
        onClose={() => setBackupMode(null)}
      />
    </>
  )
}
