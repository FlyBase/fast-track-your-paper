DATA_DIR   = db/data

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

build-client:
	cd client; yarn install && yarn run build

pull-data:$(DATA_DIR)/chado_feature.tsv $(DATA_DIR)/chado $(DATA_DIR)/feature

load-data: up
	docker-compose exec -u postgres db /ftyp/scripts/load_chado_data.sh 

$(DATA_DIR)/chado_feature.tsv $(DATA_DIR)/chado $(DATA_DIR)/feature:
	cd db; mkdir -p data && scripts/pull_chado_data.sh

.PHONY: up down clean load-data start stop pull-images
