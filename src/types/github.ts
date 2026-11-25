/** Espelho dos campos consumidos da GitHub API (TECH_SPEC §4). */

export interface GitHubUser {
  login: string;
  name: string | null;
  avatar_url: string;
  html_url: string;
  bio: string | null;
  company: string | null;
  followers: number;
  public_repos: number;
  created_at: string;
}

export interface GitHubUserSummary {
  login: string;
  avatar_url: string;
  html_url: string;
}

export interface GitHubLabel {
  id: number;
  name: string;
  color: string;
}

export interface GitHubPullRequestRef {
  url: string;
  html_url: string;
  diff_url: string;
  patch_url: string;
  merged_at?: string | null;
}

export interface GitHubIssue {
  id: number;
  number: number;
  title: string;
  body: string | null;
  state: 'open' | 'closed';
  html_url: string;
  created_at: string;
  updated_at: string;
  comments: number;
  user: GitHubUserSummary;
  labels: GitHubLabel[];
  /** Presente quando o item é um Pull Request — RN-01. */
  pull_request?: GitHubPullRequestRef;
}

export interface SearchIssuesResponse {
  total_count: number;
  incomplete_results: boolean;
  items: GitHubIssue[];
}

type UnknownRecord = Record<string, unknown>;

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isUnknownArray(value: unknown): value is unknown[] {
  return Array.isArray(value);
}

function isStringOrNull(value: unknown): value is string | null {
  return value === null || typeof value === 'string';
}

function isGitHubUserSummary(value: unknown): value is GitHubUserSummary {
  return (
    isRecord(value) &&
    typeof value['login'] === 'string' &&
    typeof value['avatar_url'] === 'string' &&
    typeof value['html_url'] === 'string'
  );
}

function isGitHubLabel(value: unknown): value is GitHubLabel {
  return (
    isRecord(value) &&
    typeof value['id'] === 'number' &&
    typeof value['name'] === 'string' &&
    typeof value['color'] === 'string'
  );
}

function isGitHubPullRequestRef(value: unknown): value is GitHubPullRequestRef {
  return (
    isRecord(value) &&
    typeof value['url'] === 'string' &&
    typeof value['html_url'] === 'string' &&
    typeof value['diff_url'] === 'string' &&
    typeof value['patch_url'] === 'string' &&
    (value['merged_at'] === undefined || isStringOrNull(value['merged_at']))
  );
}

/** Valida o payload de `/users/{username}` na fronteira `unknown`. */
export function isGitHubUser(value: unknown): value is GitHubUser {
  return (
    isRecord(value) &&
    typeof value['login'] === 'string' &&
    isStringOrNull(value['name']) &&
    typeof value['avatar_url'] === 'string' &&
    typeof value['html_url'] === 'string' &&
    isStringOrNull(value['bio']) &&
    isStringOrNull(value['company']) &&
    typeof value['followers'] === 'number' &&
    typeof value['public_repos'] === 'number' &&
    typeof value['created_at'] === 'string'
  );
}

/** Valida na fronteira `unknown` antes de converter qualquer dado externo. */
export function isGitHubIssue(value: unknown): value is GitHubIssue {
  if (!isRecord(value)) {
    return false;
  }

  const labels: unknown = value['labels'];
  const pullRequest: unknown = value['pull_request'];

  return (
    typeof value['id'] === 'number' &&
    typeof value['number'] === 'number' &&
    typeof value['title'] === 'string' &&
    isStringOrNull(value['body']) &&
    (value['state'] === 'open' || value['state'] === 'closed') &&
    typeof value['html_url'] === 'string' &&
    typeof value['created_at'] === 'string' &&
    typeof value['updated_at'] === 'string' &&
    typeof value['comments'] === 'number' &&
    isGitHubUserSummary(value['user']) &&
    isUnknownArray(labels) &&
    labels.every(isGitHubLabel) &&
    (pullRequest === undefined || isGitHubPullRequestRef(pullRequest))
  );
}

/** Valida a resposta da Search API sem confiar no tipo do Axios. */
export function isSearchIssuesResponse(value: unknown): value is SearchIssuesResponse {
  if (!isRecord(value)) {
    return false;
  }

  const items: unknown = value['items'];

  return (
    typeof value['total_count'] === 'number' &&
    typeof value['incomplete_results'] === 'boolean' &&
    isUnknownArray(items) &&
    items.every(isGitHubIssue)
  );
}
