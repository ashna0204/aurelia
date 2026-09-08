import { describe, it, expect, vi, afterEach } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { server } from './server'
import QuotePage from '../pages/QuotePage'
import { renderWithProviders } from './renderWithProviders'

afterEach(() => vi.restoreAllMocks())

async function fillValidForm(user) {
  await user.click(screen.getAllByRole('radio')[0]) // Food & Grocery
  await user.type(screen.getByLabelText(/Product specification/), 'We need 500kg of Matta Rice, FOB Kochi.')
  await user.type(screen.getByLabelText(/^Name/), 'Priya Menon')
  await user.type(screen.getByLabelText(/Work email/), 'priya@example.com')
}

describe('QuotePage — rendering', () => {
  it('renders every field with an accessible label', () => {
    renderWithProviders(<QuotePage />)
    for (const label of [
      /^Name/, /^Company/, /Work email/, /^Phone/, /^Country/,
      /Product specification/, /^Quantity/, /Target market/,
      /Packaging requirements/, /Target delivery location/,
      /Target delivery date/, /Additional information/,
    ]) {
      expect(screen.getByLabelText(label)).toBeInTheDocument()
    }
    expect(screen.getByText('Product or category *')).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(/Tell us what you are/)
  })

  it('groups the fields under the two headings from the rewrite', () => {
    renderWithProviders(<QuotePage />)
    expect(screen.getByText('Your details')).toBeInTheDocument()
    expect(screen.getByText('Your requirement')).toBeInTheDocument()
  })

  it('offers each sourcing area as a category', () => {
    renderWithProviders(<QuotePage />)
    for (const label of [
      'Food & Grocery',
      'Automotive Components',
      'Healthcare & Pharmaceuticals',
      'Perfume Ingredients & Essential Oils',
      'Multiple / Other',
    ]) {
      expect(screen.getByRole('radio', { name: label })).toBeInTheDocument()
    }
  })
})

describe('QuotePage — validation', () => {
  it('shows inline errors and calls no API on an empty submit', async () => {
    let hit = false
    server.use(http.post('*/api/quotes/', () => { hit = true; return HttpResponse.json({}) }))
    const user = userEvent.setup()
    renderWithProviders(<QuotePage />)

    await user.click(screen.getByRole('button', { name: /Submit Enquiry/i }))

    expect(screen.getByText('Please select a product or category.')).toBeInTheDocument()
    expect(screen.getByText(/Please correct the/)).toBeInTheDocument()
    expect(hit).toBe(false)
  })

  it('clears the category error as soon as a category is chosen', async () => {
    const user = userEvent.setup()
    renderWithProviders(<QuotePage />)

    await user.click(screen.getByRole('button', { name: /Submit Enquiry/i }))
    expect(screen.getByText('Please select a product or category.')).toBeInTheDocument()

    await user.click(screen.getAllByRole('radio')[0])
    expect(screen.queryByText('Please select a product or category.')).not.toBeInTheDocument()
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
    await user.type(screen.getByLabelText(/^Quantity/), '500 kg')
    await user.type(screen.getByLabelText(/Target delivery location/), 'Felixstowe')

    // Move the clock past the anti-bot minimum fill time before submitting.
    Date.now.mockReturnValue(10_000)
    await user.click(screen.getByRole('button', { name: /Submit Enquiry/i }))

    await screen.findByText('Enquiry Received')
    expect(captured.products).toEqual(['Food & Grocery'])
    expect(captured.name).toBe('Priya Menon')
    expect(captured.email).toBe('priya@example.com')
    expect(captured.destination).toBe('Felixstowe')
    // The fields with no API column of their own ride along in `message`.
    expect(captured.message).toContain('Matta Rice')
    expect(captured.message).toContain('Quantity: 500 kg')

    // The success screen echoes the chosen category and offers a way home.
    expect(screen.getByText('Product or category: Food & Grocery')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /Back to Home/i }))
  })

  it('blocks a suspiciously fast submission (anti-bot speed bump)', async () => {
    vi.spyOn(Date, 'now').mockReturnValue(1000) // never advances → too fast
    let hit = false
    server.use(http.post('*/api/quotes/', () => { hit = true; return HttpResponse.json({}) }))
    const user = userEvent.setup()
    renderWithProviders(<QuotePage />)
    await fillValidForm(user)

    await user.click(screen.getByRole('button', { name: /Submit Enquiry/i }))

    expect(await screen.findByText(/submitted unusually quickly/)).toBeInTheDocument()
    expect(screen.queryByText('Enquiry Received')).not.toBeInTheDocument()
    expect(hit).toBe(false)
  })
})
