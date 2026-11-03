import { chromium } from 'playwright-core'

const CHROME =
  process.env.CHROME_PATH ||
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
const BASE = process.env.BASE_URL || 'http://127.0.0.1:4173/renovatio/'

const browser = await chromium.launch({ executablePath: CHROME, headless: true })
const context = await browser.newContext({
  viewport: { width: 1280, height: 900 },
  locale: 'pt-BR',
})
const now = new Date()

await context.addInitScript(
  (data) => {
    localStorage.setItem('renovatio.data.v1', JSON.stringify(data))
    localStorage.setItem('renovatio.locale', 'pt-BR')
  },
  {
    version: 1,
    profile: { name: 'Clara', onboarded: true, createdAt: now.toISOString() },
    tasks: [
      {
        id: 'a11y-task',
        title: 'Caminhar 5 minutos ao sol',
        category: 'corpo',
        time: '07:30',
        days: [0, 1, 2, 3, 4, 5, 6],
        createdAt: now.toISOString(),
      },
    ],
    completions: [],
    goodActions: [],
    settings: { notificationsEnabled: false, reminderLead: 0 },
  },
)

const page = await context.newPage()
const results = []
const check = (name, condition, detail = '') => {
  results.push({ name, ok: Boolean(condition), detail })
  console.log(`${condition ? 'PASS' : 'FAIL'} ${name}${detail ? ` — ${detail}` : ''}`)
}

async function auditPage(route) {
  await page.goto(`${BASE}#/${route}`, { waitUntil: 'networkidle' })
  await page.waitForTimeout(120)
  const info = await page.evaluate(() => {
      const isVisible = (element) => {
        const style = getComputedStyle(element)
        return (
          style.display !== 'none' &&
          style.visibility !== 'hidden' &&
          element.getClientRects().length > 0
        )
      }
      const name = (el) => (el.getAttribute('aria-label') || el.textContent || '').trim()
      const badButtons = [...document.querySelectorAll('button')]
        .filter((button) => isVisible(button) && !name(button))
        .map((button) => button.outerHTML.slice(0, 100))
      const badFields = [...document.querySelectorAll('input, textarea, select')]
        .filter((field) => {
          if (!isVisible(field)) return false
          if (field.getAttribute('aria-label') || field.getAttribute('aria-labelledby')) {
            return false
          }
          if (field.id && document.querySelector(`label[for="${field.id}"]`)) {
            return false
          }
          return !field.closest('label')
        })
        .map((field) => field.outerHTML.slice(0, 100))
      const ids = [...document.querySelectorAll('[id]')].map((element) => element.id)
      const duplicateIds = [...new Set(ids.filter((id, index) => ids.indexOf(id) !== index))]
      const brokenRefs = [...document.querySelectorAll(
        '[aria-labelledby], [aria-describedby], [aria-controls]',
      )].flatMap((element) =>
        ['aria-labelledby', 'aria-describedby', 'aria-controls'].flatMap((attribute) => {
          const value = element.getAttribute(attribute)
          if (!value) return []
          return value
            .split(/\s+/)
            .filter((id) => !document.getElementById(id))
            .map((id) => `${attribute}=${id}`)
        }),
      )
      return {
        mains: document.querySelectorAll('main').length,
        mainTarget: document.getElementById('main-content')?.tagName,
        h1: [...document.querySelectorAll('h1')].filter(isVisible).length,
        badButtons,
        badFields,
        duplicateIds,
        brokenRefs,
        lang: document.documentElement.lang,
        title: document.title,
      }
  })

  check(`${route}: one main landmark`, info.mains === 1, String(info.mains))
  check(`${route}: skip target exists`, info.mainTarget === 'MAIN', info.mainTarget)
  check(`${route}: one visible h1`, info.h1 === 1, String(info.h1))
  check(`${route}: buttons named`, info.badButtons.length === 0, info.badButtons.join(' | '))
  check(`${route}: fields labelled`, info.badFields.length === 0, info.badFields.join(' | '))
  check(`${route}: unique ids`, info.duplicateIds.length === 0, info.duplicateIds.join(','))
  check(`${route}: aria references resolve`, info.brokenRefs.length === 0, info.brokenRefs.join(','))
  check(`${route}: document language`, info.lang === 'pt-BR', info.lang)
  check(`${route}: document title`, Boolean(info.title), info.title)
}

for (const route of ['hoje', 'rotina', 'gestos', 'historia', 'metodo', 'inicio']) {
  await auditPage(route)
}

await page.goto(`${BASE}#/hoje`, { waitUntil: 'networkidle' })
await page.reload({ waitUntil: 'networkidle' })
await page.keyboard.press('Tab')
check(
  'skip link is the first tab stop',
  await page.evaluate(() => document.activeElement?.classList.contains('skip-link')),
)
await page.keyboard.press('Enter')
check(
  'skip link moves focus to main content',
  (await page.evaluate(() => document.activeElement?.id)) === 'main-content',
)

