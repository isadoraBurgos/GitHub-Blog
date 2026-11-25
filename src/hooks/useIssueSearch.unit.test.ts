// @vitest-environment jsdom
import { act, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { IssuesPage } from '@/types'
import { useIssueSearch } from './useIssueSearch.ts'

const { mockListIssues, mockSearchIssues } = vi.hoisted(() => ({
  mockListIssues: vi.fn(),
  mockSearchIssues: vi.fn(),
}))

vi.mock('@/services/githubService', () => ({
  listIssues: mockListIssues,
  searchIssues: mockSearchIssues,
}))

function makePage(page: number): IssuesPage {
  return { items: [], total: 20, page, hasNextPage: page < 3 }
}

async function flush(): Promise<void> {
  await act(async () => {
    await Promise.resolve()
  })
}

beforeEach(() => {
  vi.useFakeTimers()
  mockListIssues.mockReset()
  mockSearchIssues.mockReset()
  mockListIssues.mockResolvedValue(makePage(1))
  mockSearchIssues.mockResolvedValue(makePage(1))
})

afterEach(() => {
  vi.useRealTimers()
})

describe('useIssueSearch', () => {
  it('sem termo restaura a lista na página 1', async () => {
    const { result } = renderHook(() => useIssueSearch('', 3))

    await flush()
    expect(mockListIssues).toHaveBeenCalledTimes(1)
    expect(mockListIssues.mock.calls[0]?.[0]).toBe(1)
    expect(mockSearchIssues).not.toHaveBeenCalled()
    expect(result.current.pageData).toEqual(makePage(1))
  })

  it('não busca em 499ms e busca uma vez em 500ms', async () => {
    const { result, rerender } = renderHook(({ term }) => useIssueSearch(term, 1), {
      initialProps: { term: '' },
    })

    await flush()
    rerender({ term: 'runtime' })

    act(() => {
      vi.advanceTimersByTime(499)
    })
    expect(mockSearchIssues).not.toHaveBeenCalled()

    act(() => {
      vi.advanceTimersByTime(1)
    })
    await flush()
    expect(mockSearchIssues).toHaveBeenCalledTimes(1)
    expect(mockSearchIssues.mock.calls[0]?.[0]).toBe('runtime')
    expect(mockSearchIssues.mock.calls[0]?.[1]).toBe(1)
    expect(result.current.pageData).toEqual(makePage(1))
  })

  it('aborta a busca anterior ao digitar novamente', async () => {
    const { rerender } = renderHook(({ term }) => useIssueSearch(term, 1), {
      initialProps: { term: 'runtime' },
    })

    await flush()
    const firstSignal = mockSearchIssues.mock.calls[0]?.[2] as AbortSignal

    rerender({ term: 'erros' })
    act(() => {
      vi.advanceTimersByTime(500)
    })
    await flush()

    expect(firstSignal.aborted).toBe(true)
    expect(mockSearchIssues).toHaveBeenCalledTimes(2)
  })

  it('limpar o termo volta para a lista na página 1', async () => {
    const { rerender } = renderHook(({ term }) => useIssueSearch(term, 3), {
      initialProps: { term: 'runtime' },
    })

    await flush()
    expect(mockSearchIssues.mock.calls[0]?.[1]).toBe(3)

    rerender({ term: '' })
    act(() => {
      vi.advanceTimersByTime(500)
    })
    await flush()

    expect(mockListIssues).toHaveBeenCalledTimes(1)
    expect(mockListIssues.mock.calls[0]?.[0]).toBe(1)
  })
})
