import {
  Footprints,
  HandHeart,
  Moon,
  MessagesSquare,
  PenLine,
  Sparkles,
  CheckCircle2,
  type LucideIcon,
} from 'lucide-react'
import type { CategoryKey, GoodActionType } from '../types'

const CATEGORY_ICONS: Record<CategoryKey, LucideIcon> = {
  corpo: Footprints,
  sentidos: Sparkles,
  conexao: MessagesSquare,
  criacao: PenLine,
  ordem: CheckCircle2,
  descanso: Moon,
}

const ACTION_ICONS: Record<GoodActionType, LucideIcon> = {
  gentileza: HandHeart,
  conexao: MessagesSquare,
  realizacao: CheckCircle2,
}

export function CategoryIcon({
  category,
  size = 18,
  strokeWidth = 1.8,
}: {
  category: CategoryKey
  size?: number
  strokeWidth?: number
}) {
  const Icon = CATEGORY_ICONS[category]
  return <Icon size={size} strokeWidth={strokeWidth} aria-hidden="true" />
}

export function GoodActionIcon({
  type,
  size = 18,
  strokeWidth = 1.8,
}: {
  type: GoodActionType
  size?: number
  strokeWidth?: number
}) {
  const Icon = ACTION_ICONS[type]
  return <Icon size={size} strokeWidth={strokeWidth} aria-hidden="true" />
}
