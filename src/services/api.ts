import axios from 'axios'
import { GITHUB_API } from '@/config/github.ts'

/**
 * Cliente único para a API pública do GitHub.
 * Nunca adicionar header Authorization: a aplicação não autentica (RN-09).
 */
export const api = axios.create({
  baseURL: GITHUB_API,
  timeout: 10000,
  headers: {
    Accept: 'application/vnd.github+json',
  },
})
