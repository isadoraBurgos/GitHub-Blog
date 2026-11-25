import { useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ErrorFeedback, LoadingState } from '@/components/feedback'
import { PostCard } from '@/components/post'
import { useIssueDetail } from '@/hooks/useIssueDetail.ts'

const LINK_CLASS =
  'inline-flex min-h-11 items-center rounded border border-base-border px-4 py-2 text-sm font-bold text-blue hover:border-blue focus-visible:ring-2 focus-visible:ring-blue focus-visible:ring-offset-2 focus-visible:ring-offset-base-background'

function parseNumber(value: string | undefined): number {
  if (!value) {
    return -1
  }

  const parsed = Number(value)
  return Number.isInteger(parsed) && parsed >= 1 ? parsed : -1
}

export default function PostPage() {
  const { number } = useParams<{ number: string }>()
  const issueNumber = parseNumber(number)
  const { issue, loading, error, reload } = useIssueDetail(issueNumber)

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [issueNumber])

  useEffect(() => {
    document.title = issue ? `${issue.title} — GitHub Blog` : 'GitHub Blog'

    return (): void => {
      document.title = 'GitHub Blog'
    }
  }, [issue])

  if (loading) {
    return (
      <div className="mt-10">
        <LoadingState label="Carregando publicação…" />
      </div>
    )
  }

  if (error) {
    if (error.kind === 'not-found') {
      return (
        <section className="mt-10 rounded-lg border border-base-border bg-base-profile p-6">
          <h1 className="text-2xl font-bold text-base-title">{error.message}</h1>
          <p className="mt-3 text-sm text-base-text">
            O endereço pode ter mudado ou a publicação não existe mais.
          </p>
          <Link to="/" className={`mt-6 ${LINK_CLASS}`}>
            Voltar à Home
          </Link>
        </section>
      )
    }

    return (
      <div className="mt-10">
        <ErrorFeedback error={error} onRetry={reload} />
      </div>
    )
  }

  if (!issue) {
    return null
  }

  return (
    <div className="mt-10">
      <PostCard issue={issue} />
    </div>
  )
}
