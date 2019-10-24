# FTYP Database Container

## QuickStart

```bash
cd fast-track-your-paper
docker-compose up -d 
cd db
PGHOST=<hostname> PGUSER=<username> PGPORT=<port> PGDATABASE=<dbname> ./scripts/pull_chado_data.sh
cd ..
docker-compose exec -u postgres db /ftyp/scripts/load_chado_data.sh
```

## Docker container

The FTYP database is provided by a docker container running PostgreSQL 10
with the production Chado schema and select data from a production Chado instance.
Upon starting DB container, the database will have an empty Chado instance
with additional flybase specific functions added from the
[FlyBase Chado repo](https://github.com/FlyBase/chado/tree/master/schema).

## Requirements

* A cloned fast-track-your-paper repo
* Docker / Docker compose installed
* A docker container running the `db` service
* A connection (direct or ssh tunnel) to a production chado database

## Data

The following describes how to get data in and out of the FTYP database.

### Loading 

FTYP requires a certain amount of data from a production Chado instance.  Pulling
all of the data is time consuming and overkill so only a slice of Chado is pulled
into the FTYP database for its purposes.  This mainly consists of reference and
gene data.  Pulling data from production Chado consists of the following steps

`Pull data from db (outside of docker) ---> Store locally ---> Load (inside of docker)`

To pull data, start the docker db service and execute the following script **outside of docker**.
Replace all bracketed terms with their appropriate value.

```bash
cd fast-track-your-paper/db
PGHOST=<hostname> PGUSER=<username> PGPORT=<port> PGDATABASE=<dbname> ./scripts/pull_chado_data.sh
```

This will query the production chado database and place the data under the `db/data`
directory.  Once the data has been pulled, you initiate a load into the DB service
container by this command.

```bash
cd fast-track-your-paper
docker-compose up -d --build
docker-compose exec -u postgres db /ftyp/scripts/load_chado_data.sh
```

