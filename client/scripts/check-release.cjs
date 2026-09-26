const fs = require('node:fs')
const path = require('node:path')
const { JSDOM } = require('jsdom')

function checkRelease(navbar, footer, expected) {
  if (expected && !/^FB\d{4}_\d{2}$/.test(expected)) {
    throw new Error('FTYP_RELEASE must have the form FB2026_03')
  }
  const nav = new JSDOM(navbar).window.document
  const foot = new JSDOM(footer).window.document
  const labels = [
    nav.querySelector('#release-info'),
    nav.querySelector('#release-info-mobile'),
    foot.querySelector('#release'),
  ].map(element => element?.textContent.match(/\bFB\d{4}_\d{2}\b/)?.[0])
  if (labels.some(label => !label || label !== labels[0]) ||
      (expected && labels[0] !== expected)) {
    throw new Error('Stale or inconsistent FlyBase header/footer. Run yarn update-header-footer, review the HTML, and rebuild for FTYP_RELEASE.')
  }
  return labels[0]
}

if (require.main === module) {
  const root = path.resolve(__dirname, '../public')
  console.log('Embedded FlyBase release: ' + checkRelease(
    fs.readFileSync(path.join(root, 'navbar.html'), 'utf8'),
    fs.readFileSync(path.join(root, 'footer.html'), 'utf8'),
    process.env.FTYP_RELEASE
  ))
}
module.exports = { checkRelease }
