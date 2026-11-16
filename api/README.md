# FTYP API images

Production and independent preview share the locked package set in this directory.
The body-parser override keeps PostGraphile 4 on the maintained 1.20.9 patch.
Other dependencies and application code are unchanged by this update.

Both Dockerfiles use a separate npm install stage and the pinned Docker Hardened
Node 24.22.1 runtime already accepted in production. Building requires access to
`dhi.io/node`. No package manager is copied into the runtime. Use a resource-limited
Buildx builder and build from this directory; production uses `Dockerfile`,
independent preview uses `Dockerfile.preview`.

Preview Compose must supply its existing CLI arguments, including `--host 0.0.0.0`
and the `/tmp/schema.graphql` export path. Its explicit Node entrypoint avoids a
shell or `/usr/bin/env` dependency. Production retains `server.cjs` and its separate
public/admin database roles. Keep all live environment, networks and resource
limits when changing the image. Do not restart the database for an API update.

## Functional compatibility check

From the repository root, run against each built API image:

```sh
docker run --rm --network=none --cpus=1 --memory=256m --pids-limit=64 \
  --read-only --cap-drop=ALL -v "$PWD/api/tests:/tests:ro" \
  --entrypoint node IMAGE /tests/body-parser.cjs
```

This local-only test exercises ordinary JSON, compressed JSON, form and GraphQL
text requests, plus normal input-error handling. It does not connect to a database
or perform exploit testing. Deployment acceptance additionally compares full
GraphQL introspection, publication/gene/identifier searches, admin queries, and
valid body encodings against the current API, using read-only requests. Back up
Compose/environment files, retain original images, replace preview first, then
admin/public production API services individually. Verify nginx configuration
before gracefully reloading it to pick up new container addresses. Keep the
latest database on rollback; this update has no database migration.
