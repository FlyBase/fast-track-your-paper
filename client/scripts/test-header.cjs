const { test } = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const os = require('node:os')
const path = require('node:path')
const { execFileSync } = require('node:child_process')
const { JSDOM } = require('jsdom')
const root = path.resolve(__dirname, '..')
function fixture(t) {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'ftyp-header-'))
  t.after(() => fs.rmSync(tmp, { recursive: true, force: true }))
  for (const dir of ['public', 'header', 'scripts'])
    fs.cpSync(path.join(root, dir), path.join(tmp, dir), { recursive: true })
  fs.symlinkSync(path.join(root, 'node_modules'), path.join(tmp, 'node_modules'))
  execFileSync(process.execPath, [path.join(tmp, 'scripts/assemble-index.cjs')])
  return { tmp, prepare: () => execFileSync(process.execPath, [path.join(tmp, 'scripts/prepare-index.cjs')], { env: { ...process.env, PUBLIC_URL: '/submission/publication' }, stdio: 'pipe' }) }
}
const retainedScripts = doc => [...doc.querySelectorAll('script')].filter(el => !el.src || /analytics|autotrack|recovery-maintenance/.test(el.src)).map(el => el.outerHTML)
test('production output preserves analytics, maintenance and native header code while replacing legacy dependencies', t => {
  const { tmp, prepare } = fixture(t)
  const original = fs.readFileSync(path.join(tmp, 'public/index.html'), 'utf8')
  const before = new JSDOM(original).window.document
  prepare()
  const generated = fs.readFileSync(path.join(tmp, 'index.html'), 'utf8')
  const after = new JSDOM(generated).window.document
  assert.deepEqual(retainedScripts(after), retainedScripts(before))
  assert.equal(after.querySelectorAll('script[src^="/js/"]').length, 3)
  assert.equal(after.querySelectorAll('script[src*="jquery"], script[src*="simpleStorage"], script[src*="typeahead"]').length, 0)
  assert.equal(after.querySelectorAll('#header2023 [data-bs-toggle="dropdown"], #stack-nav [data-bs-toggle="dropdown"]').length, before.querySelectorAll('#header2023 [data-toggle="dropdown"], #stack-nav [data-toggle="dropdown"]').length)
  assert.equal(after.querySelector('#FBcarousel-mobile').getAttribute('data-bs-wrap'), 'false')
  assert.equal(after.querySelectorAll('#FBcarousel-mobile .carousel-item').length, 4)
  assert.equal(fs.readFileSync(path.join(tmp, 'public/index.html'), 'utf8'), original)
  prepare()
  assert.equal(fs.readFileSync(path.join(tmp, 'index.html'), 'utf8'), generated)
})
test('unexpected shared script or missing legacy script fails preparation', t => {
  const { tmp, prepare } = fixture(t), p = path.join(tmp, 'public/index.html')
  const original = fs.readFileSync(p, 'utf8')
  fs.writeFileSync(p, original.replace('</body>', '<script src="/js/unreviewed.js"></script></body>'))
  assert.throws(prepare, /Unaudited shared script/)
  fs.writeFileSync(p, original.replace(/<script src="\/js\/j2g.js"[^>]*><\/script>/, ''))
  assert.throws(prepare, /Expected one legacy script/)
})
test('unrecognized header controls fail for review', t => {
  const { tmp, prepare } = fixture(t), p = path.join(tmp, 'public/index.html')
  fs.writeFileSync(p, fs.readFileSync(p, 'utf8').replace('data-toggle="dropdown"', 'data-toggle="modal"'))
  assert.throws(prepare, /Unaudited production header toggle/)
})
test('real production select restores legacy mode, preserves storage and submits a single query', () => {
  const dom = new JSDOM(fs.readFileSync(path.join(root, 'public/navbar.html'), 'utf8'), { url: 'https://ftyp.test', runScripts: 'outside-only' })
  const { window } = dom, doc = window.document
  const legacy = JSON.stringify({ FlyBase_session: { dateStamp: 1, reports: {}, j2g: 'sch' } })
  window.localStorage.setItem('simpleStorage', legacy)
  window.eval(fs.readFileSync(path.join(root, 'header/ftyp-header.js'), 'utf8'))
  const form = doc.querySelector('#j2g_search_form'), input = doc.querySelector('#GeneSearch')
  assert.equal(doc.querySelector('#GeneSearchSlct').value, 'sch')
  assert.equal(input.name, 'query')
  assert.equal(window.localStorage.getItem('ftyp-header-search-mode'), null)
  assert.equal(window.localStorage.getItem('simpleStorage'), legacy)
  input.value = 'fixture'
  assert.deepEqual(Array.from(new window.FormData(form).entries()), [['species', 'Dmel'], ['query', 'fixture']])
  window.j2gSearchSelector('j2g')
  assert.deepEqual(Array.from(new window.FormData(form).entries()), [['species', 'Dmel'], ['caller', 'genejump'], ['context', 'fixture']])
  input.value = '   '
  assert.equal(form.dispatchEvent(new window.Event('submit', { cancelable: true })), false)
  dom.window.close()
})


test('alternate script URLs and inline legacy dependencies fail closed', t => {
  const { tmp, prepare } = fixture(t), p = path.join(tmp, 'public/index.html')
  const original = fs.readFileSync(p, 'utf8')
  for (const tag of [
    "<script src='/js/new.js'></script>",
    '<script src="//flybase.org/js/new.js"></script>',
    '<script src="https://flybase.org/js/new.js"></script>',
    '<script src="https://unreviewed.invalid/new.js"></script>',
    '<script>jQuery(document).ready(function () {})</script>',
    '<script>$("#header2023").show()</script>',
  ]) {
    fs.writeFileSync(p, original.replace('</body>', tag + '</body>'))
    assert.throws(prepare, /Unaudited shared script|removed header dependency/)
  }
})

test('startup follows later shared-site preferences and blocked storage stays functional', () => {
  const markup = fs.readFileSync(path.join(root, 'public/navbar.html'), 'utf8')
  const script = fs.readFileSync(path.join(root, 'header/ftyp-header.js'), 'utf8')
  const dom = new JSDOM(markup, { url: 'https://ftyp.test', runScripts: 'outside-only' })
  const { window } = dom
  window.localStorage.setItem('simpleStorage', JSON.stringify({FlyBase_session:{j2g:'sch'}}))
  window.eval(script)
  assert.equal(window.localStorage.getItem('ftyp-header-search-mode'), null)
  window.localStorage.setItem('simpleStorage', JSON.stringify({FlyBase_session:{j2g:'j2g'}}))
  window.eval(script)
  assert.equal(window.document.querySelector('#GeneSearchSlct').value, 'j2g')
  Object.defineProperty(window, 'localStorage', {get() {throw new Error('Storage blocked')}})
  window.eval(script)
  window.j2gSearchSelector('sch')
  assert.equal(window.document.querySelector('#GeneSearch').name, 'query')
  dom.window.close()
})
