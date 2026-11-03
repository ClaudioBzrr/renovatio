import type { AppData } from '../types'
import { normalizeAppData } from './storage'

const BACKUP_FORMAT = 'renovatio-encrypted-backup'
const BACKUP_VERSION = 1
const PBKDF2_ITERATIONS = 310_000
const SALT_BYTES = 16
const IV_BYTES = 12

interface EncryptedEnvelope {
  format: typeof BACKUP_FORMAT
  version: typeof BACKUP_VERSION
  createdAt: string
  kdf: {
    name: 'PBKDF2'
    hash: 'SHA-256'
    iterations: number
    salt: string
  }
  cipher: {
    name: 'AES-GCM'
    iv: string
  }
  payload: string
}

function bytesToBase64(bytes: Uint8Array): string {
  let binary = ''
  const chunkSize = 0x8000
  for (let index = 0; index < bytes.length; index += chunkSize) {
    binary += String.fromCharCode(
      ...bytes.subarray(index, Math.min(index + chunkSize, bytes.length)),
    )
  }
  return btoa(binary)
}

function base64ToBytes(value: string): Uint8Array {
  const binary = atob(value)
  const bytes = new Uint8Array(binary.length)
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index)
  }
  return bytes
}

function assertCryptoAvailable(): void {
  if (!globalThis.crypto?.subtle) {
    throw new Error('Web Crypto is not available in this browser')
  }
}

async function deriveKey(
  password: string,
  salt: Uint8Array,
  iterations: number,
): Promise<CryptoKey> {
  const encoder = new TextEncoder()
  const material = await crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    'PBKDF2',
    false,
    ['deriveKey'],
  )
  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt as BufferSource,
      iterations,
      hash: 'SHA-256',
    },
    material,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt'],
  )
}

export function encryptionAvailable(): boolean {
  return Boolean(globalThis.crypto?.subtle)
}

export async function encryptBackup(
  data: AppData,
  password: string,
): Promise<string> {
  assertCryptoAvailable()
  const salt = crypto.getRandomValues(new Uint8Array(SALT_BYTES))
  const iv = crypto.getRandomValues(new Uint8Array(IV_BYTES))
  const key = await deriveKey(password, salt, PBKDF2_ITERATIONS)
  const encoder = new TextEncoder()
  const encrypted = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    encoder.encode(JSON.stringify(data)),
  )
  const envelope: EncryptedEnvelope = {
    format: BACKUP_FORMAT,
    version: BACKUP_VERSION,
    createdAt: new Date().toISOString(),
    kdf: {
      name: 'PBKDF2',
      hash: 'SHA-256',
      iterations: PBKDF2_ITERATIONS,
      salt: bytesToBase64(salt),
    },
    cipher: {
      name: 'AES-GCM',
      iv: bytesToBase64(iv),
    },
    payload: bytesToBase64(new Uint8Array(encrypted)),
  }
  return JSON.stringify(envelope, null, 2)
}

export async function decryptBackup(
  serialized: string,
  password: string,
): Promise<AppData> {
  assertCryptoAvailable()
  let envelope: EncryptedEnvelope
  try {
    envelope = JSON.parse(serialized) as EncryptedEnvelope
  } catch {
    throw new Error('Invalid backup file')
  }
  if (
    envelope?.format !== BACKUP_FORMAT ||
    envelope.version !== BACKUP_VERSION ||
    envelope.kdf?.name !== 'PBKDF2' ||
    envelope.kdf.hash !== 'SHA-256' ||
    envelope.cipher?.name !== 'AES-GCM' ||
    typeof envelope.kdf.salt !== 'string' ||
    typeof envelope.cipher.iv !== 'string' ||
    typeof envelope.payload !== 'string'
  ) {
    throw new Error('Invalid backup file')
  }
  if (
    !Number.isInteger(envelope.kdf.iterations) ||
    envelope.kdf.iterations < 100_000 ||
    envelope.kdf.iterations > 2_000_000
  ) {
    throw new Error('Invalid backup parameters')
  }
  const salt = base64ToBytes(envelope.kdf.salt)
  const iv = base64ToBytes(envelope.cipher.iv)
  const payload = base64ToBytes(envelope.payload)
  const key = await deriveKey(password, salt, envelope.kdf.iterations)
  const decrypted = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: iv as BufferSource },
    key,
    payload as BufferSource,
  )
  const decoded = new TextDecoder().decode(decrypted)
  return normalizeAppData(JSON.parse(decoded))
}

export function downloadEncryptedBackup(serialized: string): void {
  const blob = new Blob([serialized], {
    type: 'application/octet-stream',
  })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = `renovatio-backup-${new Date().toISOString().slice(0, 10)}.renovatio`
  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()
  URL.revokeObjectURL(url)
}
