import type { TranslationKey } from '../i18n/translations'
import type { CategoryKey, GoodActionType } from '../types'

export const CATEGORY_KEYS: CategoryKey[] = [
  'corpo',
  'sentidos',
  'conexao',
  'criacao',
  'ordem',
  'descanso',
]

export const GOOD_ACTION_KEYS: GoodActionType[] = [
  'gentileza',
  'conexao',
  'realizacao',
]

export interface Suggestion {
  titleKey: TranslationKey
  category: CategoryKey
  time?: string
}

export const SUGGESTIONS: Suggestion[] = [
  { titleKey: 'suggestions.walk', category: 'corpo', time: '08:00' },
  { titleKey: 'suggestions.stretch', category: 'corpo', time: '09:30' },
  { titleKey: 'suggestions.water', category: 'corpo', time: '11:00' },
  { titleKey: 'suggestions.shower', category: 'corpo', time: '20:30' },
  { titleKey: 'suggestions.music', category: 'sentidos', time: '10:00' },
  { titleKey: 'suggestions.coffee', category: 'sentidos', time: '15:00' },
  { titleKey: 'suggestions.window', category: 'sentidos', time: '07:30' },
  { titleKey: 'suggestions.sky', category: 'sentidos', time: '18:00' },
  { titleKey: 'suggestions.message', category: 'conexao', time: '12:00' },
  { titleKey: 'suggestions.compliment', category: 'conexao', time: '16:00' },
  { titleKey: 'suggestions.call', category: 'conexao', time: '19:00' },
  { titleKey: 'suggestions.thank', category: 'conexao', time: '17:30' },
  { titleKey: 'suggestions.write', category: 'criacao', time: '21:00' },
  { titleKey: 'suggestions.draw', category: 'criacao', time: '20:00' },
  { titleKey: 'suggestions.photo', category: 'criacao', time: '09:00' },
  { titleKey: 'suggestions.cook', category: 'criacao', time: '18:30' },
  { titleKey: 'suggestions.fold', category: 'ordem', time: '10:30' },
  { titleKey: 'suggestions.dishes', category: 'ordem', time: '14:00' },
  { titleKey: 'suggestions.table', category: 'ordem', time: '08:30' },
  { titleKey: 'suggestions.objects', category: 'ordem', time: '17:00' },
  { titleKey: 'suggestions.lieDown', category: 'descanso', time: '21:30' },
  { titleKey: 'suggestions.breathe', category: 'descanso', time: '13:00' },
  { titleKey: 'suggestions.silence', category: 'descanso', time: '16:30' },
  { titleKey: 'suggestions.eyesClosed', category: 'descanso', time: '22:00' },
]

export const GOOD_ACTION_IDEAS: Record<GoodActionType, TranslationKey[]> = {
  gentileza: [
    'goodIdeas.gentileza.0',
    'goodIdeas.gentileza.1',
    'goodIdeas.gentileza.2',
    'goodIdeas.gentileza.3',
    'goodIdeas.gentileza.4',
    'goodIdeas.gentileza.5',
  ],
  conexao: [
    'goodIdeas.conexao.0',
    'goodIdeas.conexao.1',
    'goodIdeas.conexao.2',
    'goodIdeas.conexao.3',
    'goodIdeas.conexao.4',
    'goodIdeas.conexao.5',
  ],
  realizacao: [
    'goodIdeas.realizacao.0',
    'goodIdeas.realizacao.1',
    'goodIdeas.realizacao.2',
    'goodIdeas.realizacao.3',
    'goodIdeas.realizacao.4',
    'goodIdeas.realizacao.5',
  ],
}

export const DAILY_QUOTES: TranslationKey[] = [
  'quotes.0',
  'quotes.1',
  'quotes.2',
  'quotes.3',
  'quotes.4',
  'quotes.5',
  'quotes.6',
  'quotes.7',
  'quotes.8',
  'quotes.9',
]
