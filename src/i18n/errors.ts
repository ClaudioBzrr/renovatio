import type { StoreError } from '../types'
import type { TranslationKey } from './translations'

export function storeErrorKey(error?: StoreError): TranslationKey {
  return `errors.${error ?? 'generic'}` as TranslationKey
}
