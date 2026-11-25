import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterAll, afterEach, beforeAll, beforeEach, vi } from 'vitest'
import { requestLog, server } from './handlers.ts'

beforeAll(() => {
  server.listen({ onUnhandledFrame: 'error' })
})

beforeEach(() => {
  if (typeof window !== 'undefined') {
    vi.stubGlobal('scrollTo', vi.fn())
  }
})

afterEach(() => {
  if (typeof document !== 'undefined') {
    cleanup()
  }

  requestLog.splice(0, requestLog.length)
})

afterAll(() => {
  server.close()
  vi.unstubAllGlobals()
})
