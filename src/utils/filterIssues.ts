import type { GitHubIssue } from '@/types'

/** Remove Pull Requests que vieram do endpoint de issues (RN-01). */
export function filterIssues(issues: readonly GitHubIssue[]): GitHubIssue[] {
  return issues.filter((issue) => issue.pull_request === undefined);
}
