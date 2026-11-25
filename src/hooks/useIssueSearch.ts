import axios from 'axios'
import { useCallback, useEffect, useState } from 'react'
import { listIssues, searchIssues } from '@/services/githubService'
import type { BlogError, IssuesPage } from '@/types'
import { mapApiError } from '@/utils/mapApiError'
import type { UseIssuesResult } from './useIssues.ts'
import { useDebouncedValue } from './useDebouncedValue.ts'

interface SearchState {
  key: string;
  data: IssuesPage | null;
  error: BlogError | null;
}

const EMPTY_PAGE: IssuesPage = { items: [], total: 0, page: 0, hasNextPage: false }
const INITIAL_STATE: SearchState = { key: '', data: null, error: null }

export function useIssueSearch(term: string, page: number): UseIssuesResult {
  const debouncedTerm = useDebouncedValue(term)
  const trimmed = debouncedTerm.trim()
  const requestedPage = Number.isInteger(page) && page >= 1 ? page : 1
  const effectivePage = trimmed === '' ? 1 : requestedPage
  const queryKey = `${trimmed}|${effectivePage}`

  const [state, setState] = useState<SearchState>(INITIAL_STATE)
  const [pending, setPending] = useState(false)
  const [attempt, setAttempt] = useState(0)

  const loading = pending || state.key !== queryKey
  const pageData = state.key === queryKey ? (state.data ?? EMPTY_PAGE) : EMPTY_PAGE
  const error = state.key === queryKey ? state.error : null

  const reload = useCallback((): void => {
    setPending(true)
    setState((current) => ({ ...current, error: null }))
    setAttempt((current) => current + 1)
  }, [])

  useEffect(() => {
    const controller = new AbortController()
    let active = true

    const request =
      trimmed === ''
        ? listIssues(effectivePage, controller.signal)
        : searchIssues(trimmed, effectivePage, controller.signal)

    request
      .then((data: IssuesPage): void => {
        if (!active) {
          return
        }

        setState({ key: queryKey, data, error: null })
        setPending(false)
      })
      .catch((cause: unknown): void => {
        if (controller.signal.aborted || axios.isCancel(cause) || !active) {
          return
        }

        setState((current) => ({ key: queryKey, data: current.data, error: mapApiError(cause) }))
        setPending(false)
      })

    return (): void => {
      active = false
      controller.abort()
    }
  }, [trimmed, effectivePage, queryKey, attempt])

  return { pageData, loading, error, reload }
}
