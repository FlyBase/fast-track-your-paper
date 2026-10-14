import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'node:path'
import fs from 'node:fs'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const base = (process.env.PUBLIC_URL || env.PUBLIC_URL || '/submission/publication').replace(/\/$/, '')
  const source = path.resolve('src')
  const alias = fs.readdirSync(source, { withFileTypes: true })
    .filter(entry => entry.isDirectory())
    .map(entry => ({ find: new RegExp('^' + entry.name + '/'), replacement: path.join(source, entry.name) + '/' }))
  return {
    base: base + '/',
    plugins: [react({ babel: { plugins: [
      'babel-plugin-macros',
      ['@babel/plugin-transform-react-jsx', { runtime: 'automatic' }],
    ] } })],
    resolve: { alias },
    define: {
      'process.env.PUBLIC_URL': JSON.stringify(base),
      'process.env.REACT_APP_SENTRY_DSN': JSON.stringify(env.REACT_APP_SENTRY_DSN || ''),
    },
    esbuild: { loader: 'jsx', exclude: /node_modules/, include: /src\/.*\.js$/ },
    optimizeDeps: { esbuildOptions: { loader: { '.js': 'jsx' } } },
    build: {
      outDir: 'build',
      sourcemap: true,
      rollupOptions: {
        output: {
          entryFileNames: 'static/js/[name]-[hash].js',
          chunkFileNames: 'static/js/[name]-[hash].js',
          assetFileNames: 'static/[ext]/[name]-[hash][extname]',
        },
      },
    },
    server: {
      proxy: {
        [base + '/graphql']: 'http://127.0.0.1:8888',
        [base + '/admin/graphql']: 'http://127.0.0.1:8888',
      },
    },
    test: {
      environment: 'jsdom',
      globals: true,
      setupFiles: ['./src/setupTests.js'],
    },
  }
})
