import { render } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'

/**
 * Render a component inside the providers it needs — currently just the
 * router (react-router-dom 7) started at a given route.
 *
 * @param {React.ReactElement} ui
 * @param {{ route?: string }} [options]
 */
export function renderWithProviders(ui, { route = '/' } = {}) {
  return render(<MemoryRouter initialEntries={[route]}>{ui}</MemoryRouter>)
}
