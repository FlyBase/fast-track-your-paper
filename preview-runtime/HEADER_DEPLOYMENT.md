# Standalone preview header: deployment and rollback

Status: prepared, not deployed. Scope is Jim's private standalone FTYP preview on
public host i-051daebe7fc6c0b4b (52.73.196.179), loopback18892. Production FTYP,
the public website, API/database containers, routing and credentials are excluded.
Chris approved rewriting the header and removing analytics from this preview.
Chris approved publishing the reviewed preview on November 13, 2026. This plan
is not a deployment receipt; record the actual outcome after verification.

## Tested artifact

Local evidence directory:
`/data/ctabone/flybase/software_update/build/ftyp-header-20261113/`

- `preview-header-20261113-v1.tgz`, SHA256
  `9f452e5fc9506cec72b928d33bf17711f48b51f36681f45d54bd155ca035476e`.
- `release-manifest.json` records every one of the14output files.
- `candidate2/` is the isolated build from the fresh live client archive, with this
  repository's preview overlay. All82original src/public files are byte-identical
  to that archive; generated header files are additional.
- Build uses the pinned Node24 image in `client/Dockerfile`, limited to2CPUs/4GiB.
- The three existing React JS/CSS/map assets are byte-identical to the currently
  served build and keep their existing names. There is no old-page asset mismatch
  to bridge. New header assets have content hashes in their names.
- Final scan: zero findings in422npm package records including dev dependencies.
  This is not an assertion about all vendored code or the shared website tree.
- `final-browser/` contains fixture-only browser results and review images.

## Publish after approval

1. Recheck the host identity, both preview nginx mounts/configs and container
   IDs/PIDs/start times. Confirm no preview maintenance marker is present and
   coordinate using `/run/lock/ftyp-preview-maintenance.lock`. Do not override the
   existing maintenance controller or run a whole-project Compose operation.
2. Back up `/etc/ftyp-preview/dhi/client/nginx/conf.d/default.conf`,
   `/srv/ftyp-preview/client-nginx.conf`, current client package files,
   `scripts/prepare-index.cjs`, and any existing header directory beneath a new
   root-only `/srv/ftyp-preview/backups/header-20261113-v1/`. Keep the current
   original build files unchanged for rollback. Staging adds a `.releases` child
   beneath that directory; it does not replace the original files. Save the active source
   manifest and container inventory too.
3. Upload the archive and manifest outside the served tree, verify the SHA256,
   then extract to a **new** directory:
   `/srv/ftyp-preview/app/client/build/.releases/header-20261113-v1/`.
   Refuse an existing target. Verify all14file hashes and normal readable file/
   directory permissions before publication. No dependencies are installed on
   the host. This staging directory is inside the existing read-only container
   bind mount, so the running container can see it without recreation.
   Request each staged asset through the existing client nginx directly on its
   inspected private container address and port5000; check status, MIME type and
   manifest bytes before switching. The preview proxy intentionally denies dot
   paths, so do not weaken that rule to test `.releases`. Confirm the configured
   container user can run the nginx configuration test and signal its master.
4. Preserve the existing client config and change only its exact root directive:

   ```nginx
   root /usr/share/nginx/html/.releases/header-20261113-v1;
   ```

   The verified current directive is `root /usr/share/nginx/html;` in a server
   listening on5000 with the existing SPA `try_files` rule. Require exactly one
   match. Install atomically into the **directory-mounted** live config path;
   retain owner/mode. Test before reloading:

   ```sh
   sudo docker exec ftyp-preview-client nginx -t
   sudo docker exec ftyp-preview-client nginx -s reload
   ```

   If validation or reload fails, restore the saved config immediately and test/
   reload it. Do not stop or recreate any container. Synchronize the same root in
   `/srv/ftyp-preview/client-nginx.conf` so future DHI config regeneration retains
   the accepted document root.
5. Verify through localhost18892: page200, no `/js/` script references, both new
   scripts/CSS returned with manifest hashes, existing React assets unchanged,
   both admin gates401, and unchanged container IDs/start times. Browser-check
   navigation/search mode/mobile layout without submitting data or contacting an
   author. The full submission acceptance uses the isolated fixture only.
   Confirm public homepage and production FTYP200.
6. Copy this overlay's package/lock/preparation/header source files to the preview
   source checkout with backups, leaving application src/public unchanged. Append
   the deployment receipt to the docker_production release log and preview
   operational notes, including the new root and rollback path. Record exact
   manifest/source commits and post-change verification in software_update.

## Future publication contract

`/srv/ftyp-preview/app/client/build` is the mounted publication tree, not a build
workspace. Never run Vite/build commands there: clearing `build` would remove
active and retained release directories. Build in a fresh isolated directory,
stage a new `.releases/<release-id>`, verify it and switch the root with the same
backup/test/reload procedure. Keep both live and companion configs synchronized.
The repository `client-nginx.conf` is explicitly the original-root baseline and
rollback template, not the accepted versioned configuration. Never copy it over
a live versioned config as a routine source update.

The existing proxy allowlist from docker_production PR171 stays intact for old
pages/rollback. The new index makes no shared JavaScript requests. This candidate
does not change Trivy coverage or suppress the old shared-tree findings.

## Roll back

Restore the two saved client nginx configs. Run the same `nginx -t` and graceful
reload commands. Their original root points back to the still-intact original
build; no database rollback is involved. Recheck page/assets/admin authentication
and container identity. Restore the backed-up source overlay files too if reverting
future builds. Do not delete either artifact during the acceptance window.

The root-only switch is deliberate: moving/renaming the host build directory
would not retarget the running Docker bind mount. No proxy/API/DB restart is
necessary. The tested React asset bytes are identical across both roots.
