import type { BlogError } from '@/types'
import { ErrorState } from './ErrorState.tsx'
import { RateLimitState } from './RateLimitState.tsx'

export interface ErrorFeedbackProps {
  error: BlogError
  onRetry: () => void
}

export function ErrorFeedback({ error, onRetry }: ErrorFeedbackProps) {
  if (error.kind === 'rate-limit') {
    return <RateLimitState message={error.message} />
  }

  return <ErrorState message={error.message} onRetry={onRetry} />
}
