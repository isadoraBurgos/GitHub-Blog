import { act, fireEvent, render, renderHook, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, describe, expect, it, vi } from 'vitest'
import App from '@/App.tsx'
import { PER_PAGE, REPO, SEARCH_DEBOUNCE_MS, USERNAME } from '@/config/github.ts'
import { searchLog, setSearchStatus } from '@/test/handlers.ts'
import type { IssuesPage } from '@/types'
import { useIssueSearch } from './useIssueSearch.ts'

const { signalLog } = vi.hoisted(() => ({ signalLog: [] as AbortSignal[] }))

/** Envolve o serviço real só para observar o signal que o hook passa ao Axios. */
vi.mock('@/services/githubService', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/services/githubService')>()

  return {
    ...actual,
    searchIssues: (
      term: string,
      page: number,
      signal?: AbortSignal,
    ): Promise<IssuesPage> => {
      if (signal) {
        signalLog.push(signal)
      }

      return actual.searchIssues(term, page, signal)
    },
  }
})

afterEach(() => {
  signalLog.splice(0, signalLog.length)
  vi.useRealTimers()
})

function renderHome() {
  return render(
    <MemoryRouter initialEntries={['/']}>
      <App />
    </MemoryRouter>,
  )
}

async function waitForFirstPage(): Promise<void> {
  expect(await screen.findByText('Publicação 6')).toBeTruthy()
}

describe('useIssueSearch — Cenário 2 (MSW)', () => {
  it('não busca em 499ms e busca uma vez em 500ms com q e per_page corretos', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true, advanceTimeDelta: 10 })
    const { rerender, unmount } = renderHook(({ term }) => useIssueSearch(term, 1), {
      initialProps: { term: '' },
    })

    rerender({ term: 'runtime & erros' })

    act(() => {
      vi.advanceTimersByTime(SEARCH_DEBOUNCE_MS - 1)
    })
    expect(searchLog).toHaveLength(0)

    act(() => {
      vi.advanceTimersByTime(1)
    })
    await waitFor(() => expect(searchLog).toHaveLength(1))

    expect(searchLog[0]?.q).toBe(`repo:${USERNAME}/${REPO} is:issue runtime & erros`)
    expect(searchLog[0]?.page).toBe('1')
    expect(searchLog[0]?.perPage).toBe(String(PER_PAGE))

    unmount()
  })

  it('aborta a busca anterior e não mostra o resultado antigo', async () => {
    renderHome()
    await waitForFirstPage()

    fireEvent.change(screen.getByRole('searchbox'), { target: { value: 'runtime' } })
    await waitFor(() => expect(searchLog).toHaveLength(1))
    expect(await screen.findByText('Resultado runtime')).toBeTruthy()

    const firstSignal = signalLog[0]

    fireEvent.change(screen.getByRole('searchbox'), { target: { value: 'erros' } })
    await waitFor(() => expect(searchLog).toHaveLength(2))

    expect(firstSignal?.aborted).toBe(true)
    expect(await screen.findByText('Resultado erros')).toBeTruthy()
    expect(screen.queryByText('Resultado runtime')).toBeNull()
  })

  it('429 mostra o limite sem retry, sem segredos e sem nova chamada', async () => {
    setSearchStatus(429)
    renderHome()
    await waitForFirstPage()

    fireEvent.change(screen.getByRole('searchbox'), { target: { value: 'runtime' } })

    const alert = await screen.findByRole('alert')
    expect(alert.textContent).toBe(
      'Limite da API do GitHub atingido. Aguarde alguns minutos e tente novamente.',
    )
    expect(alert.textContent ?? '').not.toMatch(/ghp_|github_pat_|Authorization|stack/i)
    expect(screen.queryByRole('button', { name: 'Tentar novamente' })).toBeNull()

    const attempts = searchLog.length
    await new Promise((resolve) => setTimeout(resolve, SEARCH_DEBOUNCE_MS + 100))
    expect(searchLog).toHaveLength(attempts)
  })
})
