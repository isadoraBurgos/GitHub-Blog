# TECH_SPEC — GitHub Blog

**Versão:** 1.0 — 25/11/2026
**Complementa:** `docs/PRD_SPEC.md`
**Estado atual:** somente documentação criada. O Vite **ainda não foi inicializado** — primeira tarefa de código é `T-02` em `docs/TASKS_SPEC.md`.

---

## 1. Stack e decisões técnicas

| Camada | Escolha | Justificativa |
| --- | --- | --- |
| Build | **Vite** (React + TypeScript template) | Dev server rápido, build estático simples. |
| UI | **React** (function components + hooks) | Adequado ao roteamento SPA e ao ecossistema de testes. |
| Língua | **TypeScript 5.x estrito**, zero `any` | Contrato explícito com a API do GitHub; `unknown` + guards na fronteira. |
| Estilo | **Tailwind CSS v4** via `@tailwindcss/vite`, tokens em `@theme` (`src/styles.css`) | Tokens do Figma viram utilitários (`bg-base-post`, `text-base-title`) sem arquivo de config separado. *Se o time adotar v3, espelhar os mesmos tokens em `tailwind.config.ts` — o resultado visual deve ser idêntico.* |
| Fonte | **Google Fonts Nunito** 400 + 700 via `<link>` com `preconnect` no `index.html` | Evita `@import` bloqueante no CSS. |
| HTTP | **Axios** + `AbortController` | `params` codifica a query com segurança; `signal` cancela requests obsoletas. |
| Roteamento | **React Router DOM** (`BrowserRouter`, `Routes`, `Link`, `useSearchParams`) | Rotas `/`, `/post/:number`, `*`; preserva `q`/`page` na volta. |
| Markdown | **react-markdown** + **remark-gfm** | Tabelas, listas de tarefas e autolinks do GitHub. |
| Ícones | **lucide-react** | `Terminal`, `ExternalLink`, `Github`, `ArrowLeft`, `Search`, `ChevronLeft/Right`. |
| Testes | **Vitest** + **Testing Library** + `jsdom` + `@testing-library/user-event` | Testes centrados no comportamento do usuário. **MSW** recomendado para simular status HTTP e inspecionar query params. |
| Deploy | Build estático; GitHub Pages com `404.html` espelhando `index.html` (ou host com rewrite SPA) | Mantém URLs limpas `/post/:number` em refresh direto. |

**Decisões registradas**

1. **Search API vs. filtro local:** sem termo, usamos `GET /repos/.../issues` e removemos itens com `pull_request`; com termo, usamos `GET /search/issues?q=repo:... is:issue <termo>` para que paginação e contador sejam feitos no servidor (RN-01/RN-03/RN-04).
2. **Nenhum token no cliente:** API pública (60 req/h/IP). Rate limit é tratado como estado de UI, não como erro técnico (RN-06/RN-09).
3. **Sem gerenciador de estado global:** cada hook expõe `data`, `loading`, `error` e funções de refetch; o estado de busca vive na URL (`?q=&page=`), o que torna o fluxo voltar compartilhável.

---

## 2. Arquitetura de pastas

