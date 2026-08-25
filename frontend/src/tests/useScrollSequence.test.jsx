import { describe, it, expect, afterEach, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useScrollSequence } from '../hooks/useScrollSequence'
import { markProgrammaticScroll, clearProgrammaticScroll } from '../utils/programmaticScroll'

const VIEWPORT = 900
const SECTION_HEIGHT = 2880 // 320vh
const SECTION_TOP = 900 // document offset of the pinning container
const TOTAL = SECTION_HEIGHT - VIEWPORT // scrollable travel: 1980

/**
 * Stands in for the browser: a manually driven frame clock, a settable scroll
 * position, and a container whose rect follows that position.
 */
function setup() {
  let y = 0
  let now = 0
  let queue = []

  vi.stubGlobal('requestAnimationFrame', (cb) => queue.push(cb))
  vi.stubGlobal('cancelAnimationFrame', () => {})
  Object.defineProperty(window, 'scrollY', { configurable: true, get: () => y })
  Object.defineProperty(window, 'innerHeight', { configurable: true, value: VIEWPORT })

  const written = []
  window.scrollTo = (arg) => {
    y = typeof arg === 'number' ? arg : arg.top
    written.push(y)
  }

  const el = document.createElement('div')
  Object.defineProperty(el, 'offsetHeight', { value: SECTION_HEIGHT, configurable: true })
  el.getBoundingClientRect = () => ({
    top: SECTION_TOP - y,
    bottom: SECTION_TOP - y + SECTION_HEIGHT,
    height: SECTION_HEIGHT,
  })

  return {
    ref: { current: el },
    written,
    getY: () => y,
    /** Runs the frames the hook has queued. */
    frames(count = 1, dt = 16) {
      for (let i = 0; i < count; i++) {
        now += dt
        const pending = queue
        queue = []
        act(() => pending.forEach((cb) => cb(now)))
      }
    },
    /** The user moves the page. */
    scroll(next) {
      y = next
      act(() => window.dispatchEvent(new Event('scroll')))
    },
    /** Progress for a given scroll position, as the hook computes it. */
    progressAt: (at) => (at - SECTION_TOP) / TOTAL,
  }
}

afterEach(() => {
  clearProgrammaticScroll()
  vi.unstubAllGlobals()
  delete window.scrollY
  delete window.innerHeight
})

