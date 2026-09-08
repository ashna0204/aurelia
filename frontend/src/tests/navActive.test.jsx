import { describe, it, expect } from 'vitest'
import { screen } from '@testing-library/react'
import Navbar from '../components/Navbar'
import { renderWithProviders } from './renderWithProviders'

const GOLD = '#C8963E'

describe('Navbar active state', () => {
  it('lights only the route the user is on', () => {
    renderWithProviders(<Navbar />, { route: '/quote' })

    expect(screen.getByRole('link', { name: 'Request a Quote' })).toHaveStyle({ color: GOLD })
    for (const label of ['About', 'Contact', /Areas of Expertise/]) {
      expect(screen.getByRole('link', { name: label })).not.toHaveStyle({ color: GOLD })
    }
  })

  it('marks Areas of Expertise active on a nested area route', () => {
    renderWithProviders(<Navbar />, { route: '/expertise/food-grocery' })
    expect(screen.getByRole('link', { name: /Areas of Expertise/ })).toHaveStyle({ color: GOLD })
    expect(screen.getByRole('link', { name: 'Request a Quote' })).not.toHaveStyle({ color: GOLD })
  })

  it('marks Areas of Expertise active on the catalogue, two levels deep', () => {
    renderWithProviders(<Navbar />, { route: '/expertise/food-grocery/catalogue' })
    expect(screen.getByRole('link', { name: /Areas of Expertise/ })).toHaveStyle({ color: GOLD })
  })

  it('lights Home only at the root', () => {
    renderWithProviders(<Navbar />, { route: '/' })
    expect(screen.getByRole('link', { name: 'Home' })).toHaveStyle({ color: GOLD })

    // The old bug: a startsWith("/") prefix match lit Home on every route.
    renderWithProviders(<Navbar />, { route: '/about' })
    const [, homeOnAbout] = screen.getAllByRole('link', { name: 'Home' })
    expect(homeOnAbout).not.toHaveStyle({ color: GOLD })
  })

  it('does not light Areas of Expertise on the standalone Sahya route', () => {
    renderWithProviders(<Navbar />, { route: '/sahya' })
    expect(screen.getByRole('link', { name: /Areas of Expertise/ })).not.toHaveStyle({ color: GOLD })
  })
})
