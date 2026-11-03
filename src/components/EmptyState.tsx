import type { ReactNode } from 'react'
import { BrandMark } from './Brand'

interface EmptyStateProps {
  title: string
  description: string
  action?: ReactNode
  compact?: boolean
}

export function EmptyState({ title, description, action, compact = false }: EmptyStateProps) {
  return (
    <div className={`empty-state ${compact ? 'empty-state--compact' : ''}`}>
      <span className="empty-state__mark" aria-hidden="true">
        <BrandMark size={compact ? 34 : 44} />
      </span>
      <h3>{title}</h3>
      <p>{description}</p>
      {action ? <div className="empty-state__action">{action}</div> : null}
    </div>
  )
}