describe('useScrollSequence', () => {
  it('adopts the position already on screen without moving the page', () => {
    const h = setup()
    h.scroll(SECTION_TOP + TOTAL * 0.4)
    const { result } = renderHook(() => useScrollSequence(h.ref))
    h.frames(1)
    expect(result.current).toBeCloseTo(0.4, 5)
    expect(h.written).toHaveLength(0)
  })

  it('follows the scroll rather than snapping to it', () => {
    const h = setup()
    const { result } = renderHook(() => useScrollSequence(h.ref))
    h.frames(1)
    expect(result.current).toBe(0)

    // An unhurried nudge, comfortably inside the takeover threshold.
    const nudge = SECTION_TOP + 200
    const target = h.progressAt(nudge)
    h.scroll(nudge)
    h.frames(1)
    // One frame closes only part of the gap — that lag is the smoothing.
    expect(result.current).toBeGreaterThan(0)
    expect(result.current).toBeLessThan(target / 2)

    const afterOne = result.current
    h.frames(1)
    expect(result.current).toBeGreaterThan(afterOne)
  })

  it('converges on the target without touching the scroll position', () => {
    const h = setup()
    const { result } = renderHook(() => useScrollSequence(h.ref))
    h.frames(1)
    const at = SECTION_TOP + 200
    h.scroll(at)
    h.frames(60)
    expect(result.current).toBeCloseTo(h.progressAt(at), 6)
    expect(h.written).toHaveLength(0)
  })

  it('lets unhurried scrolling through untouched', () => {
    const h = setup()
    const { result } = renderHook(() => useScrollSequence(h.ref))
    h.frames(1)
    // Walk the whole section a wheel notch at a time.
    for (let at = SECTION_TOP; at <= SECTION_TOP + TOTAL; at += 120) {
      h.scroll(at)
      h.frames(6)
    }
    h.scroll(SECTION_TOP + TOTAL)
    h.frames(60)
    expect(h.written).toHaveLength(0)
    expect(result.current).toBe(1)
  })

  it('takes the scroll over when a flick outruns the animation', () => {
    const h = setup()
    const { result } = renderHook(() => useScrollSequence(h.ref))
    h.frames(1)

    // Flick clean past the section, to the far side of the document.
    h.scroll(SECTION_TOP + TOTAL + 3000)
    h.frames(1)

    // The page is pulled back inside the section and the sequence starts.
    expect(h.written.length).toBeGreaterThan(0)
    expect(h.getY()).toBeLessThan(SECTION_TOP + TOTAL)
    expect(h.getY()).toBeGreaterThanOrEqual(SECTION_TOP)
    expect(result.current).toBeLessThan(0.1)
  })

  it('meters the takeover out instead of jumping to the end', () => {
    const h = setup()
    const { result } = renderHook(() => useScrollSequence(h.ref))
    h.frames(1)
    h.scroll(SECTION_TOP + TOTAL + 3000)

    // 100 frames at 16ms is 1.6s: about half of the 3.2s floor.
    h.frames(100)
    expect(result.current).toBeGreaterThan(0.3)
    expect(result.current).toBeLessThan(0.7)

    h.frames(120)
    expect(result.current).toBe(1)
    // Released exactly at the end of the section.
    expect(h.getY()).toBe(SECTION_TOP + TOTAL)
  })

  it('keeps the scroll position in step with the animation while it plays', () => {
    const h = setup()
    const { result } = renderHook(() => useScrollSequence(h.ref))
    h.frames(1)
    h.scroll(SECTION_TOP + TOTAL + 3000)
    h.frames(60)
    expect(h.progressAt(h.getY())).toBeCloseTo(result.current, 5)
  })

  it('hands control back the moment the user scrolls up', () => {
    const h = setup()
    const { result } = renderHook(() => useScrollSequence(h.ref))
    h.frames(1)
    h.scroll(SECTION_TOP + TOTAL + 3000)
    h.frames(40)
    const during = result.current
    expect(during).toBeGreaterThan(0)
    expect(during).toBeLessThan(1)

    h.scroll(h.getY() - 300)
    const writes = h.written.length
    h.frames(40)
    // The sequence stopped driving the page.
    expect(h.written).toHaveLength(writes)
  })

  it('never intercepts again once the sequence has played through', () => {
    const h = setup()
    const { result } = renderHook(() => useScrollSequence(h.ref))
    h.frames(1)

    h.scroll(SECTION_TOP + TOTAL)
    h.frames(240)
    expect(result.current).toBe(1)

    // Back to the top, then a second flick past the section.
    h.scroll(0)
    h.frames(60)
    const writes = h.written.length
    h.scroll(SECTION_TOP + TOTAL + 3000)
    h.frames(60)
    expect(h.written).toHaveLength(writes)
    expect(h.getY()).toBe(SECTION_TOP + TOTAL + 3000)
  })

  it('leaves the scroll completely alone when disabled', () => {
    const h = setup()
    const { result } = renderHook(() => useScrollSequence(h.ref, false))
    h.scroll(SECTION_TOP + TOTAL + 3000)
    h.frames(60)
    expect(result.current).toBe(0)
    expect(h.written).toHaveLength(0)
  })

  it('ignores a container too short to scroll through', () => {
    const h = setup()
    Object.defineProperty(h.ref.current, 'offsetHeight', { value: VIEWPORT, configurable: true })
    const { result } = renderHook(() => useScrollSequence(h.ref))
    h.frames(5)
    expect(result.current).toBe(0)
    expect(h.written).toHaveLength(0)
  })
  it('does not take over an anchor jump the app started', () => {
    const h = setup()
    const { result } = renderHook(() => useScrollSequence(h.ref))
    h.frames(1)

    // Navbar "Contact" from another route: the target section sits below the
    // sequence, so the jump passes clean through it.
    markProgrammaticScroll()
    h.scroll(SECTION_TOP + TOTAL + 4000)
    h.frames(30)

    expect(h.written).toHaveLength(0)
    expect(h.getY()).toBe(SECTION_TOP + TOTAL + 4000)
    expect(result.current).toBe(1)
  })

  it('does not take over on the tail of an anchor jump once the mark lapses', () => {
    const h = setup()
    const { result } = renderHook(() => useScrollSequence(h.ref))
    h.frames(1)

    markProgrammaticScroll()
    h.scroll(SECTION_TOP + TOTAL + 4000)
    h.frames(2)
    clearProgrammaticScroll() // the deadline passes mid-glide

    h.scroll(SECTION_TOP + TOTAL + 4200)
    h.frames(30)

    expect(h.written).toHaveLength(0)
    expect(result.current).toBe(1)
  })

  it('still gates a user flick that follows a marked scroll', () => {
    const h = setup()
    const { result } = renderHook(() => useScrollSequence(h.ref))
    h.frames(1)

    markProgrammaticScroll()
    h.scroll(SECTION_TOP + 40) // an anchor above the sequence: nothing played
    h.frames(2)
    clearProgrammaticScroll()

    h.scroll(SECTION_TOP + TOTAL)
    h.frames(10)

    expect(h.written.length).toBeGreaterThan(0)
    expect(result.current).toBeLessThan(1)
  })
})
