import type { MicroTask, Weekday } from '../types'
import { getRuntimeLocale } from '../i18n/locale'
import type { Locale } from '../i18n/types'

export const ALL_DAYS: Weekday[] = [0, 1, 2, 3, 4, 5, 6]

const WEEKDAY_DATA: Record<
  Locale,
  { value: Weekday; short: string; long: string }[]
> = {
  'pt-BR': [
    { value: 1, short: 'S', long: 'segunda-feira' },
    { value: 2, short: 'T', long: 'terça-feira' },
    { value: 3, short: 'Q', long: 'quarta-feira' },
    { value: 4, short: 'Q', long: 'quinta-feira' },
    { value: 5, short: 'S', long: 'sexta-feira' },
    { value: 6, short: 'S', long: 'sábado' },
    { value: 0, short: 'D', long: 'domingo' },
  ],
  'en-US': [
    { value: 1, short: 'M', long: 'Monday' },
    { value: 2, short: 'T', long: 'Tuesday' },
    { value: 3, short: 'W', long: 'Wednesday' },
    { value: 4, short: 'T', long: 'Thursday' },
    { value: 5, short: 'F', long: 'Friday' },
    { value: 6, short: 'S', long: 'Saturday' },
    { value: 0, short: 'S', long: 'Sunday' },
  ],
}

const NARROW_WEEKDAYS: Record<Locale, string[]> = {
  'pt-BR': ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'],
  'en-US': ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
}

export function getWeekdays() {
  return WEEKDAY_DATA[getRuntimeLocale()]
}

export function getWeekdayNarrow(day: Weekday): string {
  return NARROW_WEEKDAYS[getRuntimeLocale()][day]
}

export function pad2(value: number): string {
  return String(value).padStart(2, '0')
}

export function dateKey(date: Date = new Date()): string {
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`
}

export function parseDateKey(key: string): Date {
  const [year, month, day] = key.split('-').map(Number)
  return new Date(year, month - 1, day)
}

export function addDays(date: Date, amount: number): Date {
  const next = new Date(date)
  next.setDate(next.getDate() + amount)
  return next
}

export function startOfDay(date: Date = new Date()): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate())
}

export function capitalize(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1)
}

export function formatLongDate(date: Date = new Date()): string {
  return capitalize(
    new Intl.DateTimeFormat(getRuntimeLocale(), {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    }).format(date),
  )
}

export function formatShortDate(date: Date | string): string {
  const value = typeof date === 'string' ? parseDateKey(date) : date
  return new Intl.DateTimeFormat(getRuntimeLocale(), {
    day: '2-digit',
    month: 'short',
  })
    .format(value)
    .replace('.', '')
}

export function formatWeekday(date: Date | string): string {
  const value = typeof date === 'string' ? parseDateKey(date) : date
  return capitalize(
    new Intl.DateTimeFormat(getRuntimeLocale(), { weekday: 'long' }).format(value),
  )
}

export function formatFullDate(date: Date | string): string {
  const value = typeof date === 'string' ? parseDateKey(date) : date
  return capitalize(
    new Intl.DateTimeFormat(getRuntimeLocale(), {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(value),
  )
}

export function greeting(date: Date = new Date()): string {
  const hour = date.getHours()
  const locale = getRuntimeLocale()
  if (locale === 'en-US') {
    if (hour < 5) return 'Hello'
    if (hour < 12) return 'Good morning'
    if (hour < 18) return 'Good afternoon'
    return 'Good evening'
  }
  if (hour < 5) return 'Boa madrugada'
  if (hour < 12) return 'Bom dia'
  if (hour < 18) return 'Boa tarde'
  return 'Boa noite'
}

export function minutesFromTime(time: string): number {
  const [hours, minutes] = time.split(':').map(Number)
  return hours * 60 + minutes
}

export function dateAtTime(day: Date, time: string): Date {
  const [hours, minutes] = time.split(':').map(Number)
  const result = new Date(day)
  result.setHours(hours, minutes, 0, 0)
  return result
}

export function isScheduledOn(task: MicroTask, date: Date): boolean {
  return task.days.includes(date.getDay() as Weekday)
}

export function tasksForDate(tasks: MicroTask[], date: Date): MicroTask[] {
  return tasks
    .filter((task) => isScheduledOn(task, date))
    .sort((a, b) => minutesFromTime(a.time) - minutesFromTime(b.time))
}

export function nextTaskToday(
  tasks: MicroTask[],
  completionsTaskIds: Set<string>,
  now: Date = new Date(),
): MicroTask | null {
  return (
    tasksForDate(tasks, now).find((task) => !completionsTaskIds.has(task.id)) ?? null
  )
}

export function nextOccurrence(task: MicroTask, from: Date): Date | null {
  for (let offset = 0; offset < 15; offset += 1) {
    const candidate = addDays(startOfDay(from), offset)
    if (!task.days.includes(candidate.getDay() as Weekday)) continue
    const occurrence = dateAtTime(candidate, task.time)
    if (occurrence.getTime() > from.getTime()) return occurrence
  }
  return null
}

export function relativeTime(target: Date, now: Date = new Date()): string {
  const diff = target.getTime() - now.getTime()
  const locale = getRuntimeLocale()
  if (diff <= 0) return locale === 'en-US' ? 'now' : 'agora'
  const minutes = Math.round(diff / 60000)
  if (minutes < 60) {
    return locale === 'en-US' ? `in ${minutes} min` : `em ${minutes} min`
  }
  const hours = Math.floor(minutes / 60)
  const rest = minutes % 60
  if (hours < 24) {
    if (locale === 'en-US') {
      return rest > 0 ? `in ${hours}h ${rest}min` : `in ${hours}h`
    }
    return rest > 0 ? `em ${hours}h ${rest}min` : `em ${hours}h`
  }
  const days = Math.ceil(hours / 24)
  return locale === 'en-US' ? `in ${days} days` : `em ${days} dias`
}

export function daysLabel(days: Weekday[]): string {
  const locale = getRuntimeLocale()
  if (days.length === 7) return locale === 'en-US' ? 'Every day' : 'Todos os dias'
  if (
    days.length === 5 &&
    [1, 2, 3, 4, 5].every((day) => days.includes(day as Weekday))
  ) {
    return locale === 'en-US' ? 'Weekdays' : 'Dias úteis'
  }
  const weekdays = getWeekdays()
  return [...days]
    .sort((a, b) => (a === 0 ? 7 : a) - (b === 0 ? 7 : b))
    .map((day) => weekdays.find((weekday) => weekday.value === day)?.short ?? '')
    .join(' · ')
}

export function isToday(key: string): boolean {
  return key === dateKey()
}

export function isYesterday(key: string): boolean {
  return key === dateKey(addDays(new Date(), -1))
}

export function humanDay(key: string): string {
  const locale = getRuntimeLocale()
  if (isToday(key)) return locale === 'en-US' ? 'Today' : 'Hoje'
  if (isYesterday(key)) return locale === 'en-US' ? 'Yesterday' : 'Ontem'
  return formatFullDate(key)
}

export function formatTime(date: Date): string {
  return new Intl.DateTimeFormat(getRuntimeLocale(), {
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

export function countdownLabel(target: Date, now: Date = new Date()): string {
  const diff = Math.max(0, target.getTime() - now.getTime())
  const totalSeconds = Math.floor(diff / 1000)
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${pad2(minutes)}:${pad2(seconds)}`
}

export function lastNDays(count: number, end: Date = new Date()): string[] {
  return Array.from({ length: count }, (_, index) =>
    dateKey(addDays(startOfDay(end), index - count + 1)),
  )
}
