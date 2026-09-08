import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, within, fireEvent } from '@testing-library/react'
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

  it.each([
    ['/', /meets opportunity/],
    ['/about', /manufacturers and suppliers worldwide/],
    ['/expertise', /What we source/],
    ['/expertise/food-grocery', /South Asian food/],
    ['/expertise/food-grocery/catalogue', /current food range/],
    ['/expertise/automotive', /Automotive components/],
    ['/expertise/healthcare', /Healthcare sourcing requires/],
    ['/expertise/perfume', /Perfume ingredients and essential oils/],
    ['/sahya', /Sahya/],
    ['/quote', /Tell us what you are/],
    ['/contact', /Let's talk about your/],
    ['/privacy', /How we handle your/],
    ['/terms', /Terms of/],
    ['/does-not-exist', /gone/],
  ])('renders %s', (path, heading) => {
    renderAt(path)
    expect(h1Text()).toMatch(heading)
  })

  // The pre-rewrite URLs are the ones already shared and indexed, so they have
  // to land on the renamed page rather than the 404.
  it.each([
    ['/specialisations', /What we source/],
    ['/specialisations/ethnic-food', /South Asian food/],
    ['/specialisations/vehicle-parts', /Automotive components/],
    ['/specialisations/pharmaceuticals', /Healthcare sourcing requires/],
  ])('redirects the legacy path %s', (path, heading) => {
    renderAt(path)
    expect(h1Text()).toMatch(heading)
  })

  it('navigates via a navbar link click', async () => {
    const user = userEvent.setup()
    renderAt('/')

    const nav = screen.getByRole('navigation')
    await user.click(within(nav).getByRole('link', { name: 'Request a Quote' }))

    expect(h1Text()).toMatch(/Tell us what you are/)
  })

  it('reaches a sourcing area through the navbar dropdown by keyboard', async () => {
    const user = userEvent.setup()
    renderAt('/')

    const nav = screen.getByRole('navigation')
    // Focusing the trigger has to open the panel: on desktop the four sourcing
    // areas are reachable no other way, and hover is not a keyboard gesture.
    within(nav).getByRole('link', { name: /Areas of Expertise/ }).focus()

    const item = await within(nav).findByRole('link', { name: 'Automotive Components' })
    fireEvent.click(item)

    expect(h1Text()).toMatch(/Automotive components/)
  })

  it('opens the dropdown on hover', async () => {
    const user = userEvent.setup()
    renderAt('/')

    const nav = screen.getByRole('navigation')
    expect(within(nav).queryByRole('link', { name: 'Food & Grocery' })).not.toBeInTheDocument()
    await user.hover(within(nav).getByRole('link', { name: /Areas of Expertise/ }))
    expect(within(nav).getByRole('link', { name: 'Food & Grocery' })).toBeInTheDocument()
  })

  it('navigates home from the 404 page', async () => {
    const user = userEvent.setup()
    renderAt('/nowhere')

    await user.click(screen.getByRole('link', { name: /Back to Home/i }))
    expect(h1Text()).toMatch(/meets opportunity/)
  })
})