```
GitHub-Blog/
├── AGENTS.md
├── docs/
│   ├── PRD_SPEC.md
│   ├── TECH_SPEC.md
│   └── TASKS_SPEC.md
├── index.html                 # Nunito (preconnect + link), root, lang="pt-BR"
├── vite.config.ts             # plugin react, plugin tailwindcss, base do deploy, alias @/
├── tsconfig.json              # strict, noImplicitAny, noUncheckedIndexedAccess
├── vitest.config.ts           # environment jsdom, setupFiles
├── public/
│   └── 404.html               # espelho de index.html para SPA no GitHub Pages
└── src/
    ├── main.tsx               # BrowserRouter + montagem
    ├── App.tsx                # Routes: /, /post/:number, *
    ├── styles.css             # @import "tailwindcss" + @theme tokens
    ├── pages/
    │   ├── HomePage.tsx
    │   ├── PostPage.tsx
    │   └── NotFoundPage.tsx
    ├── components/
    │   ├── layout/            # Header, Banner, Container, Footer
    │   ├── profile/           # ProfileCard, ProfileCardSkeleton
    │   ├── issues/            # IssueCard, IssueGrid, IssuesSkeleton, Pagination
    │   ├── search/            # SearchInput
    │   ├── post/              # PostCard, MarkdownRenderer
    │   └── feedback/          # ErrorState, RateLimitState, LoadingState
    ├── services/
    │   ├── api.ts             # axios instance, baseURL, timeout, interceptors
    │   └── githubService.ts   # getUser, listIssues, searchIssues, getIssue
    ├── hooks/
    │   ├── useProfile.ts
    │   ├── useIssues.ts
    │   ├── useIssueSearch.ts
    │   ├── useIssueDetail.ts
    │   └── useDebouncedValue.ts
    ├── types/
    │   ├── github.ts          # GitHubUser, GitHubIssue, SearchIssuesResponse
    │   └── blog.ts            # IssuesPage, BlogError, BlogErrorKind
    ├── utils/
    │   ├── relativeDate.ts    # pt-BR, Intl.RelativeTimeFormat
    │   ├── excerpt.ts         # resumo do corpo
    │   ├── filterIssues.ts    # remove PRs (campo pull_request)
    │   ├── buildSearchUrl.ts  # encodeURIComponent para URLs manuais/testes
    │   └── mapApiError.ts     # status -> BlogError amigável
    └── config/
        └── github.ts          # GITHUB_API, USERNAME, REPO, PER_PAGE, SEARCH_DEBOUNCE_MS
```

**Regra de dependência:** `pages → components/hooks → services → utils/config → types`. Componentes nunca chamam Axios diretamente; services nunca importam React.

---

## 3. Design tokens (Figma → Tailwind)

Fonte emissora: `src/styles.css`. Use **apenas** estes valores.

```css
@import "tailwindcss";

@theme {
  /* Paleta */
  --color-blue:          #3294F8;
  --color-base-title:    #E7EDF4;
  --color-base-subtitle: #C4D4E3;
  --color-base-text:     #AFC2D4;
  --color-base-span:     #7B96B2;
  --color-base-label:    #3A536B;
  --color-base-border:   #1C2F41;
  --color-base-post:     #112131;
  --color-base-profile:  #0B1B2B;
  --color-base-background: #071422;
  --color-base-input:    #040F1A;

  /* Tipografia */
  --font-sans: "Nunito", ui-sans-serif, system-ui, sans-serif;

  --text-xs: 12px;  --text-xs--line-height: 160%;
  --text-sm: 14px;  --text-sm--line-height: 160%;
  --text-base: 16px; --text-base--line-height: 160%;
  --text-lg: 18px;  --text-lg--line-height: 160%;
  --text-xl: 20px;  --text-xl--line-height: 160%;
  --text-2xl: 24px; --text-2xl--line-height: 160%;
}
```

| Uso | Token / classe | Observância Figma |
| --- | --- | --- |
| Fundo da página e banner | `bg-base-background` | Banner escuro com arte sutil |
| Card flutuante (perfil e detalhe) | `bg-base-profile border-base-border` | Sobreposição ao banner |
| Card de publicação | `bg-base-post` | Hover: `border-base-label` |
| Título / subtítulo / corpo / meta / label | `text-base-title`, `text-base-subtitle`, `text-base-text`, `text-base-span`, `text-base-label` | Hierarquia do protótipo |
| Input de busca | `bg-base-input border-base-border focus:border-blue` | Placeholder "Buscar conteúdo" |
| Destaque, foco, links | `text-blue`, `ring-blue` | Cor de acento |

**Componentes do Figma mapeados**

- Header: arte escura + `>_ GITHUB BLOG` centralizado → `components/layout/Header.tsx` + `Banner.tsx`.
- Home: `ProfileCard` (avatar à esquerda, nome, `GITHUB` + `ExternalLink`, bio, `@username`, empresa, seguidores), cabeçalho "Publicações" com contador à direita, `SearchInput`, `IssueGrid` 2 colunas desktop / 1 mobile, `Pagination`.
- Detalhe: `PostCard` com `< VOLTAR` e `VER NO GITHUB`, título, metadados, `MarkdownRenderer`.
- 404: `NotFoundPage` com botão "Voltar à Home".

