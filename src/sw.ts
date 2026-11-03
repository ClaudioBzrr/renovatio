/// <reference lib="webworker" />
import { cleanupOutdatedCaches, precacheAndRoute, type PrecacheEntry } from 'workbox-precaching'
import type { Locale } from './i18n/types'
import {
  fillTemplate,
  notificationStrings,
} from './i18n/notificationStrings'

const sw = self as unknown as ServiceWorkerGlobalScope & {
  __WB_MANIFEST: Array<string | PrecacheEntry>
}

cleanupOutdatedCaches()
precacheAndRoute(self.__WB_MANIFEST)

interface Reminder {
  taskId: string
  title: string
  time: string
  days: number[]
  lead: number
  skipDates?: string[]
  locale: Locale
}

const DB_NAME = 'renovatio-reminders'
const STORE = 'reminders'
const timers = new Map<string, number>()

function scopeUrl(path: string): string {
  return `${sw.registration.scope}${path}`
}

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1)
    request.onupgradeneeded = () => {
      const database = request.result
      if (!database.objectStoreNames.contains(STORE)) {
        database.createObjectStore(STORE, { keyPath: 'taskId' })
      }
    }
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

async function readReminders(): Promise<Reminder[]> {
  try {
    const database = await openDatabase()
    return await new Promise((resolve, reject) => {
      const transaction = database.transaction(STORE, 'readonly')
      const store = transaction.objectStore(STORE)
      const request = store.getAll()
      request.onsuccess = () => resolve(request.result as Reminder[])
      request.onerror = () => reject(request.error)
    })
  } catch {
    return []
  }
}

async function writeReminders(reminders: Reminder[]): Promise<void> {
  try {
    const database = await openDatabase()
    await new Promise<void>((resolve, reject) => {
      const transaction = database.transaction(STORE, 'readwrite')
      const store = transaction.objectStore(STORE)
      store.clear()
      reminders.forEach((reminder) => store.put(reminder))
      transaction.oncomplete = () => resolve()
      transaction.onerror = () => reject(transaction.error)
    })
  } catch {
    // Sem IndexedDB, os lembretes em primeiro plano continuam.
  }
}

function pad(value: number): string {
  return String(value).padStart(2, '0')
}

