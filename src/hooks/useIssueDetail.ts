import axios from 'axios'
import { useCallback, useEffect, useState } from 'react'
import { clearGitHubCache, getIssue } from '@/services/githubService'
import type { BlogError, GitHubIssue } from '@/types'
import { mapApiError, notFoundBlogError } from '@/utils/mapApiError'

export interface UseIssueDetailResult {
  issue: GitHubIssue | null
  loading: boolean
  error: BlogError | null
  reload: () => void
}

interface DetailState {
  number: number;
  issue: GitHubIssue | null;
  error: BlogError | null;
}

const INVALID_NUMBER_ERROR = notFoundBlogError('detail')
const INITIAL_STATE: DetailState = { number: -1, issue: null, error: null }

export function useIssueDetail(number: number): UseIssueDetailResult {
  const valid = Number.isInteger(number) && number >= 1

  const [state, setState] = useState<DetailState>(INITIAL_STATE)
  const [pending, setPending] = useState(false)
  const [attempt, setAttempt] = useState(0)

  const matches = valid && state.number === number
  const issue = matches ? state.issue : null
  const loading = valid && (pending || !matches)
  const error = !valid ? INVALID_NUMBER_ERROR : matches ? state.error : null

  const reload = useCallback((): void => {
    if (!valid) {
      return
    }

    clearGitHubCache()
    setPending(true)
    setState({ number, issue: null, error: null })
    setAttempt((current) => current + 1)
  }, [number, valid])

  useEffect(() => {
    if (!valid) {
      return
    }

    const controller = new AbortController()
    let active = true

    getIssue(number, controller.signal)
      .then((data: GitHubIssue): void => {
        if (!active) {
          return
        }

        setState({ number, issue: data, error: null })
        setPending(false)
      })
      .catch((cause: unknown): void => {
        if (controller.signal.aborted || axios.isCancel(cause) || !active) {
          return
        }

        setState((current) => ({ number, issue: current.issue, error: mapApiError(cause, 'detail') }))
        setPending(false)
      })

    return (): void => {
      active = false
      controller.abort()
    }
  }, [number, valid, attempt])

  return { issue, loading, error, reload }
}
