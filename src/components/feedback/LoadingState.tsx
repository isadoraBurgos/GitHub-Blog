export interface LoadingStateProps {
  label: string
}

export function LoadingState({ label }: LoadingStateProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="rounded-lg border border-base-border bg-base-profile p-6 text-sm text-base-text"
    >
      {label}
    </div>
  )
}
