/**
 * Interaction coverage for the marketing pages.
 *
 * Hover is no longer tested: every hover effect is now a CSS `:hover` rule
 * rather than a JS handler mutating inline styles, so there is nothing in the
 * component for a test to exercise — asserting it would only be re-testing the
 * browser. What is left is the state-carrying interaction: the filter pills,
 * the hero dock, and the links out of each page.
 */
import { describe, it, expect, vi } from 'vitest'
import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders } from './renderWithProviders'
import Home from '../pages/Home'
import EthnicFood from '../pages/EthnicFood'
import VehicleParts from '../pages/VehicleParts'
import Pharmaceuticals from '../pages/Pharmaceuticals'
import Specialisations from '../pages/Specialisations'
import QuotePage from '../pages/QuotePage'

describe('Home hero', () => {
  it('offers both hero calls to action', () => {
    renderWithProviders(<Home />)
    // The hero's pair comes first in document order; the dark CTA repeats the
    // quote link further down.
    const [heroQuote] = screen.getAllByRole('link', { name: /Request a Quote/i })
    expect(heroQuote).toHaveAttribute('href', '/quote')
    expect(screen.getByRole('link', { name: 'Explore Products' })).toHaveAttribute(
      'href',
      '/specialisations',
    )
  })

  it('renders the container inline when the journey layer is inactive', () => {
    const { container } = renderWithProviders(<Home />)
    // Reduced motion + narrow viewport (see tests/media) → no fixed layer, and
    // the hero slot holds the static container instead.
    const slot = container.ownerDocument.getElementById('hero-container-slot')
    expect(slot.querySelector('svg')).toBeInTheDocument()
  })

  it('scrolls to the matching section when a dock pill is used', async () => {
    // With no Lenis running, lib/scroll falls through to the native API, so
    // that is where the effect is observable.
    const spy = vi.spyOn(Element.prototype, 'scrollIntoView')
    const user = userEvent.setup()
    renderWithProviders(<Home />)

    const dock = screen.getByRole('group', { name: 'Jump to a trade vertical' })

    await user.click(within(dock).getByRole('button', { name: /Food & Grocery/ }))
    expect(spy.mock.instances.at(-1)).toBe(document.getElementById('products'))

    await user.click(within(dock).getByRole('button', { name: /Pharmaceuticals/ }))
    expect(spy.mock.instances.at(-1)).toBe(document.getElementById('verticals'))

    spy.mockRestore()
  })
})

describe('Home featured products', () => {
  it('filters the grid by category and reports the count', async () => {
    const user = userEvent.setup()
    renderWithProviders(<Home />)

    const filters = screen.getByRole('group', { name: 'Filter products by category' })
    expect(screen.getByRole('status')).toHaveTextContent('Showing 38 of 38 lines')

    await user.click(within(filters).getByRole('button', { name: /Instant Mixes/ }))

    expect(screen.getByRole('status')).toHaveTextContent('Showing 2 of 38 lines')
    expect(screen.getByText('Instant Semiya Payasam Mix')).toBeInTheDocument()
    expect(screen.queryByText('Matta Rice')).not.toBeInTheDocument()

    await user.click(within(filters).getByRole('button', { name: /^All/ }))
    expect(screen.getByRole('status')).toHaveTextContent('Showing 38 of 38 lines')
  })
})

describe('Home closing sections', () => {
  it('links to the quote form from the dark CTA', () => {
    renderWithProviders(<Home />)
    // Hero, dark CTA — both point at the same place.
    const quoteLinks = screen.getAllByRole('link', { name: /Request a Quote/i })
    expect(quoteLinks.length).toBeGreaterThan(1)
    for (const link of quoteLinks) expect(link).toHaveAttribute('href', '/quote')
  })

  it('links to Sahya from the teaser', () => {
    renderWithProviders(<Home />)
    expect(screen.getByRole('link', { name: /Meet Sahya/ })).toHaveAttribute(
      'href',
      '/specialisations/ethnic-food#sahya',
    )
  })
})

describe('vertical pages', () => {
  it.each([
    ['EthnicFood', EthnicFood],
    ['VehicleParts', VehicleParts],
    ['Pharmaceuticals', Pharmaceuticals],
  ])('%s: offers a back link and a quote CTA', (_name, Page) => {
    renderWithProviders(<Page />, { route: '/specialisations/x' })

    expect(screen.getByRole('link', { name: /Specialisations/i })).toHaveAttribute(
      'href',
      '/specialisations',
    )
    expect(screen.getByRole('link', { name: /Request a Quote/i })).toHaveAttribute('href', '/quote')
  })
})

describe('Specialisations index', () => {
  it('renders each sector card as a single link', () => {
    renderWithProviders(<Specialisations />)
    const card = screen.getByRole('link', { name: /Explore Vehicle Parts/ })
    expect(within(card).getByText('OEM-quality components.')).toBeInTheDocument()
  })
})

describe('QuotePage navigation', () => {
  it('offers a link back to the home page', () => {
    renderWithProviders(<QuotePage />, { route: '/quote' })
    expect(screen.getByRole('link', { name: 'Home' })).toHaveAttribute('href', '/')
  })
})
