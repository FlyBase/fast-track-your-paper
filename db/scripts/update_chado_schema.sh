#!/usr/bin/env bash
# This script updates the production chado schema file in db/initdb.d/01.production.chado.schema.sql
# Usage:
# $ cd db
# $ PGHOST=localhost PGUSER=josh PGPORT=6543 PGDATABASE=production_chado ./scripts/update_chado_schema.sh
#
# To change Postgres connection defaults please use the following ENV variables.
# PGHOST
# PGPORT
# PGUSER
# PGDATABASE
pg_dump -s -x -O -n public -T audit > initdb.d/01.production.chado.schema.sql