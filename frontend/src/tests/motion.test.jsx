/**
 * The motion layer.
 *
 * The rest of the suite runs with `prefers-reduced-motion: reduce` so the DOM
 * under test is a settled one (see ./media). These tests deliberately turn
 * motion back on, which is the only way the ScrollTrigger timelines and the
 * container journey get exercised at all — and the only way a leaked trigger
 * or a missing cleanup would ever be caught.
 */
import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, renderHook, act } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import ContainerJourney from '../components/ContainerJourney'
import Home from '../pages/Home'
import { ScrollTrigger } from '../lib/gsap'
import { prefersReducedMotion, useReducedMotion } from '../hooks/useReducedMotion'
import { useDesktopMotion, useMediaQuery } from '../hooks/useMediaQuery'
import { enableMotion, setMedia } from './media'

afterEach(() => {
  vi.restoreAllMocks()
  ScrollTrigger.getAll().forEach((trigger) => trigger.kill())
})

describe('useReducedMotion', () => {
  it('reports the preference', () => {
    expect(prefersReducedMotion()).toBe(true)
    expect(renderHook(() => useReducedMotion()).result.current).toBe(true)

    enableMotion()
    expect(prefersReducedMotion()).toBe(false)
    expect(renderHook(() => useReducedMotion()).result.current).toBe(false)
  })

  it('assumes motion is fine when matchMedia is unavailable', () => {
    const original = window.matchMedia
    // Some embedded webviews genuinely have no matchMedia; the CSS media query
    // still covers the declarative animations, so this must not throw.
    window.matchMedia = undefined
    expect(prefersReducedMotion()).toBe(false)
    expect(renderHook(() => useReducedMotion()).result.current).toBe(false)
    window.matchMedia = original
  })
})

describe('useMediaQuery / useDesktopMotion', () => {
  it('runs the journey only on a wide viewport with motion allowed', () => {
    expect(renderHook(() => useDesktopMotion()).result.current).toBe(false)

    setMedia({ '(min-width: 768px)': true })
    // Wide, but reduced motion is still on.
    expect(renderHook(() => useDesktopMotion()).result.current).toBe(false)

    enableMotion()
    expect(renderHook(() => useMediaQuery('(min-width: 768px)')).result.current).toBe(true)
    expect(renderHook(() => useDesktopMotion()).result.current).toBe(true)
  })
})

describe('ContainerJourney', () => {
  it('renders nothing when the journey is inactive', () => {
    const { container } = render(<ContainerJourney />)
    expect(container).toBeEmptyDOMElement()
  })

  it('renders a hidden fixed layer when active, and hides it when unmeasurable', async () => {
    enableMotion()
    const { container, unmount } = render(<ContainerJourney />)

    const layer = container.querySelector('[aria-hidden="true"]')
    expect(layer).toBeInTheDocument()

    // jsdom has no SVG path geometry, so `measure()` bails and the container
    // stays hidden rather than being parked in the corner of the viewport.
    await act(async () => {
      await new Promise((resolve) => requestAnimationFrame(resolve))
    })
    expect(layer.firstChild).toHaveStyle({ visibility: 'hidden' })

    expect(() => unmount()).not.toThrow()
  })
})

describe('ContainerJourney measurement', () => {
  /**
   * jsdom reports every element as 0×0 and implements no SVG path geometry,
   * so the journey normally bails out. Faking just enough of both lets the
   * waypoint maths — the part with all the coordinate-space conversion in it
   * — actually run.
   */
  function fakeLayout() {
    vi.spyOn(Element.prototype, 'getBoundingClientRect').mockImplementation(function fake() {
      if (this.id === 'hero-container-slot') {
        return { left: 100, top: 200, width: 600, height: 310, right: 700, bottom: 510 }
      }
      if (this.id === 'trade-route-map') {
        return { left: 130, top: 900, width: 1100, height: 410, right: 1230, bottom: 1310 }
      }
      return { left: 0, top: 800, width: 1200, height: 800, right: 1200, bottom: 1600 }
    })

    // jsdom does not implement SVG path geometry at all, so these have to be
    // defined rather than spied on. A straight 1000-unit path stands in for
    // the Kochi → Dubai → London corridor.
    SVGElement.prototype.getTotalLength = () => 1000
    SVGElement.prototype.getPointAtLength = (len) => ({
      x: 783 - (len / 1000) * 233,
      y: 208 - (len / 1000) * 127,
    })
    return () => {
      delete SVGElement.prototype.getTotalLength
      delete SVGElement.prototype.getPointAtLength
    }
  }

  it('places the container on the hero slot and samples the route', async () => {
    enableMotion()
    const restoreGeometry = fakeLayout()

    const { container } = render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>,
    )

    await act(async () => {
      await new Promise((resolve) => requestAnimationFrame(resolve))
    })

    const craft = container.querySelector('[data-craft]')
    expect(craft).toBeInTheDocument()
    // measure() succeeded, so the layer is revealed (GSAP's autoAlpha writes
    // "inherit", not "visible") and sized to the hero slot.
    expect(craft.style.visibility).not.toBe('hidden')
    expect(craft.style.width).toBe('600px')
    // Centred on the slot: left 100 + half of 600.
    expect(craft.style.transform).toContain('translate(400px')

    restoreGeometry()
  })
})

describe('Home with motion enabled', () => {
  it('builds and tears down its timelines without leaking triggers', () => {
    enableMotion()
    const before = ScrollTrigger.getAll().length

    const { unmount } = render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>,
    )

    // The hero parallax and the pinned trade-route map both register triggers.
    expect(ScrollTrigger.getAll().length).toBeGreaterThan(before)
    expect(document.querySelector('h1')).toHaveTextContent(/meets opportunity/)

    unmount()
    expect(ScrollTrigger.getAll().length).toBe(before)
  })
})
