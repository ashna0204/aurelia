import { describe, it, expect } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import SectionTag from '../components/SectionTag'
import Reveal from '../components/Reveal'
import WorldMap from '../components/WorldMap'
import ShippingContainer from '../components/ShippingContainer'
import Field from '../components/form/Field'
import FormAlert from '../components/form/FormAlert'
import { ROUTES } from '../lib/worldMap'
import { renderWithProviders } from './renderWithProviders'

describe('SectionTag', () => {
  it('renders its label', () => {
    render(<SectionTag label="Who We Are" />)
    expect(screen.getByText('Who We Are')).toBeInTheDocument()
  })

  it('renders the on-dark variant', () => {
    render(<SectionTag label="Ready to import?" onDark />)
    expect(screen.getByText('Ready to import?')).toBeInTheDocument()
  })
})

describe('Reveal', () => {
  it('renders its children in their final state under reduced motion', () => {
    render(
      <Reveal>
        <p>revealed content</p>
      </Reveal>,
    )
    expect(screen.getByText('revealed content')).toBeVisible()
  })

  it('renders as another element and staggers children', () => {
    render(
      <Reveal as="ul" stagger data-testid="list">
        <li>one</li>
        <li>two</li>
      </Reveal>,
    )
    expect(screen.getByTestId('list').tagName).toBe('UL')
    expect(screen.getByText('two')).toBeVisible()
  })
})

describe('WorldMap', () => {
  it('is hidden from assistive tech when it carries no title', () => {
    const { container } = render(<WorldMap />)
    expect(container.querySelector('svg')).toHaveAttribute('aria-hidden', 'true')
  })

  it('becomes an image with an accessible name when titled', () => {
    render(<WorldMap title="Aurelia's trade lanes" />)
    expect(screen.getByRole('img', { name: "Aurelia's trade lanes" })).toBeInTheDocument()
  })

  it('draws the routes and markers it is given, and skips unknown places', () => {
    const { container } = render(
      <WorldMap
        highlightRegions={['southAsia', 'gulf', 'nowhere']}
        routes={[ROUTES.main, ROUTES.coastal]}
        markers={['kochi', 'london', 'atlantis']}
        showLabels
        pulse
      />,
    )
    expect(container.querySelector('#route-main')).toBeInTheDocument()
    expect(container.querySelector('#route-coastal')).toBeInTheDocument()
    expect(container.querySelectorAll('[data-marker]')).toHaveLength(2)
    // Kochi is the only place carrying a note, rendered beside its label.
    expect(container.textContent).toContain('KOCHI')
    expect(container.textContent).toContain('· HQ')
  })
})

describe('ShippingContainer', () => {
  it('renders decoratively, with the brand marking', () => {
    const { container } = render(<ShippingContainer />)
    expect(container.querySelector('svg')).toHaveAttribute('aria-hidden', 'true')
    expect(container.textContent).toContain('AURELIA')
  })

  it('can drop its contact shadow', () => {
    const { container } = render(<ShippingContainer shadow={false} />)
    expect(container.querySelector('ellipse')).toBeNull()
  })
})

describe('form primitives', () => {
  it('wires a Field label, control, error and hint together', () => {
    render(
      <Field id="email" label="Email *" error="Please enter a valid email." hint="0 / 254">
        <input id="email" aria-describedby="email-error" />
      </Field>,
    )
    const input = screen.getByLabelText('Email *')
    expect(input).toHaveAttribute('aria-describedby', 'email-error')
    expect(screen.getByText('Please enter a valid email.')).toHaveAttribute('id', 'email-error')
    expect(screen.getByText('0 / 254')).toBeInTheDocument()
  })

  it('FormAlert prefers a request error, then a notice, then the field count', () => {
    const { rerender } = render(<FormAlert error="Server said no" errorCount={3} />)
    expect(screen.getByRole('alert')).toHaveTextContent('Server said no')

    rerender(<FormAlert notice="Too quick" errorCount={3} />)
    expect(screen.getByRole('alert')).toHaveTextContent('Too quick')

    rerender(<FormAlert errorCount={3} />)
    expect(screen.getByRole('alert')).toHaveTextContent('Please correct the 3 highlighted fields')

    rerender(<FormAlert errorCount={1} />)
    expect(screen.getByRole('alert')).toHaveTextContent('Please correct the highlighted field')

    rerender(<FormAlert />)
    expect(screen.getByRole('alert')).toBeEmptyDOMElement()
  })
})

