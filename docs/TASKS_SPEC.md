# TASKS_SPEC — GitHub Blog

**Versão:** 1.0 — 25/11/2026
**Regras de execução:** ver `AGENTS.md`. **Trabalhe apenas na próxima tarefa `[ ] Pendente`, uma por vez, em ordem.**
**Referências:** `docs/PRD_SPEC.md` (RF/RN) e `docs/TECH_SPEC.md` (stack, tipos, endpoints).

**Legenda de status**

- `[x] Concluído` — critério de pronto integralmente validado e registrado no log.
- `[ ] Pendente` — estado padrão; não inicie antes de todas as tarefas anteriores estarem concluídas.

> **Importante:** o Vite ainda não foi inicializado. `T-02` é a primeira tarefa de código e só começa após aprovação destas specs.

---

## Checklist incremental

| ID | Tarefa | Pré-req. | RF / RN | Arquivos envolvidos | Critério de pronto | Status |
| --- | --- | --- | --- | --- | --- | --- |
| **T-01** | Criar a documentação obrigatória (PRD, TECH, TASKS, AGENTS). | — | Todos | `AGENTS.md`, `docs/PRD_SPEC.md`, `docs/TECH_SPEC.md`, `docs/TASKS_SPEC.md` | 4 arquivos existem na raiz; 16 RF e 10 RN numerados; tokens/screens do Figma presentes; nenhum `src/` criado. | `[x] Concluído nesta entrega` |
| **T-02** | Inicializar projeto Vite React + TypeScript sem código de tela. | T-01 | Stack | `package.json`, `index.html`, `vite.config.ts`, `src/main.tsx`, `src/App.tsx`, `.gitignore` | `npm install` e `npm run dev` sobem; app mínima sem erros; `src/` ainda sem features. | `[ ] Pendente` |
| **T-03** | Endurecer TypeScript e lint (strict, sem `any`). | T-02 | RN-09, AGENTS §4 | `tsconfig.json`, `tsconfig.app.json`, `eslint.config.js`, `package.json` | `strict`, `noImplicitAny` e `noUncheckedIndexedAccess` ativos; `npm run typecheck` e `npm run lint` passam; busca por `\bany\b` em `src/` retorna 0. | `[ ] Pendente` |
| **T-04** | Configurar Tailwind v4, tokens do Figma e Nunito. | T-02 | RF-02, RF-16 | `vite.config.ts`, `src/styles.css`, `index.html` | `@theme` contém as 11 cores, 6 tamanhos com line-height 160% e `Nunito` 400/700; classes `bg-base-*`/`text-blue` funcionam em um `<div>` temporário de validação. | `[ ] Pendente` |
| **T-05** | Criar estrutura de pastas, alias `@/` e constantes de config. | T-02, T-03 | RN-03, RN-05 | `src/pages/`, `src/components/`, `src/services/`, `src/hooks/`, `src/types/`, `src/utils/`, `src/config/github.ts`, `vite.config.ts` | Árvore igual à TECH_SPEC; `USERNAME`, `REPO`, `PER_PAGE=6`, `SEARCH_DEBOUNCE_MS=500`, `GITHUB_API` exportados; typecheck passa. | `[ ] Pendente` |
| **T-06** | Definir tipos de domínio e type guards da API. | T-05 | RN-01 | `src/types/github.ts`, `src/types/blog.ts`, `src/types/index.ts` | `GitHubUser`, `GitHubIssue`, `SearchIssuesResponse`, `IssuesPage`, `BlogError` exatamente como na spec; `isGitHubIssue` e `isSearchIssuesResponse` com `unknown` na entrada; zero `any`. | `[ ] Pendente` |
| **T-07** | Implementar utils de data pt-BR, resumo, filtro de PR e URL de busca. | T-05, T-06 | RF-07, RF-11, RN-01, RN-04, RN-10 | `src/utils/relativeDate.ts`, `excerpt.ts`, `filterIssues.ts`, `buildSearchUrl.ts`, `src/utils/*.test.ts` | `relativeDate` gera "há 2 dias" e fallback pt-BR; `filterIssues` remove itens com `pull_request`; `buildSearchUrl` usa `encodeURIComponent` e não injeta qualificadores; testes unitários passam. | `[ ] Pendente` |
| **T-08** | Criar cliente Axios e mapeador de erros amigáveis. | T-05, T-06 | RF-14, RF-15, RN-06, RN-08, RN-09 | `src/services/api.ts`, `src/utils/mapApiError.ts`, `src/utils/mapApiError.test.ts` | `baseURL`, `timeout=10000`, `Accept` configurados; **nenhum `Authorization`**; 403/429→`rate-limit`, 404→`not-found`, rede→`network`; mensagens sem token/stack/JSON bruto; testes passam. | `[ ] Pendente` |
| **T-09** | Implementar serviço GitHub com 4 funções tipadas e cache TTL. | T-08, T-07 | RF-01, RF-05, RF-06, RF-09, RN-01..04 | `src/services/githubService.ts`, `src/services/githubService.test.ts` | `getUser`, `listIssues`, `searchIssues`, `getIssue` retornam tipos explícitos; lista envia `state=all&sort=created&direction=desc&page&per_page=6`; search usa `params.q` com `is:issue`; PRs filtrados; cache 60s para perfil/detalhe; `signal` repassado. | `[ ] Pendente` |
| **T-10** | Hook `useProfile` com loading/erro/abort. | T-09 | RF-01, RF-13 | `src/hooks/useProfile.ts` | Expõe `profile`, `loading`, `error: BlogError | null`, `reload`; aborta no unmount; ignora erro quando `signal.aborted`. | `[ ] Pendente` |
| **T-11** | Hook `useIssues` com paginação server-side e estado na URL. | T-09 | RF-04, RF-06, RF-13, RN-03 | `src/hooks/useIssues.ts`, `src/hooks/useIssues.test.ts` | `per_page=6` fixo; `page>=1`; calcula `hasNextPage`; troca de página dispara 1 request; sem `.slice()` local; typecheck e teste passam. | `[ ] Pendente` |
| **T-12** | Hooks `useDebouncedValue` e `useIssueSearch` (500ms + abort). | T-09, T-11 | RF-05, RF-13, RN-04, RN-05 | `src/hooks/useDebouncedValue.ts`, `src/hooks/useIssueSearch.ts`, testes | 499ms não dispara; 500ms dispara 1 vez; nova digitação aborta a anterior; limpar termo restaura lista sem busca e `page=1`. | `[ ] Pendente` |
| **T-13** | Hook `useIssueDetail` com validação de número. | T-09 | RF-09, RF-11, RF-13 | `src/hooks/useIssueDetail.ts` | Número inválido (<1 ou não inteiro) não chama API e vira estado 404; 404 mapeado; abort no unmount. | `[ ] Pendente` |
| **T-14** | Layout: Header/banner, Container, roteamento base. | T-04, T-05 | RF-02, RF-08 | `src/main.tsx`, `src/App.tsx`, `src/components/layout/*` | `BrowserRouter` montado; banner com `>_ GITHUB BLOG` centralizado sobre `base-background`; links "Pular para o conteúdo"; rotas `/`, `/post/:number`, `*` declaradas (podem estar vazias até T-18..T-21). | `[ ] Pendente` |
| **T-15** | `ProfileCard` + skeleton. | T-10, T-14 | RF-01, RF-03, RF-13, RF-16 | `src/components/profile/ProfileCard.tsx`, `ProfileCardSkeleton.tsx`, `index.ts` | Avatar à esquerda com `alt`; nome, bio, `@login`, empresa se houver, seguidores; link `GITHUB` com ícone externo e atributos de segurança; skeleton com mesma geometria. | `[ ] Pendente` |
| **T-16** | `SearchInput` acessível. | T-12, T-14 | RF-05, RF-16 | `src/components/search/SearchInput.tsx` | Placeholder exato "Buscar conteúdo"; label oculto; `role="search"`; foco com anel `blue`; controle é input controlado (sem efeito colateral direto). | `[ ] Pendente` |
| **T-17** | `IssueCard`, `IssueGrid`, `Pagination` e skeleton. | T-11, T-14 | RF-06, RF-07, RF-16, RN-03, RN-10 | `src/components/issues/*` | Card `base-post`, hover `base-label`, título + resumo + data relativa pt-BR à direita; grid 1 col <768px / 2 col ≥768px; botões Anterior/Próxima desabilitados nas bordas e com `aria-label`. | `[ ] Pendente` |
| **T-18** | Página Home integrando perfil, busca, contador, grid e paginação. | T-15, T-16, T-17 | RF-01, RF-03..RF-07, RN-01..05 | `src/pages/HomePage.tsx` | `?q` e `?page` sincronizados; contador com plural correto; skeleton durante loading; clique no card navega via `<Link>` para `/post/:number`; scroll ao topo após navegação. | `[ ] Pendente` |
| **T-19** | `MarkdownRenderer` e `PostCard`. | T-14, T-07 | RF-09..RF-11, RN-07, RN-10 | `src/components/post/MarkdownRenderer.tsx`, `PostCard.tsx` | `react-markdown` + `remark-gfm` renderizam títulos, listas, links e código; blocos com `bg-base-input`; links externos com `rel="noopener noreferrer"`; card `base-profile` com `< VOLTAR` e `VER NO GITHUB`. | `[ ] Pendente` |
| **T-20** | Página de detalhe `/post/:number`. | T-13, T-19 | RF-08..RF-11, RF-13 | `src/pages/PostPage.tsx` | Título, metadados `@login`/data/`N comentário(s)` e corpo completo; `VOLTAR` preserva `q`/`page` da Home; 404 amigável para número inexistente; título do documento atualizado. | `[ ] Pendente` |
| **T-21** | Página 404 e fechamento das rotas. | T-18, T-20 | RF-12, RF-15, RN-07 | `src/pages/NotFoundPage.tsx`, `src/App.tsx` | Rota `*` mostra mensagem amigável e botão "Voltar à Home"; nenhuma rota conhecida cai em tela em branco; navegação é SPA. | `[ ] Pendente` |
| **T-22** | Estados de feedback (erro, rate limit, loading) integrados. | T-08, T-18, T-20 | RF-13..RF-15, RN-06, RN-08 | `src/components/feedback/*` | `ErrorState` com "Tentar novamente" (retry manual); `RateLimitState` sem retry automático; `role="alert"`/`aria-live`; nenhuma mensagem contém token, stack ou cabeçalhos. | `[ ] Pendente` |
| **T-23** | Teste automatizado — Cenário 1 (Home + paginação). | T-18, T-22 | RF-01, 02, 04, 06, 07 · RN-02, 03 | `src/pages/HomePage.test.tsx`, `src/test/handlers.ts`, `vitest.config.ts`, `src/test/setup.ts` | Teste com MSW valida 6 cards, ausência de PR, contador e `page=2&per_page=6` na 2ª request; `npm test` verde. | `[ ] Pendente` |
| **T-24** | Teste automatizado — Cenário 2 (debounce, abort, 429). | T-12, T-22 | RF-05, 13, 14 · RN-04, 05, 06 | `src/hooks/useIssueSearch.test.tsx`, `src/test/handlers.ts` | Fake timers provam 499ms sem chamada e 500ms com 1 chamada; `signal.aborted` na request antiga; 429 exibe mensagem de limite sem token e sem loop; `npm test` verde. | `[ ] Pendente` |
| **T-25** | Teste automatizado — Cenário 3 (detalhe, Markdown, VOLTAR, 404). | T-20, T-21 | RF-08..RF-12, RF-15 · RN-07, 10 | `src/pages/PostPage.test.tsx`, `src/pages/NotFoundPage.test.tsx` | Markdown GFM assertado; `VOLTAR` mantém `?q=&page=`; 404 da API e rota `*` mostram botão para Home; `npm test` verde. | `[ ] Pendente` |
| **T-26** | Auditoria final de responsividade e acessibilidade. | T-23, T-24, T-25 | RF-16, RN-10 | `src/styles.css`, `src/components/**`, `index.html` | Grid 1/2 colunas conferido em 375px e 1280px; foco `blue` visível em todos os controles; contraste AA verificado; `prefers-reduced-motion` respeitado; zero erros no axe (se disponível). | `[ ] Pendente` |
| **T-27** | CI, build de produção, deep links e README. | T-26 | Todos | `.github/workflows/ci.yml`, `vite.config.ts`, `public/404.html`, `README.md`, `docs/TASKS_SPEC.md` | Pipeline roda typecheck/lint/test/build; `base='/GitHub-Blog/'` e `404.html` permitem refresh em `/post/:number`; `dist/` sem tokens; README documenta Como rodar, RF/RN e links das specs; status final atualizado. | `[ ] Pendente` |