---

## 4. Interfaces tipadas

`src/types/github.ts` — espelha exatamente os campos consumidos da API:

```ts
export interface GitHubUser {
  login: string;
  name: string | null;
  avatar_url: string;
  html_url: string;
  bio: string | null;
  company: string | null;
  followers: number;
  public_repos: number;
  created_at: string;
}

export interface GitHubUserSummary {
  login: string;
  avatar_url: string;
  html_url: string;
}

export interface GitHubLabel {
  id: number;
  name: string;
  color: string;
}

export interface GitHubPullRequestRef {
  url: string;
  html_url: string;
  diff_url: string;
  patch_url: string;
  merged_at?: string | null;
}

export interface GitHubIssue {
  id: number;
  number: number;
  title: string;
  body: string | null;
  state: 'open' | 'closed';
  html_url: string;
  created_at: string;
  updated_at: string;
  comments: number;
  user: GitHubUserSummary;
  labels: GitHubLabel[];
  /** Presente quando o item é um Pull Request — RN-01. */
  pull_request?: GitHubPullRequestRef;
}

export interface SearchIssuesResponse {
  total_count: number;
  incomplete_results: boolean;
  items: GitHubIssue[];
}
```

`src/types/blog.ts` — tipos da aplicação (não da API):

```ts
export interface IssuesPage {
  items: GitHubIssue[];
  total: number;
  page: number;
  hasNextPage: boolean;
}

export type BlogErrorKind = 'rate-limit' | 'not-found' | 'network' | 'unknown';

export interface BlogError {
  kind: BlogErrorKind;
  message: string;
}
```

**Regras de tipagem**

- Resposta do Axios é tipada como `unknown`; um `isGitHubIssue(value: unknown): value is GitHubIssue` valida os campos obrigatórios antes de usar. Nunca `as GitHubIssue` direto em dado externo.
- Props de componentes são `interface` explícitas; retorno de funções assíncronas é anotado (ex.: `Promise<IssuesPage>`).
- `any` é proibido, inclusive em testes e mocks; use `Partial<GitHubIssue>` para fixtures.

---

## 5. Estratégia de endpoints

**Constantes** (`src/config/github.ts`):

```ts
export const GITHUB_API = 'https://api.github.com';
export const USERNAME = 'isadoraBurgos';
export const REPO = 'GitHub-Blog';
export const PER_PAGE = 6;
export const SEARCH_DEBOUNCE_MS = 500;
```

| Cenário | Endpoint | Parâmetros | Observação |
| --- | --- | --- | --- |
| Perfil (RF-01) | `GET /users/{username}` | — | `USERNAME = isadoraBurgos`. |
| Lista sem termo (RF-06, RN-02) | `GET /repos/{username}/{repo}/issues` | `state=all`, `sort=created`, `direction=desc`, `page`, `per_page=6` | Filtrar itens com `pull_request` (RN-01). Total via header `Link` (última página) quando disponível; fallback `items.length`. |
| Busca com termo (RF-05, RN-04) | `GET /search/issues` | `q=repo:isadoraBurgos/GitHub-Blog is:issue <termo>`, `page`, `per_page=6` | `is:issue` exclui PRs no próprio servidor. `total_count` alimenta o contador. |
| Detalhe (RF-09) | `GET /repos/{username}/{repo}/issues/{number}` | — | Número validado como inteiro positivo antes da chamada. |

**Codificação da busca (RN-04)** — duas formas, com papéis distintos:

```ts
// Caminho principal: Axios params codifica automaticamente e evita duplo encoding.
const q = term.trim()
  ? `repo:${USERNAME}/${REPO} is:issue ${term.trim()}`
  : `repo:${USERNAME}/${REPO} is:issue`;

await api.get<SearchIssuesResponse>('/search/issues', {
  params: { q, page, per_page: PER_PAGE },
  signal,
});
```

