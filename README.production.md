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

For each FlyBase release, run the manual refresh in `client/README.md`, review and
commit the fragments, then build the client with `--build-arg FTYP_RELEASE=FBYYYY_NN`.
The image build requires this argument and rejects a snapshot from another
release. Weekly `ftypctl promote` does not replace the client image.

## Production database storage and weekly updates

The production PostgreSQL database is managed separately from this application
Compose stack by `ftypctl` in FlyBase/docker_production (`operations/ftyp`).
Do not use the development Makefile's `down`/`clean` targets on production.

Each database generation has its own Docker named volume, `ftyp-pg-RUN`.
The local volume driver binds a protected directory on the server's data disk;
it does not store the database on Docker's default boot-disk volume directory.
The backing directory is outside website containers' mounts. Named volumes
separate container ownership; they do not imply a separate physical disk.

Operators continue to use the installed FTYP SOP and `ftypctl prepare`, `preview`,
`promote` and `verify`. Preparing a generation creates its volume; promotion keeps
that volume attached when the candidate becomes live. A predecessor remains
available until the operator deliberately retires it. Use `ftypctl retire RUN
--check` first: it checks ownership and all other container/volume references
without removing data. Historical receipts copied from another host do not prove
that a predecessor exists locally, and a completed update cannot be rolled back
by blindly restoring an old database after newer submissions have arrived.

Never manually remove production volumes, run `docker volume prune`, or run
`docker compose down -v`. A bind-backed named volume is not a backup; deleting its
Docker handle alone does not delete the backing files. Backups/restores must
preserve database contents and roles, update metadata, protected configuration,
and submission-export delivery state together. Follow the installed server SOP
for actual paths, mount dependencies and recovery commands.


## October 2026 runtime refresh

Production API/builds use pinned Node24 LTS; client/proxy images use pinned nginx with available Alpine package updates. npm/yarn are removed from the running API after installing its pinned dependencies. Existing API mode validation, public/admin role separation, submission validation, Basic Auth and export logic are unchanged.

Build the PostgreSQL18 runtime with `docker build -f db/Dockerfile.runtime -t <immutable-release-tag> db`. It uses a pinned official PostgreSQL18 image plus distribution updates and upstream gosu1.19 rebuilt from a pinned commit with a current pinned Go compiler. The older `db/Dockerfile` is a historical development recipe, not the production database runtime. Scan each built image and the client dependency lockfile; zero findings in an image does not cover externally mounted JavaScript or guarantee no vulnerabilities. The October14 database scan still reports an unfixed libxml2 critical finding; this release does not claim universal CVE closure.

PostgreSQL18 stores its data below `/var/lib/postgresql/18/docker`; mount its separate named Docker volume at `/var/lib/postgresql`. Upgrade by logical backup/restore into a fresh volume. Never attach an older major's existing data directory. The docker_production FTYP updater supports both pre18 and18 mount layouts for staging and retirement. Deploy that helper update with the database upgrade.

Apply `db/scripts/materialized_view_search_path.sql` after importing/replacing Chado helper functions and before creating or refreshing materialized views. PostgreSQL17+ restricts their refresh search path. Production weekly updates copy the repaired helper definitions from the live schema; the legacy full import script applies the repair explicitly.

Prebuild and rehearse all changes before live maintenance. Put the FTYP page into maintenance with a clear, short estimate; leave the main website available. Hold both the updater and delivery locks, pause export timers, stop public/admin API writers, copy final submissions and their sequence exactly, and compare before opening the new service. Retain the original database volume and image. Once writes reopen, the new database is authoritative: never roll back to a stale volume and lose submissions. Restore only compatible application images or reconcile new submissions first. Resume both export timers and verify role boundaries, public searches, admin401 and the public page.

Jim's independent preview is described in [preview-runtime/README.md](preview-runtime/README.md); do not replace its application source with production master.


Deployment completed October14,2026: independent preview at20:09UTC; production at20:28:15UTC after a12.14second maintenance notice. Production's3,236submissions and sequence matched after final sync. PostgreSQL18 volume `ftyp-pg-runtime-pg18-20261014` is backed by `/srv/ftyp/updates/runtime-pg18-20261014/postgres`. Original PG16 remains stopped and disconnected as `ftyp-pg16-retained-20261014`; retain it and the private backup/checkpoints, but do not switch back after new submissions without reconciliation. The PG18-aware updater is installed. Public browser/search/admin-denial checks passed and both export timers resumed. The docker_production release log records immutable image IDs, tests, the earlier preparation restart, and recovery details.
