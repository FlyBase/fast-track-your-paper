#!/usr/bin/env bash
set -Eeuo pipefail
# Cancel all load steps on Ctrl-C
trap ctrl_c SIGINT
trap ctrl_c SIGTERM

function ctrl_c() {
  echo "Data export killed, exiting.";
  exit $?;
}

# Script to export FTYP submisisons into JSON format.
psql -d "$POSTGRES_DB" -f /ftyp/scripts/export_submissions.sql -t  > /ftyp/data/"$1"
psql -d "$POSTGRES_DB" -c "begin; update ftyp_hidden.submissions set date_processed=now() where date_processed is null; commit;"
