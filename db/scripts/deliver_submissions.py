#!/usr/bin/env python3
"""Deliver existing FTYP submission JSON; acknowledge only delivered unchanged rows."""
import argparse
import datetime
import hashlib
import fcntl
import json
import os
from pathlib import Path
import re
import subprocess
import tempfile

def sql_command(container):
    if not re.fullmatch(r"[A-Za-z0-9][A-Za-z0-9_.-]{0,127}", container):
        raise ValueError("Invalid database container name")
    return ["docker", "exec", "--user", "999:999",
            "-e", "PGPASSFILE=/run/secrets/ftyp_export_pgpass",
            "-e", "PGOPTIONS=-c statement_timeout=240000 -c lock_timeout=30000",
            "-i", container,
            "psql", "-X", "-q", "-w", "-h", "127.0.0.1", "-U", "ftyp_export_login",
            "-d", "ftyp", "-At", "-v", "ON_ERROR_STOP=1", "-f", "-"]

def query(command, sql):
    result = subprocess.run(command, input=sql.encode(), stdout=subprocess.PIPE,
                            stderr=subprocess.PIPE, timeout=300)
    if result.returncode:
        raise RuntimeError("Database export operation failed; submission contents withheld")
    return result.stdout

def _deliver(container, day, spool):
    if day not in ("weds", "sun"):
        raise ValueError("Expected weds or sun")
    os.umask(0o077)
    spool = Path(spool)
    spool.mkdir(mode=0o700, parents=True, exist_ok=True)
    if spool.is_symlink() or spool.stat().st_uid != os.getuid() or spool.stat().st_mode & 0o077:
        raise ValueError("Spool must be a private directory owned by this user")
    command = sql_command(container)
    role = query(command, """SELECT current_user = 'ftyp_export_login'
AND NOT rolsuper AND NOT rolcreatedb AND NOT rolcreaterole AND NOT rolreplication
AND NOT rolbypassrls
AND oid <> (SELECT datdba FROM pg_catalog.pg_database WHERE datname=current_database())
AND oid <> (SELECT relowner FROM pg_catalog.pg_class WHERE oid='ftyp_hidden.submissions'::regclass)
FROM pg_catalog.pg_roles WHERE rolname=current_user;
""").strip()
    if role != b"t":
        raise RuntimeError("Export requires its restricted login role")
    raw = query(command, """BEGIN READ ONLY;
SET LOCAL search_path=pg_catalog;
SELECT COALESCE(json_agg(row_to_json(row)), 'null'::json) FROM
(SELECT * FROM ftyp_hidden.submissions WHERE date_processed IS NULL
 ORDER BY submission_id) AS row;
COMMIT;
""")
    rows = json.loads(raw)
    if rows is not None and not isinstance(rows, list):
        raise RuntimeError("Unexpected submission export shape")
    if rows and (any(not isinstance(row, dict) or type(row.get("submission_id")) is not int
                    or row.get("date_processed") is not None for row in rows)
                 or len({row["submission_id"] for row in rows}) != len(rows)):
        raise RuntimeError("Invalid submission export identifiers")
    run = Path(tempfile.mkdtemp(prefix="delivery-", dir=spool))
    payload = run / "submissions.json"
    payload.write_bytes(raw)
    receipt = {"destination": "s3://ftyp/submissions/ftyp-export-" + day + ".json",
               "rows": len(rows or []), "sha256": hashlib.sha256(raw).hexdigest(),
               "state": "prepared"}
    def save():
        (run / "receipt.json").write_text(json.dumps(receipt, indent=2) + "\n")
    save()
    upload = subprocess.run(["aws", "s3", "cp", "--only-show-errors", str(payload),
                             receipt["destination"]], stdout=subprocess.PIPE,
                            stderr=subprocess.PIPE, timeout=300)
    if upload.returncode:
        raise RuntimeError("S3 delivery failed; processing dates unchanged; private spool retained")
    receipt["state"] = "delivered"
    receipt["delivered_at"] = datetime.datetime.now(datetime.timezone.utc).isoformat()
    save()
    if rows:
        # Hex encoding makes submitted JSON literal data, never SQL source.
        encoded = raw.hex()
        acknowledged = query(command, """BEGIN;
SET LOCAL search_path=pg_catalog;
WITH delivered AS (
 SELECT value AS row FROM jsonb_array_elements(
 convert_from(decode('""" + encoded + """','hex'),'UTF8')::jsonb)
), changed AS (
 UPDATE ftyp_hidden.submissions AS s SET date_processed=now()
 FROM delivered AS d
 WHERE s.submission_id=(d.row->>'submission_id')::integer
 AND s.date_processed IS NULL AND to_jsonb(s)=d.row
 RETURNING s.submission_id
) SELECT count(*) FROM changed;
COMMIT;
""").strip()
        receipt["acknowledged_rows"] = int(acknowledged)
    else:
        receipt["acknowledged_rows"] = 0
    receipt["state"] = "acknowledged"
    save()
    if receipt["acknowledged_rows"] != receipt["rows"]:
        raise RuntimeError("Some delivered rows changed during upload; inspect private receipt")
    return receipt

def deliver(container, day, spool):
    os.umask(0o077)
    path = Path(spool)
    path.mkdir(mode=0o700, parents=True, exist_ok=True)
    if path.is_symlink() or path.stat().st_uid != os.getuid() or path.stat().st_mode & 0o077:
        raise ValueError("Spool must be a private directory owned by this user")
    fd = os.open(path / "delivery.lock", os.O_CREAT | os.O_RDWR | os.O_NOFOLLOW, 0o600)
    with os.fdopen(fd, "a") as lock:
        try:
            fcntl.flock(lock, fcntl.LOCK_EX | fcntl.LOCK_NB)
        except BlockingIOError:
            raise RuntimeError("Another delivery is running")
        return _deliver(container, day, path)

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--container", required=True)
    parser.add_argument("--day", choices=("weds", "sun"), required=True)
    parser.add_argument("--spool", required=True)
    args = parser.parse_args()
    try:
        receipt = deliver(args.container, args.day, args.spool)
    except (ValueError, RuntimeError, subprocess.TimeoutExpired) as error:
        raise SystemExit(str(error))
    print(json.dumps({key: receipt[key] for key in ("state", "rows", "acknowledged_rows", "sha256")}))

