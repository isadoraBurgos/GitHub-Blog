export interface RateLimitStateProps {
  message: string
}

export function RateLimitState({ message }: RateLimitStateProps) {
  return (
    <div
      role="alert"
      className="rounded-lg border border-base-border bg-base-post p-5 text-sm text-base-text"
    >
      <p>{message}</p>
    </div>
  )
}
