const test = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const os = require('node:os')
const path = require('node:path')
const {spawnSync} = require('node:child_process')
if (!process.env.FTYP_CLIENT_DIR) throw new Error('FTYP_CLIENT_DIR is required')
const client = path.resolve(process.env.FTYP_CLIENT_DIR)
const baseline = fs.readFileSync(path.join(client,'public/index.html'),'utf8')
function run(html, env = {}) {
  const dir=fs.mkdtempSync(path.join(os.tmpdir(),'ftyp-header-test-'))
  fs.mkdirSync(path.join(dir,'scripts'));fs.mkdirSync(path.join(dir,'public'))
  fs.writeFileSync(path.join(dir,'public/index.html'),html)
  fs.copyFileSync(path.resolve(__dirname,'../client/scripts/prepare-index.cjs'),path.join(dir,'scripts/prepare-index.cjs'))
  fs.cpSync(path.resolve(__dirname,'../client/header'),path.join(dir,'header'),{recursive:true})
  fs.symlinkSync(path.join(client,'node_modules'),path.join(dir,'node_modules'),'dir')
  const result=spawnSync(process.execPath,['scripts/prepare-index.cjs'],{cwd:dir,encoding:'utf8',env:{...process.env,PUBLIC_URL:'/submission/publication',...env}})
  return {dir,result,close:()=>fs.rmSync(dir,{recursive:true,force:true})}
}
test('prepares only local header assets and rebuilds without stale hash copies',()=>{
 const t=run(baseline)
 try {
  assert.equal(t.result.status,0,t.result.stderr)
  const html=fs.readFileSync(path.join(t.dir,'index.html'),'utf8')
  assert(!/<script[^>]+src="\/js\//.test(html))
  assert(!html.includes('google_analytics.js'))
  const assets=path.join(t.dir,'public/ftyp-header')
  const initial=fs.readdirSync(assets).sort()
  fs.writeFileSync(path.join(assets,'preview-header-aaaaaaaaaaaaaaaa.js'),'obsolete')
  const again=spawnSync(process.execPath,['scripts/prepare-index.cjs'],{cwd:t.dir,encoding:'utf8'})
  assert.equal(again.status,0,again.stderr)
  assert.deepEqual(fs.readdirSync(assets).sort(),initial)
 } finally {t.close()}
})
for(const [name,html,env] of [
 ['missing legacy script',baseline.replace(/<script src="\/js\/j2g.js"[^>]*><\/script>/,''),{}],
 ['unknown shared script',baseline.replace('</body>','<script src="/js/unreviewed.js"></script></body>'),{}],
 ['missing header',baseline.replace('id="j2g_search_form"','id="other"'),{}],
 ['external public prefix',baseline,{PUBLIC_URL:'https://external.invalid'}],
]) test('rejects '+name,()=>{
 const t=run(html,env)
 try {assert.notEqual(t.result.status,0)} finally {t.close()}
})
