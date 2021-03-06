#!/usr/bin/env bash
# Die on errors
set -Eeuo pipefail

# This script pulls select data from production chado and stores it in the db/data directory.

# Usage:
# $ cd db
# $ PGHOST=localhost PGUSER=josh PGPORT=6543 PGDATABASE=production_chado ./scripts/pull_chado_data.sh
#
# To change Postgres connection defaults please use the following ENV variables.
# PGHOST - Hostname
# PGPORT - Port
# PGUSER - Username
# PGDATABASE - Database
# PGJOBS  - Number of jobs (default: 3)

# Cancel all load steps on Ctrl-C
trap ctrl_c SIGINT
trap ctrl_c SIGTERM

function ctrl_c() {
  echo "Data pull killed, exiting.";
  exit $?;
}

JOBS=${PGJOBS:-3}

# Pull data for select tables.
# The directory format (-F d) allows us to use a multi-threaded dump
# where -j n sets the number of threads/jobs used.
pg_dump -x -O -n public -s -t feature -T audit -F d -j ${JOBS} -f data/feature
pg_dump -x -O -n public -s -t featureloc -T audit -F d -j ${JOBS} -f data/featureloc
pg_dump -x -O -n public -c --if-exists --disable-triggers \
        -t cvterm \
        -t db \
        -t dbxref \
        -t synonym \
        -t feature_synonym \
        -t feature_dbxref \
        -t pub \
        -t pubauthor \
        -t pubprop \
        -t pub_dbxref \
        -t feature_pub \
        -t organism \
        -T audit \
        -F d -j ${JOBS} -f data/chado

chmod 755 data/chado data/feature data/featureloc

# Pull only gene data for the feature table.
# Can't use directory format here since we are pulling a subset
# of the feature table out.
psql -f scripts/pull_genes.sql > data/chado.feature.tsv
psql -f scripts/pull_gene_locations.sql > data/chado.gene_location.tsv
psql -f scripts/pull_gene_summaries.sql > data/chado.gene_summary.tsv
