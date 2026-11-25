import { GITHUB_API, PER_PAGE, REPO, USERNAME } from '@/config/github.ts'

/** URL manual para fallback/testes; o caminho principal usa `params` do Axios (RN-04). */
export function buildSearchUrl(term: string, page: number): string {
  const q = `repo:${USERNAME}/${REPO} is:issue ${term}`.trim();

  return `${GITHUB_API}/search/issues?q=${encodeURIComponent(q)}&page=${page}&per_page=${PER_PAGE}`;
}
