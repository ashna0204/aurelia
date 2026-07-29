import { describe, it, expect } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders } from './renderWithProviders'
import Specialisations from '../pages/Specialisations'
import EthnicFood from '../pages/EthnicFood'
import VehicleParts from '../pages/VehicleParts'
import Pharmaceuticals from '../pages/Pharmaceuticals'
import NotFound from '../pages/NotFound'

function headings() {
  return screen.getAllByRole('heading', { level: 1 })
}

describe('Specialisations', () => {
  it('renders one h1 and a link into each of the three verticals', () => {
    renderWithProviders(<Specialisations />)
    expect(headings()).toHaveLength(1)

    expect(
      screen.getByRole('link', { name: /Explore Ethnic Food & Grocery/ }),
    ).toHaveAttribute('href', '/specialisations/ethnic-food')
    expect(screen.getByRole('link', { name: /Explore Vehicle Parts/ })).toHaveAttribute(
      'href',
      '/specialisations/vehicle-parts',
    )
    expect(screen.getByRole('link', { name: /Explore Pharmaceuticals/ })).toHaveAttribute(
      'href',
      '/specialisations/pharmaceuticals',
    )
  })

  it('shows the headline figures for each vertical', () => {
    renderWithProviders(<Specialisations />)
    expect(screen.getByText('38')).toBeInTheDocument()
    expect(screen.getByText('WHO-GMP')).toBeInTheDocument()
    expect(screen.getByText('Kerala')).toBeInTheDocument()
  })
})

describe('EthnicFood', () => {
  it('renders the hero, the Sahya feature and the default catalogue category', () => {
    renderWithProviders(<EthnicFood />)
    expect(headings()).toHaveLength(1)
    expect(screen.getByText('Sahya.')).toBeInTheDocument()
    // Default category is Grains & Flour → Matta Rice is on screen.
    expect(screen.getByText('Matta Rice')).toBeInTheDocument()
    expect(screen.getByText('$8.10')).toBeInTheDocument()
  })

  it('switches catalogue category when a filter pill is used', async () => {
    const user = userEvent.setup()
    renderWithProviders(<EthnicFood />)

    expect(screen.queryByText('Toor Dall')).not.toBeInTheDocument()

    const pill = screen.getByRole('button', { name: /Pulses & Legumes/ })
    await user.click(pill)

    expect(pill).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByText('Toor Dall')).toBeInTheDocument()
    expect(screen.queryByText('Matta Rice')).not.toBeInTheDocument()
  })
})

describe('VehicleParts', () => {
  it('renders one h1 and every category with its items visible', () => {
    renderWithProviders(<VehicleParts />)
    expect(headings()).toHaveLength(1)
    // Each category name appears twice — as a filter pill and as a card
    // heading — so query the heading specifically.
    expect(screen.getByRole('heading', { name: 'Braking Systems' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Filtration' })).toBeInTheDocument()
    // Items are on the page without any interaction.
    expect(screen.getByText('ABS sensors')).toBeInTheDocument()
  })

  it('narrows the grid to one category and back', async () => {
    const user = userEvent.setup()
    renderWithProviders(<VehicleParts />)

    await user.click(screen.getByRole('button', { name: 'Braking Systems' }))
    expect(screen.queryByText('Oil filters')).not.toBeInTheDocument()
    expect(screen.getByText('ABS sensors')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'All categories' }))
    expect(screen.getByText('Oil filters')).toBeInTheDocument()
  })
})

describe('Pharmaceuticals', () => {
  it('renders one h1, the certifications and the categories', () => {
    renderWithProviders(<Pharmaceuticals />)
    expect(headings()).toHaveLength(1)
    expect(screen.getByRole('heading', { name: 'WHO-GMP' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Generic Medicines' })).toBeInTheDocument()
  })

  it('filters to a single category', async () => {
    const user = userEvent.setup()
    renderWithProviders(<Pharmaceuticals />)

    await user.click(screen.getByRole('button', { name: 'Nutraceuticals' }))
    expect(screen.getByText('Probiotics & prebiotics')).toBeInTheDocument()
    expect(screen.queryByText('Steroidal APIs')).not.toBeInTheDocument()
  })
})

describe('NotFound', () => {
  it('renders one h1 and two escape links', () => {
    renderWithProviders(<NotFound />)
    expect(headings()).toHaveLength(1)
    expect(screen.getByRole('link', { name: /Back to Home/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Our Specialisations/i })).toBeInTheDocument()
  })
})
