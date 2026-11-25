export function ProfileCardSkeleton() {
  return (
    <section
      role="status"
      aria-label="Carregando perfil"
      className="relative -mt-10 rounded-lg border border-base-border bg-base-profile p-6"
    >
      <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
        <div
          aria-hidden="true"
          className="size-24 shrink-0 animate-pulse rounded-lg bg-base-border sm:size-32"
        />

        <div aria-hidden="true" className="flex min-w-0 flex-1 flex-col gap-3">
          <div className="h-7 w-48 max-w-full animate-pulse rounded bg-base-border" />
          <div className="h-4 w-28 animate-pulse rounded bg-base-border" />
          <div className="h-4 w-full max-w-md animate-pulse rounded bg-base-border" />
          <div className="h-4 w-2/3 animate-pulse rounded bg-base-border" />
          <div className="mt-2 h-11 w-28 animate-pulse rounded border border-base-border bg-base-border" />
        </div>
      </div>
    </section>
  )
}
