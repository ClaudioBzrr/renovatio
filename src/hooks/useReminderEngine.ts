import { useEffect, useRef } from 'react'
import type { Settings, TaskCompletion, MicroTask } from '../types'
import {
  dateAtTime,
  dateKey,
  tasksForDate,
} from '../lib/date'
import {
  clearReminders,
  notificationPermission,
  registerPeriodicSync,
  showTaskNotification,
  syncReminders,
} from '../lib/notifications'
import { useToast } from '../components/Toast'
import { useI18n } from '../i18n/I18nProvider'

const NOTIFIED_PREFIX = 'renovatio.notified.'

function wasNotified(key: string): boolean {
  try {
    return localStorage.getItem(key) === '1'
  } catch {
    return false
  }
}

function markNotified(key: string): void {
  try {
    localStorage.setItem(key, '1')
  } catch {
    // Sem armazenamento: o alerta em primeiro plano ainda funciona.
  }
}

interface Options {
  tasks: MicroTask[]
  completions: TaskCompletion[]
  settings: Settings
  onOpenTask: (taskId: string) => void
}

export function useReminderEngine({
  tasks,
  completions,
  settings,
  onOpenTask,
}: Options): void {
  const { pushToast } = useToast()
  const { t, locale } = useI18n()
  const onOpenTaskRef = useRef(onOpenTask)
  onOpenTaskRef.current = onOpenTask

  useEffect(() => {
    if (!settings.notificationsEnabled || notificationPermission() !== 'granted') {
      void clearReminders()
      return
    }
    void syncReminders(tasks, settings, completions, locale)
    void registerPeriodicSync()
  }, [completions, locale, settings, tasks])

  useEffect(() => {
    const check = () => {
      if (!settings.notificationsEnabled) return
      const now = new Date()
      const day = dateKey(now)
      const todayTasks = tasksForDate(tasks, now)
      const completedIds = new Set(
        completions.filter((item) => item.date === day).map((item) => item.taskId),
      )
      const permission = notificationPermission()

      for (const task of todayTasks) {
        if (completedIds.has(task.id)) continue
        const taskAt = dateAtTime(now, task.time)
        const dueAt = new Date(taskAt.getTime() - settings.reminderLead * 60_000)
        const lateBy = now.getTime() - dueAt.getTime()
        if (lateBy < 0 || lateBy > 6 * 60_000) continue
        const key = `${NOTIFIED_PREFIX}${day}.${task.id}.${task.time}`
        if (wasNotified(key)) continue
        markNotified(key)

        if (permission === 'granted') {
          void showTaskNotification({
            taskId: task.id,
            title: task.title,
            tag: `renovatio-task-${task.id}-${day}`,
            locale,
          })
        }

        if (document.visibilityState === 'visible' || permission !== 'granted') {
          pushToast({
            title: t('notifications.nowTitle', { title: task.title }),
            description: t('notifications.inAppBody'),
            tone: 'default',
            duration: 15_000,
            action: {
              label: t('notifications.openGesture'),
              onClick: () => onOpenTaskRef.current(task.id),
            },
          })
        }
      }
    }

    check()
    const interval = window.setInterval(check, 15_000)
    const onVisible = () => {
      if (document.visibilityState === 'visible') check()
    }
    document.addEventListener('visibilitychange', onVisible)
    window.addEventListener('focus', check)
    return () => {
      window.clearInterval(interval)
      document.removeEventListener('visibilitychange', onVisible)
      window.removeEventListener('focus', check)
    }
  }, [completions, locale, pushToast, settings, t, tasks])
}
