import { describe, it, expect } from 'vitest'
import {
  BRANCH_ROUTES,
  CELL,
  CORRIDOR_STOPS,
  PLACES,
  REGIONS,
  ROUTES,
  VIEW_H,
  VIEW_W,
  cellToLonLat,
  dotsPath,
  inRegion,
  project,
  routePath,
} from '../lib/worldMap'
import { GRID_COLS, GRID_ROWS, LAND_CELLS } from '../data/worldDots'

describe('projection', () => {
  it('maps the corners of the world onto the corners of the viewBox', () => {
    expect(project(-180, 78)).toEqual({ x: 0, y: 0 })
    const bottomRight = project(180, -56)
    expect(bottomRight.x).toBeCloseTo(VIEW_W)
    expect(bottomRight.y).toBeCloseTo(VIEW_H)
  })

  it('is the exact inverse of the dot grid, so cities land on cells', () => {
    // The centre of cell (c, r) must project back to that cell's centre.
    for (const [col, row] of [
      [0, 0],
      [55, 20],
      [GRID_COLS - 1, GRID_ROWS - 1],
    ]) {
      const { lon, lat } = cellToLonLat(col, row)
      const { x, y } = project(lon, lat)
      expect(x).toBeCloseTo(col * CELL + CELL / 2)
      expect(y).toBeCloseTo(row * CELL + CELL / 2)
    }
  })

  it('places all eight places inside the viewBox', () => {
    for (const key of Object.keys(PLACES)) {
      const { x, y } = project(PLACES[key].lon, PLACES[key].lat)
      expect(x).toBeGreaterThan(0)
      expect(x).toBeLessThan(VIEW_W)
      expect(y).toBeGreaterThan(0)
      expect(y).toBeLessThan(VIEW_H)
    }
  })

  it('orders the corridor west to east: London, Dubai, Kochi', () => {
    const kochi = project(PLACES.kochi.lon, PLACES.kochi.lat)
    const london = project(PLACES.london.lon, PLACES.london.lat)
    const dubai = project(PLACES.dubai.lon, PLACES.dubai.lat)

    expect(london.x).toBeLessThan(dubai.x)
    expect(dubai.x).toBeLessThan(kochi.x)
    expect(london.y).toBeLessThan(kochi.y)
  })
})

describe('regions', () => {
  it('contains the hubs they exist to highlight', () => {
    expect(inRegion(PLACES.kochi.lon, PLACES.kochi.lat, REGIONS.southAsia)).toBe(true)
    expect(inRegion(PLACES.dubai.lon, PLACES.dubai.lat, REGIONS.gulf)).toBe(true)
    expect(inRegion(PLACES.london.lon, PLACES.london.lat, REGIONS.uk)).toBe(true)
  })

  it('excludes coordinates outside the box', () => {
    expect(inRegion(-60, -20, REGIONS.southAsia)).toBe(false)
    expect(inRegion(PLACES.london.lon, PLACES.london.lat, REGIONS.gulf)).toBe(false)
  })
})

describe('the main corridor', () => {
  it('is Kochi, Dubai, London — the three the container itself visits', () => {
    expect(CORRIDOR_STOPS).toEqual(['kochi', 'dubai', 'london'])
  })

  it('starts at Kochi and bends through two segments', () => {
    const kochi = project(PLACES.kochi.lon, PLACES.kochi.lat)
    expect(ROUTES.corridor.d.startsWith(`M ${kochi.x.toFixed(1)} ${kochi.y.toFixed(1)}`)).toBe(
      true,
    )
    // Kochi → Dubai → London is two quadratic segments on one path, which is
    // what lets the container follow it without jumping.
    expect(ROUTES.corridor.d.match(/Q/g)).toHaveLength(2)
  })

  it('ends at London', () => {
    const london = project(PLACES.london.lon, PLACES.london.lat)
    expect(ROUTES.corridor.d.endsWith(`${london.x.toFixed(1)} ${london.y.toFixed(1)}`)).toBe(true)
  })

  it('bows above the straight chord between its endpoints', () => {
    // The control point's y must sit above (i.e. less than) the midpoint of
    // the two endpoints, or the arc reads as a sag rather than a great circle.
    const d = routePath(['kochi', 'dubai'])
    const [, cx, cy] = d.match(/Q ([\d.]+) ([\d.]+) ([\d.]+) ([\d.]+)/).map(Number)
    const kochi = project(PLACES.kochi.lon, PLACES.kochi.lat)
    const dubai = project(PLACES.dubai.lon, PLACES.dubai.lat)
    expect(cy).toBeLessThan((kochi.y + dubai.y) / 2)
    expect(cx).toBeGreaterThan(0)
  })
})

describe('branch routes', () => {
  it('covers the five destinations off the two hubs, each a single arc', () => {
    const destinations = BRANCH_ROUTES.map((b) => b.to).sort()
    expect(destinations).toEqual(['nairobi', 'newYork', 'rotterdam', 'singapore', 'sydney'])
    for (const branch of BRANCH_ROUTES) {
      expect(branch.d.match(/Q/g)).toHaveLength(1)
      const from = project(PLACES[branch.from].lon, PLACES[branch.from].lat)
      expect(branch.d.startsWith(`M ${from.x.toFixed(1)} ${from.y.toFixed(1)}`)).toBe(true)
    }
  })

  it('never follows the corridor hubs as its own destination', () => {
    const destinations = BRANCH_ROUTES.map((b) => b.to)
    expect(destinations).not.toContain('kochi')
    expect(destinations).not.toContain('dubai')
  })
})

describe('dot grid', () => {
  it('decodes to in-range cells', () => {
    expect(LAND_CELLS.length).toBeGreaterThan(1000)
    for (const [col, row] of LAND_CELLS) {
      expect(col).toBeGreaterThanOrEqual(0)
      expect(col).toBeLessThan(GRID_COLS)
      expect(row).toBeGreaterThanOrEqual(0)
      expect(row).toBeLessThan(GRID_ROWS)
    }
  })

  it('renders one zero-length subpath per cell', () => {
    const d = dotsPath([
      [0, 0],
      [1, 2],
    ])
    expect(d).toBe('M2.5 2.5h0M7.5 12.5h0')
    expect(dotsPath([])).toBe('')
  })
})
