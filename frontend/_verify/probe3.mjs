import { chromium } from 'playwright'
const b = await chromium.launch()
const p = await b.newPage({ viewport: { width: 1440, height: 900 } })
await p.goto('http://localhost:5175/', { waitUntil: 'networkidle' })
await p.waitForTimeout(1500)
console.log(await p.evaluate(() => window.__ST.getAll().map(t => ({
  id: t.vars.id || '-', start: Math.round(t.start), end: Math.round(t.end),
  dur: t.animation ? +t.animation.duration().toFixed(3) : null,
}))).then(a => JSON.stringify(a.filter(t => t.end - t.start > 200), null, 1)))
for (const y of [2000, 2500]) {
  await p.evaluate(v => window.scrollTo(0, v), y)
  await p.waitForTimeout(1500)
  console.log(y, await p.evaluate(() => {
    const t = window.__ST.getById('trade-map-scrub')
    return JSON.stringify({ progress: +t.progress.toFixed(3), animTime: +t.animation.time().toFixed(3), animDur: +t.animation.duration().toFixed(3) })
  }))
}
await b.close()