```ts
// URLs montadas manualmente (fallback/testes) DEVEM usar encodeURIComponent.
export function buildSearchUrl(term: string, page: number): string {
  const q = `repo:${USERNAME}/${REPO} is:issue ${term}`.trim();
  return `${GITHUB_API}/search/issues?q=${encodeURIComponent(q)}&page=${page}&per_page=${PER_PAGE}`;
}
```

> Nunca concatenar o termo do usuário cru na URL: caracteres como `&`, `#`, `/` e aspas podem injetar qualificadores de busca.

**Cancelamento e debounce (RN-05)**: `useDebouncedValue(term, 500)` alimenta `useIssueSearch`; cada efeito cria `new AbortController()` e limpa com `controller.abort()`. Erros com `signal.aborted === true` são ignorados. **Alterar o termo (inclusive limpar) força `page = 1`; alterar apenas a página preserva o termo** — alinhado a RF-05, RN-03 e T-12.

**Cache em memória**: `githubService` mantém um `Map<string, { data: unknown; at: number }>` com TTL curto (60s) para perfil e detalhe já visitados, reduzindo o consumo do limite de 60 req/h. Busca e páginas de listagem não são cacheadas para refletir edições.

---

## 6. Camada HTTP e mapeamento de erros

`src/services/api.ts`: instância Axios com `baseURL: GITHUB_API`, `timeout: 10000`, header `Accept: application/vnd.github+json`. **Nenhum header `Authorization`.**

`src/utils/mapApiError.ts` converte falhas em `BlogError` (RN-06/RN-07/RN-08):

| Entrada | `kind` | Mensagem exibida |
| --- | --- | --- |
| `403` ou `429` | `rate-limit` | "Limite da API do GitHub atingido. Aguarde alguns minutos e tente novamente." |
| `404` | `not-found` | "Publicação não encontrada." (detalhe) / "Conteúdo não encontrado." (perfil/lista) |
| `ECONNABORTED`, `ERR_NETWORK`, timeout | `network` | "Não foi possível carregar o conteúdo. Verifique sua conexão." |
| Outros (`5xx`, parsing) | `unknown` | "Algo deu errado. Tente novamente em instantes." |

Restrições: não logar `error.response.config`, não serializar a resposta, não incluir URL completa com query do token. O retry é sempre **manual** (`ErrorState` com botão "Tentar novamente").

---

## 7. Hooks e estado

| Hook | Entrada | Saída | RF/RN |
| --- | --- | --- | --- |
| `useProfile` | — | `profile`, `loading`, `error`, `reload` | RF-01, RF-03 |
| `useIssues` | `page` (sem termo) | `pageData: IssuesPage`, `loading`, `error`, `reload` | RF-04, RF-06, RN-02, RN-03 |
| `useDebouncedValue` | `value`, `delay = 500` | valor atrasado | RN-05 |
| `useIssueSearch` | `term`, `page` | `pageData`, `loading`, `error`, `reload` | RF-05, RN-04, RN-05 |
| `useIssueDetail` | `number` | `issue`, `loading`, `error`, `reload` | RF-09, RF-11 |

A `HomePage` combina `useProfile` com `useIssues` **ou** `useIssueSearch` conforme `q` da URL, e sincroniza `page` via `useSearchParams`. Ao clicar "VOLTAR", o `Link` preserva `?q=&page=`.

---

## 8. Acessibilidade (RF-16)

