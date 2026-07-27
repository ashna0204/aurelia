import { describe, it, expect } from 'vitest'
import { colors, fonts } from '../theme'

describe('theme tokens', () => {
  it('exposes the brand palette', () => {
    expect(colors.gold).toBe('#C8963E')
    expect(colors.forest).toBe('#071E12')
    expect(colors.error).toBe('#e07060')
  })

  it('exposes the type families', () => {
    expect(fonts.serif).toMatch(/Playfair Display/)
    expect(fonts.sans).toMatch(/DM Sans/)
  })
})
