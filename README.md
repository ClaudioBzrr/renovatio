# Renovatio

**Small steps to feel again.**

Renovatio is a free bilingual PWA for scheduling micro-tasks, reflecting on what was minimally good and recording three good gestures a day. It is inspired by the video [“É por isso que você não sente prazer em nada (e como voltar a sentir)”](https://www.youtube.com/watch?v=aw3ksUsDVEE), from the **Saúde da Mente** channel.

- **App:** https://claudiobzrr.github.io/renovatio/
- **Repository:** https://github.com/ClaudioBzrr/renovatio
- **English documentation:** [docs/README.md](docs/README.md)
- **Portuguese documentation:** [docs/README.pt-BR.md](docs/README.pt-BR.md)

> Renovatio is a support tool inspired by behavioral activation. It does not diagnose, treat or replace psychotherapy, medical assessment, medication or emergency support. In a crisis, call **188 (CVV, Brazil, 24h)** or **192 (SAMU)**.

## Highlights

- **Two complete languages:** English and Brazilian Portuguese across the interface, dates, notifications, suggestions, method page and documentation. The app detects the browser language and allows switching during onboarding or in Settings.
- **Micro-tasks with a time:** one to three per day, weekdays, local reminders and presence mode (2 minutes of visualization + 1 minute of senses).
- **Required reflection:** completing a micro-task requires writing what was minimally good, with an anti-damping prompt.
- **Three good gestures a day:** kindness, connection and accomplishment, with required reporting and history.
- **PWA:** installable, offline, manifest, service worker, icons and local notifications.
- **Encrypted backups:** AES-256-GCM with PBKDF2-SHA-256 and a user-chosen password. No plaintext JSON export.
- **Privacy:** no account, no cloud and no tracking; everything stays in the device’s `localStorage`.

## Quick start

Requirements: Node.js 22.12+.

```bash
npm install
npm run dev
```

Open `http://localhost:5173/renovatio/`.

Production build:

```bash
npm run build
npm run preview
```

The build is written to `dist/`. The project uses the `/renovatio/` base path for GitHub Pages.

## Documentation

- [English documentation](docs/README.md)
- [Portuguese documentation](docs/README.pt-BR.md)
- [Contributing and commit convention](CONTRIBUTING.md)

## GitHub Pages

The site is deployed by GitHub Actions on every push to `main` using `.github/workflows/deploy.yml`:

**https://claudiobzrr.github.io/renovatio/**

The Pages source is configured as **GitHub Actions**. The workflow runs `npm ci`, `npm run build`, uploads `dist/` and deploys it.

## Tests

With the production preview running:

```bash
npm run test:e2e
```

The Playwright smoke test covers required reflection, good gestures, task editing, notifications, service worker, offline reload, manifest, language switching and encrypted backup export/import.

## Safety

Persistent loss of pleasure can be a symptom of depression, burnout, grief, anxiety, substance use, medication effects and other conditions. Seek professional assessment if it lasts for weeks or comes with changes in sleep, appetite, energy, isolation, hopelessness or thoughts of death.

## Credits

The video content and channel brand belong to the **Saúde da Mente** channel. Renovatio is an independent project, not affiliated with the channel. Product decisions, texts and implementation are ours.
