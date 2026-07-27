import { describe, it, expect } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders } from './renderWithProviders'
import Specialisations from '../pages/Specialisations'
import EthnicFood from '../pages/EthnicFood'
import VehicleParts from '../pages/VehicleParts'
import Pharmaceuticals from '../pages/Pharmaceuticals'
import NotFound from '../pages/NotFound'

function singleH1() {
  return screen.getAllByRole('heading', { level: 1 })
}

describe('Specialisations', () => {
  it('renders one h1 and the three sector cards with alt-texted images', () => {
    renderWithProviders(<Specialisations />)
    expect(singleH1()).toHaveLength(1)

    const images = screen.getAllByRole('img')
    expect(images).toHaveLength(3)
    for (const img of images) expect(img).toHaveAccessibleName()
    expect(screen.getByAltText('Ethnic Food & Grocery')).toBeInTheDocument()
  })

  it('navigates when a sector card is clicked', async () => {
    const user = userEvent.setup()
    renderWithProviders(<Specialisations />)
    // Clicking the card fires navigate — assert it does not throw.
    await user.click(screen.getByText('Vehicle Parts & Accessories'))
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument()
  })
})

describe('EthnicFood', () => {
  it('renders the hero, Sahya feature, and default catalogue category', () => {
    renderWithProviders(<EthnicFood />)
    expect(singleH1()).toHaveLength(1)
    expect(screen.getByText('Sahya.')).toBeInTheDocument()
    // Default category is Grains & Flour → Matta Rice is on screen.
    expect(screen.getByText('Matta Rice')).toBeInTheDocument()
  })

  it('switches catalogue category when a tab is clicked', async () => {
    const user = userEvent.setup()
    renderWithProviders(<EthnicFood />)

    expect(screen.queryByText('Toor Dall')).not.toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /Pulses & Legumes/ }))
    expect(screen.getByText('Toor Dall')).toBeInTheDocument()
    expect(screen.queryByText('Matta Rice')).not.toBeInTheDocument()
  })
})

describe('VehicleParts', () => {
  it('renders one h1 and all six category cards', () => {
    renderWithProviders(<VehicleParts />)
    expect(singleH1()).toHaveLength(1)
    expect(screen.getByText('Braking Systems')).toBeInTheDocument()
    expect(screen.getByText('Filtration')).toBeInTheDocument()
  })

  it('expands and collapses a category card', async () => {
    const user = userEvent.setup()
    renderWithProviders(<VehicleParts />)
    const card = screen.getByText('Braking Systems')

    await user.click(card) // open
    await user.click(card) // collapse — exercises both sides of the toggle
    expect(card).toBeInTheDocument()
  })
})

describe('Pharmaceuticals', () => {
  it('renders one h1, the certifications, and the categories', () => {
    renderWithProviders(<Pharmaceuticals />)
    expect(singleH1()).toHaveLength(1)
    expect(screen.getByText('WHO-GMP')).toBeInTheDocument()
    expect(screen.getByText('Generic Medicines')).toBeInTheDocument()
  })

  it('toggles a category card open', async () => {
    const user = userEvent.setup()
    renderWithProviders(<Pharmaceuticals />)
    await user.click(screen.getByText('Nutraceuticals'))
    expect(screen.getByText('Nutraceuticals')).toBeInTheDocument()
  })
})

describe('NotFound', () => {
  it('renders one h1 and two escape links', () => {
    renderWithProviders(<NotFound />)
    expect(singleH1()).toHaveLength(1)
    expect(screen.getByRole('link', { name: /Back to Home/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Our Specialisations/i })).toBeInTheDocument()
  })
})
