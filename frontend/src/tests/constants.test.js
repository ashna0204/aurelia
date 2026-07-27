import { describe, it, expect } from 'vitest'
import {
  SECTORS,
  VOLUMES,
  FREQUENCIES,
  LIMITS,
  composeMessage,
} from '../constants/quoteForm'

describe('quote form vocabulary', () => {
  it('exposes the four sectors the API accepts', () => {
    expect(SECTORS).toContain('Ethnic Food & Grocery')
    expect(SECTORS).toHaveLength(4)
  })
  it('uses en dashes in the volume band labels', () => {
    // A hyphen here would silently 422 every submission — assert the exact glyph.
    expect(VOLUMES).toContain('1 – 5 MT')
  })
  it('lists the four frequencies', () => {
    expect(FREQUENCIES).toEqual(['One-time', 'Monthly', 'Quarterly', 'Ongoing contract'])
  })
})

describe('composeMessage', () => {
  it('joins description and notes with a labelled separator', () => {
    expect(composeMessage({ description: 'Need rice', notes: 'FOB only' })).toBe('Need rice\n\nNotes: FOB only')
  })
  it('omits the notes section when notes are blank', () => {
    expect(composeMessage({ description: 'Need rice', notes: '' })).toBe('Need rice')
  })
  it('trims both parts', () => {
    expect(composeMessage({ description: '  Need rice  ', notes: '  ' })).toBe('Need rice')
  })
})

describe('LIMITS invariant', () => {
  it('keeps description + separator + notes within the server message ceiling', () => {
    const worstCase = LIMITS.DESCRIPTION_MAX + '\n\nNotes: '.length + LIMITS.NOTES_MAX
    expect(worstCase).toBeLessThan(LIMITS.MESSAGE_MAX)
  })
})
