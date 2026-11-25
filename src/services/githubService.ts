import { PER_PAGE, REPO, USERNAME } from '@/config/github.ts'
import { isGitHubIssue, isGitHubUser, isSearchIssuesResponse } from '@/types'
import type { GitHubIssue, GitHubUser, IssuesPage } from '@/types'
import { filterIssues } from '@/utils/filterIssues.ts'
import { api } from './api.ts'

const CACHE_TTL_MS = 60_000;

interface CacheEntry {
  data: unknown;
  at: number;
}

/** Cache curto apenas para perfil e detalhe — lista e busca refletem edições. */
const cache = new Map<string, CacheEntry>();

function isUnknownArray(value: unknown): value is unknown[] {
  return Array.isArray(value);
}

function getCached(key: string): unknown {
  const entry = cache.get(key);

  if (entry === undefined) {
    return undefined;
  }

  if (Date.now() - entry.at >= CACHE_TTL_MS) {
    cache.delete(key);
    return undefined;
  }

  return entry.data;
}

function getCachedUser(key: string): GitHubUser | undefined {
  const value = getCached(key);
  return isGitHubUser(value) ? value : undefined;
}

function getCachedIssue(key: string): GitHubIssue | undefined {
  const value = getCached(key);
  return isGitHubIssue(value) ? value : undefined;
}

function parseLastPage(header: unknown): number | undefined {
  if (typeof header !== 'string') {
    return undefined;
  }

  const match = header.match(/[?&]page=(\d+)[^>]*>\s*;\s*rel="last"/);
  const page = match?.[1];

  return page === undefined ? undefined : Number(page);
}

/** Útil para isolar testes e forçar recarga manual. */
export function clearGitHubCache(): void {
  cache.clear();
}

export async function getUser(signal?: AbortSignal): Promise<GitHubUser> {
  const key = `user:${USERNAME}`;
  const cached = getCachedUser(key);

  if (cached !== undefined) {
    return cached;
  }

  const response = await api.get<unknown>(`/users/${USERNAME}`, { signal });

  if (!isGitHubUser(response.data)) {
    throw new Error('Resposta inesperada da API ao carregar o perfil.');
  }

  cache.set(key, { data: response.data, at: Date.now() });
  return response.data;
}

export async function listIssues(page: number, signal?: AbortSignal): Promise<IssuesPage> {
  const response = await api.get<unknown>(`/repos/${USERNAME}/${REPO}/issues`, {
    params: {
      state: 'all',
      sort: 'created',
      direction: 'desc',
      page,
      per_page: PER_PAGE,
    },
    signal,
  });

  const data: unknown = response.data;

  if (!isUnknownArray(data) || !data.every(isGitHubIssue)) {
    throw new Error('Resposta inesperada da API ao listar publicações.');
  }

  const items = filterIssues(data);
  const lastPage = parseLastPage(response.headers['link']);
  const total = lastPage === undefined ? items.length : lastPage * PER_PAGE;
  const hasNextPage = lastPage === undefined ? items.length === PER_PAGE : page < lastPage;

  return { items, total, page, hasNextPage };
}

export async function searchIssues(
  term: string,
  page: number,
  signal?: AbortSignal,
): Promise<IssuesPage> {
  const q = `repo:${USERNAME}/${REPO} is:issue ${term.trim()}`.trim();

  const response = await api.get<unknown>('/search/issues', {
    params: { q, page, per_page: PER_PAGE },
    signal,
  });

  if (!isSearchIssuesResponse(response.data)) {
    throw new Error('Resposta inesperada da API ao buscar publicações.');
  }

  const items = filterIssues(response.data.items);
  const total = response.data.total_count;

  return { items, total, page, hasNextPage: page * PER_PAGE < total };
}

export async function getIssue(number: number, signal?: AbortSignal): Promise<GitHubIssue> {
  const key = `issue:${number}`;
  const cached = getCachedIssue(key);

  if (cached !== undefined) {
    return cached;
  }

  const response = await api.get<unknown>(`/repos/${USERNAME}/${REPO}/issues/${number}`, {
    signal,
  });

  if (!isGitHubIssue(response.data)) {
    throw new Error('Resposta inesperada da API ao carregar a publicação.');
  }

  cache.set(key, { data: response.data, at: Date.now() });
  return response.data;
}
