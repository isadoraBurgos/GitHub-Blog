// @vitest-environment jsdom
import { act, renderHook } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { useDebouncedValue } from './useDebouncedValue.ts'

afterEach(() => {
  vi.useRealTimers()
})

describe('useDebouncedValue', () => {
  it('retorna o valor inicial sem atraso', () => {
    const { result } = renderHook(() => useDebouncedValue('inicial', 500))

    expect(result.current).toBe('inicial')
  })

  it('não atualiza em 499ms e atualiza em 500ms', () => {
    vi.useFakeTimers()
    const { result, rerender } = renderHook(({ value }) => useDebouncedValue(value, 500), {
      initialProps: { value: '' },
    })

    rerender({ value: 'a' })
    act(() => {
      vi.advanceTimersByTime(499)
    })
    expect(result.current).toBe('')

    act(() => {
      vi.advanceTimersByTime(1)
    })
    expect(result.current).toBe('a')
  })

  it('reinicia o timer a cada nova digitação', () => {
    vi.useFakeTimers()
    const { result, rerender } = renderHook(({ value }) => useDebouncedValue(value, 500), {
      initialProps: { value: '' },
    })

    rerender({ value: 'a' })
    act(() => {
      vi.advanceTimersByTime(300)
    })
    rerender({ value: 'ab' })
    act(() => {
      vi.advanceTimersByTime(300)
    })
    expect(result.current).toBe('')

    act(() => {
      vi.advanceTimersByTime(200)
    })
    expect(result.current).toBe('ab')
  })
})
