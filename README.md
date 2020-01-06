# Fast Track Your Paper (FTYP)

A tool for expediting curation of published research in genetic databases.

## Requirements

* Docker
* Docker compose
* Git

## Getting started

1. Clone repo
```bash
git clone https://github.com/FlyBase/fast-track-your-paper.git
```

2. Pull data and start docker containers

Replace all values in between '<>' with their appropriate values for your situation.

```bash
cd fast-track-your-paper
make PGHOST=<HOSTNAME> PGDATABASE=<DBNAME> PGPORT=<PORT> PGUSER=<USER>
```

For full details see the db [README](./db/README.md).

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
