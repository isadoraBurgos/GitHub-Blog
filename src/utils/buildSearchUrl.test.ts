import { describe, expect, it } from 'vitest'
import { GITHUB_API, PER_PAGE, REPO, USERNAME } from '@/config/github.ts'
import { buildSearchUrl } from './buildSearchUrl.ts'

describe('buildSearchUrl', () => {
  it('monta URL com is:issue, página e per_page da config', () => {
    const url = new URL(buildSearchUrl('', 2))

    expect(url.origin + url.pathname).toBe(`${GITHUB_API}/search/issues`)
    expect(url.searchParams.get('q')).toBe(`repo:${USERNAME}/${REPO} is:issue`)
    expect(url.searchParams.get('page')).toBe('2')
    expect(url.searchParams.get('per_page')).toBe(String(PER_PAGE))
  })

  it('codifica termo que tenta injetar qualificadores', () => {
    const term = 'runtime & erros #is:pr'
    const raw = buildSearchUrl(term, 1)
    const expectedQ = `repo:${USERNAME}/${REPO} is:issue ${term}`

    expect(raw).toContain(encodeURIComponent(expectedQ))
    expect(new URL(raw).searchParams.get('q')).toBe(expectedQ)
    expect(raw).not.toContain('is:pr&')
  })
})
