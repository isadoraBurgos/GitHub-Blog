// @vitest-environment jsdom
import { renderHook, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { IssuesPage } from '@/types'
import { useIssues } from './useIssues.ts'

const { mockListIssues } = vi.hoisted(() => ({ mockListIssues: vi.fn() }))

vi.mock('@/services/githubService', () => ({ listIssues: mockListIssues }))

function makePage(page: number): IssuesPage {
  return { items: [], total: 20, page, hasNextPage: page < 3 }
}

function lastSignal(): AbortSignal {
  return mockListIssues.mock.calls.at(-1)?.[1] as AbortSignal
}

beforeEach(() => {
  mockListIssues.mockReset()
})

describe('useIssues', () => {
  it('faz uma única request na página 1', async () => {
    mockListIssues.mockResolvedValue(makePage(1))

    const { result } = renderHook(() => useIssues(1))

    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(mockListIssues).toHaveBeenCalledTimes(1)
    expect(mockListIssues.mock.calls[0]?.[0]).toBe(1)
    expect(lastSignal()).toBeInstanceOf(AbortSignal)
    expect(result.current.pageData).toEqual(makePage(1))
    expect(result.current.error).toBeNull()
  })

  it('faz exatamente uma request ao trocar de página', async () => {
    mockListIssues.mockImplementation((page: number) => Promise.resolve(makePage(page)))

    const { result, rerender } = renderHook(({ page }) => useIssues(page), {
      initialProps: { page: 1 },
    })

    await waitFor(() => expect(result.current.loading).toBe(false))
    rerender({ page: 2 })

    await waitFor(() => expect(result.current.pageData.page).toBe(2))
    expect(mockListIssues).toHaveBeenCalledTimes(2)
    expect(mockListIssues.mock.calls.at(-1)?.[0]).toBe(2)
    expect(lastSignal()).toBeInstanceOf(AbortSignal)
  })

  it('normaliza page menor que 1', async () => {
    mockListIssues.mockResolvedValue(makePage(1))

    const { result } = renderHook(() => useIssues(0))

    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(mockListIssues.mock.calls[0]?.[0]).toBe(1)
    expect(lastSignal()).toBeInstanceOf(AbortSignal)
  })

  it('aborta a requisição ao desmontar', () => {
    mockListIssues.mockResolvedValue(makePage(1))

    const { unmount } = renderHook(() => useIssues(1))
    const signal = mockListIssues.mock.calls[0]?.[1] as AbortSignal

    unmount()
    expect(signal.aborted).toBe(true)
  })
})
