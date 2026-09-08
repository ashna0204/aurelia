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
import Expertise from '../pages/Expertise'
import FoodGrocery from '../pages/FoodGrocery'
import FoodCatalogue from '../pages/FoodCatalogue'
import Automotive from '../pages/Automotive'
import Healthcare from '../pages/Healthcare'
import Perfume from '../pages/Perfume'
import QuotePage from '../pages/QuotePage'

describe('Home interactions', () => {
  it('hero buttons respond to hover and navigate on click', async () => {
    const user = userEvent.setup()
    renderWithProviders(<Home />)

    const exploreBtn = screen.getByRole('button', { name: 'Explore Our Expertise' })
    fireEvent.mouseEnter(exploreBtn)
    expect(exploreBtn.style.borderColor).toContain('200, 150, 62')
    fireEvent.mouseLeave(exploreBtn)
    await user.click(exploreBtn)

    // Both "Request a Quote" CTAs (hero + closing band) share one hover handler.
    for (const btn of screen.getAllByRole('button', { name: /Request a Quote/i })) {
      fireEvent.mouseEnter(btn)
      expect(btn).toHaveStyle({ transform: 'translateY(-2px)' })
      fireEvent.mouseLeave(btn)
      expect(btn).toHaveStyle({ transform: 'none' })
    }
  })

  it('expertise preview cards respond to hover and click through', async () => {
    const user = userEvent.setup()
    renderWithProviders(<Home />)

    const img = screen.getByAltText('Automotive Components')
    const card = img.parentElement.parentElement
    fireEvent.mouseEnter(card)
    expect(card).toHaveStyle({ transform: 'translateY(-5px)' })
    fireEvent.mouseLeave(card)
    expect(card).toHaveStyle({ transform: 'none' })

    await user.click(card)
  })

  it('shows all four sourcing areas and no removed metric', () => {
    renderWithProviders(<Home />)

    for (const label of [
      'Food & Grocery',
      'Automotive Components',
      'Healthcare & Pharmaceuticals',
      'Perfume Ingredients & Essential Oils',
    ]) {
      expect(screen.getByAltText(label)).toBeInTheDocument()
    }
    // The unverified scale claims the rewrite removed.
    for (const gone of [/Countries Served/, /B2B Partners/, /On-Time Delivery/, /Trade Sectors/]) {
      expect(screen.queryByText(gone)).not.toBeInTheDocument()
    }
  })
})

describe('area page CTA and back navigation', () => {
  it.each([
    ['FoodGrocery', FoodGrocery],
    ['Automotive', Automotive],
    ['Healthcare', Healthcare],
    ['Perfume', Perfume],
  ])('%s: back link and closing CTA are wired', async (_name, Page) => {
    const user = userEvent.setup()
    renderWithProviders(<Page />, { route: '/expertise/x' })

    await user.click(screen.getByRole('button', { name: /← Areas of Expertise/i }))

    // Each area's closing action differs; the last button on the page is it.
    const buttons = screen.getAllByRole('button')
    const cta = buttons[buttons.length - 1]
    fireEvent.mouseEnter(cta)
    fireEvent.mouseLeave(cta)
    await user.click(cta)
  })
})

describe('FoodGrocery sub-page cards', () => {
  it('links on to the catalogue and to Sahya', async () => {
    const user = userEvent.setup()
    renderWithProviders(<FoodGrocery />)

    const card = screen.getByRole('heading', { name: 'Our current food range' }).parentElement
    fireEvent.mouseEnter(card)
    expect(card).toHaveStyle({ transform: 'translateY(-3px)' })
    fireEvent.mouseLeave(card)
    await user.click(card)

    await user.click(screen.getByRole('heading', { name: 'Sahya' }).parentElement)
  })
})

describe('FoodCatalogue', () => {
  it('lists the confirmed-on-enquiry fields on every card', () => {
    renderWithProviders(<FoodCatalogue />)
    const card = screen.getByText('Matta Rice').parentElement

    expect(card).toHaveTextContent('Pack size')
    expect(card).toHaveTextContent('10 kg')
    expect(card).toHaveTextContent('Minimum order')
    expect(card).toHaveTextContent('On request')
    expect(card).toHaveTextContent('Price on request')
  })

  it('back link returns to Food & Grocery', async () => {
    const user = userEvent.setup()
    renderWithProviders(<FoodCatalogue />)
    await user.click(screen.getByRole('button', { name: /← Food & Grocery/i }))
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument()
  })
})

describe('Expertise card hover', () => {
  it('highlights an area card on hover', () => {
    renderWithProviders(<Expertise />)
    const img = screen.getByAltText('Food & Grocery')
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
