# AGENTS.md — Regras para agentes de IA

> Aplica-se a qualquer agente (humano ou IA) que altere este repositório.
> Projeto: **GitHub Blog** — https://github.com/isadoraBurgos/GitHub-Blog

## 1. Leitura obrigatória antes de qualquer alteração

Antes de criar, editar ou excluir **qualquer arquivo**, leia, nesta ordem:

1. `docs/PRD_SPEC.md` — produto, fluxos, RF-01..RF-16, RN-01..RN-10.
2. `docs/TECH_SPEC.md` — stack, tipos, endpoints, acessibilidade, testes.
3. `docs/TASKS_SPEC.md` — próxima tarefa pendente e seu critério de pronto.

Se houver conflito entre uma instrução pontual e as specs, **as specs prevalecem**. Se a mudança pedida exigir alterar uma spec, atualize a spec primeiro e explique o motivo.

## 2. Execução: uma tarefa pequena por vez

- Trabalhe **apenas na próxima tarefa `[ ] Pendente`** de `docs/TASKS_SPEC.md`, em ordem.
- Não pule tarefas, não agrupe tarefas não consecutivas e não "adiante" implementações futuras.
- Uma tarefa só é concluída quando **todos** os itens do seu "Critério de pronto" estiverem satisfeitos.
- Ao final de cada entrega:
  - marque a tarefa como `[x] Concluído` em `docs/TASKS_SPEC.md`;
  - registre, no mesmo arquivo, o que foi validado (comandos e resultado resumido);
  - sugira o commit semântico correspondente.

> **Estado atual:** nenhum código-fonte de aplicação deve ser criado antes da aprovação desta documentação. A inicialização do Vite é a tarefa `T-02`.

## 3. Decisões técnicas

- Explique **antes de implementar** as decisões relevantes (ex.: Tailwind v4 via `@theme`, Search API vs. filtro local de PRs, AbortController, mapeamento de erros).
- Prefira a solução mais simples que atenda ao RF/RN da tarefa. Não introduza bibliotecas, estados globais ou abstrações sem justificativa explícita na spec.
- Documente qualquer desvio da spec em `docs/TASKS_SPEC.md` (seção "Desvios e decisões"), com impacto em RF/RN.

## 4. TypeScript estrito — sem `any`

- `strict: true`, `noImplicitAny: true`, `noUncheckedIndexedAccess: true` no `tsconfig`.
- **Nunca use `any`**. Para dados externos da GitHub API, use `unknown` na fronteira e valide/narrow com type guards ou Zod antes de converter para as interfaces de `src/types/`.
- Tipos de domínio ficam em `src/types/`; nunca redeclare `GitHubUser`, `GitHubIssue` ou `SearchIssuesResponse` dentro de componentes.
- Props de componentes são sempre interfaces explícitas. Evite `React.FC` implícito e `// @ts-ignore`.
- Funções assíncronas em hooks e serviços devem declarar tipo de retorno explícito.

## 5. Segurança — tokens GitHub

- **Nunca exponha token GitHub no frontend.** Não crie `VITE_GITHUB_TOKEN`, não coloque token em `.env` versionado, `localStorage`, logs, mensagens de erro, URL ou bundle.
- A aplicação usa a API pública não autenticada (60 requisições/hora por IP). O tratamento de `403/429` é obrigatório (RN-06).
- Se no futuro houver necessidade de autenticação, ela deve passar por um **proxy/backend** que injete o token no servidor. Atualize `docs/TECH_SPEC.md` antes de implementar.
- Em mensagens de erro, exiba apenas texto amigável: sem `stack trace`, sem cabeçalhos, sem corpo bruto da resposta, sem token.

## 6. Design e acessibilidade

- Use **somente** os design tokens de `docs/TECH_SPEC.md` (paleta Figma, Nunito 400/700, line-height 160%, escala 12/14/16/18/20/24px). Não invente cores ou tamanhos.
- Todo elemento interativo precisa de foco visível na cor `blue` e alvo de toque adequado no mobile.
- Imagens (avatar) exigem `alt` significativo; links externos usam `target="_blank" rel="noopener noreferrer"`.

## 7. Commits semânticos

Sugira **um commit por tarefa concluída**, no formato Conventional Commits:

| Tipo | Uso neste projeto |
| --- | --- |
| `docs:` | specs, checklist, README |
| `feat:` | nova funcionalidade (RF) |
| `fix:` | correção de comportamento ou erro (RN) |
| `test:` | cenários automatizados |
| `refactor:` | reorganização sem mudança de comportamento |
| `chore:` | setup, dependências, CI |

Exemplo: `feat: pagina server-side das publicações com per_page=6 (T-09)`.

## 8. Check rápido antes de declarar pronto

- [ ] Li as 3 specs e confirmei o ID da tarefa.
- [ ] Apenas uma tarefa foi alterada.
- [ ] `npm run typecheck` e `npm run lint` passam (quando existirem).
- [ ] `npm test` passa ou o novo teste foi escrito junto da tarefa.
- [ ] `docs/TASKS_SPEC.md` atualizado com status e validação.
- [ ] Nenhum token, segredo ou dado bruto da API vazou no código ou na resposta de erro.
- [ ] Commit semântico sugerido.
