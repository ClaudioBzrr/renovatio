import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type {
  AppData,
  GoodAction,
  GoodActionType,
  MicroTask,
  Profile,
  Settings,
  StoreError,
  TaskInput,
} from '../types'
import {
  createDefaultData,
  loadData,
  MAX_TASKS,
  saveData,
  STORAGE_KEY,
} from '../lib/storage'
import { dateKey } from '../lib/date'

interface TaskResult {
  ok: boolean
  id?: string
  error?: StoreError
}

interface GoodActionResult {
  ok: boolean
  id?: string
  error?: StoreError
}

interface AppContextValue {
  data: AppData
  today: string
  maxTasks: number
  updateProfile: (patch: Partial<Profile>) => void
  completeOnboarding: () => void
  replayOnboarding: () => void
  updateSettings: (patch: Partial<Settings>) => void
  addTask: (input: TaskInput) => TaskResult
  updateTask: (id: string, input: TaskInput) => TaskResult
  deleteTask: (id: string) => void
  completeTask: (
    taskId: string,
    reflection: string,
    sensoryNote?: string,
  ) => TaskResult
  addGoodAction: (input: {
    type: GoodActionType
    description: string
    feeling?: string
  }) => GoodActionResult
  updateGoodAction: (
    id: string,
    input: { type: GoodActionType; description: string; feeling?: string },
  ) => GoodActionResult
  deleteGoodAction: (id: string) => void
  resetData: () => void
}

const AppContext = createContext<AppContextValue | null>(null)

