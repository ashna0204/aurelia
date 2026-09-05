import { describe, it, expect } from 'vitest'
import { LAND_DOTS, DOT_SPACING, projectLon, projectLat } from '../utils/worldMapBackdrop'
import { LAND_CELLS } from '../data/worldDots'
import { NODES } from '../utils/tradeRoutes'

/** Real coordinates of the places the route map names — the fit's anchors. */
const PLACES = {
  kochi: { lon: 76.27, lat: 9.93 },
  dubai: { lon: 55.27, lat: 25.2 },
  london: { lon: -0.13, lat: 51.51 },
  rotterdam: { lon: 4.48, lat: 51.92 },
  newYork: { lon: -74.01, lat: 40.71 },
  singapore: { lon: 103.82, lat: 1.35 },
  sydney: { lon: 151.21, lat: -33.87 },
  nairobi: { lon: 36.82, lat: -1.29 },
}

describe('world map backdrop', () => {
  it('puts every city exactly under the node that names it', () => {
    for (const [key, place] of Object.entries(PLACES)) {
      expect(projectLon(place.lon)).toBeCloseTo(NODES[key].x, 6)
    }
  })

  it('keeps every city within a dot or two of its node vertically', () => {
    // Latitude is a single straight line through all eight nodes rather than an
    // exact interpolation, so a node may sit slightly off its own coastline —
    // near enough at this scale, and the cost of a map that is not warped
    // vertically as well as horizontally.
    for (const [key, place] of Object.entries(PLACES)) {
      expect(Math.abs(projectLat(place.lat) - NODES[key].y)).toBeLessThan(5 * DOT_SPACING)
    }
  })

  it('runs west to east and north to south', () => {
    for (let lon = -180; lon < 180; lon += 5) {
      expect(projectLon(lon + 5)).toBeGreaterThan(projectLon(lon))
    }
    for (let lat = 78; lat > -56; lat -= 5) {
      expect(projectLat(lat - 5)).toBeGreaterThan(projectLat(lat))
    }
  })

  it('spans the map viewBox without overflowing it sideways', () => {
    expect(projectLon(-180)).toBeLessThan(NODES.newYork.x)
    expect(projectLon(180)).toBeGreaterThan(NODES.sydney.x)
    expect(projectLon(180)).toBeLessThan(1200)
  })

  it('draws every land cell once, as a zero-length subpath', () => {
    const dots = (d) => d.match(/M[-\d.]+ [-\d.]+h0/g) ?? []
    const base = dots(LAND_DOTS.base)
    const highlighted = dots(LAND_DOTS.highlighted)

    expect(base.length + highlighted.length).toBe(LAND_CELLS.length)
    expect(base.join('') + highlighted.join('')).toBe(LAND_DOTS.base + LAND_DOTS.highlighted)
    // The operating regions are a small part of the world, and not an empty one.
    expect(highlighted.length).toBeGreaterThan(0)
    expect(highlighted.length).toBeLessThan(base.length / 4)
  })

  it('spaces dots to match the grid they were sampled on', () => {
    expect(DOT_SPACING).toBeGreaterThan(0)
    expect(projectLat(0) - projectLat(134 / 82)).toBeCloseTo(DOT_SPACING, 6)
  })
})
