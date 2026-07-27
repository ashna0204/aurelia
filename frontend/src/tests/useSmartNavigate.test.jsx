import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Routes, Route, useLocation } from 'react-router-dom'
import { useSmartNavigate } from '../hooks/useSmartNavigate'

function Harness({ to, opts }) {
  const go = useSmartNavigate(opts)
  const loc = useLocation()
  return (
    <div>
      <div data-testid="path">{loc.pathname}</div>
      <div id="about">About section</div>
      <button onClick={() => go(to)}>go</button>
    </div>
  )
}

function renderHarness(to, { route = '/', opts } = {}) {
  return render(
    <MemoryRouter initialEntries={[route]}>
      <Routes>
        <Route path="*" element={<Harness to={to} opts={opts} />} />
      </Routes>
    </MemoryRouter>,
  )
}

describe('useSmartNavigate', () => {
  beforeEach(() => vi.restoreAllMocks())

  it('navigates to a plain route', async () => {
    const user = userEvent.setup()
    renderHarness('/quote')

    await user.click(screen.getByRole('button', { name: 'go' }))
    expect(screen.getByTestId('path')).toHaveTextContent('/quote')
  })

  it('scrolls to an in-page anchor on the same route without navigating', async () => {
    const spy = vi.spyOn(Element.prototype, 'scrollIntoView')
    const user = userEvent.setup()
    renderHarness('/#about', { route: '/' })

    await user.click(screen.getByRole('button', { name: 'go' }))

    expect(screen.getByTestId('path')).toHaveTextContent('/')
    expect(spy).toHaveBeenCalledWith({ behavior: 'smooth' })
  })

  it('navigates then scrolls for a cross-page anchor', async () => {
    const user = userEvent.setup()
    renderHarness('/#about', { route: '/quote' })

    await user.click(screen.getByRole('button', { name: 'go' }))
    // Different starting path → it navigates to the target path.
    expect(screen.getByTestId('path')).toHaveTextContent('/')
  })

  it('honours smoothScrollTop: false for plain routes', async () => {
    const spy = vi.spyOn(window, 'scrollTo')
    const user = userEvent.setup()
    renderHarness('/specialisations', { opts: { smoothScrollTop: false } })

    await user.click(screen.getByRole('button', { name: 'go' }))
    expect(spy).toHaveBeenCalledWith({ top: 0 })
  })
})
