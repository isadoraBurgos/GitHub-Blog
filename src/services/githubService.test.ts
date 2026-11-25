import type { AxiosResponse } from 'axios'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { GITHUB_API, PER_PAGE, REPO, USERNAME } from '@/config/github.ts'
import type { GitHubIssue, GitHubUser } from '@/types'
import {
  clearGitHubCache,
  getIssue,
  getUser,
  listIssues,
  searchIssues,
} from './githubService.ts'

const { mockGet } = vi.hoisted(() => ({ mockGet: vi.fn() }))

vi.mock('./api.ts', () => ({ api: { get: mockGet } }))

function response<T>(data: T, headers: Record<string, string> = {}): AxiosResponse<T> {
  return { data, status: 200, statusText: 'OK', headers } as AxiosResponse<T>
}

const user: GitHubUser = {
  login: 'author',
  name: 'Autor',
  avatar_url: 'https://example.com/avatar.png',
  html_url: 'https://example.com/author',
  bio: null,
  company: 'Empresa',
  followers: 10,
  public_repos: 2,
  created_at: '2020-01-01T00:00:00.000Z',
}

function makeIssue(number: number, pullRequest = false): GitHubIssue {
  const issue: GitHubIssue = {
    id: number,
    number,
    title: `Issue ${number}`,
    body: null,
    state: 'open',
    html_url: `https://example.com/issues/${number}`,
    created_at: '2026-01-01T00:00:00.000Z',
    updated_at: '2026-01-02T00:00:00.000Z',
    comments: 0,
    user: {
      login: 'author',
      avatar_url: 'https://example.com/avatar.png',
      html_url: 'https://example.com/author',
    },
    labels: [],
  }

  if (pullRequest) {
    issue.pull_request = {
      url: `https://example.com/api/${number}`,
      html_url: `https://example.com/pull/${number}`,
      diff_url: `https://example.com/pull/${number}.diff`,
      patch_url: `https://example.com/pull/${number}.patch`,
    };
  }

  return issue;
}

beforeEach(() => {
  clearGitHubCache();
  mockGet.mockReset();
})

afterEach(() => {
  vi.useRealTimers();
})

describe('getUser', () => {
  it('valida o perfil e repassa o signal', async () => {
    const controller = new AbortController()
    mockGet.mockResolvedValue(response(user))

    await expect(getUser(controller.signal)).resolves.toEqual(user)
    expect(mockGet).toHaveBeenCalledWith(`/users/${USERNAME}`, { signal: controller.signal })
  })

  it('usa cache por 60 segundos', async () => {
    vi.useFakeTimers()
    mockGet.mockResolvedValue(response(user))

    await getUser()
    await getUser()
    expect(mockGet).toHaveBeenCalledTimes(1)

    vi.setSystemTime(Date.now() + 60_000)
    await getUser()
    expect(mockGet).toHaveBeenCalledTimes(2)
  })

  it('rejeita payload inválido', async () => {
    mockGet.mockResolvedValue(response({ login: 'author' }))

    await expect(getUser()).rejects.toThrow('Resposta inesperada')
  })
})

describe('listIssues', () => {
  it('envia parâmetros server-side, filtra PRs e lê total do Link', async () => {
    const issue = makeIssue(1)
    const pullRequest = makeIssue(2, true)
    const link = `<${GITHUB_API}/repos/${USERNAME}/${REPO}/issues?page=3&per_page=${PER_PAGE}>; rel="last"`
    mockGet.mockResolvedValue(response([issue, pullRequest], { link }))

    const result = await listIssues(1)

    expect(mockGet).toHaveBeenCalledWith(`/repos/${USERNAME}/${REPO}/issues`, {
      params: {
        state: 'all',
        sort: 'created',
        direction: 'desc',
        page: 1,
        per_page: PER_PAGE,
      },
      signal: undefined,
    })
    expect(result.items).toEqual([issue])
    expect(result.total).toBe(3 * PER_PAGE)
    expect(result.hasNextPage).toBe(true)
  })

  it('usa fallback de total quando não há header Link', async () => {
    mockGet.mockResolvedValue(response([makeIssue(1), makeIssue(2)]))

    const result = await listIssues(1)

    expect(result.total).toBe(2)
    expect(result.hasNextPage).toBe(false)
  })
})

describe('searchIssues', () => {
  it('usa params.q com is:issue, filtra PRs e calcula hasNextPage', async () => {
    const issue = makeIssue(1)
    const pullRequest = makeIssue(2, true)
    mockGet.mockResolvedValue(
      response({
        total_count: 12,
        incomplete_results: false,
        items: [issue, pullRequest],
      }),
    )

    const result = await searchIssues('runtime & erros', 2)

    expect(mockGet).toHaveBeenCalledWith('/search/issues', {
      params: {
        q: `repo:${USERNAME}/${REPO} is:issue runtime & erros`,
        page: 2,
        per_page: PER_PAGE,
      },
      signal: undefined,
    })
    expect(result.items).toEqual([issue])
    expect(result.total).toBe(12)
    expect(result.hasNextPage).toBe(false)
  })
})

describe('getIssue', () => {
  it('retorna issue validada e aplica cache TTL', async () => {
    vi.useFakeTimers()
    const issue = makeIssue(42)
    mockGet.mockResolvedValue(response(issue))

    await expect(getIssue(42)).resolves.toEqual(issue)
    await getIssue(42)
    expect(mockGet).toHaveBeenCalledTimes(1)

    vi.setSystemTime(Date.now() + 60_000)
    await getIssue(42)
    expect(mockGet).toHaveBeenCalledTimes(2)
  })

  it('não faz chamada duplicada após limpar cache', async () => {
    const issue = makeIssue(7)
    mockGet.mockResolvedValue(response(issue))

    await getIssue(7)
    clearGitHubCache()
    await getIssue(7)

    expect(mockGet).toHaveBeenCalledTimes(2)
  })
})
