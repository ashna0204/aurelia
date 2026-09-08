import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
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
    for (const label of ['Home', 'About', /Areas of Expertise/, 'Request a Quote', 'Contact']) {
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

  it('lists the sourcing areas inline in the mobile menu', async () => {
    const user = userEvent.setup()
    renderWithProviders(<Navbar />)

    // A hover dropdown has no touch equivalent, so the sub-pages have to be
    // listed outright once the mobile menu is open.
    expect(screen.queryByRole('link', { name: 'Perfume Ingredients & Essential Oils' })).not.toBeInTheDocument()
    await user.click(screen.getByRole('button', { hidden: true }))
    expect(screen.getByRole('link', { name: 'Perfume Ingredients & Essential Oils' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Sahya' })).toBeInTheDocument()
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
    expect(screen.getByRole('link', { name: 'Request a Quote' })).toHaveStyle({ color: '#C8963E' })
  })
})

describe('Footer', () => {
  it('renders the brand and every column', () => {
    renderWithProviders(<Footer />)
    expect(screen.getByText('AURELIA LOGISTICS')).toBeInTheDocument()
    for (const title of ['Company', 'What We Source', 'Legal']) {
      expect(screen.getByText(title)).toBeInTheDocument()
    }
  })

  it('drops the unverified claims the rewrite removed', () => {
    renderWithProviders(<Footer />)
    expect(screen.queryByText(/UK-registered global trade facilitator/)).not.toBeInTheDocument()
    expect(screen.queryByText(/Kochi · Mumbai · Dubai · London/)).not.toBeInTheDocument()
  })

  it('invokes navigation for every footer link without crashing', async () => {
    const user = userEvent.setup()
    renderWithProviders(<Footer />)

    for (const label of [
      'About',
      'Areas of Expertise',
      'Contact',
      'Food & Grocery',
      'Automotive Components',
      'Healthcare & Pharmaceuticals',
      'Perfume Ingredients & Essential Oils',
      'Sahya',
      'Privacy Policy',
      'Terms of Service',
    ]) {
      await user.click(screen.getByText(label))
    }
    expect(screen.getByText('AURELIA LOGISTICS')).toBeInTheDocument()
  })
})
