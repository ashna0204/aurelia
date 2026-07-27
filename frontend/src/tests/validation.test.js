import { describe, it, expect } from 'vitest'
import {
  isValidEmail,
  validatePhone,
  validateQuoteForm,
  validateContactForm,
} from '../utils/validation'
import { LIMITS } from '../constants/quoteForm'

describe('isValidEmail', () => {
  it('accepts a normal address', () => {
    expect(isValidEmail('a@b.com')).toBe(true)
  })
  it('rejects a missing domain', () => {
    expect(isValidEmail('a@b')).toBe(false)
    expect(isValidEmail('not-an-email')).toBe(false)
  })
})

describe('validatePhone', () => {
  it('treats empty as valid (optional field)', () => {
    expect(validatePhone('')).toBeNull()
    expect(validatePhone(undefined)).toBeNull()
  })
  it('accepts a well-formed international number', () => {
    expect(validatePhone('+44 20 7946 0958')).toBeNull()
  })
  it('rejects letters', () => {
    expect(validatePhone('call me')).toMatch(/digits/)
  })
  it('rejects too few digits', () => {
    expect(validatePhone('12345')).toMatch(/7.*15 digits/)
  })
  it('rejects over the length cap', () => {
    expect(validatePhone('1'.repeat(LIMITS.PHONE_MAX + 1))).toMatch(/characters or fewer/)
  })
})

describe('validateQuoteForm', () => {
  const valid = {
    sector: 'Ethnic Food & Grocery',
    description: 'We need 500kg of Matta Rice, FOB Kochi.',
    name: 'Priya Menon',
    email: 'priya@example.com',
    company: '',
    phone: '',
    destination: '',
    notes: '',
  }

  it('returns no errors for a valid form', () => {
    expect(validateQuoteForm(valid)).toEqual({})
  })
  it('flags a missing sector', () => {
    expect(validateQuoteForm({ ...valid, sector: '' }).sector).toBeDefined()
  })
  it('flags a too-short description', () => {
    expect(validateQuoteForm({ ...valid, description: 'short' }).description).toMatch(/at least/)
  })
  it('flags a bad email', () => {
    expect(validateQuoteForm({ ...valid, email: 'nope' }).email).toBeDefined()
  })
  it('flags a short name', () => {
    expect(validateQuoteForm({ ...valid, name: 'A' }).name).toBeDefined()
  })
  it('orders keys with sector first (topmost problem)', () => {
    const errors = validateQuoteForm({ ...valid, sector: '', name: 'A' })
    expect(Object.keys(errors)[0]).toBe('sector')
  })
  it('flags an over-long email even when otherwise valid', () => {
    const longEmail = `${'a'.repeat(LIMITS.EMAIL_MAX)}@example.com`
    expect(validateQuoteForm({ ...valid, email: longEmail }).email).toMatch(/characters or fewer/)
  })

  it('flags an over-long description', () => {
    expect(validateQuoteForm({ ...valid, description: 'x'.repeat(LIMITS.DESCRIPTION_MAX + 1) }).description).toMatch(/under/)
  })

  it('flags oversized company / destination / notes', () => {
    expect(validateQuoteForm({ ...valid, company: 'x'.repeat(LIMITS.COMPANY_MAX + 1) }).company).toBeDefined()
    expect(validateQuoteForm({ ...valid, destination: 'x'.repeat(LIMITS.DESTINATION_MAX + 1) }).destination).toBeDefined()
    expect(validateQuoteForm({ ...valid, notes: 'x'.repeat(LIMITS.NOTES_MAX + 1) }).notes).toBeDefined()
  })
})

describe('validateContactForm', () => {
  const valid = { name: 'Sam Okafor', email: 'sam@example.com', company: '', message: 'Hello there, we would like to talk.' }

  it('returns no errors for a valid form', () => {
    expect(validateContactForm(valid)).toEqual({})
  })
  it('flags a short name', () => {
    expect(validateContactForm({ ...valid, name: 'S' }).name).toBeDefined()
  })
  it('flags an over-long name', () => {
    expect(validateContactForm({ ...valid, name: 'x'.repeat(LIMITS.NAME_MAX + 1) }).name).toMatch(/characters or fewer/)
  })
  it('flags a bad email', () => {
    expect(validateContactForm({ ...valid, email: 'bad' }).email).toBeDefined()
  })
  it('flags an over-long email', () => {
    const longEmail = `${'a'.repeat(LIMITS.EMAIL_MAX)}@example.com`
    expect(validateContactForm({ ...valid, email: longEmail }).email).toMatch(/characters or fewer/)
  })
  it('flags a too-short message', () => {
    expect(validateContactForm({ ...valid, message: 'hi' }).message).toMatch(/at least/)
  })
  it('flags a too-long message', () => {
    expect(validateContactForm({ ...valid, message: 'x'.repeat(LIMITS.MESSAGE_MAX + 1) }).message).toMatch(/under/)
  })
})
