# Renovatio

**Pequenos gestos para voltar a sentir / Small steps to feel again.**

Renovatio é uma PWA bilíngue (pt-BR / en-US) para organizar micro-tarefas com horário, treinar a atenção para o que foi minimamente bom e registrar três bons gestos por dia. A proposta é inspirada no vídeo [“É por isso que você não sente prazer em nada (e como voltar a sentir)”](https://www.youtube.com/watch?v=aw3ksUsDVEE), do canal **Saúde da Mente**.

Renovatio is a bilingual PWA (pt-BR / en-US) for scheduling micro-tasks, training attention to what was minimally good and recording three good gestures a day.

- **App:** https://claudiobzrr.github.io/renovatio/
- **Repositório:** https://github.com/ClaudioBzrr/renovatio
- **Português:** [docs/README.pt-BR.md](docs/README.pt-BR.md)
- **English:** [docs/README.en-US.md](docs/README.en-US.md)

> Renovatio é uma ferramenta de apoio inspirada em ativação comportamental. Não diagnostica, não trata e não substitui psicoterapia, avaliação médica, medicação ou apoio de emergência. Em crise, ligue **188 (CVV, 24h)** ou **192 (SAMU)**.
>
> Renovatio is a support tool inspired by behavioral activation. It does not diagnose, treat or replace psychotherapy, medical assessment, medication or emergency support. In a crisis, call **188 (CVV, Brazil, 24h)** or **192 (SAMU)**.

## Destaques / Highlights

- **Dois idiomas completos:** interface, notificações, datas, sugestões, método e documentação em pt-BR e en-US. O app detecta o idioma do navegador e permite trocar no onboarding ou nos Ajustes.
- **Two complete languages:** UI, notifications, dates, suggestions, method and documentation in pt-BR and en-US. The app detects the browser language and lets you switch during onboarding or in Settings.
- **Micro-tarefas com horário:** 1 a 3 por dia, dias da semana, lembretes e modo presença (2 min de visualização + 1 min de sentidos).
- **Reflexão obrigatória:** concluir uma micro-tarefa exige escrever o que foi minimamente bom, com dica anti-damping.
- **Três bons gestos por dia:** gentileza, conexão e realização, com relato obrigatório e histórico.
- **PWA:** instalável, offline, manifest, service worker, ícones e notificações locais.
- **Privacidade:** sem conta, sem nuvem e sem rastreamento; tudo fica no `localStorage` do aparelho, com exportação em JSON.

## Rodar / Run

Requisitos: Node.js 22.12+.

```bash
npm install
npm run dev
```

Abra `http://localhost:5173/renovatio/`. A versão de produção:

```bash
npm run build
npm run preview
```

O build fica em `dist/`. O projeto usa a base `/renovatio/` para o GitHub Pages.

## GitHub Pages

O deploy é feito por GitHub Actions em cada push para `main` (`.github/workflows/deploy.yml`). A página fica em:

**https://claudiobzrr.github.io/renovatio/**

O Pages precisa estar configurado com **Source: GitHub Actions** no repositório. O workflow faz `npm ci`, `npm run build`, publica `dist/` e usa `actions/deploy-pages`.

## Testes / Tests

Com `npm run build` e `npm run preview` em um terminal:

```bash
npm run test:e2e
```

O teste de fumaça cobre reflexão obrigatória, bons gestos, edição de tarefa, notificações, service worker, offline, manifest, troca de idioma e persistência da escolha.

## Segurança / Safety

A perda persistente de prazer pode ser um sintoma de depressão, burnout, luto, ansiedade, uso de substâncias, efeitos de medicamentos e outras condições. Procure avaliação profissional se isso durar semanas ou vier com alterações de sono, apetite, energia, isolamento, desesperança ou pensamentos de morte.

Persistent loss of pleasure can be a symptom of depression, burnout, grief, anxiety, substance use, medication effects and other conditions. Seek professional assessment if it lasts for weeks or comes with changes in sleep, appetite, energy, isolation, hopelessness or thoughts of death.

## Créditos / Credits

Conteúdo inspirado no vídeo do canal **Saúde da Mente**. Renovatio é um projeto independente, sem vínculo com o canal. As decisões de produto, os textos e a implementação são deste projeto.

Content inspired by the **Saúde da Mente** channel video. Renovatio is an independent project, not affiliated with the channel.
