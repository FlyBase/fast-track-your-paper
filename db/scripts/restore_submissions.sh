#!/usr/bin/env bash

zcat /ftyp/data/submissions/*.sql.gz | psql -d $POSTGRES_DB
cat /ftyp/data/submissions/*.sql | psql -d $POSTGRES_DB
