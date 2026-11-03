import type { Locale } from './types'

export interface NotificationStrings {
  titleNow: string
  body: string
  open: string
  snooze: string
  snoozeTitle: string
  snoozeBody: string
  testTitle: string
  testBody: string
}

const STRINGS: Record<Locale, NotificationStrings> = {
  'pt-BR': {
    titleNow: 'Agora: {title}',
    body: 'Comece pequeno. Dois minutos de imaginação e depois só começar.',
    open: 'Abrir',
    snooze: 'Mais 10 min',
    snoozeTitle: 'Ainda é hora: {title}',
    snoozeBody:
      'Dez minutos passaram. Um gesto pequeno ainda cabe no seu dia.',
    testTitle: 'O Renovatio está aceso.',
    testBody: 'É assim que seu lembrete vai aparecer na hora marcada.',
  },
  'en-US': {
    titleNow: 'Now: {title}',
    body: 'Start small. Two minutes of imagination, then just begin.',
    open: 'Open',
    snooze: '10 more min',
    snoozeTitle: 'Still time: {title}',
    snoozeBody:
      'Ten minutes passed. A small gesture still fits into your day.',
    testTitle: 'Renovatio is lit.',
    testBody: 'This is how your reminder will appear at the set time.',
  },
}

export function notificationStrings(locale: Locale): NotificationStrings {
  return STRINGS[locale] ?? STRINGS['pt-BR']
}

export function fillTemplate(
  template: string,
  params: Record<string, string>,
): string {
  return Object.entries(params).reduce(
    (value, [key, param]) => value.split(`{${key}}`).join(param),
    template,
  )
}
