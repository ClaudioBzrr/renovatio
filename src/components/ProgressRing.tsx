import type { ReactNode } from 'react'
import { useI18n } from '../i18n/I18nProvider'

interface ProgressRingProps {
  value: number
  size?: number
  stroke?: number
  children?: ReactNode
  tone?: 'ember' | 'light' | 'moss'
  label?: string
}

export function ProgressRing({
  value,
  size = 112,
  stroke = 7,
  children,
  tone = 'ember',
  label,
}: ProgressRingProps) {
  const { t } = useI18n()
  const clamped = Math.min(1, Math.max(0, value))
  const radius = (size - stroke) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference * (1 - clamped)

  return (
    <div
      className={`progress-ring progress-ring--${tone}`}
      style={{ width: size, height: size }}
      role="img"
      aria-label={label ?? t('progress.complete', { n: Math.round(clamped * 100) })}
    >
      <svg width={size} height={size} aria-hidden="true">
        <circle
          className="progress-ring__track"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={stroke}
        />
        <circle
          className="progress-ring__value"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={stroke}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </svg>
      <div className="progress-ring__content">{children}</div>
    </div>
  )
}
