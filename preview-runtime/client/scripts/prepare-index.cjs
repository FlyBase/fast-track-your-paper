const fs = require('fs')
const path = require('path')
const root = path.resolve(__dirname, '..')
const base = (process.env.PUBLIC_URL || '/submission/publication').replace(/\/$/, '')
const html = fs.readFileSync(path.join(root, 'public/index.html'), 'utf8')
fs.writeFileSync(path.join(root, 'index.html'),
  html.replace(/%PUBLIC_URL%/g, base)
    .replace('</body>', '    <script type="module" src="/src/index.js"></script>\n  </body>'))
