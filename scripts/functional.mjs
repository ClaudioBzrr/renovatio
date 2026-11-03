import { chromium } from 'playwright-core'
import { readFile, unlink } from 'node:fs/promises'

const CHROME =
  process.env.CHROME_PATH ||
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
const BASE = process.env.BASE_URL || 'http://127.0.0.1:4173/renovatio/'
const browser = await chromium.launch({ executablePath: CHROME, headless: true })
const now = new Date()
const pad = (n) => String(n).padStart(2, '0')
const key = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
const today = key(now)
const timeNow = `${pad(now.getHours())}:${pad(now.getMinutes())}`

function baseSeed(overrides = {}) {
  return {
    version: 1,
    profile: { name: 'Clara', onboarded: true, createdAt: now.toISOString() },
    tasks: [
      { id: 't1', title: 'Caminhar 5 minutos ao sol', category: 'corpo', time: '07:30', days: [0,1,2,3,4,5,6], createdAt: now.toISOString() },
      { id: 't2', title: 'Ouvir uma música inteira sem fazer nada', category: 'sentidos', time: '13:00', days: [0,1,2,3,4,5,6], createdAt: now.toISOString() },
    ],
    completions: [],
    goodActions: [],
    settings: { notificationsEnabled: false, reminderLead: 0 },
    ...overrides,
  }
}

async function newContext({ seed = baseSeed(), permissions = [] } = {}) {
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 }, locale: 'pt-BR' })
  if (permissions.length) await context.grantPermissions(permissions, { origin: BASE })
  await context.addInitScript((data) => {
    localStorage.setItem('renovatio.data.v1', JSON.stringify(data))
    if (!localStorage.getItem('renovatio.locale')) {
      localStorage.setItem('renovatio.locale', 'pt-BR')
    }
  }, seed)
  const page = await context.newPage()
  const errors = []
  page.on('console', (msg) => { if (msg.type() === 'error') errors.push(msg.text()) })
  page.on('pageerror', (err) => errors.push(err.message))
  return { context, page, errors }
}

const results = []
function check(name, condition, detail = '') {
  results.push({ name, ok: Boolean(condition), detail })
  console.log(`${condition ? 'PASS' : 'FAIL'} ${name}${detail ? ` — ${detail}` : ''}`)
}

// 1. Landing page before onboarding
{
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 }, locale: 'en-US' })
  const page = await context.newPage()
  const errors = []
  page.on('console', (msg) => { if (msg.type() === 'error') errors.push(msg.text()) })
  page.on('pageerror', (err) => errors.push(err.message))
  await page.goto(`${BASE}#/hoje`, { waitUntil: 'networkidle' })
  await page.waitForTimeout(500)
  check('landing shown before onboarding', await page.locator('.landing').isVisible())
  check('landing route normalized', new URL(page.url()).hash === '#/inicio')
  await page.getByRole('button', { name: 'Get started' }).first().click()
  await page.waitForTimeout(350)
  check('onboarding starts from landing', await page.locator('.onboarding').isVisible())
  check('onboarding route', new URL(page.url()).hash === '#/comecar')
  await page.getByRole('button', { name: 'Back to presentation' }).click()
  await page.waitForTimeout(350)
  check('back to landing', new URL(page.url()).hash === '#/inicio')
  check('no console errors (landing)', errors.length === 0, errors.join(' | '))
  await context.close()
}

// 2. Complete a micro-task with a reflection
{
  const { context, page, errors } = await newContext()
  await page.goto(`${BASE}#/hoje`, { waitUntil: 'networkidle' })
  await page.getByRole('button', { name: /Já fiz/ }).click()
  await page.locator('#reflection-text').fill('O sol esquentou meu rosto por alguns segundos e eu notei.')
  await page.locator('#sensory-text').fill('O calor no rosto e o som dos passarinhos.')
  await page.getByRole('button', { name: /Guardar esta faísca/ }).click()
  await page.waitForTimeout(500)
  check('reflection success screen', await page.getByRole('heading', { name: 'Faísca guardada.' }).isVisible())
  const saved = await page.evaluate(() => JSON.parse(localStorage.getItem('renovatio.data.v1')))
  check('completion persisted', saved.completions.length === 1, JSON.stringify(saved.completions[0]?.reflection))
  check('sensory persisted', saved.completions[0]?.sensoryNote?.includes('calor'))
  check('no console errors (reflection)', errors.length === 0, errors.join(' | '))
  await context.close()
}