function newId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID()
  }
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<AppData>(() => loadData())
  const [today, setToday] = useState(() => dateKey())

  useEffect(() => {
    saveData(data)
  }, [data])

  useEffect(() => {
    const interval = window.setInterval(() => {
      const next = dateKey()
      setToday((current) => (current === next ? current : next))
    }, 30_000)
    const onFocus = () => setToday(dateKey())
    window.addEventListener('focus', onFocus)
    document.addEventListener('visibilitychange', onFocus)
    return () => {
      window.clearInterval(interval)
      window.removeEventListener('focus', onFocus)
      document.removeEventListener('visibilitychange', onFocus)
    }
  }, [])

  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key !== STORAGE_KEY) return
      setData(loadData())
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  const updateProfile = useCallback((patch: Partial<Profile>) => {
    setData((current) => ({
      ...current,
      profile: { ...current.profile, ...patch },
    }))
  }, [])

  const completeOnboarding = useCallback(() => {
    setData((current) => ({
      ...current,
      profile: { ...current.profile, onboarded: true },
    }))
  }, [])

  const replayOnboarding = useCallback(() => {
    setData((current) => ({
      ...current,
      profile: { ...current.profile, onboarded: false },
    }))
  }, [])

  const updateSettings = useCallback((patch: Partial<Settings>) => {
    setData((current) => ({
      ...current,
      settings: { ...current.settings, ...patch },
    }))
  }, [])

  const addTask = useCallback(
    (input: TaskInput): TaskResult => {
      const title = input.title.trim()
      if (title.length < 3) {
        return { ok: false, error: 'taskTitleShort' }
      }
      if (!/^\d{2}:\d{2}$/.test(input.time)) {
        return { ok: false, error: 'timeRequired' }
      }
      if (input.days.length === 0) {
        return { ok: false, error: 'daysRequired' }
      }
      if (data.tasks.length >= MAX_TASKS) {
        return { ok: false, error: 'maxTasks' }
      }
      const task: MicroTask = {
        id: newId(),
        title: title.slice(0, 80),
        category: input.category,
        time: input.time,
        days: [...new Set(input.days)].sort((a, b) => a - b),
        createdAt: new Date().toISOString(),
      }
      setData((current) =>
        current.tasks.length >= MAX_TASKS
          ? current
          : { ...current, tasks: [...current.tasks, task] },
      )
      return { ok: true, id: task.id }
    },
    [data.tasks],
  )

  const updateTask = useCallback(
    (id: string, input: TaskInput): TaskResult => {
      const title = input.title.trim()
      if (title.length < 3) {
        return { ok: false, error: 'taskTitleShort' }
      }
      if (!/^\d{2}:\d{2}$/.test(input.time)) {
        return { ok: false, error: 'timeRequired' }
      }
      if (input.days.length === 0) {
        return { ok: false, error: 'daysRequired' }
      }
      if (!data.tasks.some((task) => task.id === id)) {
        return { ok: false, error: 'taskNotFound' }
      }
      setData((current) => ({
        ...current,
        tasks: current.tasks.map((task) =>
          task.id === id
            ? {
                ...task,
                title: title.slice(0, 80),
                category: input.category,
                time: input.time,
                days: [...new Set(input.days)].sort((a, b) => a - b),
              }
            : task,
        ),
      }))
      return { ok: true, id }
    },
    [data.tasks],
  )

  const deleteTask = useCallback((id: string) => {
    setData((current) => ({
      ...current,
      tasks: current.tasks.filter((task) => task.id !== id),
    }))
  }, [])

  const completeTask = useCallback(
    (taskId: string, reflection: string, sensoryNote?: string): TaskResult => {
      const cleanReflection = reflection.trim()
      if (cleanReflection.length < 8) {
        return {
          ok: false,
          error: 'reflectionShort',
        }
      }
      const task = data.tasks.find((item) => item.id === taskId)
      if (!task) {
        return { ok: false, error: 'taskNotFound' }
      }
      const day = dateKey()
      const existing = data.completions.find(
        (item) => item.taskId === taskId && item.date === day,
      )
      const completion = {
        id: existing?.id ?? newId(),
        taskId: task.id,
        taskTitle: task.title,
        category: task.category,
        date: day,
        completedAt: new Date().toISOString(),
        reflection: cleanReflection.slice(0, 1200),
        sensoryNote: sensoryNote?.trim().slice(0, 500) || undefined,
      }
      setData((current) => {
        const hasCompletion = current.completions.some(
          (item) => item.taskId === taskId && item.date === day,
        )
        if (hasCompletion) {
          return {
            ...current,
            completions: current.completions.map((item) =>
              item.taskId === taskId && item.date === day
                ? {
                    ...item,
                    reflection: completion.reflection,
                    sensoryNote: completion.sensoryNote,
                  }
                : item,
            ),
          }
        }
        return { ...current, completions: [...current.completions, completion] }
      })
      return { ok: true, id: completion.id }
    },
    [data.completions, data.tasks],
  )

  const addGoodAction = useCallback(
    (input: {
      type: GoodActionType
      description: string
      feeling?: string
    }): GoodActionResult => {
      const description = input.description.trim()
      if (description.length < 6) {
        return { ok: false, error: 'goodActionShort' }
      }
      const day = dateKey()
      if (data.goodActions.filter((item) => item.date === day).length >= 3) {
        return { ok: false, error: 'maxGoodActions' }
      }
      const action: GoodAction = {
        id: newId(),
        date: day,
        type: input.type,
        description: description.slice(0, 600),
        feeling: input.feeling?.trim().slice(0, 600) || undefined,
        createdAt: new Date().toISOString(),
      }
      setData((current) =>
        current.goodActions.filter((item) => item.date === day).length >= 3
          ? current
          : { ...current, goodActions: [...current.goodActions, action] },
      )
      return { ok: true, id: action.id }
    },
    [data.goodActions],
  )

  const updateGoodAction = useCallback(
    (
      id: string,
      input: { type: GoodActionType; description: string; feeling?: string },
    ): GoodActionResult => {
      const description = input.description.trim()
      if (description.length < 6) {
        return { ok: false, error: 'goodActionShort' }
      }
      if (!data.goodActions.some((action) => action.id === id)) {
        return { ok: false, error: 'goodActionNotFound' }
      }
      setData((current) => ({
        ...current,
        goodActions: current.goodActions.map((action) =>
          action.id === id
            ? {
                ...action,
                type: input.type,
                description: description.slice(0, 600),
                feeling: input.feeling?.trim().slice(0, 600) || undefined,
              }
            : action,
        ),
      }))
      return { ok: true, id }
    },
    [data.goodActions],
  )

  const deleteGoodAction = useCallback((id: string) => {
    setData((current) => ({
      ...current,
      goodActions: current.goodActions.filter((action) => action.id !== id),
    }))
  }, [])

  const resetData = useCallback(() => {
    const fresh = createDefaultData()
    setData(fresh)
    saveData(fresh)
  }, [])

  const value = useMemo<AppContextValue>(
    () => ({
      data,
      today,
      maxTasks: MAX_TASKS,
      updateProfile,
      completeOnboarding,
      replayOnboarding,
      updateSettings,
      addTask,
      updateTask,
      deleteTask,
      completeTask,
      addGoodAction,
      updateGoodAction,
      deleteGoodAction,
      resetData,
    }),
    [
      data,
      today,
      updateProfile,
      completeOnboarding,
      replayOnboarding,
      updateSettings,
      addTask,
      updateTask,
      deleteTask,
      completeTask,
      addGoodAction,
      updateGoodAction,
      deleteGoodAction,
      resetData,
    ],
  )

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp(): AppContextValue {
  const context = useContext(AppContext)
  if (!context) throw new Error('useApp precisa estar dentro de AppProvider')
  return context
}

