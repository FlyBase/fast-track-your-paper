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

## November 13 vendor reconciliation and preflight

Chris authorized source merges, vendor investigation and rollout preparation,
with an explicit checkpoint **before any production deployment**. These steps do
not change the serving image or authorize the commands below to run yet.

The two raw high findings were checked against current Docker package VEX and
Debian/upstream records:

- **CVE-2026-16742 / libsystemd0:** the vulnerable component is systemd-homed and
  its homework helper, rather than every consumer of libsystemd. The exact
  candidate image contains no systemd-homed, systemd-homework or homectl. This
  supports nonapplicability to this static nginx service; it does not assert that
  the packaged systemd source is patched. [Upstream advisory](https://github.com/systemd/systemd/security/advisories/GHSA-jm29-p7hh-vjhv).
- **CVE-2026-54369 / libacl1:** Debian still lists this library line as vulnerable.
  The issue needs attacker-controlled paths processed by a privileged ACL caller.
  Nginx's direct ELF dependencies do not include libacl; the candidate config loads
  no dynamic modules, and no setuid/setgid files are present. Fresh live runtime
  inspection confirms only UID101 nginx master/worker, read-only root, cap-dropALL,
  no-new-privileges and no client host mounts. These constrain exposure; retain
  the unpatched library finding and do not claim complete reachability proof.
  [Debian status](https://security-tracker.debian.org/tracker/CVE-2026-54369).

Docker's public package VEX entries use unversioned package identifiers and cite
Debian `no-dsa`. They are applicability statements, not proof of a vendor backport:
[libacl1 VEX](https://raw.githubusercontent.com/docker-hardened-images/advisories/main/pkg/deb/debian/libacl1/libacl1.vex.json),
[libsystemd0 VEX](https://raw.githubusercontent.com/docker-hardened-images/advisories/main/pkg/deb/debian/libsystemd0/libsystemd0.vex.json).
Raw scanner results and fleet monitoring remain unchanged.

Registry checks and local scans at16:12–16:15UTC found:

| Vendor tag | Resolved index digest | Version | Raw result |
| --- | --- | --- | --- |
| `1.30-debian13` | `sha256:99a910ff655749239e57ba05a335a39fb578f6a08fe169db2172b1edf4ad1094` |1.30.6, November4rebuild |Same60findings, including both highs |
| `1-debian13` | `sha256:acb2db8f35512cf8628eaab974b4f803e320cfd260e8f795684d97b1b394f361` |1.31.8, November4rebuild |Same60findings, including both highs |

Neither inspected newer image resolves these two findings. Retain the tested
16852235frontend candidate for this scoped rollout; track vendor-base refresh
separately when its patch/compatibility benefit is established. No custom package
backports or vulnerability suppressions were introduced.

At16:15:29UTC, a read-only render of the canonical production Compose model with
only an in-memory `FTYP_CLIENT_IMAGE` override proved the **only model difference
is `services.client.image`**. Canonical files were not written. Current client is
d839c650 (image69f184db), proxy926a61e (image4553492f); old client image is present,
maintenance marker absent, hardening intact. Recheck these facts at execution.
Evidence: local `build/ftyp-predeploy-20261113/compose-preflight.json`, image
inventories, current registry resolutions, raw scans and retrieved VEX files.

## Concrete cutover commands — approval pending

After the explicit production checkpoint, hold the existing update lock for the
whole backup/pin/switch/verification transaction. Refuse an active maintenance
marker. Create a fresh root-only backup directory, save the environment and both
Compose files with ownership/modes, retain the old image, transfer/verify the
candidate archive and check its immutable image ID. Privately test the candidate
on the host before changing the protected environment. Replace exactly the
existing `FTYP_CLIENT_IMAGE` value atomically; compare the rendered models again.

The reviewed selected-service commands would then be:

```sh
sudo docker compose -p ftyp-dhi \
  --env-file /etc/ftyp/production.env \
  -f /srv/ftyp/app/compose.production.yml \
  -f /etc/ftyp/compose.runtime.yml \
  up -d --no-deps --no-build --pull never client
sudo docker exec ftyp-dhi-proxy-1 nginx -t
sudo docker exec ftyp-dhi-proxy-1 nginx -s reload
```

Verify private client readiness before proxy reload; then verify public page,
all generated asset hashes, both admin gates, read-only form/header behavior and
unaffected process identities. Allow for a brief frontend interruption while
replacing the client. If readiness or validation fails, restore the backed-up
image pin and execute the same client-only commands plus proxy test/reload to
recover the retained old image. APIs, database generation, weekly jobs and delivery
configuration are outside the delta. Record actual results in docker_production.
