# Fast Track Your Paper client

The client retains React 17, React Router 5, native GraphQL documents and forms.
Vite replaces the retired Create React App build chain. Use Node 22.12 or newer
and Yarn 1.22.22. The canonical Dockerfile pins the Node 22 build image and Nginx
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
