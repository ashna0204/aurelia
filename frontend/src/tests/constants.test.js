import { describe, it, expect } from 'vitest'
import {
  SECTORS,
  LIMITS,
  REQUIREMENT_FIELDS,
  composeMessage,
} from '../constants/quoteForm'
import { EXPERTISE } from '../constants/expertise'

describe('enquiry form vocabulary', () => {
  it('offers each sourcing area plus the catch-all', () => {
    expect(SECTORS).toEqual([
      'Food & Grocery',
      'Automotive Components',
      'Healthcare & Pharmaceuticals',
      'Perfume Ingredients & Essential Oils',
      'Multiple / Other',
    ])
  })
  it('derives its categories from the four sourcing areas', () => {
    for (const area of EXPERTISE) expect(SECTORS).toContain(area.sector)
  })
})

describe('composeMessage', () => {
  const blank = Object.fromEntries(REQUIREMENT_FIELDS.map(({ key }) => [key, '']))

  it('leads with the unlabelled specification', () => {
    expect(composeMessage({ ...blank, specification: 'Need matta rice' })).toBe('Need matta rice')
  })
  it('appends each supplied field on its own labelled line', () => {
    const message = composeMessage({
      ...blank,
      specification: 'Need matta rice',
      quantity: '500 kg',
      targetMarket: 'United Kingdom',
    })
    expect(message).toBe('Need matta rice\nQuantity: 500 kg\nTarget market: United Kingdom')
  })
  it('omits blank fields entirely', () => {
    expect(composeMessage({ ...blank, specification: 'Need matta rice', notes: '   ' }))
      .toBe('Need matta rice')
  })
  it('trims every part', () => {
    expect(composeMessage({ ...blank, specification: '  Need matta rice  ', quantity: '  500 kg ' }))
      .toBe('Need matta rice\nQuantity: 500 kg')
  })
  it('tolerates a form missing the optional keys altogether', () => {
    expect(composeMessage({ specification: 'Need matta rice' })).toBe('Need matta rice')
  })
})

describe('LIMITS invariant', () => {
  // Every requirement field is folded into the API's single `message`, so the
  // per-field maxLength attributes are only sufficient if their worst case —
  // all fields full, plus the labels and newlines composeMessage inserts —
  // still fits under the server's ceiling. If it does not, a user who fills
  // the form to the brim gets an unexplained 422.
  const CAPS = {
    specification: LIMITS.SPECIFICATION_MAX,
    quantity: LIMITS.QUANTITY_MAX,
    targetMarket: LIMITS.TARGET_MARKET_MAX,
    packaging: LIMITS.PACKAGING_MAX,
    deliveryDate: LIMITS.DELIVERY_DATE_MAX,
    country: LIMITS.COUNTRY_MAX,
    notes: LIMITS.NOTES_MAX,
  }

  it('covers every requirement field', () => {
    expect(Object.keys(CAPS).sort()).toEqual(REQUIREMENT_FIELDS.map(({ key }) => key).sort())
  })

  it('keeps a fully-filled form under the server message ceiling', () => {
    const worstCase = Object.fromEntries(
      REQUIREMENT_FIELDS.map(({ key }) => [key, 'x'.repeat(CAPS[key])]),
    )
    expect(composeMessage(worstCase).length).toBeLessThan(LIMITS.MESSAGE_MAX)
  })

  it('matches the client-side message floor to the server minimum', () => {
    expect(LIMITS.MESSAGE_MIN).toBe(LIMITS.SPECIFICATION_MIN)
  })
})