function dateKeyOf(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

function nextReminderAt(reminder: Reminder, from: Date): Date | null {
  const [hours, minutes] = reminder.time.split(':').map(Number)
  for (let offset = 0; offset < 15; offset += 1) {
    const day = new Date(from)
    day.setDate(day.getDate() + offset)
    day.setHours(hours, minutes, 0, 0)
    if (!reminder.days.includes(day.getDay())) continue
    if (reminder.skipDates?.includes(dateKeyOf(day))) continue
    const at = new Date(day.getTime() - reminder.lead * 60_000)
    if (at.getTime() > from.getTime()) return at
  }
  return null
}

function taskDateFor(reminder: Reminder, reminderAt: Date): string {
  return dateKeyOf(new Date(reminderAt.getTime() + reminder.lead * 60_000))
}

async function showReminder(reminder: Reminder, at: Date): Promise<void> {
  const taskDate = taskDateFor(reminder, at)
  const tag = `renovatio-task-${reminder.taskId}-${taskDate}`
  const copy = notificationStrings(reminder.locale)
  try {
    const existing = await sw.registration.getNotifications({ tag })
    if (existing.length > 0) return
    const notificationOptions = {
      body: copy.body,
      icon: scopeUrl('icons/icon-192.png'),
      badge: scopeUrl('icons/badge-72.png'),
      tag,
      renotify: true,
      data: {
        url: `${sw.registration.scope}?tarefa=${encodeURIComponent(reminder.taskId)}&lang=${reminder.locale}#/hoje`,
        taskId: reminder.taskId,
        title: reminder.title,
        locale: reminder.locale,
      },
      actions: [
        { action: 'open', title: copy.open },
        { action: 'snooze', title: copy.snooze },
      ],
      lang: reminder.locale,
    } as NotificationOptions & {
      actions?: { action: string; title: string }[]
      renotify?: boolean
    }
    await sw.registration.showNotification(
      fillTemplate(copy.titleNow, { title: reminder.title }),
      notificationOptions,
    )
  } catch {
    // O sistema pode negar a notificação; o app segue funcionando.
  }
}

function clearTimers(): void {
  timers.forEach((timer) => sw.clearTimeout(timer))
  timers.clear()
}

async function scheduleAll(): Promise<void> {
  clearTimers()
  const reminders = await readReminders()
  const now = Date.now()
  reminders.forEach((reminder) => {
    const next = nextReminderAt(reminder, new Date(now))
    if (!next) return
    const delay = next.getTime() - now
    if (delay <= 0 || delay > 24 * 60 * 60 * 1000) return
    const timer = sw.setTimeout(() => {
      void showReminder(reminder, next)
      void scheduleAll()
    }, delay)
    timers.set(reminder.taskId, timer)
  })
}

async function checkDueReminders(): Promise<void> {
  const reminders = await readReminders()
  const now = new Date()
  for (const reminder of reminders) {
    const next = nextReminderAt(reminder, new Date(now.getTime() - 20 * 60_000))
    if (!next) continue
    const lateBy = now.getTime() - next.getTime()
    if (lateBy >= 0 && lateBy < 20 * 60_000) {
      await showReminder(reminder, next)
    }
  }
  await scheduleAll()
}

sw.addEventListener('install', (event) => {
  event.waitUntil(sw.skipWaiting())
})

sw.addEventListener('activate', (event) => {
  event.waitUntil(sw.clients.claim().then(() => scheduleAll()))
})

sw.addEventListener('message', (event) => {
  const data = event.data as { type?: string; reminders?: Reminder[] } | null
  if (!data) return
  if (data.type === 'SCHEDULE_REMINDERS') {
    event.waitUntil(writeReminders(data.reminders ?? []).then(() => scheduleAll()))
  }
  if (data.type === 'CLEAR_REMINDERS') {
    event.waitUntil(
      writeReminders([]).then(async () => {
        clearTimers()
        const notifications = await sw.registration.getNotifications()
        notifications
          .filter((notification) => notification.tag.startsWith('renovatio-task-'))
          .forEach((notification) => notification.close())
      }),
    )
  }
})

sw.addEventListener('periodicsync', (event) => {
  ;(event as ExtendableEvent).waitUntil(checkDueReminders())
})

sw.addEventListener('notificationclick', (event) => {
  const notification = event.notification
  const data = (notification.data ?? {}) as {
    url?: string
    taskId?: string
    title?: string
    locale?: Locale
  }
  notification.close()

  const locale: Locale = data.locale === 'en-US' ? 'en-US' : 'pt-BR'
  const copy = notificationStrings(locale)

  if (event.action === 'snooze') {
    event.waitUntil(
      new Promise<void>((resolve) => {
        sw.setTimeout(() => {
          void sw.registration.showNotification(
            fillTemplate(copy.snoozeTitle, { title: data.title ?? '' }),
            {
              body: copy.snoozeBody,
              icon: scopeUrl('icons/icon-192.png'),
              badge: scopeUrl('icons/badge-72.png'),
              tag: `${notification.tag}-snooze`,
              data,
              lang: locale,
            },
          )
          resolve()
        }, 10 * 60_000)
      }),
    )
    return
  }

  const url = data.url ?? `${sw.registration.scope}#/hoje`
  event.waitUntil(
    (async () => {
      const windowClients = await sw.clients.matchAll({
        type: 'window',
        includeUncontrolled: true,
      })
      const client = windowClients[0] as WindowClient | undefined
      if (client) {
        await client.focus()
        try {
          await client.navigate(url)
        } catch {
          // Se a navegação falhar, o app ainda abre na tela atual.
        }
        client.postMessage({ type: 'OPEN_TASK', taskId: data.taskId })
        return
      }
      await sw.clients.openWindow(url)
    })(),
  )
})
