#!/bin/bash

# Load feature table definition.
pg_restore -c --if-exists -d $POSTGRES_DB /ftyp/data/feature_table -O -F d -j 3 -U postgres

# Load genes data.
psql -d $POSTGRES_DB -f /ftyp/scripts/load_genes.sql -U postgres

# Load rest of the table definitions and data.
pg_restore -c --if-exists -d $POSTGRES_DB /ftyp/data/chado -O -F d -j 3 -U postgres

