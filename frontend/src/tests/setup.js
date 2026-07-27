import '@testing-library/jest-dom/vitest'
import { afterAll, afterEach, beforeAll } from 'vitest'
import { cleanup } from '@testing-library/react'
import { server } from './server'

// ─── MSW lifecycle ───
// `error` on unhandled requests guarantees no test silently hits the network.
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))
afterEach(() => {
  server.resetHandlers()
  cleanup()
})
afterAll(() => server.close())

// ─── jsdom shims for browser APIs the components use ───

// FadeIn relies on IntersectionObserver; jsdom has none. This stub fires the
// callback immediately as "intersecting" so faded-in content is present for
// queries.
class MockIntersectionObserver {
  constructor(callback) {
    this.callback = callback
  }
  observe(el) {
    this.callback([{ isIntersecting: true, target: el }], this)
  }
  unobserve() {}
  disconnect() {}
}
globalThis.IntersectionObserver = MockIntersectionObserver

// Navigation helpers and ScrollToTop call these; jsdom leaves them undefined
// or unimplemented.
window.scrollTo = () => {}
Element.prototype.scrollIntoView = () => {}

window.matchMedia =
  window.matchMedia ||
  ((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  }))
