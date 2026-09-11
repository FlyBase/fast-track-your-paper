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

`docker build -t ftyp-client ./client` from the repository root builds and embeds
the static client. The Compose client service builds this Dockerfile and serves
port 5000 without a host source mount. It does not initialize or migrate a
database. Production must use the reviewed dedicated-server data-preserving
deployment configuration, pinned images and protected API/admin credentials;
the repository's legacy database service is not an upgrade procedure.

## Manual main-site header refresh

Run `yarn playwright install chromium` once, then `yarn update-header-footer`
to use Playwright to extract the native head/navbar/footer and regenerate
public/index.html through the existing template. The default source is
https://flybase.org. `FTYP_HEADER_SOURCE` is an operator-only override for a
trusted local fixture or preview. Do not run this utility as part of a build.
The production ingress retains ownership of root main-site assets.
