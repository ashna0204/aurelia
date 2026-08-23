import { describe, it, expect } from 'vitest'
import { NODES, ROUTES, NODE_TIMING, GRID_LINES, pointAtFraction } from '../utils/tradeRoutes'

describe('trade route geometry', () => {
  it('starts and ends every lane exactly on its two nodes', () => {
    for (const route of ROUTES) {
      const from = NODES[route.from]
      const to = NODES[route.to]
      expect(route.d).toBe(
        `M ${from.x},${from.y} C ${route.c1[0]},${route.c1[1]} ${route.c2[0]},${route.c2[1]} ${to.x},${to.y}`
      )
      expect(pointAtFraction(route, 0)).toEqual({ x: from.x, y: from.y })
      expect(pointAtFraction(route, 1)).toEqual({ x: to.x, y: to.y })
    }
  })

  it('gives every lane a unique id for <mpath> to reference', () => {
    const ids = ROUTES.map((r) => r.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('clamps out-of-range fractions to the endpoints', () => {
    const [route] = ROUTES
    expect(pointAtFraction(route, -3)).toEqual(pointAtFraction(route, 0))
    expect(pointAtFraction(route, 42)).toEqual(pointAtFraction(route, 1))
  })

  it('advances monotonically along the lane', () => {
    for (const route of ROUTES) {
      let previous = pointAtFraction(route, 0)
      let travelled = 0
      for (let i = 1; i <= 20; i++) {
        const point = pointAtFraction(route, i / 20)
        travelled += Math.hypot(point.x - previous.x, point.y - previous.y)
        previous = point
      }
      const direct = Math.hypot(
        NODES[route.to].x - NODES[route.from].x,
        NODES[route.to].y - NODES[route.from].y
      )
      // A curve is never shorter than the straight line between its ends.
      expect(travelled).toBeGreaterThanOrEqual(direct - 1e-9)
    }
  })

  it('spaces samples by arc length, not by curve parameter', () => {
    // The kochi→newYork lane swings hard, so equal steps in t would produce
    // visibly unequal steps on screen; equal steps in length should not.
    const route = ROUTES.find((r) => r.to === 'newYork')
    const steps = Array.from({ length: 10 }, (_, i) => {
      const a = pointAtFraction(route, i / 10)
      const b = pointAtFraction(route, (i + 1) / 10)
      return Math.hypot(b.x - a.x, b.y - a.y)
    })
    const min = Math.min(...steps)
    const max = Math.max(...steps)
    expect(max / min).toBeLessThan(1.5)
  })

  it('lights each node up as its first inbound lane lands', () => {
    for (const route of ROUTES) {
      expect(NODE_TIMING[route.to].arrive).toBeLessThanOrEqual(route.range[1])
    }
    // Kochi is the origin: it has no inbound lane and opens the sequence.
    expect(ROUTES.some((r) => r.to === 'kochi')).toBe(false)
    expect(NODE_TIMING.kochi.arrive).toBeLessThan(ROUTES[0].range[1])
  })

  it('covers every node with a reveal window ending at its arrival', () => {
    for (const key of Object.keys(NODES)) {
      const { arrive, reveal } = NODE_TIMING[key]
      expect(reveal[1]).toBe(arrive)
      expect(reveal[0]).toBeLessThan(arrive)
    }
  })

  it('builds a grid that spans the viewBox', () => {
    expect(GRID_LINES).toHaveLength(19)
    for (const line of GRID_LINES) {
      expect(Math.max(line.x1, line.x2)).toBeLessThanOrEqual(1200)
      expect(Math.max(line.y1, line.y2)).toBeLessThanOrEqual(500)
    }
  })
})
