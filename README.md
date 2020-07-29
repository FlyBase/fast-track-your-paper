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
```

2. Pull / load data and start docker containers

Replace all values in between angle brackets ('<>') with their appropriate values for your situation.
The values should not contain the angle brackets.

```bash
cd fast-track-your-paper
make PGHOST=<HOSTNAME> PGDATABASE=<DBNAME> PGPORT=<PORT> PGUSER=<USER>
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
