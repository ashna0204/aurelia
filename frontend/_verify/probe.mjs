import { chromium } from 'playwright'
const b = await chromium.launch()
const p = await b.newPage({ viewport: { width: 1440, height: 900 } })
await p.goto('http://localhost:5175/', { waitUntil: 'networkidle' })
await p.waitForTimeout(1200)
for (const y of [1200, 2000, 2900, 3600, 4000]) {
  await p.evaluate(v => window.scrollTo(0, v), y)
  await p.waitForTimeout(1400)
  const r = await p.evaluate(() => {
    const route = document.getElementById('route-corridor')
    const craft = document.querySelector('.will-change-transform')
    const map = document.getElementById('trade-route-map')
    const mb = map.getBoundingClientRect()
    const len = route.getTotalLength()
    const pathLen = Number(route.getAttribute('pathLength')) || 1
    const off = parseFloat(getComputedStyle(route).strokeDashoffset) || 0
    const drawn = 1 - off / pathLen
    const tip = route.getPointAtLength(drawn * len)
    const vb = map.getAttribute('viewBox').split(' ').map(Number)
    const s = mb.width / vb[2]
    return {
      drawnPct: +(drawn * 100).toFixed(1),
      tipX: +(mb.left + (tip.x - vb[0]) * s).toFixed(0),
      craftX: +(craft.getBoundingClientRect().left + craft.getBoundingClientRect().width / 2).toFixed(0),
      craftOpacity: getComputedStyle(craft).opacity,
    }
  })
  console.log(`scroll ${String(y).padStart(4)} → route drawn ${String(r.drawnPct).padStart(5)}%  tip x=${r.tipX}  container x=${r.craftX}  (lead ${r.craftX - r.tipX}px)  opacity ${r.craftOpacity}`)
}
await b.close()
