import {
  useId,
  useLayoutEffect,
  useRef,
  type ReactNode,
} from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'
import { useI18n } from '../i18n/I18nProvider'

interface ModalProps {
  open: boolean
  onClose: () => void
  title?: string
  eyebrow?: string
  children: ReactNode
  footer?: ReactNode
  size?: 'sm' | 'md' | 'lg'
  className?: string
  hideClose?: boolean
  ariaLabel?: string
  describedBy?: string
}

const FOCUSABLE =
  'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'

/** Shared locks so stacked dialogs never leave the app inert or scroll-locked. */
let modalLockCount = 0
let bodyLockCount = 0
let previousBodyOverflow = ''

function lockBodyScroll(): void {
  if (bodyLockCount === 0) {
    previousBodyOverflow = document.body.style.overflow
  }
  document.body.style.overflow = 'hidden'
  bodyLockCount += 1
}

function unlockBodyScroll(): void {
  bodyLockCount = Math.max(0, bodyLockCount - 1)
  if (bodyLockCount === 0) {
    document.body.style.overflow = previousBodyOverflow
  }
}

function lockAppBackground(): void {
  if (modalLockCount === 0) {
    const root = document.getElementById('root')
    root?.setAttribute('inert', '')
    root?.setAttribute('aria-hidden', 'true')
  }
  modalLockCount += 1
}

function unlockAppBackground(): boolean {
  modalLockCount = Math.max(0, modalLockCount - 1)
  if (modalLockCount > 0) return false
  const root = document.getElementById('root')
  root?.removeAttribute('inert')
  root?.removeAttribute('aria-hidden')
  return true
}

export function Modal({
  open,
  onClose,
  title,
  eyebrow,
  children,
  footer,
  size = 'md',
  className = '',
  hideClose = false,
  ariaLabel,
  describedBy,
}: ModalProps) {
  const { t } = useI18n()
  const titleId = useId()
  const panelRef = useRef<HTMLDivElement>(null)
  const onCloseRef = useRef(onClose)
  onCloseRef.current = onClose

  useLayoutEffect(() => {
    if (!open) return
    const previousFocus = document.activeElement as HTMLElement | null
    lockBodyScroll()
    lockAppBackground()

    const panel = panelRef.current
    if (panel) {
      const preferred = panel.querySelector<HTMLElement>('[data-autofocus]')
      const autofocus =
        preferred && preferred.offsetParent !== null ? preferred : null
      // Focusing the dialog itself announces its accessible name. Forms with
      // an explicit autofocus target still receive focus directly.
      ;(autofocus ?? panel).focus()
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        onCloseRef.current()
        return
      }
      if (event.key !== 'Tab') return
      const panel = panelRef.current
      if (!panel) return
      const items = Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
        (element) => element.offsetParent !== null,
      )
      if (items.length === 0) {
        event.preventDefault()
        panel.focus()
        return
      }
      const first = items[0]
      const last = items[items.length - 1]
      if (document.activeElement === panel) {
        event.preventDefault()
        ;(event.shiftKey ? last : first).focus()
      } else if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      unlockBodyScroll()
      const shouldRestoreFocus = unlockAppBackground()
      if (shouldRestoreFocus) previousFocus?.focus?.()
    }
  }, [open])

  if (!open) return null

  return createPortal(
    <div
      className="modal-backdrop"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <div
        ref={panelRef}
        className={`modal modal--${size} ${className}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        aria-label={!title ? ariaLabel : undefined}
        aria-describedby={describedBy}
        tabIndex={-1}
      >
        {!hideClose ? (
          <button
            type="button"
            className="modal__close"
            onClick={onClose}
            aria-label={t('modal.close')}
          >
            <X size={19} strokeWidth={1.8} />
          </button>
        ) : null}
        {title ? (
          <header className="modal__header">
            {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
            <h2 id={titleId} className="modal__title">
              {title}
            </h2>
          </header>
        ) : null}
        <div className="modal__body">{children}</div>
        {footer ? <footer className="modal__footer">{footer}</footer> : null}
      </div>
    </div>,
    document.body,
  )
}
