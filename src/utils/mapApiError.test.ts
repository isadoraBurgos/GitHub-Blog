import { CanceledError } from 'axios'
import { describe, expect, it } from 'vitest'
import { GITHUB_API } from '@/config/github.ts'
import { api } from '@/services/api.ts'
import { mapApiError } from './mapApiError.ts'

function axiosError(status?: number, code?: string): unknown {
  return {
    isAxiosError: true,
    code,
    response: status === undefined ? undefined : { status },
  }
}

describe('configuração do cliente Axios', () => {
  it('usa a API pública sem token', () => {
    expect(api.defaults.baseURL).toBe(GITHUB_API)
    expect(api.defaults.timeout).toBe(10000)
    expect(api.defaults.headers['Accept']).toBe('application/vnd.github+json')
    expect(api.defaults.headers['Authorization']).toBeUndefined()
  })
})

describe('mapApiError', () => {
  it('mapeia 403 e 429 para rate-limit', () => {
    expect(mapApiError(axiosError(403))?.kind).toBe('rate-limit')
    expect(mapApiError(axiosError(429))?.kind).toBe('rate-limit')
  })

  it('mapeia 404 com mensagem conforme o contexto', () => {
    expect(mapApiError(axiosError(404))).toEqual({
      kind: 'not-found',
      message: 'Conteúdo não encontrado.',
    })
    expect(mapApiError(axiosError(404), 'detail')).toEqual({
      kind: 'not-found',
      message: 'Publicação não encontrada.',
    })
  })

  it('mapeia erros de rede e timeout', () => {
    expect(mapApiError(axiosError(undefined, 'ERR_NETWORK'))?.kind).toBe('network')
    expect(mapApiError(axiosError(undefined, 'ECONNABORTED'))?.kind).toBe('network')
  })

  it('mapeia demais falhas para unknown', () => {
    expect(mapApiError(axiosError(500))?.kind).toBe('unknown')
    expect(mapApiError(new Error('falha interna'))?.kind).toBe('unknown')
  })

  it('retorna null para cancelamento via AbortController', () => {
    expect(mapApiError(new CanceledError())).toBeNull()
    expect(mapApiError(axiosError(undefined, 'ERR_CANCELED'))).toBeNull()
  })

  it('nunca expõe token, stack, headers ou JSON bruto', () => {
    const cases = [
      axiosError(403),
      axiosError(404),
      axiosError(500),
      axiosError(undefined, 'ERR_NETWORK'),
      new Error('boom'),
    ]

    for (const error of cases) {
      const message = mapApiError(error)?.message ?? ''
      expect(message).not.toMatch(/ghp_|github_pat_|VITE_GITHUB_TOKEN|Authorization|stack|\{"/i)
    }
  })
})
