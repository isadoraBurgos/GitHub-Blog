# GitHub Blog

Blog estático cujas publicações são as issues do repositório [`isadoraBurgos/GitHub-Blog`](https://github.com/isadoraBurgos/GitHub-Blog), lidas diretamente da GitHub REST API. Os dados continuam no GitHub; esta aplicação é apenas a vitrine editorial.

## Stack

- React 19 + TypeScript estrito (`strict`, `noImplicitAny`, `noUncheckedIndexedAccess`, sem `any`)
- Vite 8 + Tailwind CSS v4 (via `@tailwindcss/vite` e `@theme`)
- React Router 7 (SPA com `/`, `/post/:number` e rota `*`)
- Axios, guards de `unknown` para validar as respostas da API
- `react-markdown` + `remark-gfm` para o corpo das issues
- Vitest + Testing Library + MSW para os cenários automatizados

## Como rodar

Requisitos: Node 24 e npm.

```bash
npm ci
npm run dev      # http://localhost:5173/GitHub-Blog/
```

Outros comandos:

```bash
npm test         # Vitest, 3 cenários com MSW
npm run typecheck
npm run lint
npm run build    # gera dist/
npm run preview  # http://localhost:4173/GitHub-Blog/
```

O `base` do Vite é `/GitHub-Blog/`, então o caminho local inclui o nome do repositório.

## Dados e limites da API

- A aplicação usa a API pública **sem autenticação**: limite de 60 requisições/hora por IP.
- Não existe token no frontend: sem `.env` versionado, sem `VITE_GITHUB_TOKEN`, sem header de autenticação e sem segredo no bundle.
- Perfil e detalhe ficam em cache por 60 segundos; listagem e busca não são cacheadas.
- `403/429` exibe o aviso de limite sem retry automático; falhas de rede viram mensagem amigável com retry manual.
- Nenhuma mensagem de erro mostra stack, cabeçalhos ou corpo bruto da resposta.

## Requisitos funcionais

| ID | Resumo |
| --- | --- |
| RF-01 | Perfil com avatar, nome, `@login`, bio, seguidores e empresa |
| RF-02 | Banner escuro com `GITHUB BLOG` visível a partir de 320px |
| RF-03 | Link externo para o GitHub com `target="_blank" rel="noopener noreferrer"` |
| RF-04 | Contador de publicações com plural correto |
| RF-05 | Busca com debounce de 500ms e retorno à listagem ao limpar |
| RF-06 | Paginação real no servidor com `per_page=6` |
| RF-07 | Cards com título, resumo, data relativa e hover |
| RF-08 | Navegação SPA ao detalhe com scroll ao topo |
| RF-09 | Detalhe com `VOLTAR`, `VER NO GITHUB`, título e corpo |
| RF-10 | Markdown com GFM (títulos, listas, links e código) |
| RF-11 | Metadados `@autor`, data relativa e plural de comentários |
| RF-12 | Rota `*` com mensagem amigável e volta à Home |
| RF-13 | Skeletons durante carregamento e aborto ao desmontar |
| RF-14 | Rate limit `403/429` sem loop e sem vazamento técnico |
| RF-15 | 404 e erro de rede com mensagens amigáveis |
| RF-16 | Grid 1/2 colunas, foco `blue` visível e contraste AA |

## Regras de negócio

| ID | Resumo |
| --- | --- |
| RN-01 | Pull Requests nunca aparecem na listagem ou busca |
| RN-02 | `state=all&sort=created&direction=desc` |
| RN-03 | `per_page=6`, `page` enviada ao servidor e total via `Link`/Search API |
| RN-04 | Termo de busca codificado com segurança |
| RN-05 | Debounce de 500ms com aborto da requisição anterior |
| RN-06 | `403/429` mapeado para aviso amigável, retry apenas manual |
| RN-07 | 404 amigável em perfil, repositório, issue ou rota inexistente |
| RN-08 | Erro de rede sem `stack`, headers ou JSON bruto |
| RN-09 | Nenhum token no frontend; autenticação futura exigiria proxy |
| RN-10 | Datas relativas em pt-BR (`há 2 dias`) com fallback determinístico |

## Deploy no GitHub Pages

- `vite.config.ts` define `base: '/GitHub-Blog/'`.
- `BrowserRouter` usa `basename` derivado de `import.meta.env.BASE_URL`.
- `public/404.html` redireciona deep links como `/GitHub-Blog/post/42?q=runtime` para `/GitHub-Blog/?/=%2Fpost%2F42%3Fq%3Druntime`; `src/main.tsx` restaura a URL com `history.replaceState` antes do Router.
- Em hosts com rewrite `/* → /index.html`, o `404.html` não é necessário.
- O workflow `.github/workflows/ci.yml` roda typecheck, lint, test e build; a publicação em si pode ser feita pelo Pages Actions ou por outro host.
- Antes de publicar, confira `dist/` para garantir que nenhuma string de token foi parar no bundle.

## Specs

- [PRD_SPEC.md](docs/PRD_SPEC.md) — produto, fluxos, RF-01..RF-16 e RN-01..RN-10
- [TECH_SPEC.md](docs/TECH_SPEC.md) — stack, tipos, endpoints, acessibilidade e testes
- [TASKS_SPEC.md](docs/TASKS_SPEC.md) — checklist, validações e decisões
