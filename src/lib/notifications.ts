import type { MicroTask, Settings, TaskCompletion, Weekday } from '../types'
import type { Locale } from '../i18n/types'
import { dateKey } from './date'
import {
  fillTemplate,
  notificationStrings,
} from '../i18n/notificationStrings'

export interface ReminderPayload {
  taskId: string
  title: string
  time: string
  days: Weekday[]
  lead: number
  skipDates?: string[]
  locale: Locale
}

export type PermissionState = NotificationPermission | 'unsupported'

function baseUrl(): string {
  const base = import.meta.env.BASE_URL || '/'
  return base.endsWith('/') ? base : `${base}/`
}

export function notificationsSupported(): boolean {
  return (
    typeof window !== 'undefined' &&
    'Notification' in window &&
    'serviceWorker' in navigator
  )
}

export function notificationPermission(): PermissionState {
  if (!notificationsSupported()) return 'unsupported'
  return Notification.permission
}

export async function requestNotificationPermission(): Promise<PermissionState> {
  if (!notificationsSupported()) return 'unsupported'
  try {
    return await Notification.requestPermission()
  } catch {
    return Notification.permission
  }
}

export async function getServiceWorkerRegistration(): Promise<ServiceWorkerRegistration | null> {
  if (!('serviceWorker' in navigator)) return null
  try {
    return await navigator.serviceWorker.ready
  } catch {
    return null
  }
}

function reminderPayloads(
  tasks: MicroTask[],
  settings: Settings,
  completions: TaskCompletion[],
  locale: Locale,
): ReminderPayload[] {
  const today = dateKey()
  const completedToday = new Set(
    completions.filter((item) => item.date === today).map((item) => item.taskId),
  )
  return tasks.map((task) => ({
    taskId: task.id,
    title: task.title,
    time: task.time,
    days: task.days,
    lead: settings.reminderLead,
    skipDates: completedToday.has(task.id) ? [today] : [],
    locale,
  }))
}

export async function syncReminders(
  tasks: MicroTask[],
  settings: Settings,
  completions: TaskCompletion[],
  locale: Locale,
): Promise<void> {
  if (!settings.notificationsEnabled) return
  const registration = await getServiceWorkerRegistration()
  if (!registration) return
  const worker = registration.active ?? registration.waiting ?? registration.installing
  worker?.postMessage({
    type: 'SCHEDULE_REMINDERS',
    reminders: reminderPayloads(tasks, settings, completions, locale),
  })
}

export async function clearReminders(): Promise<void> {
  const registration = await getServiceWorkerRegistration()
  if (!registration) return
  const worker = registration.active ?? registration.waiting ?? registration.installing
  worker?.postMessage({ type: 'CLEAR_REMINDERS' })
}

export async function showTaskNotification(options: {
  taskId: string
  title: string
  tag: string
  locale: Locale
}): Promise<void> {
  if (notificationPermission() !== 'granted') return
  const registration = await getServiceWorkerRegistration()
  if (!registration) return
  const copy = notificationStrings(options.locale)
  const base = baseUrl()
  try {
    const existing = await registration.getNotifications({ tag: options.tag })
    if (existing.length > 0) return
    const notificationOptions = {
      body: copy.body,
      icon: `${base}icons/icon-192.png`,
      badge: `${base}icons/badge-72.png`,
      tag: options.tag,
      data: {
        url: `${base}?tarefa=${encodeURIComponent(options.taskId)}&lang=${options.locale}#/hoje`,
        taskId: options.taskId,
        locale: options.locale,
      },
      actions: [
        { action: 'open', title: copy.open },
        { action: 'snooze', title: copy.snooze },
      ],
      lang: options.locale,
    } as NotificationOptions & {
      actions?: { action: string; title: string }[]
    }
    await registration.showNotification(
      fillTemplate(copy.titleNow, { title: options.title }),
      notificationOptions,
    )
  } catch {
    // Alguns navegadores exigem interação antes de mostrar a notificação.
  }
}

export async function closeTaskNotifications(taskId: string): Promise<void> {
  const registration = await getServiceWorkerRegistration()
  if (!registration) return
  try {
    const notifications = await registration.getNotifications()
    notifications
      .filter((notification) =>
        notification.tag.startsWith(`renovatio-task-${taskId}-`),
      )
      .forEach((notification) => notification.close())
  } catch {
    // Sem permissão para inspecionar notificações.
  }
}

export async function closeAllNotifications(): Promise<void> {
  const registration = await getServiceWorkerRegistration()
  if (!registration) return
  try {
    const notifications = await registration.getNotifications()
    notifications
      .filter((notification) => notification.tag.startsWith('renovatio-'))
      .forEach((notification) => notification.close())
  } catch {
    // Sem permissão para inspecionar notificações.
  }
}

export async function sendTestNotification(locale: Locale): Promise<boolean> {
  if (notificationPermission() !== 'granted') return false
  const registration = await getServiceWorkerRegistration()
  if (!registration) return false
  const copy = notificationStrings(locale)
  const base = baseUrl()
  try {
    await registration.showNotification(copy.testTitle, {
      body: copy.testBody,
      icon: `${base}icons/icon-192.png`,
      badge: `${base}icons/badge-72.png`,
      tag: `renovatio-test-${Date.now()}`,
      lang: locale,
    })
    return true
  } catch {
    return false
  }
}

export async function registerPeriodicSync(): Promise<void> {
  if (!('serviceWorker' in navigator)) return
  const registration = await getServiceWorkerRegistration()
  if (!registration) return
  const periodic = (
    registration as ServiceWorkerRegistration & {
      periodicSync?: {
        register: (tag: string, options: { minInterval: number }) => Promise<void>
      }
    }
  ).periodicSync
  if (!periodic) return
  try {
    await periodic.register('renovatio-reminders', {
      minInterval: 15 * 60 * 1000,
    })
  } catch {
    // O navegador pode negar o registro; os lembretes em primeiro plano continuam.
  }
}
