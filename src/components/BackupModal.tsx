import { useEffect, useRef, useState } from 'react'
import {
  AlertTriangle,
  Download,
  Eye,
  EyeOff,
  FileKey2,
  LockKeyhole,
  ShieldCheck,
  Upload,
} from 'lucide-react'
import { Modal } from './Modal'
import { useApp } from '../store/AppStore'
import { useToast } from './Toast'
import { useI18n } from '../i18n/I18nProvider'
import {
  decryptBackup,
  downloadEncryptedBackup,
  encryptBackup,
  encryptionAvailable,
} from '../lib/crypto'

export type BackupMode = 'export' | 'import'

interface BackupModalProps {
  open: boolean
  mode: BackupMode
  onClose: () => void
}

export function BackupModal({ open, mode, onClose }: BackupModalProps) {
  const { data, replaceData } = useApp()
  const { pushToast } = useToast()
  const { t } = useI18n()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [password, setPassword] = useState('')
  const [confirmation, setConfirmation] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [fileName, setFileName] = useState('')
  const [fileText, setFileText] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (!open) return
    setPassword('')
    setConfirmation('')
    setShowPassword(false)
    setFileName('')
    setFileText('')
    setError('')
    setBusy(false)
  }, [mode, open])

  const isExport = mode === 'export'

  const chooseFile = async (file: File | null) => {
    if (!file) return
    setError('')
    setFileName(file.name)
    try {
      setFileText(await file.text())
    } catch {
      setError(t('backup.errorNoFile'))
    }
  }

  const submit = async () => {
    setError('')
    if (!encryptionAvailable()) {
      setError(t('backup.errorCrypto'))
      return
    }
    if (isExport) {
      if (password.length < 8) {
        setError(t('backup.errorPasswordShort'))
        return
      }
      if (password !== confirmation) {
        setError(t('backup.errorPasswordMismatch'))
        return
      }
    } else {
      if (!fileText) {
        setError(t('backup.errorNoFile'))
        return
      }
      if (!password) {
        setError(t('backup.errorPasswordShort'))
        return
      }
    }

    setBusy(true)
    try {
      if (isExport) {
        const serialized = await encryptBackup(data, password)
        downloadEncryptedBackup(serialized)
        pushToast({
          title: t('backup.exportedTitle'),
          description: t('backup.exportedDesc'),
          tone: 'success',
        })
      } else {
        const imported = await decryptBackup(fileText, password)
        replaceData(imported)
        pushToast({
          title: t('backup.importedTitle'),
          description: t('backup.importedDesc'),
          tone: 'success',
        })
      }
      onClose()
    } catch {
      setError(t(isExport ? 'backup.errorGeneric' : 'backup.errorDecrypt'))
    } finally {
      setBusy(false)
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      eyebrow={t(isExport ? 'backup.exportEyebrow' : 'backup.importEyebrow')}
      title={t(isExport ? 'backup.exportTitle' : 'backup.importTitle')}
      size="md"
      footer={
        <div className="modal-actions">
          <button
            type="button"
            className="button button--ghost"
            onClick={onClose}
            disabled={busy}
          >
            {t('common.cancel')}
          </button>
          <button
            type="submit"
            form="backup-form"
            className="button button--primary"
            disabled={busy}
          >
            {isExport ? <Download size={16} /> : <Upload size={16} />}
            {t(isExport ? 'backup.exportSubmit' : 'backup.importSubmit')}
          </button>
        </div>
      }
    >
      <p className="modal-lede">
        {t(isExport ? 'backup.exportLede' : 'backup.importLede')}
      </p>

      <form
        id="backup-form"
        className="backup-form"
        onSubmit={(event) => {
          event.preventDefault()
          void submit()
        }}
      >
        {!isExport ? (
          <div className="field">
            <span className="field__label">{t('backup.fileLabel')}</span>
            <input
              ref={fileInputRef}
              id="backup-file"
              type="file"
              className="visually-hidden"
              accept=".renovatio,application/octet-stream"
              onChange={(event) => void chooseFile(event.target.files?.[0] ?? null)}
            />
            <button
              type="button"
              className="backup-file"
              onClick={() => fileInputRef.current?.click()}
            >
              <span className="backup-file__icon">
                <FileKey2 size={20} strokeWidth={1.8} />
              </span>
              <span className="backup-file__body">
                <strong>{fileName || t('backup.chooseFile')}</strong>
                <small>{t('backup.fileHelp')}</small>
              </span>
              <Upload size={17} className="backup-file__action" />
            </button>
          </div>
        ) : null}

        <div className="field">
          <label className="field__label" htmlFor="backup-password">
            {t('backup.password')}
          </label>
          <div className="password-field">
            <LockKeyhole size={17} strokeWidth={1.8} aria-hidden="true" />
            <input
              id="backup-password"
              data-autofocus
              className="input"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(event) => {
                setPassword(event.target.value)
                setError('')
              }}
              placeholder={t('backup.passwordPlaceholder')}
              autoComplete={isExport ? 'new-password' : 'current-password'}
              minLength={isExport ? 8 : 1}
            />
            <button
              type="button"
              className="password-field__toggle"
              aria-label={t(
                showPassword ? 'backup.hidePassword' : 'backup.showPassword',
              )}
              onClick={() => setShowPassword((current) => !current)}
            >
              {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
            </button>
          </div>
        </div>

        {isExport ? (
          <div className="field">
            <label className="field__label" htmlFor="backup-confirmation">
              {t('backup.confirmPassword')}
            </label>
            <div className="password-field">
              <LockKeyhole size={17} strokeWidth={1.8} aria-hidden="true" />
              <input
                id="backup-confirmation"
                className="input"
                type={showPassword ? 'text' : 'password'}
                value={confirmation}
                onChange={(event) => {
                  setConfirmation(event.target.value)
                  setError('')
                }}
                placeholder={t('backup.confirmPlaceholder')}
                autoComplete="new-password"
                minLength={8}
              />
            </div>
          </div>
        ) : null}

        {!isExport ? (
          <div className="backup-warning">
            <AlertTriangle size={17} strokeWidth={1.8} />
            <p>{t('backup.importWarning')}</p>
          </div>
        ) : null}

        <div className="backup-security">
          <ShieldCheck size={18} strokeWidth={1.8} />
          <div>
            <strong>{t('backup.securityTitle')}</strong>
            <p>{t('backup.securityNote')}</p>
            <small>{t('backup.warning')}</small>
          </div>
        </div>

        {error ? (
          <p className="form-error" role="alert">
            {error}
          </p>
        ) : null}
      </form>
    </Modal>
  )
}
