import { describe, expect, it } from 'vitest'
import { relativeDate } from './relativeDate.ts'

const now = new Date('2026-11-25T12:00:00.000Z')

describe('relativeDate', () => {
  it('gera "há 2 dias"', () => {
    expect(relativeDate('2026-11-23T12:00:00.000Z', now)).toBe('há 2 dias')
  })

  it('gera "há 1 hora"', () => {
    expect(relativeDate('2026-11-25T11:00:00.000Z', now)).toBe('há 1 hora')
  })

  it('gera "há 3 meses"', () => {
    expect(relativeDate('2026-08-26T12:00:00.000Z', now)).toBe('há 3 meses')
  })

  it('usa data absoluta em pt-BR para datas muito antigas', () => {
    expect(relativeDate('2020-01-01T00:00:00.000Z', now)).toBe('01/01/2020')
  })

  it('tem fallback pt-BR para data inválida', () => {
    expect(relativeDate('não é data', now)).toBe('Data indisponível')
  })
})
