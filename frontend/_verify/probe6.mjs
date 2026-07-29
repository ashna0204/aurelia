import { chromium } from 'playwright'
const b = await chromium.launch()
const p = await b.newPage({ viewport: { width: 1440, height: 900 } })
await p.goto('http://localhost:5175/', { waitUntil: 'networkidle' })
await p.waitForTimeout(1500)
for (const y of [1800, 2200, 2600]) {
  await p.evaluate(v => window.scrollTo(0, v), y)
  await p.waitForTimeout(1600)
  console.log(y, await p.evaluate(() => {
    const t = window.__ST.getById('trade-map-scrub')
    const tween = t.animation.getChildren()[0]
    const el = tween.targets()[0]
    const dubai = document.querySelector("#trade-routes [data-marker='dubai']")
    return JSON.stringify({
      tlTime: +t.animation.time().toFixed(3),
      routeTweenProgress: +tween.progress().toFixed(3),
      routeInline: el.style.strokeDashoffset,
      routeAttrDasharray: el.getAttribute('stroke-dasharray'),
      routePathLength: el.getAttribute('pathLength'),
      dubaiOpacity: getComputedStyle(dubai).opacity,
    })
  }))
}
await b.close()
