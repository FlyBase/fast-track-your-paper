#!/bin/bash
# Pull schema and data for these tables.
pg_dump -x -O -n public \
        -t cvterm \
        -t db \
        -t dbxref \
        -t synonym \
        -t feature_synonym \
        -t pub \
        -t pubprop \
        -t pub_dbxref \
        -t organism \
        -F d -j 3 -d production_chado -f data/chado

# Pull only schema for the feature table.
pg_dump -s -x -O -n public \
        -t feature \
        -F d -j 3 -d production_chado -f data/feature_table

# Pull only gene data for the feature table.
psql -d production_chado -f scripts/pull_genes.sql