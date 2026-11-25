import axios from 'axios'
import type { BlogError } from '@/types'

const RATE_LIMIT_MESSAGE =
  'Limite da API do GitHub atingido. Aguarde alguns minutos e tente novamente.'
const NOT_FOUND_MESSAGE = 'Conteúdo não encontrado.'
const DETAIL_NOT_FOUND_MESSAGE = 'Publicação não encontrada.'
const NETWORK_MESSAGE = 'Não foi possível carregar o conteúdo. Verifique sua conexão.'
const UNKNOWN_MESSAGE = 'Algo deu errado. Tente novamente em instantes.'

type ErrorContext = 'default' | 'detail'

function hasCode(error: unknown, code: string): boolean {
  return typeof error === 'object' && error !== null && 'code' in error && error.code === code
}

/** Erro 404 amigável, também usado quando o número da URL é inválido. */
export function notFoundBlogError(context: ErrorContext = 'default'): BlogError {
  return {
    kind: 'not-found',
    message: context === 'detail' ? DETAIL_NOT_FOUND_MESSAGE : NOT_FOUND_MESSAGE,
  }
}

/**
 * Converte qualquer falha em mensagem amigável (RN-06/RN-08).
 * Retorna `null` para cancelamento via AbortController — não é erro para o usuário (RN-05).
 * Nunca inspeciona `error.response.config`, headers ou corpo bruto.
 */
export function mapApiError(error: unknown, context: ErrorContext = 'default'): BlogError | null {
  if (axios.isCancel(error) || hasCode(error, 'ERR_CANCELED')) {
    return null
  }

  if (axios.isAxiosError(error)) {
    const status = error.response?.status

    if (status === 403 || status === 429) {
      return { kind: 'rate-limit', message: RATE_LIMIT_MESSAGE }
    }

    if (status === 404) {
      return notFoundBlogError(context)
    }

    if (
      error.code === 'ERR_NETWORK' ||
      error.code === 'ECONNABORTED' ||
      error.response === undefined
    ) {
      return { kind: 'network', message: NETWORK_MESSAGE }
    }

    return { kind: 'unknown', message: UNKNOWN_MESSAGE }
  }

  return { kind: 'unknown', message: UNKNOWN_MESSAGE }
}
