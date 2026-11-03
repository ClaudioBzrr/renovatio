export type CategoryKey =
  | 'corpo'
  | 'sentidos'
  | 'conexao'
  | 'criacao'
  | 'ordem'
  | 'descanso'

export type GoodActionType = 'gentileza' | 'conexao' | 'realizacao'

export type Weekday = 0 | 1 | 2 | 3 | 4 | 5 | 6

export interface MicroTask {
  id: string
  title: string
  category: CategoryKey
  time: string
  days: Weekday[]
  createdAt: string
}

export interface TaskCompletion {
  id: string
  taskId: string
  taskTitle: string
  category: CategoryKey
  date: string
  completedAt: string
  reflection: string
  sensoryNote?: string
}

export interface GoodAction {
  id: string
  date: string
  type: GoodActionType
  description: string
  feeling?: string
  createdAt: string
}

export interface Profile {
  name: string
  onboarded: boolean
  createdAt: string
}

export interface Settings {
  notificationsEnabled: boolean
  reminderLead: 0 | 5 | 10
}

export interface AppData {
  version: 1
  profile: Profile
  tasks: MicroTask[]
  completions: TaskCompletion[]
  goodActions: GoodAction[]
  settings: Settings
}

export interface CategoryMeta {
  key: CategoryKey
  label: string
  short: string
  description: string
}

export interface GoodActionMeta {
  key: GoodActionType
  label: string
  description: string
  prompt: string
}

export interface TaskInput {
  title: string
  category: CategoryKey
  time: string
  days: Weekday[]
}

export type StoreError =
  | 'taskTitleShort'
  | 'timeRequired'
  | 'daysRequired'
  | 'maxTasks'
  | 'taskNotFound'
  | 'reflectionShort'
  | 'goodActionShort'
  | 'maxGoodActions'
  | 'goodActionNotFound'
