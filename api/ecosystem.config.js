module.exports = {
  apps: [
    {
      name: 'postgraphile',
      script: './node_modules/.bin/postgraphile',
      // Options reference: http://pm2.keymetrics.io/docs/usage/application-declaration/
      args: '--host db -c ftyp -s flybase,public,ftyp -j -M -l 5MB --timeout 60000 --disable-query-log',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '500M',
      output: './logs/postgraphile.log',
      error: './logs/postgraphile.err',
      env: {
        NODE_ENV: 'development',
      },
      env_production: {
        NODE_ENV: 'production',
      }
    }
  ],
  deploy : {
    production : {},
    staging: {},
    development: {},
  }
};
