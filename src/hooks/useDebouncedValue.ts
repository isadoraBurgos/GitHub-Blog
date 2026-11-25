import { useEffect, useState } from 'react'
import { SEARCH_DEBOUNCE_MS } from '@/config/github.ts'

export function useDebouncedValue<T>(value: T, delay: number = SEARCH_DEBOUNCE_MS): T {
  const [debounced, setDebounced] = useState<T>(value)

  useEffect(() => {
    const timer = setTimeout((): void => {
      setDebounced(value)
    }, delay)

    return (): void => {
      clearTimeout(timer)
    }
  }, [value, delay])

  return debounced
}
