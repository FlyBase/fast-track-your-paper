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

2. Start docker containers
```bash
cd fast-track-your-paper
docker-compose up -d
```

3. Load data, see [README](./db/README.md) for details.

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
