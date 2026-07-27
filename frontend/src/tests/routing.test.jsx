import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from '../App'

function renderAt(path) {
  window.history.pushState({}, '', path)
  return render(<App />)
}

function h1Text() {
  return screen.getByRole('heading', { level: 1 }).textContent
}

describe('routing', () => {
  beforeEach(() => {
    window.history.pushState({}, '', '/')
  })

  it('renders the home page at /', () => {
    renderAt('/')
    expect(h1Text()).toMatch(/meets opportunity/)
  })

  it('renders the quote page at /quote', () => {
    renderAt('/quote')
    expect(h1Text()).toMatch(/Tell us what/)
  })

  it('renders the specialisations index', () => {
    renderAt('/specialisations')
    expect(h1Text()).toMatch(/Three sectors/)
  })

  it('renders the ethnic food vertical', () => {
    renderAt('/specialisations/ethnic-food')
    expect(h1Text()).toMatch(/Ethnic Food/)
  })

  it('renders the vehicle parts vertical', () => {
    renderAt('/specialisations/vehicle-parts')
    expect(h1Text()).toMatch(/Vehicle Parts/)
  })

  it('renders the pharmaceuticals vertical', () => {
    renderAt('/specialisations/pharmaceuticals')
    expect(h1Text()).toMatch(/Pharmaceuticals/)
  })

  it('renders the 404 fallback for an unknown route', () => {
    renderAt('/does-not-exist')
    expect(h1Text()).toMatch(/gone/)
  })

  it('navigates via a navbar link click', async () => {
    const user = userEvent.setup()
    renderAt('/')

    const nav = screen.getByRole('navigation')
    await user.click(within(nav).getByRole('link', { name: 'Quote' }))

    expect(h1Text()).toMatch(/Tell us what/)
  })

  it('navigates home from the 404 page', async () => {
    const user = userEvent.setup()
    renderAt('/nowhere')

    await user.click(screen.getByRole('link', { name: /Back to Home/i }))
    expect(h1Text()).toMatch(/meets opportunity/)
  })
})
