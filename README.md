# Fast Track Your Paper (FTYP)

A tool for expediting curation of published research in genetic databases.

## Requirements

* Docker
* Docker compose
* Git
* PostgreSQL client (`pg_dump` and `psql` commands)

## Getting started

1. Clone repo
```bash
git clone https://github.com/FlyBase/fast-track-your-paper.git
cd fast-track-your-paper
```

2. Create credentials file

```bash
touch .env
```

Edit the `.env` to add your SVN and PostgreSQL credentials.  Be sure to replace all values within the 
angle brackets `<>` with values for your environment.

```
SVN_USER=<SVN USERNAME>
SVN_PASSWORD=<SVN PASSWORD>

SRC_PGHOST=<HOSTNAME>
SRC_PGDATABASE=<DATABASE NAME>
SRC_PGPORT=<POSTGRES PORT>
SRC_PGUSER=<POSTGRES USER>

FTYP_PGPASSWORD=<FTYP DATABASE PASSWORD>
```

3. Pull / load data and start docker containers

```bash
make
```

For full details see the db [README](./db/README.md).

## Makefile targets

* all - Default target that pulls data, starts the containers, and loads the data.
* up - Brings up the docker containers
* down - Brings down and removes the disk volumes
* start - Starts the docker containers
* stop - Stops the docker containers
* clean - Stops the containers, removes the disk volumes, and removes all pulled DB data.
* pull-data - Pulls data from the production Chado database.
* load-data - Loads data from the pulled sources and stores it in the docker DB container.
* build-client - Updates the header/footer and builds the compiled javascript client app.
* export-submissions - Exports the unprocessed submissions into a JSON file suitable for curation processing.
* backup-submissions - Produces a SQL data file containing all rows of the submissions table.
* restore-submissions - Restores all rows from the file produced by `backup-submissions`.

### export-submissions

This target creates a file under `db/data/` called `ftyp_json.yymmdd.json` by default where `yymmdd` 
represents the two digit year, month, and day. To override the file you need to pass a variable called
`SUBMISSION_JSON` to this target.

```
make export-submissions SUBMISSION_JSON=db/data/my-submissions.json
make export-submissions SUBMISSION_JSON=ftyp.json
```

After the submissions have been exported, they will be marked as processed so that
subsequent exports will ignore them.

### backup-submissions

Calls the [backup_submissions.sh](./db/scripts/backup_submissions.sh) script to dump all rows
of the submissions table. The output is in the `db/data/submissions/` directory.

### restore-submissions

Calls the [restore_submissions.sh](./db/scripts/restore_submissions.sh) script to restore all
rows of the submissions table from the file produced by `backup-submissions`. This target loads 
any `.sql` or `.sql.gz` file in the `db/data/submissions/` directory into the database.

## Docker containers

The FTYP tool is broken up into individual docker containers.  These containers include:

1. api - A GraphQL interface (Postgraphile) for the Postgres database.
2. client - The React UI code.
3. db - The Postgres database.
4. proxy - An nginx proxy server to put the API and client UI behind a single host/port interface.

|Container|Internal Port|Public port|
|---------|------|------------------| 
| api     | 5000 | |
| client  | 5000 | |
| db      | 5432 | |
| proxy   | 80   | 8888 |
