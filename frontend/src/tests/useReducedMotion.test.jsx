import { describe, it, expect, afterEach, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useReducedMotion } from '../hooks/useReducedMotion'

const original = window.matchMedia

/** Stands in for matchMedia so the preference can be flipped mid-test. */
function mockMatchMedia(matches) {
  const listeners = new Set()
  window.matchMedia = vi.fn(() => ({
    get matches() {
      return matches
    },
    addEventListener: (_, fn) => listeners.add(fn),
    removeEventListener: (_, fn) => listeners.delete(fn),
  }))
  return {
    set(next) {
      matches = next
      listeners.forEach((fn) => fn({ matches: next }))
    },
    get listenerCount() {
      return listeners.size
    },
  }
}

afterEach(() => {
  window.matchMedia = original
})

describe('useReducedMotion', () => {
  it('reports the preference at mount', () => {
    mockMatchMedia(true)
    expect(renderHook(() => useReducedMotion()).result.current).toBe(true)

    mockMatchMedia(false)
    expect(renderHook(() => useReducedMotion()).result.current).toBe(false)
  })

  it('follows the preference changing while the page is open', () => {
    const media = mockMatchMedia(false)
    const { result } = renderHook(() => useReducedMotion())
    expect(result.current).toBe(false)

    act(() => media.set(true))
    expect(result.current).toBe(true)

    act(() => media.set(false))
    expect(result.current).toBe(false)
  })

  it('stops listening once unmounted', () => {
    const media = mockMatchMedia(false)
    const { unmount } = renderHook(() => useReducedMotion())
    expect(media.listenerCount).toBe(1)
    unmount()
    expect(media.listenerCount).toBe(0)
  })

  it('assumes full motion where matchMedia is unavailable', () => {
    window.matchMedia = undefined
    expect(renderHook(() => useReducedMotion()).result.current).toBe(false)
  })
})
