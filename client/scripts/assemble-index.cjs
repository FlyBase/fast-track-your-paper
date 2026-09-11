const fs = require('node:fs')
const path = require('node:path')
const root = path.resolve(__dirname, '../public')
const template = fs.readFileSync(path.join(root, 'index.tmpl'), 'utf8')
let includes = 0
const html = template.replace(
  /\$\{include\('\.\/(head|navbar|footer)\.html'\)\}/g,
  (_, name) => {
    includes += 1
    return fs.readFileSync(path.join(root, name + '.html'), 'utf8')
  }
)
if (includes !== 3 || html.includes("${include(")) {
  throw new Error('Expected exactly the three fixed native template includes')
}
fs.writeFileSync(path.join(root, 'index.html'), html)
