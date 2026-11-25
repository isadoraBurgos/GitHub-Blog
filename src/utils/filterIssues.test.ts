import { describe, expect, it } from 'vitest'
import type { GitHubIssue } from '@/types'
import { filterIssues } from './filterIssues.ts'

function makeIssue(number: number): GitHubIssue {
  return {
    id: number,
    number,
    title: `Issue ${number}`,
    body: null,
    state: 'open',
    html_url: `https://example.com/issues/${number}`,
    created_at: '2026-01-01T00:00:00.000Z',
    updated_at: '2026-01-01T00:00:00.000Z',
    comments: 0,
    user: {
      login: 'author',
      avatar_url: 'https://example.com/avatar.png',
      html_url: 'https://example.com/author',
    },
    labels: [],
  }
}

describe('filterIssues', () => {
  it('remove itens com pull_request', () => {
    const issue = makeIssue(1)
    const pullRequest = makeIssue(2)
    pullRequest.pull_request = {
      url: 'https://example.com/api/2',
      html_url: 'https://example.com/pull/2',
      diff_url: 'https://example.com/pull/2.diff',
      patch_url: 'https://example.com/pull/2.patch',
    }

    expect(filterIssues([issue, pullRequest])).toEqual([issue])
  })

  it('não muta o array de entrada', () => {
    const issues = [makeIssue(1), makeIssue(2)]

    expect(filterIssues(issues)).not.toBe(issues)
    expect(issues).toHaveLength(2)
  })
})
