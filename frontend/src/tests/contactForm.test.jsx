import { describe, it, expect } from 'vitest'
import { screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { server } from './server'
import { serverError } from './handlers'
import Home from '../pages/Home'
import { renderWithProviders } from './renderWithProviders'

async function fillContact(user) {
  await user.type(screen.getByLabelText(/^Name/), 'Sam Okafor')
  await user.type(screen.getByLabelText(/^Email/), 'sam@example.com')
  await user.type(screen.getByLabelText(/^Message/), 'We would like to discuss a recurring supply arrangement.')
}

describe('Home contact form', () => {
  it('has a single h1 and reacts to a scroll event without crashing', () => {
    renderWithProviders(<Home />)
    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1)
    fireEvent.scroll(window) // exercise the scroll-journey progress handler
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument()
  })

  it('submits successfully and shows the confirmation', async () => {
    let captured
    server.use(
      http.post('*/api/contact/', async ({ request }) => {
        captured = await request.json()
        return HttpResponse.json({ success: true, message: 'ok', id: 1 }, { status: 200 })
      }),
    )
    const user = userEvent.setup()
    renderWithProviders(<Home />)
    await fillContact(user)

    await user.click(screen.getByRole('button', { name: /Send Message/i }))

    expect(await screen.findByText('Message Sent')).toBeInTheDocument()
    expect(captured.name).toBe('Sam Okafor')
    expect(captured.email).toBe('sam@example.com')
  })

  it('shows inline errors on an empty submit and calls no API', async () => {
    let hit = false
    server.use(http.post('*/api/contact/', () => { hit = true; return HttpResponse.json({}) }))
    const user = userEvent.setup()
    renderWithProviders(<Home />)

    await user.click(screen.getByRole('button', { name: /Send Message/i }))

    expect(screen.getByText('Please enter your name.')).toBeInTheDocument()
    expect(screen.getByText(/Please correct the/)).toBeInTheDocument()
    expect(hit).toBe(false)
  })

  it('surfaces a server error and preserves the entered data', async () => {
    server.use(serverError('/api/contact/'))
    const user = userEvent.setup()
    renderWithProviders(<Home />)
    await fillContact(user)

    await user.click(screen.getByRole('button', { name: /Send Message/i }))

    expect(await screen.findByText(/Submission failed/)).toBeInTheDocument()
    expect(screen.getByLabelText(/^Message/)).toHaveValue(
      'We would like to discuss a recurring supply arrangement.',
    )
    expect(screen.queryByText('Message Sent')).not.toBeInTheDocument()
  })
})
