import { describe, it, expect } from 'vitest'
import {
  CELL,
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

  it('places the four offices inside the viewBox, west to east', () => {
    const kochi = project(PLACES.kochi.lon, PLACES.kochi.lat)
    const london = project(PLACES.london.lon, PLACES.london.lat)
    const dubai = project(PLACES.dubai.lon, PLACES.dubai.lat)

    for (const point of [kochi, london, dubai]) {
      expect(point.x).toBeGreaterThan(0)
      expect(point.x).toBeLessThan(VIEW_W)
      expect(point.y).toBeGreaterThan(0)
      expect(point.y).toBeLessThan(VIEW_H)
    }
    // London is west of Dubai, which is west of Kochi; London is furthest north.
    expect(london.x).toBeLessThan(dubai.x)
    expect(dubai.x).toBeLessThan(kochi.x)
    expect(london.y).toBeLessThan(kochi.y)
  })
})

describe('regions', () => {
  it('contains the offices they exist to highlight', () => {
    expect(inRegion(PLACES.kochi.lon, PLACES.kochi.lat, REGIONS.southAsia)).toBe(true)
    expect(inRegion(PLACES.mumbai.lon, PLACES.mumbai.lat, REGIONS.southAsia)).toBe(true)
    expect(inRegion(PLACES.dubai.lon, PLACES.dubai.lat, REGIONS.gulf)).toBe(true)
    expect(inRegion(PLACES.london.lon, PLACES.london.lat, REGIONS.uk)).toBe(true)
  })

  it('excludes coordinates outside the box', () => {
    expect(inRegion(-60, -20, REGIONS.southAsia)).toBe(false)
    expect(inRegion(PLACES.london.lon, PLACES.london.lat, REGIONS.gulf)).toBe(false)
  })
})

describe('routes', () => {
  it('starts the main lane at Kochi and bends through two segments', () => {
    const kochi = project(PLACES.kochi.lon, PLACES.kochi.lat)
    expect(ROUTES.main.d.startsWith(`M ${kochi.x.toFixed(1)} ${kochi.y.toFixed(1)}`)).toBe(true)
    // Kochi → Dubai → London is two quadratic segments on one path, which is
    // what lets the container follow it without jumping.
    expect(ROUTES.main.d.match(/Q/g)).toHaveLength(2)
    expect(ROUTES.coastal.d.match(/Q/g)).toHaveLength(1)
  })

  it('ends the main lane at London', () => {
    const london = project(PLACES.london.lon, PLACES.london.lat)
    expect(ROUTES.main.d.endsWith(`${london.x.toFixed(1)} ${london.y.toFixed(1)}`)).toBe(true)
  })

  it('bows every lane above the straight chord between its endpoints', () => {
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
    expect(d).toBe('M5 5h0M15 25h0')
    expect(dotsPath([])).toBe('')
  })
})
