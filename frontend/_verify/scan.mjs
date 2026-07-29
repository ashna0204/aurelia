import { chromium } from 'playwright'
const [url, prefix, w, h, ...ys] = process.argv.slice(2)
const b = await chromium.launch()
const p = await b.newPage({ viewport: { width: +w, height: +h } })
const errs = []
p.on('console', m => { if (m.type()==='error'||m.type()==='warning') errs.push(`[${m.type()}] ${m.text()}`) })
p.on('pageerror', e => errs.push(`[pageerror] ${e.message}`))
await p.goto(url, { waitUntil: 'networkidle' })
await p.waitForTimeout(1200)
console.log('docHeight', await p.evaluate(() => document.documentElement.scrollHeight))
for (const y of ys) {
  await p.evaluate(v => window.scrollTo(0, +v), y)
  await p.waitForTimeout(1200)
  await p.screenshot({ path: `${prefix}-${y}.png` })
}
console.log(errs.length ? 'CONSOLE:\n'+errs.join('\n') : 'CONSOLE: clean')
await b.close()
