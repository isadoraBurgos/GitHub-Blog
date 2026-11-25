import { describe, expect, it } from 'vitest'
import { excerpt } from './excerpt.ts'

describe('excerpt', () => {
  it('retorna string vazia para corpo nulo', () => {
    expect(excerpt(null)).toBe('')
  })

  it('remove marcadores e links Markdown', () => {
    expect(excerpt('## Título\n\nUm [link](https://example.com) e `código`.')).toBe(
      'Título Um link e código.',
    )
  })

  it('trunca no limite com reticências', () => {
    expect(excerpt('a'.repeat(200), 20)).toBe(`${'a'.repeat(20)}…`)
  })

  it('trunca em limite de palavra', () => {
    expect(excerpt('uma frase longa para o card', 12)).toBe('uma frase…')
  })
})
