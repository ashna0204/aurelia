import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render, screen, act, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import Navbar from '../components/Navbar'
import { renderWithProviders } from './renderWithProviders'

/**
 * The active state is asserted through `aria-current="page"` rather than a
 * colour. That is the contract the component actually promises — the filled
 * pill is one presentation of it — and it does not need rewriting the next
 * time the palette moves.
 */
const isActive = (element) => element.getAttribute('aria-current') === 'page'

function link(name) {
  const [desktopNav] = screen.getAllByRole('navigation', { name: 'Primary' })
  return within(desktopNav).getByRole('link', { name })
}

// A controllable IntersectionObserver: it records the callback so a test can
// drive visibility changes deterministically.
let observers = []
class MockIntersectionObserver {
  constructor(cb) {
    this.cb = cb
    this.elements = []
    observers.push(this)
  }
  observe(el) {
    this.elements.push(el)
  }
  unobserve() {}
  disconnect() {}
}

/** Emit intersection ratios (0..1) per section id to the latest observer. */
function emit(ratios) {
  const io = observers[observers.length - 1]
  const entries = Object.entries(ratios).map(([id, ratio]) => ({
    target: document.getElementById(id),
    isIntersecting: ratio > 0,
    intersectionRatio: ratio,
  }))
  act(() => io.cb(entries, io))
}

function renderWithSections(route = '/') {
  return render(
    <MemoryRouter initialEntries={[route]}>
      <Navbar />
      <div id="home" />
      <div id="about" />
      <div id="contact" />
    </MemoryRouter>,
  )
}

describe('Navbar active state — regression', () => {
  it('does not mark About or Contact active on a non-home route', () => {
    renderWithProviders(<Navbar />, { route: '/quote' })

    // The old bug: startsWith("/") lit these on every page.
    expect(isActive(link('About'))).toBe(false)
    expect(isActive(link('Contact'))).toBe(false)
    // The real route link is the only active one.
    expect(isActive(link('Request Quote'))).toBe(true)
  })

  it('marks Specialisations active on nested specialisation routes', () => {
    renderWithProviders(<Navbar />, { route: '/specialisations/ethnic-food' })
    expect(isActive(link('Specialisations'))).toBe(true)
    expect(isActive(link('Request Quote'))).toBe(false)
  })
})

describe('Navbar scroll-spy on the home page', () => {
  beforeEach(() => {
    observers = []
    vi.stubGlobal('IntersectionObserver', MockIntersectionObserver)
  })
  afterEach(() => vi.unstubAllGlobals())

  it('highlights Home when the top section is most in view', () => {
    renderWithSections('/')
    emit({ home: 1, about: 0, contact: 0 })

    expect(isActive(link('Home'))).toBe(true)
    expect(isActive(link('About'))).toBe(false)
  })

  it('highlights About once its section is most in view', () => {
    renderWithSections('/')
    emit({ home: 0, about: 0.8, contact: 0 })

    expect(isActive(link('About'))).toBe(true)
    expect(isActive(link('Home'))).toBe(false)
    expect(isActive(link('Contact'))).toBe(false)
  })

  it('highlights Contact when it is most in view at the bottom', () => {
    renderWithSections('/')
    // The final section is only partially visible, but it is the most-visible
    // tracked section — the case a top-of-viewport marker could never catch.
    emit({ home: 0, about: 0, contact: 0.4 })

    expect(isActive(link('Contact'))).toBe(true)
    expect(isActive(link('About'))).toBe(false)
  })

  it('keeps the last section active across an untracked gap (nothing in view)', () => {
    renderWithSections('/')
    emit({ home: 0, about: 0.7, contact: 0 }) // About in view
    emit({ home: 0, about: 0, contact: 0 }) // scrolled into an untracked region

    // About stays lit rather than blanking out.
    expect(isActive(link('About'))).toBe(true)
  })
})
