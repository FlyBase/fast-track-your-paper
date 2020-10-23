#!/usr/bin/env bash
set -Eeuo pipefail
# Cancel all load steps on Ctrl-C
trap ctrl_c SIGINT
trap ctrl_c SIGTERM

function ctrl_c() {
  echo "Data load killed, exiting.";
  exit $?;
}

mkdir -p /ftyp/data/submissions
pg_dump -d "$POSTGRES_DB" -a -t ftyp_hidden.submissions
