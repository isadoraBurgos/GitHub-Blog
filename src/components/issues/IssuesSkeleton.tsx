import { PER_PAGE } from '@/config/github.ts'

export function IssuesSkeleton() {
  return (
    <section role="status" aria-label="Carregando publicações" aria-busy="true">
      <ul className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {Array.from({ length: PER_PAGE }, (_, index) => (
          <li
            key={index}
            aria-hidden="true"
            className="rounded-lg border border-base-border bg-base-post p-5"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="h-6 w-2/3 animate-pulse rounded bg-base-border" />
              <div className="h-4 w-20 shrink-0 animate-pulse rounded bg-base-border" />
            </div>
            <div className="mt-3 h-4 w-full animate-pulse rounded bg-base-border" />
            <div className="mt-2 h-4 w-4/5 animate-pulse rounded bg-base-border" />
          </li>
        ))}
      </ul>
    </section>
  )
}
