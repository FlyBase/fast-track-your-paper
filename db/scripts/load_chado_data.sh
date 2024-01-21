#!/usr/bin/env bash
set -Eeuo pipefail
# Cancel all load steps on Ctrl-C
trap ctrl_c SIGINT
trap ctrl_c SIGTERM

function ctrl_c() {
  echo "Data load killed, exiting.";
  exit $?;
}

JOBS=${PGJOBS:-3}

# Load rest of the table definitions and data.
# POSTGRES_DB env variable is defined by the Postgres docker hub image.
# This variable is set via the docker-compose.yml file.
pg_restore -x -O -c --disable-triggers --if-exists -d $POSTGRES_DB /ftyp/data/chado -O -F d -j ${JOBS} || true

# Load genes data.
pg_restore -x -O -c --disable-triggers --if-exists -d $POSTGRES_DB /ftyp/data/feature -O -F d -j ${JOBS} || true
pg_restore -x -O -c --disable-triggers --if-exists -d $POSTGRES_DB /ftyp/data/featureloc -O -F d -j ${JOBS} || true

# Load analysis data.
pg_restore -x -O -c --disable-triggers --if-exists -d $POSTGRES_DB /ftyp/data/analysis -O -F d -j ${JOBS} || true

psql -d $POSTGRES_DB -f /ftyp/scripts/load_genes.sql
psql -d $POSTGRES_DB -f /ftyp/scripts/load_analysis.sql

vacuumdb -f -v -z -a 

psql -d $POSTGRES_DB -f /chado/schema/data_classes/utils.sql
psql -d $POSTGRES_DB -f /chado/schema/ids/id_updater.sql
psql -d $POSTGRES_DB -f /chado/schema/symbols/main.sql
psql -d $POSTGRES_DB -f /chado/schema/properties/get_prop.sql
psql -d $POSTGRES_DB -f /chado/schema/FBrf/main.sql

psql -d $POSTGRES_DB -f /ftyp/scripts/load_flags.sql
psql -d $POSTGRES_DB -f /ftyp/scripts/ftyp.sql

vacuumdb -f -v -z -t ftyp_hidden.gene_search -t ftyp_hidden.pub_search $POSTGRES_DB

