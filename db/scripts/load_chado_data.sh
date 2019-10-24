#!/usr/bin/env bash
# Load rest of the table definitions and data.
pg_restore -x -O -c --disable-triggers --if-exists -d $POSTGRES_DB /ftyp/data/chado -O -F d -j 3

# Load genes data.
pg_restore -x -O -c --disable-triggers --if-exists -d $POSTGRES_DB /ftyp/data/feature -O -F d -j 3

psql -d $POSTGRES_DB -f /ftyp/scripts/load_genes.sql


psql -d $POSTGRES_DB -f /chado/schema/data_classes/utils.sql
psql -d $POSTGRES_DB -f /chado/schema/ids/id_updater.sql
psql -d $POSTGRES_DB -f /chado/schema/symbols/current_synonym.sql
psql -d $POSTGRES_DB -f /chado/schema/FBrf/main.sql

vacuumdb -f -v -z -a