- `lang="pt-BR"` no `index.html`; `<title>` por rota ("GitHub Blog" / "Título — GitHub Blog" / "Página não encontrada").
- Estrutura semântica: `<header>` (banner), `<main id="conteudo">`, `<section aria-labelledby>`, `<footer>` opcional; link "Pular para o conteúdo" oculto até foco.
- `SearchInput`: `<label htmlFor="busca">` visualmente oculto + `placeholder` do Figma + `role="search"` no formulário; `aria-busy` na lista durante carregamento.
- Contador e mudanças de estado em `aria-live="polite"`; erros em `role="alert"`.
- Cards são `<Link>` (não `<div onClick>`), garantindo Tab/Enter; foco `focus-visible:ring-2 focus-visible:ring-blue focus-visible:ring-offset-base-background`.
- Avatar com `alt="Foto de perfil de isadoraBurgos"`; ícone de terminal com `aria-hidden` quando o texto `GITHUB BLOG` já nomeia o logo.
- Alvos mínimos de 44×44px no mobile; `prefers-reduced-motion` desativa transições.
- Contraste: `base-title` sobre `base-background` e `base-text` sobre `base-post` ≥ 4.5:1; `base-span` é usado apenas em metadados com tamanho ≥ 18px ou conforme validação AA.

---

## 9. Plano de testes automatizados (3 cenários)

Ferramentas: Vitest + Testing Library + user-event + MSW; `setupFiles` com `@testing-library/jest-dom` e `cleanup`. Nenhum teste deve fazer requisição real.

### Cenário 1 — Home carrega perfil, 6 posts e pagina no servidor
**RF:** 01, 02, 04, 06, 07 · **RN:** 02, 03

- **Dado** handlers MSW para `/users/isadoraBurgos` e `/repos/.../issues?state=all&sort=created&direction=desc&page=1&per_page=6` com 12 issues + 1 PR.
- **Quando** renderizo `<App />` em `MemoryRouter initialEntries={['/']}`.
- **Então** vejo `GITHUB BLOG`, nome/bio/@login, "Publicações" com contador e exatamente 6 cards, sem o PR.
- **Quando** clico em "Próxima".
- **Então** a última requisição tem `page=2` e `per_page=6`, e os cards exibem as issues seguintes (sem duplicatas).

### Cenário 2 — Busca com debounce, cancelamento e rate limit
**RF:** 05, 13, 14 · **RN:** 04, 05, 06

- **Dado** `vi.useFakeTimers()` e um handler para `/search/issues`.
- **Quando** digito `runtime & erros` e avanço 499ms → **então** nenhuma chamada; ao avançar 1ms → exatamente 1 chamada com `q` contendo `repo:isadoraBurgos/GitHub-Blog is:issue runtime & erros` (codificado) e `per_page=6`.
- **Quando** digito novamente antes de 500ms → **então** o `signal` da requisição anterior está `aborted` e a resposta antiga não altera o DOM.
- **Dado** handler respondendo 429 → **então** aparece a mensagem de limite, sem token, sem stack e sem retry automático.

### Cenário 3 — Detalhe, Markdown, VOLTAR e 404
**RF:** 08, 09, 10, 11, 12, 15 · **RN:** 07, 10

- **Dado** `/post/42` com corpo Markdown contendo título, lista, link e bloco de código.
- **Então** renderizo todos os elementos (GFM), metadados `@autor`, "há 2 dias" e "3 comentários", além de `VER NO GITHUB` com `target="_blank" rel="noopener noreferrer"`.
- **Quando** clico em `< VOLTAR` → **então** a URL volta para `/?q=...&page=2` sem reload (assert com `MemoryRouter`).
- **Dado** `/post/99999` (404 da API) ou rota `/rota-inexistente` → **então** mensagem amigável e botão "Voltar à Home" leva a `/`.

---

## 10. Qualidade, build e deploy

Scripts sugeridos no `package.json`:

```json
{
  "dev": "vite",
  "build": "tsc -b && vite build",
  "typecheck": "tsc --noEmit",
  "lint": "eslint .",
  "test": "vitest run",
  "test:watch": "vitest",
  "preview": "vite preview"
}
```

- CI: instalar deps → `npm run typecheck` → `npm run lint` → `npm test` → `npm run build`.
- GitHub Pages: `vite.config.ts` com `base: '/GitHub-Blog/'`, `BrowserRouter basename="/GitHub-Blog"`, `public/404.html` copiando o `index.html` para resolver deep links. Alternativamente, usar host com rewrite `/* → /index.html`.
- Antes do deploy: revisar bundle (`dist/`) para garantir que nenhuma string de token esteja presente.
