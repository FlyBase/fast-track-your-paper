# Independent FTYP preview runtime

This overlay modernizes Jim's preserved preview checkout at commit 8def1ad without replacing its application source with production master. It is separate from the production weekly staging workflow.

- API: build `api/Dockerfile.preview` against the production `api` directory's pinned package files. Compose must pass `--host 0.0.0.0`, retain its other preview flags, and export schema to `/tmp/schema.graphql`. Production uses `api/Dockerfile` and retains public/admin role separation and submission validation.
- Client: copy this directory's client manifest, npm lockfile, Vite configuration and preparation script over the corresponding preview files. Keep preview application code in `client/src` and `public` unchanged. Copy the test-only `client/src/machines/StepMachine/__tests__/stepMachine.test.js` overlay: the historical test imports the removed `ftypSteps` export, while the preserved application already uses `createStepMachine`. Keep the original `jsconfig.json` in the build context; GraphQL macros use its source-root setting. Build with the pinned Node24 image and `npm ci --legacy-peer-deps --ignore-scripts && npm run build`. PUBLIC_URL is `/submission/publication`. npm is the authoritative lockfile for this overlay; the original yarn lock remains historical in the preserved checkout. Build on an isolated builder, never install dependencies inside a live serving container.
- Serve the preview build directory read-only at `/usr/share/nginx/html` with the patched nginx runtime and `client-nginx.conf` mounted at `/etc/nginx/conf.d/default.conf`. Preserve proxy configuration, Basic Auth file, local shared assets, internal networks and loopback18892.
- Database: build `db/Dockerfile.runtime`. PostgreSQL18 requires a fresh logical restore into a separate named volume mounted at `/var/lib/postgresql`; never reuse PostgreSQL13's physical data directory. Apply `db/scripts/materialized_view_search_path.sql` after loading the Chado helpers and before refreshing search views. The legacy load script does this explicitly; production weekly staging copies these settings from the live schema.

Production and preview have separate credentials, data and jobs. No export timer or delivery credentials are installed for independent preview. Preserve original images, code and database until acceptance, and reconcile any new submissions before rolling back to an old database.

## Frontend build and scan hygiene

Use a fresh isolated build directory, including the preview's `src`, `public`,
`scripts`, `jsconfig.json`, package files and Vite config. Do not copy `.env` or
old `node_modules`. Run `npm ci --legacy-peer-deps --ignore-scripts`,
`PUBLIC_URL=/submission/publication npm run build`, and `npm test` using the
pinned Node image from `../client/Dockerfile`. Scan the authoritative npm lock
with `trivy fs --scanners vuln --include-dev-deps <client-directory>`; the default
scan omits build/test dependencies. Exclude generated build output and
node_modules when scanning the lock itself. Scan the serving image separately.

Never overlay a new build archive onto an old document root: unused JavaScript
and source maps remain reachable. For a changed bundle, stage a fresh document
root, test it behind a separate private nginx, and plan the scoped replacement.
Moving a host bind-mount directory does not move an existing container's mount.
Preserve rollback files outside the served directory. Do not run a whole-project
Compose restart or touch the preview database just to publish static assets.

October17 cleanup did not replace the bundle. Fresh builds before and after the
build-tool patches matched every active file byte-for-byte. A manifest/hash check
retained all9current files and moved12obsolete CRA files plus the unused June2022
node_modules tree to `/srv/ftyp-preview/backups/frontend-audit-20261017`.
That root-only archive is outside the nginx document root; it remains vulnerable
historical recovery material and must not be restored as a deployment.
The patched manifest, npm lock and test overlay are installed on the preview
host. No service restart or application-source change was needed. To recover the
source files, use the archive's `source/` copies; its manifest records before/after
hashes. Reinstall dependencies from the current lock on an isolated builder.

The complete current lock scan reported zero findings across420package records,
including development dependencies, using the October16 Trivy database snapshot.
This is a dated result, not proof of absence of vulnerabilities; shared FlyBase
header assets and the API/database images are separate scan scopes.
