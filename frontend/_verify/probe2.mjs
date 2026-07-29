import { chromium } from 'playwright'
const b = await chromium.launch()
const p = await b.newPage({ viewport: { width: 1440, height: 900 } })
await p.goto('http://localhost:5175/', { waitUntil: 'networkidle' })
await p.waitForTimeout(1500)
const info = await p.evaluate(() => {
  const ST = window.ScrollTrigger
  return { hasGlobal: !!ST }
})
console.log('ScrollTrigger on window?', info.hasGlobal)
for (const y of [1500, 2000, 2500, 2900]) {
  await p.evaluate(v => window.scrollTo(0, v), y)
  await p.waitForTimeout(1500)
  const r = await p.evaluate(() => {
    const routes = [...document.querySelectorAll('[data-route]')]
    return {
      count: routes.length,
      styles: routes.map(r => ({
        inline: r.style.strokeDashoffset,
        computed: getComputedStyle(r).strokeDashoffset,
        attr: r.getAttribute('stroke-dashoffset'),
        inSection: !!r.closest('#trade-routes'),
      })),
    }
  })
  console.log(`scroll ${y}:`, JSON.stringify(r))
}
await b.close()
