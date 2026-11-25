import { Link } from 'react-router-dom'
import type { GitHubIssue } from '@/types'
import { excerpt } from '@/utils/excerpt'
import { relativeDate } from '@/utils/relativeDate'

export interface IssueCardProps {
  issue: GitHubIssue
  search?: string
}

export function IssueCard({ issue, search }: IssueCardProps) {
  const suffix = search ? `?${search}` : ''

  return (
    <Link
      to={`/post/${issue.number}${suffix}`}
      className="block h-full rounded-lg border border-base-border bg-base-post p-5 transition-colors hover:border-base-label focus-visible:ring-2 focus-visible:ring-blue focus-visible:ring-offset-2 focus-visible:ring-offset-base-background"
    >
      <article>
        <div className="flex items-start justify-between gap-4">
          <h3 className="text-xl font-bold text-base-title">{issue.title}</h3>
          <time dateTime={issue.created_at} className="shrink-0 text-xs text-base-span">
            {relativeDate(issue.created_at)}
          </time>
        </div>
        <p className="mt-3 text-sm text-base-text">{excerpt(issue.body)}</p>
      </article>
    </Link>
  )
}
