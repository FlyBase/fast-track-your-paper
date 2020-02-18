DATA_DIR   = db/data
IMAGE_TAG := develop

all: pull-data load-data

up:
	docker-compose up -d --build
	sleep 10

down:
	docker-compose down -v

start:
	docker-compose start

stop:
	docker-compose stop

clean: down
	rm -r db/data/*

pull-data:$(DATA_DIR)/chado_feature.tsv $(DATA_DIR)/chado $(DATA_DIR)/feature

load-data: up
	docker-compose exec -u postgres db /ftyp/scripts/load_chado_data.sh 

$(DATA_DIR)/chado_feature.tsv $(DATA_DIR)/chado $(DATA_DIR)/feature:
	cd db; mkdir -p data && scripts/pull_chado_data.sh

.PHONY: up down clean load-data build-images push-images
