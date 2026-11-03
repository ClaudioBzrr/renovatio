# Renovatio — documentação em português

**Pequenos gestos para voltar a sentir.**

[Versão em inglês](README.md) · [Voltar ao README](../README.md)

Renovatio é uma PWA bilíngue para organizar micro-tarefas diárias com horário, treinar a atenção para o que foi minimamente bom e registrar três bons gestos por dia. A proposta é inspirada no vídeo [“É por isso que você não sente prazer em nada (e como voltar a sentir)”](https://www.youtube.com/watch?v=aw3ksUsDVEE), do canal **Saúde da Mente**.

> Renovatio é uma ferramenta de apoio inspirada em ativação comportamental. Não diagnostica, não trata e não substitui psicoterapia, avaliação médica, medicação ou apoio de emergência. Em crise, ligue **188 (CVV, 24h)** ou **192 (SAMU)**.

## Links

- **App:** https://claudiobzrr.github.io/renovatio/
- **Landing page:** https://claudiobzrr.github.io/renovatio/#/inicio
- **Repositório:** https://github.com/ClaudioBzrr/renovatio
- **Documentação em inglês:** [README.md](README.md)

## Idiomas

O app tem dois idiomas completos:

- **Português (Brasil)** — padrão quando o navegador está em português.
- **English (US)** — usado automaticamente quando o navegador está em inglês.

A escolha fica salva em `localStorage` (`renovatio.locale`). É possível trocar:

- no topo do onboarding, nos botões **PT / EN**;
- nos **Ajustes → Perfil → Idioma**;
- pelas URLs compartilháveis `?lang=en` e `?lang=pt-BR`;
- recarregando a página, a escolha é mantida.

A troca atualiza toda a interface, os textos de acessibilidade, as datas (`Intl`), os títulos das notificações e o atributo `lang` do documento. Os dados já escritos pelo usuário não são traduzidos. A documentação padrão é em inglês; a versão em inglês fica em [README.md](README.md).

## O que o app faz

- **Landing page pública:** apresenta o projeto, o método e a segurança antes do onboarding, com animações sutis e suporte a movimento reduzido. Usuários existentes podem abrir o app por ela.
- **Micro-tarefas com horário:** crie de uma a três micro-tarefas, escolha os dias da semana e receba um lembrete na hora marcada.
- **Modo presença:** dois minutos de visualização antes de começar (querer) e um minuto de atenção aos sentidos durante a tarefa (gostar).
- **Reflexão obrigatória:** para concluir uma micro-tarefa, é preciso escrever o que foi minimamente bom. O campo é o treino de “aprender” e funciona como anti-damping.
- **Meta diária de três bons gestos:** gentileza, conexão e realização. Cada gesto precisa ser reportado; a meta reinicia à meia-noite.
- **Histórico e prova:** reflexões, bons gestos, mapa de calor das últimas semanas e exportação/importação de backup criptografado.
- **PWA instalável e offline:** manifest, service worker, cache dos arquivos e atalhos de instalação.
- **Privacidade:** sem conta, sem nuvem e sem rastreamento. Tudo fica no `localStorage` do seu navegador.

## Como o método do vídeo aparece no app

| Ideia do vídeo | Onde está no Renovatio |
| --- | --- |
| Agendamento rígido de 1–3 micro-atividades | Aba **Rotina** + lembretes |
| Treino das três etapas: querer, gostar e aprender | **Modo presença** + reflexão obrigatória |
| Anti-damping: trocar o julgamento por descrição factual | Campo “O que ficou de bom?” + dica anti-damping |
| Duas vias da recompensa: gentileza/conexão e realização | Meta diária de **Três bons gestos** |
| A armadilha da terceira semana | Página **Método** e linguagem de recomeço sem culpa |

## Rodar localmente

Requisitos: Node.js 22.12+ (testado com Node 24).

```bash
npm install
npm run dev
```

Acesse `http://localhost:5173/renovatio/`.

Para gerar e servir a versão de produção:

```bash
npm run build
npm run preview
```

A prévia fica em `http://localhost:4173/renovatio/`.

## Deploy no GitHub Pages

O repositório inclui `.github/workflows/deploy.yml`. A cada push para `main`, o workflow:

1. instala as dependências com `npm ci`;
2. roda `npm run build`;
3. publica a pasta `dist/` como artefato do Pages;
4. faz o deploy com `actions/deploy-pages`.

A página publicada fica em:

**https://claudiobzrr.github.io/renovatio/**

O projeto usa `base: '/renovatio/'` no Vite. O manifest e os atalhos usam caminhos relativos, então o app funciona na subpasta do GitHub Pages. Para publicar em outro caminho, ajuste `base` e os campos do manifest.

## PWA e notificações

O app é instalável e funciona offline depois da primeira visita. O service worker pré-cacheia a aplicação, fontes e ícones.

Os lembretes usam a API de notificações do navegador e o service worker:

- A permissão é pedida apenas por ação do usuário (onboarding ou Ajustes).
- Enquanto o Renovatio está aberto, o motor de lembretes verifica os horários a cada 15 segundos e também mostra um aviso dentro do app.
- O service worker agenda os próximos lembretes em IndexedDB e tenta acordar no horário. Ele também registra `periodicSync` quando o navegador oferece suporte.
- Ao concluir uma tarefa, o app re-sincroniza os lembretes para não avisar de novo naquele dia.
- A notificação é gerada no idioma escolhido no app.

**Limitação importante:** sem um servidor de Web Push, nenhum PWA consegue garantir entrega exata com o app totalmente fechado. Alguns sistemas suspendem o service worker ou atrasam alertas em segundo plano. Para maior confiabilidade, instale o Renovatio na tela inicial, mantenha as notificações liberadas e abra o app de vez em quando — ao abrir, ele re-sincroniza tudo. O registro e o histórico continuam funcionando offline.

## Dados e privacidade

- Sem conta, sem servidor e sem analytics.
- Tudo fica em `localStorage` (`renovatio.data.v1`) e no IndexedDB do service worker para os lembretes.
- O app migra automaticamente dados da chave antiga `brasa.data.v1`, caso existam.
- **Ajustes → Dados → Exportar backup criptografado** cria um arquivo `.renovatio` protegido por senha. O conteúdo é criptografado localmente com **AES-256-GCM** e uma chave derivada com **PBKDF2-SHA-256 (310.000 iterações)**. A senha não é armazenada nem enviada a servidores.
- **Ajustes → Dados → Importar backup criptografado** restaura um arquivo `.renovatio` e substitui os dados atuais após verificar a senha. Não há recuperação se a senha for perdida.
- **Apagar todos os dados** remove tudo do aparelho, com confirmação.
- O navegador pode limpar o armazenamento local; exporte um backup criptografado se quiser guardar o histórico.

## SEO, GEO e LLMO

O build público inclui:

- tags canônicas, Open Graph, Twitter Card, hreflang (`en`, `pt-BR`, `x-default`) e robots;
- dados estruturados JSON-LD para `WebApplication`, `WebSite`, `FAQPage` e `HowTo`;
- `robots.txt` e `sitemap.xml`;
- `llms.txt` e `llms-full.txt` para modelos de linguagem e mecanismos generativos;
- URLs por idioma `?lang=en` e `?lang=pt-BR`;
- HTML semântico, fallback sem JavaScript em inglês e fontes auto-hospedadas.

## Testes

Há um teste de fumaça com Playwright usando o Chrome instalado. Ele cobre:

- a landing page e o fluxo de onboarding;
- conclusão de micro-tarefa com reflexão obrigatória;
- terceiro bom gesto e celebração da meta;
- edição de micro-tarefa;
- notificação de sistema e aviso dentro do app;
- service worker e recarga offline;
- manifest e ícones;
- troca de idioma, persistência e páginas em inglês;
- exportação e importação de backup criptografado.

Em um terminal:

```bash
npm run build
npm run preview
```

Em outro:

```bash
npm run test:e2e
```

Se o Chrome estiver em outro caminho, defina `CHROME_PATH`. Para outra URL, defina `BASE_URL` (incluindo `/renovatio/`).

## Estrutura

```
src/
  components/    interface, modais, layout, formulários e seletor de idioma
  data/          categorias, ideias de micro-tarefas e bons gestos
  hooks/         instalação, online e motor de lembretes
  i18n/          traduções pt-BR/en-US, provider, metadados e notificações
  lib/           datas, armazenamento, notificações e rotas por hash
  pages/         Landing, Hoje, Rotina, Gestos, História, Método e onboarding
  store/         estado global persistido em localStorage
  sw.ts          service worker (precache + lembretes localizados)
  styles.css     sistema visual completo
docs/
  README.pt-BR.md
  README.md
scripts/
  make-icons.mjs gera os ícones PNG a partir do SVG da marca
  functional.mjs teste de fumaça com Playwright
public/
  icons/         ícones PWA e Apple Touch
  fonts/         Fraunces e Manrope auto-hospedadas
  og.png         imagem de compartilhamento bilíngue
```

## Créditos e limites

O conteúdo do vídeo e a marca do canal pertencem ao canal **Saúde da Mente**. Renovatio é um projeto independente, sem vínculo com o canal. As decisões de produto, os textos e a implementação são deste projeto.

As sugestões de micro-tarefas e bons gestos são exemplos, não prescrições clínicas. Se a falta de prazer persistir por semanas, vier com alterações de sono, apetite, energia, isolamento ou desesperança, procure um profissional de saúde mental.