await page.getByRole('button', { name: /Ajustes/ }).click()
await page.waitForTimeout(120)
const dialog = await page.evaluate(() => {
  const element = document.querySelector('[role="dialog"]')
  return {
    count: document.querySelectorAll('[role="dialog"]').length,
    named: Boolean(
      element?.getAttribute('aria-labelledby') ||
        element?.getAttribute('aria-label'),
    ),
    focusInside: Boolean(
      document.activeElement && element?.contains(document.activeElement),
    ),
    rootInert: document.getElementById('root')?.hasAttribute('inert'),
  }
})
check('settings dialog is present', dialog.count === 1, String(dialog.count))
check('settings dialog has an accessible name', dialog.named)
check('settings dialog receives focus', dialog.focusInside)
check('background is inert while the dialog is open', dialog.rootInert)

await page.getByRole('tab').first().focus()
await page.keyboard.press('ArrowRight')
const selectedTab = await page.evaluate(
  () =>
    [...document.querySelectorAll('[role="tab"]')]
      .filter((tab) => tab.getAttribute('aria-selected') === 'true')
      .map((tab) => tab.textContent?.trim())[0],
)
check('tabs support arrow-key navigation', /Lembretes/.test(selectedTab || ''), selectedTab)

await page.keyboard.press('Escape')
await page.waitForTimeout(80)
const closed = await page.evaluate(() => ({
  dialogs: document.querySelectorAll('[role="dialog"]').length,
  rootInert: document.getElementById('root')?.hasAttribute('inert'),
}))
check(
  'escape closes the dialog and restores the page',
  closed.dialogs === 0 && !closed.rootInert,
  JSON.stringify(closed),
)

await page.getByRole('button', { name: /Ativar lembretes/ }).first().click()
await page.waitForTimeout(120)
check(
  'dialog opened on a hidden tab still receives focus',
  await page.evaluate(
    () =>
      document.activeElement?.getAttribute('role') === 'dialog' &&
      document.activeElement?.classList.contains('modal'),
  ),
)
await page.keyboard.press('Escape')

await page.getByRole('button', { name: /Micro-tarefa/ }).first().click()
await page.waitForTimeout(120)
await page.getByRole('button', { name: 'Criar micro-tarefa' }).click()
await page.waitForTimeout(120)
check(
  'validation errors receive focus',
  await page.evaluate(() => document.activeElement?.classList.contains('form-error')),
)
await page.keyboard.press('Escape')

await page.getByRole('button', { name: /Rotina/ }).first().click()
await page.waitForTimeout(200)
const announcements = await page.evaluate(() =>
  [...document.querySelectorAll('[role="status"]')]
    .map((element) => element.textContent?.trim())
    .filter(Boolean),
)
check(
  'route changes are announced',
  announcements.some((text) => text.includes('Rotina')),
  JSON.stringify(announcements),
)

const onboardingContext = await browser.newContext({
  viewport: { width: 1280, height: 900 },
  locale: 'pt-BR',
})
await onboardingContext.addInitScript(
  (data) => {
    localStorage.setItem('renovatio.data.v1', JSON.stringify(data))
    localStorage.setItem('renovatio.locale', 'pt-BR')
  },
  {
    version: 1,
    profile: { name: '', onboarded: false, createdAt: now.toISOString() },
    tasks: [],
    completions: [],
    goodActions: [],
    settings: { notificationsEnabled: false, reminderLead: 0 },
  },
)
const onboardingPage = await onboardingContext.newPage()
await onboardingPage.goto(`${BASE}#/comecar`, { waitUntil: 'networkidle' })
await onboardingPage.waitForTimeout(150)
const onboarding = await onboardingPage.evaluate(() => {
  const progress = document.querySelector('[role="progressbar"]')
  const heading = document.querySelector('[data-page-heading]')
  return {
    main: document.getElementById('main-content')?.tagName,
    progressName: progress?.getAttribute('aria-label'),
    progressValue: progress?.getAttribute('aria-valuenow'),
    headingFocused: document.activeElement === heading,
    headingText: heading?.textContent?.trim(),
  }
})
check('onboarding has a main landmark', onboarding.main === 'MAIN', onboarding.main)
check(
  'onboarding exposes step progress',
  Boolean(onboarding.progressName) && onboarding.progressValue === '1',
  `${onboarding.progressName} (${onboarding.progressValue})`,
)
check(
  'onboarding focuses the current step heading',
  onboarding.headingFocused,
  onboarding.headingText,
)

await onboardingPage.getByRole('button', { name: 'Começar', exact: true }).click()
await onboardingPage.waitForTimeout(120)
const secondStep = await onboardingPage.evaluate(() => ({
  progressValue: document
    .querySelector('[role="progressbar"]')
    ?.getAttribute('aria-valuenow'),
  headingFocused:
    document.activeElement === document.querySelector('[data-page-heading]'),
}))
check(
  'onboarding updates progress and focus on step change',
  secondStep.progressValue === '2' && secondStep.headingFocused,
  JSON.stringify(secondStep),
)
await onboardingContext.close()

await browser.close()
const failed = results.filter((result) => !result.ok)
console.log(`\n${results.length - failed.length}/${results.length} checks passed.`)
if (failed.length) process.exitCode = 1
