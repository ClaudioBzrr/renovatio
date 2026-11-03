import { useMemo } from 'react'
import { useI18n } from './I18nProvider'
import {
  CATEGORY_KEYS,
  GOOD_ACTION_KEYS,
} from '../data/suggestions'
import type { CategoryKey, GoodActionType } from '../types'

export interface CategoryMetaLocalized {
  key: CategoryKey
  label: string
  description: string
}

export interface GoodActionMetaLocalized {
  key: GoodActionType
  label: string
  description: string
  prompt: string
}

export function useCategoryMeta(): Record<CategoryKey, CategoryMetaLocalized> {
  const { t } = useI18n()
  return useMemo(
    () =>
      Object.fromEntries(
        CATEGORY_KEYS.map((key) => [
          key,
          {
            key,
            label: t(`categories.${key}.label`),
            description: t(`categories.${key}.description`),
          },
        ]),
      ) as Record<CategoryKey, CategoryMetaLocalized>,
    [t],
  )
}

export function useGoodActionMeta(): Record<
  GoodActionType,
  GoodActionMetaLocalized
> {
  const { t } = useI18n()
  return useMemo(
    () =>
      Object.fromEntries(
        GOOD_ACTION_KEYS.map((key) => [
          key,
          {
            key,
            label: t(`actions.${key}.label`),
            description: t(`actions.${key}.description`),
            prompt: t(`actions.${key}.prompt`),
          },
        ]),
      ) as Record<GoodActionType, GoodActionMetaLocalized>,
    [t],
  )
}
