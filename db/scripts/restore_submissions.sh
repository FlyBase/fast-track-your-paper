#!/usr/bin/env bash
for file in "/ftyp/data/submissions"/*.sql.gz
do
  if [ -f $file ]; then
    zcat "$file" | psql -d $POSTGRES_DB
  fi
done
for file in "/ftyp/data/submissions"/*.sql
do
  if [ -f $file ]; then
    psql -d $POSTGRES_DB < "$file"
  fi
done

psql -d $POSTGRES_DB -c "select setval('ftyp_hidden.submissions_submission_id', (select max(submission_id) from ftyp_hidden.submissions));"