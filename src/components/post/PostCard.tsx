import { ArrowLeft, ExternalLink } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'
import type { GitHubIssue } from '@/types'
import { relativeDate } from '@/utils/relativeDate'
import { MarkdownRenderer } from './MarkdownRenderer.tsx'

export interface PostCardProps {
  issue: GitHubIssue
}

const ACTION_CLASS =
  'inline-flex min-h-11 items-center gap-2 rounded border border-base-border px-4 py-2 text-sm font-bold text-blue hover:border-blue focus-visible:ring-2 focus-visible:ring-blue focus-visible:ring-offset-2 focus-visible:ring-offset-base-background'

export function PostCard({ issue }: PostCardProps) {
  const location = useLocation()
  const backTo = location.search ? `/${location.search}` : '/'
  const commentLabel = issue.comments === 1 ? 'comentário' : 'comentários'

  return (
    <article className="rounded-lg border border-base-border bg-base-profile p-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Link to={backTo} className={ACTION_CLASS}>
          <ArrowLeft aria-hidden="true" className="size-4" />
          VOLTAR
        </Link>

        <a
          href={issue.html_url}
          target="_blank"
          rel="noopener noreferrer"
          className={ACTION_CLASS}
        >
          VER NO GITHUB
          <ExternalLink aria-hidden="true" className="size-4" />
        </a>
      </div>

      <h1 className="mt-8 text-2xl font-bold text-base-title">{issue.title}</h1>

      <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-base-span">
        <span>@{issue.user.login}</span>
        <span aria-hidden="true">·</span>
        <time dateTime={issue.created_at}>{relativeDate(issue.created_at)}</time>
        <span aria-hidden="true">·</span>
        <span>
          {issue.comments} {commentLabel}
        </span>
      </div>

      <MarkdownRenderer content={issue.body ?? ''} />
    </article>
  )
}
