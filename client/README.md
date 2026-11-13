# Fast Track Your Paper client

The client retains React 17, React Router 5, native GraphQL documents and forms.
Vite replaces the retired Create React App build chain. Use Node 22.12 or newer
and Yarn 1.22.22. The canonical Dockerfile pins the Node 24 build image and Nginx
runtime image by digest.

## Local development

Run `yarn install --frozen-lockfile --ignore-scripts`, then `yarn start`.
Open http://127.0.0.1:5173/submission/publication/.
The development server proxies only the native public/admin GraphQL paths to
127.0.0.1:8888; the API proxy still enforces the separate admin authentication.
Main-site /css, /js and /font assets remain main-site dependencies.

Run `yarn test` for the unit suite. Run `yarn build` for production output in
`build/`. `PUBLIC_URL` defaults to `/submission/publication`; the native
public/index.html is retained as the template and the generated root index.html
is ignored. GraphQL and styled-components macros remain build-time transforms.
`REACT_APP_SENTRY_DSN` is the optional public client DSN.

## Immutable client image

`docker build --build-arg FTYP_RELEASE=FB2026_03 -t ftyp-client ./client` from the repository root builds and embeds
the static client. The Compose client service builds this Dockerfile and serves
port 5000 without a host source mount. Set `FTYP_RELEASE` in the environment
when building with the development Compose file. It does not initialize or migrate a
database. Production must use the reviewed dedicated-server data-preserving
deployment configuration, pinned images and protected API/admin credentials;
the repository's legacy database service is not an upgrade procedure.

## Main-site release refresh

Run `yarn playwright install chromium` once, then `yarn update-header-footer`
to use Playwright to extract the native head/navbar/footer and regenerate
public/index.html through its three fixed literal includes. The default source is
https://flybase.org. `FTYP_HEADER_SOURCE` is an operator-only override for a
trusted local fixture or preview. Do not run this utility as part of a build.
The production ingress retains ownership of root main-site assets.

For each FlyBase release, refresh and review the three fragments and assembled
`public/index.html`, then commit them before building the client image. Supply the
intended release as the required Docker build argument `FTYP_RELEASE`. Builds fail
if the desktop/mobile header and footer do not all match it. This catches a stale
snapshot without introducing a live-site dependency inside Docker builds. Local
`FTYP_RELEASE=FB2026_03 yarn build` performs the same check; without the variable,
local builds still check that the three labels agree. The build always assembles
the index from the reviewed fragments. Run `yarn test:release` for these checks.

Weekly catalog promotion updates only the database; it does not refresh this
immutable client. Deploy the reviewed client image with each main-site release.

## Dependency security checks

Use `yarn install --frozen-lockfile --ignore-scripts` with the pinned Node builder.
Run `yarn build`, `yarn test`, and `yarn test:release`; builds require the intended
`FTYP_RELEASE` and refreshed release templates. Scan `yarn.lock` with
`trivy fs --scanners vuln --include-dev-deps` (exclude node_modules/build when
scanning the lock). Include development dependencies: the default scan missed
the source-map-js build-tool finding fixed by the1.2.2 resolution.

On October17,2026 the patched build matched every file in the deployed static
image085e6b0cc82d byte-for-byte. Full lock scan:474package records, zero findings
with the October16 database snapshot. No production image replacement was needed;
future builds use the patched lock. Scan the nginx image and externally served
shared assets separately; lock results alone do not cover those components.


## Maintained production header

The generated index replaces eight legacy shared libraries (jQuery, Bootstrap 3
JavaScript, simpleStorage, FBsession/j2g, typeahead, autocomplete and cookie) with
pinned Bootstrap 5.3.9/Popper 2.11.8 and a native search handler. Original head,
navbar and footer fragments remain the reviewed release inputs. Production
analytics/autotrack and recovery-maintenance scripts are preserved exactly.

Only desktop/mobile header dropdowns and the mobile carousel receive Bootstrap 5
attributes. The existing native hamburger and resize handlers, Bootstrap 3 theme,
React application and help links stay intact. The small scoped CSS bridge supplies
Bootstrap 5 carousel transition classes without changing form styling. Search
reads the shared-site mode until the user explicitly chooses an FTYP preference,
tolerates unavailable storage and prevents
blank/duplicate queries. No dependency is loaded from a new external CDN.

Yarn remains authoritative; Vite 7.3.7 and Vitest 4.1.12 include the November 13
build-tool patches. The Vite resolution also keeps Vitest on the tested patched
7.3.7 line instead of its separate vulnerable 8.3.0 resolution. Build in an isolated workspace, then run `yarn test`,
`yarn test:release` and `yarn test:header`. Generated `public/ftyp-header/` is ignored
and exclusively owned by preparation; do not store maintained files there.

The production frontend is an immutable image, unlike Jim's standalone preview.
Do not use the preview root-switch procedure here. Build and scan the static
artifact and the serving image, exercise production form/header fixture journeys,
and prepare a client-only image replacement with the current maintained DHI
runtime and rollback before publication. No production rollout is implied by
this source change. Analytics modernization remains a separate decision.


Build the compatible hardened production candidate with
`docker build -f client/Dockerfile.dhi --build-arg FTYP_RELEASE=<reviewed-release> -t <candidate-tag> client`.
This retains the deployed vendor nginx base, UID101 and internal port5000; it
renders the existing nginx template at build time because DHI has no shell.
The production runtime still supplies read-only root, dropped capabilities,
no-new-privileges and bounded /tmp. Building an image does not deploy it.

For the fixture browser journey, set `FTYP_CLIENT_DIR` to this client's absolute
path, `FTYP_SHARED_JS_DIR` to preserved shared scripts, `FTYP_SHARED_STYLE_DIR` to
preserved css/font/images, `FTYP_EXTRA_ASSETS` to production maintenance JS,
reactbundles CSS and additional images, and `FTYP_TEST_OUTPUT` to an evidence
directory. Run `node client/scripts/header-browser.cjs` from the repository root.
`FTYP_BASELINE=1` and `FTYP_BUILD_DIR=<copied-live-build>` exercise the same journey
against the production baseline. Every request is intercepted locally, including
analytics and the synthetic submission. No production API or email is contacted.
