# Renovatio — English documentation

**Small steps to feel again.**

[Portuguese version](README.pt-BR.md) · [Back to README](../README.md)

Renovatio is a bilingual PWA for scheduling daily micro-tasks, training attention to what was minimally good and recording three good gestures a day. It is inspired by the video [“É por isso que você não sente prazer em nada (e como voltar a sentir)”](https://www.youtube.com/watch?v=aw3ksUsDVEE), from the **Saúde da Mente** channel.

> Renovatio is a support tool inspired by behavioral activation. It does not diagnose, treat or replace psychotherapy, medical assessment, medication or emergency support. In a crisis, call **188 (CVV, Brazil, 24h)** or **192 (SAMU)**.

## Links

- **App:** https://claudiobzrr.github.io/renovatio/
- **Repository:** https://github.com/ClaudioBzrr/renovatio
- **Portuguese documentation:** [README.pt-BR.md](README.pt-BR.md)

## Languages

The app has two complete languages:

- **Português (Brasil)** — default when the browser is in Portuguese.
- **English (US)** — used automatically when the browser is in English.

The choice is saved in `localStorage` (`renovatio.locale`). You can switch:

- at the top of onboarding, with the **PT / EN** buttons;
- in **Settings → Profile → Language**;
- with the shareable URLs `?lang=en` and `?lang=pt-BR`;
- the choice persists after reloading the page.

Switching updates the entire interface, accessibility text, dates (`Intl`), notification titles and the document `lang` attribute. Content the user has already written is not translated. English is the default documentation language; the complete Portuguese documentation lives in [README.pt-BR.md](README.pt-BR.md).

## What the app does

- **Public landing page:** introduces the project, method and safety before onboarding. Returning users can open the app from it.
- **Micro-tasks with a time:** create one to three micro-tasks, choose the days of the week and receive a reminder at the set time.
- **Presence mode:** two minutes of visualization before starting (wanting) and one minute of attention to the senses during the task (liking).
- **Required reflection:** to complete a micro-task, you must write what was minimally good. This field is the “learning” training and works as anti-damping.
- **Daily goal of three good gestures:** kindness, connection and accomplishment. Each gesture must be reported; the goal resets at midnight.
- **History and evidence:** reflections, good gestures, a heatmap of recent weeks and encrypted backup export/import.
- **Installable offline PWA:** manifest, service worker, asset cache and install shortcuts.
- **Privacy:** no account, no cloud and no tracking. Everything stays in your browser’s `localStorage`.

## How the video’s method appears in the app

| Video idea | Where it lives in Renovatio |
| --- | --- |
| Rigid scheduling of 1–3 micro-activities | **Routine** tab + reminders |
| Three-step training: want, like, learn | **Presence mode** + required reflection |
| Anti-damping: replace judgment with factual description | “What was good about it?” field + anti-damping tip |
| Two reward pathways: kindness/connection and accomplishment | Daily goal of **Three good gestures** |
| The third-week trap | **Method** page and restart-without-guilt language |

## Run locally

Requirements: Node.js 22.12+ (tested with Node 24).

```bash
npm install
npm run dev
```

Open `http://localhost:5173/renovatio/`.

To build and serve the production version:

```bash
npm run build
npm run preview
```

The preview runs at `http://localhost:4173/renovatio/`.

## Deploy to GitHub Pages

The repository includes `.github/workflows/deploy.yml`. On every push to `main`, the workflow:

1. installs dependencies with `npm ci`;
2. runs `npm run build`;
3. uploads `dist/` as the Pages artifact;
4. deploys with `actions/deploy-pages`.

The published page is:

**https://claudiobzrr.github.io/renovatio/**

The project uses `base: '/renovatio/'` in Vite. The manifest and shortcuts use relative paths, so the app works in the GitHub Pages subpath. To publish elsewhere, adjust `base` and the manifest fields.

## PWA and notifications

The app is installable and works offline after the first visit. The service worker pre-caches the app, fonts and icons.

Reminders use the browser notification API and the service worker:

- Permission is requested only through a user action (onboarding or Settings).
- While Renovatio is open, the reminder engine checks times every 15 seconds and also shows an in-app alert.
- The service worker schedules upcoming reminders in IndexedDB and tries to wake at the right time. It also registers `periodicSync` when the browser supports it.
- When you complete a task, the app re-syncs reminders so it does not notify again that day.
- Notifications are generated in the language selected in the app.

**Important limitation:** without a Web Push server, no PWA can guarantee exact delivery when the app is fully closed. Some systems suspend the service worker or delay background alerts. For better reliability, install Renovatio on the home screen, keep notifications allowed and open the app from time to time — it re-syncs everything when opened. Records and history keep working offline.

## Data and privacy

- No account, no server and no analytics.
- Everything stays in `localStorage` (`renovatio.data.v1`) and in the service worker’s IndexedDB for reminders.
- The app automatically migrates data from the old `brasa.data.v1` key if it exists.
- **Settings → Data → Export encrypted backup** creates a `.renovatio` file protected by a password. The payload is encrypted locally with **AES-256-GCM** and a key derived with **PBKDF2-SHA-256 (310,000 iterations)**. The password is never stored or sent to a server.
- **Settings → Data → Import encrypted backup** restores a `.renovatio` file and replaces the current data after password verification. There is no recovery if the password is lost.
- **Erase all data** removes everything from the device after confirmation.
- The browser may clear local storage; export an encrypted backup if you want to keep your history.

## SEO, GEO and LLMO

The public build includes:

- canonical, Open Graph, Twitter Card, hreflang (`en`, `pt-BR`, `x-default`) and robots meta tags;
- JSON-LD structured data for `WebApplication`, `WebSite`, `FAQPage` and `HowTo`;
- `robots.txt` and `sitemap.xml`;
- `llms.txt` and `llms-full.txt` for large language models and generative engines;
- language-specific URLs `?lang=en` and `?lang=pt-BR`;
- semantic HTML, an English no-JavaScript fallback and self-hosted fonts.

## Tests

There is a Playwright smoke test using the installed Chrome. It covers:

- the landing page and the onboarding flow;
- completing a micro-task with the required reflection;
- the third good gesture and goal celebration;
- editing a micro-task;
- system notification and in-app alert;
- service worker and offline reload;
- manifest and icons;
- language switching, persistence and English pages;
- encrypted backup export and import.

In one terminal:

```bash
npm run build
npm run preview
```

In another:

```bash
npm run test:e2e
```

If Chrome is somewhere else, set `CHROME_PATH`. For another URL, set `BASE_URL` (including `/renovatio/`).

## Structure

```
src/
  components/    UI, modals, layout, forms and language switch
  data/          categories, micro-task and good-gesture ideas
  hooks/         install, online and reminder engine
  i18n/          pt-BR/en-US translations, provider, metadata and notifications
  lib/           dates, storage, notifications and hash routes
  pages/         Landing, Today, Routine, Gestures, History, Method and onboarding
  store/         global state persisted in localStorage
  sw.ts          service worker (precache + localized reminders)
  styles.css     complete visual system
docs/
  README.pt-BR.md
  README.md
scripts/
  make-icons.mjs generates PNG icons from the brand SVG
  functional.mjs Playwright smoke test
public/
  icons/         PWA and Apple Touch icons
  fonts/         self-hosted Fraunces and Manrope
  og.png         bilingual social image
```

## Credits and limits

The video content and channel brand belong to the **Saúde da Mente** channel. Renovatio is an independent project, not affiliated with the channel. Product decisions, texts and implementation are ours.

The micro-task and good-gesture suggestions are examples, not clinical prescriptions. If the lack of pleasure persists for weeks, or comes with changes in sleep, appetite, energy, isolation or hopelessness, seek a mental health professional.

