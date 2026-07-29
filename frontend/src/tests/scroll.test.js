import { describe, it, expect, vi, afterEach } from 'vitest'
import { getLenis, registerLenis, scrollTo, scrollToTop } from '../lib/scroll'

afterEach(() => vi.restoreAllMocks())

describe('lib/scroll — Lenis registry', () => {
  it('hands the registered instance back, and unregisters on cleanup', () => {
    const lenis = { scrollTo: vi.fn() }
    const unregister = registerLenis(lenis)

    expect(getLenis()).toBe(lenis)
    unregister()
    expect(getLenis()).toBeNull()
  })

  it('does not let a stale unregister clear a newer instance', () => {
    // The failure this guards against: an old provider's cleanup running after
    // a new one has already registered, leaving every scroll un-smoothed.
    const first = { scrollTo: vi.fn() }
    const second = { scrollTo: vi.fn() }

    const unregisterFirst = registerLenis(first)
    const unregisterSecond = registerLenis(second)

    unregisterFirst()
    expect(getLenis()).toBe(second)

    unregisterSecond()
    expect(getLenis()).toBeNull()
  })
})

describe('lib/scroll — routing the scroll', () => {
  it('delegates to Lenis when one is running', () => {
    const lenis = { scrollTo: vi.fn() }
    const unregister = registerLenis(lenis)

    const el = document.createElement('div')
    scrollTo(el, { offset: -80 })
    expect(lenis.scrollTo).toHaveBeenCalledWith(el, { offset: -80, immediate: false })

    scrollToTop({ immediate: true })
    expect(lenis.scrollTo).toHaveBeenLastCalledWith(0, { offset: 0, immediate: true })

    unregister()
  })

  it('falls back to the native API when Lenis is absent', () => {
    const windowSpy = vi.spyOn(window, 'scrollTo').mockImplementation(() => {})
    const elementSpy = vi.spyOn(Element.prototype, 'scrollIntoView').mockImplementation(() => {})

    scrollToTop()
    expect(windowSpy).toHaveBeenCalledWith({ top: 0, behavior: 'smooth' })

    scrollToTop({ immediate: true })
    expect(windowSpy).toHaveBeenLastCalledWith({ top: 0, behavior: 'auto' })

    const el = document.createElement('div')
    scrollTo(el)
    expect(elementSpy).toHaveBeenCalledWith({ behavior: 'smooth', block: 'start' })
  })

  it('accepts a selector, and shrugs off one that matches nothing', () => {
    const elementSpy = vi.spyOn(Element.prototype, 'scrollIntoView').mockImplementation(() => {})

    const el = document.createElement('div')
    el.id = 'target'
    document.body.append(el)

    scrollTo('#target')
    expect(elementSpy).toHaveBeenCalledTimes(1)

    expect(() => scrollTo('#not-here')).not.toThrow()
    expect(elementSpy).toHaveBeenCalledTimes(1)

    el.remove()
  })
})
