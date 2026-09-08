import { describe, it, expect } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders } from './renderWithProviders'
import About from '../pages/About'
import Expertise from '../pages/Expertise'
import FoodGrocery from '../pages/FoodGrocery'
import FoodCatalogue from '../pages/FoodCatalogue'
import Sahya from '../pages/Sahya'
import Automotive from '../pages/Automotive'
import Healthcare from '../pages/Healthcare'
import Perfume from '../pages/Perfume'
import Privacy from '../pages/Privacy'
import Terms from '../pages/Terms'
import NotFound from '../pages/NotFound'

function singleH1() {
  return screen.getAllByRole('heading', { level: 1 })
}

describe('every content page', () => {
  it.each([
    ['About', About],
    ['Expertise', Expertise],
    ['FoodGrocery', FoodGrocery],
    ['FoodCatalogue', FoodCatalogue],
    ['Sahya', Sahya],
    ['Automotive', Automotive],
    ['Healthcare', Healthcare],
    ['Perfume', Perfume],
    ['Privacy', Privacy],
    ['Terms', Terms],
  ])('%s renders exactly one h1', (_name, Page) => {
    renderWithProviders(<Page />)
    expect(singleH1()).toHaveLength(1)
  })
})

describe('Expertise', () => {
  it('renders all four sourcing areas with alt-texted images', () => {
    renderWithProviders(<Expertise />)

    const images = screen.getAllByRole('img')
    expect(images).toHaveLength(4)
    for (const img of images) expect(img).toHaveAccessibleName()
    expect(screen.getByAltText('Food & Grocery')).toBeInTheDocument()
    expect(screen.getByAltText('Perfume Ingredients & Essential Oils')).toBeInTheDocument()
  })

  it('navigates when an area card is clicked', async () => {
    const user = userEvent.setup()
    renderWithProviders(<Expertise />)
    await user.click(screen.getByRole('heading', { name: 'Automotive Components' }))
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument()
  })
})

describe('FoodCatalogue', () => {
  it('renders the default category with no prices', () => {
    renderWithProviders(<FoodCatalogue />)
    // Default category is Grains & Flour → Matta Rice is on screen.
    expect(screen.getByText('Matta Rice')).toBeInTheDocument()
    expect(screen.getAllByText('Price on request').length).toBeGreaterThan(0)
    expect(screen.queryByText(/\$/)).not.toBeInTheDocument()
  })

  it('switches category when a tab is clicked', async () => {
    const user = userEvent.setup()
    renderWithProviders(<FoodCatalogue />)

    expect(screen.queryByText('Toor Dall')).not.toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Pulses & Legumes' }))
    expect(screen.getByText('Toor Dall')).toBeInTheDocument()
    expect(screen.queryByText('Matta Rice')).not.toBeInTheDocument()
  })

  it('states that the catalogue is indicative', () => {
    renderWithProviders(<FoodCatalogue />)
    expect(screen.getByText(/The catalogue is indicative/)).toBeInTheDocument()
  })
})

describe('Automotive', () => {
  it('renders the category cards from the rewrite', () => {
    renderWithProviders(<Automotive />)
    expect(screen.getByText('Braking components')).toBeInTheDocument()
    expect(screen.getByText('Other vehicle-specific components')).toBeInTheDocument()
  })
})

describe('Healthcare', () => {
  it('leads with the compliance qualifier before any category', () => {
    renderWithProviders(<Healthcare />)
    const qualifier = screen.getByText(/The suitability of any product depends on the destination market/)
    const category = screen.getByText('Finished formulations')
    expect(qualifier.compareDocumentPosition(category) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
  })

  it('makes no blanket certification claim', () => {
    renderWithProviders(<Healthcare />)
    expect(screen.queryByText(/WHO-GMP/)).not.toBeInTheDocument()
    expect(screen.queryByText(/USFDA/)).not.toBeInTheDocument()
  })
})

describe('NotFound', () => {
  it('renders one h1 and two escape links', () => {
    renderWithProviders(<NotFound />)
    expect(singleH1()).toHaveLength(1)
    expect(screen.getByRole('link', { name: /Back to Home/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Areas of Expertise/i })).toBeInTheDocument()
  })
})
