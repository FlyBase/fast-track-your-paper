COPY feature FROM '/ftyp/data/chado.feature.tsv';

CREATE TABLE ftyp_hidden.gene_location
(
    feature_id   integer NOT NULL,
    has_location boolean DEFAULT FALSE
);

COPY ftyp_hidden.gene_location FROM '/ftyp/data/chado.gene_location.tsv';

CREATE TABLE ftyp_hidden.gene_summary
(
    feature_id   integer NOT NULL,
    has_summary boolean DEFAULT FALSE
);

COPY ftyp_hidden.gene_summary FROM '/ftyp/data/chado.gene_summary.tsv';
