# AI_USAGE — Evidências de uso do OpenCode

**Projeto:** GitHub Blog · **Repositório:** `isadoraBurgos/GitHub-Blog` · **Data:** 25/11/2026

Este documento registra três momentos em que o OpenCode foi usado na condução do projeto. Os hashes e comandos abaixo foram conferidos em `git log --oneline --reverse` e no log de entregas de `docs/TASKS_SPEC.md`.

---

## Evidência 1 — Planejamento inicial e criação das especificações

**Contexto/Prompt:**  
O projeto foi iniciado com a solicitação de conduzir o GitHub Blog em Spec-Driven Development: "crie a documentação obrigatória antes de qualquer código, com PRD, TECH, TASKS e AGENTS; defina os RF/RN, a stack, os tokens do Figma e um checklist de tarefas pequenas; apresente o plano e as decisões antes de executar e só implemente após eu responder 'pode'". Também foi fixado que cada entrega deveria ser validada, documentada, commitada e enviada para `main`.

**Objetivo:**  
Estabelecer uma base de especificação rastreável antes de gerar qualquer arquivo de aplicação, evitando implementação adiantada e garantindo que cada RF/RN tivesse uma tarefa correspondente no checklist.

**Resultado gerado:**  
Commit `f9e88da` — `docs: add PRD_SPEC, TECH_SPEC, TASKS_SPEC and AGENTS guide`. Foram criados:

- `docs/PRD_SPEC.md`: produto, fluxos, 16 requisitos funcionais (RF-01..RF-16) e 10 regras de negócio (RN-01..RN-10).
- `docs/TECH_SPEC.md`: stack, tokens de cores/tipografia do protótipo Figma, tipos de domínio, endpoints, acessibilidade e os 3 cenários de teste.
- `docs/TASKS_SPEC.md`: 27 tarefas encadeadas (T-01..T-27), critério de pronto, log de validação e seção "Desvios e decisões".
- `AGENTS.md`: regras de leitura obrigatória, execução uma tarefa por vez, TypeScript estrito sem `any`, proibição de token no frontend e commits semânticos.

Na sequência aprovada, o OpenCode gerou o scaffold Vite (`f174b09`), o endurecimento de TypeScript/ESLint (`5689aba`), os tokens Tailwind via `@theme` (`9d79e78`) e a configuração centralizada com alias `@/` (`43a6fed`).

**Ajustes/Verificação feita pela aluna:**  
Revisei a consistência entre os quatro arquivos antes de aprovar a primeira tarefa de código: conferi os 16 RF, os 10 RN, os tokens do Figma e o total de 27 tarefas. Ajustei a redação para alinhar nomes de constantes, o reset de `page` e os textos de erro entre PRD/TECH/TASKS. Confirmei que nenhum `src/` de aplicação existia nessa entrega e que o Vite só seria inicializado na T-02. Validei `npm install`, `npm run typecheck`, `npm run build`, `npm ls --depth=0` e a varredura por `ghp_`, `github_pat_`, `VITE_GITHUB_TOKEN`, `Authorization`, `isadoraBurgos` e `GitHub-Blog` nos arquivos de código.

---

## Evidência 2 — Camada HTTP/Axios, hooks customizados e integração com a API do GitHub

**Contexto/Prompt:**  
Após a aprovação das specs, o trabalho seguiu tarefa a tarefa com "pode"/"próxima": "implemente agora, em ordem, os tipos e guards da API, os utilitários, o mapeador de erros, o cliente Axios, o serviço do GitHub e os hooks de perfil, listagem, busca com debounce e detalhe; mantenha TypeScript estrito, sem `any`, e use `unknown` + guards nos dados externos".

**Objetivo:**  
Construir uma camada de acesso a dados tipada, econômica em requisições e cancelável, que alimentasse a interface sem expor token, stack ou resposta bruta da API.

**Resultado gerado:**  

- `a756115` (T-06): interfaces `GitHubUser`, `GitHubIssue`, `SearchIssuesResponse` e guards `isGitHubIssue`/`isSearchIssuesResponse` a partir de `unknown`.
- `9175a1f` (T-07): utilitários `relativeDate`, `excerpt`, `filterIssues` e `buildSearchUrl`, com datas relativas em pt-BR.
- `530d09b` (T-08): `src/services/api.ts` com Axios (`baseURL`, `timeout=10000`, `Accept`) e `mapApiError` para cancelamento, rate limit, 404, rede e erro desconhecido.
- `c85475b` (T-09): `getIssue`, `getUser`, `listIssues` e `searchIssues`, com filtro de Pull Requests, cache de 60 s para perfil/detalhe e total lido do header `Link`.
- `03ae569`, `106b33e`, `881c14c`, `0a89e9d` (T-10..T-13): hooks `useProfile`, `useIssues`, `useDebouncedValue`, `useIssueSearch` e `useIssueDetail`. `useDebouncedValue` apenas atrasa o valor; os hooks de dados usam `AbortController`, flag `active`, `mapApiError` e `reload` manual.
- Constantes `USERNAME`, `REPO`, `GITHUB_API`, `PER_PAGE` e `SEARCH_DEBOUNCE_MS` ficaram apenas em `src/config/github.ts` (T-05).

