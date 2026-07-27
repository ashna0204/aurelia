import { describe, it, expect, vi, afterEach } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { server } from './server'
import QuotePage from '../pages/QuotePage'
import { renderWithProviders } from './renderWithProviders'

afterEach(() => vi.restoreAllMocks())

async function fillValidForm(user) {
  await user.click(screen.getAllByRole('radio')[0]) // Ethnic Food & Grocery
  await user.type(screen.getByLabelText(/What do you need/), 'We need 500kg of Matta Rice, FOB Kochi.')
  await user.type(screen.getByLabelText(/Full Name/), 'Priya Menon')
  await user.type(screen.getByLabelText(/^Email/), 'priya@example.com')
}

describe('QuotePage — rendering', () => {
  it('renders every field with an accessible label', () => {
    renderWithProviders(<QuotePage />)
    expect(screen.getByText('Sector *')).toBeInTheDocument()
    expect(screen.getByLabelText(/What do you need/)).toBeInTheDocument()
    expect(screen.getByLabelText(/Full Name/)).toBeInTheDocument()
    expect(screen.getByLabelText(/^Email/)).toBeInTheDocument()
    expect(screen.getByLabelText(/Company/)).toBeInTheDocument()
    expect(screen.getByLabelText(/Phone/)).toBeInTheDocument()
    expect(screen.getByLabelText(/Est. Volume/)).toBeInTheDocument()
    expect(screen.getByLabelText(/Frequency/)).toBeInTheDocument()
    expect(screen.getByLabelText(/Destination/)).toBeInTheDocument()
    expect(screen.getByLabelText(/Additional Notes/)).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(/Tell us what/)
  })
})

describe('QuotePage — validation', () => {
  it('shows inline errors and calls no API on an empty submit', async () => {
    let hit = false
    server.use(http.post('*/api/quotes/', () => { hit = true; return HttpResponse.json({}) }))
    const user = userEvent.setup()
    renderWithProviders(<QuotePage />)

    await user.click(screen.getByRole('button', { name: /Submit Quote Request/i }))

    expect(screen.getByText('Please select a sector.')).toBeInTheDocument()
    expect(screen.getByText(/Please correct the/)).toBeInTheDocument()
    expect(hit).toBe(false)
  })

  it('clears the sector error as soon as a sector is chosen', async () => {
    const user = userEvent.setup()
    renderWithProviders(<QuotePage />)

    await user.click(screen.getByRole('button', { name: /Submit Quote Request/i }))
    expect(screen.getByText('Please select a sector.')).toBeInTheDocument()

    await user.click(screen.getAllByRole('radio')[0])
    expect(screen.queryByText('Please select a sector.')).not.toBeInTheDocument()
  })
})

describe('QuotePage — submission', () => {
  it('sends the correct request body and shows the success screen', async () => {
    vi.spyOn(Date, 'now').mockReturnValue(1000)
    let captured
    server.use(
      http.post('*/api/quotes/', async ({ request }) => {
        captured = await request.json()
        return HttpResponse.json({ success: true, message: 'ok', id: 7 }, { status: 200 })
      }),
    )
    const user = userEvent.setup()
    renderWithProviders(<QuotePage />)
    await fillValidForm(user)

    // Move the clock past the anti-bot minimum fill time before submitting.
    Date.now.mockReturnValue(10_000)
    await user.click(screen.getByRole('button', { name: /Submit Quote Request/i }))

    await screen.findByText('Quote Request Received')
    expect(captured.products).toEqual(['Ethnic Food & Grocery'])
    expect(captured.name).toBe('Priya Menon')
    expect(captured.email).toBe('priya@example.com')
    expect(captured.message).toContain('Matta Rice')

    // The success screen echoes the chosen sector and offers a way home.
    expect(screen.getByText('Sector: Ethnic Food & Grocery')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /Back to Home/i }))
  })

  it('blocks a suspiciously fast submission (anti-bot speed bump)', async () => {
    vi.spyOn(Date, 'now').mockReturnValue(1000) // never advances → too fast
    let hit = false
    server.use(http.post('*/api/quotes/', () => { hit = true; return HttpResponse.json({}) }))
    const user = userEvent.setup()
    renderWithProviders(<QuotePage />)
    await fillValidForm(user)

    await user.click(screen.getByRole('button', { name: /Submit Quote Request/i }))

    expect(await screen.findByText(/submitted unusually quickly/)).toBeInTheDocument()
    expect(screen.queryByText('Quote Request Received')).not.toBeInTheDocument()
    expect(hit).toBe(false)
  })
})