// 2. Add good actions, including the third and the celebration
{
  const seed = baseSeed({
    goodActions: [
      { id: 'g1', date: today, type: 'gentileza', description: 'Elogiei uma colega.', createdAt: now.toISOString() },
      { id: 'g2', date: today, type: 'conexao', description: 'Liguei para minha irmã.', createdAt: now.toISOString() },
    ],
  })
  const { context, page, errors } = await newContext({ seed })
  await page.goto(`${BASE}#/gestos`, { waitUntil: 'networkidle' })
  await page.getByRole('button', { name: /Registrar gesto/ }).first().click()
  await page.locator('#good-action-description').fill('Arrumar a gaveta que estava me incomodando.')
  await page.getByRole('button', { name: /Registrar gesto/ }).last().click()
  await page.waitForTimeout(500)
  check('third good action celebration', await page.locator('.goal-complete').isVisible())
  const saved = await page.evaluate(() => JSON.parse(localStorage.getItem('renovatio.data.v1')))
  check('good action persisted', saved.goodActions.length === 3)
  check('no console errors (good action)', errors.length === 0, errors.join(' | '))
  await context.close()
}

// 3. Edit task
{
  const { context, page, errors } = await newContext()
  await page.goto(`${BASE}#/rotina`, { waitUntil: 'networkidle' })
  await page.getByRole('button', { name: /Editar Caminhar/ }).click()
  await page.locator('#task-title').fill('Caminhar 8 minutos ao sol')
  await page.locator('#task-time').fill('08:15')
  await page.getByRole('button', { name: /Salvar mudanças/ }).click()
  await page.waitForTimeout(400)
  const saved = await page.evaluate(() => JSON.parse(localStorage.getItem('renovatio.data.v1')))
  check('task edited', saved.tasks[0].title === 'Caminhar 8 minutos ao sol' && saved.tasks[0].time === '08:15')
  check('no console errors (task edit)', errors.length === 0, errors.join(' | '))
  await context.close()
}

// 4. Encrypted backup export and import
{
  const uniqueReflection = 'UNIQUE_ENCRYPTED_REFLECTION_123'
  const seed = baseSeed({
    completions: [
      {
        id: 'encrypted-completion',
        taskId: 't1',
        taskTitle: 'Caminhar 5 minutos ao sol',
        category: 'corpo',
        date: today,
        completedAt: now.toISOString(),
        reflection: uniqueReflection,
      },
    ],
  })
  const { context, page, errors } = await newContext({ seed })
  const backupPath = 'qa-test-backup.renovatio'
  await page.goto(`${BASE}#/hoje`, { waitUntil: 'networkidle' })
  await page.getByRole('button', { name: 'Ajustes' }).click()
  await page.getByRole('tab', { name: 'Dados' }).click()
  await page.getByRole('button', { name: 'Exportar backup criptografado' }).click()
  await page.locator('#backup-password').fill('test-passphrase-123')
  await page.locator('#backup-confirmation').fill('test-passphrase-123')
  const [download] = await Promise.all([
    page.waitForEvent('download'),
    page.getByRole('button', { name: 'Exportar backup', exact: true }).click(),
  ])
  await download.saveAs(backupPath)
  const encrypted = await readFile(backupPath, 'utf8')
  check('encrypted backup uses the expected format', encrypted.includes('"format": "renovatio-encrypted-backup"'))
  check('encrypted backup does not contain plaintext', !encrypted.includes(uniqueReflection))
  check('encrypted backup has a payload', encrypted.includes('"payload"'))
  await page.waitForTimeout(300)
  await page.getByRole('button', { name: 'Ajustes' }).click()
  await page.getByRole('tab', { name: 'Dados' }).click()
  await page.getByRole('button', { name: 'Importar backup criptografado' }).click()
  await page.locator('#backup-file').setInputFiles(backupPath)
  await page.locator('#backup-password').fill('test-passphrase-123')
  await page.getByRole('button', { name: 'Importar e substituir' }).click()
  await page.waitForTimeout(900)
  const restored = await page.evaluate(() => JSON.parse(localStorage.getItem('renovatio.data.v1')))
  check(
    'encrypted backup imports correctly',
    restored.completions.some((item) => item.reflection === uniqueReflection),
  )
  check('no console errors (encrypted backup)', errors.length === 0, errors.join(' | '))
  await unlink(backupPath).catch(() => {})
  await context.close()
}

