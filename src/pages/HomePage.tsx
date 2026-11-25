import { useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { IssueGrid, IssuesSkeleton, Pagination } from '@/components/issues'
import { ProfileCard, ProfileCardSkeleton } from '@/components/profile'
import { SearchInput } from '@/components/search/SearchInput.tsx'
import { useIssueSearch } from '@/hooks/useIssueSearch.ts'
import { useIssues } from '@/hooks/useIssues.ts'
import { useProfile } from '@/hooks/useProfile.ts'
import type { BlogError, IssuesPage } from '@/types'

interface IssuesSectionProps {
  term: string
  page: number
  search: string
  onSearchChange: (value: string) => void
  onPageChange: (nextPage: number) => void
}

interface IssuesContentProps extends IssuesSectionProps {
  pageData: IssuesPage
  loading: boolean
  error: BlogError | null
  reload: () => void
}

const RETRY_BUTTON_CLASS =
  'mt-3 inline-flex min-h-11 items-center rounded border border-base-border px-4 py-2 text-sm font-bold text-blue hover:border-blue focus-visible:ring-2 focus-visible:ring-blue focus-visible:ring-offset-2 focus-visible:ring-offset-base-background'

function parsePage(value: string | null): number {
  if (!value) {
    return 1
  }

  const parsed = Number(value)
  return Number.isInteger(parsed) && parsed >= 1 ? parsed : 1
}

function ProfileSection() {
  const { profile, loading, error, reload } = useProfile()

  if (loading) {
    return <ProfileCardSkeleton />
  }

  if (error) {
    return (
      <div
        role="alert"
        className="mt-6 rounded-lg border border-base-border bg-base-post p-5 text-sm text-base-text"
      >
        <p>{error.message}</p>
        <button type="button" onClick={reload} className={RETRY_BUTTON_CLASS}>
          Tentar novamente
        </button>
      </div>
    )
  }

  if (!profile) {
    return null
  }

  return <ProfileCard profile={profile} />
}

function IssuesContent({
  term,
  page,
  search,
  onSearchChange,
  onPageChange,
  pageData,
  loading,
  error,
  reload,
}: IssuesContentProps) {
  const { items, total, hasNextPage } = pageData
  const countLabel = total === 1 ? 'publicação' : 'publicações'

  return (
    <section aria-labelledby="publicacoes-titulo" className="mt-10">
      <div className="flex items-center justify-between gap-4">
        <h2 id="publicacoes-titulo" className="text-xl font-bold text-base-title">
          Publicações
        </h2>
        <p aria-live="polite" className="text-sm text-base-span">
          {total} {countLabel}
        </p>
      </div>

      <div className="mt-6">
        <SearchInput value={term} onChange={onSearchChange} />
      </div>

      <div className="mt-6">
        {error ? (
          <div
            role="alert"
            className="rounded-lg border border-base-border bg-base-post p-5 text-sm text-base-text"
          >
            <p>{error.message}</p>
            <button type="button" onClick={reload} className={RETRY_BUTTON_CLASS}>
              Tentar novamente
            </button>
          </div>
        ) : loading ? (
          <IssuesSkeleton />
        ) : (
          <IssueGrid issues={items} search={search} busy={loading} />
        )}
      </div>

      {(hasNextPage || pageData.page > 1) && !error ? (
        <Pagination page={page} hasNextPage={hasNextPage} onPageChange={onPageChange} />
      ) : null}
    </section>
  )
}

function ListIssuesSection({ term, page, search, onSearchChange, onPageChange }: IssuesSectionProps) {
  const { pageData, loading, error, reload } = useIssues(page)

  return (
    <IssuesContent
      term={term}
      page={page}
      search={search}
      onSearchChange={onSearchChange}
      onPageChange={onPageChange}
      pageData={pageData}
      loading={loading}
      error={error}
      reload={reload}
    />
  )
}

function SearchIssuesSection({
  term,
  page,
  search,
  onSearchChange,
  onPageChange,
}: IssuesSectionProps) {
  const { pageData, loading, error, reload } = useIssueSearch(term, page)

  return (
    <IssuesContent
      term={term}
      page={page}
      search={search}
      onSearchChange={onSearchChange}
      onPageChange={onPageChange}
      pageData={pageData}
      loading={loading}
      error={error}
      reload={reload}
    />
  )
}

export default function HomePage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const term = searchParams.get('q') ?? ''
  const page = parsePage(searchParams.get('page'))
  const search = searchParams.toString()

  const handleSearchChange = (value: string): void => {
    const next = new URLSearchParams(searchParams)

    if (value) {
      next.set('q', value)
    } else {
      next.delete('q')
    }
    next.delete('page')
    setSearchParams(next, { replace: true })
  }

  const handlePageChange = (nextPage: number): void => {
    const next = new URLSearchParams(searchParams)

    if (nextPage <= 1) {
      next.delete('page')
    } else {
      next.set('page', String(nextPage))
    }
    setSearchParams(next)
  }

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [term, page])

  return (
    <>
      <ProfileSection />

      {term.trim() ? (
        <SearchIssuesSection
          term={term}
          page={page}
          search={search}
          onSearchChange={handleSearchChange}
          onPageChange={handlePageChange}
        />
      ) : (
        <ListIssuesSection
          term={term}
          page={page}
          search={search}
          onSearchChange={handleSearchChange}
          onPageChange={handlePageChange}
        />
      )}
    </>
  )
}
