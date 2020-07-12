DATA_DIR   = db/data
SUBMISSION_JSON = $(DATA_DIR)/ftyp-submissions.json

all: pull-data load-data build-client

up: pull-images
	docker-compose up -d --build
	sleep 10

down:
	docker-compose down -v

start:
	docker-compose start

stop:
	docker-compose stop

pull-images:
	docker-compose pull

clean: down clean-db clean-client

clean-db:
	rm -rf db/data/*

clean-client:
	rm -rf client/build/*
	rm -rf client/node_modules/

build-client:
	cd client; yarn install && yarn run build

pull-data:$(DATA_DIR)/chado_feature.tsv $(DATA_DIR)/chado $(DATA_DIR)/feature

load-data: up
	docker-compose exec -u postgres db /ftyp/scripts/load_chado_data.sh 

$(DATA_DIR)/chado_feature.tsv $(DATA_DIR)/chado $(DATA_DIR)/feature:
	cd db; mkdir -p data && scripts/pull_chado_data.sh

dump-submissions:$(SUBMISSION_JSON)

$(SUBMISSION_JSON):
	docker-compose exec -T -u postgres db psql ftyp -c "select json_agg(row_to_json(row)) from (select * from ftyp_hidden.submissions) as row;" -t  > $(SUBMISSION_JSON)



.PHONY: up down clean load-data start stop pull-images