// 5. Notification scheduling + due in-app alert
{
  const seed = baseSeed({
    tasks: [
      { id: 'tnow', title: 'Abrir a janela e sentir o ar', category: 'sentidos', time: timeNow, days: [0,1,2,3,4,5,6], createdAt: now.toISOString() },
    ],
    settings: { notificationsEnabled: true, reminderLead: 0 },
  })
  const { context, page, errors } = await newContext({ seed, permissions: ['notifications'] })
  await page.goto(`${BASE}#/hoje`, { waitUntil: 'networkidle' })
  const permission = await page.evaluate(() => Notification.permission)
  check('notification permission granted', permission === 'granted', permission)
  await page.waitForFunction(() => navigator.serviceWorker.ready.then(() => true), null, { timeout: 10000 })
  await page.waitForTimeout(1800)
  const notificationInfo = await page.evaluate(async () => {
    const registration = await navigator.serviceWorker.ready
    const notifications = await registration.getNotifications()
    return notifications.map((n) => ({ title: n.title, tag: n.tag }))
  })
  check('system notification shown', notificationInfo.length > 0, JSON.stringify(notificationInfo))
  const notifiedKeys = await page.evaluate(() => Object.keys(localStorage).filter((key) => key.startsWith('renovatio.notified.')))
  check('reminder marked as notified', notifiedKeys.length > 0, notifiedKeys.join(','))
  const toastVisible = await page.locator('.toast').first().isVisible().catch(() => false)
  check('in-app alert shown', toastVisible)
  check('no console errors (notification)', errors.length === 0, errors.join(' | '))
  await context.close()
}

// 5. Offline reload after service worker install
{
  const { context, page, errors } = await newContext()
  await page.goto(`${BASE}#/hoje`, { waitUntil: 'networkidle' })
  await page.waitForFunction(() => navigator.serviceWorker.ready.then(() => true), null, { timeout: 10000 })
  await page.reload({ waitUntil: 'networkidle' })
  const controlled = await page.evaluate(() => Boolean(navigator.serviceWorker.controller))
  check('page controlled by service worker', controlled)
  await context.setOffline(true)
  await page.reload({ waitUntil: 'domcontentloaded' })
  await page.waitForTimeout(600)
  check('offline app renders', await page.getByText('Boa noite, Clara.').isVisible().catch(() => false) || await page.locator('.page-title').isVisible())
  check('no console errors (offline)', errors.length === 0, errors.join(' | '))
  await context.close()
}

// 6. English locale, language switch and persistence
{
  const { context, page } = await newContext()
  await page.goto(`${BASE}#/hoje`, { waitUntil: 'networkidle' })
  await page.getByRole('button', { name: 'Ajustes' }).click()
  await page.getByRole('button', { name: 'English (US)' }).click()
  check(
    'language switch updates document lang',
    (await page.evaluate(() => document.documentElement.lang)) === 'en-US',
  )
  await page.getByRole('button', { name: 'Close' }).click()
  const navToday = await page
    .getByRole('button', { name: 'Today', exact: true })
    .isVisible()
    .catch(() => false)
  check('language switch updates navigation', navToday)
  await page.reload({ waitUntil: 'networkidle' })
  check(
    'language persists after reload',
    (await page.evaluate(() => document.documentElement.lang)) === 'en-US',
  )
  await page.goto(`${BASE}#/gestos`, { waitUntil: 'networkidle' })
  const gesturesTitle = await page.locator('.page-title').innerText()
  check(
    'English gestures page renders',
    gesturesTitle.includes('Three good gestures') && gesturesTitle.includes('Every day'),
    gesturesTitle,
  )
  await page.goto(`${BASE}#/metodo`, { waitUntil: 'networkidle' })
  const methodTitle = await page.locator('.page-title').innerText()
  check(
    'English method page renders',
    methodTitle.includes('Anhedonia is not laziness'),
    methodTitle,
  )
  check(
    'English FAQ renders',
    await page.getByText('What is Renovatio?').isVisible().catch(() => false),
  )
  await context.close()
}

// 7. Manifest and installability basics
{
  const { context, page } = await newContext()
  await page.goto(`${BASE}#/hoje`, { waitUntil: 'networkidle' })
  const manifest = await page.evaluate(async () => {
    const link = document.querySelector('link[rel="manifest"]')
    if (!link) return null
    const response = await fetch(link.href)
    return { href: link.href, json: await response.json() }
  })
  check('manifest present', Boolean(manifest?.json?.name), manifest?.json?.name)
  check('manifest has icons', (manifest?.json?.icons?.length ?? 0) >= 3)
  check('manifest standalone', manifest?.json?.display === 'standalone')
  await context.close()
}

await browser.close()
const failed = results.filter((result) => !result.ok)
console.log(`\n${results.length - failed.length}/${results.length} checks passed.`)
if (failed.length) process.exitCode = 1