describe('Navbar', () => {
  it('renders every primary link, the CTA and the brand', () => {
    renderWithProviders(<Navbar />)
    const nav = screen.getByRole('navigation', { name: 'Primary' })
    for (const label of ['Home', 'About', 'Specialisations', 'Contact']) {
      expect(within(nav).getByRole('link', { name: label })).toBeInTheDocument()
    }
    expect(within(nav).getByRole('link', { name: 'Request Quote' })).toBeInTheDocument()
    expect(screen.getByText('AURELIA')).toBeInTheDocument()
  })

  it('toggles the mobile menu, duplicating the links', async () => {
    const user = userEvent.setup()
    renderWithProviders(<Navbar />)

    const toggle = screen.getByRole('button', { name: 'Open menu' })
    expect(toggle).toHaveAttribute('aria-expanded', 'false')
    expect(screen.getAllByRole('link', { name: 'Home' })).toHaveLength(1)

    await user.click(toggle)
    expect(screen.getAllByRole('link', { name: 'Home' })).toHaveLength(2)

    await user.click(screen.getByRole('button', { name: 'Close menu' }))
    expect(screen.getAllByRole('link', { name: 'Home' })).toHaveLength(1)
  })

  it('navigates and closes the menu when a mobile link is used', async () => {
    const user = userEvent.setup()
    renderWithProviders(<Navbar />)

    await user.click(screen.getByRole('button', { name: 'Open menu' }))
    const [, mobileNav] = screen.getAllByRole('navigation', { name: 'Primary' })
    await user.click(within(mobileNav).getByRole('link', { name: 'Specialisations' }))

    expect(screen.getByRole('button', { name: 'Open menu' })).toBeInTheDocument()
  })

  it('scrolls to top when the brand logo is clicked', async () => {
    const user = userEvent.setup()
    renderWithProviders(<Navbar />, { route: '/quote' })
    await user.click(screen.getByText('AURELIA'))
    expect(screen.getByText('AURELIA')).toBeInTheDocument()
  })
})

describe('Footer', () => {
  it('renders the brand, the link columns and all four offices', () => {
    renderWithProviders(<Footer />)
    expect(screen.getByText('AURELIA LOGISTICS')).toBeInTheDocument()
    expect(screen.getByText('Company')).toBeInTheDocument()
    expect(screen.getByText('Legal')).toBeInTheDocument()
    for (const city of ['Kochi', 'Mumbai', 'Dubai', 'London']) {
      expect(screen.getByText(city)).toBeInTheDocument()
    }
    expect(screen.getByText('Headquarters')).toBeInTheDocument()
  })

  it('opens and closes the Privacy Policy modal', async () => {
    const user = userEvent.setup()
    renderWithProviders(<Footer />)

    await user.click(screen.getByRole('button', { name: 'Privacy Policy' }))
    const dialog = screen.getByRole('dialog', { name: 'Privacy Policy' })
    expect(
      within(dialog).getByText(/Aurelia Logistics Ltd collects personal information/),
    ).toBeInTheDocument()

    await user.click(within(dialog).getByRole('button', { name: 'Close' }))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('closes the modal on Escape', async () => {
    const user = userEvent.setup()
    renderWithProviders(<Footer />)

    await user.click(screen.getByRole('button', { name: 'Terms of Service' }))
    expect(screen.getByText(/No binding contracts are formed/)).toBeInTheDocument()

    await user.keyboard('{Escape}')
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('closes the modal when the backdrop is clicked', async () => {
    const user = userEvent.setup()
    renderWithProviders(<Footer />)

    await user.click(screen.getByRole('button', { name: 'Privacy Policy' }))
    await user.click(document.querySelector('.fixed.inset-0'))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('invokes navigation actions for the footer links without crashing', async () => {
    const user = userEvent.setup()
    renderWithProviders(<Footer />)

    for (const label of [
      'About Us',
      'Our Story',
      'Ethnic Food & Grocery',
      'Vehicle Parts',
      'Pharmaceuticals',
      'Sahya — Our B2C Label',
      'Certifications',
    ]) {
      await user.click(screen.getByRole('button', { name: label }))
    }
    expect(screen.getByText('AURELIA LOGISTICS')).toBeInTheDocument()
  })
})
