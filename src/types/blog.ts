import type { GitHubIssue } from './github.ts'

/** Resultado de uma página da Home — paginação server-side (RN-03). */
export interface IssuesPage {
  items: GitHubIssue[];
  total: number;
  page: number;
  hasNextPage: boolean;
}

export type BlogErrorKind = 'rate-limit' | 'not-found' | 'network' | 'unknown';

/** Erro amigável exibido na UI — sem stack, headers ou token (RN-06/RN-08). */
export interface BlogError {
  kind: BlogErrorKind;
  message: string;
}
