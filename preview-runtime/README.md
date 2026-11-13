# Independent FTYP preview runtime

This overlay modernizes Jim's preserved preview checkout at commit 8def1ad without replacing its application source with production master. It is separate from the production weekly staging workflow.

- API: build `api/Dockerfile.preview` against the production `api` directory's pinned package files. Compose must pass `--host 0.0.0.0`, retain its other preview flags, and export schema to `/tmp/schema.graphql`. Production uses `api/Dockerfile` and retains public/admin role separation and submission validation.
- Client: copy this directory's client manifest, npm lockfile, Vite configuration, preparation script and `client/header/` directory over the corresponding preview files. Keep preview application code in `client/src` and `public` unchanged. Copy the test-only `client/src/machines/StepMachine/__tests__/stepMachine.test.js` overlay: the historical test imports the removed `ftypSteps` export, while the preserved application already uses `createStepMachine`. Keep the original `jsconfig.json` in the build context; GraphQL macros use its source-root setting. Build with the pinned Node24 image and `npm ci --legacy-peer-deps --ignore-scripts && npm run build`. PUBLIC_URL is `/submission/publication`. npm is the authoritative lockfile for this overlay; the original yarn lock remains historical in the preserved checkout. Build on an isolated builder, never install dependencies inside a live serving container.
- Mount the preview publication tree read-only at `/usr/share/nginx/html`. `client-nginx.conf` is the original-root baseline/rollback template, not the versioned release configuration. For the November 13 header publication, use the root switch and verification in [HEADER_DEPLOYMENT.md](HEADER_DEPLOYMENT.md). Preserve proxy configuration, Basic Auth file, local shared assets, internal networks and loopback18892.
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

The host `app/client/build` directory is a live publication tree, **not a build workspace**. Never run Vite or any build command there: Vite clears its output directory, including staged and active releases. Build elsewhere and publish a fresh `build/.releases/<release-id>` directory, then switch the nginx root. Keep the live nginx config and `/srv/ftyp-preview/client-nginx.conf` synchronized; do not overwrite either with the original-root repository template. The accepted root and rollback path belong in the deployment receipt.

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


## Maintained preview header (prepared November 13, 2026)

The overlay builds a self-contained header using pinned Bootstrap5.3.9 JavaScript
and a small native search-mode handler. It retains the existing Bootstrap3 CSS
and React form styling; `header/preview-header.css` bridges the two navbar state
classes. The full current CSS theme is not migrated to Bootstrap5.

The original preview `src` and `public` files stay unchanged. Preparation rewrites
only the generated index: it removes all ten shared script tags, migrates the
header's Bootstrap data attributes, and adds content-hashed local assets under
`ftyp-header/`. Copy **all of `client/header/`** with the overlay. This directory
and generated `public/ftyp-header/` are required. The latter is a generated
namespace: do not put hand-maintained files there.

No jQuery, simpleStorage, cookie plugin, typeahead plugin or shared FBsession/j2g
script is needed. The old header typeahead/cookie scripts had no callers in this
preview; the application's React gene search is preserved and browser-tested.
The new handler reads the old search preference without modifying its store,
handles denied storage, prevents blank searches, and emits one visible query
parameter. Analytics/autotrack removal was explicitly approved for this private
preview; production FTYP analytics and source are unaffected.

Vite7.3.7 and Vitest4.1.12 patch the build-tool findings discovered during this
work. npm remains authoritative. The November13 final Trivy scan, including dev
dependencies, reports zero findings across422package records. This does not cover
all vendored browser code or declare the broader shared website tree clean.

### Reproduce validation

Use a fresh read-only copy of the preserved preview source and apply the overlay,
including `header/`, then build with the pinned Node24 image above. Set
`FTYP_CLIENT_DIR` to that isolated client directory (with node_modules/build),
`FTYP_SHARED_JS_DIR` to a copy of the old shared `js` directory for baseline
comparison, `FTYP_SHARED_STYLE_DIR` to a directory containing the copied css,
font and images/fly_logo.png, and `FTYP_TEST_OUTPUT` to a separate evidence folder.

```sh
node --test preview-runtime/tests/header-unit.cjs preview-runtime/tests/prepare-index.cjs
node preview-runtime/tests/header-browser.cjs
```

The browser test resolves Playwright from the isolated client's node_modules;
install that version's Chromium first. All browser requests are fulfilled in the
fixture, including a synthetic publication, gene lookup and final submission.
No real API, email or database is used. `FTYP_BASELINE=1` plus `FTYP_BUILD_DIR`
pointing to the original build runs the same form/navigation journey on baseline.

Evidence:8existing unit tests,9header/preparation tests, desktop/mobile navigation,
keyboard dropdown, preference persistence, invalid contact rejection, actual gene
search selection, back navigation and complete fixture submission. Browser
console has no uncaught errors. Local images are retained for review.

[Deployment and rollback plan](HEADER_DEPLOYMENT.md). This section documents a
prepared candidate, not a deployment receipt.
