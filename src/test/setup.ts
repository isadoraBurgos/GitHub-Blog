import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterAll, afterEach, beforeAll, beforeEach, vi } from 'vitest'
import { detailLog, requestLog, searchLog, server, setSearchStatus } from './handlers.ts'

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
  searchLog.splice(0, searchLog.length)
  detailLog.splice(0, detailLog.length)
  setSearchStatus(200)
})

afterAll(() => {
  server.close()
  vi.unstubAllGlobals()
})
