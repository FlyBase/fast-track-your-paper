const { test } = require('node:test')
const assert = require('node:assert/strict')
const { checkRelease } = require('./check-release.cjs')
const nav = '<div id="release-info">FB2026_03</div><div id="release-info-mobile">FB2026_03</div>'
const footer = '<strong id="release">version FB2026_03, released September 17, 2026</strong>'

test('current desktop, mobile and footer agree with the intended release', () => {
  assert.equal(checkRelease(nav, footer, 'FB2026_03'), 'FB2026_03')
})
test('a stale snapshot fails the next release build', () => {
  assert.throws(() => checkRelease(nav, footer, 'FB2026_04'), /Stale/)
})
test('missing or inconsistent release labels fail even in local builds', () => {
  assert.throws(() => checkRelease(nav.replace('FB2026_03', 'FB2026_02'), footer), /inconsistent/)
  assert.throws(() => checkRelease('', footer), /inconsistent/)
})
test('an invalid expected release fails rather than bypassing the check', () => {
  assert.throws(() => checkRelease(nav, footer, 'latest'), /FTYP_RELEASE/)
})
