# Dedicated Fast-Track production application stack

Use `compose.production.yml` as a standalone Compose file. The historical
`docker-compose.yml` remains a development/data-loading workflow and must not be
combined with this production file during preserved-data deployment.

This stack contains the immutable client, proxy, public API and authenticated
admin API. Database creation, restored data, migrations and curator exports are
separate operator-managed steps. There is no database initialization volume or
database-owner password in this application stack.

Provide these settings in a protected environment file outside the repository:
- `FTYP_CLIENT_IMAGE`, `FTYP_PROXY_IMAGE`, `FTYP_API_IMAGE`: reviewed immutable
  image digests. Build the proxy from `proxy/Dockerfile`; client/API Dockerfiles
  remain in their respective directories. Load or publish those exact images.
- `FTYP_BIND_ADDRESS`: the dedicated server's private address. Never use a public
  or wildcard address for this deployment. `FTYP_PROXY_PORT` defaults to8888.
- `FTYP_DATABASE_NETWORK`, `FTYP_PGHOST`, `FTYP_PGDATABASE`: the existing private
  network and restored database. Database ports must not be publicly published.
- `FTYP_PUBLIC_PASSWORD`, `FTYP_ADMIN_PASSWORD`: separate protected credentials
  for the fixed `ftyp_public_login` and `ftyp_admin_login` roles. Neither may own
  tables/databases or have administrative privileges.
- `FTYP_ADMIN_HTPASSWD_FILE`: protected Basic-auth file readable by proxyUID101;
  a file-backed Compose secret does not automatically change host ownership.

Validate without printing expanded credentials:

    docker compose --env-file /protected/ftyp.env -f compose.production.yml config --quiet

Only the proxy joins the ingress network; the client/APIs remain internal.
Private ingress/egress rules must permit the main website to reach this private
port. The main reverse proxy must preserve `/submission/publication/` in full.
Root `/css`, `/js`, `/images`, fonts and other shared assets stay owned by the
main website. They are not proxied through the Fast-Track service.

Before opening the main route, verify native public submission/search workflows,
authenticated admin HTML/API, denied anonymous admin access, preserved database
rows and sequence state, and actual network/port behavior on the dedicated host.
Coordinate the main and embedded maintenance labels only when the service is
verified. Refresh the embedded header through the documented manual client
utility; it is intentionally not a build-time network dependency.
