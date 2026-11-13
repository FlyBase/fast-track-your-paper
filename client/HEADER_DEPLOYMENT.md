# Production FTYP header candidate — prepared November 13, 2026

This is a production frontend candidate, not a deployment receipt. Jim's separate
preview was already deployed through its own root-switch procedure. Do not use
that procedure for this immutable production client, and do not copy preview
application source into production.

## Candidate and verification

Build with `client/Dockerfile.dhi`, the reviewed release argument and authoritative
Yarn lock. Candidate image tested locally:
`sha256:16852235217ecbf34b007eb77b478056be151ac363939fd79822ff508c767ec1`.
Vendor base is the same DHI nginx1.30.6 manifest as the serving production client:
`dhi.io/nginx@sha256:00ae6cadd9309386db244a6099f887529d9fb86bf04d9b988a19df6a647eedfb`.
No custom nginx/dependency builds or hand-maintained package backports.

Eight application tests, four release checks and six header tests pass. Baseline,
candidate-file and candidate-image browser journeys pass menu keyboard behavior and open-menu alignment,
search select/persistence, mobile menu, carousel next/previous/indicator/no-wrap,
invalid-contact rejection, gene lookup/selection, back navigation and synthetic
submission. All browser network traffic is intercepted; analytics is stubbed,
not sent, and no real submission or email is made. Production analytics and
maintenance script tags remain unchanged. The three React JS/CSS/map assets are
byte-identical to the copied live image. Original application source and reviewed
release fragments are unchanged. Desktop/mobile images were compared locally.

The hardened candidate ran locally at UID101 with read-only root, no capabilities,
no-new-privileges,64MiB/tmp tmpfs,128MiB memory and0.5CPU. All14static files matched
build bytes through real nginx, including JS/CSS MIME types. Vendor-layer ancestry
and image entrypoint/user contract verified. Two separate ordinary public search
probes (multipart POST with gene Adh, no submission data) succeeded: Jump to Gene
redirected to FBgn0000055; Search FlyBase returned200 with the query retained.

November13 Trivy: **zero findings in444Yarn package records including dev tools**.
The serving image is not finding-free:60OS package findings (2high,37medium,19low,
2unknown), exactly matching the pinned deployed vendor base, with no fixed package
versions reported. Keep raw findings visible and reconcile vendor advisories in
the separate runtime-image work; do not treat the lock scan as image clearance.

Evidence is local under
`/data/ctabone/flybase/software_update/build/ftyp-production-header-20261113/`:
review-fixed-build.log, final-trivy.json, image-trivy-v2.json, base-image-trivy.json,
image-contract-v2.json, image-http-checks-v2.json and final-baseline-browser,
final-candidate-browser and final-image-browser.
Independent Opus5.5 review (requested medium effort) found a menu alignment defect
and lower-severity preservation/build gaps. All were corrected; its focused
follow-up reports no remaining material issues. The final image archive is
`ftyp-production-header-20261113-v2.tar.gz`, SHA256
`18ec04320be02dc415df29a64fd40b784e790afaf041822b7d04812eb6b854a4`.
Earlier candidate b5de3991 and its archive are superseded; do not deploy them.
Review evidence/disposition is retained in software_update tracking.

## Scoped rollout to prepare after acceptance

1. Recheck current host, production client/proxy identities, image pin, canonical
   Compose/environment, networks and source commit. Current observed client image
   is69f184dbce8b506430c4462d2bb5b03c015530c81853c21a4a7131096a6c2411.
   Refuse an active `/etc/ftyp/maintenance.json` or concurrent weekly update.
   Coordinate the existing `/srv/ftyp/updates/update.lock`; do not remove a marker
   or bypass the maintained update controller. Preserve current API/admin roles,
   database generation and delivery/weekly jobs.
2. Retain the original image and root-only copies of environment/Compose/proxy
   configuration and an inventory. Export/transfer the tested candidate with a
   recorded archive checksum; verify its image ID on the host. Test it privately
   with the same read-only/user/resource contract before changing any image pin.
3. Prepare an exact client-only change to `FTYP_CLIENT_IMAGE` in the protected
   environment, preserving every other value. Compare rendered Compose models;
   only the client's image may change. Replacing the client can cause a brief
   frontend interruption; prepare the concrete cutover/rollback and obtain public
   deployment acceptance before executing it.
4. Use the canonical `ftyp-dhi` project, `/srv/ftyp/app/compose.production.yml`,
   `/etc/ftyp/compose.runtime.yml` and `/etc/ftyp/production.env`. The eventual
   selected-service operation is `up -d --no-deps --no-build --pull never client`.
   Do not use whole-project Compose, restart APIs/databases, or replay historical
   DHI migration scripts whose old-image guards no longer describe production.
5. After candidate readiness, syntax-test and gracefully reload the existing
   `ftyp-dhi-proxy-1` so its client DNS resolves the new container address. Verify
   index/assets, admin401boundaries, public read-only form/header checks and
   maintenance controls; compare every unaffected container identity. Keep old
   React assets available across the change (this candidate's React bytes match).
6. On failure, restore the original image pin, recreate only the client, then
   test/reload proxy and verify the old page/assets/authentication. This restores
   the frontend only: never restore a stale database. Record actual timing,
   verification and rollback paths in docker_production and software_update.

Production analytics modernization is a separate decision. Removing analytics was
authorized only for the private preview.
