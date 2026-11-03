import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react'
import { useI18n } from '../i18n/I18nProvider'

export type ToastTone = 'default' | 'success' | 'warning'

export interface ToastInput {
  title: string
  description?: string
  tone?: ToastTone
  duration?: number
  action?: {
    label: string
    onClick: () => void
  }
}

interface ToastItem extends ToastInput {
  id: number
  tone: ToastTone
  duration: number
}

interface ToastContextValue {
  pushToast: (toast: ToastInput) => number
  dismissToast: (id: number) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

function ToastCard({
  toast,
  onDismiss,
}: {
  toast: ToastItem
  onDismiss: (id: number) => void
}) {
  const { t } = useI18n()
  const timerRef = useRef<number | null>(null)

  useEffect(() => {
    if (toast.duration <= 0) return
    timerRef.current = window.setTimeout(() => onDismiss(toast.id), toast.duration)
    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current)
    }
  }, [onDismiss, toast.duration, toast.id])

  const Icon =
    toast.tone === 'success'
      ? CheckCircle2
      : toast.tone === 'warning'
        ? AlertCircle
        : Info

  return (
    <div className={`toast toast--${toast.tone}`} role="status">
      <span className="toast__icon" aria-hidden="true">
        <Icon size={18} strokeWidth={1.8} />
      </span>
      <div className="toast__body">
        <p className="toast__title">{toast.title}</p>
        {toast.description ? (
          <p className="toast__description">{toast.description}</p>
        ) : null}
        {toast.action ? (
          <button
            type="button"
            className="toast__action"
            onClick={() => {
              toast.action?.onClick()
              onDismiss(toast.id)
            }}
          >
            {toast.action.label}
          </button>
        ) : null}
      </div>
      <button
        type="button"
        className="toast__close"
        aria-label={t('toast.dismiss')}
        onClick={() => onDismiss(toast.id)}
      >
        <X size={16} />
      </button>
    </div>
  )
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([])
  const counter = useRef(0)

  const dismissToast = useCallback((id: number) => {
    setToasts((current) => current.filter((toast) => toast.id !== id))
  }, [])

  const pushToast = useCallback((input: ToastInput) => {
    counter.current += 1
    const id = counter.current
    setToasts((current) => [
      ...current.slice(-2),
      {
        ...input,
        id,
        tone: input.tone ?? 'default',
        duration: input.duration ?? 5200,
      },
    ])
    return id
  }, [])

  const value = useMemo(() => ({ pushToast, dismissToast }), [pushToast, dismissToast])

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="toast-stack" aria-live="polite" aria-atomic="false">
        {toasts.map((toast) => (
          <ToastCard key={toast.id} toast={toast} onDismiss={dismissToast} />
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast(): ToastContextValue {
  const context = useContext(ToastContext)
  if (!context) throw new Error('useToast precisa estar dentro de ToastProvider')
  return context
}
