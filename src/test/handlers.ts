import { http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { GITHUB_API, PER_PAGE, REPO, USERNAME } from '@/config/github.ts'
import type { GitHubIssue, GitHubUser } from '@/types'

export interface RequestRecord {
  page: string | null
  perPage: string | null
}

export const requestLog: RequestRecord[] = []

export interface SearchRequestRecord {
  q: string | null
  page: string | null
  perPage: string | null
}

export const searchLog: SearchRequestRecord[] = []

export const detailLog: number[] = []

let searchStatus = 200

/** Controla o cenário de rate limit sem precisar de um handler separado. */
export function setSearchStatus(status: number): void {
  searchStatus = status
}

/**
 * O jsdom trata a API como cross-origin: sem `Allow-Origin` o XHR cai em `onerror`,
 * e sem `Expose-Headers` o cliente não consegue ler o `Link` da paginação.
 */
const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Expose-Headers': 'Link',
}

const profile: GitHubUser = {
  login: USERNAME,
  name: 'Isadora Burgos',
  avatar_url: 'https://example.com/avatar.png',
  html_url: `https://github.com/${USERNAME}`,
  bio: 'Desenvolvedora de software',
  company: 'Exemplo',
  followers: 42,
  public_repos: 7,
  created_at: '2020-01-01T00:00:00Z',
}

function makeIssue(index: number): GitHubIssue {
  return {
    id: index,
    number: index,
    title: `Publicação ${index}`,
    body: `Corpo da publicação ${index}`,
    state: 'open',
    html_url: `https://example.com/issues/${index}`,
    created_at: '2026-11-23T00:00:00Z',
    updated_at: '2026-11-23T00:00:00Z',
    comments: 2,
    user: {
      login: USERNAME,
      avatar_url: 'https://example.com/avatar.png',
      html_url: `https://github.com/${USERNAME}`,
    },
    labels: [],
  }
}

const issues = Array.from({ length: 12 }, (_, index) => makeIssue(index + 1))

const pullRequest: GitHubIssue = {
  ...makeIssue(99),
  title: 'Pull Request: não deve aparecer',
  pull_request: {
    url: 'https://example.com/pulls/99',
    html_url: 'https://example.com/pulls/99',
    diff_url: 'https://example.com/pulls/99.diff',
    patch_url: 'https://example.com/pulls/99.patch',
    merged_at: null,
  },
}

const TWO_DAYS_MS = 2 * 24 * 60 * 60 * 1000;

const detailIssue: GitHubIssue = {
  ...makeIssue(42),
  title: 'Publicação 42',
  body: [
    '## Título do corpo',
    '',
    '- primeiro item',
    '- segundo item',
    '',
    '[Documentação](https://example.com/docs)',
    '',
    '```js',
    'console.log("olá")',
    '```',
  ].join('\n'),
  created_at: new Date(Date.now() - TWO_DAYS_MS).toISOString(),
  updated_at: new Date(Date.now() - TWO_DAYS_MS).toISOString(),
  comments: 3,
  user: {
    login: 'autor',
    avatar_url: 'https://example.com/avatar.png',
    html_url: 'https://example.com/autor',
  },
}

function searchResult(term: string, page: number): GitHubIssue {
  const word = term.trim().split(/\s+/).at(-1) ?? 'termo'

  return {
    ...makeIssue(300 + page),
    title: `Resultado ${word}`,
  }
}

export const handlers = [
  http.get(`${GITHUB_API}/search/issues`, ({ request }) => {
    const url = new URL(request.url)
    searchLog.push({
      q: url.searchParams.get('q'),
      page: url.searchParams.get('page'),
      perPage: url.searchParams.get('per_page'),
    })

    if (searchStatus !== 200) {
      return new HttpResponse(null, { status: searchStatus, headers: CORS_HEADERS })
    }

    const term = url.searchParams.get('q') ?? ''
    const page = Number(url.searchParams.get('page') ?? '1')

    return HttpResponse.json(
      {
        total_count: 1,
        incomplete_results: false,
        items: [searchResult(term, page)],
      },
      { headers: CORS_HEADERS },
    )
  }),

  http.get(`${GITHUB_API}/users/:username`, ({ params }) => {
    if (params.username !== USERNAME) {
      return new HttpResponse(null, { status: 404, headers: CORS_HEADERS })
    }

    return HttpResponse.json(profile, { headers: CORS_HEADERS })
  }),

  http.get(`${GITHUB_API}/repos/:username/:repo/issues/:number`, ({ params }) => {
    if (params.username !== USERNAME || params.repo !== REPO) {
      return new HttpResponse(null, { status: 404, headers: CORS_HEADERS })
    }

    const number = Number(params.number)
    detailLog.push(number)

    if (number !== 42) {
      return new HttpResponse(null, { status: 404, headers: CORS_HEADERS })
    }

    return HttpResponse.json(detailIssue, { headers: CORS_HEADERS })
  }),

  http.get(`${GITHUB_API}/repos/:username/:repo/issues`, ({ request, params }) => {
    if (params.username !== USERNAME || params.repo !== REPO) {
      return new HttpResponse(null, { status: 404, headers: CORS_HEADERS })
    }

    const url = new URL(request.url)
    const page = Number(url.searchParams.get('page') ?? '1')
    const perPage = Number(url.searchParams.get('per_page') ?? PER_PAGE)
    requestLog.push({
      page: url.searchParams.get('page'),
      perPage: url.searchParams.get('per_page'),
    })

    const allItems = [...issues, pullRequest]
    const start = (page - 1) * perPage
    const body = allItems.slice(start, start + perPage)
    const lastPage = Math.ceil(issues.length / perPage)

    return HttpResponse.json(body, {
      headers: {
        ...CORS_HEADERS,
        Link: `<${GITHUB_API}/repos/${USERNAME}/${REPO}/issues?page=${lastPage}&per_page=${perPage}>; rel="last"`,
      },
    })
  }),
]

export const server = setupServer(...handlers)
