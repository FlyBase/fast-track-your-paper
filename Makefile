DATA_DIR   := db/data
SUBMISSION_JSON := $(DATA_DIR)/ftyp-submissions.json
DATA_FLAGS_URI := https://svn.flybase.org/documents/curation/curation_data/text_mining_flags/textmining_positive_SVM.txt
DATA_FLAGS_FILE := $(DATA_DIR)/text_mining/data_flags.tsv

# Perl command to read in the value of .env file.
PERL_SPLIT = perl -n -e '($$key, $$val) = split /\s*=\s*/, $$_, 2; print $$val;'

ENV_FILE := .env

SVN_USER := $(shell grep '^SVN_USER' $(ENV_FILE) | $(PERL_SPLIT))
SVN_PASSWORD := $(shell grep '^SVN_PASSWORD' $(ENV_FILE) | $(PERL_SPLIT))

# Export these to scripts executed by this Makefile.
export PGHOST := $(shell grep '^SRC_PGHOST' $(ENV_FILE) | $(PERL_SPLIT))
export PGDATABASE := $(shell grep '^SRC_PGDATABASE' $(ENV_FILE) | $(PERL_SPLIT))
export PGPORT := $(shell grep '^SRC_PGPORT' $(ENV_FILE) | $(PERL_SPLIT))
export PGUSER := $(shell grep '^SRC_PGUSER' $(ENV_FILE) | $(PERL_SPLIT))

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
	cd client; yarn install && \
	yarn run update-header-footer && \
	yarn run build

pull-data:$(DATA_DIR)/chado_feature.tsv $(DATA_DIR)/chado $(DATA_DIR)/feature $(DATA_FLAGS_FILE)

load-data: up
	docker-compose exec -u postgres db /ftyp/scripts/load_chado_data.sh 

$(DATA_DIR)/chado_feature.tsv $(DATA_DIR)/chado $(DATA_DIR)/feature:
	mkdir -p $(DATA_DIR) && cd db && scripts/pull_chado_data.sh


# Passing in authentication via args is not ideal because login information is exposed to local users.
# Newer versions of svn do support passwords via STDIN (--password-from-stdin), but not all clients
# in use currently support the flag..
$(DATA_DIR)/text_mining/textmining_positive_SVM.txt:guard-SVN_USER guard-SVN_PASSWORD
	 mkdir -p $(DATA_DIR)/text_mining && \
	 cd $(DATA_DIR)/text_mining && \
	 svn export --force --username $(SVN_USER) --password $(SVN_PASSWORD) $(DATA_FLAGS_URI)

# Remove comments from file.
# The PostgreSQL COPY command doesn't tolerate comments inside text files.
$(DATA_FLAGS_FILE):$(DATA_DIR)/text_mining/textmining_positive_SVM.txt
	cat $(DATA_DIR)/text_mining/textmining_positive_SVM.txt | perl -pe "s/^#.*\n//" > $(DATA_FLAGS_FILE)

dump-submissions:$(SUBMISSION_JSON)

load-submissions:
	echo "Target not implemented yet."

$(SUBMISSION_JSON):
	docker-compose exec -T -u postgres db psql ftyp -c "select json_agg(row_to_json(row)) from (select * from ftyp_hidden.submissions) as row;" -t  > $(SUBMISSION_JSON)

.PHONY: up down clean load-data start stop pull-images build-client clean-client clean-db

guard-%:
	@ if [ "${${*}}" = "" ]; then \
		echo "Environment variable $* not set"; \
    exit 1; \
  fi
