import '@testing-library/jest-dom/vitest'
import { afterAll, afterEach, beforeAll } from 'vitest'
import { cleanup } from '@testing-library/react'
import { server } from './server'
import { installMatchMedia, resetMedia } from './media'

// ─── MSW lifecycle ───
// `error` on unhandled requests guarantees no test silently hits the network.
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))
afterEach(() => {
  server.resetHandlers()
  cleanup()
  resetMedia()
})
afterAll(() => server.close())

// ─── jsdom shims for browser APIs the components use ───

// The navbar's scroll-spy relies on IntersectionObserver; jsdom has none. This
// stub fires the callback immediately as "intersecting" so observed content is
// treated as visible.
class MockIntersectionObserver {
  constructor(callback) {
    this.callback = callback
  }
  observe(el) {
    this.callback([{ isIntersecting: true, target: el, intersectionRatio: 1 }], this)
  }
  unobserve() {}
  disconnect() {}
}
globalThis.IntersectionObserver = MockIntersectionObserver

// GSAP's ScrollTrigger reaches for ResizeObserver when motion is enabled.
class MockResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}
globalThis.ResizeObserver = globalThis.ResizeObserver ?? MockResizeObserver

// Navigation helpers and ScrollToTop call these; jsdom leaves them undefined
// or unimplemented.
window.scrollTo = () => {}
Element.prototype.scrollIntoView = () => {}

// See ./media — the suite runs reduced-motion on a narrow viewport by default,
// so the DOM under test is the final rendered state rather than a frame of an
// in-flight tween.
installMatchMedia()
