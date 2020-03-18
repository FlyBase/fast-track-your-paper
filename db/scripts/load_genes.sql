COPY feature FROM '/ftyp/data/chado.feature.tsv';

CREATE TABLE ftyp_hidden.gene_location
(
    feature_id   integer NOT NULL,
    has_location boolean DEFAULT FALSE
);

COPY ftyp_hidden.gene_location FROM '/ftyp/data/chado.gene_location.tsv';
