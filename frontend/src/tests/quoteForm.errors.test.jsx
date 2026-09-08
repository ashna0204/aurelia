import { describe, it, expect, vi, afterEach } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { server } from './server'
import { validationError, stringError, serverError, networkError } from './handlers'
import QuotePage from '../pages/QuotePage'
import { renderWithProviders } from './renderWithProviders'

afterEach(() => vi.restoreAllMocks())

async function submitValid(user) {
  vi.spyOn(Date, 'now').mockReturnValue(1000)
  renderWithProviders(<QuotePage />)
  await user.click(screen.getAllByRole('radio')[0])
  await user.type(screen.getByLabelText(/Product specification/), 'We need 500kg of Matta Rice, FOB Kochi.')
  await user.type(screen.getByLabelText(/^Name/), 'Priya Menon')
  await user.type(screen.getByLabelText(/Work email/), 'priya@example.com')
  Date.now.mockReturnValue(10_000) // clear the anti-bot speed bump
  await user.click(screen.getByRole('button', { name: /Submit Enquiry/i }))
}

describe('QuotePage — server error states', () => {
  it('renders a formatted 422 error and keeps the form data', async () => {
    server.use(
      validationError('/api/quotes/', [
        { loc: ['body', 'email'], msg: 'value is not a valid email address', type: 'value_error' },
      ]),
    )
    const user = userEvent.setup()
    await submitValid(user)

    expect(await screen.findByText(/Email: value is not a valid email address/)).toBeInTheDocument()
    // Form still present, specification preserved — the success screen did not appear.
    expect(screen.getByLabelText(/Product specification/)).toHaveValue('We need 500kg of Matta Rice, FOB Kochi.')
    expect(screen.queryByText('Enquiry Received')).not.toBeInTheDocument()
  })

  it('renders a 500 error without crashing', async () => {
    server.use(serverError('/api/quotes/'))
    const user = userEvent.setup()
    await submitValid(user)

    expect(await screen.findByText(/Submission failed\. Please try again\./)).toBeInTheDocument()
  })

  it('renders the rate-limit (429) message', async () => {
    server.use(stringError('/api/quotes/', 429, 'Too many requests. Please wait a moment and try again.'))
    const user = userEvent.setup()
    await submitValid(user)

    expect(await screen.findByText(/Too many requests/)).toBeInTheDocument()
  })

  it('renders a friendly message on network failure', async () => {
    server.use(networkError('/api/quotes/'))
    const user = userEvent.setup()
    await submitValid(user)

    expect(await screen.findByText(/Unable to reach the server/)).toBeInTheDocument()
  })
})
