// Run inside an API image: node /tests/body-parser.cjs
// No database or external network is used. Child servers bind only loopback.
const assert = require('node:assert/strict');
const http = require('node:http');
const zlib = require('node:zlib');
const { fork } = require('node:child_process');
const { once } = require('node:events');

if (process.argv[2] === 'server') {
  const parser = require('/app/node_modules/body-parser');
  // Match PostGraphile 4's three parser settings and ordering.
  const chain = [parser.json({limit: undefined}),
    parser.urlencoded({extended: false, limit: undefined}),
    parser.text({type: 'application/graphql', limit: undefined})];
  const server = http.createServer((req, res) => {
    let i = 0;
    function next(error) {
      if (error) { res.statusCode = error.status || 500; res.end(error.type); }
      else if (i < chain.length) chain[i++](req, res, next);
      else { res.setHeader('Content-Type', 'application/json'); res.end(JSON.stringify(req.body)); }
    }
    next();
  });
  server.listen(0, '127.0.0.1', () => process.send(server.address().port));
} else {
  async function main() {
    const child = fork(__filename, ['server'], {silent: true});
    let stderr = '';
    child.stderr.on('data', b => { stderr += b; });
    const deadline = setTimeout(() => { child.kill(); throw new Error('Test deadline exceeded: ' + stderr); }, 15000);
    try {
      const [port] = await once(child, 'message');
      async function request(body, headers = {}) {
        return new Promise((resolve, reject) => {
          const req = http.request({host: '127.0.0.1', port, method: 'POST',
            headers: {'Content-Type': 'application/json', ...headers}}, res => {
            let data = ''; res.on('data', b => { data += b; });
            res.on('end', () => resolve([res.statusCode, data]));
          });
          req.on('error', reject); req.end(body);
        });
      }
      const json = '{"query":"{__typename}"}';
      assert.deepEqual(await request(json), [200, json]);
      for (const [encoding, compress] of [['gzip', zlib.gzipSync], ['deflate', zlib.deflateSync]]) {
        assert.deepEqual(await request(compress(json), {'Content-Encoding': encoding}), [200, json]);
      }
      assert.deepEqual(await request('query=x', {'Content-Type': 'application/x-www-form-urlencoded'}), [200, '{"query":"x"}']);
      assert.deepEqual(await request('{__typename}', {'Content-Type': 'application/graphql'}), [200, '"{__typename}"']);
      assert.equal((await request('{broken'))[0], 400);
      assert.equal((await request('broken', {'Content-Encoding': 'gzip'}))[0], 400);
      assert.equal((await request(json, {'Content-Encoding': 'unsupported'}))[0], 415);
      assert.equal((await request(JSON.stringify({large: 'x'.repeat(110000)})))[0], 413);

      console.log('PASS: JSON, gzip, deflate, form, GraphQL text, parse/encoding/size errors');
    } finally {
      clearTimeout(deadline);
      if (child.exitCode === null) { child.kill(); await once(child, 'exit'); }
    }
  }
  main().catch(error => { console.error(error); process.exitCode = 1; });
}
