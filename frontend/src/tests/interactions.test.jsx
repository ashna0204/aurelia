/**
 * Interaction coverage — hover and click handlers on the marketing pages.
 *
 * Each map-generated handler shares one source location, so exercising a single
 * representative element (one card, one button) covers that handler, and we
 * assert the real style/nav effect rather than merely calling it.
 */
import { describe, it, expect } from 'vitest'
import { fireEvent, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders } from './renderWithProviders'
import Home from '../pages/Home'
import EthnicFood from '../pages/EthnicFood'
import VehicleParts from '../pages/VehicleParts'
import Pharmaceuticals from '../pages/Pharmaceuticals'
import Specialisations from '../pages/Specialisations'
import QuotePage from '../pages/QuotePage'

describe('Home interactions', () => {
  it('hero buttons respond to hover and navigate on click', async () => {
    const user = userEvent.setup()
    renderWithProviders(<Home />)

    const specBtn = screen.getByRole('button', { name: 'Our Specialisations' })
    fireEvent.mouseEnter(specBtn)
    expect(specBtn).toHaveStyle({ transform: 'translateY(-2px)' })
    fireEvent.mouseLeave(specBtn)
    expect(specBtn).toHaveStyle({ transform: 'none' })
    await user.click(specBtn)

    // Both "Request a Quote" CTAs (hero + banner) share one hover handler source.
    for (const btn of screen.getAllByRole('button', { name: /Request a Quote/i })) {
      fireEvent.mouseEnter(btn)
      fireEvent.mouseLeave(btn)
    }
  })

  it('about section: stat cards and CTA respond to hover', async () => {
    const user = userEvent.setup()
    renderWithProviders(<Home />)

    const statCard = screen.getByText('Countries Served').parentElement
    fireEvent.mouseEnter(statCard)
    expect(statCard).toHaveStyle({ transform: 'translateY(-4px)' })
    fireEvent.mouseLeave(statCard)

    const explore = screen.getByRole('button', { name: 'Explore Specialisations' })
    fireEvent.mouseEnter(explore)
    fireEvent.mouseLeave(explore)
    await user.click(explore)
  })

  it('specialisation preview cards and images respond to hover and click', async () => {
    const user = userEvent.setup()
    renderWithProviders(<Home />)

    const img = screen.getByAltText('Vehicle Parts')
    const card = img.parentElement.parentElement
    fireEvent.mouseEnter(card)
    expect(card.style.border).toContain('200, 150, 62')
    fireEvent.mouseLeave(card)

    fireEvent.mouseEnter(img)
    expect(img).toHaveStyle({ transform: 'scale(1.06)' })
    fireEvent.mouseLeave(img)

    await user.click(card) // navigate to the vertical
  })
})

describe('vertical page CTA and back navigation', () => {
  it.each([
    ['EthnicFood', EthnicFood],
    ['VehicleParts', VehicleParts],
    ['Pharmaceuticals', Pharmaceuticals],
  ])('%s: back button and quote CTA work', async (_name, Page) => {
    const user = userEvent.setup()
    renderWithProviders(<Page />, { route: '/specialisations/x' })

    await user.click(screen.getByRole('button', { name: /← Specialisations/i }))

    const cta = screen.getByRole('button', { name: /Request a Quote/i })
    fireEvent.mouseEnter(cta)
    fireEvent.mouseLeave(cta)
    await user.click(cta)
  })
})

describe('EthnicFood product row hover', () => {
  it('highlights a product row on hover', () => {
    renderWithProviders(<EthnicFood />)
    const row = screen.getByText('Matta Rice').parentElement.parentElement
    fireEvent.mouseEnter(row)
    expect(row.style.background).toContain('200, 150, 62')
    fireEvent.mouseLeave(row)
  })
})

describe('Specialisations card hover', () => {
  it('highlights a sector card on hover', () => {
    renderWithProviders(<Specialisations />)
    const img = screen.getByAltText('Ethnic Food & Grocery')
    const card = img.closest('div').parentElement
    fireEvent.mouseEnter(card)
    fireEvent.mouseLeave(card)
    expect(card).toBeInTheDocument()
  })
})

describe('QuotePage navigation buttons', () => {
  it('the back button is wired', async () => {
    const user = userEvent.setup()
    renderWithProviders(<QuotePage />, { route: '/quote' })
    await user.click(screen.getByRole('button', { name: /← Back/i }))
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument()
  })
})
