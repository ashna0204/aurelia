import { describe, it, expect } from 'vitest'
import { http, HttpResponse } from 'msw'
import { server } from './server'
import { submitQuote, submitContact } from '../api/client'
import { validationError, stringError, networkError } from './handlers'

describe('submitQuote', () => {
  it('posts to /api/quotes/ and returns the parsed body', async () => {
    let captured
    server.use(
      http.post('*/api/quotes/', async ({ request }) => {
        captured = await request.json()
        return HttpResponse.json({ success: true, message: 'ok', id: 42 }, { status: 200 })
      }),
    )

    const result = await submitQuote({
      name: 'Priya',
      email: 'p@example.com',
      products: ['Ethnic Food & Grocery'],
      message: 'Need rice please',
      company: '',
      phone: '',
    })

    expect(result.id).toBe(42)
    // Required fields sent; blank optionals stripped by omitBlank.
    expect(captured.name).toBe('Priya')
    expect(captured.products).toEqual(['Ethnic Food & Grocery'])
    expect(captured).not.toHaveProperty('company')
    expect(captured).not.toHaveProperty('phone')
  })

  it('keeps non-blank optional fields', async () => {
    let captured
    server.use(
      http.post('*/api/quotes/', async ({ request }) => {
        captured = await request.json()
        return HttpResponse.json({ success: true, message: 'ok', id: 1 }, { status: 200 })
      }),
    )

    await submitQuote({
      name: 'Priya',
      email: 'p@example.com',
      products: ['Ethnic Food & Grocery'],
      message: 'Need rice please',
      company: 'Menon Ltd',
    })

    expect(captured.company).toBe('Menon Ltd')
  })
})

describe('submitContact', () => {
  it('posts to /api/contact/ and resolves', async () => {
    const result = await submitContact({ name: 'Sam', email: 's@example.com', message: 'Hello there team' })
    expect(result.id).toBe(1)
  })
})

describe('error handling', () => {
  it('formats a FastAPI 422 detail array into a sentence', async () => {
    server.use(
      validationError('/api/quotes/', [
        { loc: ['body', 'email'], msg: 'value is not a valid email address', type: 'value_error' },
      ]),
    )

    await expect(
      submitQuote({ name: 'x', email: 'bad', products: ['Ethnic Food & Grocery'], message: 'whatever here' }),
    ).rejects.toThrow(/Email: value is not a valid email address/)
  })

  it('strips the "Value error, " prefix from custom-validator messages', async () => {
    server.use(
      validationError('/api/quotes/', [
        { loc: ['body', 'phone'], msg: 'Value error, must contain between 7 and 15 digits', type: 'value_error' },
      ]),
    )

    await expect(
      submitQuote({ name: 'x', email: 'a@b.com', products: ['Ethnic Food & Grocery'], message: 'whatever here' }),
    ).rejects.toThrow(/Phone: must contain between 7 and 15 digits/)
  })

  it('passes a string detail through unchanged and attaches the status', async () => {
    server.use(stringError('/api/contact/', 429, 'Too many requests. Please wait a moment and try again.'))

    try {
      await submitContact({ name: 'Sam', email: 's@example.com', message: 'Hello there team' })
      throw new Error('should have thrown')
    } catch (err) {
      expect(err.message).toMatch(/Too many requests/)
      expect(err.status).toBe(429)
    }
  })

  it('maps a network failure to a friendly message', async () => {
    server.use(networkError('/api/contact/'))

    await expect(
      submitContact({ name: 'Sam', email: 's@example.com', message: 'Hello there team' }),
    ).rejects.toThrow(/Unable to reach the server/)
  })

  it('labels an unknown field by its raw name', async () => {
    server.use(
      validationError('/api/quotes/', [
        { loc: ['body', 'mystery'], msg: 'is wrong', type: 'value_error' },
      ]),
    )
    await expect(
      submitQuote({ name: 'x', email: 'a@b.com', products: ['Ethnic Food & Grocery'], message: 'whatever here' }),
    ).rejects.toThrow(/mystery: is wrong/)
  })

  it('handles a detail item with no loc and no msg', async () => {
    server.use(validationError('/api/quotes/', [{ type: 'value_error' }]))
    await expect(
      submitQuote({ name: 'x', email: 'a@b.com', products: ['Ethnic Food & Grocery'], message: 'whatever here' }),
    ).rejects.toThrow(/is invalid/)
  })

  it('falls back to a generic message when the detail array is empty', async () => {
    server.use(validationError('/api/contact/', []))
    await expect(
      submitContact({ name: 'Sam', email: 's@example.com', message: 'Hello there team' }),
    ).rejects.toThrow(/Submission failed/)
  })

  it('falls back to a generic message when the error body is empty', async () => {
    server.use(http.post('*/api/quotes/', () => HttpResponse.json({}, { status: 500 })))

    await expect(
      submitQuote({ name: 'x', email: 'a@b.com', products: ['Ethnic Food & Grocery'], message: 'whatever here' }),
    ).rejects.toThrow(/Submission failed/)
  })
})
