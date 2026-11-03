# Contributing to Renovatio

## Commit convention

All commit messages must be written in **English** and follow the Conventional Commits format:

```
<type>(<optional scope>): <short summary>
```

Allowed types:

- `feat` — a new feature
- `fix` — a bug fix
- `docs` — documentation only
- `style` — formatting, layout or CSS without behavior changes
- `refactor` — code restructuring without behavior changes
- `perf` — performance improvements
- `test` — tests
- `chore` — build, tooling, dependencies or maintenance
- `ci` — continuous integration and deployment

Examples:

```
feat(i18n): add English and Brazilian Portuguese support
fix(reminders): skip notifications for completed tasks
docs: split English and Portuguese documentation
style(ui): improve type scale and contrast
ci: deploy the production build to GitHub Pages
```

## Pull requests

- Keep changes focused and describe the user-facing impact.
- Run `npm run typecheck`, `npm run build` and `npm run test:e2e`.
- Update both `docs/README.md` and `docs/README.pt-BR.md` when behavior changes.
- Keep English as the default documentation language.

## Releases

Releases are versioned with semantic versioning and published on GitHub with English release notes. The live app is deployed from `main` through GitHub Actions.
