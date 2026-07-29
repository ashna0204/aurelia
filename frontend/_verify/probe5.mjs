import { chromium } from 'playwright'
const b = await chromium.launch()
const p = await b.newPage({ viewport: { width: 1440, height: 900 } })
await p.goto('http://localhost:5175/', { waitUntil: 'networkidle' })
await p.waitForTimeout(1500)
await p.evaluate(() => window.scrollTo(0, 2000))
await p.waitForTimeout(1500)
console.log(await p.evaluate(() => {
  const t = window.__ST.getById('trade-map-scrub')
  const tween = t.animation.getChildren()[0]
  const el = tween.targets()[0]
  const all = window.__ST.getAll().filter(x => x.vars.id === 'trade-map-scrub')
  return JSON.stringify({
    triggersWithId: all.length,
    tweenProgress: +tween.progress().toFixed(3),
    inline: el.style.strokeDashoffset,
    ratio: tween.ratio,
    startEnd: JSON.stringify(tween._pt ? 'has proptween' : 'NO proptween'),
  }, null, 1)
}))
await b.close()
