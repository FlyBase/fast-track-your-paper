const http = require('http');
const { Pool } = require('pg');
const { postgraphile } = require('postgraphile');
const simplify = require('@graphile-contrib/pg-simplify-inflector');
const validateSubmission = require('./submission-validation.cjs');

async function main() {
  if (process.argv.length !== 2) throw Error('Legacy CLI configuration is not accepted');
  const mode = process.env.FTYP_API_MODE;
  if (!['public', 'admin'].includes(mode)) throw Error('FTYP_API_MODE required');
  for (const key of ['PGHOST', 'PGDATABASE', 'PGPASSWORD']) {
    if (!process.env[key]) throw Error('Database configuration required');
  }
  const user = mode === 'public' ? 'ftyp_public_login' : 'ftyp_admin_login';
  const pool = new Pool({host: process.env.PGHOST, database: process.env.PGDATABASE,
    user, password: process.env.PGPASSWORD, port: Number(process.env.PGPORT || 5432),
    options: '-c search_path=pg_catalog,public,flybase,pg_temp'});
  const { rows } = await pool.query(`SELECT current_user AS name, rolsuper, rolcreaterole,
    rolcreatedb, rolreplication, rolbypassrls,
    pg_has_role(current_user,'ftyp_public','MEMBER') AS public_member,
    pg_has_role(current_user,'ftyp_admin_api','MEMBER') AS admin_member,
    pg_has_role(current_user,'ftyp_submission_writer','MEMBER') AS writer_member,
    EXISTS(SELECT 1 FROM pg_class WHERE relowner=pg_roles.oid AND relkind IN ('r','p','m')) AS owns_tables,
    EXISTS(SELECT 1 FROM pg_database WHERE datdba=pg_roles.oid) AS owns_database
    FROM pg_roles WHERE rolname=current_user`);
  const r = rows[0];
  if (!r || r.name !== user || r.rolsuper || r.rolcreaterole || r.rolcreatedb ||
      r.rolreplication || r.rolbypassrls || r.writer_member || r.owns_tables || r.owns_database ||
      (mode === 'public' ? (!r.public_member || r.admin_member) : (!r.admin_member || r.public_member))) {
    throw Error('Database role boundary failed');
  }
  const middleware = postgraphile(pool, mode === 'public' ? ['ftyp', 'public'] : ['ftyp_admin', 'ftyp_hidden'], {
    appendPlugins: [simplify, validateSubmission], dynamicJson: true,
    disableDefaultMutations: true, ignoreRBAC: false, ignoreIndexes: false,
    setofFunctionsContainNulls: false, legacyRelations: 'omit',
    graphiql: false, showErrorStack: false, extendedErrors: [], enableQueryBatching: false,
  });
  const server = http.createServer(middleware);
  // A Unix socket supports the same entrypoint in isolated fixtures and local proxies.
  const listener = process.env.FTYP_LISTEN_SOCKET || Number(process.env.PORT || 5000);
  server.listen(listener, () => console.log('FTYP ' + mode + ' API ready'));
  function shutdown() { server.close(() => pool.end().finally(() => process.exit(0))); }
  process.on('SIGTERM', shutdown); process.on('SIGINT', shutdown);
}
main().catch(() => { console.error('FTYP API startup failed'); process.exit(1); });
