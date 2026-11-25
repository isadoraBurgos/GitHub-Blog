import axios from 'axios'
import { useCallback, useEffect, useState } from 'react'
import { clearGitHubCache, getUser } from '@/services/githubService'
import type { BlogError, GitHubUser } from '@/types'
import { mapApiError } from '@/utils/mapApiError'

export interface UseProfileResult {
  profile: GitHubUser | null
  loading: boolean
  error: BlogError | null
  reload: () => void
}

export function useProfile(): UseProfileResult {
  const [profile, setProfile] = useState<GitHubUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<BlogError | null>(null)
  const [attempt, setAttempt] = useState(0)

  const reload = useCallback((): void => {
    clearGitHubCache()
    setProfile(null)
    setError(null)
    setLoading(true)
    setAttempt((current) => current + 1)
  }, [])

  useEffect(() => {
    const controller = new AbortController()
    let active = true

    getUser(controller.signal)
      .then((data: GitHubUser): void => {
        if (!active) {
          return
        }

        setProfile(data)
        setLoading(false)
      })
      .catch((cause: unknown): void => {
        if (controller.signal.aborted || axios.isCancel(cause) || !active) {
          return
        }

        setError(mapApiError(cause))
        setLoading(false)
      })

    return (): void => {
      active = false
      controller.abort()
    }
  }, [attempt])

  return { profile, loading, error, reload }
}
