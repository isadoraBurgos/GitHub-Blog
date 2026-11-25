import type { GitHubIssue } from '@/types'
import { IssueCard } from './IssueCard.tsx'

export interface IssueGridProps {
  issues: GitHubIssue[]
  search?: string
  busy?: boolean
}

export function IssueGrid({ issues, search, busy = false }: IssueGridProps) {
  return (
    <ul aria-busy={busy} className="grid grid-cols-1 gap-6 md:grid-cols-2">
      {issues.map((issue) => (
        <li key={issue.id} className="min-w-0">
          <IssueCard issue={issue} search={search} />
        </li>
      ))}
    </ul>
  )
}
