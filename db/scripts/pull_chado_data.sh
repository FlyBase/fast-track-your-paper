#!/bin/bash
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

JOBS=${PGJOBS:-3}

# Pull data for select tables.
# The directory format (-F d) allows us to use a multi-threaded dump
# where -j n sets the number of threads/jobs used.
pg_dump -x -O -n public \
        -a cvterm \
        -a db \
        -a dbxref \
        -a synonym \
        -a feature_synonym \
        -a pub \
        -a pubprop \
        -a pub_dbxref \
        -a organism \
        -F d -j ${JOBS} -d production_chado -f data/chado

# Pull only gene data for the feature table.
# Can't use directory format here since we are pulling a subset
# of the feature table out.
psql -d production_chado -f scripts/pull_genes.sql