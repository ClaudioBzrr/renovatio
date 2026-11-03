import type {
  AppData,
  CategoryKey,
  GoodAction,
  MicroTask,
  TaskCompletion,
  Weekday,
} from '../types'
import { ALL_DAYS } from './date'

export const STORAGE_KEY = 'renovatio.data.v1'
export const LEGACY_STORAGE_KEY = 'brasa.data.v1'
export const MAX_TASKS = 3

function newId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID()
  }
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`
}

const CATEGORY_VALUES: CategoryKey[] = [
  'corpo',
  'sentidos',
  'conexao',
  'criacao',
  'ordem',
  'descanso',
]

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function stringOr(value: unknown, fallback: string): string {
  return typeof value === 'string' ? value : fallback
}

function normalizeTask(value: unknown): MicroTask | null {
  if (!isRecord(value)) return null
  const title = stringOr(value.title, '').trim()
  const time = stringOr(value.time, '')
  if (!title || !/^\d{2}:\d{2}$/.test(time)) return null
  const category = CATEGORY_VALUES.includes(value.category as CategoryKey)
    ? (value.category as CategoryKey)
    : 'corpo'
  const days = Array.isArray(value.days)
    ? (value.days.filter(
        (day): day is Weekday =>
          typeof day === 'number' && day >= 0 && day <= 6 && Number.isInteger(day),
      ) as Weekday[])
    : ALL_DAYS
  return {
    id: stringOr(value.id, newId()),
    title: title.slice(0, 80),
    category,
    time,
    days: days.length > 0 ? [...new Set(days)] : ALL_DAYS,
    createdAt: stringOr(value.createdAt, new Date().toISOString()),
  }
}

function normalizeCompletion(value: unknown): TaskCompletion | null {
  if (!isRecord(value)) return null
  const reflection = stringOr(value.reflection, '').trim()
  const date = stringOr(value.date, '')
  if (!reflection || !/^\d{4}-\d{2}-\d{2}$/.test(date)) return null
  const category = CATEGORY_VALUES.includes(value.category as CategoryKey)
    ? (value.category as CategoryKey)
    : 'corpo'
  return {
    id: stringOr(value.id, newId()),
    taskId: stringOr(value.taskId, ''),
    taskTitle: stringOr(value.taskTitle, ''),
    category,
    date,
    completedAt: stringOr(value.completedAt, new Date().toISOString()),
    reflection: reflection.slice(0, 1200),
    sensoryNote:
      typeof value.sensoryNote === 'string'
        ? value.sensoryNote.slice(0, 500)
        : undefined,
  }
}

function normalizeGoodAction(value: unknown): GoodAction | null {
  if (!isRecord(value)) return null
  const description = stringOr(value.description, '').trim()
  const date = stringOr(value.date, '')
  if (!description || !/^\d{4}-\d{2}-\d{2}$/.test(date)) return null
  const type =
    value.type === 'gentileza' || value.type === 'conexao' || value.type === 'realizacao'
      ? value.type
      : 'gentileza'
  return {
    id: stringOr(value.id, newId()),
    date,
    type,
    description: description.slice(0, 600),
    feeling:
      typeof value.feeling === 'string' ? value.feeling.slice(0, 600) : undefined,
    createdAt: stringOr(value.createdAt, new Date().toISOString()),
  }
}

export function createDefaultData(): AppData {
  return {
    version: 1,
    profile: {
      name: '',
      onboarded: false,
      createdAt: new Date().toISOString(),
    },
    tasks: [],
    completions: [],
    goodActions: [],
    settings: {
      notificationsEnabled: false,
      reminderLead: 0,
    },
  }
}

export function loadData(): AppData {
  if (typeof localStorage === 'undefined') return createDefaultData()
  try {
    const raw =
      localStorage.getItem(STORAGE_KEY) ??
      localStorage.getItem(LEGACY_STORAGE_KEY)
    if (!raw) return createDefaultData()
    const parsed: unknown = JSON.parse(raw)
    if (!isRecord(parsed)) return createDefaultData()
    const defaults = createDefaultData()
    const profile = isRecord(parsed.profile) ? parsed.profile : {}
    const settings = isRecord(parsed.settings) ? parsed.settings : {}
    return {
      version: 1,
      profile: {
        name: stringOr(profile.name, '').slice(0, 40),
        onboarded: profile.onboarded === true,
        createdAt: stringOr(profile.createdAt, defaults.profile.createdAt),
      },
      tasks: Array.isArray(parsed.tasks)
        ? parsed.tasks
            .map(normalizeTask)
            .filter((task): task is MicroTask => task !== null)
            .slice(0, MAX_TASKS)
        : [],
      completions: Array.isArray(parsed.completions)
        ? parsed.completions
            .map(normalizeCompletion)
            .filter((item): item is TaskCompletion => item !== null)
        : [],
      goodActions: Array.isArray(parsed.goodActions)
        ? parsed.goodActions
            .map(normalizeGoodAction)
            .filter((item): item is GoodAction => item !== null)
        : [],
      settings: {
        notificationsEnabled: settings.notificationsEnabled === true,
        reminderLead:
          settings.reminderLead === 5 || settings.reminderLead === 10
            ? settings.reminderLead
            : 0,
      },
    }
  } catch {
    return createDefaultData()
  }
}

export function saveData(data: AppData): void {
  if (typeof localStorage === 'undefined') return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch {
    // O app continua funcionando em memória se o armazenamento estiver cheio.
  }
}

export function exportData(data: AppData): void {
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: 'application/json',
  })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = `renovatio-${new Date().toISOString().slice(0, 10)}.json`
  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()
  URL.revokeObjectURL(url)
}
