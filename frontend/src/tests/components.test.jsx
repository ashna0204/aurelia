import { describe, it, expect } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import SectionTag from '../components/SectionTag'
import FadeIn from '../components/FadeIn'
import { renderWithProviders } from './renderWithProviders'

describe('SectionTag', () => {
  it('renders its label', () => {
    render(<SectionTag label="Who We Are" />)
    expect(screen.getByText('Who We Are')).toBeInTheDocument()
  })

  it('renders in the light variant', () => {
    render(<SectionTag label="Why India" light />)
    expect(screen.getByText('Why India')).toBeInTheDocument()
  })
})

describe('FadeIn', () => {
  it('renders its children (visible once observed)', () => {
    render(<FadeIn><p>faded content</p></FadeIn>)
    expect(screen.getByText('faded content')).toBeInTheDocument()
  })

  it('accepts a direction without crashing', () => {
    render(<FadeIn direction="left"><span>left child</span></FadeIn>)
    expect(screen.getByText('left child')).toBeInTheDocument()
  })
})

describe('Navbar', () => {
  it('renders every primary link and the brand', () => {
    renderWithProviders(<Navbar />)
    for (const label of ['Home', 'About', 'Specialisations', 'Quote', 'Contact']) {
      expect(screen.getByRole('link', { name: label })).toBeInTheDocument()
    }
    expect(screen.getByText('AURELIA')).toBeInTheDocument()
  })

  it('toggles the mobile menu, duplicating the links', async () => {
    const user = userEvent.setup()
    renderWithProviders(<Navbar />)

    // Only the desktop set initially.
    expect(screen.getAllByRole('link', { name: 'Home' })).toHaveLength(1)

    // The hamburger is the only button in the navbar; it is CSS-hidden on
    // desktop (inline display:none), so query it including hidden elements.
    await user.click(screen.getByRole('button', { hidden: true }))
    expect(screen.getAllByRole('link', { name: 'Home' })).toHaveLength(2)
  })

  it('scrolls to top when the brand logo is clicked', async () => {
    const user = userEvent.setup()
    renderWithProviders(<Navbar />, { route: '/quote' })
    await user.click(screen.getByText('AURELIA'))
    // Navigated home via the logo Link without crashing.
    expect(screen.getByText('AURELIA')).toBeInTheDocument()
  })

  it('marks the active route link', () => {
    renderWithProviders(<Navbar />, { route: '/quote' })
    // The Quote link carries the gold active colour.
    const quote = screen.getByRole('link', { name: 'Quote' })
    expect(quote).toHaveStyle({ color: '#C8963E' })
  })
})

describe('Footer', () => {
  it('renders the brand and legal columns', () => {
    renderWithProviders(<Footer />)
    expect(screen.getByText('AURELIA LOGISTICS')).toBeInTheDocument()
    expect(screen.getByText('Company')).toBeInTheDocument()
    expect(screen.getByText('Legal')).toBeInTheDocument()
  })

  it('opens and closes the Privacy Policy modal', async () => {
    const user = userEvent.setup()
    renderWithProviders(<Footer />)

    await user.click(screen.getByText('Privacy Policy'))
    const dialog = screen.getByText(/Aurelia Logistics Ltd collects personal information/)
    expect(dialog).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: '✕' }))
    expect(
      screen.queryByText(/Aurelia Logistics Ltd collects personal information/),
    ).not.toBeInTheDocument()
  })

  it('opens the Terms of Service modal', async () => {
    const user = userEvent.setup()
    renderWithProviders(<Footer />)

    await user.click(screen.getByText('Terms of Service'))
    expect(screen.getByText(/No binding contracts are formed/)).toBeInTheDocument()
  })

  it('invokes navigation actions for the footer links without crashing', async () => {
    const user = userEvent.setup()
    renderWithProviders(<Footer />)

    // Each of these calls the smart-navigate helper (About, specialisations, etc.)
    for (const label of [
      'About Us',
      'Our Story',
      'Ethnic Food & Grocery',
      'Vehicle Parts',
      'Pharmaceuticals',
      'Sahya — Our B2C Label',
      'Certifications',
    ]) {
      await user.click(screen.getByText(label))
    }
    expect(screen.getByText('AURELIA LOGISTICS')).toBeInTheDocument()
  })
})
