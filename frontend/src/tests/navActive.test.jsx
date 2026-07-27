import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render, screen, act } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import Navbar from '../components/Navbar'
import { renderWithProviders } from './renderWithProviders'

const GOLD = '#C8963E'

// A controllable IntersectionObserver: it records the callback so a test can
// drive visibility changes deterministically.
let observers = []
class MockIntersectionObserver {
  constructor(cb) {
    this.cb = cb
    this.elements = []
    observers.push(this)
  }
  observe(el) { this.elements.push(el) }
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
    expect(screen.getByRole('link', { name: 'About' })).not.toHaveStyle({ color: GOLD })
    expect(screen.getByRole('link', { name: 'Contact' })).not.toHaveStyle({ color: GOLD })
    // The real route link is the only active one.
    expect(screen.getByRole('link', { name: 'Quote' })).toHaveStyle({ color: GOLD })
  })

  it('marks Specialisations active on nested specialisation routes', () => {
    renderWithProviders(<Navbar />, { route: '/specialisations/ethnic-food' })
    expect(screen.getByRole('link', { name: 'Specialisations' })).toHaveStyle({ color: GOLD })
    expect(screen.getByRole('link', { name: 'Quote' })).not.toHaveStyle({ color: GOLD })
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

    expect(screen.getByRole('link', { name: 'Home' })).toHaveStyle({ color: GOLD })
    expect(screen.getByRole('link', { name: 'About' })).not.toHaveStyle({ color: GOLD })
  })

  it('highlights About once its section is most in view', () => {
    renderWithSections('/')
    emit({ home: 0, about: 0.8, contact: 0 })

    expect(screen.getByRole('link', { name: 'About' })).toHaveStyle({ color: GOLD })
    expect(screen.getByRole('link', { name: 'Home' })).not.toHaveStyle({ color: GOLD })
    expect(screen.getByRole('link', { name: 'Contact' })).not.toHaveStyle({ color: GOLD })
  })

  it('highlights Contact when it is most in view at the bottom', () => {
    renderWithSections('/')
    // The final section is only partially visible, but it is the most-visible
    // tracked section — the case a top-of-viewport marker could never catch.
    emit({ home: 0, about: 0, contact: 0.4 })

    expect(screen.getByRole('link', { name: 'Contact' })).toHaveStyle({ color: GOLD })
    expect(screen.getByRole('link', { name: 'About' })).not.toHaveStyle({ color: GOLD })
  })

  it('keeps the last section active across an untracked gap (nothing in view)', () => {
    renderWithSections('/')
    emit({ home: 0, about: 0.7, contact: 0 }) // About in view
    emit({ home: 0, about: 0, contact: 0 })   // scrolled into an untracked region

    // About stays lit rather than blanking out.
    expect(screen.getByRole('link', { name: 'About' })).toHaveStyle({ color: GOLD })
  })
})
