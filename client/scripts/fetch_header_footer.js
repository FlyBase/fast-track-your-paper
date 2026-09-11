const fs = require('fs')
const { chromium } = require('playwright')

;(async () => {
  const browser = await chromium.launch()
  try {
    const page = await browser.newPage()
    const response = await page.goto(
      process.env.FTYP_HEADER_SOURCE || 'https://flybase.org'
    )
    if (!response || response.status() !== 200) {
      throw new Error('Header source did not return a successful page')
    }
    const fragments = await page.evaluate(() => {
      const header = document.querySelector('#header2023')
      const mobile = document.querySelector('#stack-nav')
      const style = mobile?.previousElementSibling
      const script = header?.nextElementSibling
      const footer = document.querySelector('footer')?.closest('.container-fluid')
      if (!header || !mobile || style?.tagName !== 'STYLE' ||
          script?.tagName !== 'SCRIPT' || !footer) {
        throw new Error('Current FlyBase header/footer structure was not found')
      }
      const head = document.head.cloneNode(true)
      head.querySelector('title').textContent = 'Fast Track Your Paper'
      const canonical = head.querySelector('link[rel="canonical"]')
      if (!canonical) throw new Error('FlyBase canonical URL was not found')
      canonical.href = 'https://flybase.org/submission/publication/'
      const headerClone = header.cloneNode(true)
      const pageName = headerClone.querySelector('#page-name')
      if (!pageName) throw new Error('FlyBase page title was not found')
      pageName.textContent = 'Fast-Track Your Paper'
      const mobileClone = mobile.cloneNode(true)
      for (const root of [headerClone, mobileClone]) {
        for (const link of root.querySelectorAll('a[href="/wiki/FlyBase:Fast-Track_Your_Paper"]')) {
          link.href = 'https://wiki.flybase.org/wiki/FlyBase:Fast-Track_Your_Paper'
          link.textContent = 'Fast-Track Your Paper Help'
        }
      }
      const footerClone = footer.cloneNode(true)
      // Shared main-site assets retain root ownership under the nested app URL.
      for (const root of [head, headerClone, mobileClone, footerClone]) {
        for (const element of root.querySelectorAll('[src], [href]')) {
          for (const attr of ['src', 'href']) {
            const value = element.getAttribute(attr)
            if (value?.startsWith('http://flybase.org/')) {
              element.setAttribute(attr, value.slice('http://flybase.org'.length))
            } else if (value?.startsWith('images/')) {
              element.setAttribute(attr, '/' + value)
            }
          }
        }
        for (const css of root.querySelectorAll('style')) {
          css.textContent = css.textContent.replace(/url\((["']?)images\//g, 'url($1/images/')
        }
      }
      return {
        head: head.innerHTML,
        navbar: [style.outerHTML, mobileClone.outerHTML, headerClone.outerHTML, script.outerHTML].join('\n'),
        footer: footerClone.outerHTML,
      }
    })
    for (const [name, html] of Object.entries(fragments)) {
      fs.writeFileSync('public/' + name + '.html', html)
    }
  } finally {
    await browser.close()
  }
})().catch(error => {
  console.error(error.message)
  process.exitCode = 1
})