A busca passou a disparar após 500 ms, a paginação permaneceu server-side com `per_page=6`, e nenhum token ou header de autenticação foi introduzido.

**Ajustes/Verificação feita pela aluna:**  
Substituí `expect.any(AbortSignal)` por `toBeInstanceOf(AbortSignal)` para manter a varredura literal por `\bany\b` em zero. Ajustei o `loading` derivado de `useIssues`/`useIssueSearch` para evitar `setState` síncrono dentro de efeito. Na T-24, como o `request.signal` do MSW não refletia o aborto feito pelo adaptador XHR do Axios, envolvi `searchIssues` com `vi.mock(importOriginal)` para capturar de fato o `AbortSignal` passado pelo hook. Renomeei `useIssueSearch.test.ts` para `useIssueSearch.unit.test.ts` para evitar colisão de stem com o `.test.tsx` do cenário MSW. Validei `npm test`, `npm run typecheck`, `npm run lint` e `npm run build` a cada entrega, com `ANY_IN_SRC=0` e `HARDCODE_OUTSIDE_CONFIG=0`.

---

## Evidência 3 — Markdown, resiliência (403/429, 404, retry) e testes automatizados

**Contexto/Prompt:**  
Com a camada de dados pronta, a solicitação foi: "agora implemente o detalhe com Markdown GFM, estados de erro amigáveis e os testes automatizados dos três cenários da TECH_SPEC; depois audite responsividade/acessibilidade e feche CI, deep links e README".

**Objetivo:**  
Entregar leitura completa do corpo da issue com GFM, degradar bem falhas de API e provar os fluxos principais por testes de integração sem requisição real nem vazamento de segredo.

**Resultado gerado:**  

- `54a7bb4` (T-19): `MarkdownRenderer` com `react-markdown` + `remark-gfm` e mapa `Components` tipado; `PostCard` com `VOLTAR`, `VER NO GITHUB`, metadados e links externos seguros.
- `8f30e5a` e `18a2820` (T-20/T-21): `PostPage` com 404 contextual e título por rota; `NotFoundPage` para a rota `*`.
- `68a4fdf` (T-22): `ErrorFeedback` despachando `RateLimitState` para `403/429` e `ErrorState` para os demais erros, com retry manual.
- `0456fac`, `1831a64`, `5ab14a4` (T-23..T-25): cenários MSW de listagem/paginação, debounce/abort/429 e detalhe/Markdown/VOLTAR/404. `requestLog`, `searchLog` e `detailLog` registram as requests; `npm test` terminou com **13 arquivos e 47 testes** verdes.
- `1635545` (T-26): auditoria de responsividade/acessibilidade e regra `@media (prefers-reduced-motion: reduce)`.
- `f4b9d70` (T-27): CI, `base='/GitHub-Blog/'`, `404.html` para deep links e README.

As mensagens de erro ficaram restritas a texto amigável: limite sem retry automático, "Publicação não encontrada." no detalhe, "Página não encontrada." na rota curinga e "Não foi possível carregar o conteúdo." com "Tentar novamente" para falha de rede.

**Ajustes/Verificação feita pela aluna:**  
Usei `Intl.RelativeTimeFormat('pt-BR', { numeric: 'always' })` porque a opção `auto` devolve "anteontem" para -2 dias, enquanto a spec exige literalmente "há 2 dias". Nos handlers MSW, adicionei `Access-Control-Allow-Origin: *` e `Access-Control-Expose-Headers: Link`: sem eles o XHR do jsdom caía em `onerror` e o contador ficava errado. Adaptei a API do MSW 3 (`http`/`HttpResponse`, `setupServer` de `msw/node` e `onUnhandledFrame: 'error'`) e evitei importar o serviço em `src/test/setup.ts`, porque isso quebrava os testes que usavam `vi.mock('./api.ts')`. Na fixture do detalhe, calculei `created_at` como `agora - 2 dias` para não depender da data da máquina. Na auditoria final, medi o grid em iframes de 375 px (1 coluna) e 1280 px (2 colunas), percorri o foco por Tab, confirmei contraste AA e usei o Lighthouse do browser (acessibilidade 1.00, sem falhas) em vez de instalar axe, que não faz parte da stack. Antes do commit final, conferi `dist/`: nenhum `ghp_`, `github_pat_` ou `VITE_GITHUB_TOKEN`; as três ocorrências de `Authorization` são apenas nomes de header na biblioteca Axios. O aviso de chunk >500 kB do bundle foi tratado como informativo, não como erro de build.

---

## Comandos de verificação usados ao longo das entregas

```bash
npm test
npm run typecheck
npm run lint
npm run build
```

Varreduras complementares: busca case-sensitive por `\bany\b` em `src/`, por constantes hardcodadas fora de `src/config/github.ts` e por padrões de token em `src/` e `dist/`.
