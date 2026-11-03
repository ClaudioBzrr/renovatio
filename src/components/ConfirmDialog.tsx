import { AlertTriangle } from 'lucide-react'
import { Modal } from './Modal'
import { useI18n } from '../i18n/I18nProvider'

interface ConfirmDialogProps {
  open: boolean
  title: string
  description: string
  confirmLabel?: string
  cancelLabel?: string
  danger?: boolean
  onConfirm: () => void
  onClose: () => void
}

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel,
  cancelLabel,
  danger = false,
  onConfirm,
  onClose,
}: ConfirmDialogProps) {
  const { t } = useI18n()
  return (
    <Modal open={open} onClose={onClose} title={title} size="sm">
      <div className="confirm-dialog">
        <span className={`confirm-dialog__icon ${danger ? 'confirm-dialog__icon--danger' : ''}`}>
          <AlertTriangle size={20} strokeWidth={1.8} />
        </span>
        <p>{description}</p>
      </div>
      <div className="modal-actions">
        <button type="button" className="button button--ghost" onClick={onClose}>
          {cancelLabel ?? t('common.cancel')}
        </button>
        <button
          type="button"
          className={`button ${danger ? 'button--danger' : 'button--primary'}`}
          onClick={() => {
            onConfirm()
            onClose()
          }}
        >
          {confirmLabel ?? t('common.confirm')}
        </button>
      </div>
    </Modal>
  )
}
