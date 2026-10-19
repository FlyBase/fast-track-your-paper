# Curator submission delivery

Use scripts/deliver_submissions.py for the dedicated host's scheduled curator
delivery after the retained database and application have been validated.
Do not run export_submissions.sh as a health check: it marks records processed.

Apply scripts/curator_export_role.sql to the clean FTYP database as its migration
owner. Provision the new login password separately through protected inputs.
Verify effective permissions: database CONNECT, schema USAGE, SELECT submissions
and UPDATE(date_processed), with no ownership, role memberships or other writes.
Mount its PostgreSQL password file at /run/secrets/ftyp_export_pgpass in the database
container, readable only by the container postgres OS account (UID999 in the current
image, UID70 in the reviewed DHI18 candidate), using a SCRAM localhost HBA entry for
ftyp_export_login. Neither API service receives this credential.

The host runs Python3, Docker CLI and AWS CLI using its instance role. Its fixed,
root-owned private spool must be mode0700. Invoke with the exact deployment
database container name and --day weds or --day sun. Preserve the existing cron
schedule: Wednesday and Sunday at22:12UTC. The host clock/cron timezone must be
UTC. The S3 destinations remain s3://ftyp/submissions/ftyp-export-weds.json and
ftyp-export-sun.json. Confirm the instance role can upload these objects before
enabling the schedule; no production object write is part of the tests.

For example, after substituting the actual pinned deployment paths/container:
    python3 db/scripts/deliver_submissions.py --container FTYP_DB_CONTAINER --day weds --spool /var/lib/ftyp/export-spool

The process takes a local nonblocking lock. It writes a private payload and
receipt, uploads the full-row JSON, then acknowledges only delivered rows whose
values have not changed. SQL is bounded by a240s statement timeout and30s lock
timeout, with an outer300s client timeout. Empty selections upload a zero-byte file, matching the curator export contract;
nonempty selections retain their full-row JSON array. A zero-row acknowledged
receipt means the export succeeded with no pending submissions.
Nonzero exit requires inspecting the protected receipt; a delivered but
unacknowledged file must not be blindly replayed or marked processed. Keep failed
or partial receipts until reconciled. Configure retention for completed private
spool files according to operational backup policy; never expose them through
the web application. No automatic retries or new queue are introduced.

## Tests

Use a fresh evidence directory on the AWS development host:
    FTYP_EXPORT_TEST_EVIDENCE=/path/to/fresh/evidence python3 db/tests/test_curator_export_synthetic.py
    FTYP_EXPORT_TEST_EVIDENCE=/path/to/fresh/evidence python3 db/tests/test_curator_export_native.py

The native test requires sudo Docker and the explicitly pinned clean PG16 image.
It launches a uniquely named network-none container, uses only synthetic rows and
SCRAM credentials, substitutes the S3 call, and removes its exact owned container.
It never connects to the retained database or AWS S3. Evidence remains in the
chosen private directory. Original schemas, scientific data and submissions are
not changed by installing these source files.

The exporter selects Docker's named `postgres` OS account instead of hardcoded999.
It still authenticates over loopback SCRAM as restricted `ftyp_export_login`,
not the database superuser. For DHI preparation, copy the pgpass privately and
set the new copy to70:70 mode0600; retain the original999-owned credential.
Never run the real exporter merely as a health probe: it delivers and acknowledges
submissions. The DHI test must use synthetic records and a local mocked S3 sink.

October19 DHI acceptance: `test_curator_export_dhi.py` passed seven real database
cases against exact image1123b53147234eaffcf729c4c4606c5e60f1e0fe5ae2633c96ee9aa6f26f3474,
using vendor initdb, UID70 private copied pgpass and loopback SCRAM. Full-row
acknowledgment, failed upload, edited row, late new row, empty payload and
DB/table-owner role denials all passed. AWS invocation was intercepted into a
local sink; no S3 request or real submission was used. Evidence is private at
`/data/ctabone/flybase/software_update/build/hardening-campaign-20261019/lead/ftyp-export-dhi-1`.
The owned container was stopped gracefully and removed; private initialized data
and cleanup receipt remain. Aggregate limits were640MiB/1.5CPU/160tasks, no network
or published ports. Seven daemon-free synthetic cases also pass. This evidence
supports source preparation only; no installed exporter, timer or serving
credential changed. A later rollout must coordinate the UID70 credential copy
with the reviewed database launcher and retain the original for recovery.
