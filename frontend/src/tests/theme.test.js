import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { colors, fonts, EASE_SOFT, GSAP_EASE } from '../theme'

describe('theme tokens', () => {
  it('exposes the brand palette', () => {
    expect(colors.forest).toBe('#071E12')
    expect(colors.forestDeep).toBe('#040F09')
    expect(colors.emerald).toBe('#0A2E1C')
    expect(colors.gold).toBe('#C8963E')
    expect(colors.goldDeep).toBe('#A67B2E')
    expect(colors.cream).toBe('#F5F0E8')
    expect(colors.error).toBe('#e07060')
    expect(colors.accent).toBe('#C8963E')
    expect(colors.bg).toBe('#071E12')
    expect(colors.ink).toBe('#F5F0E8')
  })

  it('exposes the type families and easing', () => {
    expect(fonts.serif).toMatch(/Playfair Display/)
    expect(fonts.sans).toMatch(/DM Sans/)
    expect(EASE_SOFT).toMatch(/cubic-bezier/)
    expect(GSAP_EASE).toBe('power3.out')
  })

  /**
   * tokens.css is the source of truth and theme.js mirrors it. Nothing at
   * runtime forces the two to agree, so this is the check that they still do —
   * a drift shows up as an inline SVG stroke in last season's blue.
   */
  it('agrees with tokens.css, which is what the browser actually renders', () => {
    // Read from the vitest root rather than `import.meta.url`: under the
    // jsdom environment that URL is an http one, which readFileSync rejects.
    const css = readFileSync(resolve(process.cwd(), 'src/styles/tokens.css'), 'utf8')
    const cssVar = (name) => css.match(new RegExp(`--color-${name}:\\s*([^;]+);`))?.[1]?.trim()

    const pairs = [
      ['bg', colors.bg],
      ['surface', colors.surface],
      ['ink', colors.ink],
      ['ink-soft', colors.inkSoft],
      ['accent', colors.accent],
      ['teal', colors.teal],
      ['gold', colors.gold],
      ['error', colors.error],
      ['success', colors.success],
      ['forest', colors.forest],
      ['forest-deep', colors.forestDeep],
      ['emerald', colors.emerald],
      ['gold-deep', colors.goldDeep],
      ['cream', colors.cream],
    ]

    for (const [name, value] of pairs) {
      expect(cssVar(name)).toBe(value.toLowerCase())
    }
  })
})
