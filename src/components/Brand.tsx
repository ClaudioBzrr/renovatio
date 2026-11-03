import { useId } from 'react'
import { useI18n } from '../i18n/I18nProvider'

interface BrandProps {
  light?: boolean
  compact?: boolean
  className?: string
}

export function BrandMark({
  size = 32,
  className = '',
}: {
  size?: number
  className?: string
}) {
  const gradientId = `brand-ember-${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 512 512"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <defs>
        <linearGradient
          id={gradientId}
          x1="180"
          y1="120"
          x2="330"
          y2="430"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0" stopColor="#f4b26a" />
          <stop offset=".55" stopColor="#e2623c" />
          <stop offset="1" stopColor="#c8462c" />
        </linearGradient>
      </defs>
      <rect width="512" height="512" rx="120" fill="#201b17" />
      <path
        d="M256 88C300 170 356 218 356 308C356 388 308 436 256 436C204 436 156 388 156 308C156 236 196 194 232 136C238 190 258 214 276 232C288 202 280 148 256 88Z"
        fill={`url(#${gradientId})`}
      />
      <path
        d="M256 300c14 18 28 30 28 52 0 22-12 38-28 38s-28-16-28-38c0-22 14-34 28-52Z"
        fill="#f6f1e8"
        opacity=".92"
      />
    </svg>
  )
}

export function Brand({ light = false, compact = false, className = '' }: BrandProps) {
  const { t } = useI18n()

  return (
    <span
      className={`brand ${light ? 'brand--light' : ''} ${compact ? 'brand--compact' : ''} ${className}`}
    >
      <BrandMark size={compact ? 28 : 34} />
      {compact ? (
        <span className="brand__name brand__name--compact">renovatio</span>
      ) : (
        <span className="brand__text">
          <span className="brand__name">renovatio</span>
          <span className="brand__tag">{t('brand.tagline')}</span>
        </span>
      )}
    </span>
  )
}