---

## Log de entregas

| Data | Tarefa | Validação executada | Resultado | Commit sugerido |
| --- | --- | --- | --- | --- |
| 25/11/2026 | T-01 | Revisão de consistência entre os 4 arquivos + conferência de 16 RF, 10 RN, tokens Figma e 27 tarefas. | 4 arquivos presentes; alinhamento confirmado (reset de `page`, nomes de constantes e textos de erro); nenhum arquivo de aplicação criado; Vite não inicializado. | `docs: add PRD_SPEC, TECH_SPEC, TASKS_SPEC and AGENTS guide` |

> Ao concluir cada tarefa seguinte, acrescente uma linha aqui e troque o status na tabela acima.

---

## Desvios e decisões

| Item | Decisão | Impacto |
| --- | --- | --- |
| Tailwind v4 | Tokens via `@theme` em `src/styles.css` + `@tailwindcss/vite`, em vez de `tailwind.config.ts`. | Nenhum em RF/RN; se adotado v3, espelhar os mesmos valores. |
| Busca | Sem termo → `issues` endpoint com filtro local de PRs; com termo → Search API com `is:issue`. | Atende RN-01 e RN-03 sem chamadas duplicadas. |
| Codificação | Axios `params` é o caminho principal; `encodeURIComponent` fica em `buildSearchUrl` para URLs manuais/testes (evita duplo encoding). | Atende RN-04 com segurança. |
| Deep links | `BrowserRouter` exige `404.html` no GitHub Pages ou rewrite no host. | Preserva a URL limpa `/post/:number` exigida por RF-08/RF-09. |
| Segurança | API pública sem token; rate limit tratado na UI. | RN-06/RN-09 atendidos sem backend nesta versão. |
