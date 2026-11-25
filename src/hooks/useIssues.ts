import axios from 'axios'
import { useCallback, useEffect, useState } from 'react'
import { listIssues } from '@/services/githubService'
import type { BlogError, IssuesPage } from '@/types'
import { mapApiError } from '@/utils/mapApiError'

export interface UseIssuesResult {
  pageData: IssuesPage
  loading: boolean
  error: BlogError | null
  reload: () => void
}

interface ErrorState {
  page: number;
  error: BlogError | null;
}

const EMPTY_PAGE: IssuesPage = { items: [], total: 0, page: 0, hasNextPage: false }
const NO_ERROR: ErrorState = { page: -1, error: null }

export function useIssues(page: number): UseIssuesResult {
  const currentPage = Number.isInteger(page) && page >= 1 ? page : 1

  const [pageData, setPageData] = useState<IssuesPage>(EMPTY_PAGE)
  const [errorState, setErrorState] = useState<ErrorState>(NO_ERROR)
  const [pending, setPending] = useState(false)
  const [attempt, setAttempt] = useState(0)

  const loading = pending || (pageData.page !== currentPage && errorState.page !== currentPage)
  const error = errorState.page === currentPage ? errorState.error : null

  const reload = useCallback((): void => {
    setPending(true)
    setErrorState({ page: currentPage, error: null })
    setAttempt((current) => current + 1)
  }, [currentPage])

  useEffect(() => {
    const controller = new AbortController()
    let active = true

    listIssues(currentPage, controller.signal)
      .then((data: IssuesPage): void => {
        if (!active) {
          return
        }

        setPageData(data)
        setErrorState({ page: currentPage, error: null })
        setPending(false)
      })
      .catch((cause: unknown): void => {
        if (controller.signal.aborted || axios.isCancel(cause) || !active) {
          return
        }

        setErrorState({ page: currentPage, error: mapApiError(cause) })
        setPending(false)
      })

    return (): void => {
      active = false
      controller.abort()
    }
  }, [currentPage, attempt])

  return { pageData, loading, error, reload }
}
