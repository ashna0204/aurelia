import { chromium } from 'playwright'
const b = await chromium.launch()
const p = await b.newPage({ viewport: { width: 1440, height: 900 } })
await p.goto('http://localhost:5175/', { waitUntil: 'networkidle' })
await p.waitForTimeout(1500)
await p.evaluate(() => window.scrollTo(0, 2000))
await p.waitForTimeout(1500)
console.log(await p.evaluate(() => {
  const t = window.__ST.getById('trade-map-scrub')
  const tl = t.animation
  return JSON.stringify(tl.getChildren().map(c => ({
    targets: c.targets().map(el => el.tagName + (el.id ? '#' + el.id : '') + (el.dataset.marker ? '@' + el.dataset.marker : '')),
    start: +c.startTime().toFixed(3),
    dur: +c.duration().toFixed(3),
    progress: +c.progress().toFixed(3),
    vars: Object.keys(c.vars).filter(k => k !== 'ease' && k !== 'duration'),
  })), null, 1)
}))
await b.close()
